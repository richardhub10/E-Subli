import { decode as b64decode, encode as b64encode } from 'base64-arraybuffer';
import { decode as decodeJpeg, encode as encodeJpeg } from 'jpeg-js';
import { decode as decodePng } from 'fast-png';

export type ScanResult = {
  recognized: boolean;
  character: string;
  kulitanSymbol: string;
  confidence: number;
  type: string;
  transliteration: string;
  feedback: string;
  strokeAccuracy: 'High' | 'Moderate' | 'Needs Practice';
  engine?: 'testscanner' | 'gemini' | 'groq' | 'consensus' | 'neural_net' | 'calibrated_cv';
  extractedImageUrl?: string | null;
  topK?: { label: string; confidence: number }[];
  similarityBreakdown?: {
    chamferScore: number;
    spatialAlignment: number;
    strokeCoverage: number;
  };
  neuralBreakdown?: {
    topClass: string;
    topProbability: number;
    runnerUpClass: string;
    runnerUpProbability: number;
    contourFit: number;
  };
};

/**
 * Safe PNG decoder that guarantees 4-channel RGBA Uint8Array output without Node.js dependencies.
 */
function decodePngSafe(uint8: Uint8Array): { width: number; height: number; data: Uint8Array } {
  const result = decodePng(uint8);
  const width = result.width;
  const height = result.height;
  const channels = result.channels;
  const src = result.data;

  if (channels === 4 && src instanceof Uint8Array) {
    return { width, height, data: src };
  }

  const rgba = new Uint8Array(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const srcIdx = i * channels;
    const dstIdx = i * 4;
    if (channels === 1) {
      const val = src[srcIdx];
      rgba[dstIdx] = val;
      rgba[dstIdx + 1] = val;
      rgba[dstIdx + 2] = val;
      rgba[dstIdx + 3] = 255;
    } else if (channels === 2) {
      const val = src[srcIdx];
      rgba[dstIdx] = val;
      rgba[dstIdx + 1] = val;
      rgba[dstIdx + 2] = val;
      rgba[dstIdx + 3] = src[srcIdx + 1];
    } else if (channels === 3) {
      rgba[dstIdx] = src[srcIdx];
      rgba[dstIdx + 1] = src[srcIdx + 1];
      rgba[dstIdx + 2] = src[srcIdx + 2];
      rgba[dstIdx + 3] = 255;
    } else {
      rgba[dstIdx] = src[srcIdx];
      rgba[dstIdx + 1] = src[srcIdx + 1];
      rgba[dstIdx + 2] = src[srcIdx + 2];
      rgba[dstIdx + 3] = src[srcIdx + 3];
    }
  }
  return { width, height, data: rgba };
}

/**
 * Universal Region of Interest (ROI) Cropper.
 * Crops the central square corresponding to the camera viewfinder reticle.
 * This removes background desk edges, shadows, and hands, boosting recognition accuracy.
 */
export async function cropViewfinderROI(base64: string, cropRatio = 0.68): Promise<string> {
  if (!base64 || base64.length < 200) return base64;

  const cleanB64 = base64.includes(',') ? base64.split(',')[1] : base64;

  // 1. Web & WebView Environment (Fast 2D Canvas)
  if (typeof window !== 'undefined' && typeof document !== 'undefined' && typeof Image !== 'undefined') {
    try {
      const cropped = await new Promise<string>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const w = img.naturalWidth || img.width;
            const h = img.naturalHeight || img.height;

            // If cropRatio is 1.0 or image is already a small thumbnail, skip cropping
            if (cropRatio >= 0.98 || Math.min(w, h) < 280) {
              resolve(cleanB64);
              return;
            }

            const minDim = Math.min(w, h);
            const cropSize = Math.floor(minDim * cropRatio);
            const startX = Math.floor((w - cropSize) / 2);
            const startY = Math.floor((h - cropSize) / 2);

            const canvas = document.createElement('canvas');
            // Scale to max 512x512 for optimal AI inference speed and token efficiency
            const targetDim = Math.min(cropSize, 512);
            canvas.width = targetDim;
            canvas.height = targetDim;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(cleanB64);
              return;
            }
            ctx.drawImage(img, startX, startY, cropSize, cropSize, 0, 0, targetDim, targetDim);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            resolve(dataUrl.split(',')[1] || cleanB64);
          } catch {
            resolve(cleanB64);
          }
        };
        img.onerror = () => resolve(cleanB64);
        img.src = base64.startsWith('data:') ? base64 : `data:image/jpeg;base64,${cleanB64}`;
      });
      if (cropped) return cropped;
    } catch {
      // Fallback to native decoder
    }
  }

  // 2. Native Mobile / Node Environment
  try {
    const arrayBuffer = b64decode(cleanB64);
    const uint8 = new Uint8Array(arrayBuffer);

    let width = 0, height = 0;
    let data: Uint8Array;

    // Check PNG signature: 0x89 0x50 0x4E 0x47
    if (uint8[0] === 0x89 && uint8[1] === 0x50 && uint8[2] === 0x4E && uint8[3] === 0x47) {
      const png = decodePngSafe(uint8);
      width = png.width;
      height = png.height;
      data = png.data;
    } else {
      const decoded = decodeJpeg(uint8, { useTArray: true });
      width = decoded.width;
      height = decoded.height;
      data = decoded.data;
    }

    // If cropRatio is 1.0 or image is already a small thumbnail, skip cropping
    if (cropRatio >= 0.98 || Math.min(width, height) < 280) {
      return cleanB64;
    }

    const minDim = Math.min(width, height);
    const cropSize = Math.floor(minDim * cropRatio);
    const startX = Math.floor((width - cropSize) / 2);
    const startY = Math.floor((height - cropSize) / 2);

    // Resample to max 512x512 for optimal AI inference speed and memory efficiency
    const targetDim = Math.min(cropSize, 512);
    const step = cropSize / targetDim;
    const outBuf = new Uint8Array(targetDim * targetDim * 4);
    for (let y = 0; y < targetDim; y++) {
      const srcY = startY + Math.floor(y * step);
      for (let x = 0; x < targetDim; x++) {
        const srcX = startX + Math.floor(x * step);
        const srcIdx = (srcY * width + srcX) * 4;
        const dstIdx = (y * targetDim + x) * 4;
        outBuf[dstIdx] = data[srcIdx];
        outBuf[dstIdx + 1] = data[srcIdx + 1];
        outBuf[dstIdx + 2] = data[srcIdx + 2];
        outBuf[dstIdx + 3] = data[srcIdx + 3];
      }
    }
    const encoded = encodeJpeg({ data: outBuf, width: targetDim, height: targetDim }, 85);
    return b64encode(encoded.data.buffer as ArrayBuffer);
  } catch {
    return cleanB64;
  }
}
