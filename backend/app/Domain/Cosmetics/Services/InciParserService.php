<?php

namespace App\Domain\Cosmetics\Services;

use App\Models\Ingredient;
use App\Models\IngredientAlias;
use Illuminate\Support\Collection;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class InciParserService
{
    /**
     * Parse raw INCI string (from text input or OCR) into clean tokens and match with ingredients in database.
     *
     * @param string $rawInci
     * @return array{
     *     raw_tokens: array<string>,
     *     matched_ingredients: Collection<int, array{ingredient: Ingredient, raw_token: string, confidence: float, position: int}>,
     *     unmatched_tokens: array<string>,
     *     unmatched_suggestions: array<int, array{raw_token: string, suggested_inci_name: string, confidence: float}>
     * }
     */
    public function parseAndMatch(string $rawInci): array
    {
        $tokens = $this->tokenize($rawInci);
        if (empty($tokens)) {
            return [
                'raw_tokens' => [],
                'matched_ingredients' => collect(),
                'unmatched_tokens' => [],
                'unmatched_suggestions' => [],
            ];
        }

        // Build token items maintaining position
        $tokenItems = [];
        $position = 1;
        foreach ($tokens as $token) {
            $normalizedToken = $this->normalizeToken($token);
            if (empty($normalizedToken)) {
                continue;
            }

            $tokenItems[] = [
                'raw_token' => $token,
                'normalized' => $normalizedToken,
                'position' => $position,
            ];
            $position++;
        }

        if (empty($tokenItems)) {
            return [
                'raw_tokens' => $tokens,
                'matched_ingredients' => collect(),
                'unmatched_tokens' => [],
                'unmatched_suggestions' => [],
            ];
        }

        $uniqueNormalized = array_values(array_unique(array_column($tokenItems, 'normalized')));

        // Step 1: Batch Exact SQL Lookup on ingredients table (WHERE IN on UPPER(inci_name) / UPPER(common_name))
        $exactIngredients = Ingredient::select(['id', 'inci_name', 'common_name'])
            ->where(function ($query) use ($uniqueNormalized) {
                $query->whereIn(DB::raw('UPPER(inci_name)'), $uniqueNormalized)
                      ->orWhereIn(DB::raw('UPPER(common_name)'), $uniqueNormalized);
            })
            ->get();

        $exactMap = [];
        foreach ($exactIngredients as $ing) {
            $inciUpper = strtoupper($ing->inci_name);
            if (!isset($exactMap[$inciUpper])) {
                $exactMap[$inciUpper] = ['id' => $ing->id, 'confidence' => 1.0];
            }
            if ($ing->common_name) {
                $commonUpper = strtoupper($ing->common_name);
                if (!isset($exactMap[$commonUpper])) {
                    $exactMap[$commonUpper] = ['id' => $ing->id, 'confidence' => 1.0];
                }
            }
        }

        // Identify tokens still unmatched after Step 1
        $unmatchedAfterStep1 = [];
        $tokenMatchMap = []; // normalized => ['id' => int, 'confidence' => float]

        foreach ($uniqueNormalized as $norm) {
            if (isset($exactMap[$norm])) {
                $tokenMatchMap[$norm] = $exactMap[$norm];
            } else {
                $unmatchedAfterStep1[] = $norm;
            }
        }

        // Step 2: Batch Alias SQL Lookup for remaining tokens (WHERE IN on UPPER(alias))
        $aliasMap = [];
        if (!empty($unmatchedAfterStep1)) {
            $aliases = IngredientAlias::select(['ingredient_id', 'alias'])
                ->whereIn(DB::raw('UPPER(alias)'), $unmatchedAfterStep1)
                ->get();

            foreach ($aliases as $alias) {
                $aliasUpper = strtoupper($alias->alias);
                if (!isset($aliasMap[$aliasUpper])) {
                    $aliasMap[$aliasUpper] = ['id' => $alias->ingredient_id, 'confidence' => 0.98];
                }
            }
        }

        $unmatchedAfterStep2 = [];
        foreach ($unmatchedAfterStep1 as $norm) {
            if (isset($aliasMap[$norm])) {
                $tokenMatchMap[$norm] = $aliasMap[$norm];
            } else {
                $unmatchedAfterStep2[] = $norm;
            }
        }

        // Step 3: Bounded candidate search (< 30 rows). Solo se acepta una variante de escritura idéntica
        // (mayúsculas, acentos, signos); cualquier otro parecido es una sugerencia, nunca una coincidencia,
        // porque moléculas distintas (RETINOL / RETINAL) difieren en una letra.
        $suggestionMap = []; // normalized => ['id' => int, 'confidence' => float]
        foreach ($unmatchedAfterStep2 as $norm) {
            $candidate = $this->findBoundedCandidate($norm);
            if ($candidate === null) {
                continue;
            }
            if ($candidate['same_spelling']) {
                $tokenMatchMap[$norm] = ['id' => $candidate['id'], 'confidence' => 0.95];
            } else {
                $suggestionMap[$norm] = ['id' => $candidate['id'], 'confidence' => $candidate['confidence']];
            }
        }

        // Step 4: Deferred Relational Hydration ONLY for matched ingredient IDs
        $matchedIngredientIds = array_values(array_unique(array_filter(array_map(fn($m) => $m['id'], $tokenMatchMap))));
        $suggestionNames = empty($suggestionMap)
            ? collect()
            : Ingredient::whereIn('id', array_unique(array_column($suggestionMap, 'id')))->pluck('inci_name', 'id');

        $hydratedIngredients = collect();
        if (!empty($matchedIngredientIds)) {
            $hydratedIngredients = Ingredient::with(['indications', 'pubmedStudies', 'conflictsAsA', 'conflictsAsB'])
                ->whereIn('id', $matchedIngredientIds)
                ->get()
                ->keyBy('id');
        }

        // Assemble final matched and unmatched collections preserving token order
        $matched = collect();
        $unmatched = [];
        $suggestions = [];

        foreach ($tokenItems as $item) {
            $norm = $item['normalized'];
            if (isset($tokenMatchMap[$norm])) {
                $ingredientId = $tokenMatchMap[$norm]['id'];
                $ingredientModel = $hydratedIngredients->get($ingredientId);

                if ($ingredientModel) {
                    $matched->push([
                        'ingredient' => $ingredientModel,
                        'raw_token' => $item['raw_token'],
                        'confidence' => $tokenMatchMap[$norm]['confidence'],
                        'position' => $item['position'],
                    ]);
                    continue;
                }
            }

            $unmatched[] = $item['raw_token'];

            if (isset($suggestionMap[$norm]) && $suggestionNames->has($suggestionMap[$norm]['id'])) {
                $suggestions[] = [
                    'raw_token' => $item['raw_token'],
                    'suggested_inci_name' => $suggestionNames->get($suggestionMap[$norm]['id']),
                    'confidence' => $suggestionMap[$norm]['confidence'],
                ];
            }
        }

        return [
            'raw_tokens' => $tokens,
            'matched_ingredients' => $matched,
            'unmatched_tokens' => $unmatched,
            'unmatched_suggestions' => $suggestions,
        ];
    }

    /**
     * Splits and sanitizes the raw INCI text into individual ingredient tokens.
     *
     * @param string $text
     * @return array<string>
     */
    public function tokenize(string $text): array
    {
        // 1. Remove introductory prefixes common in cosmetic packaging and formats
        $text = preg_replace('/^(formula|f[oó]rmula|ingredients|inci|composition|ingredientes|ingr[eé]dients|contains|contiene|serum\s*facial|s[eé]rum|crema\s*facial|crema|gel\s*facial|gel|t[oó]nico|loci[oó]n|fluido|ampolla|booster)\s*[:\-]?\s*/i', '', trim($text));

        // 2. Remove trailing packaging notes (e.g. "Made in France", "Formula #12345", "Batch 99A")
        $text = preg_replace('/\s*(batch\s*no|made\s*in|distr?\b|c\.?o\.?a\b|\d{5,}).*$/i', '', $text);

        // 3. Normalize multiple delimiters (commas, semicolons, bullets, linebreaks, +, &, ' y ')
        $text = str_replace(["\r\n", "\r", "\n", "•", "·", " - ", " / ", " + ", "+", " & ", "&"], ',', $text);
        $text = preg_replace('/\s+y\s+/i', ',', $text);
        $text = preg_replace('/\s+with\s+|\s+con\s+/i', ',', $text);

        // 4. Split by commas while respecting parenthetical details like "Water (Aqua/Eau)"
        $rawTokens = preg_split('/,(?![^\(\[]*[\)\]])/', $text);

        $cleanTokens = [];
        foreach ($rawTokens as $raw) {
            $token = trim($raw);
            // Remove leading/trailing dots, dashes or bullets
            $token = trim($token, " .\t\n\r\0\x0B-•*+&");
            // Remove token-level cosmetic format prefixes if attached (e.g. "Serum Facial Niacinamida" -> "Niacinamida")
            $token = preg_replace('/^(serum\s*facial|s[eé]rum|crema\s*facial|crema|gel\s*facial|gel|t[oó]nico|loci[oó]n|fluido|ampolla|booster)\s+/i', '', $token);

            if (strlen($token) >= 2) {
                $cleanTokens[] = $token;
            }
        }

        return $cleanTokens;
    }

    /**
     * Normalizes a token for matching (removes percentages, extra punctuation, case-insensitive).
     */
    public function normalizeToken(string $token): string
    {
        // Extract content inside parenthesis if it contains known INCI names (e.g. "Aqua / Water / Eau" -> "AQUA")
        $cleaned = strtoupper($token);

        // Remove percentages (e.g. "10%", "0.5 %", "(10%)")
        $cleaned = preg_replace('/\b\d+(\.\d+)?\s*%/i', '', $cleaned);

        // Remove asterisks, brackets, quotes
        $cleaned = preg_replace('/[*\[\]"\'\(\)]/', ' ', $cleaned);

        // Condense whitespaces
        return trim(preg_replace('/\s+/', ' ', $cleaned));
    }

    /**
     * Bounded candidate search on a small slice of records (< 30 rows).
     * `same_spelling` es true solo si el nombre coincide quitando mayúsculas, acentos y signos.
     *
     * @param string $token Normalized uppercase token
     * @return array{id: int, confidence: float, same_spelling: bool}|null
     */
    private function findBoundedCandidate(string $token): ?array
    {
        $len = mb_strlen($token);
        if ($len < 2) {
            return null;
        }

        $prefix = mb_substr($token, 0, min(3, $len));

        // Query candidates bounded by length (+/- 3 chars) and prefix, capped at 30 rows
        $candidates = Ingredient::select(['id', 'inci_name', 'common_name'])
            ->where(function ($q) use ($len, $prefix) {
                $q->where(function ($sub) use ($len, $prefix) {
                    $sub->whereBetween(DB::raw('LENGTH(inci_name)'), [max(1, $len - 3), $len + 3])
                        ->where('inci_name', 'ILIKE', "{$prefix}%");
                })->orWhere(function ($sub) use ($len, $prefix) {
                    $sub->whereBetween(DB::raw('LENGTH(common_name)'), [max(1, $len - 3), $len + 3])
                        ->where('common_name', 'ILIKE', "{$prefix}%");
                });
            })
            ->limit(30)
            ->get();

        // If prefix query yielded no candidates and length >= 4, broaden to length-bounded candidates
        if ($candidates->isEmpty() && $len >= 4) {
            $candidates = Ingredient::select(['id', 'inci_name', 'common_name'])
                ->whereBetween(DB::raw('LENGTH(inci_name)'), [max(1, $len - 2), $len + 2])
                ->limit(30)
                ->get();
        }

        if ($candidates->isEmpty()) {
            return null;
        }

        $bestMatchId = null;
        $highestConfidence = 0.0;
        $tokenCanon = $this->canonicalSpelling($token);

        foreach ($candidates as $cand) {
            $inci = strtoupper($cand->inci_name);
            $common = $cand->common_name ? strtoupper($cand->common_name) : null;

            if ($tokenCanon !== '' && ($tokenCanon === $this->canonicalSpelling($inci)
                || ($common && $tokenCanon === $this->canonicalSpelling($common)))) {
                return ['id' => $cand->id, 'confidence' => 1.0, 'same_spelling' => true];
            }

            // 1. Substring containment check
            if (str_contains($token, $inci) || str_contains($inci, $token)) {
                $maxLen = max(strlen($token), strlen($inci));
                $sim = 1.0 - (abs(strlen($token) - strlen($inci)) / (float) $maxLen);
                if ($sim >= 0.70 && $sim > $highestConfidence) {
                    $highestConfidence = $sim;
                    $bestMatchId = $cand->id;
                }
            }

            if ($common && (str_contains($token, $common) || str_contains($common, $token))) {
                $maxLen = max(strlen($token), strlen($common));
                $sim = 1.0 - (abs(strlen($token) - strlen($common)) / (float) $maxLen);
                if ($sim >= 0.70 && $sim > $highestConfidence) {
                    $highestConfidence = $sim;
                    $bestMatchId = $cand->id;
                }
            }

            // 2. Levenshtein fuzzy distance check
            $maxLenInci = max(strlen($token), strlen($inci));
            if ($maxLenInci > 0) {
                $lev = levenshtein($token, $inci);
                $sim = 1.0 - ($lev / (float) $maxLenInci);
                if ($sim >= 0.78 && $sim > $highestConfidence) {
                    $highestConfidence = $sim;
                    $bestMatchId = $cand->id;
                }
            }

            if ($common) {
                $maxLenCommon = max(strlen($token), strlen($common));
                if ($maxLenCommon > 0) {
                    $lev = levenshtein($token, $common);
                    $sim = 1.0 - ($lev / (float) $maxLenCommon);
                    if ($sim >= 0.78 && $sim > $highestConfidence) {
                        $highestConfidence = $sim;
                        $bestMatchId = $cand->id;
                    }
                }
            }
        }

        if ($bestMatchId !== null && $highestConfidence >= 0.70) {
            return [
                'id' => $bestMatchId,
                'confidence' => round($highestConfidence, 2),
                'same_spelling' => false,
            ];
        }

        return null;
    }

    /** Solo letras y dígitos en mayúsculas, sin acentos: "Ácido  Salicílico." => "ACIDOSALICILICO". */
    private function canonicalSpelling(string $value): string
    {
        return preg_replace('/[^A-Z0-9]/', '', strtoupper(Str::ascii($value)));
    }
}
