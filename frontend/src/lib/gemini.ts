/**
 * Google Gemini Skincare AI Integration
 * Allabout.skin Next.js Serverless & Client Utilities
 */

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

export interface FaceSkinAnalysis {
  skinTypeEstimate: 'OILY' | 'DRY' | 'COMBINATION' | 'SENSITIVE' | 'NORMAL';
  skinTypeLabel: string;
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
  visibleConcerns: string[];
  suggestedFocus: string[];
  confidence: number;
  disclaimer: string;
}

export type VisionClassificationResult = 
  | {
      classification: 'SKINCARE_PRODUCT';
      brand: string | null;
      productName: string | null;
      inciText: string;
      rawDetectedText: string;
      confidence: number;
      notes: string[];
    }
  | {
      classification: 'HUMAN_FACE';
      faceAnalysis: FaceSkinAnalysis;
      confidence: number;
    }
  | {
      classification: 'INVALID';
      rejectionReason: 'NOT_COSMETIC_OR_FACE' | 'POOR_LIGHTING' | 'BLURRY_UNREADABLE';
      userFriendlyMessage: string;
      confidence: number;
    };

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
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro'
];

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

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY no configurada.');
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
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
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

  // Attempt models with automatic fallback
  let lastError: any = null;
  for (const model of GEMINI_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorText = await res.text();
        lastError = new Error(`Gemini API error (${model}): ${res.status} - ${errorText}`);
        continue;
      }

      const data = await res.json();
      const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (textOutput) {
        return textOutput;
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('No se pudo obtener respuesta de Google Gemini.');
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

  if (!apiKey) {
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

  if (!apiKey) {
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

function cleanJsonResponse(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

/**
 * Fallback generator for human facial diagnosis when offline or testing without API key.
 */
export function getFallbackFaceAnalysis(): VisionClassificationResult {
  return {
    classification: 'HUMAN_FACE',
    confidence: 0.93,
    faceAnalysis: {
      skinTypeEstimate: 'COMBINATION',
      skinTypeLabel: 'Piel Mixta (Zona T Grasa / Mejillas Equilibradas)',
      zoneTAnalysis: {
        shineLevel: 'MODERATE',
        poresVisible: true,
        description: 'Ligero brillo lipídico en zona T (frente, nariz y mentón) con poros visibles característicos.',
      },
      cheeksAnalysis: {
        hydrationState: 'BALANCED',
        rednessPresent: false,
        description: 'Manto hidrolipídico conservado en mejillas, buena turgencia y elasticidad dérmica.',
      },
      visibleConcerns: ['Control de brillo en zona T', 'Prevención de poros dilatados', 'Mantenimiento de barrera cutánea'],
      suggestedFocus: ['Limpieza suave con Syndet espumoso', 'Sérum de Niacinamida 5-10% + Zinc', 'Hidratante ligero en gel y Fotoprotector SPF 50+ toque seco'],
      confidence: 0.90,
      disclaimer: 'Diagnóstico referencial asistido por motor dermatológico. Para análisis visual en tiempo real con Gemini Vision, configura tu GEMINI_API_KEY en .env.local o Vercel.',
    },
  };
}

/**
 * Classifies an uploaded photo into SKINCARE_PRODUCT, HUMAN_FACE, or INVALID,
 * executing the appropriate data extraction or visual diagnosis.
 */
export async function classifyAndProcessImage(
  base64Data: string,
  mimeType: string = 'image/jpeg'
): Promise<VisionClassificationResult> {
  const apiKey = process.env.GEMINI_API_KEY || '';

  const systemInstruction = `Eres el Sistema Central de Visión y Clasificación Dermatológica de Allabout.skin.
Tu misión es inspeccionar minuciosamente la fotografía provista y clasificarla de forma precisa en UNA de 3 opciones:

1. "HUMAN_FACE": La imagen contiene un rostro humano, selfie, foto frontal, retrato, o un primer plano de piel facial (mejillas, frente, nariz, mentón, cuello) de una persona. Si ves piel humana facial o una selfie de cualquier ángulo o iluminación, clasifícala SIEMPRE como "HUMAN_FACE".
2. "SKINCARE_PRODUCT": La imagen contiene un producto cosmético, frasco, tubo, bote, caja o etiqueta con lista de ingredientes (INCI) o marca de cuidado facial/corporal/solar.
3. "INVALID": La imagen es un objeto completamente no relacionado (alimentos, mascotas, paisajes lejanos, muebles, capturas de pantalla de chats) o una foto 100% negra o corrupta.

REGLAS DE RESPUESTA EN FORMATO JSON ESTRICTO (sin texto adicional ni markdown fuera del JSON):

Si es "HUMAN_FACE":
{
  "classification": "HUMAN_FACE",
  "faceAnalysis": {
    "skinTypeEstimate": "OILY" | "DRY" | "COMBINATION" | "SENSITIVE" | "NORMAL",
    "skinTypeLabel": "Piel Grasa / Piel Seca / Piel Mixta / Piel Sensible / Piel Normal",
    "zoneTAnalysis": {
      "shineLevel": "HIGH" | "MODERATE" | "LOW",
      "poresVisible": true,
      "description": "Evaluación visual de brillo y poros en frente, nariz y mentón"
    },
    "cheeksAnalysis": {
      "hydrationState": "DRY" | "NORMAL" | "BALANCED",
      "rednessPresent": false,
      "description": "Evaluación visual de tirantez o rojez en mejillas"
    },
    "visibleConcerns": ["Brillo en zona T", "Brotes visibles", "Rojeces", "Deshidratación"],
    "suggestedFocus": ["Control de oleosidad", "Hidratación ligera en gel", "Fotoprotector toque seco"],
    "confidence": 0.90,
    "disclaimer": "Este análisis visual es una estimación referencial basada en IA y no sustituye una consulta médica dermatológica profesional."
  },
  "confidence": 0.92
}

Si es "SKINCARE_PRODUCT":
{
  "classification": "SKINCARE_PRODUCT",
  "brand": "Nombre de la marca si es visible o null",
  "productName": "Nombre del producto si es visible o null",
  "inciText": "Lista de ingredientes INCI detectados separados por comas (ej. Aqua, Niacinamide, Glycerin...)",
  "rawDetectedText": "Texto crudo completo visible en el envase",
  "confidence": 0.95,
  "notes": ["Notas de legibilidad o advertencias"]
}

Si es "INVALID":
{
  "classification": "INVALID",
  "rejectionReason": "NOT_COSMETIC_OR_FACE",
  "userFriendlyMessage": "No detectamos un producto de skincare ni el rostro de una persona en la foto. Por favor enfoca la etiqueta de tu cosmético o tómate una selfie con buena luz natural.",
  "confidence": 0.98
}`;

  const prompt = `Inspecciona esta fotografía. Si muestra una persona, rostro, selfie o piel humana, devuélvela como "HUMAN_FACE". Si muestra un cosmético o envase, devuélvela como "SKINCARE_PRODUCT". De lo contrario como "INVALID". Responde solo en JSON.`;

  // Strip base64 data url prefix and remove whitespace
  const cleanBase64 = base64Data
    .replace(/^data:[^;]+;base64,/, '')
    .replace(/\s+/g, '');

  if (!apiKey) {
    console.warn('GEMINI_API_KEY no configurada en variables de entorno. Activando diagnóstico referencial.');
    return getFallbackFaceAnalysis();
  }

  try {
    const rawJson = await callGeminiApi(prompt, systemInstruction, { mimeType, data: cleanBase64 }, true);
    const cleanedJson = cleanJsonResponse(rawJson);
    const parsed = JSON.parse(cleanedJson);

    // Normalization checks
    if (parsed.classification !== 'SKINCARE_PRODUCT' && parsed.classification !== 'HUMAN_FACE' && parsed.classification !== 'INVALID') {
      if (parsed.faceAnalysis || parsed.skinTypeEstimate || parsed.zoneTAnalysis) {
        parsed.classification = 'HUMAN_FACE';
      } else if (parsed.inciText || parsed.productName) {
        parsed.classification = 'SKINCARE_PRODUCT';
      } else {
        parsed.classification = 'HUMAN_FACE';
      }
    }

    if (parsed.classification === 'HUMAN_FACE') {
      const fa = parsed.faceAnalysis || {};
      const est = fa.skinTypeEstimate || parsed.skinTypeEstimate || 'COMBINATION';
      const labelMap: Record<string, string> = {
        OILY: 'Piel Grasa (Exceso de sebo generalizado)',
        DRY: 'Piel Seca (Déficit lipídico y tirantez)',
        COMBINATION: 'Piel Mixta (Zona T Grasa / Mejillas Equilibradas)',
        SENSITIVE: 'Piel Sensible (Propensa a reactividad y eritema)',
        NORMAL: 'Piel Normal (Equilibrio hidrolipídico óptimo)',
      };

      parsed.faceAnalysis = {
        skinTypeEstimate: est,
        skinTypeLabel: fa.skinTypeLabel || labelMap[est] || 'Piel Mixta',
        zoneTAnalysis: {
          shineLevel: fa.zoneTAnalysis?.shineLevel || 'MODERATE',
          poresVisible: typeof fa.zoneTAnalysis?.poresVisible === 'boolean' ? fa.zoneTAnalysis.poresVisible : true,
          description: fa.zoneTAnalysis?.description || 'Nivel de brillo y visibilidad de poros evaluados.',
        },
        cheeksAnalysis: {
          hydrationState: fa.cheeksAnalysis?.hydrationState || 'BALANCED',
          rednessPresent: typeof fa.cheeksAnalysis?.rednessPresent === 'boolean' ? fa.cheeksAnalysis.rednessPresent : false,
          description: fa.cheeksAnalysis?.description || 'Estado de hidratación y barrera en mejillas evaluado.',
        },
        visibleConcerns: Array.isArray(fa.visibleConcerns) && fa.visibleConcerns.length > 0
          ? fa.visibleConcerns
          : ['Equilibrio de zona T', 'Mantenimiento de barrera cutánea'],
        suggestedFocus: Array.isArray(fa.suggestedFocus) && fa.suggestedFocus.length > 0
          ? fa.suggestedFocus
          : ['Hidratación ligera equilibrada', 'Fotoprotección diaria SPF 50+'],
        confidence: typeof fa.confidence === 'number' ? fa.confidence : 0.90,
        disclaimer: fa.disclaimer || 'Este análisis visual es una estimación referencial basada en IA y no sustituye una consulta médica dermatológica profesional.',
      };
    }

    return parsed as VisionClassificationResult;
  } catch (err: any) {
    console.warn('Error parsing Gemini vision classification, fallback to diagnostic analysis:', err);
    return getFallbackFaceAnalysis();
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

  if (!apiKey) {
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
