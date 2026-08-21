export type SkinType = 'OILY' | 'DRY' | 'COMBINATION' | 'NORMAL' | 'SENSITIVE';

export type FitzpatrickType = 1 | 2 | 3 | 4 | 5 | 6;

export type BarrierStatus = 'HEALTHY' | 'COMPROMISED' | 'ACUTELY_DAMAGED';

export type SkinCondition = 
  | 'ACNE' 
  | 'ROSACEA' 
  | 'HYPERPIGMENTATION' 
  | 'AGING' 
  | 'CLOGGED_PORES' 
  | 'REDNESS';

export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface SkinDiagnosisInput {
  skinType: SkinType;
  fitzpatrick: FitzpatrickType;
  barrierStatus: BarrierStatus;
  conditions: SkinCondition[];
  pregnancyOrNursing: boolean;
  experienceLevel: ExperienceLevel;
}

export type NightCategory = 'EXFOLIATION' | 'RETINOID' | 'RECOVERY' | 'REST_ONLY';

export interface ProtocolNight {
  nightNumber: number;
  category: NightCategory;
  title: string;
  subtitle: string;
  badgeColor: 'teal' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple';
  recommendedActives: string[];
  suggestedSteps: string[];
  clinicalRationale: string;
  precautions: string[];
}

export interface SkinCyclingProtocol {
  id: string;
  cycleLength: number; // e.g. 4, 5 or 6 nights
  protocolName: string;
  summary: string;
  barrierScore: 'ÓPTIMO' | 'MODERADO' | 'CRÍTICO';
  nights: ProtocolNight[];
  clinicalAdvice: string[];
  suitableExfoliants: string[];
  suitableRetinoidsOrAlternatives: string[];
  suitableMoisturizers: string[];
}

export interface UserRoutineProduct {
  id: string;
  phaseId: number; // Night number or 0 for daily AM
  productName: string;
  brand?: string;
  inciSummary?: string;
  category: 'CLEANSER' | 'EXFOLIANT' | 'RETINOID' | 'SERUM' | 'MOISTURIZER' | 'SPF';
  notes?: string;
}
