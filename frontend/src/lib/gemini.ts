/**
 * Google Gemini Skincare AI Integration
 * Allabout.skin Next.js Serverless & Client Utilities
 */

import {
  governAndClassifyBiomarkers,
  ExtractedClinicalBiomarkers,
  GovernedVisionResult,
  ClinicalSkinEvaluationResult,
  SkincareProductEvaluationResult,
  RejectionEvaluationResult,
  ClinicalRejectionCode,
} from './clinicalVisionEngine';

export type {
  GovernedVisionResult,
  ClinicalSkinEvaluationResult,
  SkincareProductEvaluationResult,
  RejectionEvaluationResult,
  ClinicalRejectionCode,
};

export interface AiDiagnosisResult {
  headline: string;
  clinicalVerdict: string;
  suitabilityScore: number; // 0 - 100
  skinTypeMatch: {
    dry: 'EXCELLENT' | 'GOOD' | 'NEUTRAL' | 'CAUTION' | 'AVOID';
    oily: 'EXCELLENT' | 'GOOD' | 'NEUTRAL' | 'CAUTION' | 'AVOID';
    combination: 'EXCELLENT' | 'GOOD' | 'NEUTRAL' | 'CAUTION' | 'AVOID';
    sensitive: 'EXCELLENT' | 'GOOD' | 'NEUTRAL' | 'CAUTION' | 'AVOID';
    acneProne: 'EXCELLENT' | 'GOOD' | 'NEUTRAL' | 'CAUTION' | 'AVOID';
  };
  keyBenefits: string[];
  precautions: string[];
  layeringAdvice: {
    step: string;
    timing: 'AM' | 'PM' | 'BOTH';
    frequency: string;
    combineWith: string[];
    avoidCombiningWith: string[];
  };
  plainLanguageSummary: string;
  confidence: number;
  modelUsed: string;
}

export interface CopilotMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ImageScanResult {
  brand: string | null;
  productName: string | null;
  inciText: string;
  rawDetectedText: string;
  confidence: number;
  notes: string[];
}

export type FaceSkinAnalysis = ClinicalSkinEvaluationResult['faceAnalysis'];

export type VisionClassificationResult = GovernedVisionResult;

export interface RoutineAuditResult {
  routineSafetyScore: number; // 0 - 100
  verdict: string;
  severeConflicts: Array<{
    productsInvolved: string[];
    activesInvolved: string[];
    risk: string;
    actionableFix: string;
  }>;
  moderateWarnings: Array<{
    issue: string;
    recommendation: string;
  }>;
  missingPillars: string[];
  recommendedSchedule: {
    amRoutine: string[];
    pmRoutine: {
      night1Exfoliation?: string[];
      night2Retinoid?: string[];
      night3Recovery?: string[];
      night4Recovery?: string[];
      standard?: string[];
    };
  };
  dermatologistSummary: string;
}

const GEMINI_MODELS = [
  'gemini-flash-latest',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-2.5-flash',
  'gemini-pro-latest',
  'gemini-2.5-pro',
  'gemini-1.5-flash-latest',
];

/**
 * Checks if the provided Gemini API key is valid and not a placeholder or empty string.
 */
export function isValidGeminiApiKey(key: string | undefined): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  if (trimmed.length < 15) return false;
  if (trimmed.includes('YourGeminiApiKeyHere') || trimmed.includes('YOUR_API_KEY') || trimmed.includes('AIzaSyYour')) return false;
  return true;
}

/**
 * Executes a structured request against Google Gemini REST API.
 */
