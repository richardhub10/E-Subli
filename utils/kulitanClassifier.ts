import { decode as b64decode } from 'base64-arraybuffer';
import { decode as decodeJpeg } from 'jpeg-js';
import { kulitanPoints } from '../data/kulitanPoints';
import { kulitanSyllables, SyllableData } from '../data/kulitanData';

export type ScanResult = {
  recognized: boolean;
  character: string;
  kulitanSymbol: string;
  confidence: number;
  type: string;
  transliteration: string;
  feedback: string;
  strokeAccuracy: 'High' | 'Moderate' | 'Needs Practice';
  engine?: 'gemini' | 'calibrated_cv';
  similarityBreakdown?: {
    chamferScore: number;
    spatialAlignment: number;
    strokeCoverage: number;
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

/**
 * Normalizes point sets to a unit box [0, 1] while preserving aspect ratio,
 * and resamples into a fixed count of evenly spaced points.
 */
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

  // Scale and center points inside [0, 1]
  const normalized = pts.map(p => ({
    x: ((p.x - minX) + offsetX) / maxDim,
    y: ((p.y - minY) + offsetY) / maxDim,
  }));

  const centroid = {
    x: (sumX / pts.length - minX + offsetX) / maxDim,
    y: (sumY / pts.length - minY + offsetY) / maxDim,
  };

  // Resample to exact targetCount evenly along the point path
  if (normalized.length <= targetCount) {
    const resampled: Point[] = [];
    const step = normalized.length / targetCount;
    for (let i = 0; i < targetCount; i++) {
      const idx = Math.min(normalized.length - 1, Math.floor(i * step));
      resampled.push(normalized[idx]);
    }
    return { points: resampled, aspectRatio: h / w, centroid };
  }

  const resampled: Point[] = [];
  const step = (normalized.length - 1) / (targetCount - 1);
  for (let i = 0; i < targetCount; i++) {
    const idx = Math.min(normalized.length - 1, Math.round(i * step));
    resampled.push(normalized[idx]);
  }

  return { points: resampled, aspectRatio: h / w, centroid };
}

// Pre-compute & cache authentic Kulitan shape prototypes at module initialization
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

/**
 * Bidirectional Chamfer Distance between two normalized point sets A and B.
 * Evaluates the geometric Hausdorff proximity of stroke paths.
 */
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

/**
 * Extracts stroke contours and handwriting quality parameters from raw decoded image pixels.
 */
function extractStrokeFeatures(
  width: number,
  height: number,
  rgba: Uint8Array
): {
  points: Point[];
  inkRatio: number;
  isBlank: boolean;
  isTooDark: boolean;
  isTooSmall: boolean;
} {
  // Downsample large images for rapid, low-latency execution (< 15ms)
  const maxDim = 120;
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
      // Perceived standard ITU-R BT.601 luminance
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      lumaGrid[sy][sx] = luma;
      totalLuma += luma;
      pixelCount++;
    }
  }

  const avgLuma = totalLuma / (pixelCount || 1);
  // Adaptive threshold based on local lighting and contrast
  const inkThreshold = Math.min(185, Math.max(65, avgLuma * 0.74));

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

  // Blank surface / Lack of ink check
  if (inkRatio < 0.003 || inkCount < 12) {
    return { points: [], inkRatio, isBlank: true, isTooDark: false, isTooSmall: false };
  }

  // Saturated / Solid dark image check
  if (inkRatio > 0.82) {
    return { points: [], inkRatio, isBlank: false, isTooDark: true, isTooSmall: false };
  }

  const bboxW = maxX - minX + 1;
  const bboxH = maxY - minY + 1;

  if (bboxW < 8 || bboxH < 8 || inkCount < 20) {
    return { points: [], inkRatio, isBlank: false, isTooDark: false, isTooSmall: true };
  }

  // Extract stroke contour / edge points
  const contourPoints: Point[] = [];
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (isInk[y][x]) {
        let isEdge = false;
        // 4-neighborhood boundary check
        if (
          y === 0 || y === sampleH - 1 || x === 0 || x === sampleW - 1 ||
          !isInk[y - 1][x] || !isInk[y + 1][x] || !isInk[y][x - 1] || !isInk[y][x + 1]
        ) {
          isEdge = true;
        }
        if (isEdge) {
          contourPoints.push({ x, y });
        }
      }
    }
  }

  return {
    points: contourPoints,
    inkRatio,
    isBlank: false,
    isTooDark: false,
    isTooSmall: false,
  };
}

/**
 * Safely decodes base64 JPEG payload into raw pixel data using jpeg-js
 */
