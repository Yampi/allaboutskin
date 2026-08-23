import { ActiveIngredient, ProductShelfItem, CyclePhaseData, UserProfile, InciScanResult } from './types';

export const initialUserProfile: UserProfile = {
  name: 'Lucía G.',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  skinType: 'Piel Mixta',
  secondaryBiotype: 'Sensible',
  conditions: ['Zona T Reactiva', 'Deshidratación Leve', 'Sensibilidad a Fragancias'],
  barrierStatus: 'Saludable y Óptima',
  barrierScore: 94,
  tewlScore: '8.2 g/h/m²',
  hydrationLevel: '89%',
  cycleStreakDays: 18,
  activeNight: 3,
  totalCyclesCompleted: 4
};

export const activeIngredientsList: ActiveIngredient[] = [
  {
    id: 'niacinamida',
    name: 'Niacinamida',
    inci: 'NIACINAMIDE',
    casNumber: '98-92-0',
    category: 'barrier',
    categoryLabel: 'Barrera & Textura',
    shortDescription: 'Vitamina B3 fisiológica que refuerza la barrera lipídica, reduce la pérdida de agua transepidérmica (TEWL) y seborregula.',
    clinicalDescription: 'Precursor directo de coenzimas redox NAD+ y NADP+. Estimula la síntesis de ceramidas endógenas (glucosilceramidas y esfingomielina), estabiliza la barrera epidérmica y atenúa la transferencia de melanosomas hacia queratinocitos.',
    molecularWeight: '122.12 Da',
    recommendedConcentration: '2% — 5%',
    optimalPh: '5.5 — 6.5',
    pubmedCount: 3420,
    cosingId: '35637',
    assignedCyclePhase: 'Noche 3 & 4 (Recuperación)',
    phaseId: 3,
    macroImage: 'https://images.unsplash.com/photo-1608248597359-25f0a82b3d7a?auto=format&fit=crop&w=600&q=80',
    textureType: 'Sérum Fluido Acuoso / Gel Liposomado',
    benefits: ['Síntesis de Ceramidas +34%', 'Regulación de Sebo', 'Reducción de Eritema', 'Atenuación de Poros'],
    synergies: ['Ácido Hialurónico', 'Zinc PCA', 'Ceramidas', 'Pantenol'],
    contraindications: ['Vitamina C pura L-Ascórbico a pH ultra-ácido (<3.0) en mezclas caseras no formuladas'],
    clinicalStudies: [
      {
        title: 'Niacinamide: A review of its role in cutaneous biology and clinical dermatology',
        journal: 'Dermatol Surg',
        year: 2021,
        doi: '10.1111/dsu.12874',
        pmid: '34120982'
      },
      {
        title: 'Topical niacinamide enhances stratum corneum lipid levels and improves epidermal permeability barrier',
        journal: 'Br J Dermatol',
        year: 2020,
        doi: '10.1111/bjd.13982',
        pmid: '16029679'
      }
    ]
  },
  {
    id: 'retinol',
    name: 'Retinol',
    inci: 'RETINOL',
    casNumber: '68-26-8',
    category: 'retinoid',
    categoryLabel: 'Renovación Celular',
    shortDescription: 'Molécula estándar de oro dermatológico en recambio epidérmico, inducción de procolágeno I/III y remodelación dérmica.',
    clinicalDescription: 'Se biotransforma enzimáticamente en el queratinocito a retinaldehído y ácido retinoico. Modula la transcripción génica vía receptores nucleares RAR/RXR, acelerando la cinética epidérmica.',
    molecularWeight: '286.45 Da',
    recommendedConcentration: '0.1% — 0.5%',
    optimalPh: '5.5 — 6.5',
    pubmedCount: 8940,
    cosingId: '37351',
    assignedCyclePhase: 'Noche 2 (Retinoides)',
    phaseId: 2,
    macroImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
    textureType: 'Emulsión Cremosa Microencapsulada',
    benefits: ['Acelera Ciclo Celular a 21 días', 'Inducción de Neocolagénesis', 'Atenuación de Arrugas Finas', 'Unificación del Tono'],
    synergies: ['Escualano', 'Bisabolol', 'Ceramidas', 'Centella Asiática'],
    contraindications: ['Ácidos AHA/BHA concentrados en la misma aplicación', 'Exposición UV directa'],
    clinicalStudies: [
      {
        title: 'Mechanisms of Retinoid Action in Skin Aging and Photodamage Repair',
        journal: 'J Invest Dermatol',
        year: 2022,
        doi: '10.1016/jid.2021.11.012',
        pmid: '35012410'
      }
    ]
  },
  {
    id: 'acido-salicilico',
    name: 'Ácido Salicílico',
    inci: 'SALICYLIC ACID',
    casNumber: '69-72-7',
    category: 'exfoliant',
    categoryLabel: 'Exfoliante BHA',
    shortDescription: 'Beta-hidroxiácido lipofílico que penetra el infundíbulo folicular desobstruyendo poros y disolviendo tapones de sebo.',
    clinicalDescription: 'Disuelve las uniones desmosómicas en el estrato córneo superior mediante su solubilidad en lípidos cutáneos. Ejerce propiedades antiinflamatorias y queratolíticas.',
    molecularWeight: '138.12 Da',
    recommendedConcentration: '0.5% — 2.0%',
    optimalPh: '3.2 — 3.8',
    pubmedCount: 5120,
    cosingId: '37482',
    assignedCyclePhase: 'Noche 1 (Exfoliación Química)',
    phaseId: 1,
    macroImage: 'https://images.unsplash.com/photo-1570554886111-e80fcca6a029?auto=format&fit=crop&w=600&q=80',
    textureType: 'Solución Líquida Exfoliante Astringente',
    benefits: ['Disolución de Comedones', 'Acción Queratolítica Lipofílica', 'Anti-inflamatorio Local', 'Clarificación Poral'],
    synergies: ['Pantenol', 'Glicerina', 'Ácido Hialurónico', 'Té Verde'],
    contraindications: ['Retinol simultáneo en la misma noche', 'Exfoliantes mecánicos abrasivos'],
    clinicalStudies: [
      {
        title: 'Salicylic acid as a peeling agent: a comprehensive clinical overview',
        journal: 'Clin Cosmet Investig Dermatol',
        year: 2021,
        doi: '10.2147/CCID.S298132',
        pmid: '26315534'
      }
    ]
  },
  {
    id: 'acido-hialuronico',
    name: 'Ácido Hialurónico',
    inci: 'SODIUM HYALURONATE',
    casNumber: '9067-32-7',
    category: 'barrier',
    categoryLabel: 'Hidratación Profunda',
    shortDescription: 'Glicosaminoglicano endógeno con capacidad higroscópica de retener hasta 1,000 veces su peso molecular en agua.',
    clinicalDescription: 'Matriz extracelular clave. La combinación de alto peso molecular (filmógeno superficial) y bajo peso molecular (<50 kDa) hidrata en profundidad y devuelve turgencia celular.',
    molecularWeight: '10 kDa — 1.8 MDa',
    recommendedConcentration: '0.2% — 2.0%',
    optimalPh: '4.5 — 7.0',
    pubmedCount: 12450,
    cosingId: '38129',
    assignedCyclePhase: 'Noche 3 & 4 (Recuperación)',
    phaseId: 4,
    macroImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
    textureType: 'Gotas de Sérum Viscoso Cristalino',
    benefits: ['Hidratación Multi-Estrato', 'Reducción de Micro-Relieve', 'Efecto Relleno / Turgencia', 'Reparación Tisular'],
    synergies: ['Ceramidas', 'Niacinamida', 'Pantenol', 'Escualano'],
    contraindications: ['Ambientes extremadamente secos (<15% HR) sin sellador oclusivo superior'],
    clinicalStudies: [
      {
        title: 'Hyaluronic acid in dermatology: from physiology to transdermal delivery',
        journal: 'Dermatol Ther',
        year: 2022,
        doi: '10.1007/s13555-021-00624-9',
        pmid: '34822143'
      }
    ]
  },
  {
    id: 'pantenol',
    name: 'Pantenol (Provitamina B5)',
    inci: 'PANTHENOL',
    casNumber: '81-13-0',
    category: 'soothing',
    categoryLabel: 'Cicatrización & Calma',
    shortDescription: 'Precursor del ácido pantoténico y coenzima A, acelerador crítico de la reepitelización y mitigador de rojeces.',
    clinicalDescription: 'Aumenta la síntesis de lípidos del estrato córneo, estimula la proliferación de fibroblastos dérmicos y preserva la elasticidad tisular tras estrés químico.',
    molecularWeight: '205.25 Da',
    recommendedConcentration: '1% — 5%',
    optimalPh: '4.0 — 7.0',
    pubmedCount: 2180,
    cosingId: '36014',
    assignedCyclePhase: 'Noche 3 & 4 (Recuperación)',
    phaseId: 3,
    macroImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    textureType: 'Bálsamo Calmante / Emulsión Nutritiva',
    benefits: ['Acelera Cicatrización +40%', 'Alivio Inmediato del Prurito', 'Refuerzo de la Barrera Fisiológica', 'Disminución del Eritema'],
    synergies: ['Madecassoside (Centella)', 'Ceramidas', 'Glicerina', 'Bisabolol'],
    contraindications: ['Hipersensibilidad a derivados de ácido pantoténico'],
    clinicalStudies: [
      {
        title: 'Topical use of dexpanthenol in skin disorders: clinical efficacy',
        journal: 'J Dermatolog Treat',
        year: 2021,
        doi: '10.1080/09546634.2020.1804245',
        pmid: '32808845'
      }
    ]
  },
  {
    id: 'ceramidas',
    name: 'Complejo de Ceramidas (NP, AP, EOP)',
    inci: 'CERAMIDE NP, CERAMIDE AP, CERAMIDE EOP',
    casNumber: '100403-19-8',
    category: 'barrier',
    categoryLabel: 'Cemento Intercelular',
    shortDescription: 'Lípidos biomiméticos que representan el 50% de la matriz bilipídica del estrato córneo de la piel.',
    clinicalDescription: 'Estructura laminar intercorneocítica indispensable. Las ceramidas de cadena larga (EOP) y polares (NP/AP) sellan los espacios entre queratinocitos impidiendo el TEWL.',
    molecularWeight: '580 — 660 Da',
    recommendedConcentration: '0.2% — 1.5%',
    optimalPh: '5.0 — 6.0',
    pubmedCount: 4890,
    cosingId: '55381',
    assignedCyclePhase: 'Noche 3 & 4 (Recuperación)',
    phaseId: 3,
    macroImage: 'https://images.unsplash.com/photo-1512290900672-1f553315a6cf?auto=format&fit=crop&w=600&q=80',
    textureType: 'Crema Reparadora Lamelar / Emulsión Densa',
    benefits: ['Restauración de Barrera Cutánea', 'Retención Lipídica Prolongada', 'Protección Frente a Alérgenos', 'Tolerancia en Piel Atópica'],
    synergies: ['Colesterol 3:1:1', 'Ácidos Grasos Libres', 'Pantenol', 'Niacinamida'],
    contraindications: ['Ninguna incompatibilidad biológica conocida'],
    clinicalStudies: [
      {
        title: 'Skin barrier function and physiological lipid replacement therapy',
        journal: 'Dermatol Clin',
        year: 2023,
        doi: '10.1016/j.det.2022.10.003',
        pmid: '36872019'
      }
    ]
  },
  {
    id: 'centella-asiatica',
    name: 'Centella Asiática (Madecassoside)',
    inci: 'MADECASSOSIDE, ASIATICOSIDE',
    casNumber: '34540-22-2',
    category: 'soothing',
    categoryLabel: 'Fito-Calmante Cica',
    shortDescription: 'Triterpenoide botánico con alta bioactividad antiinflamatoria, antienzimática (anti-MMP-1) y reparadora.',
    clinicalDescription: 'Inhibe citoquinas proinflamatorias (TNF-alfa, IL-1beta) y promueve la síntesis de colágeno en la dermis papilar, contrarrestando la irritación transitoria.',
    molecularWeight: '975.1 Da',
    recommendedConcentration: '0.1% — 1.0%',
    optimalPh: '5.0 — 7.0',
    pubmedCount: 1780,
    cosingId: '57629',
    assignedCyclePhase: 'Noche 3 (Recuperación de Barrera)',
    phaseId: 3,
    macroImage: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80',
    textureType: 'Extracto Botánico Purificado / Gel Calmante',
    benefits: ['Alivio de Micro-Inflamación', 'Inhibición de MMP-1', 'Refuerzo Microvascular', 'Aceleración Reepitelizante'],
    synergies: ['Pantenol', 'Ceramidas', 'Alantoína', 'Avena Coloidal'],
    contraindications: ['Alergia a plantas de la familia Apiaceae'],
    clinicalStudies: [
      {
        title: 'Therapeutic potential of Centella asiatica and madecassoside in skin disorders',
        journal: 'Phytomedicine',
        year: 2021,
        doi: '10.1016/j.phymed.2021.153724',
        pmid: '34678523'
      }
    ]
  },
  {
    id: 'escualano',
    name: 'Escualano Vegetal Puro',
    inci: 'SQUALANE',
    casNumber: '111-01-3',
    category: 'barrier',
    categoryLabel: 'Lípido Oclusivo Fisiológico',
    shortDescription: 'Hidrocarburo saturado bio-idéntico al sebo cutáneo natural (13%), no comedogénico y biomimético.',
    clinicalDescription: 'Forma una micro-película transpirable que reduce drásticamente el TEWL sin ocluir los poros ni interferir con la respiración cutánea.',
    molecularWeight: '422.81 Da',
    recommendedConcentration: '100% Puro o 2% — 15%',
    optimalPh: 'Fórmula anhidra / 5.5 — 7.0',
    pubmedCount: 1450,
    cosingId: '38139',
    assignedCyclePhase: 'Noche 4 (Nutrición & Sello)',
    phaseId: 4,
    macroImage: 'https://images.unsplash.com/photo-1608248597359-25f0a82b3d7a?auto=format&fit=crop&w=600&q=80',
    textureType: 'Aceite Seco Lipídico Sedoso No Graso',
    benefits: ['Sellado Oclusivo Transpirable', 'Suavidad y Flexibilidad Inmediata', 'No Comedogénico (Grado 0)', 'Estabilidad Frente a Oxidación'],
    synergies: ['Retinol (como base buffer)', 'Ácido Hialurónico', 'Ceramidas'],
    contraindications: ['Ninguna'],
    clinicalStudies: [
      {
        title: 'Biological and pharmacological properties of squalene and squalane',
        journal: 'Molecules',
        year: 2020,
        doi: '10.3390/molecules25112521',
        pmid: '32485994'
      }
    ]
  }
];

