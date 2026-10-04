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

CRITICAL SCRIPT CONTEXT:
This is authentic SULAT KAPAMPANGAN (KULITAN) from Pampanga, Philippines.
It is NOT Tagalog Baybayin, NOT Sinhala, NOT Burmese, and NOT Arabic!
- In Kulitan, 'Ba' is ALWAYS a closed oval circle (O).
- In Kulitan, 'Ta' is an upper-left hook curving into a flat horizontal floor and medial arch. Do NOT mistake Kulitan 'Ta' for Tagalog Baybayin 'Ba' (ᜊ) or Sinhala!
- In Kulitan, the trailing wave pair ')m' is the Kamulitan (-ng) coda.
- In Kulitan, 'Na' is an umbrella dome with a straight downward central vertical stem. It is NOT Nga.
- In Kulitan, 'Nga' is a left crescent ')' + horizontal 'm' wave.

STRICT INSTRUCTION ON INDEPENDENT / ISOLATED SYMBOL RECOGNITION:
The image contains an isolated Kulitan character, handwriting sample, or crop.
There is NO English or Latin text accompanying the symbol. The symbol is COMPLETELY INDEPENDENT.
You must identify the character SOLELY and PURELY by analyzing its stroke morphology, curves, stem orientation, diacritic ticks, and attached ligatures according to the morphology key below.

=======================================================
EXPERT DECODING WORKFLOW (Follow in this exact order):
=======================================================
Phase 1: STANDALONE VOWELS (Indûng Patinig)
Check if the glyph is an independent standalone vowel:
- STANDALONE I (transliteration: "i" or "e"): 
  Look at the two components side-by-side: Each component consists of a rounded loop/arch on the left connected to a TALL VERTICAL UPRIGHT ASCENDER STEM on the right that shoots straight up to the top of the glyph (~|  ~|).
  The two vertical stems rise tall like two upright needles side-by-side with empty white space between them.
  DO NOT CONFUSE WITH NGANG: In Ngang, the strokes are horizontal undulating waves along the baseline with ZERO vertical ascenders. In Standalone I, the two tall vertical upright stems dominate the glyph. If you see two components each having a tall vertical upward stem shooting to the top, it is 100% STANDALONE VOWEL I ("i" or "e"), NEVER Ngang!
- STANDALONE A (transliteration: "a"): A single continuous cursive stroke with a hook at the top-left, forming a loop or crossing at the LOWER-LEFT (like a cursive 'alpha' α or numeral '2' with a base loop), sweeping up into an open right wing. If it has a loop/crossing at the lower-left, it is 100% STANDALONE VOWEL A, NEVER Pa!
- STANDALONE U / O (transliteration: "u" or "o"): A continuous flowing 'w' / 'vv' double-valley wave JOINED AT THE BOTTOM by a continuous curved baseline.

Phase 2: CODA NASAL LIGATURES (Kamulitan -ng)
Check if the image contains a base consonant on the left followed by the coda nasal wave pair (')' arc + undulating 'm' wave) on the right:
- GANG: An INVERTED U-ARCH (∩) on the left + coda wave pair ')m' on the right (transliteration: "gang", NEVER Ngang!).
- KANG: Two horizontal parallel bars on the left + ')m' on the right (transliteration: "kang").
- TANG: Base Ta on the left (upper-left vertical hook dropping into an extended flat baseline floor) connected to the coda wave pair ')m' on the right (transliteration: "tang", NEVER Nga!). CRITICAL: Tang is a wide compound ligature consisting of TWO parts: Base Ta on the left PLUS the wave on the right. Plain Nga is only a single wave.
- DANG: Base Da (box body + wavy top crown) on the left + ')m' on the right (transliteration: "dang").
- NANG: Base Na (symmetrical umbrella dome) on the left + ')m' on the right (transliteration: "nang").
- LANG: Base La (vertical stem + top loop) on the left + ')m' on the right (transliteration: "lang", NEVER Standalone I!).
- BANG: Closed oval circle (O) on the left + ')m' on the right (transliteration: "bang").
- SANG: '3' numeral shape on the left + ')m' on the right (transliteration: "sang").
- PANG: Base Pa (open 'U' cup with a smooth, unbroken left wall, and a horizontal tick only on the inside/right arm) + ')m' on the right (transliteration: "pang", NEVER Mang!).
- MANG: Base Ma (horizontal crossbar cutting completely through both walls and clearly protruding past the left outer wall) + ')m' on the right (transliteration: "mang").
- NGANG: An elongated compound ligature consisting of two repeating horizontal wave pairs along the baseline. It has NO tall vertical upright ascenders. If the glyph has tall vertical ascenders pointing straight up, it is Standalone I, NOT Ngang!