export async function callGeminiApi(
  prompt: string,
  systemInstruction?: string,
  imagePart?: { mimeType: string; data: string },
  responseJson: boolean = false
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || '';

  if (!isValidGeminiApiKey(apiKey)) {
    throw new Error('GEMINI_API_KEY no configurada o clave inválida.');
  }

  const parts: any[] = [];
  if (imagePart) {
    parts.push({
      inlineData: {
        mimeType: imagePart.mimeType,
        data: imagePart.data,
      },
    });
  }
  parts.push({ text: prompt });

  const body: any = {
    contents: [
      {
        role: 'user',
        parts,
      },
    ],
    generationConfig: {
      temperature: 0.2,
      topP: 0.95,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  };

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  if (responseJson) {
    body.generationConfig.responseMimeType = 'application/json';
  }

  // Determine candidate models, prioritizing configured GEMINI_MODEL if present
  const configuredModel = process.env.GEMINI_MODEL?.trim();
  const candidateModels = configuredModel
    ? [configuredModel, ...GEMINI_MODELS.filter((m) => m !== configuredModel)]
    : GEMINI_MODELS;

  // Attempt models with automatic fallback
  let lastError: any = null;
  const errorDetails: string[] = [];

  for (const model of candidateModels) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorText = await res.text();
        errorDetails.push(`${model}: ${res.status}`);
        lastError = new Error(`Gemini API error (${model}): ${res.status} - ${errorText}`);
        continue;
      }

      const data = await res.json();
      const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (textOutput) {
        return textOutput;
      }
    } catch (err: any) {
      errorDetails.push(`${model}: ${err?.message || 'Error'}`);
      lastError = err;
    }
  }

  throw lastError || new Error(`No se pudo obtener respuesta de Google Gemini. Modelos intentados: ${candidateModels.join(', ')}`);
}

/**
 * Generates an AI Dermatological Diagnosis for a specific INCI formula.
 */
export async function getAiDiagnosis(
  inciText: string,
  skinType: string = 'COMBINATION',
  concerns: string[] = [],
  productName?: string
): Promise<AiDiagnosisResult> {
  const apiKey = process.env.GEMINI_API_KEY || '';

  const systemInstruction = `Eres un Médico Dermatólogo y Químico Cosmético Científico de élite para la plataforma Allabout.skin.
Analiza la lista de ingredientes (INCI) con máximo rigor científico, evaluando concentración, pH estimado, sinergias, incompatibilidades y seguridad biológica.
Responde SIEMPRE en formato JSON válido con la siguiente estructura exacta:
{
  "headline": "Título conciso del veredicto (ej. Excelente restaurador de barrera)",
  "clinicalVerdict": "Explicación médica detallada en 2-3 párrafos claros y profesionales",
  "suitabilityScore": 85,
  "skinTypeMatch": {
    "dry": "EXCELLENT" | "GOOD" | "NEUTRAL" | "CAUTION" | "AVOID",
    "oily": "EXCELLENT" | "GOOD" | "NEUTRAL" | "CAUTION" | "AVOID",
    "combination": "EXCELLENT" | "GOOD" | "NEUTRAL" | "CAUTION" | "AVOID",
    "sensitive": "EXCELLENT" | "GOOD" | "NEUTRAL" | "CAUTION" | "AVOID",
    "acneProne": "EXCELLENT" | "GOOD" | "NEUTRAL" | "CAUTION" | "AVOID"
  },
  "keyBenefits": ["Beneficio 1 comprobado", "Beneficio 2 comprobado", "Beneficio 3"],
  "precautions": ["Precaución o advertencia 1", "Precaución 2"],
  "layeringAdvice": {
    "step": "Orden en la rutina (ej. Paso 3: Tras la limpieza, antes de la crema)",
    "timing": "AM" | "PM" | "BOTH",
    "frequency": "Frecuencia sugerida (ej. Diaria o 2-3 noches por semana)",
    "combineWith": ["Activo compatible 1 (ej. Ácido Hialurónico, Niacinamida)"],
    "avoidCombiningWith": ["Activo conflictivo (ej. Retinoides puros, Vitamina C ácida en la misma capa)"]
  },
  "plainLanguageSummary": "Resumen amigable y directo para el consumidor final en 1 o 2 frases",
  "confidence": 0.95
}`;

  const prompt = `Producto: ${productName || 'Producto Cosmético'}
Tipo de piel del usuario: ${skinType}
Preocupaciones cutáneas: ${concerns.length ? concerns.join(', ') : 'Mantenimiento general, barrera, textura'}

Lista de ingredientes INCI:
${inciText}`;

  if (!isValidGeminiApiKey(apiKey)) {
    // Deterministic fallback if API key is not yet set
    return getFallbackDiagnosis(inciText, skinType, productName);
  }

  try {
    const rawJson = await callGeminiApi(prompt, systemInstruction, undefined, true);
    const parsed = JSON.parse(rawJson);
    return {
      ...parsed,
      confidence: parsed.confidence || 0.92,
      modelUsed: 'Google Gemini 2.5/1.5 Flash',
    };
  } catch (e) {
    console.warn('Gemini diagnosis fallback used:', e);
    return getFallbackDiagnosis(inciText, skinType, productName);
  }
}

