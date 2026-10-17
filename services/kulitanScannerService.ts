import { Platform } from 'react-native';
import { kulitanSyllables, SyllableData } from '../data/kulitanData';
import { normalizeKulitanSyllable } from '../data/kulitanDatasetExemplars';
import { ScanResult } from '../utils/kulitanClassifier';
import { getDistilledFeedback } from '../data/distilledKulitanKnowledge';

export const DEFAULT_SCANNER_API_URL = 'https://e-subli-production.up.railway.app/api/scan';

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
  const rawEnv =
    process.env.EXPO_PUBLIC_SCANNER_API_URL ||
    (process.env as any)?.EXPO_PUBLIC_SCANNER_APT_URL ||
    (process.env as any)?.EXPO_PUBLIC_SCANNER_URL;

  // Strictly filter out any obsolete Render URLs completely
  const envUrl = (rawEnv && !rawEnv.includes('onrender.com')) ? rawEnv.trim() : '';

  // On Web: Always use same-origin /api/scan so requests hit the unified Railway service directly
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
    if (!envUrl || envUrl.startsWith('/')) {
      return `${window.location.origin}/api/scan`;
    }
  }

  if (envUrl && envUrl.length > 0) {
    let clean = envUrl.replace(/\/+$/, '');
    if (!clean.endsWith('/api/scan')) {
      clean += '/api/scan';
    }
    return clean;
  }
  return DEFAULT_SCANNER_API_URL;
}

/**
 * Canonical 22 compound vowel-variant characters (/i and /u).
 * Maps both underscore ("lu_u") and slash ("lu/u") formats to standard slash notation.
 */
export const COMPOUND_VARIANTS_MAP: Record<string, string> = {
  // 11 I-variants
  'bi/i': 'bi/i', 'bi_i': 'bi/i',
  'di/i': 'di/i', 'di_i': 'di/i',
  'gi/i': 'gi/i', 'gi_i': 'gi/i',
  'ki/i': 'ki/i', 'ki_i': 'ki/i',
  'li/i': 'li/i', 'li_i': 'li/i',
  'mi/i': 'mi/i', 'mi_i': 'mi/i',
  'ni/i': 'ni/i', 'ni_i': 'ni/i',
  'ngi/i': 'ngi/i', 'ngi_i': 'ngi/i',
  'pi/i': 'pi/i', 'pi_i': 'pi/i',
  'si/i': 'si/i', 'si_i': 'si/i',
  'ti/i': 'ti/i', 'ti_i': 'ti/i',

  // 11 U-variants
  'bu/u': 'bu/u', 'bu_u': 'bu/u',
  'du/u': 'du/u', 'du_u': 'du/u',
  'gu/u': 'gu/u', 'gu_u': 'gu/u',
  'ku/u': 'ku/u', 'ku_u': 'ku/u',
  'lu/u': 'lu/u', 'lu_u': 'lu/u',
  'mu/u': 'mu/u', 'mu_u': 'mu/u',
  'nu/u': 'nu/u', 'nu_u': 'nu/u',
  'ngu/u': 'ngu/u', 'ngu_u': 'ngu/u',
  'pu/u': 'pu/u', 'pu_u': 'pu/u',
  'su/u': 'su/u', 'su_u': 'su/u',
  'tu/u': 'tu/u', 'tu_u': 'tu/u',
};

/**
 * Maps model output label to an authentic Kulitan syllable entry in E-Subli's dataset.
 * Handles:
 * - 22 Compound vowel variants (e.g. "lu/u", "bi/i", "lu_u")
 * - Direct latin match (e.g. "a", "ka", "bang")
 * - Dataset typos (e.g. "kank" -> "kang")
 * - Allophone variants (e.g. "pe" -> "pi", "po" -> "pu")
 */
