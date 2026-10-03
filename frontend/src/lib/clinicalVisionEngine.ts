/**
 * Allabout.skin - Clinical Vision & Facial Dermatology Governance Engine
 * 
 * Basado en literatura médica y dermatológica internacional:
 * - Leslie Baumann Skin Type Indicator (BSTI) (J Cosmet Dermatol, 2006; Cosmetic Dermatology, McGraw-Hill, 2009)
 * - Fitzpatrick Skin Phototyping System (Fitzpatrick TB, Arch Dermatol, 1988)
 * - Computer Vision in Clinical Dermatology & Facial Anatomical Landmarks (JEADV / JAAD / IEEE BioMed)
 */

export type AnatomicalClassificationType =
  | 'HUMAN_FACE'
  | 'HAND_OR_ARM'
  | 'FOOT_OR_LEG'
  | 'TORSO_OR_BACK'
  | 'OCCLUDED_OR_INCOMPLETE_FACE'
  | 'COSMETIC_PRODUCT'
  | 'ANIMAL_OR_PET'
  | 'NON_BIOLOGICAL_OBJECT'
  | 'UNREADABLE_OR_POOR_QUALITY';

export type ClinicalRejectionCode =
  | 'INVALID_ANATOMY_HAND'
  | 'INVALID_ANATOMY_FOOT_LEG'
  | 'INVALID_ANATOMY_TORSO_BACK'
  | 'INVALID_ANATOMY_OCCLUDED_FACE'
  | 'INVALID_NON_HUMAN'
  | 'INVALID_OBJECT_ENVIRONMENT'
  | 'INVALID_IMAGE_QUALITY'
  | 'NOT_COSMETIC_OR_FACE';

export type SebumReflectanceLevel = 'NONE' | 'LOW' | 'MODERATE' | 'HIGH';
export type FollicularOstiaLevel = 'MINIMAL_INCONSPICUOUS' | 'VISIBLE_T_ZONE' | 'DIFFUSE_WIDE';
export type ErythemaLevel = 'ABSENT' | 'LOCALIZED_MILD' | 'DIFFUSE_MODERATE' | 'ACUTE_SEVERE';
export type DesquamationLevel = 'NONE' | 'MILD_LOCALIZED' | 'MARKED_GENERALIZED';
export type SkinHydrationState = 'DRY' | 'NORMAL' | 'BALANCED' | 'DEHYDRATED';
export type FitzpatrickScale = 1 | 2 | 3 | 4 | 5 | 6;

// Biomarcadores extendidos para análisis estético-cosmético avanzado
export type DarkCirclesClassification =
  | 'NONE_OR_MINIMAL'
  | 'VASCULAR' // Azulada/violácea (microcirculación y piel fina)
  | 'PIGMENTARY' // Marrón/parda (acumulación melánica)
  | 'STRUCTURAL_SHADOW' // Sombra por depresión anatómica / surco lagrimal
  | 'MIXED';

export type HyperpigmentationLevel =
  | 'NONE_OR_UNIFORM'
  | 'MILD_SUPERFICIAL'
  | 'POST_INFLAMMATORY' // HPI residual
  | 'MODERATE_DIFFUSE';

export type TextureAndLinesLevel =
  | 'SMOOTH'
  | 'FINE_DEHYDRATION_LINES'
  | 'DYNAMIC_EXPRESSION_LINES'
  | 'MODERATE_STATIC_LINES';

export type ActiveLesionRisk =
  | 'NONE'
  | 'SUPERFICIAL_BLEMISHES'
  | 'SEVERE_CYSTIC_OR_NODULAR'
  | 'OPEN_WOUND_OR_DISRUPTION';

export type ClinicalTriageLevel =
  | 'COSMETIC_MAINTENANCE'
  | 'COSMETIC_ACTIVE'
  | 'DERMATOLOGY_REFERRAL_RECOMMENDED';

export interface ClinicalTriageEvaluation {
  triageLevel: ClinicalTriageLevel;
  medicalReferralRecommended: boolean;
  referralReason: string | null;
  suggestedMedicalSpecialty: string | null;
  safetyAlerts: string[];
  blockedIngredientCategories: string[];
  safeRecommendedActives: string[];
  patchTestRequired: boolean;
}

export interface PeriorbitalEvaluation {
  darkCirclesType: DarkCirclesClassification;
  severity: 'NONE' | 'MILD' | 'MODERATE' | 'MARKED';
  description: string;
  suggestedActives: string[];
}

export interface PigmentationEvaluation {
  level: HyperpigmentationLevel;
  description: string;
  suggestedActives: string[];
  sunProtectionGuidance: string;
}

export interface TextureAndLinesEvaluation {
  level: TextureAndLinesLevel;
  description: string;
  suggestedActives: string[];
}

export interface NormalizedBoundingBox {
  top: number; // percentage 0 - 100
  left: number; // percentage 0 - 100
  width: number; // percentage 0 - 100
  height: number; // percentage 0 - 100
}

export interface FaceRegionsCoordinates {
  faceBox: NormalizedBoundingBox;
  zoneTBox: NormalizedBoundingBox;
  leftCheekBox: NormalizedBoundingBox;
  rightCheekBox: NormalizedBoundingBox;
}

