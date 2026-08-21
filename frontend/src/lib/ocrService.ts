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
    id: 'dernier-protector-solar-facial-50',
    brand: 'DERNIER Cosmetics',
    name: 'Protector Solar Facial FPS 50+ Toque Seco',
    aliases: ['dernier protector solar', 'dernier solar facial', 'dernier facial 50', 'dernier 50+', 'protector solar dernier', 'dernier cosmetics'],
    keywords: ['dernier', 'protector', 'solar', 'facial', 'toque seco', '50+', 'h509', 'dernier cosmetics', 'fps 50+'],
    officialInci: 'Aqua, Octocrylene, Ethylhexyl Methoxycinnamate, Ethylhexyl Salicylate, Butyl Methoxydibenzoylmethane, Titanium Dioxide, Glycerin, Cetearyl Alcohol, Dimethicone, Tocopheryl Acetate, Phenoxyethanol, Ethylhexylglycerin, Xanthan Gum, Disodium EDTA',
    format: 'GEL_OR_LOTION',
    category: 'SUNSCREEN',
    suggestedPrice: 12.50,
  },
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
    id: 'eucerin-sun-oil-control-50',
    brand: 'Eucerin',
    name: 'Sun Gel-Creme Oil Control Toque Seco FPS 50+',
    aliases: ['eucerin oil control', 'eucerin solar', 'eucerin sun 50', 'oil control eucerin'],
    keywords: ['eucerin', 'oil control', 'sun gel-cream', 'toque seco', 'carnitina', '50+'],
    officialInci: 'Aqua, C12-15 Alkyl Benzoate, Alcohol Denat., Butyl Methoxydibenzoylmethane, Butylene Glycol Dicaprylate/Dicaprate, Ethylhexyl Triazone, Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine, Silica, Tapioca Starch, Phenylbenzimidazole Sulfonic Acid, Carnitine, Glycyrrhiza Inflata Root Extract, Glycyrrhetinic Acid, Glycerin, Cetearyl Alcohol, Xanthan Gum, Sodium Hydroxide, Trisodium EDTA, Phenoxyethanol, Ethylhexylglycerin',
    format: 'GEL_OR_LOTION',
    category: 'SUNSCREEN',
    suggestedPrice: 22.00,
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
    id: 'neutrogena-sun-fresh-50',
    brand: 'Neutrogena',
    name: 'Sun Fresh Derm Care FPS 50+',
    aliases: ['neutrogena sun fresh', 'neutrogena solar', 'sun fresh 50'],
    keywords: ['neutrogena', 'sun fresh', 'derm care', 'helioplex', '50+'],
    officialInci: 'Aqua, Homosalate, Octocrylene, Butyl Methoxydibenzoylmethane, Ethylhexyl Salicylate, Methylene Bis-Benzotriazolyl Tetramethylbutylphenol, Glycerin, Niacinamide, Silica, Caprylyl Methicone, Aluminum Starch Octenylsuccinate, Dimethicone, Phenoxyethanol, Glyceryl Stearate, PEG-100 Stearate, Tocopheryl Acetate, Disodium EDTA, Parfum',
    format: 'GEL_OR_LOTION',
    category: 'SUNSCREEN',
    suggestedPrice: 15.00,
  },
  {
    id: 'bioderma-photoderm-aquafluide-50',
    brand: 'Bioderma',
    name: 'Photoderm Aquafluide FPS 50+ Toque Seco',
    aliases: ['bioderma photoderm', 'photoderm aquafluide', 'photoderm max 50'],
    keywords: ['bioderma', 'photoderm', 'aquafluide', 'toque seco', '50+'],
    officialInci: 'Aqua, Dicaprylyl Carbonate, Octocrylene, Methylene Bis-Benzotriazolyl Tetramethylbutylphenol, Butyl Methoxydibenzoylmethane, Glycerin, Methyl Methacrylate Crosspolymer, Cyclohexasiloxane, Ectoin, Mannitol, Xylitol, Rhamnose, Fructooligosaccharides, Laminaria Ochroleuca Extract, Decyl Glucoside, C20-22 Alkyl Phosphate, C20-22 Alcohols, Xanthan Gum, Disodium EDTA, Sodium Hydroxide, Propylene Glycol, Citric Acid, Phenoxyethanol',
    format: 'GEL_OR_LOTION',
    category: 'SUNSCREEN',
    suggestedPrice: 21.00,
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
export function cleanOcrCosmeticText(rawText: string, isFrontPack = false): string {
  if (!rawText) return '';

  let text = rawText
    // Standardize line endings and separators
    .replace(/\r\n/g, '\n')
    .replace(/[\u2022\u2023\u25E6\u2043\u2219|/•·*]/g, isFrontPack ? ' ' : ', ')
    // Fix optical OCR errors on Sunscreen SPF badges (e.g. €H509, 5PF 50+, FP5 50+)
    .replace(/\b(?:€H509|€H50\+|€H50|5PF\s*50\+|FP5\s*50\+|SPF50\+|FPS50\+)\b/gi, 'SPF 50+')
    .replace(/\b(?:5PF|FP5)\b/gi, 'SPF')
    .replace(/\b(?:D3rni3r|Dernler|DERNlER)\b/gi, 'DERNIER')
    .replace(/\b(?:Cosmetlcs|C0smet1cs)\b/gi, 'COSMETICS')
    .replace(/\b(?:Pr0tect0r|Pr0tector)\b/gi, 'Protector')
    .replace(/\b(?:S0lar|Solaг)\b/gi, 'Solar')
    .replace(/\b(?:Fac1al|FaclaI)\b/gi, 'Facial')
    .replace(/\b(?:Toqu3|T0que)\b/gi, 'Toque')
    .replace(/\b(?:Sec0|S3co)\b/gi, 'Seco')
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
    .replace(/\b(?:lote|lot|exp|cad|ref)\s*[:#\d\/\.\-]+/gi, ' ')
    // Replace consecutive multiple commas or spaces
    .replace(/\s*,\s*,+/g, ', ')
    .replace(/[ \t]+/g, ' ')
    .trim();

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  if (isFrontPack) {
    // If it's a front label, join lines with clean spaces to form a coherent product name query
    text = lines.join(' ').replace(/\s+,/g, '').replace(/,\s+/g, ' ').replace(/\s+/g, ' ').trim();
  } else {
    // If it's a back INCI formula with newlines and without commas, join with commas
    if (lines.length > 1 && !text.includes(',')) {
      text = lines.join(', ');
    } else {
      text = lines.join(' ');
    }
  }

  return text;
}

/**
 * Robust heuristic classifier to detect if the photographed label is FRONT_BRANDING, BACK_INCI, or UNKNOWN
 */
export function analyzeCosmeticLabel(rawText: string): OcrDetectionResult {
  // Normalize whitespace into single spaces for robust phrase matching across OCR line breaks
  const flatNormalized = rawText
    .toLowerCase()
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 1. Check for known catalog products (Front recognition)
  for (const item of KNOWN_PRODUCTS) {
    let matchCount = 0;
    for (const kw of item.keywords) {
      if (flatNormalized.includes(kw.toLowerCase())) {
        matchCount++;
      }
    }
    // High match on keywords or aliases (e.g. Dernier + protector + solar + facial)
    if (matchCount >= 2 || item.aliases.some((a) => flatNormalized.includes(a.toLowerCase()))) {
      const cleanFrontText = cleanOcrCosmeticText(rawText, true);
      return {
        rawText,
        cleanedText: cleanFrontText,
        labelType: 'FRONT_BRANDING',
        confidence: 0.96,
        detectedBrand: item.brand,
        detectedProductName: item.name,
        suggestedOfficialInci: item.officialInci,
        productFormat: item.format,
        isSunscreen: item.category === 'SUNSCREEN',
        detectedPrice: item.suggestedPrice || null,
      };
    }
  }

  // 2. Generic Sunscreen & Front-of-pack Branding terms
  const frontPhrases = [
    'protector solar', 'bloqueador solar', 'fotoprotector', 'sunscreen', 'sunblock',
    'locion protectora', 'crema facial', 'protector facial', 'toque seco', 'dry touch',
    'oil free', 'libre de grasa', 'anti-brillo', 'amplio espectro', 'broad spectrum',
    'uva/uvb', 'uva uvb', 'muy alta proteccion', 'alta proteccion', 'water resistant',
    'resistente al agua', 'ultra ligera', 'ultra-ligera', 'amigable con los corales',
    'dermatologicamente probado', 'dermatologist tested', 'anti-edad', 'anti-arrugas',
    'aclarante', 'hidratante', 'agua micelar', 'toallitas desmaquillantes', 'espuma limpiadora',
    'gel limpiador', 'suero facial', 'serum', 'contorno de ojos', 'spf', 'fps', 'fps 50',
    'spf 50', 'spf 30', 'fps 30', 'net wt', 'cont. neto', 'contenido neto', '180 ml',
    '120 ml', '100 ml', '50 ml', '40 ml', '30 ml', '50g', '60g'
  ];

  const cosmeticBrands = [
    'dernier', 'isdin', 'la roche-posay', 'roche posay', 'eucerin', 'neutrogena',
    'nivea', 'bioderma', 'avene', 'vichy', 'cetaphil', 'cerave', 'the ordinary',
    "paula's choice", 'garnier', "l'oreal", 'valmy', 'babe', 'sesderma',
    'sunstop', 'umbra', 'hawaiian tropic', 'clinique', 'farmatodo'
  ];

  let frontScore = 0;
  for (const phrase of frontPhrases) {
    if (flatNormalized.includes(phrase)) frontScore++;
  }

  let brandFound: string | undefined = undefined;
  for (const brand of cosmeticBrands) {
    if (flatNormalized.includes(brand)) {
      brandFound = brand.toUpperCase();
      frontScore += 2;
    }
  }

  // 3. INCI / Chemical Formulation markers (Exclusive to formula ingredient lists)
  const chemicalInciMarkers = [
    'aqua', 'water', 'glycerin', 'cetearyl alcohol', 'dimethicone', 'phenoxyethanol',
    'parfum', 'fragrance', 'disodium edta', 'sodium hyaluronate', 'carbomer',
    'xanthan gum', 'tocopherol', 'tocopheryl acetate', 'homosalate', 'octocrylene',
    'ethylhexyl', 'butyl methoxydibenzoylmethane', 'zinc oxide', 'titanium dioxide',
    'propanediol', 'butylene glycol', 'niacinamide', 'salicylic acid', 'glycolic acid',
    'lactic acid', 'caprylic/capric triglyceride', 'stearate', 'palmitate',
    'potassium phosphate', 'sodium hydroxide', 'triethanolamine', 'cetyl alcohol',
    'sorbitan', 'polysorbate', 'citric acid', 'benzoic acid', 'ethylhexylglycerin',
    'alcohol denat', 'methacrylate', 'copolymer', 'acrylates', 'extract', 'oil',
    'seed oil', 'leaf extract', 'root extract', 'hydroxyethylcellulose', 'peg-'
  ];

  let inciScore = 0;
  for (const marker of chemicalInciMarkers) {
    if (flatNormalized.includes(marker)) inciScore++;
  }

  const hasInciHeader = /(?:ingredientes|ingredients|inci|composicion|contents)\s*[:：\-]/i.test(rawText);
  const commaCount = (rawText.match(/,/g) || []).length;

  // CLASSIFICATION LOGIC:
  // BACK_INCI: Genuine chemical ingredient list
  if (hasInciHeader || inciScore >= 3 || (inciScore >= 2 && commaCount >= 4 && frontScore <= 1)) {
    const cleanedInci = cleanOcrCosmeticText(rawText, false);
    return {
      rawText,
      cleanedText: cleanedInci,
      labelType: 'BACK_INCI',
      confidence: Math.min(0.98, 0.7 + inciScore * 0.06),
      isSunscreen: flatNormalized.includes('spf') || flatNormalized.includes('fps') || flatNormalized.includes('solar'),
    };
  }

  // FRONT_BRANDING: Commercial front with product title / marketing claims
  if (frontScore >= 2 || brandFound || flatNormalized.includes('protector solar') || flatNormalized.includes('solar facial')) {
    const cleanedTitle = cleanOcrCosmeticText(rawText, true);
    return {
      rawText,
      cleanedText: cleanedTitle,
      labelType: 'FRONT_BRANDING',
      confidence: 0.90,
      detectedBrand: brandFound,
      detectedProductName: cleanedTitle || (brandFound ? `${brandFound} Cosmético` : 'Producto Cosmético'),
      isSunscreen: frontScore >= 1 || flatNormalized.includes('solar') || flatNormalized.includes('spf') || flatNormalized.includes('fps'),
    };
  }

  // UNKNOWN: Inconclusive / insufficient text
  const defaultClean = cleanOcrCosmeticText(rawText, false);
  return {
    rawText,
    cleanedText: defaultClean,
    labelType: 'UNKNOWN',
    confidence: 0.40,
  };
}
