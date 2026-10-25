import { useState, useCallback } from 'react';
import {
  fetchAdminScraperStatus,
  triggerAdminScraperRun,
  triggerAdminDiscoverWeb,
  fetchAdminCrawlerSummary,
} from '@/lib/api';

export function useAdminScraper(
  onNotify?: (type: 'success' | 'error', message: string) => void,
  onAfterRun?: () => Promise<void>
) {
  const [scraperData, setScraperData] = useState<any | null>(null);
  const [scraperForm, setScraperForm] = useState({
    scraper_name: 'farmatodo',
    country_code: 'VE',
    ingredient_id: '',
    search_term: '',
    dry_run: false,
    limit: 20,
    store_chain: '',
  });
  const [isScraperRunning, setIsScraperRunning] = useState(false);
  const [scraperConsoleOutput, setScraperConsoleOutput] = useState<string | null>(null);

  const [discoverForm, setDiscoverForm] = useState({ term: '', limit: 5, crawl: true });
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryResult, setDiscoveryResult] = useState<any | null>(null);

  const [inspectingOffer, setInspectingOffer] = useState<any | null>(null);
  const [crawlerSummary, setCrawlerSummary] = useState<any | null>(null);
  const [summaryHours, setSummaryHours] = useState(24);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [crawlerExpandedCountries, setCrawlerExpandedCountries] = useState<Record<string, boolean>>({});
  const [crawlerStoreSearch, setCrawlerStoreSearch] = useState('');
  const [crawlerSelectedCountryTab, setCrawlerSelectedCountryTab] = useState('ALL');
  const [variationSelectedCountry, setVariationSelectedCountry] = useState('ALL');
  const [recentPricesCountry, setRecentPricesCountry] = useState('ALL');
  const [showQualityGateAuditLog, setShowQualityGateAuditLog] = useState(false);

  const loadCrawlerSummary = useCallback(async (hours: number = summaryHours) => {
    setIsLoadingSummary(true);
    try {
      const res = await fetchAdminCrawlerSummary(hours);
      setCrawlerSummary(res.data);
    } catch (err: any) {
      console.error('Error al consultar resumen del crawler:', err);
    } finally {
      setIsLoadingSummary(false);
    }
  }, [summaryHours]);

  const loadScraperStatus = useCallback(async (countryParam?: string) => {
    setIsLoading(true);
    try {
      const activeCountry = countryParam !== undefined ? countryParam : recentPricesCountry;
      const res = await fetchAdminScraperStatus(activeCountry);
      setScraperData(res);
      if (!scraperForm.ingredient_id && res.active_ingredients && res.active_ingredients.length > 0) {
        setScraperForm((prev) => ({ ...prev, ingredient_id: String(res.active_ingredients?.[0]?.id || '') }));
      }
      await loadCrawlerSummary(summaryHours);
    } catch (err: any) {
      console.error('Error al consultar estado del scraper:', err);
    } finally {
      setIsLoading(false);
    }
  }, [recentPricesCountry, scraperForm.ingredient_id, summaryHours, loadCrawlerSummary]);

  const handleRunScraper = useCallback(async () => {
    setIsScraperRunning(true);
    setScraperConsoleOutput(null);
    try {
      const res = await triggerAdminScraperRun(scraperForm);
      setScraperConsoleOutput(res.output);
      onNotify?.('success', res.message || 'Rastreo ejecutado con éxito.');
      await loadScraperStatus();
      if (onAfterRun) await onAfterRun();
    } catch (err: any) {
      onNotify?.('error', err.message || 'Error al ejecutar rastreador.');
    } finally {
      setIsScraperRunning(false);
    }
  }, [scraperForm, loadScraperStatus, onAfterRun, onNotify]);

  const handleRunDiscovery = useCallback(async () => {
    setIsDiscovering(true);
    setDiscoveryResult(null);
    try {
      const res = await triggerAdminDiscoverWeb({
        term: discoverForm.term.trim() || undefined,
        limit: Number(discoverForm.limit) || 1,
        crawl: discoverForm.crawl,
      });
      setDiscoveryResult(res.data);
      onNotify?.('success', res.message || 'Descubrimiento completado con éxito.');
      await loadCrawlerSummary(summaryHours);
      await loadScraperStatus();
      if (onAfterRun) await onAfterRun();
    } catch (err: any) {
      onNotify?.('error', err.message || 'Error al ejecutar descubrimiento.');
    } finally {
      setIsDiscovering(false);
    }
  }, [discoverForm, summaryHours, loadCrawlerSummary, loadScraperStatus, onAfterRun, onNotify]);

  return {
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
    crawlerExpandedCountries,
    setCrawlerExpandedCountries,
    crawlerStoreSearch,
    setCrawlerStoreSearch,
    crawlerSelectedCountryTab,
    setCrawlerSelectedCountryTab,
    variationSelectedCountry,
    setVariationSelectedCountry,
    recentPricesCountry,
    setRecentPricesCountry,
    showQualityGateAuditLog,
    setShowQualityGateAuditLog,
    loadCrawlerSummary,
    loadScraperStatus,
    handleRunScraper,
    handleRunDiscovery,
  };
}
