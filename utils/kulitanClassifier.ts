import { decode as b64decode, encode as b64encode } from 'base64-arraybuffer';
import { decode as decodeJpeg, encode as encodeJpeg } from 'jpeg-js';
import { PNG } from 'pngjs';
import { kulitanPoints } from '../data/kulitanPoints';
import { kulitanSyllables, SyllableData } from '../data/kulitanData';
import { KULITAN_NEURAL_WEIGHTS } from './kulitanNeuralModel';
import { getDistilledFeedback } from '../data/distilledKulitanKnowledge';

export type ScanResult = {
  recognized: boolean;
  character: string;
  kulitanSymbol: string;
  confidence: number;
  type: string;
  transliteration: string;
  feedback: string;
  strokeAccuracy: 'High' | 'Moderate' | 'Needs Practice';
  engine?: 'gemini' | 'groq' | 'consensus' | 'neural_net' | 'calibrated_cv';
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
            const aspect = w / h;

            // If the image is already a cropped screenshot (wide/tall aspect ratio or small dimensions),
            // blind center cropping cuts off glyphs on the left/top. Keep full image!
            if (aspect > 1.35 || aspect < 0.75 || Math.min(w, h) < 550) {
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
      const png = PNG.sync.read(Buffer.from(arrayBuffer));
      width = png.width;
      height = png.height;
      data = new Uint8Array(png.data.buffer, png.data.byteOffset, png.data.byteLength);
    } else {
      const decoded = decodeJpeg(uint8, { useTArray: true });
      width = decoded.width;
      height = decoded.height;
      data = decoded.data;
    }

    const aspect = width / height;
    if (aspect > 1.35 || aspect < 0.75 || Math.min(width, height) < 550) {
      return cleanB64;
    }

    const minDim = Math.min(width, height);
    const cropSize = Math.floor(minDim * cropRatio);
    const startX = Math.floor((width - cropSize) / 2);
    const startY = Math.floor((height - cropSize) / 2);

    const outBuf = new Uint8Array(cropSize * cropSize * 4);
    for (let y = 0; y < cropSize; y++) {
      const srcY = startY + y;
      for (let x = 0; x < cropSize; x++) {
        const srcX = startX + x;
        const srcIdx = (srcY * width + srcX) * 4;
        const dstIdx = (y * cropSize + x) * 4;
        outBuf[dstIdx] = data[srcIdx];
        outBuf[dstIdx + 1] = data[srcIdx + 1];
        outBuf[dstIdx + 2] = data[srcIdx + 2];
        outBuf[dstIdx + 3] = data[srcIdx + 3];
      }
    }
    const encoded = encodeJpeg({ data: outBuf, width: cropSize, height: cropSize }, 85);
    return b64encode(encoded.data.buffer as ArrayBuffer);
  } catch {
    return cleanB64;
  }
}

type Point = { x: number; y: number };

type NormalizedPrototype = {
  key: string;
  latin: string;
  points: Point[];
  syllableData: SyllableData;
  aspectRatio: number;
  centroid: Point;
};

// ==========================================
// 1. NEURAL NETWORK INFERENCE ENGINE (LeakyReLU + Dense + Softmax)
// ==========================================
const model = KULITAN_NEURAL_WEIGHTS;
const W1 = new Float32Array(b64decode(model.w1));
const b1 = new Float32Array(b64decode(model.b1));
const W2 = new Float32Array(b64decode(model.w2));
const b2 = new Float32Array(b64decode(model.b2));
const W3 = new Float32Array(b64decode(model.w3));
const b3 = new Float32Array(b64decode(model.b3));

export type NeuralPrediction = {
  class: string;
  prob: number;
};

/**
 * Executes feedforward pass through the trained 3-layer Kulitan Neural Network
 */
