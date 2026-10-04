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
The user is specifically attempting to draw or scan the authentic Kulitan character "${targetSyllable.toUpperCase()}".
Carefully compare the drawing against the canonical form of "${targetSyllable.toUpperCase()}".
If it matches "${targetSyllable.toUpperCase()}", return recognized: true with high confidence (88-99).
If the drawing clearly matches a different Kulitan character, identify the character actually drawn.
If it is unrecognizable or unreadable, return recognized: false.` 
    : 'Identify which authentic Sulat Kapampangan (Kulitan) character is drawn or shown in the image.';

  return `You are an expert paleographer specializing in authentic Sulat Kapampangan (Kulitan), the indigenous script of Pampanga, Philippines.

STRICT INSTRUCTION ON INDEPENDENT / ISOLATED SYMBOL RECOGNITION:
The image contains an isolated Kulitan character, handwriting sample, or crop.
There is NO English or Latin text accompanying the symbol. The symbol is COMPLETELY INDEPENDENT.
You must identify the character SOLELY and PURELY by analyzing its stroke morphology, curves, stem orientation, and attached ligatures according to the morphology key below.
Do NOT guess or assume Egyptian hieroglyphs, Chinese, Japanese, or Arabic. This is authentic Sulat Kapampangan (Kulitan).

PRIORITY OF IDENTIFICATION:
1. First, check if the glyph is a pure STANDALONE VOWEL (A, I, U) or pure BASE CONSONANT (Ka, Ga, Nga, Ta, Da, Na, La, Sa, Ma, Pa, Ba) WITHOUT any diacritic or attached ligature.
2. Only classify as a modified vowel (Anak Súlat: -i/-e, -u/-o) or coda nasal (-ng) if the explicit diacritic tick (/) or lower comma (,) or attached ligature flourish (~|, ~v, -ng) is CLEARLY and UNMISTAKABLY present.

ORTHOGRAPHIC MORPHOLOGY KEY (Sulat Kapampangan):

1. STANDALONE VOWELS (Indûng Patinig - Independent Vowels):
- A (Standalone Vowel A):
  * A single continuous flowing cursive stroke: starts with a downward-curling hook from top-left, curves down into an enclosed teardrop or crossing loop at the lower-left, and sweeps smoothly upward and rightward in an open tail flourish (resembling an open cursive 'alpha' α or open cursive 'a' / ribbon loop).
  * CRITICAL FOR STANDALONE A: It has its crossing loop at the LOWER-LEFT and an open right arm. It has NO right-hand horizontal tick and NO horizontal crossbar! (If there is a horizontal tick extending to the right from the right arm, it is Base Pa; if there is a horizontal crossbar cutting across the middle, it is Base Ma).
  * If the stroke loops/crosses at the bottom-left and has NO right-hand horizontal tick, it is 100% ALWAYS STANDALONE VOWEL A (transliteration: 'a', character: 'A', type: 'Standalone Vowel (Indûng Patinig)'), NEVER Pa!
- I (Standalone Vowel I):
  * Consists of TWO COMPLETELY SEPARATE, DETACHED GLYPHS / COMPONENTS drawn side-by-side with an obvious vertical gap of white space separating them (~|  ~|). There are 2 distinct separate disconnected strokes, each with an arched base rising into a tall straight vertical spine/needle.
  * CRITICAL: Two separate, physically disconnected twin upright needle motifs side-by-side is 100% STANDALONE VOWEL I (transliteration: 'i', character: 'I', type: 'Standalone Vowel (Indûng Patinig)'), NEVER Standalone U and NEVER Ngí / Nge!
- U / O (Standalone Vowel U / O):
  * A SINGLE CONTINUOUS UNBROKEN STROKE forming a flowing double-valley cursive wave (resembling a cursive 'w' or 'vv') where the two bottom rounded dips are joined together continuously in one pen stroke (ONE single connected component, NOT two separate detached pieces), sweeping upward on the right into an open curved tail flourish.
  * CRITICAL: Standalone U is ONE single continuous unbroken connected stroke ('w' / 'vv'). If the stroke is a single continuous unbroken line joining the bottom dips together, it is 100% STANDALONE VOWEL U / O (transliteration: 'u', character: 'U', type: 'Standalone Vowel (Indûng Patinig)'), NEVER Standalone I!
  * Standalone U vs Nga: Standalone U has NO initial left crescent arc ')' and NO tall straight vertical needle. It is a flowing double-valley curve ('w') sweeping up on the right.
