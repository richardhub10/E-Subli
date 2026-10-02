import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic import of TypeScript data file
const { kulitanPoints } = await import('../data/kulitanPoints.ts');

const CLASSES = [
  'a',
  'ka',
  'ga',
  'nga',
  'ta',
  'da',
  'na',
  'la',
  'sa',
  'ma',
  'pa',
  'ba',
  'i',
  'u'
];

const INPUT_DIM = 784; // 28x28
const H1_DIM = 96;
const H2_DIM = 48;
const NUM_CLASSES = CLASSES.length; // 14
const SAMPLES_PER_CLASS = 260; // 3,640 total augmented samples

console.log('Generating Augmented Synthetic Kulitan Handwriting Dataset...');

/**
 * Normalizes point coordinates to [0, 1] range preserving aspect ratio
 */
function normalizePoints(pts) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  const w = maxX - minX || 1;
  const h = maxY - minY || 1;
  const maxDim = Math.max(w, h);
  const offsetX = (maxDim - w) / 2;
  const offsetY = (maxDim - h) / 2;

  return pts.map(p => ({
    x: (p.x - minX + offsetX) / maxDim,
    y: (p.y - minY + offsetY) / maxDim,
  }));
}

/**
 * Distance from point (px, py) to line segment (x1, y1)-(x2, y2)
 */
function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY);
}

/**
 * Renders normalized vector points into an anti-aliased 28x28 grayscale grid [0..1]
 * with random handwriting augmentations (rotation, scale, shear, jitter, stroke width).
 */
function renderAugmentedSample(basePoints, isAugmented = true) {
  const grid = new Float32Array(INPUT_DIM);

  // Augmentation parameters
  const angle = isAugmented ? (Math.random() - 0.5) * 0.35 : 0; // ~ -10 to +10 deg
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const scaleX = isAugmented ? 0.88 + Math.random() * 0.26 : 1.0;
  const scaleY = isAugmented ? 0.88 + Math.random() * 0.26 : 1.0;
  const shiftX = isAugmented ? (Math.random() - 0.5) * 4.0 : 0;
  const shiftY = isAugmented ? (Math.random() - 0.5) * 4.0 : 0;
  const strokeRadius = isAugmented ? 0.9 + Math.random() * 0.9 : 1.3; // variable pen tip
  const jitterIntensity = isAugmented ? 0.015 : 0.0;

  // Center coordinate in 28x28 grid
  const canvasCenter = 14;
  const renderSize = 20; // fit within 20x20 in center (4px padding)

  // Transform points to canvas coordinates
  const transformed = basePoints.map(p => {
    // Add jitter
    const jx = (Math.random() - 0.5) * jitterIntensity;
    const jy = (Math.random() - 0.5) * jitterIntensity;
    const nx = p.x - 0.5 + jx;
    const ny = p.y - 0.5 + jy;

    // Scale and rotate
    const rx = (nx * scaleX) * cosA - (ny * scaleY) * sinA;
    const ry = (nx * scaleX) * sinA + (ny * scaleY) * cosA;

    // Map to 28x28 canvas
    return {
      x: canvasCenter + rx * renderSize + shiftX,
      y: canvasCenter + ry * renderSize + shiftY,
    };
  });

  // Rasterize stroke line segments with smooth anti-aliased falloff
  for (let s = 0; s < transformed.length - 1; s++) {
    const p1 = transformed[s];
    const p2 = transformed[s + 1];

    // Bounding box of segment
    const minX = Math.max(0, Math.floor(Math.min(p1.x, p2.x) - strokeRadius - 1));
    const maxX = Math.min(27, Math.ceil(Math.max(p1.x, p2.x) + strokeRadius + 1));
    const minY = Math.max(0, Math.floor(Math.min(p1.y, p2.y) - strokeRadius - 1));
    const maxY = Math.min(27, Math.ceil(Math.max(p1.y, p2.y) + strokeRadius + 1));

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const d = distToSegment(x, y, p1.x, p1.y, p2.x, p2.y);
        if (d < strokeRadius + 1.2) {
          // Smooth bell falloff
          const intensity = Math.max(0, 1.0 - (d / (strokeRadius + 1.2)));
          const idx = y * 28 + x;
          grid[idx] = Math.min(1.0, grid[idx] + intensity * intensity);
        }
      }
    }
  }

  return grid;
}