export function runNeuralInference(inputTensor784: Float32Array): NeuralPrediction[] {
  const h1 = new Float32Array(model.h1Dim);
  for (let j = 0; j < model.h1Dim; j++) {
    let sum = b1[j];
    const offset = j * model.inputDim;
    for (let i = 0; i < model.inputDim; i++) {
      sum += inputTensor784[i] * W1[offset + i];
    }
    h1[j] = sum > 0 ? sum : 0.01 * sum; // Leaky ReLU
  }

  const h2 = new Float32Array(model.h2Dim);
  for (let j = 0; j < model.h2Dim; j++) {
    let sum = b2[j];
    const offset = j * model.h1Dim;
    for (let i = 0; i < model.h1Dim; i++) {
      sum += h1[i] * W2[offset + i];
    }
    h2[j] = sum > 0 ? sum : 0.01 * sum; // Leaky ReLU
  }

  const logits = new Float32Array(model.numClasses);
  let maxLogit = -Infinity;
  for (let j = 0; j < model.numClasses; j++) {
    let sum = b3[j];
    const offset = j * model.h2Dim;
    for (let i = 0; i < model.h2Dim; i++) {
      sum += h2[i] * W3[offset + i];
    }
    logits[j] = sum;
    if (sum > maxLogit) maxLogit = sum;
  }

  let sumExp = 0;
  const probs = new Float32Array(model.numClasses);
  for (let j = 0; j < model.numClasses; j++) {
    const e = Math.exp(logits[j] - maxLogit);
    probs[j] = e;
    sumExp += e;
  }
  for (let j = 0; j < model.numClasses; j++) {
    probs[j] /= sumExp;
  }

  return model.classes.map((cls, idx) => ({
    class: cls,
    prob: parseFloat((probs[idx] * 100).toFixed(1))
  })).sort((a, b) => b.prob - a.prob);
}

// ==========================================
// 2. CONTOUR & CHAMFER DISTANCE PROTOTYPES
// ==========================================
function normalizeAndResamplePoints(pts: Point[], targetCount = 80): { points: Point[]; aspectRatio: number; centroid: Point } {
  if (pts.length === 0) {
    return { points: [], aspectRatio: 1, centroid: { x: 0.5, y: 0.5 } };
  }

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  let sumX = 0, sumY = 0;

  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
    sumX += p.x;
    sumY += p.y;
  }

  const w = maxX - minX || 1;
  const h = maxY - minY || 1;
  const maxDim = Math.max(w, h);
  const offsetX = (maxDim - w) / 2;
  const offsetY = (maxDim - h) / 2;

  const normalized = pts.map(p => ({
    x: ((p.x - minX) + offsetX) / maxDim,
    y: ((p.y - minY) + offsetY) / maxDim,
  }));

  const centroid = {
    x: (sumX / pts.length - minX + offsetX) / maxDim,
    y: (sumY / pts.length - minY + offsetY) / maxDim,
  };

  const resampled: Point[] = [];
  const step = (normalized.length - 1) / (targetCount - 1);
  for (let i = 0; i < targetCount; i++) {
    const idx = Math.min(normalized.length - 1, Math.round(i * step));
    resampled.push(normalized[idx]);
  }

  return { points: resampled, aspectRatio: h / w, centroid };
}

const PROTOTYPES: NormalizedPrototype[] = (() => {
  const list: NormalizedPrototype[] = [];
  for (const [key, shape] of Object.entries(kulitanPoints)) {
    const syllable = kulitanSyllables.find(s => s.latin.toLowerCase() === key.toLowerCase()) || {
      id: key,
      latin: key,
      kulitanSymbol: key,
      classification: 'Indung Sulat',
      definition: `Authentic Sulat Kapampangan glyph for ${key}`,
      pronunciation: `/${key}/`,
      writingRule: 'Follow standard Kulitan stroke direction.',
      exampleWord: key,
      exampleMeaning: key,
    };

    const norm = normalizeAndResamplePoints(shape.points, 80);
    list.push({
      key,
      latin: syllable.latin,
      points: norm.points,
      syllableData: syllable,
      aspectRatio: norm.aspectRatio,
      centroid: norm.centroid,
    });
  }
  return list;
})();

