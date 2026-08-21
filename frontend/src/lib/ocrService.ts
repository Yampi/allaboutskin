import { createWorker } from 'tesseract.js';

export interface OcrDetectionResult {
  rawText: string;
  cleanedText: string;
  labelType: 'FRONT_BRANDING' | 'BACK_INCI' | 'UNKNOWN';
  confidence: number;
  detectedBrand?: string;
  detectedProductName?: string;
  suggestedOfficialInci?: string;
  productFormat?: string;
  isSunscreen?: boolean;
  detectedPrice?: number | null;
}

// Curated Knowledge Base for Direct Front-of-Pack Product Recognition
export interface KnownProductCatalogItem {
  id: string;
  brand: string;
  name: string;
  aliases: string[];
  keywords: string[];
  officialInci: string;
  format: 'GEL_OR_LOTION' | 'CREAM_OR_BALM' | 'LIQUID_SERUM' | 'CLEANSING_WIPES' | 'EXFOLIATING_PADS' | 'MISCELLANEOUS';
  category: 'SUNSCREEN' | 'SERUM' | 'MOISTURIZER' | 'CLEANSER' | 'EXFOLIANT';
  suggestedPrice?: number;
}

export const KNOWN_PRODUCTS: KnownProductCatalogItem[] = [
  {
    id: 'hawaiian-tropic-ozono-duo-defense-50',
    brand: 'Hawaiian Tropic',
    name: 'Ozono Duo Defense Loción Protectora Solar FPS 50+',
    aliases: ['ozono duo defense', 'hawaiian tropic ozono', 'duo defense 50+', 'hawaiian tropic 50+'],
    keywords: ['hawaiian', 'tropic', 'ozono', 'duo defense', 'antipolucion', 'corales', '50+'],
    officialInci: 'Aqua, Homosalate, Octocrylene, Ethylhexyl Salicylate, Butyl Methoxydibenzoylmethane, Cetearyl Alcohol, Glycerin, VP/Eicosene Copolymer, Dimethicone, Tocopheryl Acetate, Aloe Barbadensis Leaf Juice, Phenoxyethanol, Parfum',
    format: 'GEL_OR_LOTION',
    category: 'SUNSCREEN',
    suggestedPrice: 14.99,
  },
  {
    id: 'isdin-fusion-water-50',
    brand: 'ISDIN',
    name: 'Fotoprotector Fusion Water Magic FPS 50',
    aliases: ['fusion water', 'isdin fusion water', 'isdin magic 50'],
    keywords: ['isdin', 'fusion water', 'magic', '50', 'oil control'],
    officialInci: 'Aqua, Octocrylene, Ethylhexyl Salicylate, Propanediol, Butyl Methoxydibenzoylmethane, Polymethyl Methacrylate, Dimethicone, Phenylbenzimidazole Sulfonic Acid, Polysilicone-15, Propylene Glycol Dicaprylate/Dicaprate, Tromethamine, Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine, Silica, Dimethicone/Vinyl Dimethicone Crosspolymer, 1,2-Hexanediol, Polysorbate 60, PEG-10 Dimethicone, Sodium Hyaluronate, Tocopheryl Acetate, Xanthan Gum, Caprylyl Glycol, Parfum, Disodium EDTA, PEG-8, Tocopherol, Ascorbyl Palmitate, Ascorbic Acid, Citric Acid',
    format: 'GEL_OR_LOTION',
    category: 'SUNSCREEN',
    suggestedPrice: 24.50,
  },
  {
    id: 'la-roche-posay-anthelios-uvmune-400',
    brand: 'La Roche-Posay',
    name: 'Anthelios UVMune 400 Fluido Invisible FPS 50+',
    aliases: ['anthelios', 'uvmune 400', 'la roche posay anthelios', 'fluido invisible anthelios'],
    keywords: ['roche-posay', 'roche posay', 'anthelios', 'uvmune', 'mexoryl', '400', 'fluido invisible'],
    officialInci: 'Aqua, Alcohol Denat., Triethyl Citrate, Diisopropyl Sebacate, Silica, Ethylhexyl Salicylate, Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine, Ethylhexyl Triazone, Butyl Methoxydibenzoylmethane, Glycerin, Propanediol, C12-22 Alkyl Acrylate/Hydroxyethylacrylate Copolymer, Methoxypropylamino Cyclohexenylidene Ethoxyethylcyanoacetate, Drometrizole Trisiloxane, Tocopherol, Caprylic/Capric Triglyceride, Acrylates/C10-30 Alkyl Acrylate Crosspolymer, Caprylyl Glycol, Hydroxyethylcellulose, Triethanolamine, Trisodium Ethylenediamine Disuccinate',
    format: 'GEL_OR_LOTION',
    category: 'SUNSCREEN',
    suggestedPrice: 22.00,
  },
  {
    id: 'the-ordinary-niacinamide-10-zinc-1',
    brand: 'The Ordinary',
    name: 'Niacinamide 10% + Zinc 1%',
    aliases: ['the ordinary niacinamida', 'ordinary zinc', 'niacinamide the ordinary'],
    keywords: ['ordinary', 'niacinamide 10%', 'zinc 1%', 'deciem'],
    officialInci: 'Aqua, Niacinamide, Pentylene Glycol, Zinc PCA, Dimethyl Isosorbide, Tamarindus Indica Seed Gum, Xanthan Gum, Isoceteth-20, Ethoxydiglycol, Phenoxyethanol, Chlorphenesin',
    format: 'LIQUID_SERUM',
    category: 'SERUM',
    suggestedPrice: 7.90,
  },
  {
    id: 'paulas-choice-2-bha-liquid',
    brand: "Paula's Choice",
    name: 'Skin Perfecting 2% BHA Liquid Exfoliant',
    aliases: ['paula choice bha', '2% bha liquid', 'salicylic acid paula choice'],
    keywords: ['paula', 'choice', 'bha', 'salicylic', 'skin perfecting', 'liquid exfoliant'],
    officialInci: 'Water (Aqua), Methylpropanediol, Butylene Glycol, Salicylic Acid, Polysorbate 20, Camellia Oleifera (Green Tea) Leaf Extract, Sodium Hydroxide, Tetrasodium EDTA',
    format: 'LIQUID_SERUM',
    category: 'EXFOLIANT',
    suggestedPrice: 35.00,
  },
  {
    id: 'cerave-moisturizing-cream',
    brand: 'CeraVe',
    name: 'Crema Hidratante para Piel Seca a Muy Seca',
    aliases: ['cerave crema', 'cerave moisturizing cream', 'cerave tarro'],
    keywords: ['cerave', 'moisturizing cream', 'crema hidratante', 'ceramidas', 'mve'],
    officialInci: 'Aqua / Water, Glycerin, Cetearyl Alcohol, Caprylic/Capric Triglyceride, Cetyl Alcohol, Ceteareth-20, Petrolatum, Potassium Phosphate, Ceramide NP, Ceramide AP, Ceramide EOP, Carbomer, Dimethicone, Behentrimonium Methosulfate, Sodium Lauroyl Lactylate, Sodium Hyaluronate, Cholesterol, Phenoxyethanol, Disodium EDTA, Dipotassium Phosphate, Tocopherol, Phytosphingosine, Xanthan Gum, Ethylhexylglycerin',
    format: 'CREAM_OR_BALM',
    category: 'MOISTURIZER',
    suggestedPrice: 16.50,
  },
];

