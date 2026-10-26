'use client';

import React from 'react';
import UserAppShell from '@/components/navigation/UserAppShell';
import ErrorState from '@/components/system/ErrorState';
import ScanCapture from '@/components/escaner/ScanCapture';
import FaceResults from '@/components/escaner/FaceResults';
import ProductResults from '@/components/escaner/ProductResults';
import { useScanAnalysis } from '@/hooks/useScanAnalysis';

export default function EscanerPage() {
  const scan = useScanAnalysis();
  const showCapture = scan.status === 'capture' || scan.status === 'error';

  return (
    <UserAppShell activeNavId="analisis">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D2825] tracking-tight">
            {scan.status === 'results' ? 'Resultados del análisis' : 'Escáner dermatológico'}
          </h1>
          <p className="text-xs sm:text-sm text-[#66615C]">Análisis orientativo de cosmética; no sustituye una consulta dermatológica.</p>
        </header>

        {scan.error && (
          <div className="max-w-xl space-y-2">
            <ErrorState title={scan.error.title} message={scan.error.message} />
            {scan.error.tips.length > 0 && (
              <ul className="list-disc pl-5 text-xs text-[#66615C]">{scan.error.tips.map((t) => <li key={t}>{t}</li>)}</ul>
            )}
          </div>
        )}

        {showCapture && (
          <ScanCapture
            mode={scan.mode}
            onModeChange={scan.setMode}
            image={scan.image}
            isCameraActive={scan.isCameraActive}
            videoRef={scan.videoRef}
            onStartCamera={scan.startCamera}
            onCapture={scan.captureFromCamera}
            onStopCamera={scan.stopCamera}
            onFile={scan.loadFile}
            onAnalyze={scan.analyze}
          />
        )}

        {scan.status === 'analyzing' && (
          <p role="status" className="text-sm text-[#66615C]">Analizando la imagen… puede tardar unos segundos.</p>
        )}

        {scan.status === 'results' && scan.face && (
          <FaceResults face={scan.face} saveStatus={scan.saveStatus} saveError={scan.saveError} onRetrySave={scan.retrySave} />
        )}
        {scan.status === 'results' && scan.product && <ProductResults result={scan.product} onRetry={scan.analyze} />}

        {scan.status === 'results' && (
          <button type="button" onClick={scan.startOver} className="px-4 py-2 rounded-full bg-white border border-[#E8E1D7] text-xs font-bold text-[#2D2825] cursor-pointer">
            Hacer otro escaneo
          </button>
        )}
      </div>
    </UserAppShell>
  );
}