// Generate all samples
const allData = [];
for (let c = 0; c < NUM_CLASSES; c++) {
  const className = CLASSES[c];
  const shape = kulitanPoints[className];
  if (!shape || !shape.points || shape.points.length === 0) {
    throw new Error(`Missing canonical points for class "${className}"`);
  }
  const normPoints = normalizePoints(shape.points);

  for (let s = 0; s < SAMPLES_PER_CLASS; s++) {
    const tensor = renderAugmentedSample(normPoints, s > 0);
    allData.push({ input: tensor, label: c });
  }
}

// Shuffle dataset (Fisher-Yates)
for (let i = allData.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [allData[i], allData[j]] = [allData[j], allData[i]];
}

// Train/Validation Split (85% / 15%)
const splitIdx = Math.floor(allData.length * 0.85);
const trainData = allData.slice(0, splitIdx);
const valData = allData.slice(splitIdx);

console.log(`Dataset Ready: ${allData.length} samples total (${trainData.length} train, ${valData.length} validation).`);

// ==========================================
// NEURAL NETWORK TRAINING ENGINE (Adam Optimizer)
// ==========================================

function randn() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// He initialization
const W1 = new Float32Array(H1_DIM * INPUT_DIM);
const b1 = new Float32Array(H1_DIM);
const W2 = new Float32Array(H2_DIM * H1_DIM);
const b2 = new Float32Array(H2_DIM);
const W3 = new Float32Array(NUM_CLASSES * H2_DIM);
const b3 = new Float32Array(NUM_CLASSES);

const s1 = Math.sqrt(2.0 / INPUT_DIM);
for (let i = 0; i < W1.length; i++) W1[i] = randn() * s1;
const s2 = Math.sqrt(2.0 / H1_DIM);
for (let i = 0; i < W2.length; i++) W2[i] = randn() * s2;
const s3 = Math.sqrt(2.0 / H2_DIM);
for (let i = 0; i < W3.length; i++) W3[i] = randn() * s3;

// Adam state
const mW1 = new Float32Array(W1.length), vW1 = new Float32Array(W1.length);
const mb1 = new Float32Array(b1.length), vb1 = new Float32Array(b1.length);
const mW2 = new Float32Array(W2.length), vW2 = new Float32Array(W2.length);
const mb2 = new Float32Array(b2.length), vb2 = new Float32Array(b2.length);
const mW3 = new Float32Array(W3.length), vW3 = new Float32Array(W3.length);
const mb3 = new Float32Array(b3.length), vb3 = new Float32Array(b3.length);

const LR = 0.0035;
const BETA1 = 0.9;
const BETA2 = 0.999;
const EPS = 1e-8;
const BATCH_SIZE = 64;
const EPOCHS = 45;

let t = 0;

console.log('Training 3-Layer Deep Neural Network on Kulitan Dataset...');