function computeChamferDistance(ptsA: Point[], ptsB: Point[]): number {
  if (ptsA.length === 0 || ptsB.length === 0) return 1.0;

  let sumAtoB = 0;
  for (let i = 0; i < ptsA.length; i++) {
    const pA = ptsA[i];
    let minDist = Infinity;
    for (let j = 0; j < ptsB.length; j++) {
      const pB = ptsB[j];
      const dx = pA.x - pB.x;
      const dy = pA.y - pB.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < minDist) minDist = d2;
    }
    sumAtoB += Math.sqrt(minDist);
  }

  let sumBtoA = 0;
  for (let j = 0; j < ptsB.length; j++) {
    const pB = ptsB[j];
    let minDist = Infinity;
    for (let i = 0; i < ptsA.length; i++) {
      const pA = ptsA[i];
      const dx = pB.x - pA.x;
      const dy = pB.y - pA.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < minDist) minDist = d2;
    }
    sumBtoA += Math.sqrt(minDist);
  }

  return (sumAtoB / ptsA.length + sumBtoA / ptsB.length) / 2;
}

// ==========================================
// 3. IMAGE PREPROCESSING & 28x28 TENSOR GENERATION
// ==========================================
function extractStrokeAndTensor(
  width: number,
  height: number,
  rgba: Uint8Array
): {
  tensor28x28: Float32Array;
  contourPoints: Point[];
  inkRatio: number;
  isBlank: boolean;
  isTooDark: boolean;
  isTooSmall: boolean;
} {
  const maxDim = 140;
  const step = Math.max(1, Math.floor(Math.max(width, height) / maxDim));
  const sampleW = Math.floor(width / step);
  const sampleH = Math.floor(height / step);

  const lumaGrid: number[][] = Array.from({ length: sampleH }, () => new Array(sampleW));
  let totalLuma = 0;
  let pixelCount = 0;

  for (let sy = 0; sy < sampleH; sy++) {
    const srcY = sy * step;
    for (let sx = 0; sx < sampleW; sx++) {
      const srcX = sx * step;
      const idx = (srcY * width + srcX) * 4;
      const r = rgba[idx];
      const g = rgba[idx + 1];
      const b = rgba[idx + 2];
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      lumaGrid[sy][sx] = luma;
      totalLuma += luma;
      pixelCount++;
    }
  }

  // Compute luminance histogram for Otsu adaptive thresholding
  const hist = new Uint32Array(256);
  for (let sy = 0; sy < sampleH; sy++) {
    for (let sx = 0; sx < sampleW; sx++) {
      hist[Math.min(255, Math.max(0, Math.round(lumaGrid[sy][sx])))]++;
    }
  }

  // Otsu's binarization: finds optimal threshold separating dark ink from paper background
  let sumB = 0;
  let wB = 0;
  let maximum = 0;
  let otsuThreshold = 128;
  for (let i = 0; i < 256; i++) {
    wB += hist[i];
    if (wB === 0) continue;
    const wF = pixelCount - wB;
    if (wF === 0) break;
    sumB += i * hist[i];
    const mB = sumB / wB;
    const mF = (totalLuma - sumB) / wF;
    const between = wB * wF * (mB - mF) * (mB - mF);
    if (between > maximum) {
      maximum = between;
      otsuThreshold = i;
    }
  }

  const avgLuma = totalLuma / (pixelCount || 1);
  // Robust ink threshold: Otsu threshold capped below background average to isolate actual strokes
  const inkThreshold = Math.min(210, Math.max(65, Math.min(otsuThreshold, avgLuma * 0.88)));

  let inkCount = 0;
  const isInk: boolean[][] = Array.from({ length: sampleH }, () => new Array(sampleW).fill(false));

  for (let y = 0; y < sampleH; y++) {
    for (let x = 0; x < sampleW; x++) {
      if (lumaGrid[y][x] < inkThreshold) {
        isInk[y][x] = true;
        inkCount++;
      }
    }
  }

  const inkRatio = inkCount / (pixelCount || 1);
  const emptyTensor = new Float32Array(28 * 28);

  // Sensitive ink detection for fine pencil strokes
  if (inkRatio < 0.0008 || inkCount < 8) {
    return { tensor28x28: emptyTensor, contourPoints: [], inkRatio, isBlank: true, isTooDark: false, isTooSmall: false };
  }

  if (inkRatio > 0.88) {
    return { tensor28x28: emptyTensor, contourPoints: [], inkRatio, isBlank: false, isTooDark: true, isTooSmall: false };
  }

  // Connected components to separate Kulitan glyph from outer frames or Latin guide labels
  const visited: boolean[][] = Array.from({ length: sampleH }, () => new Array(sampleW).fill(false));
  const components: { minX: number; maxX: number; minY: number; maxY: number; pts: Point[]; count: number }[] = [];

  for (let y = 0; y < sampleH; y++) {
    for (let x = 0; x < sampleW; x++) {
      if (isInk[y][x] && !visited[y][x]) {
        const queue: [number, number][] = [[x, y]];
        visited[y][x] = true;
        let cMinX = x, cMaxX = x, cMinY = y, cMaxY = y;
        let touchesBorder = false;
        const pts: Point[] = [];

        while (queue.length > 0) {
          const [cx, cy] = queue.shift()!;
          pts.push({ x: cx, y: cy });

          if (cx < cMinX) cMinX = cx;
          if (cx > cMaxX) cMaxX = cx;
          if (cy < cMinY) cMinY = cy;
          if (cy > cMaxY) cMaxY = cy;

          if (cx <= 1 || cx >= sampleW - 2 || cy <= 1 || cy >= sampleH - 2) touchesBorder = true;

          const neighbors: [number, number][] = [
            [cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]
          ];
          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < sampleW && ny >= 0 && ny < sampleH) {
              if (isInk[ny][nx] && !visited[ny][nx]) {
                visited[ny][nx] = true;
                queue.push([nx, ny]);
              }
            }
          }
        }

        // Ignore outer frame/border lines that touch the edge and span over 65% of the frame
        const isFrame = touchesBorder && (cMaxX - cMinX > sampleW * 0.65 || cMaxY - cMinY > sampleH * 0.65);
        if (!isFrame && pts.length >= 8) {
          components.push({
            minX: cMinX, maxX: cMaxX, minY: cMinY, maxY: cMaxY,
            pts,
            count: pts.length
          });
        }
      }
    }
  }

  // Select primary glyph component (largest interior stroke group)
  components.sort((a, b) => b.count - a.count);
  const primaryComp = components[0];

  if (!primaryComp || primaryComp.count < 10) {
    return { tensor28x28: emptyTensor, contourPoints: [], inkRatio, isBlank: false, isTooDark: false, isTooSmall: true };
  }

  const { minX, maxX, minY, maxY, pts } = primaryComp;
  const bboxW = maxX - minX + 1;
  const bboxH = maxY - minY + 1;

  if (bboxW < 3 || bboxH < 3) {
    return { tensor28x28: emptyTensor, contourPoints: [], inkRatio, isBlank: false, isTooDark: false, isTooSmall: true };
  }

  // Extract edge contour points of primary component
  const compInkMap = new Set(pts.map(p => `${p.x},${p.y}`));
  const contourPoints: Point[] = [];
  for (const p of pts) {
    let isEdge = false;
    const neighbors: [number, number][] = [
      [p.x - 1, p.y], [p.x + 1, p.y], [p.x, p.y - 1], [p.x, p.y + 1]
    ];
    for (const [nx, ny] of neighbors) {
      if (!compInkMap.has(`${nx},${ny}`)) {
        isEdge = true;
        break;
      }
    }
    if (isEdge) contourPoints.push(p);
  }

  // Render centered 28x28 normalized grayscale tensor for Neural Network
  const tensor28x28 = new Float32Array(28 * 28);
  const maxBboxDim = Math.max(bboxW, bboxH);
  const targetDim = 19;
  const scale = targetDim / maxBboxDim;
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;

  for (const p of pts) {
    const nx = Math.round(14 + (p.x - midX) * scale);
    const ny = Math.round(14 + (p.y - midY) * scale);
    if (nx >= 0 && nx < 28 && ny >= 0 && ny < 28) {
      tensor28x28[ny * 28 + nx] = 1.0;
      // Soft 3x3 anti-aliasing
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const ax = nx + dx;
          const ay = ny + dy;
          if (ax >= 0 && ax < 28 && ay >= 0 && ay < 28) {
            const idx = ay * 28 + ax;
            const v = 0.5;
            if (v > tensor28x28[idx]) tensor28x28[idx] = v;
          }
        }
      }
    }
  }

  return {
    tensor28x28,
    contourPoints: contourPoints.length > 0 ? contourPoints : pts,
    inkRatio: pts.length / (sampleW * sampleH),
    isBlank: false,
    isTooDark: false,
    isTooSmall: false,
  };
}

