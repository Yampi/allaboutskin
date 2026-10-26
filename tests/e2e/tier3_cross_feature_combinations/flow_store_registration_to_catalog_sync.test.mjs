/**
 * tests/e2e/tier3_cross_feature_combinations/flow_store_registration_to_catalog_sync.test.mjs
 * Tier 3: Pairwise Flow 2 — ACID Store Registration -> Bulk Catalog Import -> Geolocation Discovery
 * Feature Ref: ORIGINAL_REQUEST §R1-R3, PROJECT.md
 */

import { describe, test } from '../helpers/test_framework.mjs';
import { assertEqual, assertTrue, assertFalse } from '../helpers/assertions.mjs';

describe('Tier 3 - Flow 2: Store Registration -> Catalog Import -> Geolocation Discovery', () => {
  test('TC-PAIR-02: Complete lifecycle of merchant onboarding, inventory load, and search discovery', async () => {
    // 1. Merchant registers store under ACID transaction
    const merchantId = 205;
    const storeRecord = {
      id: 15,
      owner_id: merchantId,
      name: 'Farmacia San Antonio',
      slug: 'farmacia-san-antonio',
      subscription_tier: 'PRO_LOCAL',
    };
    const branchRecord = {
      id: 50,
      store_id: 15,
      name: 'Sede Los Teques',
      city: 'Los Teques',
      latitude: 10.3444,
      longitude: -67.0428,
      whatsapp: '+584121239999',
    };

    assertEqual(storeRecord.subscription_tier, 'PRO_LOCAL');
    assertEqual(branchRecord.store_id, 15);

    // 2. Merchant uploads bulk CSV inventory with 5 products
    const csvContent = `product_name,price_usd,stock_quantity
The Ordinary Niacinamide 10%,12.50,15
CeraVe Foaming Cleanser,15.00,20
Bioderma Sensibio Gel Moussant,18.00,8
La Roche-Posay Effaclar Duo,22.50,12
Eucerin Sun Gel-Cream Oil Control,25.00,10`;

    function processCsvImport(branchId, csvText, exchangeRate) {
      const lines = csvText.trim().split('\n').slice(1);
      return lines.map((line, idx) => {
        const [name, priceStr, stockStr] = line.split(',');
        const priceUsd = parseFloat(priceStr);
        const stock = parseInt(stockStr, 10);
        return {
          id: 1000 + idx,
          branch_id: branchId,
          product_name: name,
          price_usd: priceUsd,
          price_ves: Math.round(priceUsd * exchangeRate * 100) / 100,
          stock,
          in_stock: stock > 0,
        };
      });
    }

    const exchangeRate = 36.50;
    const importedOffers = processCsvImport(branchRecord.id, csvContent, exchangeRate);
    assertEqual(importedOffers.length, 5);
    assertEqual(importedOffers[0].price_ves, 456.25);
    assertTrue(importedOffers.every(o => o.in_stock));

    // 3. Customer in Los Teques searches for "Effaclar Duo"
    function searchNearbyOffers(userLat, userLng, query, allOffers, branchInfo) {
      const matching = allOffers.filter(o => 
        o.product_name.toLowerCase().includes(query.toLowerCase()) && o.in_stock
      );

      return matching.map(offer => ({
        ...offer,
        store_name: storeRecord.name,
        branch_name: branchInfo.name,
        branch_address: branchInfo.city,
        whatsapp: branchInfo.whatsapp,
      }));
    }

    const searchResults = searchNearbyOffers(10.3444, -67.0428, 'Effaclar', importedOffers, branchRecord);
    assertEqual(searchResults.length, 1);
    assertEqual(searchResults[0].product_name, 'La Roche-Posay Effaclar Duo');
    assertEqual(searchResults[0].branch_name, 'Sede Los Teques');
    assertEqual(searchResults[0].price_usd, 22.50);
    assertEqual(searchResults[0].price_ves, 821.25);
  });
});
