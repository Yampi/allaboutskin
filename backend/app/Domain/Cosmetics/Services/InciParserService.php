<?php

namespace App\Domain\Cosmetics\Services;

use App\Models\Ingredient;
use App\Models\IngredientAlias;
use Illuminate\Support\Collection;

class InciParserService
{
    /**
     * Parse raw INCI string (from text input or OCR) into clean tokens and match with ingredients in database.
     *
     * @param string $rawInci
     * @return array{
     *     raw_tokens: array<string>,
     *     matched_ingredients: Collection<int, array{ingredient: Ingredient, raw_token: string, confidence: float, position: int}>,
     *     unmatched_tokens: array<string>
     * }
     */
    public function parseAndMatch(string $rawInci): array
    {
        $tokens = $this->tokenize($rawInci);
        $matched = collect();
        $unmatched = [];

        // Preload all ingredients and aliases to minimize queries during fuzzy matching
        $allIngredients = Ingredient::with(['indications', 'pubmedStudies', 'conflictsAsA', 'conflictsAsB'])->get();
        $allAliases = IngredientAlias::all()->groupBy('ingredient_id');

        $position = 1;
        foreach ($tokens as $token) {
            $normalizedToken = $this->normalizeToken($token);

            if (empty($normalizedToken)) {
                continue;
            }

            $matchResult = $this->findBestMatch($normalizedToken, $allIngredients, $allAliases);

            if ($matchResult['ingredient']) {
                $matched->push([
                    'ingredient' => $matchResult['ingredient'],
                    'raw_token' => $token,
                    'confidence' => $matchResult['confidence'],
                    'position' => $position,
                ]);
            } else {
                $unmatched[] = $token;
            }

            $position++;
        }

        return [
            'raw_tokens' => $tokens,
            'matched_ingredients' => $matched,
            'unmatched_tokens' => $unmatched,
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
        // 1. Remove introductory prefixes common in cosmetic packaging
        $text = preg_replace('/^(ingredients|inci|composition|ingredientes|ingr[eé]dients|contains|ingredients\s*[:\-])\s*/i', '', trim($text));

        // 2. Remove trailing packaging notes (e.g. "Made in France", "Formula #12345", "Batch 99A")
        $text = preg_replace('/\s*(batch\s*no|made\s*in|distr?\b|c\.?o\.?a\b|\d{5,}).*$/i', '', $text);

        // 3. Normalize multiple delimiters (commas, semicolons, bullets, linebreaks)
        $text = str_replace(["\r\n", "\r", "\n", "•", "·", " - ", " / "], ',', $text);

        // 4. Split by commas while respecting parenthetical details like "Water (Aqua/Eau)"
        $rawTokens = preg_split('/,(?![^\(\[]*[\)\]])/', $text);

        $cleanTokens = [];
        foreach ($rawTokens as $raw) {
            $token = trim($raw);
            // Remove leading/trailing dots or dashes
            $token = trim($token, " .\t\n\r\0\x0B-•*");

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

        // Remove percentages (e.g. "10%", "0.5 %")
        $cleaned = preg_replace('/\b\d+(\.\d+)?\s*%\b/', '', $cleaned);

        // Remove asterisks, brackets, quotes
        $cleaned = preg_replace('/[*\[\]"\'\(\)]/', ' ', $cleaned);

        // Condense whitespaces
        return trim(preg_replace('/\s+/', ' ', $cleaned));
    }

    /**
     * Finds the closest ingredient using exact and Levenshtein fuzzy matching.
     *
     * @param string $token
     * @param Collection<int, Ingredient> $allIngredients
     * @param Collection<int, Collection<int, IngredientAlias>> $allAliases
     * @return array{ingredient: ?Ingredient, confidence: float}
     */
    private function findBestMatch(string $token, Collection $allIngredients, Collection $allAliases): array
    {
        // 1. Exact INCI Match
        $exact = $allIngredients->first(function (Ingredient $ing) use ($token) {
            return strtoupper($ing->inci_name) === $token
                || strtoupper($ing->common_name) === $token;
        });

        if ($exact) {
            return ['ingredient' => $exact, 'confidence' => 1.0];
        }

        // 2. Alias Match
        foreach ($allIngredients as $ingredient) {
            $aliases = $allAliases->get($ingredient->id, collect());
            foreach ($aliases as $alias) {
                if (strtoupper($alias->alias) === $token) {
                    return ['ingredient' => $ingredient, 'confidence' => 0.98];
                }
            }
        }

        // 3. Substring / Containment Match
        foreach ($allIngredients as $ingredient) {
            $inci = strtoupper($ingredient->inci_name);
            if (str_contains($token, $inci) || str_contains($inci, $token)) {
                $sim = 1.0 - (abs(strlen($token) - strlen($inci)) / (float) max(strlen($token), strlen($inci)));
                if ($sim >= 0.70) {
                    return ['ingredient' => $ingredient, 'confidence' => round($sim, 2)];
                }
            }
        }

        // 4. Fuzzy Levenshtein Distance for OCR typo tolerance
        $bestMatch = null;
        $highestConfidence = 0.0;

        foreach ($allIngredients as $ingredient) {
            $inci = strtoupper($ingredient->inci_name);
            $lev = levenshtein($token, $inci);
            $maxLen = max(strlen($token), strlen($inci));

            if ($maxLen === 0) {
                continue;
            }

            $similarity = 1.0 - ($lev / (float) $maxLen);

            if ($similarity > $highestConfidence && $similarity >= 0.78) {
                $highestConfidence = $similarity;
                $bestMatch = $ingredient;
            }
        }

        return [
            'ingredient' => $bestMatch,
            'confidence' => round($highestConfidence, 2),
        ];
    }
}