export const productShelfList: ProductShelfItem[] = [
  {
    id: 'cicaplast-b5',
    name: 'Cicaplast Baume B5+',
    brand: 'La Roche-Posay',
    category: 'Bálsamo Reparador',
    volume: '40 ml',
    paoMonths: 6,
    inciScore: 98,
    primaryActives: ['Madecassoside 1%', 'Pantenol 5%', 'Tribioma Prebiótico', 'Cobre-Zinc'],
    assignedPhase: 3,
    assignedPhaseName: 'Noche 3: Recuperación 1',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
    textureNote: 'Bálsamo denso reconfortante'
  },
  {
    id: 'squalane-oil',
    name: '100% Plant-Derived Squalane',
    brand: 'The Ordinary',
    category: 'Lípido Oclusivo',
    volume: '30 ml',
    paoMonths: 12,
    inciScore: 100,
    primaryActives: ['Squalane Puro 100%'],
    assignedPhase: 4,
    assignedPhaseName: 'Noche 4: Recuperación 2',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80',
    textureNote: 'Aceite ligero de rápida absorción'
  },
  {
    id: 'paulas-bha',
    name: 'Skin Perfecting 2% BHA Liquid',
    brand: "Paula's Choice",
    category: 'Exfoliante Químico',
    volume: '118 ml',
    paoMonths: 12,
    inciScore: 96,
    primaryActives: ['Salicylic Acid 2%', 'Green Tea Extract', 'Methylpropanediol'],
    assignedPhase: 1,
    assignedPhaseName: 'Noche 1: Exfoliación',
    image: 'https://images.unsplash.com/photo-1570554886111-e80fcca6a029?auto=format&fit=crop&w=400&q=80',
    textureNote: 'Líquido penetrante'
  },
  {
    id: 'retinol-ceramides',
    name: 'Retinol 0.3% + Bisabolol Serum',
    brand: 'SkinCeuticals',
    category: 'Sérum Renovador',
    volume: '30 ml',
    paoMonths: 6,
    inciScore: 94,
    primaryActives: ['Retinol Puro 0.3%', 'Bisabolol', 'Boswellia Serrata'],
    assignedPhase: 2,
    assignedPhaseName: 'Noche 2: Retinoides',
    image: 'https://images.unsplash.com/photo-1608248597359-25f0a82b3d7a?auto=format&fit=crop&w=400&q=80',
    textureNote: 'Emulsión cremosa sedosa'
  },
  {
    id: 'hyalu-b5',
    name: 'Hyalu B5 Serum Concentré',
    brand: 'La Roche-Posay',
    category: 'Sérum Hidratante',
    volume: '30 ml',
    paoMonths: 12,
    inciScore: 97,
    primaryActives: ['Ácido Hialurónico Dúo', 'Pantenol 5%', 'Madecassoside'],
    assignedPhase: 3,
    assignedPhaseName: 'Noche 3 & 4: Recuperación',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
    textureNote: 'Gel acuoso de absorción inmediata'
  }
];

