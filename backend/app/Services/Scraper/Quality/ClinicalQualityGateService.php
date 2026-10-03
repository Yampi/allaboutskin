<?php

namespace App\Services\Scraper\Quality;

use App\Models\Ingredient;
use App\Services\Scraper\DTOs\ScrapedProductOfferDTO;

class QualityGateResult
{
    /**
     * @param bool $isValid
     * @param int $confidenceScore
     * @param array<string> $reasons
     * @param string|null $detectedCategory
     */
    public function __construct(
        public readonly bool $isValid,
        public readonly int $confidenceScore,
        public readonly array $reasons = [],
        public readonly ?string $detectedCategory = null
    ) {}

    public function isAccepted(): bool
    {
        return $this->isValid && $this->confidenceScore >= 60;
    }
}

class ClinicalQualityGateService
{
    /**
     * Palabras no cosméticas (suplementos orales, medicamentos no tópicos, mascotas, alimentos o ferretería)
     */
    protected array $blacklistedKeywords = [
        'capsula', 'capsulas', 'cápsula', 'cápsulas',
        'pastilla', 'pastillas',
        'suplemento', 'suplementos',
        'tableta', 'tabletas',
        'comprimido', 'comprimidos',
        'jarabe', 'ampolla bebible', 'bebible',
        'inyeccion', 'inyectable',
        'mascota', 'mascotas', 'perro', 'gato', 'canino',
        'alimento', 'comestible', 'infusion', 'té ', 'te ',
        'gomitas', 'gummies',
        'batido', 'proteina en polvo',
        'lámina de zinc', 'lamina de zinc', 'tornillo', 'techado',
    ];

    /**
     * Palabras positivas de skincare que aumentan la confianza
     */
    protected array $skincareKeywords = [
        'serum', 'suero', 'crema', 'gel', 'limpiador', 'cleanser', 'espuma',
        'locion', 'loción', 'tonico', 'tónico', 'toner', 'protector', 'fps', 'spf',
        'solar', 'sunscreen', 'exfoliante', 'peeling', 'contorno', 'ojos', 'eye',
        'hidratante', 'humectante', 'mascarilla', 'ampoule', 'bálsamo', 'balm',
        'dermatologico', 'dermatológico', 'facial', 'antiedad', 'antiarrugas',
        'despigmentante', 'acne', 'acné', 'poros', 'retinol', 'niacinamida',
        'acido', 'ácido', 'hialuronico', 'hialurónico', 'salicilico', 'salicílico',
        'ceramidas', 'vitamina c', 'centella asiatica', 'bha', 'aha'
    ];

    /**
     * Evalúa una oferta extraída frente al estándar de calidad clínica de Allabout.skin.
     */
    public function evaluate(ScrapedProductOfferDTO $dto, ?Ingredient $expectedIngredient = null): QualityGateResult
    {
        $reasons = [];
        $score = 50; // Base neutra

        $title = mb_strtolower(trim($dto->productName));

        // 1. Longitud básica y contenido del título
        if (mb_strlen($title) < 4) {
            return new QualityGateResult(false, 0, ['Título del producto excesivamente corto o vacío.']);
        }

        // 2. Filtro estricto de palabras prohibidas (no cosméticos / suplementos)
        foreach ($this->blacklistedKeywords as $badWord) {
            if (str_contains($title, $badWord)) {
                return new QualityGateResult(
                    false,
                    0,
                    ["Rechazado por filtro antibasura: contiene término no tópico/no cosmético '{$badWord}'."]
                );
            }
        }

        // 3. Validación de precios reales coherentes en el mercado
        if ($dto->price <= 0.20) {
            return new QualityGateResult(
                false,
                0,
                ["Precio inválido o nulo (\${$dto->price} USD). Descartado por precaución."]
            );
        }

        if ($dto->price > 600.00) {
            return new QualityGateResult(
                false,
                10,
                ["Precio anómalo superior a \$600.00 USD (\${$dto->price} USD). Requiere verificación manual."]
            );
        }

        // Rango comercial típico saludable ($1 a $120)
        if ($dto->price >= 2.00 && $dto->price <= 150.00) {
            $score += 15;
        }

        // 4. Verificación de terminología de cuidado facial / cosmética
        $hasSkincareTerm = false;
        foreach ($this->skincareKeywords as $kw) {
            if (str_contains($title, $kw)) {
                $hasSkincareTerm = true;
                $score += 15;
                break;
            }
        }

        if (!$hasSkincareTerm) {
            $score -= 20;
            $reasons[] = 'No se detectaron términos explícitos de cosmética/dermatología tópica en el título.';
        }

        // 5. Coherencia con el ingrediente activo esperado (si la búsqueda provino de un ingrediente)
        if ($expectedIngredient) {
            $matchedIngredient = $this->matchesIngredient($title, $expectedIngredient);
            if ($matchedIngredient) {
                $score += 25;
            } else {
                // Si la búsqueda era específica por un componente y el título no lo menciona en absoluto
                $score -= 30;
                $reasons[] = "El producto no menciona variaciones o alias de '{$expectedIngredient->inci_name}' en su título comercial.";
            }
        }

        // 6. Deducción de categoría dermatológica
        $category = $this->determineCategory($title);

        $finalScore = max(0, min(100, $score));
        $isValid = $finalScore >= 60;

        return new QualityGateResult($isValid, $finalScore, $reasons, $category);
    }

