/**
 * Image Optimizer Utility for Client-Side Compression & Resizing
 * 
 * Prevents HTTP 413 (Payload Too Large) on Vercel / Next.js serverless functions
 * by scaling down high-resolution mobile photos (12MP-48MP) to optimal dimensions
 * (max 1400px) and compressing with quality 0.82 JPEG before network transmission.
 */

export interface OptimizedImageResult {
  base64: string;
  mimeType: string;
  width: number;
  height: number;
  sizeBytes: number;
  blob: Blob;
}

export interface ImageOptimizationOptions {
  maxDimension?: number;
  quality?: number;
  mimeType?: string;
}

/**
 * Optimizes an image (File, Blob, or base64 data URI) for vision processing and API upload.
 */
export async function optimizeImageForUpload(
  source: File | Blob | string,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageResult> {
  const {
    maxDimension = 1400,
    quality = 0.82,
    mimeType = 'image/jpeg',
  } = options;

  if (typeof window === 'undefined') {
    throw new Error('optimizeImageForUpload can only be run in client/browser environments.');
  }

  return new Promise((resolve, reject) => {
    let srcUrl = '';
    let isObjectUrl = false;

    if (typeof source === 'string') {
      srcUrl = source;
    } else if (source instanceof Blob) {
      srcUrl = URL.createObjectURL(source);
      isObjectUrl = true;
    } else {
      reject(new Error('Formato de imagen inválido'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height || 600;

        if (!width || !height) {
          width = 800;
          height = 600;
        }

        // Scale down while maintaining aspect ratio
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          if (isObjectUrl) URL.revokeObjectURL(srcUrl);
          if (typeof source === 'string') {
            resolve({
              base64: source,
              mimeType: 'image/jpeg',
              width,
              height,
              sizeBytes: Math.round((source.length * 3) / 4),
              blob: new Blob([], { type: 'image/jpeg' }),
            });
            return;
          }
          throw new Error('Canvas 2D context not available');
        }

        // Fill white background for transparent PNGs
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const base64 = canvas.toDataURL(mimeType, quality);
        const approxBytes = Math.round((base64.length * 3) / 4);

        canvas.toBlob(
          (blob) => {
            if (isObjectUrl) {
              URL.revokeObjectURL(srcUrl);
            }
            resolve({
              base64,
              mimeType,
              width,
              height,
              sizeBytes: blob?.size || approxBytes,
              blob: blob || new Blob([], { type: mimeType }),
            });
          },
          mimeType,
          quality
        );
      } catch (err) {
        if (isObjectUrl) URL.revokeObjectURL(srcUrl);
        reject(err);
      }
    };

    img.onerror = () => {
      if (isObjectUrl) URL.revokeObjectURL(srcUrl);
      reject(new Error('No fue posible cargar la imagen para optimizar'));
    };

    img.src = srcUrl;
  });
}