/**
 * Universal Base64 to RGBA Image Decoder.
 * On Web/WebView (e.g. Vercel, iOS Safari, Android Chrome), uses HTMLImageElement + 2D Canvas.
 * This natively handles ANY format (PNG, WebP, JPEG, AVIF, HEIC) reliably.
 * On Native React Native / Node, supports both PNG and JPEG automatically.
 */
async function decodeBase64ToRgba(base64: string): Promise<{ width: number; height: number; data: Uint8Array } | null> {
  const cleanB64 = base64.includes(',') ? base64.split(',')[1] : base64;

  // 1. Web & WebView Environment (Hardware accelerated, universal image support)
  if (typeof window !== 'undefined' && typeof document !== 'undefined' && typeof Image !== 'undefined') {
    try {
      const decoded = await new Promise<{ width: number; height: number; data: Uint8Array } | null>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) {
              resolve(null);
              return;
            }
            ctx.drawImage(img, 0, 0);
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            resolve({
              width: canvas.width,
              height: canvas.height,
              data: new Uint8Array(imgData.data.buffer),
            });
          } catch (canvasErr) {
            console.warn('Canvas 2D getImageData error:', canvasErr);
            resolve(null);
          }
        };
        img.onerror = (imgErr) => {
          console.warn('HTMLImageElement load error:', imgErr);
          resolve(null);
        };

        // Determine data URI prefix if not already present
        if (base64.startsWith('data:image/')) {
          img.src = base64;
        } else {
          try {
            const previewBytes = new Uint8Array(b64decode(cleanB64.slice(0, 32)));
            if (previewBytes[0] === 0x89 && previewBytes[1] === 0x50) {
              img.src = `data:image/png;base64,${cleanB64}`;
            } else if (previewBytes[0] === 0x52 && previewBytes[1] === 0x49) {
              img.src = `data:image/webp;base64,${cleanB64}`;
            } else {
              img.src = `data:image/jpeg;base64,${cleanB64}`;
            }
          } catch {
            img.src = `data:image/jpeg;base64,${cleanB64}`;
          }
        }
      });

      if (decoded) return decoded;
    } catch (webErr) {
      console.warn('Web canvas image decode failed, attempting fallback:', webErr);
    }
  }

  // 2. Native Mobile / Node / Fallback Environment (using pngjs + jpeg-js)
  try {
    const arrayBuffer = b64decode(cleanB64);
    const uint8 = new Uint8Array(arrayBuffer);

    // Check PNG signature: 0x89 0x50 0x4E 0x47
    if (uint8[0] === 0x89 && uint8[1] === 0x50 && uint8[2] === 0x4E && uint8[3] === 0x47) {
      const png = PNG.sync.read(Buffer.from(arrayBuffer));
      return {
        width: png.width,
        height: png.height,
        data: new Uint8Array(png.data.buffer, png.data.byteOffset, png.data.byteLength),
      };
    }

    const decoded = decodeJpeg(uint8, { useTArray: true });
    return {
      width: decoded.width,
      height: decoded.height,
      data: decoded.data,
    };
  } catch (err) {
    try {
      const arrayBuffer = b64decode(cleanB64);
      const png = PNG.sync.read(Buffer.from(arrayBuffer));
      return {
        width: png.width,
        height: png.height,
        data: new Uint8Array(png.data.buffer, png.data.byteOffset, png.data.byteLength),
      };
    } catch {}
    console.warn('Failed to decode image via jpeg-js/pngjs:', err);
    return null;
  }
}