/**
 * Answers questions about the formula with context-aware Copilot.
 */
export async function askAiCopilot(
  question: string,
  inciText: string,
  productName: string,
  history: CopilotMessage[] = [],
  skinType: string = 'COMBINATION'
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || '';

  const systemInstruction = `Eres "Skin Copilot", el Asistente Clínico Inteligente de Allabout.skin.
Estás asesorando a un usuario sobre el producto "${productName}" con la siguiente fórmula INCI:
"""
${inciText}
"""
Tipo de piel del usuario: ${skinType}.

Directrices:
1. Sé muy claro, amable, científico y directo. Responde en español.
2. Si el usuario pregunta por combinaciones de ingredientes (ej. retinol + ácidos, vitamina C + niacinamida), explica el por qué bioquímico de forma sencilla y aconseja si aplicarlo por la mañana (AM), noche (PM) o en días alternos.
3. No inventes ingredientes que no estén en la fórmula, pero puedes contrastar con otros activos que el usuario mencione.
4. Mantén las respuestas estructuradas con viñetas cuando sea apropiado.`;

  if (!isValidGeminiApiKey(apiKey)) {
    return `Como copiloto dermatológico, he analizado la fórmula de **${productName}**. Contiene activos funcionales compatibles con piel ${skinType.toLowerCase()}. Para responder a tu pregunta sobre "${question}": recomendamos aplicar los productos de menor a mayor densidad, usar protector solar en el día (AM) y distanciar activos exfoliantes o retinoides en noches alternas. *(Para respuestas personalizadas en tiempo real con Gemini, configura tu GEMINI_API_KEY en Vercel).*`;
  }

  const prompt = `Historial de conversación:
${history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

Pregunta del usuario:
${question}`;

  try {
    return await callGeminiApi(prompt, systemInstruction, undefined, false);
  } catch (err: any) {
    return `Lo sentimos, ocurrió un problema temporal al consultar a Gemini: ${err?.message || 'Error de conexión'}.`;
  }
}

function extractJsonFromText(raw: string): string {
  let cleaned = raw.trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return cleaned.slice(firstBrace, lastBrace + 1);
  }
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  return cleaned.trim();
}

/**
 * Fallback generator for referential evaluation when testing offline or without an active API key.
 */
export function getFallbackFaceAnalysis(): VisionClassificationResult {
  return governAndClassifyBiomarkers({
    detectedAnatomy: 'HUMAN_FACE',
    confidence: 0.90,
    landmarks: {
      bilateralEyesVisible: true,
      nasalDorsumVisible: true,
      oralCommissureVisible: true,
      malarCheeksVisible: true,
      foreheadVisible: true,
    },
    opticalBiomarkers: {
      tZoneSebumReflectance: 'MODERATE',
      cheeksSebumReflectance: 'LOW',
      follicularOstiaPores: 'VISIBLE_T_ZONE',
      erythemaMalarIndex: 'ABSENT',
      stratumCorneumDesquamation: 'NONE',
      fitzpatrickPhototypeEstimate: 3,
    },
  });
}

/**
 * Classifies an uploaded photo and extracts quantitative dermatological biomarkers,
 * then applies the Allabout.skin Clinical Governance Engine (Baumann BSTI + Fitzpatrick).
 */
