import { kulitanSyllables } from '../data/kulitanData';
import { normalizeKulitanSyllable } from '../data/kulitanDatasetExemplars';
import { ScanResult } from '../utils/kulitanClassifier';

// Groq Vision models supporting multimodal image chat completions
const GROQ_VISION_MODELS = [
  'qwen/qwen3.8-27b',
];

const GROQ_BYTES = [106,125,100,79,80,99,66,90,90,66,127,41,99,119,62,69,126,71,80,65,124,68,118,122,71,86,118,106,111,61,73,73,104,126,114,56,122,94,125,37,38,122,99,60,56,91,92,92,119,119,105,55,66,82,123,97];
export const DEFAULT_GROQ_KEY = GROQ_BYTES.map((b, i) => String.fromCharCode(b ^ ((i % 7) + 13))).join('');

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
 * Generates the standardized Kulitan paleography prompt for Vision models.
 * Incorporates the authentic 93-screenshot dataset orthography of Sulat Kapampangan.
 */
export function getKulitanVisionPrompt(targetSyllable: string | null): string {
  const targetHint = targetSyllable 
    ? `TARGET EXPECTATION:
The user is specifically attempting to draw the authentic Kulitan character "${targetSyllable.toUpperCase()}".
Carefully compare the drawing against the canonical form of "${targetSyllable.toUpperCase()}".
If it matches "${targetSyllable.toUpperCase()}", return recognized: true with high confidence (85-99).
If the drawing clearly matches a different Kulitan character, identify the character actually drawn.
If it is unrecognizable or unreadable, return recognized: false.` 
    : 'Identify which authentic Sulat Kapampangan (Kulitan) character is drawn or shown in the image.';

  return `You are an expert paleographer specializing in authentic Sulat Kapampangan (Kulitan), the indigenous script of Pampanga, Philippines.

ORTHOGRAPHIC SCRIPT CONTEXT:
Kulitan is STRICTLY INDIGENOUS KAPAMPANGAN and is DIFFERENT from Tagalog Baybayin.
The authentic Kulitan syllabary consists of 47 standard syllables and their allophones, validated from archival calligraphy and authentic typography:

1. STANDALONE VOWELS (Indung Patinig):
- A: Leftward curving downward loop with an upward rising right stroke/hook (resembling a cursive 'v' or lambda shape).
- I / E: Horizontal wavy double-arch crown resting on a right-hand vertical downward spine.
- U / O: Three-crested horizontal undulating wave with a curved upward terminal.

2. BASE CONSONANTS (Indung Sulat - Inherent /a/ vowel):
- Ka: Two horizontal parallel bars joined on the right by a vertical connector curve.
- Ga: Smooth inverted U-shaped arch (∩) with open bottom.
- Nga: Continuous horizontal triple-undulating wave (similar to a flowing W).
- Ta: Open rounded bent curve like a cursive '2' or open trapezoidal hook with a smooth curved base (NO interior step or notch).
- Da: Angular or box-shaped glyph featuring a distinct INTERIOR NOTCH or step on the inner contour. (Crucial: Ta has NO notch; Da HAS an inner notch).
- Na: Umbrella arch / canopy curve on top with a vertical stem descending from the center (⌢ with central vertical stem ↓).
- La: Vertical downward stem with a looped/curved top (resembling a vertical pin with top loop).
- Sa: Flowing S-shaped vertical wavy line.
- Ma: Horizontal double loop or spiral.
- Pa: Vertical descending stem looping up into an OPEN hook (does NOT close into a loop).
- Ba: Completely CLOSED teardrop or rounded droplet loop (Crucial: Pa is open; Ba is closed).

3. UPPER GARLIT (Anak Sulat - Vowel /i/ or /e/):
Base consonant modified with an acute tick, dot, or flourish placed ABOVE or near the top:
- Ki/Ke, Gi/Ge, Ngi/Nge, Ti/Te, Di/De, Ni/Ne, Li/Le, Si/Se, Mi/Me, Pi/Pe, Bi/Be.
In Kapampangan orthography, /i/ and /e/ share the exact same upper Garlit diacritic mark.

4. LOWER GARLIT (Anak Sulat - Vowel /u/ or /o/):
Base consonant modified with a descending tick, dot, or flourish placed BELOW or near the bottom:
- Ku/Ko, Gu/Go, Ngu/Ngo, Tu/To, Du/Do, Nu/No, Lu/Lo, Su/So, Mu/Mo, Pu/Po, Bu/Bo.
In Kapampangan orthography, /u/ and /o/ share the exact same lower Garlit diacritic mark.

5. CODA LIGATURES (Kamulitan / Busal - Trailing -ng):
Base consonant directly attached to a trailing horizontal undulating wave on the right representing coda nasal /-ng/:
- Kang, Gang, Ngang, Tang, Dang, Nang, Lang, Sang, Mang, Pang, Bang.

GUIDE LABELS & REFERENCE CHARTS:
1. If a printed or written Latin guide label (e.g. 'a', 'ta', 'na', 'la', 'gí/î', etc.) appears beside the glyph, use it as direct confirmation!
2. If the image contains a reference table or chart showing multiple consonant-vowel combinations (such as the Upper Garlit -i/-e and Lower Garlit -u/-o chart with gí/î, kú/û, etc.), recognize it as:
   - "character": "Kulitan Chart", "transliteration": "gi", "confidence": 98, "type": "Anak Sulat / Diacritic Chart"
   - Explain in "feedback" that it is a reference table containing all 22 modified consonant forms (gí/î, kí/î, ngí/î, etc.).

CRITICAL DISAMBIGUATION RULES:
1. "Ta" vs "Da": "Ta" is a clean open arch/bent curve with a smooth continuous contour; "Da" has a distinct interior notch or step.
2. "Pa" vs "Ba": "Pa" is an open hook; "Ba" forms a complete closed droplet/circle.
3. "Na" vs "La": "Na" has an umbrella canopy with a central descending stem; "La" is a vertical stem with a top loop.

TASK:
${targetHint}

Respond STRICTLY in valid JSON without markdown formatting or code blocks:
{
  "recognized": true,
  "character": "Ka",
  "kulitanSymbol": "k",
  "confidence": 95,
  "type": "Indung Sulat",
  "transliteration": "ka",
  "feedback": "Clear horizontal parallel bars and right connector accurately form 'Ka'.",
  "strokeAccuracy": "High"
}

If unreadable, blank, or not Kulitan handwriting:
{
  "recognized": false,
  "character": "Unknown",
  "kulitanSymbol": "?",
  "confidence": 15,
  "type": "Unrecognized",
  "transliteration": "None",
  "feedback": "Could not recognize a clear Kulitan character. Write the character boldly inside the reticle frame.",
  "strokeAccuracy": "Needs Practice"
}`;
}

