<?php

namespace App\Domain\Cosmetics\Services;

use App\Models\Product;
use Illuminate\Support\Str;

/**
 * Busca en el catálogo el producto que la IA leyó en el frente de un envase (marca y nombre).
 * Puntúa cada producto por cuántas palabras de la búsqueda aparecen en su nombre o su marca.
 */
class ProductMatchService
{
    private const MAX_KEYWORDS = 8;
    private const CANDIDATE_LIMIT = 20;
    // Proporción mínima de palabras que deben coincidir (con 1 o 2 palabras deben coincidir todas)
    private const MIN_RATIO = 0.5;

    private const STOPWORDS = [
        'con', 'del', 'las', 'los', 'para', 'por', 'una', 'uno', 'and', 'for', 'the', 'with',
    ];

    /**
     * @return array<int, array{slug: string, name: string, brand: ?string, image_url: ?string, has_formula: bool, brand_matched: bool, score: float}>
     */
    public function match(?string $brand, string $name, int $limit = 5): array
    {
        $keywords = $this->keywords(trim(($brand ?? '') . ' ' . $name));
        if ($keywords === []) {
            return [];
        }

        $scoreSql = implode(' + ', array_fill(
            0,
            count($keywords),
            '(CASE WHEN products.name ILIKE ? OR brands.name ILIKE ? THEN 1 ELSE 0 END)'
        ));
        $bindings = [];
        foreach ($keywords as $word) {
            $bindings[] = "%{$word}%";
            $bindings[] = "%{$word}%";
        }

        $candidates = Product::query()
            ->leftJoin('brands', 'brands.id', '=', 'products.brand_id')
            ->select('products.name', 'products.slug', 'products.image_url', 'brands.name as brand_name')
            ->selectRaw("({$scoreSql}) as match_score", $bindings)
            ->selectRaw('(SELECT COUNT(*) FROM product_ingredients pi WHERE pi.product_id = products.id) as ingredients_count')
            ->whereRaw("({$scoreSql}) > 0", $bindings)
            ->orderByDesc('match_score')
            ->orderByDesc('ingredients_count')
            ->limit(self::CANDIDATE_LIMIT)
            ->get();

        $brandKeywords = $this->keywords($brand ?? '');
        $minMatched = count($keywords) <= 2 ? count($keywords) : (int) ceil(count($keywords) * self::MIN_RATIO);

        return $candidates
            ->map(function ($row) use ($keywords, $brandKeywords) {
                $brandName = Str::lower((string) $row->brand_name);
                $brandMatched = $brandKeywords !== []
                    && collect($brandKeywords)->every(fn ($w) => str_contains($brandName, $w));

                return [
                    'slug' => $row->slug,
                    'name' => $row->name,
                    'brand' => $row->brand_name,
                    'image_url' => $row->image_url,
                    'has_formula' => (int) $row->ingredients_count > 0,
                    'brand_matched' => $brandMatched,
                    'matched' => (int) $row->match_score,
                    'score' => round((int) $row->match_score / count($keywords), 2),
                ];
            })
            ->filter(fn ($c) => $c['matched'] >= $minMatched)
            ->map(fn ($c) => collect($c)->except('matched')->all())
            ->sortByDesc(fn ($c) => [$c['brand_matched'], $c['score'], $c['has_formula']])
            ->take($limit)
            ->values()
            ->all();
    }

    /**
     * Palabras significativas en minúsculas (3+ caracteres, sin palabras vacías ni repetidas).
     *
     * @return string[]
     */
    private function keywords(string $text): array
    {
        $words = preg_split('/[^\p{L}\p{N}]+/u', Str::lower($text), -1, PREG_SPLIT_NO_EMPTY) ?: [];

        return array_slice(array_values(array_unique(array_filter(
            $words,
            fn ($w) => mb_strlen($w) >= 3 && ! in_array($w, self::STOPWORDS, true)
        ))), 0, self::MAX_KEYWORDS);
    }
}