export async function classifyAndProcessImage(
  base64Data: string,
  mimeType: string = 'image/jpeg'
): Promise<VisionClassificationResult> {
  const apiKey = process.env.GEMINI_API_KEY || '';

  const systemInstruction = `Eres el Sensor Óptico de Extracción de Biomarcadores Dermatológicos de Allabout.skin.
Tu función es inspeccionar con rigor biométrico y clínico la fotografía provista y devolver EXCLUSIVAMENTE un objeto JSON con los biomarcadores visuales observados.

DEFINICIÓN RIGUROSA DE ANATOMÍA DETECTADA ("detectedAnatomy"):
- "HUMAN_FACE": EXCLUSIVAMENTE cuando se observe un rostro humano real (selfie o retrato de frente/semilateral). IMPORTANTE: La presencia de barba, bigote, vello facial, sonrisa, expresiones faciales, peinados o gafas ópticas graduadas es completamente normal y NO anula la clasificación de rostro; clasifícalo SIEMPRE como "HUMAN_FACE".
- "HAND_OR_ARM": Mano humana, palma, dedos, nudillos, muñeca, antebrazo o brazo.
- "FOOT_OR_LEG": Pie humano, dedos de pie, tobillo, pierna, rodilla o muslo.
- "TORSO_OR_BACK": Espalda humana, hombros, pecho, abdomen, escote o cuello aislado.
- "OCCLUDED_OR_INCOMPLETE_FACE": Rostro humano donde más del 60% de los rasgos clave están bloqueados u ocultos deliberadamente (ej. pasamontañas, mascarilla quirúrgica completa, vendas o recorte extremo fuera de cámara).
- "COSMETIC_PRODUCT": Envase cosmético, frasco, botella, tubo, tarro, caja o etiqueta con lista de ingredientes INCI.
- "ANIMAL_OR_PET": Mascota, animal, dibujo, ilustración o avatar no humano.
- "NON_BIOLOGICAL_OBJECT": Muebles, comida, pantallas, ropa, paredes, vehículos u objetos inanimados.
- "UNREADABLE_OR_POOR_QUALITY": Fotografía con oscuridad prácticamente total (<15 lux), saturación blanca absoluta o desenfoque extremo de movimiento que imposibilite ver las facciones.

DEFINICIÓN DE BIOMARCADORES ÓPTICOS (Solo cuando detectedAnatomy es "HUMAN_FACE"):
1. tZoneSebumReflectance & cheeksSebumReflectance:
   - "NONE": Acabado mate total, sin reflejo especular lipídico (típico de piel seca).
   - "LOW": Manto lipídico equilibrado, brillo fisiológico sutil y homogéneo.
   - "MODERATE": Brillo especular lipídico apreciable (graso ligero a medio).
   - "HIGH": Brillo especular lipídico intenso, reflejo continuo de luz en la piel.
2. follicularOstiaPores (Ostia folicular / poros):
   - "MINIMAL_INCONSPICUOUS": Poros casi invisibles / cerrados (típico piel seca o eudérmica).
   - "VISIBLE_T_ZONE": Poros visibles dilatados localizados principalmente en nariz, frente y barbilla.
   - "DIFFUSE_WIDE": Poros dilatados extendidos ampliamente tanto en zona T como en mejillas.
3. erythemaMalarIndex (Eritema / rojez vascular en pómulos/alas nasales):
   - "ABSENT": Tono uniforme sin rojeces vasculares.
   - "LOCALIZED_MILD": Leve rubor o eritema puntual transitorio.
   - "DIFFUSE_MODERATE": Rojez vascular evidente y difusa en mejillas / alas nasales.
   - "ACUTE_SEVERE": Eritema marcado, telangiectasias visibles o signos de flushing/rosácea.
4. stratumCorneumDesquamation (Xerosis / Descamación):
   - "NONE": Piel lisa sin signos de descamación.
   - "MILD_LOCALIZED": Pequeñas zonas de textura áspera o descamación fina.
   - "MARKED_GENERALIZED": Descamación visible marcada / tirantez evidente.
5. fitzpatrickPhototypeEstimate: Número entero del 1 al 6 según la escala Fitzpatrick (I a VI).

ESTRUCTURA DE RESPUESTA OBLIGATORIA (JSON ESTRICTO):
{
  "detectedAnatomy": "HUMAN_FACE" | "HAND_OR_ARM" | "FOOT_OR_LEG" | "TORSO_OR_BACK" | "OCCLUDED_OR_INCOMPLETE_FACE" | "COSMETIC_PRODUCT" | "ANIMAL_OR_PET" | "NON_BIOLOGICAL_OBJECT" | "UNREADABLE_OR_POOR_QUALITY",
  "confidence": 0.95,
  "landmarks": {
    "bilateralEyesVisible": true | false,
    "nasalDorsumVisible": true | false,
    "oralCommissureVisible": true | false,
    "malarCheeksVisible": true | false,
    "foreheadVisible": true | false
  },
  "opticalBiomarkers": {
    "tZoneSebumReflectance": "NONE" | "LOW" | "MODERATE" | "HIGH",
    "cheeksSebumReflectance": "NONE" | "LOW" | "MODERATE" | "HIGH",
    "follicularOstiaPores": "MINIMAL_INCONSPICUOUS" | "VISIBLE_T_ZONE" | "DIFFUSE_WIDE",
    "erythemaMalarIndex": "ABSENT" | "LOCALIZED_MILD" | "DIFFUSE_MODERATE" | "ACUTE_SEVERE",
    "stratumCorneumDesquamation": "NONE" | "MILD_LOCALIZED" | "MARKED_GENERALIZED",
    "fitzpatrickPhototypeEstimate": 1 | 2 | 3 | 4 | 5 | 6,
    "visibleEtiologies": ["brillo zona T", "poros visibles", "eritema malar"]
  },
  "productData": {
    "brand": "Nombre de marca si es producto o null",
    "productName": "Nombre de producto o null",
    "inciText": "Lista de ingredientes INCI si es producto",
    "rawDetectedText": "Texto visible",
    "notes": []
  }
}`;

  const prompt = `Analiza biométricamente y dermatológicamente esta fotografía conforme a las definiciones operacionales. Devuelve el JSON con detectedAnatomy, landmarks y opticalBiomarkers o productData.`;

  // Strip base64 data url prefix and remove whitespace
  const cleanBase64 = base64Data
    .replace(/^data:[^;]+;base64,/, '')
    .replace(/\s+/g, '');

  if (!isValidGeminiApiKey(apiKey)) {
    console.warn('GEMINI_API_KEY no configurada o es un placeholder. Activando diagnóstico referencial.');
    return getFallbackFaceAnalysis();
  }

  try {
    const rawJson = await callGeminiApi(prompt, systemInstruction, { mimeType, data: cleanBase64 }, true);
    const cleanedJson = extractJsonFromText(rawJson);
    const parsed: ExtractedClinicalBiomarkers = JSON.parse(cleanedJson);

    // Run Allabout.skin Application Governance & Gating Engine
    return governAndClassifyBiomarkers(parsed);
  } catch (err: any) {
    console.error('Error en extracción de visión por IA:', err);
    throw new Error(
      `Error al procesar la imagen con Gemini Vision (${err?.message || 'Error de servicio'}).`
    );
  }
}

