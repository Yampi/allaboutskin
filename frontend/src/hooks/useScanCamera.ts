import { useState, useCallback, useRef, useEffect } from 'react';

// Cámara en vivo para el escáner: solo se enciende cuando la persona lo pide.
export function useScanCamera(facing: 'user' | 'environment', onCapture: (dataUrl: string) => void, onError: (message: string) => void) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setIsCameraActive(false);
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      // El <video> existe solo con la cámara activa; se asigna en el siguiente ciclo de render.
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } catch {
      onError('No se pudo acceder a la cámara. Revisa el permiso del navegador o sube una foto.');
    }
  }, [facing, onError]);

  const captureFromCamera = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    onCapture(canvas.toDataURL('image/jpeg', 0.85));
    stopCamera();
  }, [onCapture, stopCamera]);

  return { isCameraActive, videoRef, startCamera, stopCamera, captureFromCamera };
}