Phase 3: THE NGA FAMILY (Single Wave Pair ')m')
If the image contains ONLY ONE single wave pair ')m' (compact, NOT doubled in width):
- If there is an upper acute tick (/) hovering above the right hump -> 100% NGÍ / NGE (transliteration: "ngi" or "nge", NEVER Ngang!)
- If there is a lower comma tick (,) beneath it -> 100% NGÚ / NGO (transliteration: "ngu" or "ngo", NEVER Ngang!)
- If there are NO ticks -> 100% plain BASE NGA (transliteration: "nga", NEVER Ngang!). A single compact ')m' glyph with no ticks is 100% BASE NGA!

Phase 4: DIACRITIC VOWEL FORMS (Anak Súlat)
A. LOWER DIACRITIC TICK (Anak Súlat -u / -o):
   - Look beneath or at the lower-left of the base glyph for a SEPARATE DETACHED COMMA TICK (,):
     * BASE LA with lower tick (Lú / Lo): The base is a vertical downward stem with a TOP CROSSBAR that has a CLOSED LOOP / EYELET on the right side and an upward-curving left wing. With the lower tick (,), it is 100% LÚ / LO (transliteration: "lu" or "lo", NEVER Nú / No!).
     * BASE NA with lower tick (Nú / No): The base is an umbrella dome that curves symmetrically DOWNWARD on both sides (convex ⌢) with NO loop at the top-right. With the lower tick (,), it is 100% NÚ / NO (transliteration: "nu" or "no").
     * BASE TA with lower tick (Tú / To): The base is Base Ta, which has an upper-left hook dropping down to a FLAT HORIZONTAL BASELINE FLOOR and medial arch (it is NOT a closed circle O!). With the lower comma tick (,) at the lower-left, it is 100% TÚ / TO (transliteration: "tu" or "to", NEVER Bú / Bo!). Do not mistake the hook and flat floor of Base Ta for a closed oval circle!
     * Ka (two bars) + lower tick -> Kú / Ko ("ku" or "ko")
     * Ga (inverted U-arch ∩) + lower tick -> Gú / Go ("gu" or "go")
     * Da (wavy crown + box body) + lower tick -> Dú / Do ("du" or "do")
     * Ma (loop + crossbar) + lower tick -> Mú / Mo ("mu" or "mo")
     * Pa (open cup + right tick) + lower tick -> Pú / Po ("pu" or "po")
     * Ba (closed circle O) + lower tick -> Bú / Bo ("bu" or "bo")
     * Sa ('3' shape) + lower tick -> Sú / So ("su" or "so")

B. UPPER DIACRITIC TICK (Anak Súlat -i / -e):
   - Look ABOVE the glyph for a SEPARATE DETACHED ACUTE TICK (/):
     * BASE TA with upper tick (Tí / Te): Base Ta has an upper-left hook dropping into a FLAT ELONGATED HORIZONTAL BASELINE FLOOR. Hovering above is an acute tick (/). It is 100% TÍ / TE (transliteration: "ti" or "te", NEVER Pí / Pe and NEVER Dí / De!). Notice that Base Ta has a flat horizontal bottom floor, whereas Base Pa is an open curved cup.
     * BASE PA with upper tick (Pí / Pe): Base Pa is an open checkmark 'v' / 'U' cup with a horizontal tick on the right arm, plus an upper acute tick (/) above.
     * BASE LA with upper tick (Lí / Le): Vertical stem + top bar with right loop/eyelet + acute tick (/) resting on or hovering above the top-right loop. It is 100% LÍ / LE (transliteration: "li" or "le", NEVER Na and NEVER Ni!).
     * Ka + upper tick -> Kí / Ke ("ki" or "ke")
     * Ga (inverted U-arch ∩) + upper tick -> Gí / Ge ("gi" or "ge")
     * Da (box body + wavy top) + third mark (acute tick above wavy crown) -> Dí / De ("di" or "de")
     * Na (symmetrical umbrella dome) + upper tick -> Ní / Ne ("ni" or "ne")
     * Ma (loop + crossbar) + upper tick -> Mí / Me ("mi" or "me")
     * Ba (closed circle O) + upper tick -> Bí / Be ("bi" or "be")
     * Sa ('3' shape) + upper tick -> Sí / Se ("si" or "se")

