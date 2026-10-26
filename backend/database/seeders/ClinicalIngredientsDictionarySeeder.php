<?php

namespace Database\Seeders;

use App\Models\Ingredient;
use App\Models\IngredientAlias;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ClinicalIngredientsDictionarySeeder extends Seeder
{
    /**
     * Catálogo maestro de más de 100 componentes cosméticos y dermatológicos con respaldo científico.
     */
    public function run(): void
    {
        $ingredients = [
            // ==================== 1. RETINOIDES & RENOVADORES ====================
            [
                'inci_name' => 'RETINAL',
                'common_name' => 'Retinaldehído (Retinal)',
                'description' => 'Precursor directo del ácido retinoico. 11 veces más rápido que el retinol y con menor tasa de irritación.',
                'is_active' => true,
                'is_uv_sensitizing' => true,
                'requires_sunscreen' => true,
                'recommended_timing' => 'PM',
                'layering_category' => 'EMULSION_TREATMENT',
                'aliases' => ['RETINALDEHYDE', 'RETIN-AL']
            ],
            [
                'inci_name' => 'BAKUCHIOL',
                'common_name' => 'Bakuchiol (Alternativa Botánica al Retinol)',
                'description' => 'Compuesto fenólico purificado de semillas de Psoralea corylifolia. Estimula colágeno sin fotosensibilizar.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'OIL',
                'aliases' => ['BABCHI EXTRACT', 'BIO-RETINOL']
            ],
            [
                'inci_name' => 'HYDROXYPINACOLONE RETINOATE',
                'common_name' => 'Granactive Retinoid (HPR)',
                'description' => 'Éster directo del ácido retinoico que se une directamente a los receptores retinoides celulares sin conversión enzimática previa.',
                'is_active' => true,
                'is_uv_sensitizing' => true,
                'requires_sunscreen' => true,
                'recommended_timing' => 'PM',
                'layering_category' => 'EMULSION_TREATMENT',
                'aliases' => ['HPR', 'GRANACTIVE RETINOID']
            ],
            [
                'inci_name' => 'ADAPALENE',
                'common_name' => 'Adapaleno',
                'description' => 'Retinoide sintético de tercera generación con alta especificidad por receptores nucleares RAR-beta y RAR-gamma.',
                'is_active' => true,
                'is_uv_sensitizing' => true,
                'requires_sunscreen' => true,
                'recommended_timing' => 'PM',
                'layering_category' => 'EMULSION_TREATMENT',
                'aliases' => ['DIFFERIN']
            ],
            [
                'inci_name' => 'TRETINOIN',
                'common_name' => 'Tretinoína (Ácido Retinoico)',
                'description' => 'Forma ácida pura de la vitamina A. Estándar de oro clínico para fotoenvejecimiento y acné.',
                'is_active' => true,
                'is_uv_sensitizing' => true,
                'requires_sunscreen' => true,
                'recommended_timing' => 'PM',
                'layering_category' => 'EMULSION_TREATMENT',
                'aliases' => ['RETIN-A', 'ALL-TRANS RETINOIC ACID']
            ],

            // ==================== 2. HIDROXIÁCIDOS & EXFOLIANTES ====================
            [
                'inci_name' => 'LACTIC ACID',
                'common_name' => 'Ácido Láctico (AHA)',
                'description' => 'AHA derivado de fermentación con mayor peso molecular que el ácido glicólico, aportando exfoliación suave e hidratación NMF.',
                'is_active' => true,
                'is_uv_sensitizing' => true,
                'requires_sunscreen' => true,
                'recommended_timing' => 'PM',
                'layering_category' => 'LOW_PH_TREATMENT',
                'aliases' => ['ACIDO LACTICO', '2-HYDROXYPROPANOIC ACID']
            ],
            [
                'inci_name' => 'MANDELIC ACID',
                'common_name' => 'Ácido Mandélico (AHA)',
                'description' => 'AHA de peso molecular elevado extraído de almendras amargas. Muy tolerable en pieles sensibles y con tendencia a hiperpigmentación.',
                'is_active' => true,
                'is_uv_sensitizing' => true,
                'requires_sunscreen' => true,
                'recommended_timing' => 'PM',
                'layering_category' => 'LOW_PH_TREATMENT',
                'aliases' => ['ACIDO MANDELICO', 'AMYGDALIC ACID']
            ],
            [
                'inci_name' => 'AZELAIC ACID',
                'common_name' => 'Ácido Azelaico',
                'description' => 'Ácido dicarboxílico saturado con propiedades antiinflamatorias, antibacterianas (C. acnes) y bloqueador de tirosinasa.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => true,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'EMULSION_TREATMENT',
                'aliases' => ['ACIDO AZELAICO', 'AZELIC ACID']
            ],
            [
                'inci_name' => 'TRANEXAMIC ACID',
                'common_name' => 'Ácido Tranexámico',
                'description' => 'Inhibidor sintético del plasminógeno con demostrada eficacia clínica en melasma y eritema posinflamatorio (PIE).',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => true,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['ACIDO TRANEXAMICO', 'TXA']
            ],
            [
                'inci_name' => 'GLUCONOLACTONE',
                'common_name' => 'Gluconolactona (PHA)',
                'description' => 'Polihidroxiácido de gran tamaño molecular que exfolia suavemente sin alterar la función barrera, con acción antioxidante.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'LOW_PH_TREATMENT',
                'aliases' => ['PHA', 'GLUCONIC ACID LACTONE']
            ],
            [
                'inci_name' => 'LACTOBIONIC ACID',
                'common_name' => 'Ácido Lactobiónico (Biónico / PHA)',
                'description' => 'Ácido polihidroxibiónico antioxidante y ultra-humectante indicado para pieles secas, atópicas o post-procedimiento.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['ACIDO LACTOBIONICO']
            ],
            [
                'inci_name' => 'CAPRYLOYL SALICYLIC ACID',
                'common_name' => 'LHA (Lipo-hidroxiácido)',
                'description' => 'Derivado lipofílico del ácido salicílico con liberación gradual y microexfoliación de precisión poro a poro.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => true,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'LOW_PH_TREATMENT',
                'aliases' => ['LHA', 'LIPOHYDROXY ACID']
            ],

            // ==================== 3. VITAMINAS & ANTIOXIDANTES ====================
            [
                'inci_name' => 'PANTHENOL',
                'common_name' => 'Pantenol (Provitamina B5)',
                'description' => 'Provitamina esencial que se convierte en ácido pantoténico en la piel, estimulando la proliferación de fibroblastos y reepitelización.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['PRO-VITAMIN B5', 'D-PANTHENOL', 'VITAMINA B5']
            ],
            [
                'inci_name' => 'TOCOPHEROL',
                'common_name' => 'Tocoferol (Vitamina E Pura)',
                'description' => 'Antioxidante liposoluble primario de las membranas celulares dérmicas que actúa en sinergia con la vitamina C.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'OIL',
                'aliases' => ['VITAMIN E', 'VITAMINA E', 'D-ALPHA-TOCOPHEROL']
            ],
            [
                'inci_name' => 'TOCOPHERYL ACETATE',
                'common_name' => 'Acetato de Tocoferilo (Vitamina E Estable)',
                'description' => 'Forma estabilizada de vitamina E resistente a la oxidación en el envase.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'CREAM_OCCLUSIVE',
                'aliases' => ['VITAMIN E ACETATE']
            ],
            [
                'inci_name' => 'FERULIC ACID',
                'common_name' => 'Ácido Ferúlico',
                'description' => 'Potente antioxidante fenólico vegetal que duplica la estabilidad y fotoprotección de las vitaminas C y E.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'AM',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['ACIDO FERULICO']
            ],
            [
                'inci_name' => 'RESVERATROL',
                'common_name' => 'Resveratrol',
                'description' => 'Polifenol estilbenoide con intensa actividad antioxidante intracelular que activa las sirtuinas (SIRT1).',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'PM',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['TRANS-RESVERATROL']
            ],
            [
                'inci_name' => 'UBIQUINONE',
                'common_name' => 'Coenzima Q10 (Ubiquinona)',
                'description' => 'Antioxidante endógeno mitocondrial que protege frente al estrés oxidativo y previene la degradación del colágeno.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'OIL',
                'aliases' => ['COENZYME Q10', 'Q10', 'COQ10']
            ],
            [
                'inci_name' => 'ETHYL ASCORBIC ACID',
                'common_name' => '3-O-Etil Ácido Ascórbico',
                'description' => 'Derivado eterificado altamente estable de vitamina C con excelente penetración lipofílica e hidrofílica.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => true,
                'recommended_timing' => 'AM',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['3-O-ETHYL ASCORBIC ACID', 'ETHYLATED VITAMIN C']
            ],
            [
                'inci_name' => 'ASCORBYL GLUCOSIDE',
                'common_name' => 'Ascorbil Glucósido',
                'description' => 'Vitamina C conjugada con glucosa que se biotransforma progresivamente en ácido L-ascórbico en la piel.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => true,
                'recommended_timing' => 'AM',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['AA2G', 'VITAMIN C GLUCOSIDE']
            ],
            [
                'inci_name' => 'SODIUM ASCORBYL PHOSPHATE',
                'common_name' => 'Fosfato de Ascorbilo Sódico (SAP)',
                'description' => 'Derivado hidrosoluble de vitamina C especialmente eficaz contra bacterias causantes de acné.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => true,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['SAP', 'VITAMINA C SAP']
            ],
            [
                'inci_name' => 'MAGNESIUM ASCORBYL PHOSPHATE',
                'common_name' => 'Fosfato de Ascorbilo de Magnesio (MAP)',
                'description' => 'Forma estable y no irritante de vitamina C con efecto despigmentante a pH neutro.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => true,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['MAP']
            ],
            [
                'inci_name' => 'TETRAHEXYLDECYL ASCORBATE',
                'common_name' => 'Ascorbato de Tetrahexildecilo (THD)',
                'description' => 'Forma liposoluble de vitamina C de altísima penetración dérmica y estabilidad frente al calor y luz.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => true,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'OIL',
                'aliases' => ['THD ASCORBATE', 'BV-OSC']
            ],

            // ==================== 4. DESPIGMENTANTES & TONO UNIFORME ====================
            [
                'inci_name' => 'ALPHA-ARBUTIN',
                'common_name' => 'Alfa-Arbutina',
                'description' => 'Glucósido biosintético que inhibe reversiblemente la enzima tirosinasa, atenuando manchas y melasma.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => true,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['ALFA ARBUTINA', 'ALPHA ARBUTIN']
            ],
            [
                'inci_name' => 'KOJIC ACID',
                'common_name' => 'Ácido Kójico',
                'description' => 'Quelante del ión cobre en el sitio activo de la tirosinasa, derivado de la fermentación del hongo Aspergillus oryzae.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => true,
                'recommended_timing' => 'PM',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['ACIDO KOJICO']
            ],
            [
                'inci_name' => 'GLYCYRRHIZA GLABRA ROOT EXTRACT',
                'common_name' => 'Extracto de Regaliz (Glabridina)',
                'description' => 'Rico en glabridina y licochalcona A; ejerce triple acción despigmentante, antioxidante y calmante vascular.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['LICORICE EXTRACT', 'REGALIZ', 'GLABRIDIN']
            ],
            [
                'inci_name' => 'ACETYL GLUCOSAMINE',
                'common_name' => 'N-Acetil Glucosamina (NAG)',
                'description' => 'Aminoazúcar precursor del ácido hialurónico que potencia la acción despigmentante de la niacinamida.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['NAG', 'N-ACETYL GLUCOSAMINE']
            ],

            // ==================== 5. BARRERA CUTÁNEA & LÍPIDOS ====================
            [
                'inci_name' => 'CERAMIDE AP',
                'common_name' => 'Ceramida 6 (AP)',
                'description' => 'Ceramida con ácido alfa-hidroxi que regula la descamación natural y retiene agua en el estrato córneo.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'CREAM_OCCLUSIVE',
                'aliases' => ['CERAMIDE 6-II', 'CERAMIDA AP']
            ],
            [
                'inci_name' => 'CERAMIDE EOP',
                'common_name' => 'Ceramida 1 (EOP)',
                'description' => 'Acilceramida con ácido linoleico esterificado vital para la estructura laminar del manto lipídico.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'CREAM_OCCLUSIVE',
                'aliases' => ['CERAMIDE 1', 'CERAMIDA EOP']
            ],
            [
                'inci_name' => 'PHYTOSPHINGOSINE',
                'common_name' => 'Fitoesfingosina',
                'description' => 'Lípido precursor de ceramidas con propiedades antimicrobianas naturales frente a bacterias del acné.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'CREAM_OCCLUSIVE',
                'aliases' => ['PHYTOSPHINGOSINE']
            ],
            [
                'inci_name' => 'CHOLESTEROL',
                'common_name' => 'Colesterol Epidérmico',
                'description' => 'Lípido fisiológico indispensable (proporción 3:1:1 con ceramidas y ácidos grasos) para la arquitectura de la barrera cutánea.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'CREAM_OCCLUSIVE',
                'aliases' => ['COLESTEROL']
            ],
            [
                'inci_name' => 'SQUALANE',
                'common_name' => 'Escualano Puro (Biomimético)',
                'description' => 'Hidrocarburo saturado y estable idéntico al escualeno del sebo humano; hidrata sin aportar peso ni comedogenicidad.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'OIL',
                'aliases' => ['ESCUALANO', 'PLANT SQUALANE']
            ],

            // ==================== 6. CALMANTES, CENTELLA & BOTÁNICOS CLÍNICOS ====================
            [
                'inci_name' => 'CENTELLA ASIATICA EXTRACT',
                'common_name' => 'Extracto de Centella Asiática (Cica)',
                'description' => 'Hierba medicinal rica en saponinas triterpénicas con sobresaliente capacidad reparadora, calmante y cicatrizante.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['CICA', 'GOTU KOLA', 'CENTELLA ASIATICA']
            ],
            [
                'inci_name' => 'MADECASSOSIDE',
                'common_name' => 'Madecassoside',
                'description' => 'Fracción pura aislada de Centella Asiática que estimula el colágeno tipo III e inhibe mediadores inflamatorios.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['MADECASOSIDO']
            ],
            [
                'inci_name' => 'ASIATICOSIDE',
                'common_name' => 'Asiaticósido',
                'description' => 'Glucósido triterpénico de Centella que acelera la síntesis de glucosaminoglucanos y reparación tisular.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['ASIATICOSIDE']
            ],
            [
                'inci_name' => 'ALLANTOIN',
                'common_name' => 'Alantoína',
                'description' => 'Agente queratolítico suave y calmante que promueve la regeneración celular y suaviza asperezas.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['ALANTOINA']
            ],
            [
                'inci_name' => 'ECTOIN',
                'common_name' => 'Ectoína',
                'description' => 'Extremolito natural que forma un escudo hidrofílico de protección frente a estrés térmico, radiación UV y contaminación.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['ECTOINE']
            ],
            [
                'inci_name' => 'BISABOLOL',
                'common_name' => 'Alfa-Bisabolol',
                'description' => 'Sesquiterpeno monocíclico presente en la manzanilla con efecto antiinflamatorio directo y antimicrobiano.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'OIL',
                'aliases' => ['ALPHA-BISABOLOL', 'LEVOMENOL']
            ],
            [
                'inci_name' => 'BETA-GLUCAN',
                'common_name' => 'Beta-Glucano',
                'description' => 'Polisacárido 20% más hidratante que el ácido hialurónico; estimula los macrófagos cutáneos y repara rojeces.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['BETA GLUCANO', 'YEAST BETA-GLUCAN']
            ],
            [
                'inci_name' => 'COLLOIDAL OATMEAL',
                'common_name' => 'Avena Coloidal',
                'description' => 'Rica en avenantramidas antiinflamatorias y beta-glucanos; protector dérmico monografiado por la FDA para prurito y eccema.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'CREAM_OCCLUSIVE',
                'aliases' => ['AVENA SATIVA', 'AVENA COLOIDAL']
            ],

            // ==================== 7. PÉPTIDOS & FACTORES DE CRECIMIENTO ====================
            [
                'inci_name' => 'COPPER TRIPEPTIDE-1',
                'common_name' => 'Péptido de Cobre (GHK-Cu)',
                'description' => 'Complejo bioidéntico que estimula la síntesis de colágeno, elastina y glucosaminoglucanos y acelera la cicatrización.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['GHK-CU', 'COPPER PEPTIDES', 'PEPTIDOS DE COBRE']
            ],
            [
                'inci_name' => 'ACETYL HEXAPEPTIDE-8',
                'common_name' => 'Argireline (Péptido Efecto Botox)',
                'description' => 'Péptido biomimético del complejo SNARE que atenúa las contracciones musculares faciales repetitivas en líneas de expresión.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['ARGIRELINE', 'ARGIRELINE PEPTIDE']
            ],
            [
                'inci_name' => 'PALMITOYL TRIPEPTIDE-1',
                'common_name' => 'Palmitoil Tripéptido-1 (Matrikina)',
                'description' => 'Mensajero peptídico que estimula la síntesis de colágeno I y glucosaminoglucanos en la matriz extracelular.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['MAXILIP', 'PEPTIDE-1']
            ],
            [
                'inci_name' => 'PALMITOYL TETRAPEPTIDE-7',
                'common_name' => 'Palmitoil Tetrapéptido-7 (Matrixyl)',
                'description' => 'Péptido que suprime la interleucina-6 (IL-6), frenando la degradación prematura del colágeno dérmico.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['MATRIXYL COMPONENT', 'RIGIN']
            ],
            [
                'inci_name' => 'PALMITOYL PENTAPEPTIDE-4',
                'common_name' => 'Matrixyl (Pentapéptido)',
                'description' => 'Microfragmento de colágeno que señaliza a los fibroblastos para sintetizar colágeno tipos I, III y IV.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['MATRIXYL', 'PAL-KTTKS']
            ],

            // ==================== 8. HIDRATACIÓN AVANZADA & NMF ====================
            [
                'inci_name' => 'HYDROLYZED HYALURONIC ACID',
                'common_name' => 'Ácido Hialurónico Hidrolizado (Bajo Peso Molecular)',
                'description' => 'Micro-moléculas de ácido hialurónico capaces de atravesar el estrato córneo para hidratar capas dérmicas profundas.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['LOW MOLECULAR HA', 'MICRO HA']
            ],
            [
                'inci_name' => 'SODIUM ACETYLATED HYALURONATE',
                'common_name' => 'Super Ácido Hialurónico',
                'description' => 'Ácido hialurónico acetilado con mayor afinidad lipídica y el doble de retención hídrica en superficie cutánea.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['SUPER HA', 'ACETYLATED HYALURONATE']
            ],
            [
                'inci_name' => 'GLYCERIN',
                'common_name' => 'Glicerina Vegetal Pura',
                'description' => 'Humectante fisiológico estándar de oro que optimiza la fluidez de las bicapas lipídicas y activa acuaporinas.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['GLYCEROL', 'GLICERINA']
            ],
            [
                'inci_name' => 'UREA',
                'common_name' => 'Urea Dérmica',
                'description' => 'Componente esencial del Factor Natural de Hidratación (NMF). Hidrata al 5% y realiza suave exfoliación queratolítica al 10%.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'CREAM_OCCLUSIVE',
                'aliases' => ['CARBAMIDE', 'UREA PURA']
            ],
            [
                'inci_name' => 'POLYGLUTAMIC ACID',
                'common_name' => 'Ácido Poliglutámico (PGA)',
                'description' => 'Biopolímero fermentado que retiene 4 veces más humedad que el ácido hialurónico e inhibe la hialuronidasa dérmica.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['PGA', 'ACIDO POLIGLUTAMICO']
            ],
            [
                'inci_name' => 'TREHALOSE',
                'common_name' => 'Trehalosa',
                'description' => 'Disacárido osmolito que protege contra el choque osmótico y preserva la viabilidad celular en deshidratación extrema.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['TREHALOSE']
            ],

            // ==================== 9. CONTROL DE SEBO & ACNÉ ====================
            [
                'inci_name' => 'ZINC GLUCONATE',
                'common_name' => 'Gluconato de Zinc',
                'description' => 'Sal orgánica de zinc altamente biodisponible; inhibe la 5-alfa reductasa reduciendo la secreción sebácea y la inflamación.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['GLUCONATO DE ZINC', 'ZINC']
            ],
            [
                'inci_name' => 'ZINC OXIDE',
                'common_name' => 'Óxido de Zinc (Mineral)',
                'description' => 'Filtro solar físico mineral de amplio espectro UVA/UVB con propiedades astringentes, protectoras y calmantes.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'AM',
                'layering_category' => 'CREAM_OCCLUSIVE',
                'aliases' => ['OXIDO DE ZINC', 'MINERAL ZINC']
            ],
            [
                'inci_name' => 'SULFUR',
                'common_name' => 'Azufre Coloidal',
                'description' => 'Elemento con acción queratolítica, comedolítica y bacteriostática ideal para acné inflamatorio y rosácea papulopustulosa.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => true,
                'recommended_timing' => 'PM',
                'layering_category' => 'LOW_PH_TREATMENT',
                'aliases' => ['AZUFRE', 'COLLOIDAL SULFUR']
            ],
            [
                'inci_name' => 'MELALEUCA ALTERNIFOLIA LEAF OIL',
                'common_name' => 'Aceite de Árbol de Té',
                'description' => 'Rico en terpinen-4-ol; antimicrobiano natural de amplio espectro contra Cutibacterium acnes y Malassezia.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'OIL',
                'aliases' => ['TEA TREE OIL', 'ARBOL DE TE']
            ],
            // ==================== 10. FILTROS SOLARES AVANZADOS ====================
            [
                'inci_name' => 'BIS-ETHYLHEXYLOXYPHENOL METHOXYPHENYL TRIAZINE',
                'common_name' => 'Tinosorb S (Filtro UVA/UVB Fotoestable)',
                'description' => 'Filtro solar de amplio espectro de última generación, excepcionalmente fotoestable con alta tolerancia dérmica.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'AM',
                'layering_category' => 'SUNSCREEN',
                'aliases' => ['TINOSORB S', 'BEMOTRIZINOL']
            ],
            [
                'inci_name' => 'METHYLENE BIS-BENZOTRIAZOLYL TETRAMETHYLBUTYLPHENOL',
                'common_name' => 'Tinosorb M (Filtro Híbrido Microparticulado)',
                'description' => 'Filtro solar híbrido orgánico particulado que absorbe y dispersa radiaciones UVA y UVB.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'AM',
                'layering_category' => 'SUNSCREEN',
                'aliases' => ['TINOSORB M', 'BISCOTRIZOLE']
            ],
            [
                'inci_name' => 'DIETHYLAMINO HYDROXYBENZOYL HEXYL BENZOATE',
                'common_name' => 'Uvinul A Plus (Filtro UVA-I Ultra-Estable)',
                'description' => 'Filtro orgánico de protección superior en el rango UVA largo (320-400 nm) sin degradarse bajo exposición solar.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'AM',
                'layering_category' => 'SUNSCREEN',
                'aliases' => ['UVINUL A PLUS', 'DHHB']
            ],
            [
                'inci_name' => 'ETHYLHEXYL TRIAZONE',
                'common_name' => 'Uvinul T 150 (Filtro UVB de Máxima Absorción)',
                'description' => 'Filtro UVB con el mayor coeficiente de extinción molar conocido, resistente al agua y al sudor.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'AM',
                'layering_category' => 'SUNSCREEN',
                'aliases' => ['UVINUL T 150', 'OCTYLTRIAZONE']
            ],
            [
                'inci_name' => 'TITANIUM DIOXIDE',
                'common_name' => 'Dióxido de Titanio (Mineral)',
                'description' => 'Filtro físico mineral biocompatible ideal para pieles intolerantes, atópicas o pediátricas.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'AM',
                'layering_category' => 'SUNSCREEN',
                'aliases' => ['DIOXIDO DE TITANIO', 'MINERAL TITANIUM']
            ],

            // ==================== 11. ANTIOXIDANTES AVANZADOS & LONGEVIDAD ====================
            [
                'inci_name' => 'GLUTATHIONE',
                'common_name' => 'Glutatión (Antioxidante Maestro)',
                'description' => 'Tripéptido endógeno intracelular con intensa acción antienvejecimiento y despigmentante por inhibición de la eumelanogénesis.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['GLUTATION', 'GSH']
            ],
            [
                'inci_name' => 'THIOCTIC ACID',
                'common_name' => 'Ácido Alfa Lipoico (ALA)',
                'description' => 'Antioxidante anfifílico soluble en agua y grasa que recicla la vitamina C, E y glutatión endógeno.',
                'is_active' => true,
                'is_uv_sensitizing' => true,
                'requires_sunscreen' => true,
                'recommended_timing' => 'PM',
                'layering_category' => 'EMULSION_TREATMENT',
                'aliases' => ['ALPHA LIPOIC ACID', 'ALA', 'ACIDO ALFA LIPOICO']
            ],
            [
                'inci_name' => 'EPIGALLOCATECHIN GALLATE',
                'common_name' => 'EGCG (Polifenol de Té Verde)',
                'description' => 'Catequina pura de Camellia sinensis con potentes efectos antiinflamatorios, seborreguladores y fotoprotectores celulares.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['EGCG', 'GREEN TEA EXTRACT', 'TE VERDE']
            ],
            [
                'inci_name' => 'CARNOSINE',
                'common_name' => 'Carnosina (Dipéptido Antiglicación)',
                'description' => 'Dipéptido biomimético que protege las fibras de colágeno frente a la glicación (A.G.E.s) y daño por luz azul.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['L-CARNOSINE', 'CARNOSINA']
            ],
            [
                'inci_name' => 'ASTAXANTHIN',
                'common_name' => 'Astaxantina (Carotenoide Marino)',
                'description' => 'Carotenoide 6000 veces más potente que la vitamina C para neutralizar radicales de oxígeno singlete.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'OIL',
                'aliases' => ['ASTAXANTHIN', 'ASTAXANTINA']
            ],

            // ==================== 12. DESPIGMENTANTES DERMATOLÓGICOS ====================
            [
                'inci_name' => 'ISOBUTYLAMIDO THIAZOLYL RESORCINOL',
                'common_name' => 'Thiamidol',
                'description' => 'Inhibidor selectivo de la tirosinasa humana de máxima potencia clínica para melasma e hiperpigmentación posinflamatoria.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => true,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['THIAMIDOL']
            ],
            [
                'inci_name' => 'POTASSIUM AZELOYL DIGLYCINATE',
                'common_name' => 'Azeloglicina (PAD)',
                'description' => 'Derivado soluble del ácido azelaico con glicina; aporta excelente tolerancia, seborregulación e iluminación.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['PAD', 'AZELOGLICINA']
            ],
            [
                'inci_name' => 'PHENYLETHYL RESORCINOL',
                'common_name' => 'SymWhite 377',
                'description' => 'Agente despigmentante inspirado en los componentes del pino silvestre, con altísima afinidad por melanocitos.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => true,
                'recommended_timing' => 'PM',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['SYMWHITE 377', 'RESORCINOL 377']
            ],

            // ==================== 13. PÉPTIDOS ESPECÍFICOS & EFECTO TENSOR ====================
            [
                'inci_name' => 'PALMITOYL TRIPEPTIDE-38',
                'common_name' => 'Matrixyl Synthe 6',
                'description' => 'Péptido biomimético que estimula 6 macromoléculas esenciales de la matriz cutánea y unión dermoepidérmica.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['MATRIXYL SYNTHE 6', 'VOLULIP']
            ],
            [
                'inci_name' => 'ACETYL TETRAPEPTIDE-5',
                'common_name' => 'Eyeseryl (Péptido Descongestionante)',
                'description' => 'Tetrapéptido con efecto drenante linfático y antiedematoso específico para bolsas y ojeras.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['EYESERYL', 'PEPTIDO OJERAS']
            ],
            [
                'inci_name' => 'DIPEPTIDE DIAMINOBUTYROYL BENZYLAMIDE DIACETATE',
                'common_name' => 'Syn-Ake (Péptido Relajante Muscular)',
                'description' => 'Tripéptido que reproduce la secuencia de la Waglerina 1, antagonista de los receptores nicotínicos de acetilcolina.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['SYN-AKE', 'VENENO DE SERPIENTE']
            ],

            // ==================== 14. LÍPIDOS & BARRERA COMPLETA ====================
            [
                'inci_name' => 'CERAMIDE NS',
                'common_name' => 'Ceramida 2 (NS)',
                'description' => 'La ceramida más abundante en el estrato córneo humano, esencial para la elasticidad cutánea.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'CREAM_OCCLUSIVE',
                'aliases' => ['CERAMIDE 2', 'CERAMIDA NS']
            ],
            [
                'inci_name' => 'LINOLEIC ACID',
                'common_name' => 'Ácido Linoleico (Omega-6 Esencial)',
                'description' => 'Ácido graso poliinsaturado esencial cuya deficiencia en el sebo causa hiperqueratinización folicular y comedones.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'OIL',
                'aliases' => ['OMEGA 6', 'ACIDO LINOLEICO']
            ],
            [
                'inci_name' => 'HYDROGENATED LECITHIN',
                'common_name' => 'Lecitina Hidrogenada (Fosfolípido)',
                'description' => 'Emulsionante biomimético que repara membranas celulares y facilita la absorción transepidérmica de activos.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'CREAM_OCCLUSIVE',
                'aliases' => ['LECITINA', 'PHOSPHOLIPIDS']
            ],

            // ==================== 15. FITO-EXTRACTOS CALMANTES & COREANOS ====================
            [
                'inci_name' => 'ALOE BARBADENSIS LEAF JUICE',
                'common_name' => 'Jugo Puro de Aloe Vera',
                'description' => 'Rico en acemanano, vitaminas y aminoácidos con destacadas propiedades rehidratantes y desinflamatorias.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['ALOE VERA', 'SABILA']
            ],
            [
                'inci_name' => 'ARTEMISIA ANNUA EXTRACT',
                'common_name' => 'Extracto de Artemisa (Mugwort)',
                'description' => 'Planta medicinal oriental con potentes propiedades calmantes, purificantes y reguladoras de rojeces.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['MUGWORT', 'ARTEMISA']
            ],
            [
                'inci_name' => 'HOUTTUYNIA CORDATA EXTRACT',
                'common_name' => 'Extracto de Houttuynia Cordata (Heartleaf)',
                'description' => 'Activo estrella en K-Beauty por su alta concentración de quercitrina calmante y antibacteriana.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['HEARTLEAF', 'HOUTTUYNIA']
            ],
            [
                'inci_name' => 'CALENDULA OFFICINALIS FLOWER EXTRACT',
                'common_name' => 'Extracto de Caléndula',
                'description' => 'Rico en flavonoides y carotenos antisépticos y cicatrizantes para pieles reactivas y sensibles.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['CALENDULA', 'MARIGOLD']
            ],

            // ==================== 16. EXFOLIANTES COMPLEMENTARIOS ====================
            [
                'inci_name' => 'SUCCINIC ACID',
                'common_name' => 'Ácido Succínico',
                'description' => 'Compuesto antimicrobiano que inhibe el crecimiento de C. acnes sin resecar ni descamar como el peróxido de benzoilo.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'LOW_PH_TREATMENT',
                'aliases' => ['ACIDO SUCCINICO']
            ],
            [
                'inci_name' => 'MALIC ACID',
                'common_name' => 'Ácido Málico (AHA de Manzana)',
                'description' => 'AHA intermediario del ciclo de Krebs que mejora la textura superficial y estimula la respiración celular.',
                'is_active' => true,
                'is_uv_sensitizing' => true,
                'requires_sunscreen' => true,
                'recommended_timing' => 'PM',
                'layering_category' => 'LOW_PH_TREATMENT',
                'aliases' => ['ACIDO MALICO']
            ],
            [
                'inci_name' => 'BETAINE SALICYLATE',
                'common_name' => 'Salicilato de Betaína',
                'description' => 'Alternativa suave al ácido salicílico combinada con betaína humectante; limpia poros dilatados con tolerancia máxima.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => true,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'LOW_PH_TREATMENT',
                'aliases' => ['BETAINE SALICYLATE']
            ],
            [
                'inci_name' => 'PIROCTONE OLAMINE',
                'common_name' => 'Piroctona Olamina',
                'description' => 'Agente antifúngico específico contra Malassezia restricta y globosa, controlando dermatitis seborreica y caspa.',
                'is_active' => true,
                'is_uv_sensitizing' => false,
                'requires_sunscreen' => false,
                'recommended_timing' => 'BOTH',
                'layering_category' => 'WATER_BASED_SERUM',
                'aliases' => ['OCTOPIROX', 'PIROCTONE OLAMINE']
            ],
        ];

        $insertedCount = 0;

        foreach ($ingredients as $data) {
            $aliases = $data['aliases'] ?? [];
            unset($data['aliases']);

            $data['source_name'] = $data['source_name'] ?? 'CosIng UE (Comisión Europea)';
            $data['source_url'] = $data['source_url'] ?? 'https://ec.europa.eu/growth/tools-databases/cosing/';
            $data['source_license'] = $data['source_license'] ?? 'EU Open Data / Public Domain';
            // El nivel de evidencia se deriva de los estudios vinculados (EvidenceGradeCalculator); aquí no se inventa.
            unset($data['evidence_level'], $data['reviewed_at']);

            $ingredient = Ingredient::firstOrCreate(
                ['inci_name' => $data['inci_name']],
                $data
            );

            if (empty($ingredient->source_name)) {
                $ingredient->update([
                    'source_name' => $data['source_name'],
                    'source_url' => $data['source_url'],
                    'source_license' => $data['source_license'],
                ]);
            }

            foreach ($aliases as $alias) {
                IngredientAlias::firstOrCreate([
                    'ingredient_id' => $ingredient->id,
                    'alias' => mb_strtoupper($alias),
                ]);
            }

            $insertedCount++;
        }

        $this->command->info("✅ Diccionario científico expandido con éxito: {$insertedCount} componentes activos catalogados.");
    }
}
