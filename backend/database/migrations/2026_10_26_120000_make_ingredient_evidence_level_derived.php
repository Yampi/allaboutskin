<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * El nivel de evidencia deja de tener un valor por defecto (B) y pasa a derivarse
     * de los estudios vinculados. Sin estudios queda en NULL.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE ingredients ALTER COLUMN evidence_level DROP DEFAULT');
        DB::statement('ALTER TABLE ingredients ALTER COLUMN evidence_level DROP NOT NULL');

        // 'A' < 'B' < 'C' < 'D' también en orden alfabético: MIN() devuelve el mejor grado.
        DB::statement(<<<'SQL'
            UPDATE ingredients SET evidence_level = (
                SELECT MIN(ps.evidence_grade)
                FROM ingredient_pubmed_studies ips
                JOIN pubmed_studies ps ON ps.id = ips.pubmed_study_id
                WHERE ips.ingredient_id = ingredients.id
            )
SQL);
    }

    public function down(): void
    {
        DB::statement("UPDATE ingredients SET evidence_level = 'B' WHERE evidence_level IS NULL");
        DB::statement("ALTER TABLE ingredients ALTER COLUMN evidence_level SET DEFAULT 'B'");
        DB::statement('ALTER TABLE ingredients ALTER COLUMN evidence_level SET NOT NULL');
    }
};