/**
 * Preprocesses an image via HTML5 Canvas (high contrast, grayscale)
 * to maximize OCR recognition accuracy on cosmetic curves, glossy bottles, and glare.
 */
export async function preprocessImageForOcr(imageFile: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Limit dimensions for fast client performance while preserving legibility
        const maxDim = 1800;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        // Enhance contrast and grayscale
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        const contrastFactor = 1.35; // boost contrast

        for (let i = 0; i < data.length; i += 4) {
          // Luminance formula
          let gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          // Contrast
          gray = (gray - 128) * contrastFactor + 128;
          gray = Math.max(0, Math.min(255, gray));

          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });
}

/**
 * Runs real OCR on the image using Tesseract.js (Spanish + English)
 */
export async function performOpticalCharacterRecognition(
  imageSource: File | Blob | string,
  onProgress?: (progress: number, status: string) => void
): Promise<string> {
  let processedImageUrl: string;

  if (typeof imageSource === 'string') {
    processedImageUrl = imageSource;
  } else {
    onProgress?.(0.1, 'Optimizando contraste y nitidez de la etiqueta...');
    processedImageUrl = await preprocessImageForOcr(imageSource);
  }

  onProgress?.(0.25, 'Iniciando motor de visión óptica Tesseract...');
  const worker = await createWorker('spa+eng');

  try {
    onProgress?.(0.45, 'Escaneando texto y caracteres químicos...');
    const result = await worker.recognize(processedImageUrl);
    onProgress?.(0.95, 'Analizando estructura INCI y empaque...');
    return result.data.text || '';
  } finally {
    await worker.terminate();
  }
}

/**
 * Normalizes and cleans raw OCR text, fixing typical character recognition errors in cosmetic formulas.
 */