/**
 * Extracts and cleans INCI ingredients from an uploaded photo using Gemini Vision.
 * (Preserved for backwards-compatibility)
 */
export async function extractInciFromImage(
  base64Data: string,
  mimeType: string = 'image/jpeg'
): Promise<ImageScanResult> {
  const res = await classifyAndProcessImage(base64Data, mimeType);
  if (res.classification === 'SKINCARE_PRODUCT') {
    return {
      brand: res.brand,
      productName: res.productName,
      inciText: res.inciText,
      rawDetectedText: res.rawDetectedText,
      confidence: res.confidence,
      notes: res.notes,
    };
  }
  
  return {
    brand: null,
    productName: null,
    inciText: '',
    rawDetectedText: '',
    confidence: 0,
    notes: [res.classification === 'HUMAN_FACE' ? 'Se detectó un rostro en lugar de un producto' : 'Imagen no válida como cosmético'],
  };
}

/**
 * Audits a full routine of multiple products for clashes and optimal scheduling.
 */
export async function auditFullRoutineWithAi(
  products: Array<{ name: string; brand?: string; category?: string; ingredients?: string }>,
  skinType: string = 'COMBINATION'
): Promise<RoutineAuditResult> {
  const apiKey = process.env.GEMINI_API_KEY || '';

  const systemInstruction = `Eres un Dermatólogo Director Clínico en Allabout.skin.
Audita la rutina completa de skincare compuesta por los siguientes productos.
Evalúa:
1. Incompatibilidades químicas críticas o riesgo de barrera comprometida (ej. solapar BHA + Retinoide + Vitamina C en la misma sesión).
2. Ausencia de pilares básicos (ej. falta de hidratación o falta de fotoprotector solar).
3. Cronograma sugerido de Skin Cycling (Exfoliación Noche 1, Retinoide Noche 2, Recuperación Noches 3 y 4).

Responde SIEMPRE en formato JSON válido:
{
  "routineSafetyScore": 88,
  "verdict": "Resumen ejecutivo del estado de la rutina",
  "severeConflicts": [
    {
      "productsInvolved": ["Producto A", "Producto B"],
      "activesInvolved": ["Ácido Glicólico", "Retinol"],
      "risk": "Riesgo de eritema, descamación y daño de barrera por sobre-exfoliación",
      "actionableFix": "Alternar en noches distintas (Método Skin Cycling)"
    }
  ],
  "moderateWarnings": [
    {
      "issue": "Falta de fotoprotector solar",
      "recommendation": "Al usar activos fotosensibilizantes, es indispensable incorporar un SPF 50+ en la mañana"
    }
  ],
  "missingPillars": ["Protección Solar UVA/UVB", "Ceramidas de recuperación"],
  "recommendedSchedule": {
    "amRoutine": ["Limpiador suave", "Sérum Hidratante / Vitamina C", "Crema ligera", "Protector Solar SPF 50+"],
    "pmRoutine": {
      "night1Exfoliation": ["Limpieza", "Exfoliante Químico (AHA/BHA)", "Hidratante Reparador"],
      "night2Retinoid": ["Limpieza", "Sérum Retinoide", "Crema con Ceramidas"],
      "night3Recovery": ["Limpieza", "Ácido Hialurónico / Pantenol", "Crema Barrera Nutritiva"],
      "night4Recovery": ["Limpieza", "Cica / Escualano", "Oclusión ligera"]
    }
  },
  "dermatologistSummary": "Mensaje final de asesoría médica cercana y profesional para el paciente."
}`;

  const prompt = `Productos en la rutina del usuario (Tipo de piel: ${skinType}):
${JSON.stringify(products, null, 2)}`;

  if (!isValidGeminiApiKey(apiKey)) {
    return {
      routineSafetyScore: 82,
      verdict: `Rutina estructurada para piel ${skinType.toLowerCase()} con buen equilibrio funcional.`,
      severeConflicts: [],
      moderateWarnings: [
        {
          issue: 'Verificación de protección solar',
          recommendation: 'Asegúrate de aplicar protector solar amplio espectro SPF 50+ cada mañana.',
        },
      ],
      missingPillars: ['Protector Solar Diario'],
      recommendedSchedule: {
        amRoutine: ['Limpieza suave', 'Sérum antioxidante o hidratante', 'Crema y Protector Solar SPF 50+'],
        pmRoutine: {
          night1Exfoliation: ['Limpieza', 'Tratamiento activo exfoliante', 'Hidratante'],
          night2Retinoid: ['Limpieza', 'Tratamiento retinoide', 'Crema barrera'],
          night3Recovery: ['Limpieza', 'Pantenol / Ácido Hialurónico', 'Crema reparadora'],
          night4Recovery: ['Limpieza', 'Ceramidas / Cica', 'Crema reparadora'],
        },
      },
      dermatologistSummary: 'Para desbloquear el análisis profundo de colisiones químicas en tiempo real, activa tu GEMINI_API_KEY en Vercel.',
    };
  }

  try {
    const rawJson = await callGeminiApi(prompt, systemInstruction, undefined, true);
    return JSON.parse(rawJson);
  } catch (err: any) {
    console.warn('Gemini routine audit fallback:', err);
    throw new Error(`Error en auditoría de rutina: ${err?.message || 'Error de servicio'}`);
  }
}

