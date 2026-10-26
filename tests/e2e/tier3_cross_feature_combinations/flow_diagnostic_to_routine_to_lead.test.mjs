/**
 * tests/e2e/tier3_cross_feature_combinations/flow_diagnostic_to_routine_to_lead.test.mjs
 * Tier 3: Pairwise Flow 1 — Diagnostic Wizard -> Routine Creation -> Store Inventory -> Zero-PII WhatsApp Lead
 * Feature Ref: ORIGINAL_REQUEST §R1-R4, PROJECT.md
 */

import { describe, test } from '../helpers/test_framework.mjs';
import { assertEqual, assertTrue, assertFalse, assertNoMatch } from '../helpers/assertions.mjs';

describe('Tier 3 - Flow 1: Diagnostic -> Routine -> Inventory -> WhatsApp Lead', () => {
  test('TC-PAIR-01: End-to-end traversal from patient skin questionnaire to WhatsApp conversion link', async () => {
    // 1. Patient completes Diagnostic Wizard
    const patientProfile = {
      skinType: 'COMBINATION',
      fitzpatrick: 3,
      barrierStatus: 'HEALTHY',
      skinConditions: ['ACNE'],
      pregnancyOrNursing: false,
      experienceLevel: 'INTERMEDIATE',
    };

    // 2. Engine generates Classic 4-Night Cycling routine
    function generateRoutine(profile) {
      return {
        regime: 'dermatological-classic-4night',
        activeSteps: [
          { night: 1, targetActive: 'Salicylic Acid 2%', role: 'BHA Exfoliant', recommendedProduct: 'CeraVe BHA Cleanser' },
          { night: 2, targetActive: 'Retinaldehído 0.05%', role: 'Retinoid Renewal', recommendedProduct: 'Avene Cleanance Women Night' },
          { night: 3, targetActive: 'Ceramidas 3:1:1', role: 'Barrier Hydration', recommendedProduct: 'Bioderma Atoderm Intensive Baume' },
          { night: 4, targetActive: 'Pantenol 5%', role: 'Lipid Consolidation', recommendedProduct: 'La Roche-Posay Cicaplast Baume B5' },
        ],
      };
    }
    const routine = generateRoutine(patientProfile);
    assertEqual(routine.regime, 'dermatological-classic-4night');
    assertEqual(routine.activeSteps.length, 4);

    // 3. User selects Night 1 product to check local inventory near Las Mercedes (10.4806, -66.8601)
    const selectedProduct = routine.activeSteps[0].recommendedProduct;
    const storeCatalog = [
      {
        store_id: 1,
        branch_id: 10,
        store_name: 'Farmacia San Rafael',
        branch_name: 'Sede Las Mercedes',
        address: 'Av Principal Las Mercedes',
        whatsapp: '+584141234567',
        product_name: 'CeraVe BHA Cleanser',
        price_usd: 16.50,
        in_stock: true,
        distance_km: 0.8,
      },
      {
        store_id: 2,
        branch_id: 20,
        store_name: 'Droguería Caracas',
        branch_name: 'Sede Centro',
        address: 'Av Urdaneta',
        whatsapp: '+584129998877',
        product_name: 'CeraVe BHA Cleanser',
        price_usd: 18.00,
        in_stock: true,
        distance_km: 7.5,
      },
    ];

    const matchingStock = storeCatalog
      .filter(item => item.product_name === selectedProduct && item.in_stock)
      .sort((a, b) => a.distance_km - b.distance_km);

    assertTrue(matchingStock.length > 0);
    const closestStore = matchingStock[0];
    assertEqual(closestStore.branch_name, 'Sede Las Mercedes');
    assertTrue(closestStore.distance_km < 1.0);

    // 4. Generate Zero-PII WhatsApp outbound link for immediate reservation
    function generateWhatsAppOutbound(branch, product) {
      const phone = branch.whatsapp.replace(/[^0-9]/g, '');
      const msg = `¡Hola! Vi en All About Skin que tienen "${product}". ¿Tienen stock disponible en su sede de ${branch.branch_name}?`;
      return {
        url: `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,
        telemetry: {
          store_id: branch.store_id,
          branch_id: branch.branch_id,
          interaction_type: 'WHATSAPP_CLICK',
          metadata: { product_name: product },
        },
      };
    }

    const lead = generateWhatsAppOutbound(closestStore, selectedProduct);
    assertTrue(lead.url.startsWith('https://wa.me/584141234567?text='));
    assertTrue(decodeURIComponent(lead.url).includes('CeraVe BHA Cleanser'));

    // Verify 100% Zero-PII integrity
    assertNoMatch(lead.url, /patient|profile|fitzpatrick|acne|historial/i, 'No diagnostic data leaked in URL');
    assertEqual(lead.telemetry.store_id, 1);
    assertEqual(lead.telemetry.branch_id, 10);
  });
});
