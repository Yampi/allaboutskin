# Original User Request

## 2026-10-25T15:29:20Z

Transform Allabout.skin into a commercial-grade, fully audited platform ready for commercialization, investor acquisition, and production deployment across its three core user dimensions (B2C Skincare User, B2B Pharmacy/Store, SuperAdmin Operations).

Working directory: c:\Users\soulw\Documents\antigravity\brave-fermi
Integrity mode: development

## Requirements

### R1. Frontend Modularization & Commercial UI (DLG-EXEC)
Refactor and decompose monolithic pages (frontend/src/app/admin/page.tsx of 4,985 lines and frontend/src/app/dashboard/empresa/page.tsx of 2,404 lines) into atomic, clean, easily modifiable components (< 120 lines each) under DLG-EXEC guidelines. Ensure real-time switching between B2C User, B2B Merchant, and SuperAdmin views with full end-to-end functionality.

### R2. Backend Resilience, Memory Safety & Data Integrity
Eliminate the runtime RAM exhaustion bottleneck in InciParserService.php (replacing the full in-memory table scan with indexed SQL queries). Ensure compound model creations in store/branch operations are encapsulated in ACID transactions (DB::transaction). Remove mock/fake fallbacks in API client and replace with resilient error states and SRE Circuit Breaker pattern.

### R3. B2B Commerce, Zero-PII Scraping & Lead Protocol
Streamline the scraping subsystem to focus strictly on direct catalog feeds (VTEX, Shopify, WooCommerce, Schema.org) with strict 8s timeouts and exponential backoff. Maintain the Zero-PII lead generation mechanism for WhatsApp and Google Maps outbound links.

### R4. Complete Multi-Level Commercial & Strategic Documentation
Produce four formal, independent documentation suites:
1. End-User Guide (B2C): Patient onboarding, Skin Cycling masterclass, chemical ingredient guide.
2. B2B Merchant Kit: Sales pitch deck, ROI value proposition for pharmacies, WhatsApp lead playbook.
3. Marketing & Advertising Playbook: Consumer pain-point angles, high-conversion copy for Meta/TikTok Ads, video scripts.
4. Investor & M&A Due Diligence Dossier: Tech Moat analysis, Unit Economics, Data Room verification, and valuation framework.

## Acceptance Criteria

### Verification & Quality Gates
- [ ] TypeScript compilation (tsc --noEmit) passes with 0 errors across all refactored frontend components.
- [ ] No single component in admin or dashboard/empresa exceeds 180 lines of code.
- [ ] INCI parsing executes in under 50ms without loading the entire ingredients table into PHP memory.
- [ ] All 4 multi-level documentation packages are created as standalone, authoritative markdown artifacts.
- [ ] End-to-end navigation across the 3 portals (User, Store, Admin) functions cleanly with live data.