export function cleanOcrCosmeticText(rawText: string): string {
  if (!rawText) return '';

  let text = rawText
    // Standardize line endings and separators
    .replace(/\r\n/g, '\n')
    .replace(/[\u2022\u2023\u25E6\u2043\u2219|/•·*]/g, ', ')
    // Replace typical OCR errors for common chemical prefixes/suffixes
    .replace(/\bAqu4\b/gi, 'Aqua')
    .replace(/\b0xide\b/gi, 'Oxide')
    .replace(/\bNiacinam1de\b/gi, 'Niacinamide')
    .replace(/\bG1ycerin\b/gi, 'Glycerin')
    .replace(/\bPh3noxyethanol\b/gi, 'Phenoxyethanol')
    .replace(/\bDimethic0ne\b/gi, 'Dimethicone')
    .replace(/\bAlc0h0l\b/gi, 'Alcohol')
    .replace(/\bC0p0lymer\b/gi, 'Copolymer')
    // Remove "Ingredients:", "Ingredientes:", "INCI:" prefixes
    .replace(/^(?:ingredientes|ingredients|inci|composicion|contents|formula)\s*[:：\-]/im, '')
    // Remove batch codes or volume numbers if at start/end
    .replace(/\b(?:lote|lot|exp|cad|ref|ml|oz|fl\.?\s*oz)\s*[:#\d\/\.\-]+/gi, ' ')
    // Replace consecutive multiple commas or spaces
    .replace(/\s*,\s*,+/g, ', ')
    .replace(/[ \t]+/g, ' ')
    .trim();

  // If text is multi-line with words, join with commas if commas are sparse
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length > 1 && !text.includes(',')) {
    text = lines.join(', ');
  } else {
    text = lines.join(' ');
  }

  return text;
}

/**
 * Heuristic classifier to detect if the photographed label is FRONT_BRANDING or BACK_INCI
 */
export function analyzeCosmeticLabel(rawText: string): OcrDetectionResult {
  const normalized = rawText.toLowerCase();
  const cleaned = cleanOcrCosmeticText(rawText);

  // 1. Check for known catalog products (Front recognition)
  for (const item of KNOWN_PRODUCTS) {
    let matchCount = 0;
    for (const kw of item.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        matchCount++;
      }
    }
    // High match on keywords (e.g. "hawaiian", "tropic", "ozono", "duo defense", "50+")
    if (matchCount >= 2 || item.aliases.some((a) => normalized.includes(a.toLowerCase()))) {
      return {
        rawText,
        cleanedText: cleaned,
        labelType: 'FRONT_BRANDING',
        confidence: 0.95,
        detectedBrand: item.brand,
        detectedProductName: item.name,
        suggestedOfficialInci: item.officialInci,
        productFormat: item.format,
        isSunscreen: item.category === 'SUNSCREEN',
        detectedPrice: item.suggestedPrice || null,
      };
    }
  }

  // 2. Generic Sunscreen / Brand Front detection markers
  const frontMarkers = [
    'spf', 'fps', 'uva/uvb', 'broad spectrum', 'amplio espectro',
    'protector solar', 'locion protectora', 'sunscreen', 'sunblock',
    'duo defense', 'antipolucion', 'water resistant', 'muy alta proteccion',
    'resistente al agua', 'ultra-ligera', 'amigable con los corales',
    'crema facial', 'anti-arrugas', 'serum', 'loción', '180 ml', '50 ml', '200 ml'
  ];

  let frontScore = 0;
  for (const marker of frontMarkers) {
    if (normalized.includes(marker)) frontScore++;
  }

  // 3. INCI / Chemistry markers
  const inciMarkers = [
    'aqua', 'water', 'glycerin', 'cetearyl alcohol', 'dimethicone',
    'phenoxyethanol', 'parfum', 'fragrance', 'disodium edta', 'sodium hyaluronate',
    'carbomer', 'xanthan gum', 'tocopherol', 'tocopheryl acetate',
    'homosalate', 'octocrylene', 'ethylhexyl', 'butyl methoxydibenzoylmethane',
    'zinc oxide', 'titanium dioxide', 'propanediol', 'butylene glycol', 'niacinamide'
  ];

  let inciScore = 0;
  for (const marker of inciMarkers) {
    if (normalized.includes(marker)) inciScore++;
  }

  const commaCount = (cleaned.match(/,/g) || []).length;

  // Determine type
  if (inciScore >= 3 || (commaCount >= 4 && inciScore >= 1)) {
    return {
      rawText,
      cleanedText: cleaned,
      labelType: 'BACK_INCI',
      confidence: Math.min(0.98, 0.6 + inciScore * 0.08),
      isSunscreen: frontScore >= 2 && (normalized.includes('spf') || normalized.includes('fps')),
    };
  }

  if (frontScore >= 2 || normalized.includes('hawaiian tropic') || normalized.includes('protector solar')) {
    // Extract potential product title
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 2);
    const candidateName = lines.slice(0, 3).join(' ') || 'Producto Cosmético / Solar';

    return {
      rawText,
      cleanedText: candidateName,
      labelType: 'FRONT_BRANDING',
      confidence: 0.85,
      detectedProductName: candidateName,
      isSunscreen: frontScore >= 1,
    };
  }

  return {
    rawText,
    cleanedText: cleaned,
    labelType: 'UNKNOWN',
    confidence: 0.5,
  };
}
