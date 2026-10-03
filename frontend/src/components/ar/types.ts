export type FaceZoneKey = 
  | 'forehead' 
  | 'nose' 
  | 'leftCheek' 
  | 'rightCheek' 
  | 'chin' 
  | 'eyeContour' 
  | 'neck';

export type VirtualTextureType = 
  | 'emerald_lines'   // High-precision emerald clinical zone lines (Default, 100% transparent skin)
  | 'cyan_lines'      // Bioluminescent cyan aesthetic lines
  | 'gold_lines'      // Champagne gold contouring lines
  | 'rose_lines'      // Gentle rose soothing lines
  | 'clay_mint'       // Like photo 2: Mint green matcha clay mask
  | 'clay_white'      // Like photo 1: White kaolin spa cream mask
  | 'clay_rose'       // Soothing rose calamine clay
  | 'charcoal'        // Deep pore detox volcanic dark clay
  | 'gold_mask'       // 24k colloidal gold firming mask
  | 'hydrogel_mask'   // Dewy hyaluronic crystal glaze
  | 'clay_mask'       // Legacy matcha green
  | 'cleansing_foam'  // Micro-bubble micellar lather
  | 'cleansing_balm'  // Melting amber cleansing balm
  | 'hydrating_serum' // Deep hydration active serum
  | 'uv_shield';      // UV purple protective barrier

export type TutorialRoutineType = 
  | 'double_cleansing' 
  | 'skin_cycling' 
  | 'spf_shield';

export type ArExperiencePhase = 'calibrating' | 'ready' | 'tutorial';

export type MaskDisplayMode = 'transparent_lines' | 'biometric_hud' | 'zone_application' | 'full_spa' | 'hybrid';

export interface HeadPose {
  yaw: number;   // -1.0 (looking left) to +1.0 (looking right)
  pitch: number; // -1.0 (looking down) to +1.0 (looking up)
  roll: number;  // tilt in radians
  angleDegrees: { yaw: number; pitch: number; roll: number };
}

export type CalibrationStepKey = 'center' | 'left' | 'right' | 'tilt' | 'complete';

export type BrushTrailStyle = 'cotton_pad' | 'serum_glow' | 'off';

export interface HeadCalibrationState {
  center: boolean;
  left: boolean;
  right: boolean;
  tilt: boolean;
  currentStep: CalibrationStepKey;
  percent: number;
}

export interface FaceZoneInfo {
  key: FaceZoneKey;
  label: string;
  shortLabel: string;
  description: string;
  colorHex: string;
  glowRgba: string;
  targetRubbingScore: number;
}

export interface TutorialStep {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  activeZones: FaceZoneKey[];
  instruction: string;
  dermatologicalTip: string;
  suggestedTexture: VirtualTextureType;
  requiresFullCoverage: boolean;
  minDurationSeconds: number;
}

export interface TutorialRoutine {
  id: TutorialRoutineType;
  name: string;
  subtitle: string;
  badge: string;
  description: string;
  estimatedMinutes: number;
  texture: VirtualTextureType;
  steps: TutorialStep[];
}

export interface ZoneCoverageState {
  forehead: number; // 0 to 100%
  nose: number;
  leftCheek: number;
  rightCheek: number;
  chin: number;
  eyeContour: number;
  neck: number;
}

export interface ArFilterConfig {
  showHoloMesh: boolean;
  showFullMask: boolean;
  showZoneOutlines: boolean;
  showZoneParticles: boolean;
  enableSoundChimes: boolean;
  textureType: VirtualTextureType;
  maskOpacity: number; // 0.0 to 1.0 (default 0.90 for realistic clay paste)
  maskDisplayMode: MaskDisplayMode;
  zoomLevel: number;   // 1.0 to 3.0
  sensitivity: 'low' | 'normal' | 'high';
  mirrorMode: boolean;
  enableRigidAnchor?: boolean;
  brushTrailStyle?: BrushTrailStyle;
}

export interface FaceLandmarkPoint {
  x: number; // 0 to 1 normalized
  y: number; // 0 to 1 normalized
  z?: number;
}