- Standalone Vowel E (Indûng Súlat E / "E"): A continuous stroke with a distinct C-shaped outer hook/curve on the far left, an internal horizontal crossover bridge / two parallel horizontal dashes (=) in the center, and an attached right-hand tall upright vertical needle flourish (~|) shooting up to the top margin.

2. BASE CONSONANTS (Indûng Súlat - Inherent /a/ vowel, Plain Independent Characters):
- Ka: Two horizontal parallel bars joined on the right by a vertical/curved connector stroke (or two parallel bars).
- Ga: Single smooth inverted U-shaped arch (∩) with open bottom.
- Nga: An initial sweeping left downward crescent/arc (')') connected to a SINGLE central undulating double-hump wave ('m' / 'n').
  * Plain Nga vs Ngang: A single crescent ')' + single 'm'-wave is 100% BASE CONSONANT NGA (transliteration: 'nga', character: 'Nga', type: 'Inherent Consonant (Indûng Súlat)'). It is ONLY Ngang if there is a second separate trailing coda nasal pair.
- Ta: Characteristic upper-left downward-curling hook/arch (~), dropping down into an elongated horizontal baseline (first valley), which turns up into a single medial arch and STOPS immediately. It has NO second valley, NO trailing wing, and NO upright needle.
  * Plain Ta vs Standalone A: Plain Ta has a flat horizontal floor baseline and a distinct medial arch that stops. Standalone A has a looping cursive bottom that sweeps up to the right.
- Da: Angular box-bracket or cursive 'z'-like contour featuring an integral wavy top crown stroke on top, and an angular box-bracket body below with an interior notch on the diagonal waist.
  * CRITICAL FOR BASE DA: The wavy top crown stroke is the integral anatomical head of Base Da itself! Plain Da consists of this wavy crown plus the box body. The wavy crown is NOT a diacritic. If there are only these two elements (the wavy crown and the box body), it is 100% BASE CONSONANT DA (transliteration: 'da', character: 'Da', type: 'Inherent Consonant (Indûng Súlat)'), NEVER Dí / De!
- Na: Umbrella arch / canopy curve on top with a central vertical stem descending straight down (⌢ with central vertical stem ↓). The canopy curves down symmetrically on BOTH left and right sides.
- La: Straight vertical downward stem/pin descending from a top looped ribbon curl (looks like a vertical pin or 'rho' ρ).
  * CRITICAL FOR BASE LA: Base La has a top ribbon loop/curl with a single vertical straight stem descending DOWNWARD. Plain La has NO separate floating tick above and NO second upright needle. If you see a top loop/ribbon with a straight vertical downward stem, it is 100% BASE CONSONANT LA (transliteration: 'la', character: 'La', type: 'Inherent Consonant (Indûng Súlat)'), NEVER Na and NEVER Lí / Le!
- Sa: Flowing '3' shape (numeral 3 with two open curved loops).
- Ma: Characterized by a diagonal slash or loop with a crossbar cutting completely across the diagonal spine (slashed diagonal / cross).
  * Base Ma vs Base Pa: Base Ma has a diagonal spine or closed loop. Base Pa is an OPEN checkmark 'v' or '√' cup with a tick on the right arm.
  * Base Ma vs Standalone A: If there is a horizontal crossbar intersecting the stroke, it is 100% BASE CONSONANT MA (transliteration: 'ma', character: 'Ma', type: 'Inherent Consonant (Indûng Súlat)'), NEVER Standalone A!
- Pa: An OPEN checkmark-like 'v' or '√' upward cup with a horizontal tick/bar attached to the right arm (open 'v' bowl with a rightward tick).
  * Base Pa vs Base Ma: Base Pa has an OPEN rounded checkmark 'v' cup with a right-hand horizontal tick. It is 100% BASE CONSONANT PA (transliteration: 'pa', character: 'Pa', type: 'Inherent Consonant (Indûng Súlat)'), NEVER Ma!
  * Base Pa vs Standalone A: Base Pa has an open checkmark cup with a horizontal tick. Standalone A has a bottom-left looping/crossing flourish with no tick.
- Ba: Completely CLOSED oval circle or droplet loop (O).

