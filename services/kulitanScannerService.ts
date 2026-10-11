import { kulitanSyllables, SyllableData } from '../data/kulitanData';
import { normalizeKulitanSyllable } from '../data/kulitanDatasetExemplars';
import { ScanResult } from '../utils/kulitanClassifier';
import { getDistilledFeedback } from '../data/distilledKulitanKnowledge';

export const DEFAULT_SCANNER_API_URL = 'https://testscanner.onrender.com/api/scan';

export interface TestScannerTopK {
  label: string;
  confidence: number;
}

export interface TestScannerResponse {
  prediction: string;
  confidence: number;
  top_k?: TestScannerTopK[];
  extracted_image_url?: string | null;
  symbol_info?: {
    symbol_found: boolean;
    confidence: number;
  };
  error?: string;
  details?: string;
}

/**
 * Resolves the active Testscanner API endpoint URL.
 */
export function getScannerApiUrl(): string {
  const envUrl =
    process.env.EXPO_PUBLIC_SCANNER_API_URL ||
    (process.env as any)?.EXPO_PUBLIC_SCANNER_APT_URL ||
    (process.env as any)?.EXPO_PUBLIC_SCANNER_URL;
  if (envUrl && envUrl.trim().length > 0) {
    let clean = envUrl.trim().replace(/\/+$/, '');
    if (!clean.endsWith('/api/scan')) {
      clean += '/api/scan';
    }
    return clean;
  }
  return DEFAULT_SCANNER_API_URL;
}

/**
 * Maps model output label to an authentic Kulitan syllable entry in E-Subli's dataset.
 * Handles:
 * - Direct latin match (e.g. "a", "ka", "bang")
 * - Dataset typos (e.g. "kank" -> "kang")
 * - Slash / underscore formats (e.g. "bi_i" / "bi/i" -> "bi")
 * - Allophone variants (e.g. "pe" -> "pi", "po" -> "pu")
 */
