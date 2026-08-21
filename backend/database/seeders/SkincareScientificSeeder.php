<?php

namespace Database\Seeders;

use App\Models\AffiliateStore;
use App\Models\Brand;
use App\Models\ClinicalIndication;
use App\Models\Ingredient;
use App\Models\IngredientAlias;
use App\Models\IngredientConflict;
use App\Models\Product;
use App\Models\ProductStoreOffer;
use App\Models\PubMedStudy;
use App\Models\User;
use App\Models\UserRoutineItem;
use App\Models\UserSkinProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SkincareScientificSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Clinical Indications
        $indSebum = ClinicalIndication::create([
            'name' => 'Control de Sebo y Poros',
            'slug' => 'sebum-pore-control',
            'description' => 'Disminución de secreción sebácea y afinamiento de poros dilatados.',
        ]);

        $indAcne = ClinicalIndication::create([
            'name' => 'Tratamiento de Acné y Comedones',
            'slug' => 'acne-comedones',
            'description' => 'Acción queratolítica, descongestionante y antimicrobiana frente a C. acnes.',
        ]);

        $indWrinkles = ClinicalIndication::create([
            'name' => 'Líneas de Expresión y Envejecimiento',
            'slug' => 'anti-aging-wrinkles',
            'description' => 'Estimulación de síntesis de colágeno y aceleración del recambio epidérmico.',
        ]);

        $indHyperpigmentation = ClinicalIndication::create([
            'name' => 'Manchas e Hiperpigmentación',
            'slug' => 'hyperpigmentation-melasma',
            'description' => 'Inhibición de tirosinasa y bloqueo de transferencia de melanosomas.',
        ]);

        $indBarrier = ClinicalIndication::create([
            'name' => 'Reparación de la Barrera Cutánea',
            'slug' => 'barrier-repair',
            'description' => 'Reposición lipídica del estrato córneo y reducción de pérdida transepidérmica de agua (TEWL).',
        ]);

        $indRosacea = ClinicalIndication::create([
            'name' => 'Calmante de Rojeces y Rosácea',
            'slug' => 'rosacea-redness',
            'description' => 'Efecto antiinflamatorio vascular y modulación inmunológica.',
        ]);

        // 2. PubMed Studies
        $studyNiacinamide = PubMedStudy::create([
            'pmid' => '16029679',
            'title' => 'Niacinamide: A multi-functional skin care active with clinically proven efficacy on barrier function and hyperpigmentation',
            'journal' => 'Dermatologic Surgery',
            'pub_year' => 2005,
            'study_type' => 'RCT',
            'evidence_grade' => 'A',
            'url' => 'https://pubmed.ncbi.nlm.nih.gov/16029679/',
            'conclusions' => 'Significantly reduced fine lines, hyperpigmented spots, and skin redness with high tolerance.',
        ]);

        $studySalicylic = PubMedStudy::create([
            'pmid' => '24564883',
            'title' => 'Salicylic acid as a peeling agent: a comprehensive review of therapeutic indications in acne vulgaris',
            'journal' => 'Clinical, Cosmetic and Investigational Dermatology',
            'pub_year' => 2015,
            'study_type' => 'SYSTEMATIC_REVIEW',
            'evidence_grade' => 'A',
            'url' => 'https://pubmed.ncbi.nlm.nih.gov/24564883/',
            'conclusions' => 'Demonstrated potent lipophilic comedolytic and anti-inflammatory properties for comedonal acne.',
        ]);

        $studyRetinol = PubMedStudy::create([
            'pmid' => '31814674',
            'title' => 'Clinical evidence for anti-aging efficacy of topical retinol vs tretinoin: a randomized controlled trial',
            'journal' => 'Journal of Cosmetic Dermatology',
            'pub_year' => 2020,
            'study_type' => 'RCT',
            'evidence_grade' => 'A',
            'url' => 'https://pubmed.ncbi.nlm.nih.gov/31814674/',
            'conclusions' => 'Significant improvement in skin elasticity and reduction in optical wrinkle depth after 12 weeks.',
        ]);

        $studyAscorbic = PubMedStudy::create([
            'pmid' => '23742283',
            'title' => 'Topical Vitamin C and the skin: mechanisms of action and clinical applications in photoaging',
            'journal' => 'The Journal of Clinical and Aesthetic Dermatology',
            'pub_year' => 2013,
            'study_type' => 'REVIEW',
            'evidence_grade' => 'B',
            'url' => 'https://pubmed.ncbi.nlm.nih.gov/23742283/',
            'conclusions' => 'Topical L-ascorbic acid accelerates collagen biosynthesis and neutralizes oxidative free radicals.',
        ]);

        $studyCeramides = PubMedStudy::create([
            'pmid' => '33083541',
            'title' => 'The role of ceramides and physiological lipids in stratum corneum homeostasis and barrier repair',
            'journal' => 'Skin Pharmacology and Physiology',
            'pub_year' => 2020,
            'study_type' => 'CONTROLLED_CLINICAL_TRIAL',
            'evidence_grade' => 'B',
            'url' => 'https://pubmed.ncbi.nlm.nih.gov/33083541/',
            'conclusions' => 'Topical replenishment with Ceramide NP restored baseline TEWL within 72 hours.',
        ]);

        // 3. Core Ingredients (CosIng compliant)
        $aqua = Ingredient::create([
            'inci_name' => 'AQUA',
            'common_name' => 'Agua Purificada',
            'cas_number' => '7732-18-5',
            'cosing_id' => '31687',
            'description' => 'Solvente base cosmético universal.',
            'cosing_functions' => ['SOLVENT'],
            'comedogenic_rating' => 0,
            'irritation_rating' => 0,
            'is_active' => false,
            'layering_category' => 'WATER_BASED_SERUM',
        ]);

        $niacinamide = Ingredient::create([
            'inci_name' => 'NIACINAMIDE',
            'common_name' => 'Vitamina B3',
            'cas_number' => '98-92-0',
            'cosing_id' => '35688',
            'description' => 'Activo multifuncional que refuerza la síntesis de ceramidas, reduce sebo e inhibe la transferencia de melanosomas.',
            'cosing_functions' => ['SKIN CONDITIONING', 'SOOTHING', 'SMOOTHING'],
            'comedogenic_rating' => 0,
            'irritation_rating' => 0,
            'optimal_ph_min' => 5.0,
            'optimal_ph_max' => 7.0,
            'molecular_weight' => 122.12,
            'is_active' => true,
            'is_uv_sensitizing' => false,
            'requires_sunscreen' => false,
            'recommended_timing' => 'BOTH',
            'layering_category' => 'WATER_BASED_SERUM',
            'clinical_summary' => 'Disminución del 20-30% en producción de sebo y reducción de manchas a concentraciones del 2% al 10%.',
            'results_timeline_weeks_min' => 4,
            'results_timeline_weeks_max' => 8,
        ]);

        $salicylicAcid = Ingredient::create([
            'inci_name' => 'SALICYLIC ACID',
            'common_name' => 'Ácido Salicílico (BHA)',
            'cas_number' => '69-72-7',
            'cosing_id' => '37535',
            'description' => 'Beta-hidroxiácido liposoluble capaz de penetrar los conductos sebáceos para exfoliar el interior del poro.',
            'cosing_functions' => ['KERATOLYTIC', 'PRESERVATIVE', 'SKIN CONDITIONING'],
            'comedogenic_rating' => 0,
            'irritation_rating' => 1,
            'optimal_ph_min' => 3.0,
            'optimal_ph_max' => 4.0,
            'molecular_weight' => 138.12,
            'is_active' => true,
            'is_uv_sensitizing' => true,
            'requires_sunscreen' => true,
            'recommended_timing' => 'PM',
            'layering_category' => 'LOW_PH_TREATMENT',
            'clinical_summary' => 'Reducción de lesiones comedónicas y poros dilatados en 2 a 4 semanas.',
            'results_timeline_weeks_min' => 2,
            'results_timeline_weeks_max' => 4,
        ]);

        $retinol = Ingredient::create([
            'inci_name' => 'RETINOL',
            'common_name' => 'Retinol (Vitamina A)',
            'cas_number' => '68-26-8',
            'cosing_id' => '37402',
            'description' => 'Patrón oro antiedad. Acelera la proliferación celular y promueve la síntesis de colágeno dérmico.',
            'cosing_functions' => ['SKIN CONDITIONING'],
            'comedogenic_rating' => 0,
            'irritation_rating' => 3,
            'optimal_ph_min' => 5.5,
            'optimal_ph_max' => 6.5,
            'molecular_weight' => 286.45,
            'is_active' => true,
            'is_uv_sensitizing' => true,
            'requires_sunscreen' => true,
            'recommended_timing' => 'PM',
            'layering_category' => 'EMULSION_TREATMENT',
            'clinical_summary' => 'Eficacia clínica probada en reducción de arrugas, firmeza y textura en 8 a 12 semanas.',
            'results_timeline_weeks_min' => 8,
            'results_timeline_weeks_max' => 12,
        ]);

        $glycolicAcid = Ingredient::create([
            'inci_name' => 'GLYCOLIC ACID',
            'common_name' => 'Ácido Glicólico (AHA)',
            'cas_number' => '79-14-1',
            'cosing_id' => '33990',
            'description' => 'Alfa-hidroxiácido de menor peso molecular con intensa acción exfoliante y renovadora superficial.',
            'cosing_functions' => ['BUFFERING', 'EXFOLIANT'],
            'comedogenic_rating' => 0,
            'irritation_rating' => 2,
            'optimal_ph_min' => 3.0,
            'optimal_ph_max' => 3.8,
            'molecular_weight' => 76.05,
            'is_active' => true,
            'is_uv_sensitizing' => true,
            'requires_sunscreen' => true,
            'recommended_timing' => 'PM',
            'layering_category' => 'LOW_PH_TREATMENT',
            'clinical_summary' => 'Mejora de luminosidad en 1 semana y unificación de tono en 4-6 semanas.',
            'results_timeline_weeks_min' => 2,
            'results_timeline_weeks_max' => 6,
        ]);

        $ascorbicAcid = Ingredient::create([
            'inci_name' => 'ASCORBIC ACID',
            'common_name' => 'Ácido L-Ascórbico (Vitamina C Pura)',
            'cas_number' => '50-81-7',
            'cosing_id' => '31892',
            'description' => 'Potente antioxidante dérmico que neutraliza radicales libres e inhibe la melanogénesis.',
            'cosing_functions' => ['ANTIOXIDANT', 'SKIN CONDITIONING'],
            'comedogenic_rating' => 0,
            'irritation_rating' => 2,
            'optimal_ph_min' => 2.8,
            'optimal_ph_max' => 3.5,
            'molecular_weight' => 176.12,
            'is_active' => true,
            'is_uv_sensitizing' => false,
            'requires_sunscreen' => true,
            'recommended_timing' => 'AM',
            'layering_category' => 'LOW_PH_TREATMENT',
            'clinical_summary' => 'Protección fotodaño y luminosidad a partir de las 4 semanas.',
            'results_timeline_weeks_min' => 4,
            'results_timeline_weeks_max' => 8,
        ]);

        $ceramideNp = Ingredient::create([
            'inci_name' => 'CERAMIDE NP',
            'common_name' => 'Ceramida 3 (NP)',
            'cas_number' => '100403-19-8',
            'cosing_id' => '55232',
            'description' => 'Lípido epidérmico fisiológico fundamental para sellar la barrera cutánea.',
            'cosing_functions' => ['HAIR CONDITIONING', 'SKIN CONDITIONING'],
            'comedogenic_rating' => 0,
            'irritation_rating' => 0,
            'is_active' => true,
            'recommended_timing' => 'BOTH',
            'layering_category' => 'CREAM_OCCLUSIVE',
            'results_timeline_weeks_min' => 1,
            'results_timeline_weeks_max' => 4,
        ]);

        $zincPca = Ingredient::create([
            'inci_name' => 'ZINC PCA',
            'common_name' => 'Zinc PCA',
            'cas_number' => '15454-75-8',
            'cosing_id' => '39088',
            'description' => 'Sal de zinc seborreguladora y calmante con acción bacteriostática.',
            'cosing_functions' => ['HUMECTANT', 'SKIN CONDITIONING'],
            'comedogenic_rating' => 0,
            'irritation_rating' => 0,
            'is_active' => true,
            'layering_category' => 'WATER_BASED_SERUM',
        ]);

        $sodiumHyaluronate = Ingredient::create([
            'inci_name' => 'SODIUM HYALURONATE',
            'common_name' => 'Ácido Hialurónico',
            'cas_number' => '9067-32-7',
            'cosing_id' => '37885',
            'description' => 'Humectante biomimético capaz de retener hasta 1000 veces su peso en agua.',
            'cosing_functions' => ['HUMECTANT', 'SKIN CONDITIONING'],
            'comedogenic_rating' => 0,
            'irritation_rating' => 0,
            'is_active' => true,
            'layering_category' => 'WATER_BASED_SERUM',
        ]);

        // Aliases for OCR
        IngredientAlias::create(['ingredient_id' => $niacinamide->id, 'alias' => 'VITAMIN B3']);
        IngredientAlias::create(['ingredient_id' => $niacinamide->id, 'alias' => 'NICOTINAMIDE']);
        IngredientAlias::create(['ingredient_id' => $salicylicAcid->id, 'alias' => 'BHA']);
        IngredientAlias::create(['ingredient_id' => $salicylicAcid->id, 'alias' => 'ACIDO SALICILICO']);
        IngredientAlias::create(['ingredient_id' => $retinol->id, 'alias' => 'VITAMIN A']);
        IngredientAlias::create(['ingredient_id' => $ascorbicAcid->id, 'alias' => 'L-ASCORBIC ACID']);
        IngredientAlias::create(['ingredient_id' => $ascorbicAcid->id, 'alias' => 'VITAMINA C']);

        // Link Indications
        $niacinamide->indications()->attach([
            $indSebum->id => ['evidence_level' => 'A', 'effective_concentration_min' => 2.0, 'target_mechanism' => 'Inhibición de lipogénesis en sebocitos.'],
            $indHyperpigmentation->id => ['evidence_level' => 'A', 'effective_concentration_min' => 4.0, 'target_mechanism' => 'Bloqueo de transferencia de melanosomas a queratinocitos.'],
            $indBarrier->id => ['evidence_level' => 'A', 'effective_concentration_min' => 2.0, 'target_mechanism' => 'Estimulación de síntesis de ceramidas endógenas.'],
        ]);

        $salicylicAcid->indications()->attach([
            $indAcne->id => ['evidence_level' => 'A', 'effective_concentration_min' => 1.0, 'target_mechanism' => 'Disolución de tapones de queratina en el infundíbulo folicular.'],
            $indSebum->id => ['evidence_level' => 'A', 'effective_concentration_min' => 0.5, 'target_mechanism' => 'Limpieza lipofílica intraductal.'],
        ]);

        $retinol->indications()->attach([
            $indWrinkles->id => ['evidence_level' => 'A', 'effective_concentration_min' => 0.2, 'target_mechanism' => 'Activación de receptores nucleares RAR y síntesis de procolágeno I.'],
            $indAcne->id => ['evidence_level' => 'B', 'effective_concentration_min' => 0.3, 'target_mechanism' => 'Normalización de la descamación del estrato córneo.'],
        ]);

        $ascorbicAcid->indications()->attach([
            $indHyperpigmentation->id => ['evidence_level' => 'A', 'effective_concentration_min' => 10.0, 'target_mechanism' => 'Inhibición enzimática directa de la tirosinasa.'],
            $indWrinkles->id => ['evidence_level' => 'B', 'effective_concentration_min' => 5.0, 'target_mechanism' => 'Cofactor esencial de lisil y prolil hidroxilasas para colágeno.'],
        ]);

        $ceramideNp->indications()->attach([
            $indBarrier->id => ['evidence_level' => 'A', 'effective_concentration_min' => 0.1, 'target_mechanism' => 'Integración en la matriz bilaminar intercelular del estrato córneo.'],
            $indRosacea->id => ['evidence_level' => 'B', 'effective_concentration_min' => 0.2, 'target_mechanism' => 'Atenuación de hipersensibilidad reactiva.'],
        ]);

        // Link PubMed Studies
        $niacinamide->pubmedStudies()->attach($studyNiacinamide->id);
        $salicylicAcid->pubmedStudies()->attach($studySalicylic->id);
        $retinol->pubmedStudies()->attach($studyRetinol->id);
        $ascorbicAcid->pubmedStudies()->attach($studyAscorbic->id);
        $ceramideNp->pubmedStudies()->attach($studyCeramides->id);

        // 4. Chemical Conflicts & Incompatibilities
        IngredientConflict::create([
            'ingredient_a_id' => $retinol->id,
            'ingredient_b_id' => $glycolicAcid->id,
            'conflict_type' => 'IRRITATION_OVERLOAD',
            'severity' => 'HIGH',
            'warning_message' => 'Conflicto de sobre-irritación: Retinol + Ácido Glicólico (AHA).',
            'clinical_rationale' => 'La combinación simultánea de exfoliación ácida y aumento del recambio celular retinóico compromete severamente la barrera lipídica, provocando eritema, descamación y dermatitis por contacto.',
            'mitigation_strategy' => 'Alternar en noches separadas aplicando la técnica de Skin Cycling (Noche 1: AHA, Noche 2: Retinol, Noches 3-4: Recuperación).',
        ]);

        IngredientConflict::create([
            'ingredient_a_id' => $retinol->id,
            'ingredient_b_id' => $salicylicAcid->id,
            'conflict_type' => 'IRRITATION_OVERLOAD',
            'severity' => 'MODERATE',
            'warning_message' => 'Precaución de sequedad: Retinol + Ácido Salicílico (BHA).',
            'clinical_rationale' => 'Riesgo acumulativo de deslipidización y xerosis cutánea al combinarse en la misma aplicación.',
            'mitigation_strategy' => 'Usar Salicylic Acid en la rutina matutina (AM) o en días alternos, reservando el Retinol para la noche (PM).',
        ]);

        IngredientConflict::create([
            'ingredient_a_id' => $ascorbicAcid->id,
            'ingredient_b_id' => $niacinamide->id,
            'conflict_type' => 'PH_INCOMPATIBILITY',
            'severity' => 'LOW',
            'warning_message' => 'Diferencia de pH óptimo: Ácido L-Ascórbico puro + Niacinamida.',
            'clinical_rationale' => 'El Ácido L-Ascórbico puro requiere pH < 3.5 para penetrar, mientras la Niacinamida es óptima a pH 5.0-7.0. A pH extremadamente bajo y calor, puede generarse ácido nicotínico transitorio (rubor).',
            'mitigation_strategy' => 'Aplicar Vitamina C en la mañana (AM) y Niacinamida en la noche (PM), o dejar secar 10-15 minutos entre capas.',
        ]);

        // 5. Brands & Real Market Products
        $brandTO = Brand::create([
            'name' => 'The Ordinary',
            'slug' => 'the-ordinary',
            'logo_url' => 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=100',
            'country_origin' => 'Canada',
        ]);

        $brandPC = Brand::create([
            'name' => "Paula's Choice",
            'slug' => 'paulas-choice',
            'logo_url' => 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=100',
            'country_origin' => 'USA',
        ]);

        $brandCeraVe = Brand::create([
            'name' => 'CeraVe',
            'slug' => 'cerave',
            'logo_url' => 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=100',
            'country_origin' => 'USA',
        ]);

        // Product 1: The Ordinary Niacinamide 10% + Zinc 1%
        $prodNiacinamide = Product::create([
            'brand_id' => $brandTO->id,
            'name' => 'Niacinamide 10% + Zinc 1%',
            'slug' => 'the-ordinary-niacinamide-10-zinc-1',
            'barcode_ean' => '769915190311',
            'category' => 'SERUM',
            'volume_amount' => 30.0,
            'volume_unit' => 'ml',
            'container_type' => 'BOTTLE_DROPPER',
            'pao_months' => 12,
            'dosage_per_application_ml' => 0.40,
            'recommended_timing' => 'BOTH',
            'texture_type' => 'WATER_BASED_SERUM',
            'ph_level' => 5.5,
            'image_url' => 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
            'description' => 'Fórmula concentrada de vitaminas y minerales para combatir imperfecciones y regular el sebo.',
        ]);

        $prodNiacinamide->ingredients()->attach([
            $aqua->id => ['position' => 1, 'concentration_percentage' => 80.0, 'is_declared_active' => false],
            $niacinamide->id => ['position' => 2, 'concentration_percentage' => 10.0, 'is_declared_active' => true],
            $zincPca->id => ['position' => 3, 'concentration_percentage' => 1.0, 'is_declared_active' => true],
        ]);

        // Product 2: Paula's Choice 2% BHA Liquid
        $prodBha = Product::create([
            'brand_id' => $brandPC->id,
            'name' => 'Skin Perfecting 2% BHA Liquid Exfoliant',
            'slug' => 'paulas-choice-skin-perfecting-2-bha-liquid',
            'barcode_ean' => '655439020108',
            'category' => 'EXFOLIANT',
            'volume_amount' => 118.0,
            'volume_unit' => 'ml',
            'container_type' => 'BOTTLE_DROPPER',
            'pao_months' => 12,
            'dosage_per_application_ml' => 0.80,
            'recommended_timing' => 'PM',
            'texture_type' => 'LOW_PH_TREATMENT',
            'ph_level' => 3.5,
            'image_url' => 'https://images.unsplash.com/photo-1608248597359-5984687d6056?w=400',
            'description' => 'Exfoliante líquido de culto con ácido salicílico para desobstruir poros y eliminar células muertas.',
        ]);

        $prodBha->ingredients()->attach([
            $aqua->id => ['position' => 1, 'concentration_percentage' => 70.0, 'is_declared_active' => false],
            $salicylicAcid->id => ['position' => 2, 'concentration_percentage' => 2.0, 'is_declared_active' => true],
        ]);

        // Product 3: The Ordinary Retinol 0.5% in Squalane
        $prodRetinol = Product::create([
            'brand_id' => $brandTO->id,
            'name' => 'Retinol 0.5% in Squalane',
            'slug' => 'the-ordinary-retinol-0-5-squalane',
            'barcode_ean' => '769915190625',
            'category' => 'SERUM',
            'volume_amount' => 30.0,
            'volume_unit' => 'ml',
            'container_type' => 'BOTTLE_DROPPER',
            'pao_months' => 3,
            'dosage_per_application_ml' => 0.35,
            'recommended_timing' => 'PM',
            'texture_type' => 'OIL',
            'image_url' => 'https://images.unsplash.com/photo-1608248597359-5984687d6056?w=400',
            'description' => 'Solución libre de agua con 0.5% de retinol puro para combatir signos generales del fotoenvejecimiento.',
        ]);

        $prodRetinol->ingredients()->attach([
            $retinol->id => ['position' => 1, 'concentration_percentage' => 0.5, 'is_declared_active' => true],
        ]);

        // 6. Affiliate Stores and Offers
        $storeSephora = AffiliateStore::create([
            'name' => 'Sephora España',
            'slug' => 'sephora-es',
            'website_url' => 'https://www.sephora.es',
            'store_type' => 'HYBRID',
            'country_code' => 'ES',
            'affiliate_network' => 'Awin',
        ]);

        $storeAmazon = AffiliateStore::create([
            'name' => 'Amazon Prime',
            'slug' => 'amazon-es',
            'website_url' => 'https://www.amazon.es',
            'store_type' => 'ONLINE',
            'country_code' => 'ES',
            'affiliate_network' => 'Amazon Associates',
        ]);

        $storePromofarma = AffiliateStore::create([
            'name' => 'PromoFarma Farmacias Locales',
            'slug' => 'promofarma',
            'website_url' => 'https://www.promofarma.com',
            'store_type' => 'HYBRID',
            'country_code' => 'ES',
            'affiliate_network' => 'PromoFarma Affiliate',
        ]);

        ProductStoreOffer::create([
            'product_id' => $prodNiacinamide->id,
            'store_id' => $storeSephora->id,
            'product_url' => 'https://www.sephora.es/p/niacinamide-10-zinc-1-P2970014.html',
            'affiliate_url' => 'https://www.sephora.es/p/niacinamide-10-zinc-1-P2970014.html?aff=skinaudit_101',
            'price' => 6.60,
            'currency' => 'EUR',
            'in_stock' => true,
        ]);

        ProductStoreOffer::create([
            'product_id' => $prodNiacinamide->id,
            'store_id' => $storeAmazon->id,
            'product_url' => 'https://www.amazon.es/dp/B071D58ZYV',
            'affiliate_url' => 'https://www.amazon.es/dp/B071D58ZYV?tag=skinaudit-21',
            'price' => 6.90,
            'currency' => 'EUR',
            'in_stock' => true,
        ]);

        ProductStoreOffer::create([
            'product_id' => $prodBha->id,
            'store_id' => $storePromofarma->id,
            'product_url' => 'https://www.promofarma.com/paulas-choice-bha',
            'affiliate_url' => 'https://www.promofarma.com/paulas-choice-bha?partner=skinaudit',
            'price' => 38.00,
            'currency' => 'EUR',
            'in_stock' => true,
        ]);

        // 7. Demo User with Skin Profile & Active Routine
        $demoUser = User::create([
            'name' => 'Dra. Sofía Mendoza',
            'email' => 'sofia@skinaudit.io',
            'password' => Hash::make('password123'),
        ]);

        UserSkinProfile::create([
            'user_id' => $demoUser->id,
            'skin_type' => 'COMBINATION',
            'fitzpatrick_type' => 3,
            'barrier_status' => 'HEALTHY',
            'active_conditions' => ['ACNE', 'SEBUM_EXCESS'],
            'known_allergens' => ['FRAGRANCE', 'LINALOOL'],
            'sun_exposure_level' => 'MODERATE',
            'pregnancy_or_nursing' => false,
        ]);

        UserRoutineItem::create([
            'user_id' => $demoUser->id,
            'product_id' => $prodNiacinamide->id,
            'slot' => 'AM',
            'cycle_type' => 'EVERYDAY',
            'step_order' => 1,
            'opened_at' => now()->subDays(20),
            'notes' => 'Aplicar 4 gotas en rostro y cuello antes del hidratante.',
        ]);

        UserRoutineItem::create([
            'user_id' => $demoUser->id,
            'product_id' => $prodBha->id,
            'slot' => 'PM',
            'cycle_type' => 'EXFOLIATION_NIGHT',
            'step_order' => 1,
            'opened_at' => now()->subDays(15),
            'notes' => 'Noche 1 de Skin Cycling con disco de algodón.',
        ]);

        UserRoutineItem::create([
            'user_id' => $demoUser->id,
            'product_id' => $prodRetinol->id,
            'slot' => 'PM',
            'cycle_type' => 'RETINOID_NIGHT',
            'step_order' => 1,
            'opened_at' => now()->subDays(10),
            'notes' => 'Noche 2 de Skin Cycling (3 gotas sobre piel seca).',
        ]);
    }
}