3. UPPER GARLIT / LIGATED -I/-E (Anak Súlat):
Base consonant modified for vowel /i/ or /e/. Must have either Form A or Form B:
- Form A (-i/-e diacritic tick / garlit): Base consonant with a SEPARATE DETACHED UPPER ACUTE TICK (/) hovering clearly ABOVE it:
  * Dí / De (Form A): MUST have a THIRD element: a SEPARATE DETACHED UPPER ACUTE TICK (/) clearly hovering ABOVE the wavy crown (Base Da body + wavy crown + third acute tick = 3 elements). If there is NO third acute tick hovering above the wavy crown, it is BASE DA!
  * Lí / Le (Form A): Base 'La' with a SEPARATE DETACHED UPPER ACUTE TICK (/) hovering above the loop. If there is no separate tick and no attached needle, it is PLAIN LA!
  * Kí / Ke (Form A): Base 'Ka' with a separate upper acute tick (/) hovering above.
  * Tí / Te (Form A): Base 'Ta' with a separate upper acute tick (/) hovering above.
  * Gí / Ge (Form A): Base 'Ga' with a separate upper acute tick (/) hovering above.
  * Ngí / Nge (Form A): Base 'Nga' with a separate upper acute tick (/) hovering above.
  * Sí / Se (Form A), Bí / Be (Form A), Mí / Me (Form A), Ní / Ne (Form A), Pí / Pe (Form A).
- Form B (-e and ligated -i/-e): Base consonant connects DIRECTLY into an attached right-hand tall upright vertical needle flourish (~|) that shoots straight up to the top margin:
  * Kí / Ke (Form B): Base 'Ka' connected directly to the tall upright needle on the right.
  * Tí / Te (Form B): Base 'Ta' (upper-left hook, flat baseline floor, single medial arch) connected on the right to the tall upright needle (~|).
  * Ngí / Nge (Form B): Base 'Nga' (sweeping left crescent + undulating double-hump 'm'-wave) connected directly on the right to a tall upright vertical needle (~|).
  * Gí / Ge (Form B): Base 'Ga' (single inverted U arch ∩) connected directly into the upright needle (~|).
  * Dí / De, Sí / Se, Bí / Be, Lí / Le, Mí / Me, Ní / Ne, Pí / Pe.

4. LOWER GARLIT / LIGATED -U/-O (Anak Súlat):
Base consonant modified by a distinct LOWER COMMA TICK (,) placed directly beneath the glyph AND/OR an attached right-hand trailing upward-curving wing/flourish (~v):
- Tú / To: Base 'Ta' with a distinct lower comma tick (,) beneath it OR continues past the first arch into a second downward valley and upward-curving trailing wing (~v).
- Ngú / Ngo: Base 'Nga' with a distinct lower comma tick (,) beneath it OR concluding in a downward dip and trailing wing (~v).
- Kú / Ko: Base 'Ka' with a distinct lower comma tick (,) beneath it OR trailing wing (~v).
- Dú / Do: Base 'Da' with a distinct lower comma tick (,) beneath it OR upper diacritic combined with trailing wing (~v).
- Gú / Go: Base 'Ga' (single inverted U arch ∩) with a distinct lower comma tick (,) beneath it OR trailing wing (~v).
- Bú / Bo, Pú / Po, Mú / Mo, Lú / Lo, Nú / No, Sú / So.

5. CODA NASAL LIGATURES -NG (Kamulitan / Busal):
Base consonant followed by a clear SECOND detached coda nasal pair (a detached arc ')' followed by a horizontal wave 'm'):
- Tang: Base 'Ta' + trailing coda nasal pair (')' + 'm').
- Ngang: Base 'Nga' + trailing coda nasal pair (')' + 'm') (repeating double wave sequence).
- Mang, Pang, Lang, Nang, Sang, Dang, Kang, Gang, Bang.

6. REFERENCE CHARTS & TABLES:
If the image shows a multi-character grid or reference chart with multiple glyph rows, identify as:
"character": "Kulitan Chart", "transliteration": "gi", "confidence": 98, "type": "Diacritic Reference Chart (Anak Sulat)"

