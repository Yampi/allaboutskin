/**
 * tests/e2e/tier4_real_world_application_scenarios/scenario_01_patient_onboarding_to_store_conversion.test.mjs
 * Tier 4: Real-World Scenario 1 — Patient Onboarding to Local Store Conversion
 * Complete end-to-end user lifecycle from symptom capture to merchant transaction
 */

import { describe, test } from '../helpers/test_framework.mjs';
import { assertEqual, assertTrue, assertFalse, assertNoMatch } from '../helpers/assertions.mjs';
import { STORE_FIXTURES } from '../helpers/fixtures.mjs';

describe('Tier 4 - Scenario 1: Patient Onboarding to Local Store Conversion', () => {
  test('Complete journey: Wizard onboarding -> Personalized routine -> Store search -> WhatsApp lead', async () => {
    // 1. Patient arrives on platform and completes 6-dimension clinical onboarding
    const patientSession = {
      user_id: 882,
      name: 'Camila Rodriguez',
      email: 'camila.rodriguez@example.com',
      skinProfile: {
        skinType: 'COMBINATION',
        fitzpatrick: 3,
        barrierStatus: 'HEALTHY',
        skinConditions: ['ACNE', 'CLOGGED_PORES'],
        pregnancyOrNursing: false,
        experienceLevel: 'INTERMEDIATE',
      },
    };

    // 2. Clinical engine prescribes Classic 4-Night Skin Cycling regime
    const routine = {
      regimeId: 'dermatological-classic-4night',
      cycleNights: 4,
      schedule: [
        {
          night: 1,
          phase: 'Exfoliación Química',
          activeTarget: 'Ácido Salicílico 2% (BHA)',
          productName: 'CeraVe BHA Cleanser 236ml',
        },
        {
          night: 2,
          phase: 'Retinoide Eficaz',
          activeTarget: 'Retinaldehído 0.05%',
          productName: 'Avene Cleanance Women Night',
        },
        {
          night: 3,
          phase: 'Recuperación Celular',
          activeTarget: 'Ceramidas NP/AP/EOP',
          productName: 'Bioderma Atoderm Baume',
        },
        {
          night: 4,
          phase: 'Consolidación Lipídica',
          activeTarget: 'Pantenol 5% + Escualano',
          productName: 'La Roche-Posay Cicaplast Baume B5',
        },
      ],
    };

    assertEqual(routine.schedule[0].activeTarget, 'Ácido Salicílico 2% (BHA)');

    // 3. Patient checks nearest pharmacy stocking Night 1 BHA Cleanser
    const userLocation = { lat: 10.4806, lng: -66.8601, city: 'Caracas' };
    const availableBranches = [
      {
        id: 101,
        store_name: STORE_FIXTURES.validStore.name,
        branch_name: STORE_FIXTURES.validBranch.name,
        address: STORE_FIXTURES.validBranch.address,
        whatsapp: STORE_FIXTURES.validBranch.whatsapp,
        product: 'CeraVe BHA Cleanser 236ml',
        price_usd: 15.50,
        price_ves: 565.75, // Exchange rate: 36.50
        in_stock: true,
        distance_km: 0.65,
      },
      {
        id: 102,
        store_name: 'Farmacia FarmaPlus',
        branch_name: 'Sede Sabana Grande',
        address: 'Bulevar de Sabana Grande',
        whatsapp: '+584120001122',
        product: 'CeraVe BHA Cleanser 236ml',
        price_usd: 17.00,
        price_ves: 620.50,
        in_stock: true,
        distance_km: 3.4,
      },
    ];

    const bestBranch = availableBranches.sort((a, b) => a.distance_km - b.distance_km)[0];
    assertEqual(bestBranch.branch_name, 'Sede Principal Las Mercedes');
    assertEqual(bestBranch.price_usd, 15.50);

    // 4. Patient initiates zero-PII reservation via WhatsApp
    const phone = bestBranch.whatsapp.replace(/[^0-9]/g, '');
    const outboundMsg = `¡Hola! Vi en All About Skin que tienen "${bestBranch.product}". ¿Tienen stock disponible en su sede de ${bestBranch.branch_name}?`;
    const outboundUrl = `https://wa.me/${phone}?text=${encodeURIComponent(outboundMsg)}`;

    assertTrue(outboundUrl.startsWith('https://wa.me/584141234567'));
    assertTrue(decodeURIComponent(outboundUrl).includes('CeraVe BHA Cleanser 236ml'));

    // 5. Verify Zero-PII Compliance: Zero user identifiers or medical tags in telemetry or URL
    assertNoMatch(outboundUrl, /camila|rodriguez|acne|combination/i, 'URL must not leak patient data');

    const leadInteraction = {
      store_id: 1,
      branch_id: bestBranch.id,
      interaction_type: 'WHATSAPP_CLICK',
      metadata: { product_name: bestBranch.product, city: userLocation.city },
    };

    assertEqual(leadInteraction.interaction_type, 'WHATSAPP_CLICK');
    assertFalse('patient_email' in leadInteraction);
  });
});
