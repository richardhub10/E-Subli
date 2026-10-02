import { decode as b64decode } from 'base64-arraybuffer';
import { decode as decodeJpeg } from 'jpeg-js';
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
  engine?: 'gemini' | 'groq' | 'neural_net' | 'calibrated_cv';
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

  const avgLuma = totalLuma / (pixelCount || 1);
  // Adjusted threshold to reliably detect faint pencil and fine ballpen strokes (84% of background)
  const inkThreshold = Math.min(210, Math.max(70, avgLuma * 0.84));

  let inkCount = 0;
  let minX = sampleW, maxX = 0, minY = sampleH, maxY = 0;
  const isInk: boolean[][] = Array.from({ length: sampleH }, () => new Array(sampleW).fill(false));

  for (let y = 0; y < sampleH; y++) {
    for (let x = 0; x < sampleW; x++) {
      if (lumaGrid[y][x] < inkThreshold) {
        isInk[y][x] = true;
        inkCount++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const inkRatio = inkCount / (pixelCount || 1);
  const emptyTensor = new Float32Array(28 * 28);

  // Sensitive ink detection for fine pencil strokes
  if (inkRatio < 0.0008 || inkCount < 10) {
    return { tensor28x28: emptyTensor, contourPoints: [], inkRatio, isBlank: true, isTooDark: false, isTooSmall: false };
  }

  if (inkRatio > 0.88) {
    return { tensor28x28: emptyTensor, contourPoints: [], inkRatio, isBlank: false, isTooDark: true, isTooSmall: false };
  }

  const bboxW = maxX - minX + 1;
  const bboxH = maxY - minY + 1;

  if (bboxW < 4 || bboxH < 4 || inkCount < 14) {
    return { tensor28x28: emptyTensor, contourPoints: [], inkRatio, isBlank: false, isTooDark: false, isTooSmall: true };
  }

  // Extract edge contour points
  const contourPoints: Point[] = [];
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (isInk[y][x]) {
        let isEdge = false;
        if (
          y === 0 || y === sampleH - 1 || x === 0 || x === sampleW - 1 ||
          !isInk[y - 1][x] || !isInk[y + 1][x] || !isInk[y][x - 1] || !isInk[y][x + 1]
        ) {
          isEdge = true;
        }
        if (isEdge) contourPoints.push({ x, y });
      }
    }
  }

  // Render centered 28x28 normalized grayscale tensor for Neural Network
  const tensor28x28 = new Float32Array(28 * 28);
  const maxBboxDim = Math.max(bboxW, bboxH);
  const targetDim = 19;
  const scale = targetDim / maxBboxDim;
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (isInk[y][x]) {
        const nx = Math.round(14 + (x - midX) * scale);
        const ny = Math.round(14 + (y - midY) * scale);
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
    }
  }

  return {
    tensor28x28,
    contourPoints,
    inkRatio,
    isBlank: false,
    isTooDark: false,
    isTooSmall: false,
  };
}

/**
 * Universal Base64 to RGBA Image Decoder.
 * On Web/WebView (e.g. Vercel, iOS Safari, Android Chrome), uses HTMLImageElement + 2D Canvas.
 * This natively handles ANY format (PNG, WebP, JPEG, AVIF, HEIC) reliably.
 * On Native React Native, falls back to jpeg-js with raw byte parsing.
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
      console.warn('Web canvas image decode failed, attempting jpeg-js fallback:', webErr);
    }
  }

  // 2. Native Mobile / Node / Fallback Environment (using jpeg-js)
  try {
    const arrayBuffer = b64decode(cleanB64);
    const uint8 = new Uint8Array(arrayBuffer);
    const decoded = decodeJpeg(uint8, { useTArray: true });
    return {
      width: decoded.width,
      height: decoded.height,
      data: decoded.data,
    };
  } catch (err) {
    console.warn('Failed to decode JPEG via jpeg-js:', err);
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
  const scoredPrototypes = PROTOTYPES.map(proto => {
    const chamfer = computeChamferDistance(userNorm.points, proto.points);
    const aspectDiff = Math.abs(userNorm.aspectRatio - proto.aspectRatio);
    const centroidDiff = Math.hypot(userNorm.centroid.x - proto.centroid.x, userNorm.centroid.y - proto.centroid.y);
    const totalDist = chamfer + aspectDiff * 0.08 + centroidDiff * 0.12;

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
      const competitorName = top1.class.toUpperCase();
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
  // CASE B: Auto-Detect Mode (Neural Network Top Decision)
  // ==========================================
  // Find prototype for neural top1
  const neuralProto = PROTOTYPES.find(p => p.key.toLowerCase() === top1.class.toLowerCase()) || bestChamfer.proto;
  const neuralChamferMatch = scoredPrototypes.find(p => p.proto.key.toLowerCase() === top1.class.toLowerCase());
  const contourDist = neuralChamferMatch ? neuralChamferMatch.chamfer : bestChamfer.chamfer;

  // Calibrate overall confidence from Neural Softmax and Chamfer distance
  const neuralConfidence = top1.prob;
  const contourConfidence = Math.max(50, Math.round(100 - contourDist * 180));
  const finalConfidence = Math.min(99, Math.max(55, Math.round(0.60 * neuralConfidence + 0.40 * contourConfidence)));

  let strokeAccuracy: 'High' | 'Moderate' | 'Needs Practice';
  if (finalConfidence >= 88) strokeAccuracy = 'High';
  else if (finalConfidence >= 72) strokeAccuracy = 'Moderate';
  else strokeAccuracy = 'Needs Practice';

  const feedback = getDistilledFeedback(neuralProto.latin, strokeAccuracy, language, finalConfidence);

  return {
    recognized: true,
    character: neuralProto.latin.toUpperCase(),
    kulitanSymbol: neuralProto.syllableData.kulitanSymbol,
    confidence: finalConfidence,
    type: neuralProto.syllableData.classification,
    transliteration: neuralProto.latin,
    feedback,
    strokeAccuracy,
    engine: 'neural_net',
    similarityBreakdown: {
      chamferScore: Math.round((1 - Math.min(1, contourDist * 10)) * 100),
      spatialAlignment: Math.round((1 - Math.min(1, (neuralChamferMatch?.centroidDiff || 0.1) * 4)) * 100),
      strokeCoverage: Math.round(features.inkRatio * 1000),
    },
    neuralBreakdown: {
      topClass: top1.class.toUpperCase(),
      topProbability: top1.prob,
      runnerUpClass: top2.class.toUpperCase(),
      runnerUpProbability: top2.prob,
      contourFit: Math.round((1 - Math.min(1, contourDist * 10)) * 100),
    },
  };
}