for (let epoch = 1; epoch <= EPOCHS; epoch++) {
  // Shuffle training set
  for (let i = trainData.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [trainData[i], trainData[j]] = [trainData[j], trainData[i]];
  }

  let totalLoss = 0;
  let correctTrain = 0;

  for (let batchStart = 0; batchStart < trainData.length; batchStart += BATCH_SIZE) {
    t++;
    const batch = trainData.slice(batchStart, batchStart + BATCH_SIZE);
    const B = batch.length;

    // Gradient accumulators
    const gW1 = new Float32Array(W1.length);
    const gb1 = new Float32Array(b1.length);
    const gW2 = new Float32Array(W2.length);
    const gb2 = new Float32Array(b2.length);
    const gW3 = new Float32Array(W3.length);
    const gb3 = new Float32Array(b3.length);

    for (const sample of batch) {
      const x = sample.input;
      const y = sample.label;

      // Layer 1 Forward
      const z1 = new Float32Array(H1_DIM);
      const a1 = new Float32Array(H1_DIM);
      for (let j = 0; j < H1_DIM; j++) {
        let sum = b1[j];
        const off = j * INPUT_DIM;
        for (let i = 0; i < INPUT_DIM; i++) sum += x[i] * W1[off + i];
        z1[j] = sum;
        a1[j] = sum > 0 ? sum : 0.01 * sum; // Leaky ReLU
      }

      // Layer 2 Forward
      const z2 = new Float32Array(H2_DIM);
      const a2 = new Float32Array(H2_DIM);
      for (let j = 0; j < H2_DIM; j++) {
        let sum = b2[j];
        const off = j * H1_DIM;
        for (let i = 0; i < H1_DIM; i++) sum += a1[i] * W2[off + i];
        z2[j] = sum;
        a2[j] = sum > 0 ? sum : 0.01 * sum; // Leaky ReLU
      }

      // Layer 3 (Logits)
      const logits = new Float32Array(NUM_CLASSES);
      let maxLogit = -Infinity;
      for (let j = 0; j < NUM_CLASSES; j++) {
        let sum = b3[j];
        const off = j * H2_DIM;
        for (let i = 0; i < H2_DIM; i++) sum += a2[i] * W3[off + i];
        logits[j] = sum;
        if (sum > maxLogit) maxLogit = sum;
      }

      // Softmax
      let sumExp = 0;
      const probs = new Float32Array(NUM_CLASSES);
      for (let j = 0; j < NUM_CLASSES; j++) {
        probs[j] = Math.exp(logits[j] - maxLogit);
        sumExp += probs[j];
      }
      for (let j = 0; j < NUM_CLASSES; j++) probs[j] /= sumExp;

      // Loss & accuracy tracking
      const loss = -Math.log(Math.max(probs[y], 1e-12));
      totalLoss += loss;

      let predClass = 0;
      for (let j = 1; j < NUM_CLASSES; j++) {
        if (probs[j] > probs[predClass]) predClass = j;
      }
      if (predClass === y) correctTrain++;

      // Backpropagation: dLogits = probs - one_hot(y)
      const dLogits = new Float32Array(NUM_CLASSES);
      for (let j = 0; j < NUM_CLASSES; j++) {
        dLogits[j] = probs[j] - (j === y ? 1.0 : 0.0);
      }

      // Gradients for Layer 3
      const da2 = new Float32Array(H2_DIM);
      for (let j = 0; j < NUM_CLASSES; j++) {
        const dL = dLogits[j];
        gb3[j] += dL / B;
        const off = j * H2_DIM;
        for (let i = 0; i < H2_DIM; i++) {
          gW3[off + i] += (dL * a2[i]) / B;
          da2[i] += dL * W3[off + i];
        }
      }

      // Backpropagation through Layer 2
      const dz2 = new Float32Array(H2_DIM);
      for (let j = 0; j < H2_DIM; j++) {
        dz2[j] = da2[j] * (z2[j] > 0 ? 1.0 : 0.01);
      }

      const da1 = new Float32Array(H1_DIM);
      for (let j = 0; j < H2_DIM; j++) {
        const dL = dz2[j];
        gb2[j] += dL / B;
        const off = j * H1_DIM;
        for (let i = 0; i < H1_DIM; i++) {
          gW2[off + i] += (dL * a1[i]) / B;
          da1[i] += dL * W2[off + i];
        }
      }

      // Backpropagation through Layer 1
      const dz1 = new Float32Array(H1_DIM);
      for (let j = 0; j < H1_DIM; j++) {
        dz1[j] = da1[j] * (z1[j] > 0 ? 1.0 : 0.01);
      }

      for (let j = 0; j < H1_DIM; j++) {
        const dL = dz1[j];
        gb1[j] += dL / B;
        const off = j * INPUT_DIM;
        for (let i = 0; i < INPUT_DIM; i++) {
          gW1[off + i] += (dL * x[i]) / B;
        }
      }
    }

    // Adam Update Helper
    function updateAdam(param, grad, m, v) {
      const bc1 = 1.0 - Math.pow(BETA1, t);
      const bc2 = 1.0 - Math.pow(BETA2, t);
      for (let i = 0; i < param.length; i++) {
        m[i] = BETA1 * m[i] + (1.0 - BETA1) * grad[i];
        v[i] = BETA2 * v[i] + (1.0 - BETA2) * grad[i] * grad[i];
        const mHat = m[i] / bc1;
        const vHat = v[i] / bc2;
        param[i] -= (LR * mHat) / (Math.sqrt(vHat) + EPS);
      }
    }

    updateAdam(W1, gW1, mW1, vW1);
    updateAdam(b1, gb1, mb1, vb1);
    updateAdam(W2, gW2, mW2, vW2);
    updateAdam(b2, gb2, mb2, vb2);
    updateAdam(W3, gW3, mW3, vW3);
    updateAdam(b3, gb3, mb3, vb3);
  }

  // Evaluate on validation set
  let correctVal = 0;
  for (const sample of valData) {
    const x = sample.input;
    const y = sample.label;

    const a1 = new Float32Array(H1_DIM);
    for (let j = 0; j < H1_DIM; j++) {
      let sum = b1[j];
      const off = j * INPUT_DIM;
      for (let i = 0; i < INPUT_DIM; i++) sum += x[i] * W1[off + i];
      a1[j] = sum > 0 ? sum : 0.01 * sum;
    }

    const a2 = new Float32Array(H2_DIM);
    for (let j = 0; j < H2_DIM; j++) {
      let sum = b2[j];
      const off = j * H1_DIM;
      for (let i = 0; i < H1_DIM; i++) sum += a1[i] * W2[off + i];
      a2[j] = sum > 0 ? sum : 0.01 * sum;
    }

    let maxL = -Infinity;
    let pred = 0;
    for (let j = 0; j < NUM_CLASSES; j++) {
      let sum = b3[j];
      const off = j * H2_DIM;
      for (let i = 0; i < H2_DIM; i++) sum += a2[i] * W3[off + i];
      if (sum > maxL) {
        maxL = sum;
        pred = j;
      }
    }
    if (pred === y) correctVal++;
  }

  const trainAcc = ((correctTrain / trainData.length) * 100).toFixed(1);
  const valAcc = ((correctVal / valData.length) * 100).toFixed(1);

  if (epoch % 5 === 0 || epoch === EPOCHS) {
    console.log(`Epoch ${epoch}/${EPOCHS} - Loss: ${(totalLoss / trainData.length).toFixed(4)} - Train Acc: ${trainAcc}% - Val Acc: ${valAcc}%`);
  }
}

