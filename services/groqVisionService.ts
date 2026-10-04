import { kulitanSyllables } from '../data/kulitanData';
import { normalizeKulitanSyllable } from '../data/kulitanDatasetExemplars';
import { ScanResult } from '../utils/kulitanClassifier';

// Groq Vision models supporting multimodal image chat completions
const GROQ_VISION_MODELS = [
  'qwen/qwen3.8-27b',
];

import { getEffectiveGroqKeys, isValidGroqKey, PRIMARY_GROQ_KEY } from './apiKeyPool';
export { isValidGroqKey };
export const DEFAULT_GROQ_KEY = PRIMARY_GROQ_KEY;

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
- In Kulitan, 'Ta' is an upper-left hook curving into an extended flat horizontal baseline floor and medial arch.
- In Kulitan, 'Na' is an umbrella dome with a straight downward central vertical stem. It is NOT Nga.
- In Kulitan, 'Nga' is a left crescent ')' + horizontal 'm' wave arch curving DOWNWARD (∩). In contrast, Standalone 'U/O' is an isolated double-valley wave ('w') sweeping UPWARD (∪) into the air.

STRICT INSTRUCTION ON INDEPENDENT / ISOLATED SYMBOL RECOGNITION:
The image contains an isolated Kulitan character, handwriting sample, or crop.
There is NO English or Latin text accompanying the symbol. The symbol is COMPLETELY INDEPENDENT.
You must identify the character SOLELY and PURELY by analyzing its stroke morphology according to the rules below.

=======================================================
EXPERT DECODING WORKFLOW:
=======================================================

1. CHECK FOR STANDALONE VOWELS (Indûng Patinig - NO Base Consonant on the left):
   - STANDALONE A (transliteration: "a"): A single continuous cursive stroke with a hook at top-left, crossing itself at the lower-left to form an 'alpha' (α) or cursive 2 loop, sweeping up into an open right wing. It has ONLY ONE valley trough with a lower-left crossing. NO horizontal crossbar! If the stroke crosses at the bottom-left and has NO horizontal crossbar, it is 100% STANDALONE VOWEL A ("a"), NEVER U/O and NEVER Pa!
   - STANDALONE I / E (transliteration: "i" or "e"): Two identical twin components side-by-side (~|  ~|), each ending in a tall vertical upright needle stem shooting straight up with white space between them.
   - STANDALONE U / O (transliteration: "u" or "o"): An isolated single continuous flowing 'w' / 'vv' double-valley wave consisting of TWO connected rounded valley troughs along the baseline sweeping upward on the right into a terminal wing. It has NO preceding base consonant on the left, NO vertical hook, and NO internal tick!