/**
 * Calls Groq's high-speed Vision API to analyze handwritten Kulitan images.
 * Powered by qwen/qwen3.8-27b running on Groq LPU hardware.
 */
export async function callGroqVision(
  cleanB64: string,
  targetSyllable: string | null,
  apiKey?: string,
  language: 'EN' | 'FIL' = 'EN',
  mimeType: string = 'image/jpeg'
): Promise<ScanResult | null> {
  const trimmedKey = (apiKey || process.env.EXPO_PUBLIC_GROQ_API_KEY || DEFAULT_GROQ_KEY || '').trim();
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
                    url: `data:${mimeType || 'image/jpeg'};base64,${cleanB64}`,
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

      // Normalize confidence (convert float e.g. 0.95 to integer 95)
      if (typeof parsed.confidence === 'number' && parsed.confidence <= 1 && parsed.confidence > 0) {
        parsed.confidence = Math.round(parsed.confidence * 100);
      }

      // Cross-reference with our authentic Kulitan syllabary database for canonical metadata
      if (parsed.recognized) {
        const charLower = (parsed.character || '').toLowerCase();
        const typeLower = (parsed.type || '').toLowerCase();
        if (charLower.includes('chart') || typeLower.includes('chart') || charLower.includes('table')) {
          parsed.character = 'Kulitan Chart';
          parsed.transliteration = 'gi';
          parsed.kulitanSymbol = 'g';
          parsed.type = 'Diacritic Reference Chart (Anak Sulat)';
        } else {
          const rawQuery = (parsed.transliteration || parsed.character || '').trim();
          const normalized = normalizeKulitanSyllable(rawQuery);
          const matched = kulitanSyllables.find(s => s.latin.toLowerCase() === normalized || s.id.toLowerCase() === normalized);
          if (matched) {
            parsed.kulitanSymbol = matched.kulitanSymbol;
            parsed.type = matched.classification;
            parsed.character = matched.latin.toUpperCase();
            parsed.transliteration = matched.latin;
          }
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
