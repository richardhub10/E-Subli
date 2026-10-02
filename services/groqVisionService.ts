import { kulitanSyllables } from '../data/kulitanData';
import { ScanResult } from '../utils/kulitanClassifier';

// Groq Vision models known to support image-based chat completions
const GROQ_VISION_MODELS = [
  'llama-3.2-11b-vision-preview',
  'llama-3.2-90b-vision-preview',
];

/**
 * Validates if the key matches the official Groq API key format.
 * Official Groq keys start with 'gsk_' and are usually 50+ characters long.
 */
export function isValidGroqKey(key?: string): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  return trimmed.startsWith('gsk_') && trimmed.length >= 30;
}

/**
 * Generates the standardized Kulitan paleography prompt for Vision models
 */
export function getKulitanVisionPrompt(targetSyllable: string | null): string {
  const targetHint = targetSyllable 
    ? `The user is specifically attempting to draw the authentic Kulitan character "${targetSyllable.toUpperCase()}". Strictly verify if the handwriting matches "${targetSyllable.toUpperCase()}" with correct stroke curvature and components.` 
    : 'Identify which authentic Sulat Kapampangan (Kulitan) character is drawn in the image.';

  return `You are an expert paleographer specializing in authentic Sulat Kapampangan (Kulitan), the indigenous Brahmic script of Pampanga, Philippines.

CRITICAL ORTHOGRAPHIC DISTINCTION:
Kulitan is DISTINCT from Tagalog Baybayin. Do not evaluate this as Baybayin.
Key distinctive Kulitan forms:
- A: Downward looping hook curling upwards with a flourish at the bottom.
- I / E: Horizontal wavy crown with a right-hand vertical downward stem.
- U / O: Three-crested horizontal flowing wave.
- Ka: Two parallel horizontal bars joined by a right-side connector curve or vertical stem.
- Ga: Rounded arch with an open bottom, right leg curving inward.
- Nga: Continuous undulating double-wave (horizontal W shape).
- Ta: Open C-shaped loop with an angled bottom horizontal base.
- Da / Ra: Open box bracket with an interior central step or notch.
- Na: Left downward arc with an upward sweeping right tail.
- Pa: Vertical descending stem looping up into a hook head.
- Ba: Closed teardrop or rounded droplet loop.
- Ma: Distinct double horizontal loop or spiral.
- Ya: Open three-pronged upward fork/crest.
- La: Vertical spine ending in a downward-right hook/curl.
- Wa: Open rounded cup with a right-hand vertical spine.
- Sa: S-shaped flowing vertical curve.

TASK:
${targetHint}

Evaluate stroke quality, curvature, and proportions.
If the image shows no clear handwriting, a plain blank page, or unreadable smudges, return recognized: false with confidence < 20.

Respond strictly in valid JSON without markdown code fences using this exact schema:
{
  "recognized": true,
  "character": "Ka",
  "kulitanSymbol": "k",
  "confidence": 92,
  "type": "Consonant (Indung Sulat)",
  "transliteration": "Ka",
  "feedback": "Excellent stroke balance! Dual horizontal bars and vertical connector align well.",
  "strokeAccuracy": "High"
}

If unreadable or blank:
{
  "recognized": false,
  "character": "Unknown",
  "kulitanSymbol": "?",
  "confidence": 15,
  "type": "Unrecognized",
  "transliteration": "None",
  "feedback": "The handwriting could not be recognized as Kulitan. Try writing the character larger with distinct strokes inside the guide.",
  "strokeAccuracy": "Needs Practice"
}`;
}

/**
 * Calls Groq's high-speed Vision API to analyze handwritten Kulitan images.
 * Acts as an ultra-fast backup or consensus engine when Gemini is unavailable.
 */
export async function callGroqVision(
  cleanB64: string,
  targetSyllable: string | null,
  apiKey: string,
  language: 'EN' | 'FIL' = 'EN'
): Promise<ScanResult | null> {
  const trimmedKey = (apiKey || '').trim();
  if (!isValidGroqKey(trimmedKey)) {
    return null;
  }

  const prompt = getKulitanVisionPrompt(targetSyllable);

  for (const model of GROQ_VISION_MODELS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second timeout

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${trimmedKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${cleanB64}`,
                  },
                },
              ],
            },
          ],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.warn(`Groq Vision API model ${model} returned error status ${response.status}:`, errorText);
        continue;
      }

      const data = await response.json();
      const rawContent = data?.choices?.[0]?.message?.content;
      if (!rawContent) continue;

      const rawJson = typeof rawContent === 'string' ? rawContent.trim() : JSON.stringify(rawContent);
      const jsonMatch = rawJson.match(/\{[\s\S]*\}/);
      if (!jsonMatch) continue;

      const parsed = JSON.parse(jsonMatch[0]) as ScanResult;
      parsed.engine = 'groq';

      // Cross-reference with our authentic Kulitan syllabary database for canonical metadata
      if (parsed.recognized) {
        const query = (parsed.transliteration || parsed.character || '').trim().toLowerCase();
        const matched = kulitanSyllables.find(s => s.latin.toLowerCase() === query);
        if (matched) {
          parsed.kulitanSymbol = matched.kulitanSymbol;
          parsed.type = matched.classification;
          parsed.character = matched.latin.toUpperCase();
        }
      }

      return parsed;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.warn(`Groq Vision model ${model} timed out after 12s.`);
      } else {
        console.warn(`Groq Vision request failed on model ${model}:`, err);
      }
    }
  }

  return null;
}
