<?php

namespace App\Domain\Evidence\Services;

use App\Models\Ingredient;

/**
 * Calcula el nivel de evidencia solo a partir de estudios realmente vinculados.
 * Sin estudios no hay nivel: devuelve null en lugar de inventar uno.
 */
class EvidenceGradeCalculator
{
    private const RANKS = ['A' => 1, 'B' => 2, 'C' => 3, 'D' => 4];

    /**
     * @param iterable<string|null> $grades Grados (A-D) de los estudios.
     */
    public function bestGrade(iterable $grades): ?string
    {
        $best = null;
        foreach ($grades as $grade) {
            if (!isset(self::RANKS[$grade])) {
                continue;
            }
            if ($best === null || self::RANKS[$grade] < self::RANKS[$best]) {
                $best = $grade;
            }
        }

        return $best;
    }

    /**
     * Recalcula y guarda el nivel del ingrediente según sus estudios vinculados.
     */
    public function refresh(Ingredient $ingredient): ?string
    {
        $grade = $this->bestGrade($ingredient->pubmedStudies()->pluck('evidence_grade'));

        if ($ingredient->evidence_level !== $grade) {
            $ingredient->forceFill(['evidence_level' => $grade])->save();
        }

        return $grade;
    }
}