export const cyclePhasesMatrix: CyclePhaseData[] = [
  {
    phaseNumber: 1,
    nightName: 'Noche 1',
    phaseTitle: 'Exfoliación Química',
    badgeLabel: 'AHA / BHA',
    accentColor: '#DFCAAC',
    bgSubtleColor: '#FAF5EE',
    keyActives: ['Ácido Salicílico (BHA)', 'Ácido Glicólico / Láctico (AHA)', 'Extracto de Té Verde'],
    clinicalGoal: 'Desprender células queratinizadas oxidadas, limpiar poros en profundidad y maximizar la permeabilidad celular para las noches siguientes.',
    barrierImpact: 'Estrés queratolítico controlado. Evitar oclusivos pesados encima.',
    steps: [
      {
        id: 'step-1-1',
        stepNumber: 1,
        title: 'Limpieza Syndet Fisiológica',
        productName: 'Limpiador Hidratante pH 5.5 sin sulfatos',
        category: 'Limpieza',
        timing: '1 min masaje',
        instruction: 'Aplica sobre piel húmeda con movimientos circulares suaves. Seca a toques suaves con toalla limpia.',
        completed: true
      },
      {
        id: 'step-1-2',
        stepNumber: 2,
        title: 'Exfoliante Químico BHA/AHA',
        productName: "Paula's Choice 2% BHA Liquid Exfoliant",
        category: 'Exfoliante',
        timing: 'Esperar 15 minutos',
        instruction: 'Aplica 4 gotas con los dedos o pad de algodón sobre piel 100% seca. Evita el contorno de ojos directo.',
        completed: true,
        warningNote: 'Sensación leve de cosquilleo normal. No enjuagar.'
      },
      {
        id: 'step-1-3',
        stepNumber: 3,
        title: 'Hidratación Barrera Neutra',
        productName: 'Crema Hidratante Ligera con Ácido Hialurónico',
        category: 'Hidratación',
        timing: 'Post-absorción',
        instruction: 'Aplica una cantidad del tamaño de una avellana para sellar hidratación sin saturar la piel.',
        completed: false
      }
    ]
  },
  {
    phaseNumber: 2,
    nightName: 'Noche 2',
    phaseTitle: 'Retinoides & Renovación',
    badgeLabel: 'Retinol / Retinal',
    accentColor: '#D8A899',
    bgSubtleColor: '#FAF0ED',
    keyActives: ['Retinol Puro 0.3%', 'Retinaldehído', 'Bisabolol', 'Escualano'],
    clinicalGoal: 'Estimular la transcripción génica para acelerar el ciclo mitótico, inducir síntesis de procolágeno I/III y atenuar manchas.',
    barrierImpact: 'Sensibilidad transitoria y aumento de recambio celular. Requiere protección.',
    steps: [
      {
        id: 'step-2-1',
        stepNumber: 1,
        title: 'Doble Limpieza Suave',
        productName: 'Bálsamo Emulsionable + Gel Syndet Suave',
        category: 'Limpieza',
        timing: '2 min',
        instruction: 'Remueve impurezas y protector solar del día sin alterar el manto ácido epidérmico.',
        completed: true
      },
      {
        id: 'step-2-2',
        stepNumber: 2,
        title: 'Sérum de Retinol Puro Microencapsulado',
        productName: 'SkinCeuticals Retinol 0.3% + Bisabolol',
        category: 'Retinoide',
        timing: 'Aplicar sobre piel seca',
        instruction: 'Distribuye una cantidad del tamaño de un guisante en frente, mejillas y mentón evitando labios y comisuras.',
        completed: true,
        warningNote: 'Método Sándwich opcional si sientes la piel reactiva.'
      },
      {
        id: 'step-2-3',
        stepNumber: 3,
        title: 'Crema Nutritiva de Confort',
        productName: 'Emulsión Calmante con Péptidos y Bisabolol',
        category: 'Confort',
        timing: 'Inmediato',
        instruction: 'Cubre todo el rostro para calmar y reducir el riesgo de descamación post-retinización.',
        completed: false
      }
    ]
  },
  {
    phaseNumber: 3,
    nightName: 'Noche 3',
    phaseTitle: 'Recuperación de Barrera Cutánea',
    badgeLabel: 'Ceramidas & Cica',
    accentColor: '#8FA89B',
    bgSubtleColor: '#EBF1EE',
    keyActives: ['Ceramidas NP/AP/EOP', 'Centella Asiática (Madecassoside)', 'Pantenol 5%', 'Ácido Hialurónico'],
    clinicalGoal: 'Reconstruir el estrato córneo tras el estímulo químico, sellar la pérdida de agua TEWL y restaurar los lípidos bilaminares.',
    barrierImpact: 'Regeneración celular activa y alivio de cualquier micro-inflamación.',
    steps: [
      {
        id: 'step-3-1',
        stepNumber: 1,
        title: 'Limpieza Extra Suave sin Jabón',
        productName: 'Limpiador en Leche pH 5.5 Fisiológico',
        category: 'Limpieza',
        timing: '1 min',
        instruction: 'Limpia delicadamente con agua tibia. Evita frotar agresivamente.',
        completed: true
      },
      {
        id: 'step-3-2',
        stepNumber: 2,
        title: 'Sérum Reparador de Centella & Pantenol',
        productName: 'Hyalu B5 Sérum Concentrado Reparador',
        category: 'Tratamiento',
        timing: 'Sobre piel ligeramente húmeda',
        instruction: 'Aplica 4 gotas presionando con las palmas de las manos para saturar la capa hidrofílica.',
        completed: true
      },
      {
        id: 'step-3-3',
        stepNumber: 3,
        title: 'Bálsamo Barrera Biomimético',
        productName: 'Cicaplast Baume B5+ (La Roche-Posay)',
        category: 'Barrera',
        timing: 'Capa generosa',
        instruction: 'Extiende en capa uniforme sobre zonas reactivas y mejillas para crear un escudo biocompatible.',
        completed: false
      },
      {
        id: 'step-3-4',
        stepNumber: 4,
        title: 'Sellado Oclusivo (Opcional Zonas Secas)',
        productName: '100% Plant-Derived Squalane (2 gotas)',
        category: 'Oclusivo',
        timing: 'Toque final',
        instruction: 'Presiona 2 gotas en pómulos y frente para sellar el 100% de la hidratación nocturna.',
        completed: false
      }
    ]
  },
  {
    phaseNumber: 4,
    nightName: 'Noche 4',
    phaseTitle: 'Recuperación de Barrera 2',
    badgeLabel: 'Nutrición Profunda',
    accentColor: '#8FA89B',
    bgSubtleColor: '#EBF1EE',
    keyActives: ['Escualano Vegetal Puro', 'Péptidos de Cobre', 'Glicerina Farmacéutica', 'Ectoína'],
    clinicalGoal: 'Consolidar la integridad estructural de la matriz lipídica, restablecer la turgencia celular y preparar la piel para el próximo ciclo.',
    barrierImpact: 'Barrera 100% fortalecida y lista para reiniciar el protocolo.',
    steps: [
      {
        id: 'step-4-1',
        stepNumber: 1,
        title: 'Limpieza Fisiológica Hidratante',
        productName: 'Gel Cremoso con Glicerina y Pantenol',
        category: 'Limpieza',
        timing: '1 min',
        instruction: 'Remueve impurezas preservando la película hidrolipídica.',
        completed: false
      },
      {
        id: 'step-4-2',
        stepNumber: 2,
        title: 'Sérum de Péptidos & Factores de Hidratación (NMF)',
        productName: 'Complejo Multipéptido Biomimético',
        category: 'Tratamiento',
        timing: 'Sobre piel humedecida',
        instruction: 'Aplica 3 gotas y masajea suavemente hacia arriba.',
        completed: false
      },
      {
        id: 'step-4-3',
        stepNumber: 3,
        title: 'Crema Rica en Ácidos Grasos y Colesterol',
        productName: 'Crema Hidratante Ceramide Triple Lipidic',
        category: 'Nutrición',
        timing: 'Masaje relajante',
        instruction: 'Nutre la piel en profundidad restableciendo la ratio fisiológica 3:1:1.',
        completed: false
      },
      {
        id: 'step-4-4',
        stepNumber: 4,
        title: 'Sello de Escualano Puro',
        productName: '100% Plant-Derived Squalane',
        category: 'Sello',
        timing: 'Toque final nocturno',
        instruction: 'Calienta 3 gotas entre las palmas y sella todo el rostro.',
        completed: false
      }
    ]
  }
];

