import {
  governAndClassifyBiomarkers,
  ExtractedClinicalBiomarkers,
  ClinicalSkinEvaluationResult,
  RejectionEvaluationResult,
} from '../clinicalVisionEngine';

export function runClinicalVisionGovernanceTests(): { passed: number; failed: number } {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      passed++;
    } else {
      failed++;
      console.error(`Assertion failed: ${message}`);
    }
  }

  // --- REJECTION TESTS: NON-FACIAL ANATOMY & OBJECTS ---

  // Case 1: Hand / Arm
  const r1 = governAndClassifyBiomarkers({
    detectedAnatomy: 'HAND_OR_ARM',
    confidence: 0.96,
    landmarks: {
      bilateralEyesVisible: false,
      nasalDorsumVisible: false,
      oralCommissureVisible: false,
      malarCheeksVisible: false,
      foreheadVisible: false,
    },
  }) as RejectionEvaluationResult;
  assert(r1.classification === 'INVALID', 'Hand rejected as INVALID');
  assert(r1.rejectionReason === 'INVALID_ANATOMY_HAND', 'Hand code is INVALID_ANATOMY_HAND');
  assert(r1.userFriendlyMessage.includes('mano o piel no facial'), 'Hand message is clinical and clear');

  // Case 2 & 3: Foot / Leg
  const r2 = governAndClassifyBiomarkers({
    detectedAnatomy: 'FOOT_OR_LEG',
    confidence: 0.95,
    landmarks: {
      bilateralEyesVisible: false,
      nasalDorsumVisible: false,
      oralCommissureVisible: false,
      malarCheeksVisible: false,
      foreheadVisible: false,
    },
  }) as RejectionEvaluationResult;
  assert(r2.classification === 'INVALID', 'Foot/Leg rejected as INVALID');
  assert(r2.rejectionReason === 'INVALID_ANATOMY_FOOT_LEG', 'Foot/Leg code is INVALID_ANATOMY_FOOT_LEG');

  // Case 4 & 5: Torso / Back
  const r3 = governAndClassifyBiomarkers({
    detectedAnatomy: 'TORSO_OR_BACK',
    confidence: 0.94,
    landmarks: {
      bilateralEyesVisible: false,
      nasalDorsumVisible: false,
      oralCommissureVisible: false,
      malarCheeksVisible: false,
      foreheadVisible: false,
    },
  }) as RejectionEvaluationResult;
  assert(r3.classification === 'INVALID', 'Torso/Back rejected as INVALID');
  assert(r3.rejectionReason === 'INVALID_ANATOMY_TORSO_BACK', 'Torso/Back code is INVALID_ANATOMY_TORSO_BACK');

  // Case 6 & 7: Occluded face
  const r4 = governAndClassifyBiomarkers({
    detectedAnatomy: 'OCCLUDED_OR_INCOMPLETE_FACE',
    confidence: 0.92,
    landmarks: {
      bilateralEyesVisible: false,
      nasalDorsumVisible: true,
      oralCommissureVisible: true,
      malarCheeksVisible: true,
      foreheadVisible: true,
    },
  }) as RejectionEvaluationResult;
  assert(r4.classification === 'INVALID', 'Occluded face rejected');
  assert(r4.rejectionReason === 'INVALID_ANATOMY_OCCLUDED_FACE', 'Code is INVALID_ANATOMY_OCCLUDED_FACE');

  // Case 8: Animal / Pet
  const r5 = governAndClassifyBiomarkers({
    detectedAnatomy: 'ANIMAL_OR_PET',
    confidence: 0.98,
    landmarks: {
      bilateralEyesVisible: false,
      nasalDorsumVisible: false,
      oralCommissureVisible: false,
      malarCheeksVisible: false,
      foreheadVisible: false,
    },
  }) as RejectionEvaluationResult;
  assert(r5.classification === 'INVALID', 'Pet rejected');
  assert(r5.rejectionReason === 'INVALID_NON_HUMAN', 'Code is INVALID_NON_HUMAN');

  // Case 9: Inanimate object
  const r6 = governAndClassifyBiomarkers({
    detectedAnatomy: 'NON_BIOLOGICAL_OBJECT',
    confidence: 0.99,
    landmarks: {
      bilateralEyesVisible: false,
      nasalDorsumVisible: false,
      oralCommissureVisible: false,
      malarCheeksVisible: false,
      foreheadVisible: false,
    },
  }) as RejectionEvaluationResult;
  assert(r6.classification === 'INVALID', 'Object rejected');
  assert(r6.rejectionReason === 'INVALID_OBJECT_ENVIRONMENT', 'Code is INVALID_OBJECT_ENVIRONMENT');

  // Case 10: Poor lighting or extreme blur
  const r7 = governAndClassifyBiomarkers({
    detectedAnatomy: 'UNREADABLE_OR_POOR_QUALITY',
    confidence: 0.95,
    landmarks: {
      bilateralEyesVisible: false,
      nasalDorsumVisible: false,
      oralCommissureVisible: false,
      malarCheeksVisible: false,
      foreheadVisible: false,
    },
  }) as RejectionEvaluationResult;
  assert(r7.classification === 'INVALID', 'Poor quality rejected');
  assert(r7.rejectionReason === 'INVALID_IMAGE_QUALITY', 'Code is INVALID_IMAGE_QUALITY');

  // Case 11: Skincare Product bottle
  const r8 = governAndClassifyBiomarkers({
    detectedAnatomy: 'COSMETIC_PRODUCT',
    confidence: 0.97,
    landmarks: {
      bilateralEyesVisible: false,
      nasalDorsumVisible: false,
      oralCommissureVisible: false,
      malarCheeksVisible: false,
      foreheadVisible: false,
    },
    productData: {
      brand: 'The Ordinary',
      productName: 'Niacinamide 10% + Zinc 1%',
      inciText: 'Aqua, Niacinamide, Zinc PCA',
      rawDetectedText: 'The Ordinary Niacinamide 10%',
      notes: [],
    },
  });
  assert(r8.classification === 'SKINCARE_PRODUCT', 'Accepted as SKINCARE_PRODUCT');

  // --- ACCEPTANCE TESTS: DETERMINISTIC BAUMANN BSTI SKIN TYPING ---
  const validLandmarks = {
    bilateralEyesVisible: true,
    nasalDorsumVisible: true,
    oralCommissureVisible: true,
    malarCheeksVisible: true,
    foreheadVisible: true,
  };

  // Case 12: OILY
  const r9 = governAndClassifyBiomarkers({
    detectedAnatomy: 'HUMAN_FACE',
    confidence: 0.94,
    landmarks: validLandmarks,
    opticalBiomarkers: {
      tZoneSebumReflectance: 'HIGH',
      cheeksSebumReflectance: 'HIGH',
      follicularOstiaPores: 'DIFFUSE_WIDE',
      erythemaMalarIndex: 'ABSENT',
      stratumCorneumDesquamation: 'NONE',
      fitzpatrickPhototypeEstimate: 4,
    },
  }) as ClinicalSkinEvaluationResult;
  assert(r9.classification === 'HUMAN_FACE', 'Oily classified as HUMAN_FACE');
  assert(r9.faceAnalysis.skinTypeEstimate === 'OILY', 'Biotipo is OILY');
  assert(r9.faceAnalysis.zoneTAnalysis.shineLevel === 'HIGH', 'Zone T shine is HIGH');

  // Case 13: DRY
  const r10 = governAndClassifyBiomarkers({
    detectedAnatomy: 'HUMAN_FACE',
    confidence: 0.93,
    landmarks: validLandmarks,
    opticalBiomarkers: {
      tZoneSebumReflectance: 'NONE',
      cheeksSebumReflectance: 'NONE',
      follicularOstiaPores: 'MINIMAL_INCONSPICUOUS',
      erythemaMalarIndex: 'ABSENT',
      stratumCorneumDesquamation: 'MILD_LOCALIZED',
      fitzpatrickPhototypeEstimate: 2,
    },
  }) as ClinicalSkinEvaluationResult;
  assert(r10.classification === 'HUMAN_FACE', 'Dry classified as HUMAN_FACE');
  assert(r10.faceAnalysis.skinTypeEstimate === 'DRY', 'Biotipo is DRY');

  // Case 14: COMBINATION
  const r11 = governAndClassifyBiomarkers({
    detectedAnatomy: 'HUMAN_FACE',
    confidence: 0.95,
    landmarks: validLandmarks,
    opticalBiomarkers: {
      tZoneSebumReflectance: 'HIGH',
      cheeksSebumReflectance: 'LOW',
      follicularOstiaPores: 'VISIBLE_T_ZONE',
      erythemaMalarIndex: 'ABSENT',
      stratumCorneumDesquamation: 'NONE',
      fitzpatrickPhototypeEstimate: 3,
    },
  }) as ClinicalSkinEvaluationResult;
  assert(r11.classification === 'HUMAN_FACE', 'Combination classified as HUMAN_FACE');
  assert(r11.faceAnalysis.skinTypeEstimate === 'COMBINATION', 'Biotipo is COMBINATION');

  // Case 15: SENSITIVE
  const r12 = governAndClassifyBiomarkers({
    detectedAnatomy: 'HUMAN_FACE',
    confidence: 0.91,
    landmarks: validLandmarks,
    opticalBiomarkers: {
      tZoneSebumReflectance: 'LOW',
      cheeksSebumReflectance: 'NONE',
      follicularOstiaPores: 'MINIMAL_INCONSPICUOUS',
      erythemaMalarIndex: 'DIFFUSE_MODERATE',
      stratumCorneumDesquamation: 'NONE',
      fitzpatrickPhototypeEstimate: 1,
    },
  }) as ClinicalSkinEvaluationResult;
  assert(r12.classification === 'HUMAN_FACE', 'Sensitive classified as HUMAN_FACE');
  assert(r12.faceAnalysis.skinTypeEstimate === 'SENSITIVE', 'Biotipo is SENSITIVE');

  // Case 16: NORMAL
  const r13 = governAndClassifyBiomarkers({
    detectedAnatomy: 'HUMAN_FACE',
    confidence: 0.96,
    landmarks: validLandmarks,
    opticalBiomarkers: {
      tZoneSebumReflectance: 'LOW',
      cheeksSebumReflectance: 'LOW',
      follicularOstiaPores: 'MINIMAL_INCONSPICUOUS',
      erythemaMalarIndex: 'ABSENT',
      stratumCorneumDesquamation: 'NONE',
      fitzpatrickPhototypeEstimate: 3,
    },
  }) as ClinicalSkinEvaluationResult;
  assert(r13.classification === 'HUMAN_FACE', 'Normal classified as HUMAN_FACE');
  assert(r13.faceAnalysis.skinTypeEstimate === 'NORMAL', 'Biotipo is NORMAL');
  assert(!!r13.faceAnalysis.faceRegions, 'faceRegions is defined');
  assert(typeof r13.faceAnalysis.faceRegions.zoneTBox.top === 'number', 'zoneTBox has top coordinate');
  assert(typeof r13.faceAnalysis.faceRegions.leftCheekBox.left === 'number', 'leftCheekBox has left coordinate');
  assert(typeof r13.faceAnalysis.faceRegions.rightCheekBox.left === 'number', 'rightCheekBox has right coordinate');

  // Case 17: Explicit face coordinates preserved
  const r14 = governAndClassifyBiomarkers({
    detectedAnatomy: 'HUMAN_FACE',
    confidence: 0.98,
    landmarks: validLandmarks,
    faceRegions: {
      faceBox: { top: 10, left: 15, width: 70, height: 75 },
      zoneTBox: { top: 14, left: 32, width: 36, height: 38 },
      leftCheekBox: { top: 44, left: 18, width: 22, height: 24 },
      rightCheekBox: { top: 44, left: 60, width: 22, height: 24 },
    },
    opticalBiomarkers: {
      tZoneSebumReflectance: 'HIGH',
      cheeksSebumReflectance: 'LOW',
      follicularOstiaPores: 'VISIBLE_T_ZONE',
      erythemaMalarIndex: 'ABSENT',
      stratumCorneumDesquamation: 'NONE',
      fitzpatrickPhototypeEstimate: 3,
    },
  }) as ClinicalSkinEvaluationResult;
  assert(r14.faceAnalysis.faceRegions.faceBox.top === 10, 'Preserves explicit faceBox.top');
  assert(r14.faceAnalysis.faceRegions.zoneTBox.top === 14, 'Preserves explicit zoneTBox.top');
  assert(r14.faceAnalysis.faceRegions.leftCheekBox.left === 18, 'Preserves explicit leftCheekBox.left');
  assert(r14.faceAnalysis.faceRegions.rightCheekBox.left === 60, 'Preserves explicit rightCheekBox.left');

  return { passed, failed };
}
