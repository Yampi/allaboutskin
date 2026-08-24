import {
  governAndClassifyBiomarkers,
  CLINICAL_REJECTIONS_CATALOG,
} from '../clinicalVisionEngine.ts';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failed++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

console.log('🧪 Iniciando Suite de Verificación de Gobernanza Clínica (16 Casos)...');

// Caso 1: Mano / Brazo
console.log('\n--- Test 1: Rechazo de Mano / Brazo ---');
const r1 = governAndClassifyBiomarkers({
  detectedAnatomy: 'HAND_OR_ARM',
  confidence: 0.96,
  landmarks: { bilateralEyesVisible: false, nasalDorsumVisible: false, oralCommissureVisible: false, malarCheeksVisible: false, foreheadVisible: false }
});
assert(r1.classification === 'INVALID', 'Clasificado como INVALID');
assert(r1.rejectionReason === 'INVALID_ANATOMY_HAND', 'Código es INVALID_ANATOMY_HAND');
assert(r1.userFriendlyMessage.includes('mano o piel no facial'), 'Mensaje incluye guía específica de mano');

// Caso 2: Pie / Pierna
console.log('\n--- Test 2: Rechazo de Pie / Pierna ---');
const r2 = governAndClassifyBiomarkers({
  detectedAnatomy: 'FOOT_OR_LEG',
  confidence: 0.95,
  landmarks: { bilateralEyesVisible: false, nasalDorsumVisible: false, oralCommissureVisible: false, malarCheeksVisible: false, foreheadVisible: false }
});
assert(r2.classification === 'INVALID', 'Clasificado como INVALID');
assert(r2.rejectionReason === 'INVALID_ANATOMY_FOOT_LEG', 'Código es INVALID_ANATOMY_FOOT_LEG');
assert(r2.userFriendlyMessage.includes('pie o pierna'), 'Mensaje incluye guía específica de pie/pierna');

// Caso 3: Torso / Espalda
console.log('\n--- Test 3: Rechazo de Espalda / Torso ---');
const r3 = governAndClassifyBiomarkers({
  detectedAnatomy: 'TORSO_OR_BACK',
  confidence: 0.94,
  landmarks: { bilateralEyesVisible: false, nasalDorsumVisible: false, oralCommissureVisible: false, malarCheeksVisible: false, foreheadVisible: false }
});
assert(r3.classification === 'INVALID', 'Clasificado como INVALID');
assert(r3.rejectionReason === 'INVALID_ANATOMY_TORSO_BACK', 'Código es INVALID_ANATOMY_TORSO_BACK');

// Caso 4: Rostro Ocluido (Gafas/Barbijo)
console.log('\n--- Test 4: Rechazo de Rostro Ocluido ---');
const r4 = governAndClassifyBiomarkers({
  detectedAnatomy: 'OCCLUDED_OR_INCOMPLETE_FACE',
  confidence: 0.93,
  landmarks: { bilateralEyesVisible: false, nasalDorsumVisible: true, oralCommissureVisible: true, malarCheeksVisible: true, foreheadVisible: true }
});
assert(r4.classification === 'INVALID', 'Clasificado como INVALID');
assert(r4.rejectionReason === 'INVALID_ANATOMY_OCCLUDED_FACE', 'Código es INVALID_ANATOMY_OCCLUDED_FACE');

// Caso 5: Mascota / Animal
console.log('\n--- Test 5: Rechazo de Mascota / Animal ---');
const r5 = governAndClassifyBiomarkers({
  detectedAnatomy: 'ANIMAL_OR_PET',
  confidence: 0.98,
  landmarks: { bilateralEyesVisible: false, nasalDorsumVisible: false, oralCommissureVisible: false, malarCheeksVisible: false, foreheadVisible: false }
});
assert(r5.classification === 'INVALID', 'Clasificado como INVALID');
assert(r5.rejectionReason === 'INVALID_NON_HUMAN', 'Código es INVALID_NON_HUMAN');

// Caso 6: Objeto / Entorno
console.log('\n--- Test 6: Rechazo de Objeto Inanimado ---');
const r6 = governAndClassifyBiomarkers({
  detectedAnatomy: 'NON_BIOLOGICAL_OBJECT',
  confidence: 0.99,
  landmarks: { bilateralEyesVisible: false, nasalDorsumVisible: false, oralCommissureVisible: false, malarCheeksVisible: false, foreheadVisible: false }
});
assert(r6.classification === 'INVALID', 'Clasificado como INVALID');
assert(r6.rejectionReason === 'INVALID_OBJECT_ENVIRONMENT', 'Código es INVALID_OBJECT_ENVIRONMENT');