/**
 * Deterministic fallback generator when Gemini API Key is not set.
 */
function getFallbackDiagnosis(inciText: string, skinType: string, productName?: string): AiDiagnosisResult {
  const upper = inciText.toUpperCase();
  const hasNiacinamide = upper.includes('NIACINAMIDE');
  const hasHyaluronic = upper.includes('HYALURON') || upper.includes('HIALURON');
  const hasSalicylic = upper.includes('SALICYLIC');
  const hasRetinol = upper.includes('RETINOL') || upper.includes('RETIN');
  const hasVitaminC = upper.includes('ASCORB');
  const hasCeramide = upper.includes('CERAMIDE');
  const hasZinc = upper.includes('ZINC');

  const benefits: string[] = [];
  const precautions: string[] = [];
  let timing: 'AM' | 'PM' | 'BOTH' = 'BOTH';

  if (hasNiacinamide) benefits.push('Control fisiológico del sebo y unificación del tono');
  if (hasHyaluronic) benefits.push('Hidratación higroscópica profunda y turgencia dérmica');
  if (hasZinc) benefits.push('Acción seborreguladora y purificante antimicrobiana');
  if (hasCeramide) benefits.push('Reparación y sellado de la barrera cutánea lipídica');

  if (hasSalicylic) {
    benefits.push('Exfoliación lipofílica intraductal de poros y puntos negros');
    precautions.push('Puede sensibilizar al sol: uso recomendado en noche (PM) y SPF diario');
    timing = 'PM';
  }

  if (hasRetinol) {
    benefits.push('Estimulación de recambio celular y síntesis de colágeno');
    precautions.push('Introducir progresivamente (retinización) y evitar combinar en la misma noche con ácidos fuertes');
    timing = 'PM';
  }

  if (hasVitaminC) {
    benefits.push('Potente defensa antioxidante contra radicales libres y luminosidad');
    timing = 'AM';
  }

  if (benefits.length === 0) {
    benefits.push('Acondicionamiento y emoliencia dérmica');
    benefits.push('Mantenimiento del equilibrio cutáneo');
  }

  return {
    headline: `Fórmula funcional con alta biocompatibilidad dérmica`,
    clinicalVerdict: `El producto ${productName ? `"${productName}"` : 'analizado'} presenta una formulación equilibrada. Destaca por su capacidad para apoyar la homeostasis cutánea en piel ${skinType.toLowerCase()}, ofreciendo beneficios clave sin sobrecargar el manto hidrolipídico.`,
    suitabilityScore: 88,
    skinTypeMatch: {
      dry: hasHyaluronic || hasCeramide ? 'EXCELLENT' : 'GOOD',
      oily: hasSalicylic || hasNiacinamide || hasZinc ? 'EXCELLENT' : 'GOOD',
      combination: 'EXCELLENT',
      sensitive: hasRetinol || hasSalicylic ? 'CAUTION' : 'GOOD',
      acneProne: hasSalicylic || hasZinc || hasNiacinamide ? 'EXCELLENT' : 'NEUTRAL',
    },
    keyBenefits: benefits,
    precautions: precautions.length ? precautions : ['Realizar prueba de parche previa si tienes piel altamente reactiva.'],
    layeringAdvice: {
      step: 'Aplicar tras la limpieza facial sobre piel limpia y ligeramente húmeda',
      timing,
      frequency: hasRetinol || hasSalicylic ? '2 a 3 veces por semana de forma progresiva' : 'Uso diario (1 a 2 veces al día)',
      combineWith: ['Ácido Hialurónico', 'Pantenol', 'Ceramidas'],
      avoidCombiningWith: hasRetinol ? ['Ácido Glicólico en la misma capa', 'Vitamina C pura simultánea'] : ['Evitar sobre-exfoliación mecánica'],
    },
    plainLanguageSummary: `Producto bien tolerado y eficaz para mejorar la calidad y textura general de la piel.`,
    confidence: 0.90,
    modelUsed: 'Motor Heurístico Dermatológico (Configura GEMINI_API_KEY para síntesis LLM en vivo)',
  };
}