Phase 5: PLAIN INHERENT CONSONANTS (Indûng Súlat - vowel /a/)
If NO Coda Nasal and NO Diacritic Ticks are present:
- Ba: closed oval circle O
- Da: wavy top crown (~) resting above the box bracket body.
- Ga: single smooth inverted U-arch ∩, open bottom.
- Ka: two horizontal parallel bars.
- La: vertical downward stem with a top crossbar where the left side curves upward and the right side has a loop/eyelet.
- Ma: diagonal loop or slash crossed completely by a HORIZONTAL CROSSBAR (—).
- Na: umbrella canopy dome curving down symmetrically on both sides with a central straight downward stem (⌢ with central vertical stem ↓).
- Nga: exactly 1 left downward crescent ')' + 1 undulating 'm' wave.
- Pa: open 'v' checkmark cup with a horizontal tick on the right arm.
- Sa: '3' numeral shape with two rounded loops.
- Ta: upper-left hook dropping into a FLAT ELONGATED HORIZONTAL BASELINE FLOOR and medial arch.

=======================================================
CRITICAL DISAMBIGUATION RULES:
=======================================================
1. STANDALONE VOWEL A vs BASE PA:
   - Standalone Vowel A is a cursive stroke with a DISTINCT LOOP or CROSSING at the LOWER-LEFT (resembling 'α' or '2') and sweeping up on the right. It has NO horizontal tick on the right arm and NO crossbar. If it loops at the lower-left, it is 100% STANDALONE VOWEL A ("a"), NEVER Pa!
   - Base Pa is an open cup where the left arm is completely open with NO bottom-left loop, and the right arm has a distinct horizontal tick protruding to the right.
2. BASE LA / LÍ / LÚ vs BASE NA / NÍ / NÚ:
   - In Base La (and its vowel forms Lí / Le and Lú / Lo): The top horizontal stroke sitting on the vertical downward stem has a distinct CLOSED LOOP OR EYELET on the right side.
     * If there is an ACUTE TICK (/) on or above the top-right loop -> It is 100% LÍ / LE ("li" or "le"), NEVER Na and NEVER Ni!
     * If there is a LOWER COMMA TICK (,) at the lower-left -> It is 100% LÚ / LO ("lu" or "lo"), NEVER Nú / No! (Base Na NEVER has a closed loop/eyelet at the top-right!).
     * If there are no ticks -> It is 100% BASE LA ("la").
   - In Base Na (and Nú / No): The top dome curves symmetrically DOWNWARD on both sides like an umbrella (⌢). It has NO loop and NO eyelet on either side.
3. NGÍ / NGE and NGÚ / NGO vs NGANG:
   - Base Nga has ONLY ONE single wave pair ')m'.
   - If there is an acute tick hovering above the single ')m', it is 100% NGÍ / NGE ("ngi" or "nge"), NEVER Ngang!
   - If there is a comma tick hovering below the single ')m', it is 100% NGÚ / NGO ("ngu" or "ngo"), NEVER Ngang!
   - Ngang MUST have TWO DISTINCT, SEPARATE repeating wave pairs side-by-side: ')m )m'.
4. PANG vs MANG:
   - In PANG ('pang'): The left base character is Base Pa. It has an open cup where the left stem curves smoothly down, and a short horizontal tick/line extends RIGHTWARD into the cup from the stem. It does NOT protrude to the left of the left stem. Followed by the coda pair ')m', it is 100% PANG ("pang"), NEVER Mang!
   - In MANG ('mang'): The horizontal crossbar cuts completely through and across BOTH the left and right walls of the loop, projecting outward past the outer left edge. If the horizontal segment only extends rightward into the cup and does not protrude past the left edge, it is 100% PANG ("pang")!
5. BASE DA vs BASE TA:
   - Base Da has TWO elements: a separate wavy crown tilde (~) resting above an angular box-bracket body with a horizontal ceiling bar.
   - Base Ta is ONE continuous cursive stroke: hook + flat bottom floor + medial arch. It has NO separate wavy crown on top and NO ceiling bar.
6. BASE MA vs STANDALONE A:
   - Base Ma has a distinct horizontal crossbar cutting through the loop. It is 100% BASE MA ("ma")!
   - Standalone A has NO crossbar.
7. KÚ / KO vs KA:
   - In Base Ka, there are only 2 horizontal parallel bars.
   - In Kú / Ko, there is a THIRD mark: a lower comma tick (,) clearly positioned beneath the two parallel bars on the lower-left.

TASK:
${targetHint}

Return a JSON object in this exact schema:
{
  "recognized": true,
  "character": "Transliterated syllable name, e.g., 'A', 'I', 'U', 'Ka', 'Ga', 'Nga', 'Ta', 'Da', 'Na', 'La', 'Sa', 'Ma', 'Pa', 'Ba', 'Kí / Ke', 'Bú / Bo', 'Tang', 'Dang'",
  "transliteration": "Exact lowercase Latin syllable, e.g., 'a', 'i', 'u', 'ka', 'ga', 'nga', 'ta', 'da', 'na', 'la', 'sa', 'ma', 'pa', 'ba', 'ke', 'bo', 'tang', 'dang'",
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
