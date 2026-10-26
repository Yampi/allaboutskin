import { useState, useCallback } from 'react';
import { auditInci, AuditReport, getCurrentUser, saveUserSkinScan, scanImageWithGeminiVision } from '@/lib/api';
import { optimizeImageForUpload } from '@/lib/imageOptimizer';
import { useScanCamera } from './useScanCamera';
import type { ClinicalSkinEvaluationResult, SkincareProductEvaluationResult } from '@/lib/clinicalVisionEngine';

export type ScanMode = 'face' | 'product';
export type ScanStatus = 'capture' | 'analyzing' | 'results' | 'error';
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'login_required';

export interface ScanError {
  title: string;
  message: string;
  tips: string[];
}

export interface ProductResult {
  detected: SkincareProductEvaluationResult;
  audit: AuditReport | null;
  auditError: string | null;
}

const toScanError = (err: unknown, title = 'No se pudo completar el análisis'): ScanError => ({
  title,
  message: err instanceof Error ? err.message : 'Error inesperado al analizar la imagen.',
  tips: [],
});

export function useScanAnalysis() {
  const [mode, setModeState] = useState<ScanMode>('face');
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState<ScanStatus>('capture');
  const [error, setError] = useState<ScanError | null>(null);
  const [face, setFace] = useState<ClinicalSkinEvaluationResult['faceAnalysis'] | null>(null);
  const [product, setProduct] = useState<ProductResult | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus('capture');
    setError(null);
    setFace(null);
    setProduct(null);
    setSaveStatus('idle');
    setSaveError(null);
  }, []);

  const setMode = useCallback((next: ScanMode) => {
    setModeState(next);
    setImage(null);
    reset();
  }, [reset]);

  const camera = useScanCamera(
    mode === 'face' ? 'user' : 'environment',
    setImage,
    (message) => setError({ title: 'Cámara no disponible', message, tips: [] })
  );
  const { stopCamera } = camera;

  const loadFile = useCallback(async (file: File) => {
    try {
      setImage((await optimizeImageForUpload(file)).base64);
      setError(null);
      stopCamera();
    } catch (err) {
      setError(toScanError(err, 'No se pudo leer la imagen'));
    }
  }, [stopCamera]);

  const saveFaceResult = useCallback(async (analysis: ClinicalSkinEvaluationResult['faceAnalysis']) => {
    if (!getCurrentUser()?.token) {
      setSaveStatus('login_required');
      return;
    }
    setSaveStatus('saving');
    setSaveError(null);
    try {
      // Solo se guarda lo que el análisis devolvió: sin foto y sin puntuaciones inventadas.
      await saveUserSkinScan({
        scan_mode: 'face',
        clinical_summary: analysis.clinicalRationale || null,
        recommendations: analysis.suggestedFocus?.length ? analysis.suggestedFocus.join('; ') : null,
      });
      setSaveStatus('saved');
    } catch (err) {
      setSaveStatus('error');
      setSaveError(err instanceof Error ? err.message : 'No se pudo guardar en tu historial');
    }
  }, []);

  const analyze = useCallback(async () => {
    if (!image) return;
    reset();
    setStatus('analyzing');
    try {
      const result = await scanImageWithGeminiVision(image.replace(/^data:[^;]+;base64,/, ''), 'image/jpeg');

      if (result.classification === 'INVALID') {
        setError({ title: result.rejectionTitle, message: result.userFriendlyMessage, tips: result.guidanceTips });
        setStatus('error');
        return;
      }

      if (mode === 'face') {
        if (result.classification !== 'HUMAN_FACE') {
          setError({ title: 'No se detectó un rostro', message: 'La imagen parece un producto cosmético. Cambia al modo "Producto" o sube una selfie frontal.', tips: [] });
          setStatus('error');
          return;
        }
        setFace(result.faceAnalysis);
        setStatus('results');
        await saveFaceResult(result.faceAnalysis);
        return;
      }

      if (result.classification !== 'SKINCARE_PRODUCT') {
        setError({ title: 'No se detectó un producto', message: 'La imagen parece un rostro. Cambia al modo "Rostro" o fotografía la etiqueta del producto.', tips: [] });
        setStatus('error');
        return;
      }
      if (!result.inciText.trim()) {
        setError({ title: 'No se pudo leer la lista de ingredientes', message: 'Fotografía la lista INCI de la etiqueta, con buena luz y enfocada.', tips: result.notes });
        setStatus('error');
        return;
      }

      let audit: AuditReport | null = null;
      let auditError: string | null = null;
      try {
        audit = await auditInci(result.inciText, result.productName ?? undefined);
      } catch (err) {
        auditError = err instanceof Error ? err.message : 'No se pudo auditar la fórmula';
      }
      setProduct({ detected: result, audit, auditError });
      setStatus('results');
    } catch (err) {
      setError(toScanError(err));
      setStatus('error');
    }
  }, [image, mode, reset, saveFaceResult]);

  const retrySave = useCallback(() => {
    if (face) saveFaceResult(face);
  }, [face, saveFaceResult]);

  const startOver = useCallback(() => {
    setImage(null);
    reset();
  }, [reset]);

  return {
    mode, setMode, image, setImage, status, error, face, product, saveStatus, saveError,
    isCameraActive: camera.isCameraActive, videoRef: camera.videoRef, startCamera: camera.startCamera,
    stopCamera, captureFromCamera: camera.captureFromCamera, loadFile,
    analyze, retrySave, startOver,
  };
}