// ==========================================
// 4. MAIN CLASSIFIER (Hybrid Deep Neural Network + Chamfer Ensemble)
// ==========================================
export async function classifyKulitanHandwriting(
  base64: string | null,
  targetSyllable?: string | null,
  language: 'EN' | 'FIL' = 'EN'
): Promise<ScanResult> {
  if (!base64 || base64.length < 500) {
    return {
      recognized: false,
      character: 'Unknown',
      kulitanSymbol: '?',
      confidence: 10,
      type: 'Unrecognized',
      transliteration: 'None',
      feedback: language === 'EN'
        ? 'No clear handwriting strokes detected in frame. Please write with bold, dark ink on plain paper.'
        : 'Walang malinaw na sulat-kamay na nakita. Mangyaring sumulat gamit ang maitim na tinta sa malinis na papel.',
      strokeAccuracy: 'Needs Practice',
      engine: 'neural_net',
    };
  }

  const bitmap = await decodeBase64ToRgba(base64);
  if (!bitmap) {
    return {
      recognized: false,
      character: 'Unknown',
      kulitanSymbol: '?',
      confidence: 15,
      type: 'Decode Error',
      transliteration: 'None',
      feedback: language === 'EN'
        ? 'Could not parse captured image. Please retake the photo under clear lighting.'
        : 'Hindi maiproseso ang larawan. Mangyaring kumuha muli nang may sapat na liwanag.',
      strokeAccuracy: 'Needs Practice',
      engine: 'neural_net',
    };
  }

  const features = extractStrokeAndTensor(bitmap.width, bitmap.height, bitmap.data);

  if (features.isBlank) {
    return {
      recognized: false,
      character: 'Unknown',
      kulitanSymbol: '?',
      confidence: 12,
      type: 'Blank / Plain Surface',
      transliteration: 'None',
      feedback: language === 'EN'
        ? 'Surface appears blank or without contrast. Write your Kulitan character boldly and align it inside the reticle.'
        : 'Mukhang walang guhit o kulang sa liwanag ang kuha. Isulat nang malinaw ang titik Kulitan sa loob ng gabay.',
      strokeAccuracy: 'Needs Practice',
      engine: 'neural_net',
    };
  }

  if (features.isTooDark) {
    return {
      recognized: false,
      character: 'Unknown',
      kulitanSymbol: '?',
      confidence: 15,
      type: 'Overexposed / Low Contrast',
      transliteration: 'None',
      feedback: language === 'EN'
        ? 'Image has too much glare or shadow. Move away from harsh light and use plain white paper.'
        : 'Masyadong madilim o may matinding anino ang kuha. Gumamit ng puting papel at iwasan ang silaw.',
      strokeAccuracy: 'Needs Practice',
      engine: 'neural_net',
    };
  }

  if (features.isTooSmall) {
    return {
      recognized: false,
      character: 'Unknown',
      kulitanSymbol: '?',
      confidence: 18,
      type: 'Incomplete / Fragment',
      transliteration: 'None',
      feedback: language === 'EN'
        ? 'The drawn stroke is too small or faint. Fill the viewfinder with a full Kulitan character.'
        : 'Masyadong maliit o malabo ang guhit. Punuin ang gabay ng buong titik Kulitan.',
      strokeAccuracy: 'Needs Practice',
      engine: 'neural_net',
    };
  }

  // 1. Run Machine Learning Neural Network Inference
  const neuralPredictions = runNeuralInference(features.tensor28x28);
  const top1 = neuralPredictions[0];
  const top2 = neuralPredictions[1];

  // 2. Run Geometric Chamfer Metric Evaluation
  const userNorm = normalizeAndResamplePoints(features.contourPoints, 80);
  const isUserWide = userNorm.aspectRatio < 0.60;

  const scoredPrototypes = PROTOTYPES.map(proto => {
    const chamfer = computeChamferDistance(userNorm.points, proto.points);
    const aspectDiff = Math.abs(userNorm.aspectRatio - proto.aspectRatio);
    const centroidDiff = Math.hypot(userNorm.centroid.x - proto.centroid.x, userNorm.centroid.y - proto.centroid.y);
    
    // Multi-character -ang ligatures (e.g. kang, dang, bang) have wide aspect ratio (~0.45)
    // Penalize ligatures if user drew a standard vertical character, preventing ligatures from dominating single characters
    const isLigature = proto.key.endsWith('ang') && proto.key !== 'ang';
    const ligaturePenalty = (!isUserWide && isLigature) ? 0.24 : (isUserWide && !isLigature) ? 0.16 : 0;

    const totalDist = chamfer + aspectDiff * 0.18 + centroidDiff * 0.14 + ligaturePenalty;

    return {
      proto,
      distance: totalDist,
      chamfer,
      aspectDiff,
      centroidDiff,
    };
  }).sort((a, b) => a.distance - b.distance);

  const bestChamfer = scoredPrototypes[0];

  // ==========================================
  // CASE A: User selected a specific Target Syllable
  // ==========================================
  if (targetSyllable) {
    const cleanTarget = targetSyllable.toLowerCase().trim();
    const targetProtoMatch = scoredPrototypes.find(
      p => p.proto.latin.toLowerCase() === cleanTarget || p.proto.key.toLowerCase() === cleanTarget
    );

    const targetNeuralRank = neuralPredictions.find(
      p => p.class.toLowerCase() === cleanTarget
    );

    const targetProb = targetNeuralRank ? targetNeuralRank.prob : 0;
    const targetChamfer = targetProtoMatch ? targetProtoMatch.chamfer : 1.0;
    const proto = targetProtoMatch ? targetProtoMatch.proto : bestChamfer.proto;

    // Check if target is top prediction in Neural Net or Chamfer
    const isTargetTopNeural = top1.class.toLowerCase() === cleanTarget;
    const isTargetTopChamfer = bestChamfer.proto.key.toLowerCase() === cleanTarget;

    let confidence: number;
    let strokeAccuracy: 'High' | 'Moderate' | 'Needs Practice';
    let feedback: string;

    if ((isTargetTopNeural && targetProb >= 65) || (targetChamfer <= 0.058)) {
      // High Accuracy Neural Confirmation
      confidence = Math.min(99, Math.max(90, Math.round(0.55 * targetProb + 0.45 * (100 - targetChamfer * 150))));
      strokeAccuracy = 'High';
      feedback = getDistilledFeedback(proto.latin, 'High', language, targetProb);
    } else if (targetProb >= 25 || targetChamfer <= 0.09) {
      // Moderate Accuracy
      confidence = Math.min(88, Math.max(72, Math.round(0.50 * targetProb + 0.50 * (95 - targetChamfer * 180))));
      strokeAccuracy = 'Moderate';
      feedback = getDistilledFeedback(proto.latin, 'Moderate', language, targetProb);
    } else {
      // Divergent stroke (User drew another character)
      confidence = Math.max(25, Math.min(58, Math.round(targetProb * 0.8 + 20)));
      strokeAccuracy = 'Needs Practice';
      feedback = getDistilledFeedback(proto.latin, 'Needs Practice', language, targetProb);
    }

    return {
      recognized: confidence >= 70,
      character: proto.latin.toUpperCase(),
      kulitanSymbol: proto.syllableData.kulitanSymbol,
      confidence,
      type: proto.syllableData.classification,
      transliteration: proto.latin,
      feedback,
      strokeAccuracy,
      engine: 'neural_net',
      similarityBreakdown: {
        chamferScore: Math.round((1 - Math.min(1, targetChamfer * 10)) * 100),
        spatialAlignment: Math.round((1 - Math.min(1, (targetProtoMatch?.centroidDiff || 0.1) * 4)) * 100),
        strokeCoverage: Math.round(features.inkRatio * 1000),
      },
      neuralBreakdown: {
        topClass: top1.class.toUpperCase(),
        topProbability: top1.prob,
        runnerUpClass: top2.class.toUpperCase(),
        runnerUpProbability: top2.prob,
        contourFit: Math.round((1 - Math.min(1, targetChamfer * 10)) * 100),
      },
    };
  }

  // ==========================================
  // CASE B: Auto-Detect Mode (Robust Ensemble Validation)
  // ==========================================
  // Cross-reference neural prediction against physical geometric contour
  const neuralMatch = scoredPrototypes.find(p => p.proto.key.toLowerCase() === top1.class.toLowerCase());

  let chosenProto: typeof bestChamfer.proto;
  let finalConfidence: number;
  let contourDist: number;

  // 1. High-precision geometric match to authentic Kulitan prototype
  if (bestChamfer.chamfer <= 0.058) {
    chosenProto = bestChamfer.proto;
    contourDist = bestChamfer.chamfer;
    const geomScore = Math.min(99, Math.max(90, Math.round(100 - contourDist * 140)));
    const altNeural = neuralPredictions.find(p => p.class.toLowerCase() === chosenProto.key.toLowerCase());
    const altProb = altNeural ? altNeural.prob : 45;
    finalConfidence = Math.min(98, Math.max(88, Math.round(0.20 * altProb + 0.80 * geomScore)));
  } else if (neuralMatch && neuralMatch.distance <= bestChamfer.distance * 1.35 && top1.prob >= 40) {
    // 2. Neural prediction physically verified by geometric distance (within 35% of best shape)
    // This prevents false-positive "DA" bias from overriding the true drawn character
    chosenProto = neuralMatch.proto;
    contourDist = neuralMatch.chamfer;
    const geomScore = Math.max(45, Math.round(100 - contourDist * 160));
    finalConfidence = Math.min(96, Math.max(60, Math.round(0.55 * top1.prob + 0.45 * geomScore)));
  } else {
    // 3. Neural prediction contradicted the drawn strokes (e.g., misclassified DA)
    // Select the true closest geometric prototype from canonical Kulitan orthography
    chosenProto = bestChamfer.proto;
    contourDist = bestChamfer.chamfer;
    const geomScore = Math.max(50, Math.round(100 - contourDist * 160));
    const altNeural = neuralPredictions.find(p => p.class.toLowerCase() === chosenProto.key.toLowerCase());
    const altProb = altNeural ? altNeural.prob : 28;
    finalConfidence = Math.min(94, Math.max(62, Math.round(0.35 * altProb + 0.65 * geomScore)));
  }

  let strokeAccuracy: 'High' | 'Moderate' | 'Needs Practice';
  if (finalConfidence >= 85) strokeAccuracy = 'High';
  else if (finalConfidence >= 70) strokeAccuracy = 'Moderate';
  else strokeAccuracy = 'Needs Practice';

  const feedback = getDistilledFeedback(chosenProto.latin, strokeAccuracy, language, finalConfidence);

  return {
    recognized: finalConfidence >= 65,
    character: chosenProto.latin.toUpperCase(),
    kulitanSymbol: chosenProto.syllableData.kulitanSymbol,
    confidence: finalConfidence,
    type: chosenProto.syllableData.classification,
    transliteration: chosenProto.latin,
    feedback,
    strokeAccuracy,
    engine: 'neural_net',
    similarityBreakdown: {
      chamferScore: Math.round(Math.max(0, 100 - contourDist * 180)),
      spatialAlignment: Math.round(Math.max(0, 100 - (bestChamfer.centroidDiff || 0.1) * 350)),
      strokeCoverage: Math.round(features.inkRatio * 1000),
    },
    neuralBreakdown: {
      topClass: chosenProto.latin.toUpperCase(),
      topProbability: finalConfidence,
      runnerUpClass: top2.class.toUpperCase(),
      runnerUpProbability: top2.prob,
      contourFit: Math.round(Math.max(0, 100 - contourDist * 180)),
    },
  };
}
