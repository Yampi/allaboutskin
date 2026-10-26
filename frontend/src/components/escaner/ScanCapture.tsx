import React, { useRef, useState } from 'react';
import { Camera, Upload, ScanLine, RotateCcw } from 'lucide-react';
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
  onRetake: () => void;
}

const option = 'flex flex-col items-center justify-center gap-1 rounded-2xl p-5 text-sm font-bold cursor-pointer';
const btn = 'inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold cursor-pointer';

export default function ScanCapture(props: ScanCaptureProps) {
  const { mode, onModeChange, image, isCameraActive, videoRef, onStartCamera, onCapture, onStopCamera, onFile, onAnalyze, onRetake } = props;
  const [choosing, setChoosing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const isFace = mode === 'face';

  return (
    <div className="space-y-4">
      <div className="inline-flex bg-[#EFECE6] p-0.5 rounded-lg border border-[#E8E1D7]">
        {(['face', 'product'] as const).map((m) => (
          <button key={m} type="button" onClick={() => { setChoosing(false); onModeChange(m); }} className={`px-4 py-1.5 text-xs font-bold rounded-md cursor-pointer ${mode === m ? 'bg-white text-[#2E7D5B]' : 'text-[#66615C]'}`}>
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
        ) : choosing ? (
          <div className="grid sm:grid-cols-2 gap-3 p-4 w-full">
            <button type="button" onClick={() => { setChoosing(false); onStartCamera(); }} className={`${option} bg-[#2E7D5B] text-white`}>
              <Camera className="w-7 h-7" /> Usar la cámara
              <span className="text-[11px] font-medium opacity-90">Te haces la foto ahora</span>
            </button>
            <button type="button" onClick={() => { setChoosing(false); fileRef.current?.click(); }} className={`${option} bg-white border border-[#E8E1D7] text-[#2D2825]`}>
              <Upload className="w-7 h-7" /> Subir una foto
              <span className="text-[11px] font-medium text-[#66615C]">Elige una de tu dispositivo</span>
            </button>
          </div>
        ) : (
          <span className="text-xs text-[#8C827A]">Pulsa «{isFace ? 'Escanear mi piel' : 'Escanear etiqueta'}» para empezar</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {isCameraActive ? (
          <>
            <button type="button" onClick={onCapture} className={`${btn} bg-[#2E7D5B] text-white`}><Camera className="w-4 h-4" /> Tomar foto</button>
            <button type="button" onClick={onStopCamera} className={`${btn} bg-white border border-[#E8E1D7] text-[#2D2825]`}>Cancelar</button>
          </>
        ) : image ? (
          <>
            <button type="button" onClick={onAnalyze} className={`${btn} bg-[#2E7D5B] text-white`}>
              <ScanLine className="w-4 h-4" /> {isFace ? 'Analizar mi piel' : 'Analizar fórmula'}
            </button>
            <button type="button" onClick={() => { onRetake(); setChoosing(true); }} className={`${btn} bg-white border border-[#E8E1D7] text-[#2D2825]`}>
              <RotateCcw className="w-4 h-4" /> Repetir foto
            </button>
          </>
        ) : choosing ? (
          <button type="button" onClick={() => setChoosing(false)} className={`${btn} bg-white border border-[#E8E1D7] text-[#2D2825]`}>Volver</button>
        ) : (
          <button type="button" onClick={() => setChoosing(true)} className={`${btn} bg-[#2E7D5B] text-white`}>
            <ScanLine className="w-4 h-4" /> {isFace ? 'Escanear mi piel' : 'Escanear etiqueta'}
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }} />
      </div>

      <p className="text-[11px] text-[#8C827A] max-w-xl">
        La imagen se envía a un servicio de IA para analizarla y no se guarda en tu historial: solo se conserva el resumen del resultado.
      </p>
    </div>
  );
}
