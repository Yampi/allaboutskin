import React, { useRef } from 'react';
import { Camera, Upload, ScanLine } from 'lucide-react';
import type { ScanMode } from '@/hooks/useScanAnalysis';

interface ScanCaptureProps {
  mode: ScanMode;
  onModeChange: (mode: ScanMode) => void;
  image: string | null;
  isCameraActive: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onStartCamera: () => void;
  onCapture: () => void;
  onStopCamera: () => void;
  onFile: (file: File) => void;
  onAnalyze: () => void;
}

const btn = 'inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold cursor-pointer';

export default function ScanCapture(props: ScanCaptureProps) {
  const { mode, onModeChange, image, isCameraActive, videoRef, onStartCamera, onCapture, onStopCamera, onFile, onAnalyze } = props;
  const fileRef = useRef<HTMLInputElement>(null);
  const isFace = mode === 'face';

  return (
    <div className="space-y-4">
      <div className="inline-flex bg-[#EFECE6] p-0.5 rounded-lg border border-[#E8E1D7]">
        {(['face', 'product'] as const).map((m) => (
          <button key={m} type="button" onClick={() => onModeChange(m)} className={`px-4 py-1.5 text-xs font-bold rounded-md cursor-pointer ${mode === m ? 'bg-white text-[#2E7D5B]' : 'text-[#66615C]'}`}>
            {m === 'face' ? 'Rostro' : 'Producto'}
          </button>
        ))}
      </div>

      <p className="text-xs text-[#66615C] max-w-xl">
        {isFace
          ? 'Toma o sube una selfie frontal, con buena luz natural y sin gafas ni mascarilla.'
          : 'Fotografía la lista de ingredientes (INCI) de la etiqueta, enfocada y con buena luz.'}
      </p>

      <div className="aspect-[4/3] max-w-xl rounded-3xl border border-dashed border-[#E8E1D7] bg-[#FAFAF7] overflow-hidden flex items-center justify-center">
        {isCameraActive ? (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        ) : image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={isFace ? 'Foto del rostro' : 'Foto de la etiqueta'} className="w-full h-full object-contain" />
        ) : (
          <span className="text-xs text-[#8C827A]">Aún no has añadido una imagen</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {isCameraActive ? (
          <>
            <button type="button" onClick={onCapture} className={`${btn} bg-[#2E7D5B] text-white`}><Camera className="w-4 h-4" /> Capturar</button>
            <button type="button" onClick={onStopCamera} className={`${btn} bg-white border border-[#E8E1D7] text-[#2D2825]`}>Cancelar</button>
          </>
        ) : (
          <>
            <button type="button" onClick={onStartCamera} className={`${btn} bg-white border border-[#E8E1D7] text-[#2D2825]`}><Camera className="w-4 h-4" /> Usar cámara</button>
            <button type="button" onClick={() => fileRef.current?.click()} className={`${btn} bg-white border border-[#E8E1D7] text-[#2D2825]`}><Upload className="w-4 h-4" /> Subir foto</button>
          </>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }} />
        <button type="button" disabled={!image || isCameraActive} onClick={onAnalyze} className={`${btn} bg-[#2E7D5B] text-white disabled:opacity-50`}>
          <ScanLine className="w-4 h-4" /> {isFace ? 'Analizar mi piel' : 'Analizar fórmula'}
        </button>
      </div>

      <p className="text-[11px] text-[#8C827A] max-w-xl">
        La imagen se envía a un servicio de IA para analizarla y no se guarda en tu historial: solo se conserva el resumen del resultado.
      </p>
    </div>
  );
}