2. IDENTIFY THE BASE CONSONANT (Indûng Súlat - on the left if compound):
   1. BA: Closed oval circle (O).
   2. DA: Angular box-bracket body [ with a distinct separate wavy tilde crown (~) hovering above its ceiling bar. (CRITICAL: Any glyph with a wavy tilde crown ~ is BASE DA: Da, De/Di, Do/Du, Dang!).
   3. GA: INVERTED U-arch (∩), rounded dome at TOP, two vertical legs pointing DOWN. Open at bottom. (CRITICAL: Ga is inverted ∩, NOT an upright cup!).
   4. KA: Two horizontal parallel bars (=).
   5. LA: Vertical downward straight stem (↓) with a top horizontal bar that has an integral CLOSED LOOP / EYELET on the right side and an upward-curving left wing. (CRITICAL: Vertical stem + top-right eyelet = BASE LA: La, Le/Li, Lo/Lu, Lang! The top-right eyelet is PART of Base La, NOT an acute tick!).
   6. MA: Loop or slash crossed completely by a HORIZONTAL CROSSBAR (—) that clearly extends PAST the outer left wall. (CRITICAL: Horizontal crossbar cutting through = BASE MA: Ma, Me/Mi, Mo/Mu, Mang!).
   7. NA: Symmetrical umbrella canopy dome (⌢) that curves down symmetrically on BOTH sides with a single straight downward central vertical stem. It has NO loop, NO eyelet, and NO crossbar.
   8. NGA: Left downward crescent ')' + single undulating 'm' wave arch.
   9. PA: UPRIGHT curved cup (∪), rounded floor at BOTTOM, open on TOP with arms pointing UP, and an internal horizontal tick on the inside of the right arm. Smooth unbroken outer left wall. (CRITICAL: Upright cup ∪ with internal tick = BASE PA: Pa, Pe/Pi, Po/Pu, Pang! It is the vertical opposite of inverted arch ∩ Ga!).
   10. SA: '3' numeral shape with two rounded lobes.
   11. TA: Upper-left hook dropping down vertically into an extended FLAT HORIZONTAL BASELINE FLOOR and medial arch. (NO wavy crown ~, NO box frame, NOT an upright cup).

3. IDENTIFY THE VOWEL MODIFIER OR CODA (Right / Diacritic Elements):
   A. VOWEL -E / -I:
      If the base consonant is accompanied by EITHER:
      1) A detached acute tick (/) hovering above, OR
      2) An attached cursive ligature on the right ending in a TALL VERTICAL UPRIGHT ASCENDER STEM (~| or ~J) shooting straight up to the top, OR
      3) Both tick and ascender stem.
      -> 100% VOWEL -E / -I: Ge/Gi, Ke/Ki, Te/Ti, De/Di, Ne/Ni, Le/Li, Me/Mi, Be/Bi, Se/Si, Pe/Pi, Nge/Ngi.
      * Base La + (-e/-i mark) -> LE / LI ('le' or 'li')
      * Base Pa + (-e/-i mark) -> PE / PI ('pe' or 'pi')
      * Base Ta + (-e/-i mark) -> TE / TI ('te' or 'ti')
      * Base Da + (-e/-i mark) -> DE / DI ('de' or 'di')
      * Base Nga + (-e/-i mark) -> NGE / NGI ('nge' or 'ngi')
      * Base Ka + (-e/-i mark) -> KE / KI ('ke' or 'ki')
      * Base Ga + (-e/-i mark) -> GE / GI ('ge' or 'gi')
      * Base Na + (-e/-i mark) -> NE / NI ('ne' or 'ni')
      * Base Ma + (-e/-i mark) -> ME / MI ('me' or 'mi')
      * Base Ba + (-e/-i mark) -> BE / BI ('be' or 'bi')
      * Base Sa + (-e/-i mark) -> SE / SI ('se' or 'si')

   B. VOWEL -O / -U:
      If the base consonant is accompanied by EITHER:
      1) A detached comma tick (,) beneath/lower-left of the base consonant, OR
      2) An attached cursive ligature on the right forming a CURVED VALLEY HOOK (~v) dipping along the baseline, OR
      3) Both tick and valley hook.
      -> 100% VOWEL -O / -U: Go/Gu, Ko/Ku, To/Tu, Do/Du, No/Nu, Lo/Lu, Mo/Mu, Bo/Bu, So/Su, Po/Pu, Ngo/Ngu.
      * Base La + (-o/-u mark) -> LO / LU ('lo' or 'lu')
      * Base Pa + (-o/-u mark) -> PO / PU ('po' or 'pu')
      * Base Ta + (-o/-u mark) -> TO / TU ('to' or 'tu')
      * Base Da + (-o/-u mark) -> DO / DU ('do' or 'du')
      * Base Nga + (-o/-u mark) -> NGO / NGU ('ngo' or 'ngu')
      * Base Ka + (-o/-u mark) -> KO / KU ('ko' or 'ku')
      * Base Ga + (-o/-u mark) -> GO / GU ('go' or 'gu')
      * Base Na + (-o/-u mark) -> NO / NU ('no' or 'nu')
      * Base Ma + (-o/-u mark) -> MO / MU ('mo' or 'mu')
      * Base Ba + (-o/-u mark) -> BO / BU ('bo' or 'bu')
      * Base Sa + (-o/-u mark) -> SO / SU ('so' or 'su')

   C. CODA NASAL LIGATURE (-ng / Kamulitan):
      The base consonant on the left is followed on the right by the authentic two-part coda wave pair: a distinct downward crescent arc ')' PLUS undulating 'm' wave along the baseline (')m'):
      * Tang: Base Ta (hook + flat floor) + ')m'
      * Dang: Base Da (wavy crown ~ over box) + ')m'
      * Nang: Base Na (umbrella dome) + ')m'
      * Lang: Base La (vertical stem + eyelet) + ')m'
      * Bang: Base Ba (circle O) + ')m'
      * Sang: Base Sa ('3' shape) + ')m'
      * Pang: Base Pa (upright cup ∪ with internal tick) + ')m'
      * Mang: Base Ma (loop with crossbar) + ')m'
      * Kang: Base Ka (parallel bars) + ')m'
      * Gang: Base Ga (inverted arch ∩) + ')m'
      * Ngang: Two repeating horizontal wave pairs along baseline (')m )m').
      CRITICAL: If a base consonant is on the left followed by ')m', it is 100% a CODA NASAL LIGATURE (-ng: Tang, Dang, Nang, Lang, etc.), NEVER plain Base Nga!

   D. INHERENT VOWEL -A (Indûng Súlat):
      If NO coda nasal, NO upper/lower ticks, and NO attached ligatures are present:
      -> Plain inherent consonant with vowel /a/: Ba, Da, Ga, Ka, La, Ma, Na, Nga, Pa, Sa, Ta.