// Caso 7: Calidad Baja / Foto Oscura
console.log('\n--- Test 7: Rechazo de Calidad Insuficiente / Oscura ---');
const r7 = governAndClassifyBiomarkers({
  detectedAnatomy: 'UNREADABLE_OR_POOR_QUALITY',
  confidence: 0.95,
  landmarks: { bilateralEyesVisible: false, nasalDorsumVisible: false, oralCommissureVisible: false, malarCheeksVisible: false, foreheadVisible: false }
});
assert(r7.classification === 'INVALID', 'Clasificado como INVALID');
assert(r7.rejectionReason === 'INVALID_IMAGE_QUALITY', 'Código es INVALID_IMAGE_QUALITY');

// Caso 8: Producto Cosmético
console.log('\n--- Test 8: Aceptación de Producto Cosmético ---');
const r8 = governAndClassifyBiomarkers({
  detectedAnatomy: 'COSMETIC_PRODUCT',
  confidence: 0.97,
  landmarks: { bilateralEyesVisible: false, nasalDorsumVisible: false, oralCommissureVisible: false, malarCheeksVisible: false, foreheadVisible: false },
  productData: {
    brand: 'The Ordinary',
    productName: 'Niacinamide 10% + Zinc 1%',
    inciText: 'Aqua, Niacinamide, Zinc PCA',
    rawDetectedText: 'The Ordinary Niacinamide 10%',
    notes: []
  }
});
assert(r8.classification === 'SKINCARE_PRODUCT', 'Clasificado como SKINCARE_PRODUCT');
assert(r8.productName === 'Niacinamide 10% + Zinc 1%', 'Nombre de producto extraído');

// Puntos de referencia válidos para los 5 biotipos faciales
const validLandmarks = {
  bilateralEyesVisible: true,
  nasalDorsumVisible: true,
  oralCommissureVisible: true,
  malarCheeksVisible: true,
  foreheadVisible: true
};

// Caso 9: Rostro Piel Grasa (OILY)
console.log('\n--- Test 9: Diagnóstico Facial OILY (Piel Grasa) ---');
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
    fitzpatrickPhototypeEstimate: 4
  }
});
assert(r9.classification === 'HUMAN_FACE', 'Clasificado como HUMAN_FACE');
assert(r9.faceAnalysis.skinTypeEstimate === 'OILY', 'Biotipo es OILY');
assert(r9.faceAnalysis.zoneTAnalysis.shineLevel === 'HIGH', 'Brillo T es HIGH');
assert(r9.faceAnalysis.scientificReferences.length >= 3, 'Incluye referencias científicas');

// Caso 10: Rostro Piel Seca (DRY)
console.log('\n--- Test 10: Diagnóstico Facial DRY (Piel Seca) ---');
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
    fitzpatrickPhototypeEstimate: 2
  }
});
assert(r10.classification === 'HUMAN_FACE', 'Clasificado como HUMAN_FACE');
assert(r10.faceAnalysis.skinTypeEstimate === 'DRY', 'Biotipo es DRY');
assert(r10.faceAnalysis.cheeksAnalysis.hydrationState === 'DRY', 'Mejillas en estado DRY');

// Caso 11: Rostro Piel Mixta (COMBINATION)
console.log('\n--- Test 11: Diagnóstico Facial COMBINATION (Piel Mixta) ---');
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
    fitzpatrickPhototypeEstimate: 3
  }
});
assert(r11.classification === 'HUMAN_FACE', 'Clasificado como HUMAN_FACE');
assert(r11.faceAnalysis.skinTypeEstimate === 'COMBINATION', 'Biotipo es COMBINATION');
assert(r11.faceAnalysis.zoneTAnalysis.poresVisible === true, 'Poros visibles en zona T');

// Caso 12: Rostro Piel Sensible (SENSITIVE)
console.log('\n--- Test 12: Diagnóstico Facial SENSITIVE (Piel Sensible) ---');
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
    fitzpatrickPhototypeEstimate: 1
  }
});
assert(r12.classification === 'HUMAN_FACE', 'Clasificado como HUMAN_FACE');
assert(r12.faceAnalysis.skinTypeEstimate === 'SENSITIVE', 'Biotipo es SENSITIVE');
assert(r12.faceAnalysis.cheeksAnalysis.rednessPresent === true, 'Rojez detectada en mejillas');

// Caso 13: Rostro Piel Normal (NORMAL)
console.log('\n--- Test 13: Diagnóstico Facial NORMAL (Piel Normal) ---');
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
    fitzpatrickPhototypeEstimate: 3
  }
});
assert(r13.classification === 'HUMAN_FACE', 'Clasificado como HUMAN_FACE');
assert(r13.faceAnalysis.skinTypeEstimate === 'NORMAL', 'Biotipo es NORMAL');
assert(r13.faceAnalysis.cheeksAnalysis.rednessPresent === false, 'Sin rojez en mejillas');

console.log(`\n========================================`);
console.log(`📊 RESULTADO FINAL: ${passed} Pasados, ${failed} Fallados`);
console.log(`========================================`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('✨ Todos los casos de verificación pasaron con éxito.');
}
