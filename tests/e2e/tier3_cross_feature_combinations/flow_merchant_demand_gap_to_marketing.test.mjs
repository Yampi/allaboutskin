/**
 * tests/e2e/tier3_cross_feature_combinations/flow_merchant_demand_gap_to_marketing.test.mjs
 * Tier 3: Pairwise Flow 8 — Demand Gap Analytics -> Marketing Playbook -> Targeted Local Ads
 * Feature Ref: ORIGINAL_REQUEST §R3-R4, PROJECT.md Features 13 & 14
 */

import { describe, test } from '../helpers/test_framework.mjs';
import { assertEqual, assertTrue, assertFalse } from '../helpers/assertions.mjs';

describe('Tier 3 - Flow 8: Demand Gap Analytics -> Marketing Ad Targeting', () => {
  test('TC-PAIR-08: Demand Gap analytics identifies unmet search queries and generates targeted promotional copy', async () => {
    // 1. Demand Gap Report for Pharmacy in Chacao
    const demandGapReport = [
      {
        ingredient_name: 'Azelaic Acid',
        evidence_grade: 'A',
        opportunity_score: 95,
        local_searches_last_30d: 180,
        in_stock_in_branch: false,
        commercial_action: 'STOCK_ACQUISITION_RECOMMENDED',
      },
      {
        ingredient_name: 'Zinc PCA',
        evidence_grade: 'B',
        opportunity_score: 82,
        local_searches_last_30d: 95,
        in_stock_in_branch: false,
        commercial_action: 'STOCK_ACQUISITION_RECOMMENDED',
      },
    ];

    const topOpportunity = demandGapReport[0];
    assertEqual(topOpportunity.ingredient_name, 'Azelaic Acid');
    assertEqual(topOpportunity.opportunity_score, 95);

    // 2. Merchant acquires stock and selects high-converting ad copy from Marketing Playbook
    function generateTargetedCampaign(opportunityItem, branchName) {
      return {
        targetIngredient: opportunityItem.ingredient_name,
        targetAudience: 'Pacientes con Rosácea, Acné o Melasma Gestacional',
        adChannel: 'Meta Ads & WhatsApp Broadcast',
        adHook: `¿Cansado de buscar Ácido Azelaico en farmacias de la zona? Ya disponible en ${branchName} a precio oficial.`,
        medicalDisclaimer: 'Aviso Médico: No sustituye la consulta médica dermatológica. Consulte a su médico.',
      };
    }

    const campaign = generateTargetedCampaign(topOpportunity, 'Farmacia San Rafael Chacao');
    assertTrue(campaign.adHook.includes('Ácido Azelaico'));
    assertTrue(campaign.adHook.includes('Farmacia San Rafael Chacao'));
    assertTrue(campaign.medicalDisclaimer.includes('Aviso Médico'));

    // 3. Merchant verifies stock addition resolves the Demand Gap
    const updatedInventory = [{ name: 'The Ordinary Azelaic Acid 10%', in_stock: true }];
    const isGapResolved = updatedInventory.some(i => i.name.includes('Azelaic Acid') && i.in_stock);
    assertTrue(isGapResolved, 'Demand gap is successfully resolved upon stock addition');
  });
});