export function findMatchingSyllable(rawLabel: string): SyllableData | null {
  if (!rawLabel) return null;
  const label = rawLabel.toLowerCase().trim();
  if (label === 'unknown') return null;

  const normalizedLabel = label === 'kank' ? 'kang' : label;
  const withSlash = normalizedLabel.replace(/_/g, '/');
  const withUnderscore = normalizedLabel.replace(/\//g, '_');

  // 1. Compound variant priority match (e.g. "lu/u" or "lu_u" -> Card 85)
  const compoundKey = COMPOUND_VARIANTS_MAP[normalizedLabel] || 
                      COMPOUND_VARIANTS_MAP[withSlash] ||
                      COMPOUND_VARIANTS_MAP[withUnderscore];
  if (compoundKey) {
    const compoundMatch = kulitanSyllables.find(s => {
      const sLatin = s.latin.toLowerCase();
      return (
        sLatin === compoundKey ||
        sLatin === compoundKey.replace(/\//g, '_') ||
        sLatin.startsWith(compoundKey + ' ') ||
        sLatin.startsWith(compoundKey.split('/')[0] + ' (variant')
      );
    });
    if (compoundMatch) return compoundMatch;
  }

  // 2. Direct match on latin
  let matched = kulitanSyllables.find(s => s.latin.toLowerCase() === normalizedLabel);
  if (matched) return matched;

  // 3. Direct match with slash / underscore interchangeable
  matched = kulitanSyllables.find(s => s.latin.toLowerCase() === withSlash);
  if (matched) return matched;

  matched = kulitanSyllables.find(s => s.latin.toLowerCase() === withUnderscore);
  if (matched) return matched;

  // 4. Match base root only if NOT a compound character (prevent collapsing "lu/u" -> "lu")
  if (!compoundKey) {
    const base = normalizedLabel.split(/[_/]/)[0];
    matched = kulitanSyllables.find(s => s.latin.toLowerCase() === base);
    if (matched) return matched;
  }

  // 5. Fallback to canonical normalized syllable
  const canonical = normalizeKulitanSyllable(normalizedLabel);
  matched = kulitanSyllables.find(
    s => s.latin.toLowerCase() === canonical || s.id.toLowerCase() === canonical
  );
  if (matched) return matched;

  return null;
}

/**
 * Calls the high-accuracy ResNet-18 Kulitan scanner API deployed on Railway.
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
  const timeoutMs = options?.timeoutMs ?? 45000;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // Progressive status updates while model processes the image
  const wakeTimer1 = setTimeout(() => {
    options?.onStatusUpdate?.(
      language === 'EN'
        ? 'Processing glyph with ResNet-18 model... Please hold on...'
        : 'Sinusuri ang titik gamit ang ResNet-18 model... Mangyaring maghintay...'
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

    const compoundTarget = COMPOUND_VARIANTS_MAP[rawPrediction] ||
                           COMPOUND_VARIANTS_MAP[rawPrediction.replace(/_/g, '/')] ||
                           (rawPrediction.includes('/') || rawPrediction.includes('_') ? rawPrediction.replace(/_/g, '/') : null);
    const isCompound = Boolean(compoundTarget);
    const compoundUpper = (compoundTarget || rawPrediction.replace(/_/g, '/')).toUpperCase();
    const compoundLower = (compoundTarget || rawPrediction.replace(/_/g, '/')).toLowerCase();

    const characterDisplay = isCompound
      ? compoundUpper
      : (matched ? matched.latin.toUpperCase() : rawPrediction.toUpperCase());

    const transliterationDisplay = isCompound
      ? compoundLower
      : (matched ? matched.latin : rawPrediction);

    const kulitanSymbolDisplay = matched
      ? matched.kulitanSymbol
      : (isCompound ? compoundLower : (rawPrediction[0] || '?'));

    const classificationDisplay = matched
      ? matched.classification
      : (isCompound ? `Compound Vowel Variant (${compoundUpper})` : 'Sulat Kapampangan');

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

    const formattedTopK = (data.top_k || []).map(item => ({
      label: item.label.replace(/_/g, '/'),
      confidence: item.confidence
    }));

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
      topK: formattedTopK,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err?.name === 'AbortError') {
      throw new Error('Testscanner API request timed out (server might be waking up).');
    }
    throw err;
  }
}