export interface ExtractedClinicalBiomarkers {
  detectedAnatomy: AnatomicalClassificationType;
  confidence: number;
  landmarks: {
    bilateralEyesVisible: boolean;
    nasalDorsumVisible: boolean;
    oralCommissureVisible: boolean;
    malarCheeksVisible: boolean;
    foreheadVisible: boolean;
  };
  faceRegions?: Partial<FaceRegionsCoordinates>;
  opticalBiomarkers?: {
    tZoneSebumReflectance: SebumReflectanceLevel;
    cheeksSebumReflectance: SebumReflectanceLevel;
    follicularOstiaPores: FollicularOstiaLevel;
    erythemaMalarIndex: ErythemaLevel;
    stratumCorneumDesquamation: DesquamationLevel;
    fitzpatrickPhototypeEstimate: FitzpatrickScale;
    visibleEtiologies?: string[];
    darkCirclesType?: DarkCirclesClassification;
    darkCirclesSeverity?: 'NONE' | 'MILD' | 'MODERATE' | 'MARKED';
    hyperpigmentationLevel?: HyperpigmentationLevel;
    textureAndLinesLevel?: TextureAndLinesLevel;
    activeLesionRisk?: ActiveLesionRisk;
  };
  productData?: {
    brand: string | null;
    productName: string | null;
    inciText: string;
    rawDetectedText: string;
    notes: string[];
  };
  rejectionDiagnosticNotes?: string[];
}

export interface ClinicalSkinEvaluationResult {
  classification: 'HUMAN_FACE';
  confidence: number;
  faceAnalysis: {
    skinTypeEstimate: 'OILY' | 'DRY' | 'COMBINATION' | 'SENSITIVE' | 'NORMAL';
    skinTypeLabel: string;
    baumannSkinTypeCode: string; // e.g. OSPW, ORNT, DSNW, DRNT, etc.
    fitzpatrickType: FitzpatrickScale;
    faceRegions: FaceRegionsCoordinates;
    zoneTAnalysis: {
      shineLevel: 'HIGH' | 'MODERATE' | 'LOW';
      poresVisible: boolean;
      description: string;
    };
    cheeksAnalysis: {
      hydrationState: 'DRY' | 'NORMAL' | 'BALANCED';
      rednessPresent: boolean;
      description: string;
    };
    periorbitalAnalysis: PeriorbitalEvaluation;
    pigmentationAnalysis: PigmentationEvaluation;
    textureAndLinesAnalysis: TextureAndLinesEvaluation;
    triage: ClinicalTriageEvaluation;
    biomarkers: {
      tZoneSebum: SebumReflectanceLevel;
      cheeksSebum: SebumReflectanceLevel;
      poreProminence: FollicularOstiaLevel;
      erythemaIndex: ErythemaLevel;
      desquamation: DesquamationLevel;
    };
    visibleConcerns: string[];
    suggestedFocus: string[];
    clinicalRationale: string;
    scientificReferences: string[];
    confidence: number;
    disclaimer: string;
    patchTestGuidance: string;
  };
}

export interface SkincareProductEvaluationResult {
  classification: 'SKINCARE_PRODUCT';
  brand: string | null;
  productName: string | null;
  inciText: string;
  rawDetectedText: string;
  confidence: number;
  notes: string[];
}

export interface RejectionEvaluationResult {
  classification: 'INVALID';
  rejectionReason: ClinicalRejectionCode;
  rejectionTitle: string;
  userFriendlyMessage: string;
  guidanceTips: string[];
  confidence: number;
}

export type GovernedVisionResult =
  | ClinicalSkinEvaluationResult
  | SkincareProductEvaluationResult
  | RejectionEvaluationResult;

/**
 * Metadata and educational guidelines for each rejection reason.
 */
export const CLINICAL_REJECTIONS_CATALOG: Record<
  ClinicalRejectionCode,
  { title: string; message: string; tips: string[] }
> = {
  INVALID_ANATOMY_HAND: {
    title: 'Mano o Extremidad Detectada',
    message:
      'Detectamos una mano o piel no facial. Conforme al protocolo clínico de Allabout.skin, el diagnóstico dermatológico está calibrado exclusivamente para el rostro.',
    tips: [
      'Tómate una selfie frontal clara enfocando tu cara completa.',
      'Asegúrate de que frente, mejillas, nariz y mentón sean visibles.',
      'Evita colocar las manos tapando partes de tu rostro.',
    ],
  },
  INVALID_ANATOMY_FOOT_LEG: {
    title: 'Pie o Pierna Detectada',
    message:
      'Detectamos un pie o pierna. El protocolo actual evalúa exclusivamente el biotipo y manto hidrolipídico facial.',
    tips: [
      'Tómate una fotografía frontal de tu rostro.',
      'Utiliza buena luz natural difusa (frente a una ventana).',
      'Mantén la cámara a la altura de tus ojos.',
    ],
  },
  INVALID_ANATOMY_TORSO_BACK: {
    title: 'Espalda o Torso Corporal Detectado',
    message:
      'Detectamos la espalda, pecho, torso o cuello aislado. La evaluación cutánea requiere el análisis del triángulo facial (frente, zona T y mejillas).',
    tips: [
      'Captura una selfie frontal centrada en tu rostro.',
      'Retira cabello o accesorios que tapen tu frente o mejillas.',
    ],
  },
  INVALID_ANATOMY_OCCLUDED_FACE: {
    title: 'Rostro Parcialmente Ocluido o Incompleto',
    message:
      'El rostro no es completamente visible. Se detectaron gafas de sol oscuras, mascarilla, barbijo, cabello excesivo o un encuadre cortado.',
    tips: [
      'Retira gafas de sol, mascarillas o prendas que cubran tu cara.',
      'Despeja el cabello de la frente y los pómulos.',
      'Encuadra tu rostro completo en el centro de la cámara.',
    ],
  },
  INVALID_NON_HUMAN: {
    title: 'No se detectó un Rostro Humano Real',
    message:
      'La imagen contiene una mascota, animal, dibujo animado, ilustración o avatar que no corresponde a un ser humano real.',
    tips: [
      'Sube una fotografía real de una persona sin filtros ni caricaturización.',
    ],
  },
  INVALID_OBJECT_ENVIRONMENT: {
    title: 'Objeto o Entorno no Válido',
    message:
      'No hemos detectado un producto de skincare ni el rostro de una persona en la foto. Se detectaron objetos, muebles o fondo sin elementos cosméticos.',
    tips: [
      'Para auditar un cosmético: enfoca la lista de ingredientes (INCI) o el frasco.',
      'Para evaluar tu piel: tómate una selfie frontal con buena luz.',
    ],
  },
  INVALID_IMAGE_QUALITY: {
    title: 'Iluminación o Calidad Insuficiente',
    message:
      'La fotografía presenta iluminación muy baja (<15 lux), sobreexposición extrema por flash directo o desenfoque de movimiento severo.',
    tips: [
      'Busca luz natural de día o una habitación bien iluminada.',
      'Evita usar el flash directo a pocos centímetros.',
      'Mantén el teléfono firme al momento de disparar.',
    ],
  },
  NOT_COSMETIC_OR_FACE: {
    title: 'Imagen no Reconocida',
    message:
      'No pudimos identificar un cosmético reconocible ni un rostro en la fotografía provista.',
    tips: [
      'Enfoca claramente la etiqueta posterior de tu producto cosmético.',
      'O captura una selfie de tu rostro para analizar tu biotipo cutáneo.',
    ],
  },
};

