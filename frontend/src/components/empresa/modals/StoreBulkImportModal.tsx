'use client';

import React from 'react';
import { FileSpreadsheet, X, Download, Upload, Loader2 } from 'lucide-react';
import { BusinessBranchItem } from '@/lib/api';
import { useStoreBulkImport } from '@/hooks/empresa/useStoreBulkImport';
import StoreBulkImportSummary from './StoreBulkImportSummary';

interface StoreBulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: BusinessBranchItem[];
  importer: ReturnType<typeof useStoreBulkImport>;
}

export default function StoreBulkImportModal({
  isOpen,
  onClose,
  branches,
  importer,
}: StoreBulkImportModalProps) {
  if (!isOpen) return null;

  const {
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
  } = importer;

  const validCount = parsedImportRows.filter((r) => r.isValid).length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setImportRawText(text);
        parseImportText(text, importExchangeRate);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-lg w-full max-w-2xl p-5 space-y-4 shadow-sm animate-in fade-in duration-200">
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-[#4A6B5B] font-bold text-xs uppercase tracking-wider">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Importación Masiva de Catálogo</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">Carga Rápida de Inventario (CSV / Texto)</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {importResult ? (
          <StoreBulkImportSummary
            result={importResult}
            onReset={() => {
              setImportResult(null);
              setImportRawText('');
            }}
            onClose={onClose}
          />
        ) : (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-md">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#4A6B5B]" />
                <span>Descargar Plantilla CSV</span>
              </button>
              <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#4A6B5B] hover:bg-[#3d594b] text-white text-xs font-bold cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Cargar Archivo CSV</span>
                <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Sucursal Destino</label>
                <select
                  value={importSelectedBranch}
                  onChange={(e) => setImportSelectedBranch(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-700 focus:outline-none"
                >
                  <option value="">Todas las sucursales</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tasa Bs/$ Autocalcular</label>
                <input
                  type="number"
                  step="0.10"
                  value={importExchangeRate}
                  onChange={(e) => {
                    setImportExchangeRate(e.target.value);
                    if (importRawText) parseImportText(importRawText, e.target.value);
                  }}
                  className="w-full bg-[#FAF8F5] border border-slate-200 rounded-md px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#4A6B5B]"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Pega tus filas aquí (o sube el archivo arriba)
              </label>
              <textarea
                rows={4}
                value={importRawText}
                onChange={(e) => {
                  setImportRawText(e.target.value);
                  parseImportText(e.target.value, importExchangeRate);
                }}
                placeholder="codigo_barras,producto,marca,precio_usd,stock,enlace"
                className="w-full bg-[#FAF8F5] border border-slate-200 rounded-md p-2.5 font-mono text-[11px] text-slate-800 focus:outline-none focus:border-[#4A6B5B]"
              />
            </div>

            {parsedImportRows.length > 0 && (
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between text-xs">
                <span className="text-slate-600">{parsedImportRows.length} filas detectadas</span>
                <span className="font-bold text-[#4A6B5B]">{validCount} listas para importar</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={onClose} className="px-3 py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-md cursor-pointer">
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={isImporting || validCount === 0}
                className="px-4 py-1.5 bg-[#4A6B5B] hover:bg-[#3d594b] text-white font-bold rounded-md disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {isImporting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isImporting ? 'Importando...' : `Importar ${validCount} Productos`}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
