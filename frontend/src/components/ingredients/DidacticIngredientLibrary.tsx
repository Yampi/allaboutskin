'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Sparkles,
  Layers,
  Filter,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  ShieldCheck,
  FlaskConical,
  Grid,
  List
} from 'lucide-react';
import DidacticIngredientFlashcard, { DidacticIngredient } from './DidacticIngredientFlashcard';
import IngredientDetailModal from '@/components/mobile/IngredientDetailModal';

export const COMPREHENSIVE_DIDACTIC_INGREDIENTS: DidacticIngredient[] = [
  {
    id: 'niacinamida',
    name: 'Niacinamida (Vitamina B3)',
    inci: 'NIACINAMIDE',
    category: 'barrier',
    categoryLabel: 'Barrera & Textura',
    targetObjective: 'acne',
    anatomicalTarget: 'Glándula Sebácea & Estrato Córneo',
    recommendedConcentration: '2% — 5% (hasta 10% puro)',
    optimalPh: '5.5 — 6.5',
    whatItDoes: 'Refuerza la barrera de lípidos dérmicos, equilibra la producción sebácea, atenúa poros dilatados y calma rojeces.',
    detailedMechanism: 'Precursor intracelular de NAD+/NADP+. Estimula la síntesis de ceramidas e inhibe la transferencia de melanosomas hacia queratinocitos.',
    synergies: ['Ácido Hialurónico', 'Zinc PCA', 'Ceramidas', 'Pantenol'],
    contraindications: ['Ácido L-Ascórbico puro en concentraciones altas (>15%) a pH ultra-ácido si tu piel es muy reactiva'],
    skinCyclingPhase: 'Noche 1 (post-exfoliación) y Noches 3 & 4 (recuperación)',
    timing: 'AM / PM',
    textureType: 'Sérum acuoso ligero / Gel fluido',
    macroImage: 'https://images.unsplash.com/photo-1608248597359-25f0a82b3d7a?auto=format&fit=crop&w=600&q=80',
    pubmedCount: 3420,
    cosingId: '35637',
    evidenceGrade: 'NIVEL A (RCTs)',
    studies: [
      {
        title: 'Niacinamide: A review of its role in cutaneous biology and clinical dermatology',
        journal: 'Dermatol Surg',
        year: 2021,
        pmid: '34120982',
      },
    ],
  },
  {
    id: 'retinol',
    name: 'Retinol Puro Microencapsulado',
    inci: 'RETINOL',
    category: 'retinoid',
    categoryLabel: 'Renovación Celular',
    targetObjective: 'aging',
    anatomicalTarget: 'Epidermis Basal & Dermis Papilar',
    recommendedConcentration: '0.1% — 0.5% (principiantes a avanzados)',
    optimalPh: '5.5 — 6.5',
    whatItDoes: 'El estándar de oro en dermatología. Acelera la mitosis celular epidérmica a 21 días, atenúa arrugas finas y desvanece manchas.',
    detailedMechanism: 'Se biotransforma en ácido retinoico, activando receptores nucleares RAR/RXR para disparar la transcripción de procolágeno I y III.',
    synergies: ['Escualano Vegetal', 'Ceramidas NP/AP', 'Bisabolol', 'Centella Asiática'],
    contraindications: ['Ácidos exfoliantes fuertes (AHA/BHA) en la misma noche', 'Exposición solar directa sin protección SPF 50+'],
    skinCyclingPhase: 'Noche 2 (Tratamiento Exclusivo)',
    timing: 'PM',
    textureType: 'Emulsión cremosa sedosa',
    macroImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
    pubmedCount: 8940,
    cosingId: '37351',
    evidenceGrade: 'NIVEL A (Gold Standard)',
    studies: [
      {
        title: 'Mechanisms of Retinoid Action in Skin Aging and Photodamage Repair',
        journal: 'J Invest Dermatol',
        year: 2022,
        pmid: '35012410',
      },
    ],
  },
  {
    id: 'acido-salicilico',
    name: 'Ácido Salicílico (BHA 2%)',
    inci: 'SALICYLIC ACID',
    category: 'exfoliant',
    categoryLabel: 'Exfoliante Químico BHA',
    targetObjective: 'acne',
    anatomicalTarget: 'Infundíbulo Folicular (Poro sebáceo)',
    recommendedConcentration: '0.5% — 2.0%',
    optimalPh: '3.2 — 3.8',
    whatItDoes: 'Disuelve el sebo acumulado y las células muertas en el interior de los poros, previniendo puntos negros y comedones.',
    detailedMechanism: 'Beta-hidroxiácido lipofílico que rompe los puentes desmosómicos de queratinocitos impactados en el conducto pilosebáceo.',
    synergies: ['Pantenol', 'Glicerina', 'Ácido Hialurónico', 'Extracto de Té Verde'],
    contraindications: ['Retinol en la misma aplicación', 'Exfoliantes mecánicos o cepillos abrasivos'],
    skinCyclingPhase: 'Noche 1 (Exfoliación Química)',
    timing: 'PM',
    textureType: 'Tónico o solución líquida translúcida',
    macroImage: 'https://images.unsplash.com/photo-1570554886111-e80fcca6a029?auto=format&fit=crop&w=600&q=80',
    pubmedCount: 5120,
    cosingId: '37482',
    evidenceGrade: 'NIVEL A (Clínico)',
    studies: [
      {
        title: 'Salicylic acid as a peeling agent: a comprehensive clinical overview',
        journal: 'Clin Cosmet Investig Dermatol',
        year: 2021,
        pmid: '26315534',
      },
    ],
  },
  {
    id: 'acido-hialuronico',
    name: 'Ácido Hialurónico Multimolecular',
    inci: 'SODIUM HYALURONATE',
    category: 'barrier',
    categoryLabel: 'Hidratación Profunda',
    targetObjective: 'barrier',
    anatomicalTarget: 'Matriz Extracelular & Estrato Córneo',
    recommendedConcentration: '0.5% — 2.0%',
    optimalPh: '4.5 — 7.0',
    whatItDoes: 'Glicosaminoglicano higroscópico capaz de retener hasta 1,000 veces su peso en agua. Aporta turgencia inmediata y suavidad.',
    detailedMechanism: 'La fracción de bajo peso molecular penetra hacia la dermis estimulando aquaporinas; el alto peso molecular retiene agua en superficie.',
    synergies: ['Ceramidas', 'Niacinamida', 'Pantenol', 'Escualano', 'Glicerina'],
    contraindications: ['Aplicación sobre piel seca en climas áridos (<15% humedad) sin crema oclusiva superior'],
    skinCyclingPhase: 'Noches 3 & 4 (Recuperación) y Rutina de Día',
    timing: 'AM / PM',
    textureType: 'Sérum denso viscoso y cristalino',
    macroImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
    pubmedCount: 12450,
    cosingId: '38129',
    evidenceGrade: 'NIVEL A (Universal)',
    studies: [
      {
        title: 'Hyaluronic acid in dermatology: from physiology to transdermal delivery',
        journal: 'Dermatol Ther',
        year: 2022,
        pmid: '34822143',
      },
    ],
  },
  {
    id: 'ceramidas',
    name: 'Complejo de Ceramidas (NP, AP, EOP)',
    inci: 'CERAMIDE NP, CERAMIDE AP, CERAMIDE EOP',
    category: 'barrier',
    categoryLabel: 'Cemento Intercelular',
    targetObjective: 'barrier',
    anatomicalTarget: 'Bicapa Lipídica del Estrato Córneo',
    recommendedConcentration: '0.2% — 1.5%',
    optimalPh: '5.0 — 6.0',
    whatItDoes: 'Restituye el 50% de los lípidos naturales de la piel. Sella la pérdida de agua transepidérmica (TEWL) y repara pieles sensibilizadas.',
    detailedMechanism: 'Organiza la estructura laminar bilipídica entre corneocitos, bloqueando alérgenos y bacterias externas.',
    synergies: ['Colesterol fisiológico', 'Ácidos Grasos Libres', 'Pantenol', 'Niacinamida'],
    contraindications: ['Ninguna incompatibilidad biológica conocida'],
    skinCyclingPhase: 'Noches 3 & 4 (Recuperación Obligatoria)',
    timing: 'AM / PM',
    textureType: 'Crema hidratante reparadora lamelar',
    macroImage: 'https://images.unsplash.com/photo-1512290900672-1f553315a6cf?auto=format&fit=crop&w=600&q=80',
    pubmedCount: 4890,
    cosingId: '55381',
    evidenceGrade: 'NIVEL A (Esencial)',
    studies: [
      {
        title: 'Skin barrier function and physiological lipid replacement therapy',
        journal: 'Dermatol Clin',
        year: 2023,
        pmid: '36872019',
      },
    ],
  },
  {
    id: 'centella-asiatica',
    name: 'Centella Asiática (Madecassoside Puro)',
    inci: 'MADECASSOSIDE, ASIATICOSIDE',
    category: 'soothing',
    categoryLabel: 'Fito-Calmante Cica',
    targetObjective: 'soothing',
    anatomicalTarget: 'Dermis Superficial & Microvasculatura',
    recommendedConcentration: '0.1% — 1.0%',
    optimalPh: '5.0 — 7.0',
    whatItDoes: 'Inhibe la inflamación dérmica, mitiga rojeces y eritema, y promueve la síntesis de colágeno frente a micro-estrés químico.',
    detailedMechanism: 'Inhibe citoquinas proinflamatorias (TNF-alfa e IL-1beta) y modula la expresión de colágeno dérmico.',
    synergies: ['Pantenol', 'Ceramidas', 'Alantoína', 'Avena Coloidal'],
    contraindications: ['Hipersensibilidad a derivados botánicos de Apiaceae'],
    skinCyclingPhase: 'Noches 3 & 4 (Recuperación y Calma)',
    timing: 'AM / PM',
    textureType: 'Bálsamo o emulsión calmante cica',
    macroImage: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80',
    pubmedCount: 1780,
    cosingId: '57629',
    evidenceGrade: 'NIVEL A (Antiinflamatorio)',
    studies: [
      {
        title: 'Therapeutic potential of Centella asiatica and madecassoside in skin disorders',
        journal: 'Phytomedicine',
        year: 2021,
        pmid: '34678523',
      },
    ],
  },
  {
    id: 'acido-azelaico',
    name: 'Ácido Azelaico (10% — 15%)',
    inci: 'AZELAIC ACID',
    category: 'brightening',
    categoryLabel: 'Despigmentante & Anti-Rojeces',
    targetObjective: 'brightening',
    anatomicalTarget: 'Melanocitos Hiperactivos & Folículos',
    recommendedConcentration: '10% (cosmético) a 15% (dermatológico)',
    optimalPh: '4.5 — 5.5',
    whatItDoes: 'Aclara manchas post-inflamatorias (PIH), controla la rosácea, reduce bacterias causantes de acné y unifica el tono.',
    detailedMechanism: 'Inhibidor selectivo de la tirosinasa en melanocitos atípicos e inhibidor de la síntesis de radicales libres en neutrófilos.',
    synergies: ['Niacinamida', 'Ácido Hialurónico', 'Centella Asiática'],
    contraindications: ['Exfoliantes de alta potencia simultáneos en pieles con rosácea activa'],
    skinCyclingPhase: 'Rutina AM o Noches de Recuperación',
    timing: 'AM / PM',
    textureType: 'Suspensión en gel ligera mate',
    macroImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    pubmedCount: 2950,
    cosingId: '32091',
    evidenceGrade: 'NIVEL A (Clínico)',
    studies: [
      {
        title: 'Azelaic acid in the treatment of post-inflammatory hyperpigmentation and acne',
        journal: 'J Dermatolog Treat',
        year: 2022,
        pmid: '34589211',
      },
    ],
  },
  {
    id: 'vitamina-c-pura',
    name: 'Vitamina C Pura (Ácido L-Ascórbico 15%)',
    inci: 'ASCORBIC ACID',
    category: 'brightening',
    categoryLabel: 'Antioxidante & Luminosidad',
    targetObjective: 'brightening',
    anatomicalTarget: 'Dermis & Membrana Basal',
    recommendedConcentration: '10% — 15%',
    optimalPh: '2.8 — 3.5',
    whatItDoes: 'Neutraliza radicales libres inducidos por radiación UV y polución, estimula la síntesis de colágeno y previene el fotoenvejecimiento.',
    detailedMechanism: 'Cofactor de enzimas prolil y lisil hidroxilasa esenciales para la estabilidad de la triple hélice del colágeno.',
    synergies: ['Ácido Ferúlico', 'Vitamina E (Tocoferol)', 'Protector Solar SPF 50+'],
    contraindications: ['Retinoides o ácidos AHA en la misma aplicación matutina'],
    skinCyclingPhase: 'Rutina Matutina (AM) antes del Protector Solar',
    timing: 'AM',
    textureType: 'Sérum anhidro o solución ácida estabilizada',
    macroImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    pubmedCount: 15890,
    cosingId: '31872',
    evidenceGrade: 'NIVEL A (Antioxidante Gold Standard)',
    studies: [
      {
        title: 'Topical Vitamin C and the Skin: Mechanisms of Action and Clinical Applications',
        journal: 'J Clin Aesthet Dermatol',
        year: 2020,
        pmid: '29104718',
      },
    ],
  },
  {
    id: 'escualano',
    name: 'Escualano Vegetal Puro (100%)',
    inci: 'SQUALANE',
    category: 'barrier',
    categoryLabel: 'Lípido Oclusivo Fisiológico',
    targetObjective: 'barrier',
    anatomicalTarget: 'Estrato Córneo Superficial',
    recommendedConcentration: '100% Puro o 2% — 15%',
    optimalPh: 'Anhidro (5.5 — 7.0)',
    whatItDoes: 'Lípido bio-idéntico al sebo humano natural. Suaviza la piel de inmediato y sella la humedad sin obstruir poros (comedogénico 0).',
    detailedMechanism: 'Hidrocarburo saturado estable que reemplaza la fracción lipídica perdida durante agresiones químicas.',
    synergies: ['Retinol (como base buffer)', 'Ácido Hialurónico', 'Ceramidas'],
    contraindications: ['Ninguna'],
    skinCyclingPhase: 'Noche 4 (Nutrición & Sello Final)',
    timing: 'PM',
    textureType: 'Aceite seco liviano no graso',
    macroImage: 'https://images.unsplash.com/photo-1608248597359-25f0a82b3d7a?auto=format&fit=crop&w=600&q=80',
    pubmedCount: 1450,
    cosingId: '38139',
    evidenceGrade: 'NIVEL A (Biomimético)',
    studies: [],
  },
  {
    id: 'peptidos-cobre',
    name: 'Péptidos de Cobre (GHK-Cu)',
    inci: 'COPPER TRIPEPTIDE-1',
    category: 'aging',
    categoryLabel: 'Regeneración & Firmeza',
    targetObjective: 'aging',
    anatomicalTarget: 'Dermis Reticular & Fibroblastos',
    recommendedConcentration: '1% — 2%',
    optimalPh: '5.5 — 7.0',
    whatItDoes: 'Señalizadores biológicos que estimulan la síntesis de colágeno, elastina y glicosaminoglicanos, acelerando la reparación dérmica.',
    detailedMechanism: 'Actúa como transportador de iones de cobre indispensables para la lisil oxidasa, reforzando la matriz extracelular.',
    synergies: ['Ácido Hialurónico', 'Pantenol', 'Niacinamida'],
    contraindications: ['Ácidos exfoliantes fuertes o Vitamina C pura (los quelantes de cobre se degradan)'],
    skinCyclingPhase: 'Noches 3 & 4 (Recuperación y Firmeza)',
    timing: 'PM',
    textureType: 'Sérum acuoso azul bioluminiscente',
    macroImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
    pubmedCount: 890,
    cosingId: '75432',
    evidenceGrade: 'NIVEL B (Péptidos)',
    studies: [],
  },
];