/**
 * Normalizes bounding box coordinates regardless of whether the vision model
 * outputs 0-1000 integer scale (standard Gemini bounding box detection),
 * 0.0-1.0 float scale, or 0-100 percentage.
 */
function normalizeCoordinateBox(
  box?: Partial<NormalizedBoundingBox> | null
): NormalizedBoundingBox | undefined {
  if (
    !box ||
    typeof box.width !== 'number' ||
    typeof box.height !== 'number' ||
    typeof box.top !== 'number' ||
    typeof box.left !== 'number'
  ) {
    return undefined;
  }

  let { top, left, width, height } = box;

  // 1. Detect 0-1000 scale (typical Gemini bounding box coordinates e.g., top = 218, width = 214)
  if (top > 100 || left > 100 || width > 100 || height > 100) {
    top = top / 10;
    left = left / 10;
    width = width / 10;
    height = height / 10;
  }
  // 2. Detect 0.0 - 1.0 float normalized scale (e.g., top = 0.218, width = 0.214)
  else if (top <= 1.0 && left <= 1.0 && width <= 1.0 && height <= 1.0 && (width > 0 || height > 0)) {
    top = top * 100;
    left = left * 100;
    width = width * 100;
    height = height * 100;
  }

  // Ensure minimum valid size
  if (width < 4 || height < 4) {
    return undefined;
  }

  const cleanTop = Math.max(0, Math.min(85, Math.round(top)));
  const cleanLeft = Math.max(0, Math.min(85, Math.round(left)));
  const cleanWidth = Math.max(5, Math.min(100 - cleanLeft, Math.round(width)));
  const cleanHeight = Math.max(5, Math.min(100 - cleanTop, Math.round(height)));

  return {
    top: cleanTop,
    left: cleanLeft,
    width: cleanWidth,
    height: cleanHeight,
  };
}

/**
 * Derives and normalizes facial anatomical zones (Zone T, Malar Cheeks)
 * with Da Vinci / Farkas neoclassical facial third proportions.
 */
export function deriveFaceRegions(
  extractedRegions?: Partial<FaceRegionsCoordinates>
): FaceRegionsCoordinates {
  // Standard portrait selfie neoclassical framing default
  const defaultFace: NormalizedBoundingBox = { top: 12, left: 18, width: 64, height: 72 };
  const rawFace = normalizeCoordinateBox(extractedRegions?.faceBox);

  // Validate that faceBox is plausible (e.g. not pushed against far corner, reasonable dimensions)
  const isPlausibleFace =
    rawFace &&
    rawFace.width >= 15 &&
    rawFace.height >= 15 &&
    rawFace.top <= 65 &&
    rawFace.left <= 70;

  const faceBox: NormalizedBoundingBox = isPlausibleFace ? rawFace! : defaultFace;

  // Proportional anatomical derivations based on faceBox:
  // Zone T spans upper third (forehead) and central bridge (nasal dorsum)
  const derivedZoneT: NormalizedBoundingBox = {
    top: Math.max(0, Math.round(faceBox.top + faceBox.height * 0.04)),
    left: Math.max(0, Math.round(faceBox.left + faceBox.width * 0.25)),
    width: Math.min(100, Math.round(faceBox.width * 0.50)),
    height: Math.min(100, Math.round(faceBox.height * 0.48)),
  };

  // Left cheek in image (viewer's left side)
  const derivedLeftCheek: NormalizedBoundingBox = {
    top: Math.max(0, Math.round(faceBox.top + faceBox.height * 0.38)),
    left: Math.max(0, Math.round(faceBox.left + faceBox.width * 0.06)),
    width: Math.min(100, Math.round(faceBox.width * 0.30)),
    height: Math.min(100, Math.round(faceBox.height * 0.28)),
  };

  // Right cheek in image (viewer's right side)
  const derivedRightCheek: NormalizedBoundingBox = {
    top: Math.max(0, Math.round(faceBox.top + faceBox.height * 0.38)),
    left: Math.max(0, Math.round(faceBox.left + faceBox.width * 0.64)),
    width: Math.min(100, Math.round(faceBox.width * 0.30)),
    height: Math.min(100, Math.round(faceBox.height * 0.28)),
  };

  // Normalize extracted sub-zones if provided, or derive anatomically
  const rawZoneT = normalizeCoordinateBox(extractedRegions?.zoneTBox);
  const rawLeftCheek = normalizeCoordinateBox(extractedRegions?.leftCheekBox);
  const rawRightCheek = normalizeCoordinateBox(extractedRegions?.rightCheekBox);

  // Validate that sub-zones are within plausible range of the face
  const isInsideFace = (box?: NormalizedBoundingBox) =>
    box &&
    box.left >= Math.max(0, faceBox.left - 12) &&
    box.left + box.width <= Math.min(100, faceBox.left + faceBox.width + 12) &&
    box.top >= Math.max(0, faceBox.top - 12) &&
    box.top + box.height <= Math.min(100, faceBox.top + faceBox.height + 12);

  return {
    faceBox,
    zoneTBox: (rawZoneT && isInsideFace(rawZoneT)) ? rawZoneT : derivedZoneT,
    leftCheekBox: (rawLeftCheek && isInsideFace(rawLeftCheek)) ? rawLeftCheek : derivedLeftCheek,
    rightCheekBox: (rawRightCheek && isInsideFace(rawRightCheek)) ? rawRightCheek : derivedRightCheek,
  };
}

