import React, { useEffect } from 'react';
import AdminScraperMetrics from './AdminScraperMetrics';
import AdminCrawlerHealthBanner from './AdminCrawlerHealthBanner';
import AdminCrawlerKpis from './AdminCrawlerKpis';
import AdminScraperRunForm from './AdminScraperRunForm';
import AdminGoogleDiscoveryForm from './AdminGoogleDiscoveryForm';
import AdminGoogleDiscoveryResults from './AdminGoogleDiscoveryResults';
import AdminCrawledStoresAccordion from './AdminCrawledStoresAccordion';
import AdminPriceVolatilityMonitor from './AdminPriceVolatilityMonitor';
import AdminScraperConsoleModal from './AdminScraperConsoleModal';
import AdminOfferInspectModal from './AdminOfferInspectModal';
import { useAdminScraper } from '@/hooks/admin/useAdminScraper';

interface AdminScraperTabProps {
  onNotify?: (type: 'success' | 'error', message: string) => void;
  onAfterRun?: () => Promise<void>;
}

export default function AdminScraperTab({ onNotify, onAfterRun }: AdminScraperTabProps) {
  const {
    scraperData,
    scraperForm,
    setScraperForm,
    isScraperRunning,
    scraperConsoleOutput,
    setScraperConsoleOutput,
    discoverForm,
    setDiscoverForm,
    isDiscovering,
    discoveryResult,
    setDiscoveryResult,
    inspectingOffer,
    setInspectingOffer,
    crawlerSummary,
    summaryHours,
    setSummaryHours,
    isLoadingSummary,
    isLoading,
    crawlerStoreSearch,
    setCrawlerStoreSearch,
    crawlerSelectedCountryTab,
    setCrawlerSelectedCountryTab,
    recentPricesCountry,
    setRecentPricesCountry,
    loadCrawlerSummary,
    loadScraperStatus,
    handleRunScraper,
    handleRunDiscovery,
  } = useAdminScraper(onNotify, onAfterRun);

  useEffect(() => {
    loadScraperStatus();
  }, [loadScraperStatus]);

  return (
    <div className="space-y-4">
      <AdminScraperMetrics metrics={scraperData?.metrics} />

      <div className="bg-white border border-slate-200 shadow-xs rounded-lg p-5 space-y-4">
        <AdminCrawlerHealthBanner
          health={crawlerSummary?.health}
          summaryHours={summaryHours}
          onHoursChange={(h) => {
            setSummaryHours(h);
            loadCrawlerSummary(h);
          }}
          onRefresh={() => loadCrawlerSummary(summaryHours)}
          isLoading={isLoadingSummary}
        />

        <AdminCrawlerKpis
          kpis={crawlerSummary?.kpis}
          summaryHours={summaryHours}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AdminScraperRunForm
          form={scraperForm}
          onChange={(field, val) => setScraperForm((prev) => ({ ...prev, [field]: val }))}
          onSubmit={handleRunScraper}
          isRunning={isScraperRunning}
          activeIngredients={scraperData?.active_ingredients}
        />

        <div className="space-y-4">
          <AdminGoogleDiscoveryForm
            form={discoverForm}
            onChange={(field, val) => setDiscoverForm((prev) => ({ ...prev, [field]: val }))}
            onSubmit={handleRunDiscovery}
            isDiscovering={isDiscovering}
          />

          <AdminGoogleDiscoveryResults
            results={discoveryResult}
            onClose={() => setDiscoveryResult(null)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AdminCrawledStoresAccordion
          storesByCountry={scraperData?.stores_by_country}
          selectedCountry={crawlerSelectedCountryTab}
          onSelectCountry={setCrawlerSelectedCountryTab}
          search={crawlerStoreSearch}
          onSearchChange={setCrawlerStoreSearch}
        />

        <AdminPriceVolatilityMonitor
          recentPrices={scraperData?.recent_price_updates}
          selectedCountry={recentPricesCountry}
          onCountryChange={setRecentPricesCountry}
          onInspectOffer={setInspectingOffer}
        />
      </div>

      {/* Modals */}
      <AdminScraperConsoleModal
        output={scraperConsoleOutput}
        onClose={() => setScraperConsoleOutput(null)}
      />

      <AdminOfferInspectModal
        offer={inspectingOffer}
        onClose={() => setInspectingOffer(null)}
      />
    </div>
  );
}
