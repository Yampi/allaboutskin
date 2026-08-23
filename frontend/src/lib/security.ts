/**
 * Input Sanitization & Security Guards for Skincare AI
 */

export function sanitizeText(input: string, maxLength: number = 2000): string {
  if (typeof input !== 'string') return '';
  
  // Trim and limit length
  let sanitized = input.trim().slice(0, maxLength);

  // Strip dangerous control characters and null bytes
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Strip excessive repeated punctuation or whitespace
  sanitized = sanitized.replace(/\s+/g, ' ');

  return sanitized;
}

export function sanitizeQuestion(input: string): string {
  return sanitizeText(input, 500);
}

export function sanitizeInci(input: string): string {
  return sanitizeText(input, 5000);
}

export function validateBase64Image(dataUriOrBase64: string, maxBytes: number = 4.5 * 1024 * 1024): { isValid: boolean; error?: string } {
  if (!dataUriOrBase64 || typeof dataUriOrBase64 !== 'string') {
    return { isValid: false, error: 'Imagen no válida o vacía.' };
  }

  // Rough estimation of base64 size (4 chars = 3 bytes)
  const approxBytes = (dataUriOrBase64.length * 3) / 4;
  if (approxBytes > maxBytes) {
    return { isValid: false, error: `La imagen excede el límite máximo permitido de ${Math.round(maxBytes / (1024 * 1024))}MB. La imagen se optimizará automáticamente en el dispositivo.` };
  }

  return { isValid: true };
}