/**
 * Deterministic Governance Pipeline:
 * Evaluates extracted clinical biomarkers according to Baumann Skin Typing (BSTI)
 * and Fitzpatrick phototyping guidelines, enforcing strict anatomical gating.
 */
export function governAndClassifyBiomarkers(
  extracted: ExtractedClinicalBiomarkers
): GovernedVisionResult {
  const { detectedAnatomy, landmarks, faceRegions, opticalBiomarkers, productData, confidence } = extracted;

  // 1. PRODUCT ROUTE
  if (detectedAnatomy === 'COSMETIC_PRODUCT') {
    return {
      classification: 'SKINCARE_PRODUCT',
      brand: productData?.brand || null,
      productName: productData?.productName || null,
      inciText: productData?.inciText || '',
      rawDetectedText: productData?.rawDetectedText || '',
      confidence: Math.max(0.7, confidence || 0.95),
      notes: productData?.notes || [],
    };
  }

  // 2. STRICT ANATOMICAL REJECTION GATING
  if (detectedAnatomy === 'HAND_OR_ARM') {
    return createRejection('INVALID_ANATOMY_HAND', confidence);
  }
  if (detectedAnatomy === 'FOOT_OR_LEG') {
    return createRejection('INVALID_ANATOMY_FOOT_LEG', confidence);
  }
  if (detectedAnatomy === 'TORSO_OR_BACK') {
    return createRejection('INVALID_ANATOMY_TORSO_BACK', confidence);
  }
  if (detectedAnatomy === 'ANIMAL_OR_PET') {
    return createRejection('INVALID_NON_HUMAN', confidence);
  }
  if (detectedAnatomy === 'NON_BIOLOGICAL_OBJECT') {
    return createRejection('INVALID_OBJECT_ENVIRONMENT', confidence);
  }
  if (detectedAnatomy === 'UNREADABLE_OR_POOR_QUALITY') {
    return createRejection('INVALID_IMAGE_QUALITY', confidence);
  }
  if (detectedAnatomy === 'OCCLUDED_OR_INCOMPLETE_FACE') {
    return createRejection('INVALID_ANATOMY_OCCLUDED_FACE', confidence);
  }

  // If claimed to be HUMAN_FACE, verify mandatory facial landmarks
  if (detectedAnatomy === 'HUMAN_FACE') {
    const visibleCount = landmarks
      ? [
          landmarks.bilateralEyesVisible,
          landmarks.nasalDorsumVisible,
          landmarks.oralCommissureVisible,
          landmarks.malarCheeksVisible,
          landmarks.foreheadVisible,
        ].filter(Boolean).length
      : 0;

    const hasMandatoryFeatures =
      landmarks &&
      (
        // Primary: Both eyes and nasal bridge are visible
        (landmarks.bilateralEyesVisible && landmarks.nasalDorsumVisible) ||
        // Secondary: At least 3 of the 5 key facial landmarks are visible (supports beards, mustaches, smiling, hair fringes)
        visibleCount >= 3
      );

    if (!hasMandatoryFeatures) {
      return createRejection('INVALID_ANATOMY_OCCLUDED_FACE', confidence);
    }
  } else {
    // Unknown or invalid anatomy
    return createRejection('NOT_COSMETIC_OR_FACE', confidence);
  }

  // 3. DETERMINISTIC CLINICAL EVALUATION (Baumann BSTI + Fitzpatrick)
  const bio = opticalBiomarkers || {
    tZoneSebumReflectance: 'MODERATE',
    cheeksSebumReflectance: 'LOW',
    follicularOstiaPores: 'VISIBLE_T_ZONE',
    erythemaMalarIndex: 'ABSENT',
    stratumCorneumDesquamation: 'NONE',
    fitzpatrickPhototypeEstimate: 3,
  };

  const tZoneSebum = bio.tZoneSebumReflectance || 'MODERATE';
  const cheeksSebum = bio.cheeksSebumReflectance || 'LOW';
  const pores = bio.follicularOstiaPores || 'VISIBLE_T_ZONE';
  const erythema = bio.erythemaMalarIndex || 'ABSENT';
  const desquamation = bio.stratumCorneumDesquamation || 'NONE';
  const fitzpatrick = (bio.fitzpatrickPhototypeEstimate >= 1 && bio.fitzpatrickPhototypeEstimate <= 6)
    ? bio.fitzpatrickPhototypeEstimate
    : 3;

  // DETERMINISTIC CLASSIFICATION LOGIC
  let skinTypeEstimate: 'OILY' | 'DRY' | 'COMBINATION' | 'SENSITIVE' | 'NORMAL';
  let skinTypeLabel: string;
  let baumannCodePrefix: string;
  let clinicalRationale: string;
  let zoneTShine: 'HIGH' | 'MODERATE' | 'LOW';
  let zoneTPoresVisible: boolean;
  let zoneTDesc: string;
  let cheeksHydration: 'DRY' | 'NORMAL' | 'BALANCED';
  let cheeksRedness: boolean;
  let cheeksDesc: string;
  let visibleConcerns: string[] = [];
  let suggestedFocus: string[] = [];

  // Criterion A: SENSITIVE SKIN (Baumann Axis 2 - Sensitive [S])
  const isErythematous = erythema === 'DIFFUSE_MODERATE' || erythema === 'ACUTE_SEVERE';
  
  // Criterion B: OILY SKIN (Baumann Axis 1 - Oily [O])
  const isGeneralizedOily =
    (tZoneSebum === 'HIGH' && (cheeksSebum === 'HIGH' || cheeksSebum === 'MODERATE')) ||
    (tZoneSebum === 'MODERATE' && cheeksSebum === 'HIGH' && pores === 'DIFFUSE_WIDE');

  // Criterion C: DRY SKIN (Baumann Axis 1 - Dry [D])
  const isGeneralizedDry =
    (tZoneSebum === 'NONE' || tZoneSebum === 'LOW') &&
    (cheeksSebum === 'NONE') &&
    (desquamation !== 'NONE' || pores === 'MINIMAL_INCONSPICUOUS');

  // Criterion D: COMBINATION SKIN (Baumann Axis 1 - Bimodal O/D Contrast)
  const isCombinationSkin =
    (tZoneSebum === 'HIGH' || tZoneSebum === 'MODERATE') &&
    (cheeksSebum === 'LOW' || cheeksSebum === 'NONE');

  if (isErythematous && tZoneSebum !== 'HIGH') {
    // SENSITIVE SKIN PRIMARY
    skinTypeEstimate = 'SENSITIVE';
    skinTypeLabel = 'Piel Sensible y Reactiva (Eritema Malar / Barrera Vulnerable)';
    baumannCodePrefix = 'S';
    clinicalRationale = `Hiperreactividad vascular y eritema cutáneo moderado-severo en zona malar según escala Baumann BSTI. Manto hidrolipídico con permeabilidad alterada.`;
    zoneTShine = tZoneSebum === 'MODERATE' ? 'MODERATE' : 'LOW';
    zoneTPoresVisible = pores !== 'MINIMAL_INCONSPICUOUS';
    zoneTDesc = `Zona T con reactividad y reflectancia ${tZoneSebum.toLowerCase()}.`;
    cheeksHydration = 'DRY';
    cheeksRedness = true;
    cheeksDesc = `Eritema vascular difuso en pómulos y mejillas. Signos de reactividad capilar y fragilidad dérmica.`;
    visibleConcerns = ['Eritema y rojeces localizadas', 'Sensación de tirantez o ardor', 'Barrera cutánea vulnerable'];
    suggestedFocus = [
      'Centella Asiática (Madecassoside) y Pantenol al 5%',
      'Ceramidas esenciales 3:1:1 para sellar la barrera',
      'Fotoprotector 100% mineral (Óxido de Zinc / Dióxido de Titanio)',
    ];
  } else if (isGeneralizedOily) {
    // OILY SKIN PRIMARY
    skinTypeEstimate = 'OILY';
    skinTypeLabel = 'Piel Grasa (Seborrea Generalizada / Hiperactividad Lipídica)';
    baumannCodePrefix = 'O';
    clinicalRationale = `Reflectancia lipídica especular elevada generalizada (Zona T y mejillas) con dilatación ostial folicular difusa (Baumann BSTI Tipo O).`;
    zoneTShine = 'HIGH';
    zoneTPoresVisible = true;
    zoneTDesc = `Hipersecreción sebácea manifiesta en frente, pirámide nasal y mentón con poros dilatados prominentes.`;
    cheeksHydration = 'BALANCED';
    cheeksRedness = erythema !== 'ABSENT';
    cheeksDesc = `Manto lipídico abundante en mejillas con reflectancia especular activa.`;
    visibleConcerns = ['Exceso de brillo lipídico continuo', 'Poros dilatados y tendencia a comedones', 'Textura irregular'];
    suggestedFocus = [
      'Limpieza con Syndet purificante (Ácido Salicílico BHA 0.5-2%)',
      'Sérum de Niacinamida 5-10% + Zinc PCA para modular el sebo',
      'Fotoprotector toque seco / matificante ' + (fitzpatrick >= 4 ? 'con filtros anti-manchas' : 'SPF 50+'),
    ];
  } else if (isGeneralizedDry) {
    // DRY SKIN PRIMARY
    skinTypeEstimate = 'DRY';
    skinTypeLabel = 'Piel Seca (Alípica / Déficit de Manto Hidrolipídico)';
    baumannCodePrefix = 'D';
    clinicalRationale = `Ausencia de reflectancia lipídica especular, microdescamación del estrato córneo o xerosis visual (Baumann BSTI Tipo D).`;
    zoneTShine = 'LOW';
    zoneTPoresVisible = false;
    zoneTDesc = `Zona T mate sin secreción sebácea apreciable, textura tirante y poros cerrados imperceptibles.`;
    cheeksHydration = 'DRY';
    cheeksRedness = erythema !== 'ABSENT';
    cheeksDesc = `Mejillas con déficit de lípidos fisiológicos, pérdida de turgencia y microdescamación córnea.`;
    visibleConcerns = ['Tirantez y opacidad cutánea', 'Microdescamación superficial', 'Líneas finas por deshidratación'];
    suggestedFocus = [
      'Limpiador en crema lechosa o aceite emulsionable (sin espuma sulfatada)',
      'Ácido Hialurónico multimolecular sobre piel húmeda + Glicerina',
      'Crema rica en Ceramidas, Colesterol y Escualano fisiológico',
    ];
  } else if (isCombinationSkin) {
    // COMBINATION SKIN
    skinTypeEstimate = 'COMBINATION';
    skinTypeLabel = 'Piel Mixta (Zona T Grasa / Mejillas Equilibradas o Alípicas)';
    baumannCodePrefix = 'C';
    clinicalRationale = `Disparidad topográfica bimodal: Hipersecreción sebácea concentrada en Zona T (frente/nariz) contrastando con mejillas normo o hipo-lipídicas (Baumann BSTI).`;
    zoneTShine = tZoneSebum === 'HIGH' ? 'HIGH' : 'MODERATE';
    zoneTPoresVisible = true;
    zoneTDesc = `Brillo lipídico moderado-alto en frente, nariz y mentón con poros visibles concentrados.`;
    cheeksHydration = cheeksSebum === 'NONE' ? 'DRY' : 'BALANCED';
    cheeksRedness = erythema !== 'ABSENT';
    cheeksDesc = `Mejillas con manto lipídico controlado, sin exceso de brillo ni dilatación ostial marcada.`;
    visibleConcerns = ['Control de brillo focalizado en zona T', 'Prevención de puntos negros nasales', 'Mantenimiento de hidratación en mejillas'];
    suggestedFocus = [
      'Doble limpieza suave respetuosa con el manto lipídico',
      'Niacinamida 2-5% para equilibrar la zona T sin resecar mejillas',
      'Emulsión hidratante ligera en gel-crema y protector solar fluido SPF 50+',
    ];
  } else {
    // NORMAL / EUDERMIC SKIN
    skinTypeEstimate = 'NORMAL';
    skinTypeLabel = 'Piel Normal (Eudérmica / Equilibrio Hidrolipídico Óptimo)';
    baumannCodePrefix = 'N';
    clinicalRationale = `Homeostasis cutánea conservada: reflectancia lumínica homogénea sin hiperseborrea ni deshidratación perceptible (Baumann BSTI).`;
    zoneTShine = 'LOW';
    zoneTPoresVisible = false;
    zoneTDesc = `Zona T equilibrada con textura lisa y poros finos poco perceptibles.`;
    cheeksHydration = 'BALANCED';
    cheeksRedness = false;
    cheeksDesc = `Mejillas con hidratación fisiológica óptima, elasticidad preservada y tono homogéneo.`;
    visibleConcerns = ['Mantenimiento preventivo de barrera', 'Fotoprotección antioxidante diaria'];
    suggestedFocus = [
      'Limpieza suave Syndet con pH fisiológico 5.5',
      'Sérum antioxidante de Vitamina C estabilizada o Ectoína',
      'Hidratación ligera y Fotoprotector diario SPF 50+',
    ];
  }

  // 4. TRIAGE & MEDICAL REFERRAL GOVERNANCE ENGINE
  const lesionRisk = bio.activeLesionRisk || 'NONE';
  const hasDisruptionOrWound = lesionRisk === 'OPEN_WOUND_OR_DISRUPTION';
  const hasSevereCystic = lesionRisk === 'SEVERE_CYSTIC_OR_NODULAR';
  const hasAcuteErythema = erythema === 'ACUTE_SEVERE';

  let triageLevel: ClinicalTriageLevel = 'COSMETIC_MAINTENANCE';
  let medicalReferralRecommended = false;
  let referralReason: string | null = null;
  let suggestedMedicalSpecialty: string | null = null;
  let safetyAlerts: string[] = [];
  let blockedIngredientCategories: string[] = [];
  let safeRecommendedActives: string[] = [];

  if (hasDisruptionOrWound || hasAcuteErythema) {
    triageLevel = 'DERMATOLOGY_REFERRAL_RECOMMENDED';
    medicalReferralRecommended = true;
    referralReason = hasDisruptionOrWound
      ? 'Se observa una posible disrupción o alteración visible en la barrera epidérmica. Por seguridad dermatológica, se desaconseja el uso de exfoliantes o cosméticos activos intensivos hasta su valoración médica presencial.'
      : 'Eritema agudo con hiperreactividad vascular marcada en área facial. Requiere valoración médica presencial para descartar afecciones específicas (rosácea activa, dermatitis por contacto).';
    suggestedMedicalSpecialty = 'Médico Dermatólogo Especialista en Barrera Cutánea y Lesiones Inflamatorias';
    safetyAlerts = [
      'SUSPENDER temporalmente el uso de exfoliantes químicos (Ácido Glicólico, Salicílico, Láctico) y peelings.',
      'EVITAR retinoides (Retinol, Retinal) y formas ácidas de Vitamina C pura (L-Ascórbico < pH 3.5).',
      'Priorizar fotoprotección 100% mineral con Óxido de Zinc y fórmulas hipoalergénicas sin perfume.',
    ];
    blockedIngredientCategories = [
      'EXFOLIATING_ACIDS_AHA_BHA',
      'PURE_RETINOIDS',
      'ALCOHOL_DENAT',
      'GRANULAR_SCRUBS',
      'HIGH_STRENGTH_VITAMIN_C',
    ];
    safeRecommendedActives = [
      'Centella Asiática (Madecassoside)',
      'Pantenol (Provitamina B5) al 5%',
      'Complejo reparador de Ceramidas 3:1:1',
      'Fotoprotector mineral SPF 50+',
    ];
    visibleConcerns.unshift('Disrupción de barrera / Reactividad aguda detectada');
  } else if (hasSevereCystic) {
    triageLevel = 'DERMATOLOGY_REFERRAL_RECOMMENDED';
    medicalReferralRecommended = true;
    referralReason =
      'Presencia de imperfecciones profundas o nodulares recurrentes. Los cosméticos de venta libre tienen alcance superficial; se recomienda valoración con un especialista médico para prevenir marcas y cicatrices dérmicas.';
    suggestedMedicalSpecialty = 'Médico Dermatólogo Especialista en Trastornos Foliculares y Seborreicos';
    safetyAlerts = [
      'Evitar manipular mecánicamente o presionar las zonas con imperfecciones para prevenir hiperpigmentación postinflamatoria.',
      'Consultar con un médico dermatólogo para evaluar pautas tópicas u orales de prescripción.',
    ];
    blockedIngredientCategories = ['COMEDOGENIC_HEAVY_OILS', 'GRANULAR_SCRUBS'];
    safeRecommendedActives = [
      'Ácido Salicílico (BHA 1-2%) en vehículo calmante',
      'Niacinamida al 2-4% y Zinc PCA',
      'Geles hidratantes oil-free no comedogénicos',
    ];
    visibleConcerns.unshift('Imperfecciones profundas con indicación de valoración clínica');
  } else {
    // Normal / Cosmetic active routine
    triageLevel = (visibleConcerns.length > 1 || isErythematous || isGeneralizedOily || isGeneralizedDry)
      ? 'COSMETIC_ACTIVE'
      : 'COSMETIC_MAINTENANCE';
    medicalReferralRecommended = false;
    referralReason = null;
    suggestedMedicalSpecialty = 'Dermatólogo Cosmético y Preventivo (Control Anual)';
    safetyAlerts = [];
    blockedIngredientCategories = [];
    safeRecommendedActives = suggestedFocus;
  }

  // 5. PERIORBITAL / DARK CIRCLES ANALYSIS
  const darkType = bio.darkCirclesType || 'NONE_OR_MINIMAL';
  const darkSeverity = bio.darkCirclesSeverity || (darkType === 'NONE_OR_MINIMAL' ? 'NONE' : 'MILD');
  let darkDesc = 'Contorno periocular homogéneo sin hipercromía ni estasis vascular aparente.';
  let darkActives: string[] = ['Ácido Hialurónico hidratante', 'Protector solar periorbitario'];

  if (darkType === 'VASCULAR') {
    darkDesc = 'Ojeras de tonalidad azulada/violácea asociadas a microcirculación sanguínea superficial y piel periorbitaria muy fina.';
    darkActives = [
      'Cafeína al 5% anhidra (vasoconstrictor descongestionante)',
      'Vitamina K-óxido microencapsulada (favorece la microcirculación)',
      'Niacinamida al 2% (fortalece la piel del contorno)',
      'Péptidos drenantes (Acetil Tetrapéptido-5 / Eyeseryl)',
    ];
    visibleConcerns.push('Ojeras de etiología vascular (azulada/violácea)');
  } else if (darkType === 'PIGMENTARY') {
    darkDesc = 'Ojeras de tonalidad marrón/parda causadas por depósito focal de melanina (hipercromía idiopática periorbitaria).';
    darkActives = [
      'Vitamina C estabilizada en contorno (Ascorbyl Glucoside)',
      'Ácido Tranexámico al 1-2%',
      'Alfa-Arbutina (inhibidor enzimático de tirosinasa)',
      'Fotoprotector solar mineral para contorno ocular SPF 50+',
    ];
    visibleConcerns.push('Ojeras pigmentarias melánicas (marrones)');
  } else if (darkType === 'STRUCTURAL_SHADOW') {
    darkDesc = 'Sombra visual proyectada por hendidura anatómica del surco lagrimal (tear trough) o pérdida de volumen graso infraorbitario.';
    darkActives = [
      'Ácido Hialurónico de alto y bajo peso molecular (relleno hídrico superficial)',
      'Péptidos redensificantes (Matrixyl Synthe-6)',
      'Descanso reparador e hidratación constante',
    ];
    visibleConcerns.push('Sombra estructural por surco lagrimal (tear trough)');
  } else if (darkType === 'MIXED') {
    darkDesc = 'Combinación de componente vascular (microcirculación visible) con depósito superficial de pigmento melánico.';
    darkActives = [
      'Combinación de Cafeína y Niacinamida',
      'Vitamina C derivada para contorno de ojos',
      'Fotoprotección solar UV diaria',
    ];
    visibleConcerns.push('Ojeras mixtas (vascular + hiperpigmentación)');
  }

  // 6. PIGMENTATION & SUN DAMAGE ANALYSIS
  const pigLevel = bio.hyperpigmentationLevel || (bio.visibleEtiologies?.some(e => e.includes('mancha')) ? 'MILD_SUPERFICIAL' : 'NONE_OR_UNIFORM');
  let pigDesc = 'Tono cutáneo regular sin acumulación focal de melanina perceptible.';
  let pigActives: string[] = ['Antioxidantes preventivos (Vitamina C / Ectoína)', 'Fotoprotector solar SPF 50+'];
  let sunGuidance = 'Protector solar diario amplio espectro para preservar la uniformidad del tono.';

  if (pigLevel === 'POST_INFLAMMATORY') {
    pigDesc = 'Máculas pigmentadas residuales (Hiperpigmentación Post-Inflamatoria - HPI), comunes tras imperfecciones o reactividad dérmica.';
    pigActives = [
      'Ácido Azelaico al 10% (despigmentante seguro y antiinflamatorio)',
      'Niacinamida al 4% (bloquea la transferencia de melanosomas)',
      'Ácido Tranexámico al 2-3%',
      'Alfa-Arbutina al 1-2%',
    ];
    sunGuidance = 'Protector solar SPF 50+ con protección UVA reforzada (PA++++) y filtros con óxido de hierro para bloquear luz azul visible.';
    visibleConcerns.push('Hiperpigmentación postinflamatoria focal (HPI)');
  } else if (pigLevel === 'MODERATE_DIFFUSE') {
    pigDesc = 'Heterogeneidad en la distribución del pigmento melánico en zonas fotoexpuestas (pómulos, frente, labio superior).';
    pigActives = [
      'Ácido Azelaico al 10%',
      'Vitamina C estabilizada al 10-15%',
      'Extracto de Regaliz (Glabridina)',
      'Niacinamida al 5%',
    ];
    sunGuidance = 'Reaplicación estricta de protector solar SPF 50+ cada 2 a 3 horas en exteriores.';
    visibleConcerns.push('Heterogeneidad tonal y manchas solares difusas');
  } else if (pigLevel === 'MILD_SUPERFICIAL') {
    pigDesc = 'Ligeras irregularidades tonales superficiales en áreas expuestas a la radiación solar.';
    pigActives = [
      'Niacinamida al 2-4%',
      'Sérum antioxidante de Vitamina C matutino',
      'Fotoprotector solar de amplio espectro diario',
    ];
    sunGuidance = 'Fotoprotector solar diario SPF 50+ como pilar preventivo indispensable.';
  }

  // 7. TEXTURE & LINES ANALYSIS
  const texLevel = bio.textureAndLinesLevel || 'SMOOTH';
  let texDesc = 'Superficie dérmica lisa y uniforme, con elasticidad fisiológica conservada.';
  let texActives: string[] = ['Hidratación equilibrada fisiológica', 'Fotoprotección antioxidante preventiva'];

  if (texLevel === 'DYNAMIC_EXPRESSION_LINES' || texLevel === 'MODERATE_STATIC_LINES') {
    texDesc = 'Líneas visibles asociadas a la gesticulación expresiva (frente, entrecejo, periocular) o atenuación gradual de fibras dérmicas.';
    texActives = [
      'Retinoides de liberación gradual (Retinaldehído / Retinol encapsulado) en noches de ciclado',
      'Péptidos tensores y biomiméticos (Matrixyl 3000 / Acetil Hexapéptido-8)',
      'Ácido Hialurónico multimolecular y Ceramidas',
    ];
    visibleConcerns.push('Líneas finas de expresión visibles');
  } else if (texLevel === 'FINE_DEHYDRATION_LINES') {
    texDesc = 'Finas líneas superficiales asociadas a pérdida transitoria de agua transepidérmica (TEWL), no a fotoenvejecimiento estructural.';
    texActives = [
      'Ácido Hialurónico de bajo y alto peso molecular',
      'Pantenol (Provitamina B5) y Glicerina',
      'Emolientes de barrera (Escualano vegetal, Ceramidas)',
    ];
    visibleConcerns.push('Finas líneas por deshidratación transitoria');
  }

  // Build Baumann Code (e.g., ORNT, DSNW, etc.)
  const sensitiveChar = isErythematous ? 'S' : 'R';
  const pigmentChar = (pigLevel !== 'NONE_OR_UNIFORM' || (bio.visibleEtiologies && bio.visibleEtiologies.some(e => e.includes('mancha') || e.includes('pigment')))) ? 'P' : 'N';
  const ageChar = (texLevel === 'DYNAMIC_EXPRESSION_LINES' || texLevel === 'MODERATE_STATIC_LINES') ? 'W' : 'T';
  const fullBaumannCode = `${baumannCodePrefix === 'C' ? 'O' : baumannCodePrefix}${sensitiveChar}${pigmentChar}${ageChar}`;

  const resolvedFaceRegions = deriveFaceRegions(faceRegions);

  return {
    classification: 'HUMAN_FACE',
    confidence: Math.max(0.75, confidence || 0.92),
    faceAnalysis: {
      skinTypeEstimate,
      skinTypeLabel,
      baumannSkinTypeCode: fullBaumannCode,
      fitzpatrickType: fitzpatrick as FitzpatrickScale,
      faceRegions: resolvedFaceRegions,
      zoneTAnalysis: {
        shineLevel: zoneTShine,
        poresVisible: zoneTPoresVisible,
        description: zoneTDesc,
      },
      cheeksAnalysis: {
        hydrationState: cheeksHydration,
        rednessPresent: cheeksRedness,
        description: cheeksDesc,
      },
      periorbitalAnalysis: {
        darkCirclesType: darkType,
        severity: darkSeverity,
        description: darkDesc,
        suggestedActives: darkActives,
      },
      pigmentationAnalysis: {
        level: pigLevel,
        description: pigDesc,
        suggestedActives: pigActives,
        sunProtectionGuidance: sunGuidance,
      },
      textureAndLinesAnalysis: {
        level: texLevel,
        description: texDesc,
        suggestedActives: texActives,
      },
      triage: {
        triageLevel,
        medicalReferralRecommended,
        referralReason,
        suggestedMedicalSpecialty,
        safetyAlerts,
        blockedIngredientCategories,
        safeRecommendedActives,
        patchTestRequired: true,
      },
      biomarkers: {
        tZoneSebum,
        cheeksSebum,
        poreProminence: pores,
        erythemaIndex: erythema,
        desquamation,
      },
      visibleConcerns: Array.from(new Set(visibleConcerns)),
      suggestedFocus,
      clinicalRationale,
      scientificReferences: [
        'Baumann, L. (2006). The Baumann Skin Typing System. Journal of Cosmetic Dermatology, 5(1), 30-39.',
        'Fitzpatrick, T. B. (1988). The validity and practicality of sun-reactive skin types I through VI. Archives of Dermatology, 124(6), 869-871.',
        'Hirmand, H. (2010). Anatomy and nonsurgical management of the lower eyelid and periorbital area. Aesthetic Surgery Journal, 30(2), 241-249.',
        'Passeron, T., et al. (2019). Clinical and biological understanding of facial hyperpigmentation. Journal of the European Academy of Dermatology and Venereology, 33, 5-14.',
        'Glogau, R. G. (1996). Aesthetic and anatomic analysis of the aging skin. Seminars in Cutaneous Medicine and Surgery, 15(3), 134-138.',
        'Fluhr, J. W., et al. (2008). Stratum corneum hydration and transepidermal water loss. Skin Research and Technology, 14(3), 295-303.',
      ],
      confidence: Math.max(0.75, confidence || 0.92),
      disclaimer:
        'Evaluación cosmética orientativa de apariencia dérmica gobernada conforme a las escalas Baumann BSTI, Glogau y Fitzpatrick. No constituye un diagnóstico médico dermatológico presencial.',
      patchTestGuidance:
        'Antes de incorporar nuevos cosméticos a tu rutina, realiza una prueba de parche en el antebrazo durante 24 horas para verificar la tolerancia de tu piel.',
    },
  };
}

function createRejection(
  code: ClinicalRejectionCode,
  confidence: number = 0.95
): RejectionEvaluationResult {
  const catalog = CLINICAL_REJECTIONS_CATALOG[code] || CLINICAL_REJECTIONS_CATALOG.NOT_COSMETIC_OR_FACE;
  return {
    classification: 'INVALID',
    rejectionReason: code,
    rejectionTitle: catalog.title,
    userFriendlyMessage: catalog.message,
    guidanceTips: catalog.tips,
    confidence: Math.max(0.75, confidence),
  };
}