// Convert Float32Array to Base64 String
function toBase64(f32Arr) {
  const buf = Buffer.from(f32Arr.buffer, f32Arr.byteOffset, f32Arr.byteLength);
  return buf.toString('base64');
}

const exportedModel = {
  classes: CLASSES,
  inputDim: INPUT_DIM,
  h1Dim: H1_DIM,
  h2Dim: H2_DIM,
  numClasses: NUM_CLASSES,
  w1: toBase64(W1),
  b1: toBase64(b1),
  w2: toBase64(W2),
  b2: toBase64(b2),
  w3: toBase64(W3),
  b3: toBase64(b3),
};

const outputContent = `// Pre-trained Neural Network weights for Sulat Kapampangan (Kulitan) OCR
// Architecture: Input(${INPUT_DIM}) -> Dense(${H1_DIM}, LeakyReLU) -> Dense(${H2_DIM}, LeakyReLU) -> Dense(${NUM_CLASSES}, Softmax)
// Trained on 3,640 augmented synthetic handwriting variations with Adam optimizer
// Knowledge distilled from canonical Sulat Kapampangan orthography

export const KULITAN_NEURAL_WEIGHTS = ${JSON.stringify(exportedModel, null, 2)};
`;

const outputPath = path.resolve(__dirname, '../utils/kulitanNeuralModel.ts');
fs.writeFileSync(outputPath, outputContent, 'utf-8');
console.log(`Successfully compiled updated neural weights into: ${outputPath}`);
