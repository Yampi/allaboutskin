<?php

namespace App\Domain\UserProfile\Services;

use App\Models\Ingredient;
use App\Models\Product;
use App\Models\UserSkinProfile;
use Illuminate\Support\Collection;

class SkinCompatibilityService
{
    /**
     * Calculate skin compatibility score (0-100%) and warnings for a given user profile and ingredients.
     *
     * @param UserSkinProfile $profile
     * @param Collection<int, Ingredient> $ingredients
     * @return array<string, mixed>
     */
    public function evaluateCompatibility(UserSkinProfile $profile, Collection $ingredients): array
    {
        $score = 100;
        $warnings = [];
        $benefits = [];

        $skinType = $profile->skin_type;
        $conditions = $profile->active_conditions ?? [];
        $allergens = array_map('strtoupper', $profile->known_allergens ?? []);
        $isSensitive = $skinType === 'SENSITIVE' || $profile->barrier_status !== 'HEALTHY';

        foreach ($ingredients as $ing) {
            $inci = strtoupper($ing->inci_name);

            // 1. Check user-declared allergens
            if (in_array($inci, $allergens)) {
                $score -= 35;
                $warnings[] = "Contiene alérgeno declarado por el usuario: {$ing->inci_name}.";
            }

            // 2. Comedogenicity checks for acne/oily skin
            if (($skinType === 'OILY' || in_array('ACNE', $conditions)) && $ing->comedogenic_rating >= 3) {
                $score -= ($ing->comedogenic_rating * 4);
                $warnings[] = "Ingrediente potencialmente comedogénico (Nivel {$ing->comedogenic_rating}/5): {$ing->inci_name}. Puede obstruir poros en piel grasa o con tendencia acneica.";
            }

            // 3. Irritation checks for sensitive skin or compromised barrier
            if ($isSensitive && $ing->irritation_rating >= 2) {
                $score -= ($ing->irritation_rating * 6);
                $warnings[] = "Potencial irritante para piel reactiva/sensible (Nivel {$ing->irritation_rating}/5): {$ing->inci_name}.";
            }

            // 4. Rosacea specific alerts
            if (in_array('ROSACEA', $conditions)) {
                if (str_contains($inci, 'ALCOHOL DENAT') || str_contains($inci, 'MENTHOL') || str_contains($inci, 'EUCALYPTUS') || str_contains($inci, 'FRAGRANCE') || str_contains($inci, 'PARFUM')) {
                    $score -= 20;
                    $warnings[] = "Desencadenante de rubor/vasodilatación en rosácea: {$ing->inci_name}.";
                }
            }

            // 5. Positive benefits identification
            if (in_array('ACNE', $conditions) && in_array($inci, ['SALICYLIC ACID', 'NIACINAMIDE', 'ZINC PCA', 'AZELAIC ACID'])) {
                $benefits[] = "Activo terapéutico ideal para control de acné: {$ing->inci_name}.";
            }

            if (in_array('MELASMA', $conditions) && in_array($inci, ['TRANEXAMIC ACID', 'AZELAIC ACID', 'ASCORBIC ACID', 'ALPHA-ARBUTIN', 'KOJIC ACID', 'RETINOL'])) {
                $benefits[] = "Activo despigmentante indicado para hiperpigmentación y melasma: {$ing->inci_name}.";
            }

            if ($profile->barrier_status !== 'HEALTHY' && in_array($inci, ['CERAMIDE NP', 'CERAMIDE AP', 'CENTELLA ASIATICA', 'PANTHENOL', 'SQUALANE', 'CHOLESTEROL', 'MADECASSOSIDE'])) {
                $benefits[] = "Activo reparador de la barrera cutánea: {$ing->inci_name}.";
            }
        }

        // Clamp score between 0 and 100
        $finalScore = max(0, min(100, $score));

        return [
            'compatibility_score' => $finalScore,
            'compatibility_level' => match (true) {
                $finalScore >= 85 => 'ALTA_COMPATIBILIDAD',
                $finalScore >= 65 => 'COMPATIBILIDAD_MEDIA',
                $finalScore >= 45 => 'PRECAUCIÓN',
                default => 'NO_RECOMENDADO',
            },
            'compatibility_verdict' => match (true) {
                $finalScore >= 85 => 'Excelente compatibilidad con tu biotipo y condiciones cutáneas.',
                $finalScore >= 65 => 'Apto para tu piel con precauciones menores o introducción paulatina.',
                $finalScore >= 45 => 'Precaución: Contiene ingredientes que pueden causar reactividad u oclusión.',
                default => 'No recomendado para tu perfil actual debido a riesgo de irritación o brotes.',
            },
            'warnings' => array_unique($warnings),
            'tailored_benefits' => array_unique($benefits),
            'user_profile_summary' => [
                'skin_type' => $skinType,
                'barrier_status' => $profile->barrier_status,
                'active_conditions' => $conditions,
            ],
        ];
    }
}
