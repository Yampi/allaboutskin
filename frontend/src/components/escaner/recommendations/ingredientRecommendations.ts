export type SkinType = 'OILY' | 'DRY' | 'COMBINATION' | 'SENSITIVE' | 'NORMAL';

export interface IngredientRecommendation {
  // Identificador con el que el backend busca el ingrediente (INCI con guiones)
  slug: string;
  label: string;
  tag: string;
  icon: string;
  iconClass: string;
  // Explicación de por qué encaja con el tipo de piel detectado
  reason: string;
}

const SLOT_STYLES = [
  { icon: '🧪', iconClass: 'bg-emerald-500/15 text-emerald-800' },
  { icon: '🧬', iconClass: 'bg-teal-500/15 text-teal-800' },
  { icon: '💧', iconClass: 'bg-amber-500/15 text-amber-800' },
];

type RecommendationContent = Omit<IngredientRecommendation, 'icon' | 'iconClass'>;

const NIACINAMIDE = { slug: 'niacinamide', label: 'Niacinamida 2-5%', tag: 'Control de sebo en zona T' };
const CERAMIDES = { slug: 'ceramide-np', label: 'Ceramidas NP', tag: 'Sellado de barrera' };
const SALICYLIC = { slug: 'salicylic-acid', label: 'Ácido Salicílico 2%', tag: 'Limpieza de poros' };

const BY_SKIN_TYPE: Record<SkinType, RecommendationContent[]> = {
  DRY: [
    {
      slug: 'ceramide-np',
      label: 'Ceramidas NP + AP',
      tag: 'Reparación de barrera',
      reason:
        'Tu piel se ve seca, y eso suele indicar que su barrera retiene poca agua. Las ceramidas forman parte natural de esa barrera y ayudan a reponerla.',
    },
    {
      ...CERAMIDES,
      reason:
        'Una piel seca pierde agua con facilidad. Las ceramidas actúan como el «cemento» entre las células de la superficie y ayudan a que el agua no se escape.',
    },
    {
      slug: 'sodium-hyaluronate',
      label: 'Ácido Hialurónico',
      tag: 'Retención de agua',
      reason:
        'A la piel seca le falta agua. El ácido hialurónico atrae y retiene agua en la superficie, y deja la piel más flexible y cómoda.',
    },
  ],
  OILY: [
    {
      ...NIACINAMIDE,
      reason:
        'Tu piel produce más grasa, sobre todo en la zona T (frente, nariz y barbilla). La niacinamida ayuda a regular esa grasa y a que los poros se vean más pequeños.',
    },
    {
      ...CERAMIDES,
      reason:
        'Aunque tu piel tenga grasa, también necesita una barrera fuerte. Las ceramidas la refuerzan sin aportar aceite.',
    },
    {
      ...SALICYLIC,
      reason:
        'El exceso de grasa puede tapar los poros. El ácido salicílico se mezcla con la grasa y limpia el poro por dentro.',
    },
  ],
  COMBINATION: [
    {
      ...NIACINAMIDE,
      reason:
        'Tu piel tiene más grasa en la zona T y es normal o seca en el resto. La niacinamida regula la grasa sin resecar las otras zonas.',
    },
    {
      ...CERAMIDES,
      reason: 'Mantienen hidratadas las zonas más secas de tu cara sin engrasar la zona T.',
    },
    {
      ...SALICYLIC,
      reason: 'Es útil en la zona T, donde se acumula más grasa y los poros se tapan con más facilidad.',
    },
  ],
  NORMAL: [
    {
      ...NIACINAMIDE,
      reason:
        'Tu piel está equilibrada. La niacinamida es un activo suave que ayuda a mantener la barrera fuerte y el tono uniforme.',
    },
    {
      ...CERAMIDES,
      reason: 'Ayudan a mantener en buen estado la barrera de tu piel, que es lo que la protege del ambiente.',
    },
    {
      ...SALICYLIC,
      reason: 'Una exfoliación suave de vez en cuando mantiene los poros limpios y la textura uniforme.',
    },
  ],
  SENSITIVE: [
    {
      ...NIACINAMIDE,
      reason:
        'En piel sensible ayuda a fortalecer la barrera y a reducir el enrojecimiento. Suele tolerarse bien.',
    },
    {
      slug: 'centella-asiatica-extract',
      label: 'Centella Asiática (Cica)',
      tag: 'Calmante vascular',
      reason:
        'Tu piel reacciona con facilidad. La centella asiática tiene efecto calmante y ayuda a recuperar la piel irritada.',
    },
    {
      ...SALICYLIC,
      reason:
        'Ayuda a mantener los poros limpios. En piel sensible puede irritar: si lo usas, empieza con una o dos noches por semana.',
    },
  ],
};

export function getRecommendedIngredients(skinType?: SkinType | null): IngredientRecommendation[] {
  const content = BY_SKIN_TYPE[skinType ?? 'COMBINATION'] ?? BY_SKIN_TYPE.COMBINATION;
  return content.map((item, i) => ({ ...item, ...SLOT_STYLES[i % SLOT_STYLES.length] }));
}