export function findMatchingSyllable(rawLabel: string): SyllableData | null {
  if (!rawLabel) return null;
  const label = rawLabel.toLowerCase().trim();
  if (label === 'unknown') return null;

  const normalizedLabel = label === 'kank' ? 'kang' : label;

  // 1. Direct match on latin
  let matched = kulitanSyllables.find(s => s.latin.toLowerCase() === normalizedLabel);
  if (matched) return matched;

  // 2. Direct match with slash / underscore interchangeable
  const withSlash = normalizedLabel.replace(/_/g, '/');
  matched = kulitanSyllables.find(s => s.latin.toLowerCase() === withSlash);
  if (matched) return matched;

  const withUnderscore = normalizedLabel.replace(/\//g, '_');
  matched = kulitanSyllables.find(s => s.latin.toLowerCase() === withUnderscore);
  if (matched) return matched;

  // 3. Match base root when label is a calligraphy variant (e.g. "bi_i" or "bi/i" -> "bi")
  const base = normalizedLabel.split(/[_/]/)[0];
  matched = kulitanSyllables.find(s => s.latin.toLowerCase() === base);
  if (matched) return matched;

  // 4. Fallback to canonical normalized syllable
  const canonical = normalizeKulitanSyllable(normalizedLabel);
  matched = kulitanSyllables.find(
    s => s.latin.toLowerCase() === canonical || s.id.toLowerCase() === canonical
  );
  if (matched) return matched;

  return null;
}

/**
 * Calls the high-accuracy ResNet-18 Kulitan scanner API deployed on Render.
 * 
 * @param base64Image Clean or data-URL encoded base64 image
 * @param language 'EN' or 'TL'
 * @param options Configurable timeout or custom endpoint
 */
export async function callTestScannerApi(
  base64Image: string,
  language: 'EN' | 'TL' = 'EN',
  options?: {
    timeoutMs?: number;
    apiUrl?: string;
    onStatusUpdate?: (status: string) => void;
  }
): Promise<ScanResult> {
  const cleanB64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
  const dataUrl = `data:image/jpeg;base64,${cleanB64}`;
  const apiUrl = options?.apiUrl || getScannerApiUrl();
  const timeoutMs = options?.timeoutMs ?? 45000; // 45s for Render cold spin-up

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // Progressive status updates if Render container is waking up
  const wakeTimer1 = setTimeout(() => {
    options?.onStatusUpdate?.(
      language === 'EN'
        ? 'Waking up ResNet-18 model on Render... Please hold on...'
        : 'Ginigising ang ResNet-18 model sa Render... Mangyaring maghintay...'
    );
  }, 3500);

  const wakeTimer2 = setTimeout(() => {
    options?.onStatusUpdate?.(
      language === 'EN'
        ? 'Finalizing glyph neural extraction... Almost done...'
        : 'Tinatapos ang neural extraction ng titik...'
    );
  }, 12000);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        image_data_url: dataUrl,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    clearTimeout(wakeTimer1);
    clearTimeout(wakeTimer2);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Scanner API returned status ${response.status}: ${errText.slice(0, 100)}`);
    }

    const data: TestScannerResponse = await response.json();

    if (data.error) {
      throw new Error(`Scanner API error: ${data.error}`);
    }

    const rawPrediction = (data.prediction || '').trim().toLowerCase();
    const rawConfidence = typeof data.confidence === 'number' ? data.confidence : 0;

    // Relative margin calibration for 93-class distribution
    const top2Confidence = data.top_k && data.top_k.length > 1 ? data.top_k[1].confidence : 0;
    const marginRatio = (rawConfidence + top2Confidence > 0)
      ? rawConfidence / (rawConfidence + top2Confidence)
      : 0.85;

    // Calibrated confidence (0-100) reflecting classification dominance across 93 classes
    const calibratedPct = Math.min(99, Math.max(
      Math.round(rawConfidence * 100),
      Math.round(marginRatio * 100)
    ));

    // A result is only unknown if the model explicitly returned unknown or blank
    const isUnknown = rawPrediction === 'unknown' || rawPrediction === '' || rawPrediction === 'none';
    const symbolFound = data.symbol_info?.symbol_found ?? !isUnknown;

    if (isUnknown || !symbolFound) {
      return {
        recognized: false,
        character: 'Unknown',
        kulitanSymbol: '?',
        confidence: Math.max(10, Math.min(calibratedPct, 35)),
        type: 'Unrecognized',
        transliteration: 'None',
        feedback: language === 'EN'
          ? 'No clear Kulitan character detected. Please write clearly inside the reticle with bold dark ink on plain paper.'
          : 'Walang malinaw na Kulitan character na nakita. Siguruhing malinaw ang pagkakasulat sa loob ng gabay gamit ang maitim na tinta sa malinis na papel.',
        strokeAccuracy: 'Needs Practice',
        engine: 'testscanner',
        extractedImageUrl: data.extracted_image_url || null,
        topK: data.top_k || [],
      };
    }

    // Match with E-Subli's syllable dictionary
    const matched = findMatchingSyllable(rawPrediction);

    const characterDisplay = matched ? matched.latin.toUpperCase() : rawPrediction.toUpperCase();
    const transliterationDisplay = matched ? matched.latin : rawPrediction;
    const kulitanSymbolDisplay = matched ? matched.kulitanSymbol : (rawPrediction[0] || '?');
    const classificationDisplay = matched ? matched.classification : 'Sulat Kapampangan';

    const strokeAccuracy: 'High' | 'Moderate' | 'Needs Practice' =
      calibratedPct >= 80 ? 'High' : calibratedPct >= 55 ? 'Moderate' : 'Needs Practice';

    const distilledTip = getDistilledFeedback(
      transliterationDisplay,
      strokeAccuracy,
      language === 'EN' ? 'EN' : 'FIL',
      calibratedPct
    );

    const feedbackText = language === 'EN'
      ? `Testscanner AI (ResNet-18) identified "${characterDisplay}" (${calibratedPct}% confidence). ${distilledTip}`
      : `Natukoy ng Testscanner AI (ResNet-18) ang "${characterDisplay}" (${calibratedPct}% kumpiyansa). ${distilledTip}`;

    return {
      recognized: true,
      character: characterDisplay,
      kulitanSymbol: kulitanSymbolDisplay,
      confidence: calibratedPct,
      type: classificationDisplay,
      transliteration: transliterationDisplay,
      feedback: feedbackText,
      strokeAccuracy,
      engine: 'testscanner',
      extractedImageUrl: data.extracted_image_url || null,
      topK: data.top_k || [],
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err?.name === 'AbortError') {
      throw new Error('Testscanner API request timed out (server might be waking up).');
    }
    throw err;
  }
}