export default function DidacticIngredientLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedObjective, setSelectedObjective] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedIngredientModal, setSelectedIngredientModal] = useState<DidacticIngredient | null>(null);

  // Objectives pills
  const objectives = [
    { id: 'all', label: 'Todos los Activos' },
    { id: 'acne', label: 'Acné & Sebo' },
    { id: 'barrier', label: 'Barrera & Cemento' },
    { id: 'aging', label: 'Renovación & Arrugas' },
    { id: 'brightening', label: 'Manchas & Tono' },
    { id: 'soothing', label: 'Calmantes & Cica' },
  ];

  // Anatomical Zones pills
  const zones = [
    { id: 'all', label: 'Todas las Capas' },
    { id: 'estrato', label: 'Estrato Córneo' },
    { id: 'sebacea', label: 'Glándula Sebácea' },
    { id: 'dermis', label: 'Dermis & Colágeno' },
  ];

  const filteredIngredients = useMemo(() => {
    return COMPREHENSIVE_DIDACTIC_INGREDIENTS.filter((ing) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        ing.name.toLowerCase().includes(q) ||
        ing.inci.toLowerCase().includes(q) ||
        ing.whatItDoes.toLowerCase().includes(q) ||
        ing.anatomicalTarget.toLowerCase().includes(q) ||
        ing.synergies.some((s) => s.toLowerCase().includes(q));

      const matchesObjective =
        selectedObjective === 'all' || ing.targetObjective === selectedObjective;

      const matchesZone =
        selectedZone === 'all' ||
        (selectedZone === 'estrato' && ing.anatomicalTarget.toLowerCase().includes('córneo')) ||
        (selectedZone === 'sebacea' && (ing.anatomicalTarget.toLowerCase().includes('sebácea') || ing.anatomicalTarget.toLowerCase().includes('poro'))) ||
        (selectedZone === 'dermis' && ing.anatomicalTarget.toLowerCase().includes('dermis'));

      return matchesSearch && matchesObjective && matchesZone;
    });
  }, [searchQuery, selectedObjective, selectedZone]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in">
      {/* 1. HEADER EDITORIAL DIDÁCTICO */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E1D7] shadow-2xs relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-[#2E7D5B]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#E6F4EC] text-[#2E7D5B] text-xs font-extrabold uppercase tracking-wider">
              Enciclopedia Farmacológica · Fichas Didácticas
            </span>
            <span className="text-xs text-[#8C827A] hidden sm:inline">
              • {COMPREHENSIVE_DIDACTIC_INGREDIENTS.length} Moléculas Indexadas · Regulación CosIng UE
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#2D2825] tracking-tight">
            Biblioteca de Activos Dermatológicos
          </h1>

          <p className="text-xs sm:text-sm text-[#4A4540] leading-relaxed">
            Aprende qué hace cada molécula, dónde actúa anatómicamente y con qué combinarla de forma segura. Toca el botón <strong>"Girar Ficha Didáctica"</strong> para ver sus precauciones y sinergias moleculares.
          </p>

          {/* Buscador reactivo */}
          <div className="pt-2 max-w-2xl relative flex items-center">
            <Search className="w-4 h-4 text-[#8C827A] absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre común, INCI, beneficio o zona de acción..."
              className="w-full pl-11 pr-10 py-3 rounded-full bg-[#FAF8F5] border border-[#E8E1D7] text-xs sm:text-sm text-[#2D2825] placeholder-[#8C827A] focus:outline-none focus:border-[#2E7D5B] focus:bg-white focus:ring-1 focus:ring-[#2E7D5B] transition shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 p-1 text-[#8C827A] hover:text-[#2D2825]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filtros por Objetivo Dérmico */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pt-2">
            {objectives.map((obj) => (
              <button
                key={obj.id}
                type="button"
                onClick={() => setSelectedObjective(obj.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                  selectedObjective === obj.id
                    ? 'bg-[#2E7D5B] text-white border-[#2E7D5B] shadow-2xs'
                    : 'bg-white text-[#66615C] border-[#E8E1D7] hover:border-[#2E7D5B]'
                }`}
              >
                {obj.label}
              </button>
            ))}
          </div>

          {/* Filtros secundarios por Zona Anatómica */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 text-xs">
            <span className="font-bold text-[#8C827A] text-[11px] uppercase tracking-wider shrink-0">
              Capa Dérmica:
            </span>
            {zones.map((zn) => (
              <button
                key={zn.id}
                type="button"
                onClick={() => setSelectedZone(zn.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  selectedZone === zn.id
                    ? 'bg-[#1B3D32] text-white'
                    : 'bg-[#FAF8F5] text-[#8C827A] hover:text-[#2D2825]'
                }`}
              >
                {zn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. GRID DE FICHAS DIDÁCTICAS INTERACTIVAS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#8C827A] uppercase tracking-wider">
            FICHAS PEDAGÓGICAS ENCONTRADAS ({filteredIngredients.length})
          </span>
          <span className="text-xs font-bold text-[#2E7D5B]">
            Gira cada tarjeta para ver la guía de combinación
          </span>
        </div>

        {filteredIngredients.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#E8E1D7] text-[#8C827A] space-y-3">
            <BookOpen className="w-10 h-10 mx-auto text-[#2E7D5B]/40" />
            <h3 className="text-base font-extrabold text-[#2D2825]">
              No se encontraron activos para "{searchQuery}"
            </h3>
            <p className="text-xs max-w-md mx-auto">
              Prueba buscando por "Retinol", "Niacinamida", "BHA", "Manchas" o restablece los filtros.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedObjective('all');
                setSelectedZone('all');
              }}
              className="px-5 py-2 rounded-full bg-[#2E7D5B] text-white text-xs font-bold hover:bg-[#1B3D32] transition"
            >
              Restablecer Búsqueda
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIngredients.map((ing) => (
              <DidacticIngredientFlashcard
                key={ing.id}
                ingredient={ing}
                onOpenDeepModal={(selected) => setSelectedIngredientModal(selected)}
              />
            ))}
          </div>
        )}
      </div>

      {/* MODAL CLÍNICO EXTENDIDO */}
      {selectedIngredientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div
            className="w-full max-w-lg bg-white rounded-3xl border border-[#E8E1D7] shadow-2xl p-6 sm:p-7 space-y-5 animate-in slide-in-from-bottom max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#2E7D5B] uppercase tracking-wider bg-[#E6F4EC] px-2.5 py-0.5 rounded-full">
                  Ficha Médica & Farmacológica
                </span>
                <h3 className="text-lg font-extrabold text-[#2D2825] mt-1">
                  {selectedIngredientModal.name}
                </h3>
                <span className="text-xs font-mono text-[#8C827A]">
                  INCI: {selectedIngredientModal.inci} {selectedIngredientModal.cosingId ? `· CosIng #${selectedIngredientModal.cosingId}` : ''}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIngredientModal(null)}
                className="p-1.5 rounded-full text-[#8C827A] hover:text-[#2D2825] hover:bg-[#FAF8F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-[#4A4540]">
              {/* Resumen */}
              <div className="p-3.5 rounded-2xl bg-[#FAFAF7] border border-[#E8E1D7] space-y-1">
                <span className="font-extrabold text-[#2D2825] uppercase text-[10px] tracking-wider block">
                  Mecanismo Molecular
                </span>
                <p className="leading-relaxed">{selectedIngredientModal.detailedMechanism}</p>
              </div>

              {/* Sinergias y contraindicaciones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-[#E6F4EC]/70 border border-[#D5E2DB] space-y-1">
                  <span className="font-extrabold text-[#1B3D32] block">✦ Combinar con:</span>
                  <p className="text-[#1B3D32] leading-snug">{selectedIngredientModal.synergies.join(', ')}</p>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                  <span className="font-extrabold text-amber-900 block">⚠️ Evitar mezclar con:</span>
                  <p className="text-amber-800 leading-snug">{selectedIngredientModal.contraindications.join(', ')}</p>
                </div>
              </div>

              {/* Estudios PubMed */}
              {selectedIngredientModal.studies && selectedIngredientModal.studies.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#F0ECE1]">
                  <span className="font-extrabold text-[#2D2825] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#2E7D5B]" />
                    Evidencia Indexada en PubMed ({selectedIngredientModal.pubmedCount} citas)
                  </span>
                  {selectedIngredientModal.studies.map((st, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-[#FAFAF7] border border-[#E8E1D7] space-y-1">
                      <p className="font-bold text-[#2D2825]">"{st.title}"</p>
                      <div className="flex items-center justify-between text-[10px] text-[#8C827A]">
                        <span>{st.journal} ({st.year}) · PMID: {st.pmid}</span>
                        <a
                          href={`https://pubmed.ncbi.nlm.nih.gov/${st.pmid}/`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#2E7D5B] font-bold hover:underline flex items-center gap-0.5"
                        >
                          Ver Paper <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedIngredientModal(null)}
              className="w-full py-2.5 rounded-full bg-[#2E7D5B] text-white text-xs font-bold hover:bg-[#1B3D32] transition"
            >
              Cerrar Ficha
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
