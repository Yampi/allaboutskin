import { useState, useCallback } from 'react';
import { bulkImportBusinessCatalog, BulkImportItem, BulkImportResponse } from '@/lib/api';

export interface ParsedCsvRow {
  barcode_ean?: string;
  name: string;
  brand?: string;
  price_usd: number;
  price_ves?: number;
  in_stock: boolean;
  product_url?: string;
  isValid: boolean;
  validationError?: string;
}

export function useStoreBulkImport(
  onSuccess?: () => void,
  onToast?: (type: 'success' | 'error', message: string) => void
) {
  const [showImportModal, setShowImportModal] = useState(false);
  const [importRawText, setImportRawText] = useState('');
  const [importSelectedBranch, setImportSelectedBranch] = useState('');
  const [importExchangeRate, setImportExchangeRate] = useState('45.00');
  const [parsedImportRows, setParsedImportRows] = useState<ParsedCsvRow[]>([]);
  const [importResult, setImportResult] = useState<BulkImportResponse | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const parseImportText = useCallback((text: string, rateStr: string) => {
    const rate = parseFloat(rateStr) || null;
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length === 0) {
      setParsedImportRows([]);
      return;
    }
    const firstLineLower = lines[0].toLowerCase();
    const hasHeader = firstLineLower.includes('producto') || firstLineLower.includes('nombre') || firstLineLower.includes('precio');
    const dataLines = hasHeader ? lines.slice(1) : lines;

    const rows: ParsedCsvRow[] = dataLines.map((line) => {
      let delimiter = ',';
      if (line.includes('\t')) delimiter = '\t';
      else if (line.includes(';') && (line.match(/;/g)?.length || 0) >= (line.match(/,/g)?.length || 0)) delimiter = ';';
      const parts = line.split(delimiter).map((p) => p.trim().replace(/^["']|["']$/g, ''));

      let barcode_ean = '';
      let name = '';
      let brand = '';
      let price_usd = 0;
      let price_ves: number | undefined = undefined;
      let in_stock = true;
      let product_url = '';

      if (parts.length === 1) {
        name = parts[0];
      } else if (parts.length === 2) {
        name = parts[0];
        price_usd = parseFloat(parts[1].replace(/[^0-9.]/g, '')) || 0;
      } else if (parts.length === 3) {
        if (/^\d{8,14}$/.test(parts[0])) {
          barcode_ean = parts[0];
          name = parts[1];
          price_usd = parseFloat(parts[2].replace(/[^0-9.]/g, '')) || 0;
        } else {
          name = parts[0];
          brand = parts[1];
          price_usd = parseFloat(parts[2].replace(/[^0-9.]/g, '')) || 0;
        }
      } else if (parts.length >= 4) {
        if (/^\d{8,14}$/.test(parts[0])) {
          barcode_ean = parts[0];
          name = parts[1];
          brand = parts[2];
          price_usd = parseFloat(parts[3].replace(/[^0-9.]/g, '')) || 0;
          if (parts[4]) price_ves = parseFloat(parts[4].replace(/[^0-9.]/g, '')) || undefined;
          if (parts[5]) in_stock = !['no', '0', 'false', 'agotado'].includes(parts[5].toLowerCase());
          if (parts[6]) product_url = parts[6];
        } else {
          name = parts[0];
          brand = parts[1];
          price_usd = parseFloat(parts[2].replace(/[^0-9.]/g, '')) || 0;
          if (parts[3]) price_ves = parseFloat(parts[3].replace(/[^0-9.]/g, '')) || undefined;
          if (parts[4]) in_stock = !['no', '0', 'false', 'agotado'].includes(parts[4].toLowerCase());
          if (parts[5]) product_url = parts[5];
        }
      }
      if (!price_ves && rate && price_usd > 0) {
        price_ves = Math.round(price_usd * rate * 100) / 100;
      }
      const isValid = name.trim().length > 1 && price_usd > 0;
      const validationError = !name.trim() ? 'Nombre requerido' : price_usd <= 0 ? 'Precio USD inválido' : undefined;
      return { barcode_ean: barcode_ean || undefined, name, brand: brand || undefined, price_usd, price_ves, in_stock, product_url: product_url || undefined, isValid, validationError };
    });
    setParsedImportRows(rows);
  }, []);

  const handleDownloadTemplate = useCallback(() => {
    const template = "codigo_barras,producto,marca,precio_usd,stock,enlace\n7501234567890,Effaclar Gel Purificante 200ml,La Roche-Posay,18.50,si,https://wa.me/584141234567\n3337875597180,CeraVe Crema Hidratante 454g,CeraVe,24.00,si,https://wa.me/584141234567";
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plantilla_catalogo_allaboutskin.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleExecuteImport = useCallback(async () => {
    const validRows = parsedImportRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      onToast?.('error', 'No hay filas válidas para importar.');
      return;
    }
    setIsImporting(true);
    try {
      const items: BulkImportItem[] = validRows.map((r) => ({
        barcode_ean: r.barcode_ean,
        name: r.name,
        brand: r.brand,
        price_usd: r.price_usd,
        price_ves: r.price_ves,
        in_stock: r.in_stock,
        product_url: r.product_url,
      }));
      const res = await bulkImportBusinessCatalog({
        branch_id: importSelectedBranch ? parseInt(importSelectedBranch) : null,
        exchange_rate: parseFloat(importExchangeRate) || undefined,
        items,
      });
      setImportResult(res);
      onToast?.('success', res.message);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      onToast?.('error', err.message || 'Error al procesar la importación.');
    } finally {
      setIsImporting(false);
    }
  }, [parsedImportRows, importSelectedBranch, importExchangeRate, onSuccess, onToast]);

  return {
    showImportModal,
    setShowImportModal,
    importRawText,
    setImportRawText,
    importSelectedBranch,
    setImportSelectedBranch,
    importExchangeRate,
    setImportExchangeRate,
    parsedImportRows,
    importResult,
    setImportResult,
    isImporting,
    parseImportText,
    handleDownloadTemplate,
    handleExecuteImport,
  };
}