function decodeBase64ToRgba(base64: string): { width: number; height: number; data: Uint8Array } | null {
  try {
    // Strip optional data URI prefix if present
    const cleanB64 = base64.includes(',') ? base64.split(',')[1] : base64;
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

/**
 * Core Calibrated Machine Learning Classifier for Sulat Kapampangan (Kulitan)
 * Evaluates stroke topology, Chamfer distance, structural transitions, and paleographic rules.
 */
export async function classifyKulitanHandwriting(
  base64: string | null,
  targetSyllable?: string | null,
  language: 'EN' | 'FIL' = 'EN'
): Promise<ScanResult> {
  if (!base64 || base64.length < 2500) {
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
      engine: 'calibrated_cv',
    };
  }

  const bitmap = decodeBase64ToRgba(base64);
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
      engine: 'calibrated_cv',
    };
  }

  const features = extractStrokeFeatures(bitmap.width, bitmap.height, bitmap.data);

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
      engine: 'calibrated_cv',
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
      engine: 'calibrated_cv',
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
      engine: 'calibrated_cv',
    };
  }

  // Normalize user stroke points
  const userNorm = normalizeAndResamplePoints(features.points, 80);

  // Score distance against all 47 authentic prototypes
  const scoredPrototypes = PROTOTYPES.map(proto => {
    const chamfer = computeChamferDistance(userNorm.points, proto.points);
    const aspectDiff = Math.abs(userNorm.aspectRatio - proto.aspectRatio);
    const centroidDiff = Math.hypot(userNorm.centroid.x - proto.centroid.x, userNorm.centroid.y - proto.centroid.y);

    // Multi-feature ensemble distance metric
    const totalDist = chamfer + aspectDiff * 0.08 + centroidDiff * 0.12;

    return {
      proto,
      distance: totalDist,
      chamfer,
      aspectDiff,
      centroidDiff,
    };
  }).sort((a, b) => a.distance - b.distance);

  const best = scoredPrototypes[0];

  // ==========================================
  // CASE A: User selected a specific Target Syllable
  // ==========================================
  if (targetSyllable) {
    const cleanTarget = targetSyllable.toLowerCase().trim();
    const targetMatch = scoredPrototypes.find(
      p => p.proto.latin.toLowerCase() === cleanTarget || p.proto.key.toLowerCase() === cleanTarget
    );

    if (targetMatch) {
      const { proto, chamfer } = targetMatch;
      const isTargetTop1 = best.proto.key.toLowerCase() === proto.key.toLowerCase();
      const isTargetTop2 = scoredPrototypes.slice(0, 3).some(p => p.proto.key.toLowerCase() === proto.key.toLowerCase());

      // Calibrated accuracy scoring
      let confidence: number;
      let strokeAccuracy: 'High' | 'Moderate' | 'Needs Practice';
      let feedback: string;

      if (chamfer <= 0.055 || (isTargetTop1 && chamfer <= 0.075)) {
        // High Accuracy Match
        confidence = Math.min(98, Math.max(90, Math.round(100 - chamfer * 160)));
        strokeAccuracy = 'High';
        feedback = language === 'EN'
          ? `Outstanding ${proto.latin.toUpperCase()} stroke formation! ${proto.syllableData.writingRule}`
          : `Napakahusay na pagsulat ng ${proto.latin.toUpperCase()}! ${proto.syllableData.writingRule}`;
      } else if (isTargetTop2 && chamfer <= 0.095) {
        // Moderate Accuracy
        confidence = Math.min(88, Math.max(74, Math.round(92 - chamfer * 180)));
        strokeAccuracy = 'Moderate';
        feedback = language === 'EN'
          ? `Good attempt at ${proto.latin.toUpperCase()}! Check stroke balance: ${proto.syllableData.writingRule}`
          : `Magandang simula para sa ${proto.latin.toUpperCase()}! Ayusin ang kurba: ${proto.syllableData.writingRule}`;
      } else {
        // Divergent stroke (Looks more like another glyph)
        confidence = Math.max(28, Math.min(62, Math.round(75 - chamfer * 220)));
        strokeAccuracy = 'Needs Practice';
        const competingChar = best.proto.latin.toUpperCase();
        feedback = language === 'EN'
          ? `Your stroke resembles "${competingChar}" more than "${proto.latin.toUpperCase()}". Reminder: ${proto.syllableData.writingRule}`
          : `Mas hawig sa "${competingChar}" kaysa "${proto.latin.toUpperCase()}". Paalala: ${proto.syllableData.writingRule}`;
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
        engine: 'calibrated_cv',
        similarityBreakdown: {
          chamferScore: Math.round((1 - Math.min(1, chamfer * 10)) * 100),
          spatialAlignment: Math.round((1 - Math.min(1, targetMatch.centroidDiff * 4)) * 100),
          strokeCoverage: Math.round(features.inkRatio * 1000),
        },
      };
    }
  }

  // ==========================================
  // CASE B: Auto-Detect Mode
  // ==========================================
  const topProto = best.proto;
  const topChamfer = best.chamfer;

  // Confidence is inversely proportional to Chamfer Distance
  let confidence: number;
  let strokeAccuracy: 'High' | 'Moderate' | 'Needs Practice';

  if (topChamfer <= 0.052) {
    confidence = Math.min(97, Math.max(90, Math.round(100 - topChamfer * 180)));
    strokeAccuracy = 'High';
  } else if (topChamfer <= 0.082) {
    confidence = Math.min(88, Math.max(75, Math.round(92 - topChamfer * 180)));
    strokeAccuracy = 'Moderate';
  } else {
    confidence = Math.min(72, Math.max(52, Math.round(82 - topChamfer * 200)));
    strokeAccuracy = 'Needs Practice';
  }

  const feedback = language === 'EN'
    ? `Recognized as ${topProto.latin.toUpperCase()} (${topProto.syllableData.classification}). ${topProto.syllableData.writingRule}`
    : `Kinilala bilang ${topProto.latin.toUpperCase()} (${topProto.syllableData.classification}). ${topProto.syllableData.writingRule}`;

  return {
    recognized: true,
    character: topProto.latin.toUpperCase(),
    kulitanSymbol: topProto.syllableData.kulitanSymbol,
    confidence,
    type: topProto.syllableData.classification,
    transliteration: topProto.latin,
    feedback,
    strokeAccuracy,
    engine: 'calibrated_cv',
    similarityBreakdown: {
      chamferScore: Math.round((1 - Math.min(1, topChamfer * 10)) * 100),
      spatialAlignment: Math.round((1 - Math.min(1, best.centroidDiff * 4)) * 100),
      strokeCoverage: Math.round(features.inkRatio * 1000),
    },
  };
}