    /**
     * Comprueba si el título contiene el nombre INCI, común o alias del ingrediente.
     */
    protected function matchesIngredient(string $titleLower, Ingredient $ingredient): bool
    {
        $tokens = [];

        if (!empty($ingredient->inci_name)) {
            $tokens[] = mb_strtolower($ingredient->inci_name);
            // Raíz lingüística básica: "Ceramide NP" -> "ceramide", "ceramida"
            $root = explode(' ', mb_strtolower($ingredient->inci_name))[0];
            if (mb_strlen($root) >= 4) {
                $tokens[] = $root;
            }
        }

        if (!empty($ingredient->common_name)) {
            $cleanCommon = mb_strtolower(trim(explode('(', $ingredient->common_name)[0]));
            if (mb_strlen($cleanCommon) >= 3) {
                $tokens[] = $cleanCommon;
            }
        }

        // Aliases
        foreach ($ingredient->aliases as $alias) {
            $tokens[] = mb_strtolower($alias->alias);
        }

        // Diccionario léxico de concordancia cosmética en español
        $dictionary = [
            'niacinamide' => ['niacinamida', 'vitamina b3'],
            'salicylic acid' => ['acido salicilico', 'ácido salicílico', 'bha'],
            'glycolic acid' => ['acido glicolico', 'ácido glicólico', 'aha'],
            'ascorbic acid' => ['vitamina c', 'acido ascorbico', 'ácido ascórbico'],
            'ceramide np' => ['ceramida', 'ceramidas', 'ceramide'],
            'sodium hyaluronate' => ['acido hialuronico', 'ácido hialurónico', 'hialuronato'],
            'retinol' => ['retinol', 'retinoide', 'vitamina a'],
            'zinc pca' => ['zinc', 'zinc pca'],
            'centella asiatica extract' => ['centella asiatica', 'cica', 'madecassoside'],
        ];

        $inciKey = mb_strtolower($ingredient->inci_name ?? '');
        if (isset($dictionary[$inciKey])) {
            $tokens = array_merge($tokens, $dictionary[$inciKey]);
        }

        foreach (array_unique($tokens) as $token) {
            if (!empty($token) && str_contains($titleLower, $token)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Clasifica el producto en una de las categorías core de Allabout.skin.
     */
    public function determineCategory(string $titleLower): string
    {
        if (str_contains($titleLower, 'limpiador') || str_contains($titleLower, 'cleanser') || str_contains($titleLower, 'gel limpiador') || str_contains($titleLower, 'espuma')) {
            return 'CLEANSER';
        }
        if (str_contains($titleLower, 'fps') || str_contains($titleLower, 'spf') || str_contains($titleLower, 'solar') || str_contains($titleLower, 'sunscreen') || str_contains($titleLower, 'sun')) {
            return 'SUNSCREEN';
        }
        if (str_contains($titleLower, 'serum') || str_contains($titleLower, 'suero') || str_contains($titleLower, 'gotero') || str_contains($titleLower, 'ampoule')) {
            return 'SERUM';
        }
        if (str_contains($titleLower, 'exfoliante') || str_contains($titleLower, 'peeling') || str_contains($titleLower, 'bha') || str_contains($titleLower, 'aha') || str_contains($titleLower, 'scrub')) {
            return 'EXFOLIANT';
        }
        if (str_contains($titleLower, 'contorno') || str_contains($titleLower, 'ojos') || str_contains($titleLower, 'eye cream')) {
            return 'EYE_CARE';
        }
        if (str_contains($titleLower, 'tonico') || str_contains($titleLower, 'tónico') || str_contains($titleLower, 'toner') || str_contains($titleLower, 'astringente')) {
            return 'TONER';
        }
        if (str_contains($titleLower, 'crema') || str_contains($titleLower, 'hidratante') || str_contains($titleLower, 'moisturizer') || str_contains($titleLower, 'gel')) {
            return 'MOISTURIZER';
        }

        return 'SKINCARE';
    }
}
