export type NavTab = 'home' | 'scanner' | 'cycle' | 'library' | 'profile';

export type TrafficLight = 'SAFE' | 'HYDRATING' | 'CAUTION';

export interface InciIngredientResult {
  id: string;
  name: string;
  inci: string;
  category: string;
  function: string;
  trafficLight: TrafficLight;
  trafficLightLabel: string;
  safetyScore: number;
  comedogenicRating: number; // 0 - 5
  cosingRef: string;
  pubmedStudiesCount: number;
  description: string;
  notes?: string;
}

export interface InciScanResult {
  productName: string;
  brand: string;
  category: string;
  compatibilityScore: number;
  fitForCycling: boolean;
  cycleNightsRecommended: number[];
  ingredients: InciIngredientResult[];
  summary: string;
}

export interface ActiveIngredient {
  id: string;
  name: string;
  inci: string;
  casNumber: string;
  category: 'barrier' | 'exfoliant' | 'retinoid' | 'soothing' | 'antioxidant';
  categoryLabel: string;
  shortDescription: string;
  clinicalDescription: string;
  molecularWeight: string;
  recommendedConcentration: string;
  optimalPh: string;
  pubmedCount: number;
  cosingId: string;
  assignedCyclePhase: string;
  phaseId: number;
  macroImage: string;
  textureType: string;
  benefits: string[];
  synergies: string[];
  contraindications: string[];
  clinicalStudies: {
    title: string;
    journal: string;
    year: number;
    doi: string;
    pmid: string;
  }[];
}

export interface ProductShelfItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  volume: string;
  paoMonths: number;
  inciScore: number;
  primaryActives: string[];
  assignedPhase: number;
  assignedPhaseName: string;
  image: string;
  textureNote: string;
}

export interface RoutineStep {
  id: string;
  stepNumber: number;
  title: string;
  productName: string;
  category: string;
  timing: string;
  instruction: string;
  completed: boolean;
  warningNote?: string;
}

export interface CyclePhaseData {
  phaseNumber: number;
  nightName: string;
  phaseTitle: string;
  badgeLabel: string;
  accentColor: string; // Hex e.g. #DFCAAC, #D8A899, #8FA89B
  bgSubtleColor: string;
  keyActives: string[];
  clinicalGoal: string;
  barrierImpact: string;
  steps: RoutineStep[];
}

export interface UserProfile {
  name: string;
  avatarUrl: string;
  skinType: string;
  secondaryBiotype: string;
  conditions: string[];
  barrierStatus: string;
  barrierScore: number;
  tewlScore: string;
  hydrationLevel: string;
  cycleStreakDays: number;
  activeNight: number;
  totalCyclesCompleted: number;
}