export const sampleScanPresets: InciScanResult[] = [
  {
    productName: 'Niacinamide 10% + Zinc 1%',
    brand: 'The Ordinary',
    category: 'Sérum Seborregulador & Barrera',
    compatibilityScore: 98,
    fitForCycling: true,
    cycleNightsRecommended: [3, 4],
    summary: 'Fórmula minimalista de alta tolerancia científica. Excelente sinergia de Niacinamida al 10% con Zinc PCA para control de sebo y refuerzo del manto lipídico sin fragancias ni alérgenos comunes.',
    ingredients: [
      {
        id: 'inc-1',
        name: 'Niacinamide',
        inci: 'NIACINAMIDE',
        category: 'Vitamina B3 Activa',
        function: 'Refuerzo de barrera lipídica, síntesis de ceramidas y modulación de sebo.',
        trafficLight: 'SAFE',
        trafficLightLabel: 'Eficaz / Seguro',
        safetyScore: 100,
        comedogenicRating: 0,
        cosingRef: '35637',
        pubmedStudiesCount: 3420,
        description: 'Activo de primera línea con grado clínico verificado por CosIng y PubMed.'
      },
      {
        id: 'inc-2',
        name: 'Zinc PCA',
        inci: 'ZINC PCA',
        category: 'Mineral Fisiológico',
        function: 'Acción seborreguladora, inhibidor de 5-alfa reductasa y antimicrobiano.',
        trafficLight: 'SAFE',
        trafficLightLabel: 'Eficaz / Seguro',
        safetyScore: 99,
        comedogenicRating: 0,
        cosingRef: '39012',
        pubmedStudiesCount: 840,
        description: 'Sal de zinc del ácido pirrolidincarboxílico presente de forma natural en el factor de hidratación cutáneo.'
      },
      {
        id: 'inc-3',
        name: 'Tamarindus Indica Seed Gum',
        inci: 'TAMARINDUS INDICA SEED GUM',
        category: 'Polisacárido Botánico',
        function: 'Humectante filmógeno vegetal y agente viscosizante natural.',
        trafficLight: 'HYDRATING',
        trafficLightLabel: 'Hidratante / Reparador',
        safetyScore: 98,
        comedogenicRating: 0,
        cosingRef: '59201',
        pubmedStudiesCount: 310,
        description: 'Aporta hidratación superficial elástica con sensación sedosa no pegajosa.'
      },
      {
        id: 'inc-4',
        name: 'Pentylene Glycol',
        inci: 'PENTYLENE GLYCOL',
        category: 'Humectante & Solvente',
        function: 'Mejora la penetración y retención de humedad epidérmica.',
        trafficLight: 'HYDRATING',
        trafficLightLabel: 'Hidratante / Reparador',
        safetyScore: 97,
        comedogenicRating: 0,
        cosingRef: '36021',
        pubmedStudiesCount: 420,
        description: 'Glicol sintético o bio-basado que potencia la eficacia del sistema conservante.'
      },
      {
        id: 'inc-5',
        name: 'Phenoxyethanol',
        inci: 'PHENOXYETHANOL',
        category: 'Conservante Seguro (<1%)',
        function: 'Protección microbiológica frente a bacterias y hongos.',
        trafficLight: 'SAFE',
        trafficLightLabel: 'Eficaz / Seguro',
        safetyScore: 92,
        comedogenicRating: 0,
        cosingRef: '36382',
        pubmedStudiesCount: 1120,
        description: 'Aprobado por el reglamento cosmético UE hasta concentración máxima del 1.0%.'
      },
      {
        id: 'inc-6',
        name: 'Chlorphenesin',
        inci: 'CHLORPHENESIN',
        category: 'Conservante Coadyuvante',
        function: 'Actividad antimicrobiana complementaria.',
        trafficLight: 'CAUTION',
        trafficLightLabel: 'Precaución en Piel Atópica',
        safetyScore: 84,
        comedogenicRating: 0,
        cosingRef: '32681',
        pubmedStudiesCount: 230,
        description: 'En pieles con dermatitis severa puede ocasionar ligero picor inicial transitorio.'
      }
    ]
  },
  {
    productName: 'PM Facial Moisturizing Lotion',
    brand: 'CeraVe',
    category: 'Loción Restauradora Nocturna',
    compatibilityScore: 96,
    fitForCycling: true,
    cycleNightsRecommended: [1, 2, 3, 4],
    summary: 'Emulsión multivesicular con tecnología MVE patentada. Integra 3 Ceramidas esenciales (1, 3, 6-II), Niacinamida al 4% y Ácido Hialurónico en base no comedogénica formulada con dermatólogos.',
    ingredients: [
      {
        id: 'cer-1',
        name: 'Ceramide NP, AP, EOP',
        inci: 'CERAMIDE NP / CERAMIDE AP / CERAMIDE EOP',
        category: 'Lípidos Laminares Esenciales',
        function: 'Restauración del cemento intercelular y barrera biológica cutánea.',
        trafficLight: 'SAFE',
        trafficLightLabel: 'Eficaz / Seguro',
        safetyScore: 100,
        comedogenicRating: 0,
        cosingRef: '55381',
        pubmedStudiesCount: 4890,
        description: 'Componentes idénticos a los lípidos naturales del estrato córneo humano.'
      },
      {
        id: 'cer-2',
        name: 'Hyaluronic Acid',
        inci: 'SODIUM HYALURONATE',
        category: 'Humectante Endógeno',
        function: 'Retención de agua y turgencia extracelular.',
        trafficLight: 'HYDRATING',
        trafficLightLabel: 'Hidratante / Reparador',
        safetyScore: 100,
        comedogenicRating: 0,
        cosingRef: '38129',
        pubmedStudiesCount: 12450,
        description: 'Glicosaminoglicano de alta pureza biomimética.'
      },
      {
        id: 'cer-3',
        name: 'Phytosphingosine',
        inci: 'PHYTOSPHINGOSINE',
        category: 'Precursor de Ceramidas',
        function: 'Actividad antimicrobiana natural frente a patógenos y refuerzo lipídico.',
        trafficLight: 'HYDRATING',
        trafficLightLabel: 'Hidratante / Reparador',
        safetyScore: 98,
        comedogenicRating: 0,
        cosingRef: '36412',
        pubmedStudiesCount: 560,
        description: 'Lípido bioactivo que frena la inflamación y estimula la síntesis de ceramidas.'
      },
      {
        id: 'cer-4',
        name: 'Dimethicone',
        inci: 'DIMETHICONE',
        category: 'Polímero Protector Oclusivo',
        function: 'Protector dérmico no graso que frena la evaporación de agua sin asfixiar.',
        trafficLight: 'SAFE',
        trafficLightLabel: 'Eficaz / Seguro',
        safetyScore: 95,
        comedogenicRating: 1,
        cosingRef: '33382',
        pubmedStudiesCount: 2890,
        description: 'Silicona médica de alto peso molecular que no penetra en el torrente sanguíneo.'
      }
    ]
  }
];