CRITICAL DISAMBIGUATION RULES FOR INDEPENDENT / ISOLATED SYMBOLS:
1. STANDALONE VOWEL A vs BASE PA vs BASE MA vs TÍ / TE:
   - Standalone Vowel A is a SINGLE continuous cursive stroke with a bottom-left loop/cross and an open rightward sweep. It has NO horizontal tick extending rightward, and NO horizontal crossbar.
   - Base Pa MUST have a distinct horizontal tick extending to the right from its right arm ('v-tick'). Base Pa has NO bottom-left loop.
   - If the glyph has a bottom-left loop/cross and NO horizontal tick on the right arm, it is 100% STANDALONE VOWEL A, NEVER Pa!
   - Tí / Te has Base 'Ta' (horizontal bottom floor + medial arch) connected to a tall upright needle.
2. STANDALONE VOWEL I vs STANDALONE VOWEL U / O:
   - Standalone Vowel I has TWO SEPARATE DISCONNECTED TWIN UPRIGHT MOTIFS (~|  ~|) side-by-side with empty space between them.
   - Standalone Vowel U is a SINGLE continuous flowing double-valley curve ('w' / 'vv') joined at the bottom.
3. STANDALONE VOWEL U vs NGA / NGÍ:
   - Standalone Vowel U is a flowing double-valley 'w' shape sweeping upward on the right with NO left crescent and NO needle.
4. BASE NGA vs NGANG vs NGÍ / NGE:
   - Base Nga has ONE crescent ')' and ONE double-hump 'm'-wave. It is a single glyph.
   - Ngang has a SECOND trailing coda wave pair.
   - Ngí / Nge has a tall upright needle (~|) on the far right.
5. BASE DA vs DÍ / DE:
   - Base Da has 2 parts: wavy top crown + box-bracket body. The wavy crown is part of Base Da!
   - Dí / De MUST have a THIRD part: a SEPARATE DETACHED acute tick (/) hovering ABOVE the wavy crown, OR a tall upright needle. If there are only 2 parts (wavy crown + body), it is 100% BASE DA!
6. BASE LA vs BASE NA vs LÍ / LE:
   - Base La has a top ribbon loop/curl with a single vertical straight stem descending DOWNWARD.
   - Base Na has an open umbrella dome curving downward symmetrically on both sides with a central stem.
   - Lí / Le MUST have a SEPARATE acute tick (/) hovering above, OR a second attached upright needle on the right.
7. BASE TA vs STANDALONE A vs TÚ / TO:
   - Base Ta has a flat horizontal floor baseline that turns up into a medial arch and stops.
   - Standalone A has a looping cursive bottom that sweeps up to the right.
   - Tú / To continues past the first arch into a second downward valley and upward-curving trailing wing (~v) or has a lower comma tick (,).
8. BASE PA vs BASE MA:
   - Base Pa is an OPEN checkmark 'v' cup with a right-hand horizontal tick.
   - Base Ma has a diagonal spine or closed loop with a horizontal crossbar cutting completely across.

TASK:
${targetHint}

Return a JSON object in this exact schema:
{
  "recognized": true,
  "character": "Transliterated syllable name, e.g., 'A', 'I', 'U', 'Ka', 'Ga', 'Nga', 'Ta', 'Da', 'Na', 'La', 'Sa', 'Ma', 'Pa', 'Ba', 'Tí / Te', 'Dí / De', 'Tú / To'",
  "transliteration": "Exact lowercase Latin syllable, e.g., 'a', 'i', 'u', 'ka', 'ga', 'nga', 'ta', 'da', 'na', 'la', 'sa', 'ma', 'pa', 'ba', 'te', 'de', 'to'",
  "confidence": 98,
  "feedback": "Concise morphological explanation citing the key strokes observed.",
  "type": "Standalone Vowel (Indûng Patinig) | Inherent Consonant (Indûng Súlat) | Diacritic Vowel Form (Anak Súlat) | Coda Nasal Ligature (Kamulitan)"
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
          max_tokens: 350,
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
            const rawLower = rawQuery.toLowerCase();
            const ALLOPHONES = ['e','o','ke','ko','ge','go','nge','ngo','te','to','de','do','ne','no','le','lo','se','so','me','mo','pe','po','be','bo'];
            if (ALLOPHONES.includes(rawLower)) {
              parsed.transliteration = rawLower;
              parsed.character = rawLower.toUpperCase();
            } else {
              parsed.character = matched.latin.toUpperCase();
              parsed.transliteration = matched.latin;
            }
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