=======================================================
CRITICAL DISAMBIGUATION RULES:
=======================================================
1. STANDALONE VOWEL A vs BASE PA vs STANDALONE U/O:
   - Standalone Vowel A is a cursive stroke with a DISTINCT LOOP or CROSSING at the LOWER-LEFT (resembling 'α' or '2') and sweeping up on the right. It has NO horizontal crossbar and NO rightward tick. If it loops/crosses at the lower-left, it is 100% STANDALONE VOWEL A ("a"), NEVER Pa and NEVER U/O!
   - Base Pa is an open cup where the left arm is completely open with NO bottom-left loop/crossing, and the right arm has a distinct internal horizontal tick.
2. BASE LA vs BASE NA:
   - In Base La (and Lí/Le, Lú/Lo, Lang): The top horizontal stroke sitting on the vertical downward stem has an ASYMMETRICAL CLOSED LOOP OR EYELET on the right side.
   - In Base Na (and Ní/Ne, Nú/No, Nang): The top dome curves symmetrically DOWNWARD on both sides like an umbrella (⌢). It has NO loop and NO eyelet on either side.
3. BASE GA vs BASE PA:
   - BASE GA is an INVERTED U-arch (∩): The rounded dome is at the TOP, and the two vertical legs point DOWNWARD. The bottom is open.
   - BASE PA is an UPRIGHT cup (∪): The rounded curve is at the BOTTOM, and the two vertical arms point UPWARD. The top is open, with an internal horizontal tick on the right arm.
   - They are VERTICAL OPPOSITES: ∩ (Ga) vs ∪ (Pa)!
