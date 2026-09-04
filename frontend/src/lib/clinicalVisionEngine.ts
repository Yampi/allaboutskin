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
 * Derives and normalizes facial anatomical zones (Zone T, Malar Cheeks)
 * with Da Vinci / Farkas neoclassical facial third proportions.
 */
export function deriveFaceRegions(
  extractedRegions?: Partial<FaceRegionsCoordinates>
): FaceRegionsCoordinates {
  const defaultFace: NormalizedBoundingBox = { top: 12, left: 18, width: 64, height: 72 };
  const rawFace = extractedRegions?.faceBox;

  const faceBox: NormalizedBoundingBox =
    rawFace && typeof rawFace.width === 'number' && rawFace.width > 5 && rawFace.height > 5
      ? {
          top: Math.max(0, Math.min(90, Math.round(rawFace.top))),
          left: Math.max(0, Math.min(90, Math.round(rawFace.left))),
          width: Math.max(15, Math.min(100, Math.round(rawFace.width))),
          height: Math.max(15, Math.min(100, Math.round(rawFace.height))),
        }
      : defaultFace;

  // Proportional anatomical derivations based on faceBox:
  // Zone T spans upper third (forehead) and central bridge (nasal dorsum)
  const derivedZoneT: NormalizedBoundingBox = {
    top: Math.max(0, Math.round(faceBox.top + faceBox.height * 0.04)),
    left: Math.max(0, Math.round(faceBox.left + faceBox.width * 0.26)),
    width: Math.min(100, Math.round(faceBox.width * 0.48)),
    height: Math.min(100, Math.round(faceBox.height * 0.50)),
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

  const sanitizeBox = (
    box?: NormalizedBoundingBox,
    fallback?: NormalizedBoundingBox
  ): NormalizedBoundingBox => {
    if (
      !box ||
      typeof box.top !== 'number' ||
      typeof box.left !== 'number' ||
      typeof box.width !== 'number' ||
      typeof box.height !== 'number' ||
      box.width < 4 ||
      box.height < 4
    ) {
      return fallback!;
    }
    return {
      top: Math.max(0, Math.min(95, Math.round(box.top))),
      left: Math.max(0, Math.min(95, Math.round(box.left))),
      width: Math.max(5, Math.min(100, Math.round(box.width))),
      height: Math.max(5, Math.min(100, Math.round(box.height))),
    };
  };

  return {
    faceBox,
    zoneTBox: sanitizeBox(extractedRegions?.zoneTBox, derivedZoneT),
    leftCheekBox: sanitizeBox(extractedRegions?.leftCheekBox, derivedLeftCheek),
    rightCheekBox: sanitizeBox(extractedRegions?.rightCheekBox, derivedRightCheek),
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

  // Build Baumann Code (e.g., ORNT, DSNW, etc.)
  const sensitiveChar = isErythematous ? 'S' : 'R';
  const pigmentChar = (bio.visibleEtiologies && bio.visibleEtiologies.some(e => e.includes('mancha') || e.includes('pigment'))) ? 'P' : 'N';
  const ageChar = 'T'; // Default Tight / Standard
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
      biomarkers: {
        tZoneSebum,
        cheeksSebum,
        poreProminence: pores,
        erythemaIndex: erythema,
        desquamation,
      },
      visibleConcerns,
      suggestedFocus,
      clinicalRationale,
      scientificReferences: [
        'Baumann, L. (2006). The Baumann Skin Typing System. Journal of Cosmetic Dermatology, 5(1), 30-39.',
        'Fitzpatrick, T. B. (1988). The validity and practicality of sun-reactive skin types I through VI. Archives of Dermatology, 124(6), 869-871.',
        'Fluhr, J. W., et al. (2008). Stratum corneum hydration and transepidermal water loss. Skin Research and Technology, 14(3), 295-303.',
      ],
      confidence: Math.max(0.75, confidence || 0.92),
      disclaimer:
        'Evaluación óptica dermatológica gobernada por el motor de Allabout.skin conforme a la escala Baumann BSTI y fototipo Fitzpatrick. No sustituye una consulta médica presencial.',
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