4. BASE DA vs BASE TA:
   - Base Da has TWO elements: a separate wavy crown tilde (~) hovering above an angular box-bracket body [ with a horizontal ceiling bar. If there is a detached comma tick (,) beneath the bracket on the lower-left -> 100% DÚ / DO ("du" or "do")! It has a wavy crown on top, so it is DA, NEVER TA!
   - Base Ta is ONE continuous cursive stroke: hook + flat bottom floor + medial arch. It has NO separate wavy crown on top and NO ceiling bar.
5. BASE KA vs KÚ / KO:
   - In Base Ka, there are only 2 horizontal parallel bars.
   - If there is a THIRD mark: a detached lower comma tick (,) or stroke positioned beneath the two parallel bars on the lower-left -> 100% KÚ / KO ("ku" or "ko")!
6. BASE LA with TICKS & LIGATURES (Lú/Lo vs Lí/Le):
   - The vertical downward stem on the left with a top-right loop/eyelet is Base La.
   - If there is an ACUTE TICK (/) hovering distinctly ABOVE the top-right loop, OR an attached tall vertical ascender stem rising on the far right -> 100% LÍ / LE ("li" or "le")!
   - If there is a COMMA TICK (,) sitting BENEATH the downward stem at the bottom-left, OR an attached valley hook along the baseline -> 100% LÚ / LO ("lu" or "lo")! (It is NOT Ta; Ta has no vertical downward stem with a top loop/eyelet).
7. THE NGA FAMILY:
   - Base Nga has a left crescent ')' + 'm' arch. Note that the left crescent naturally swoops down at the lower-left; this is part of Nga and is NOT a valley hook!
   - If Base Nga has an upper acute tick (/) hovering distinctly ABOVE the top of the 'm' arch, OR an attached tall upright ascender (~|) on the far right -> 100% NGÍ / NGE ("ngi" or "nge")! (Do NOT mistake crescent tails or baseline connections as a valley hook when an upper acute tick or right ascender is present!).
   - If Base Nga has an attached curved valley hook (~v) on the far right dipping along the baseline, OR a detached lower comma tick (,) beneath the arch (with NO upper acute tick and NO right ascender) -> 100% NGÚ / NGO ("ngu" or "ngo")!
   - If Base Nga has a full second repeating wave pair (')m) with NO ticks -> 100% NGANG ("ngang")!
   - ONLY if Base Nga has exactly 1 crescent and 1 arch with NO ticks and NO ligatures -> 100% plain BASE NGA ("nga")!
8. ATTACHED LIGATURES vs STANDALONE U/O (Tú/To, Pú/Po, Lú/Lo, Ngú/Ngo):
   - PÚ / PO ('pu' or 'po'): In cursive form, the left body is Base Pa with an upright cup that connects at the bottom-left into a closed teardrop loop (resembling cursive 'p'), followed by an attached valley hook on the far right. If the left body has a bottom closed loop -> 100% PÚ / PO ('pu' or 'po')! (NEVER Tú/To, because Base Ta has NO bottom loop).
   - TÚ / TO ('tu' or 'to'): The left body is Base Ta starting at the top-left with an upper-left hook that drops into a straight vertical stem and connects via an extended flat horizontal baseline floor to the medial arch, and the lowest point dips at the bottom-right valley hook. It has NO bottom-left loop (unlike Pa) and NO top eyelet on a downward stem (unlike La). Ta with attached valley hook is 100% TÚ / TO ('tu' or 'to')! (NEVER Standalone U/O!).
   - STANDALONE U/O: Pure symmetrical cursive 'w' where the highest stroke is on the FAR RIGHT and the lowest stroke curls at the FAR LEFT. It has NO upper-left hook, NO flat baseline floor, and NO bottom-left closed loop.
   - LÚ / LO ('lu' or 'lo'): Left side has a vertical stem with top eyelet (Base La) followed by a valley hook -> 100% LÚ / LO ("lu" or "lo")! (NEVER Standalone U/O).

TASK:
${targetHint}

Return a JSON object in this exact schema:
{
  "recognized": true,
  "character": "Transliterated syllable name, e.g., 'A', 'I', 'U', 'Ka', 'Ga', 'Nga', 'Ta', 'Da', 'Na', 'La', 'Sa', 'Ma', 'Pa', 'Ba', 'Kí / Ke', 'Bú / Bo', 'Tang', 'Dang', 'Lo / Lu', 'To / Tu'",
  "transliteration": "Exact lowercase Latin syllable, e.g., 'a', 'i', 'u', 'ka', 'ga', 'nga', 'ta', 'da', 'na', 'la', 'sa', 'ma', 'pa', 'ba', 'ke', 'bo', 'tang', 'dang', 'lo', 'to'",
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
  const candidateKeys = getEffectiveGroqKeys(apiKey);
  if (candidateKeys.length === 0) {
    return null;
  }

  const prompt = getKulitanVisionPrompt(targetSyllable);

  for (const currentKey of candidateKeys) {
    for (const model of GROQ_VISION_MODELS) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second timeout

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentKey}`,
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
          console.warn(`Groq Vision API model ${model} with key ${currentKey.slice(0, 10)}... returned error status ${response.status}:`, errorText);
          if (response.status === 429) {
            // Hit rate limit on this key, try next key in pool
            break;
          }
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
  }

  return null;
}
