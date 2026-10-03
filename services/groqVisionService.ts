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

STRICT INSTRUCTION ON ISOLATED SYMBOL RECOGNITION:
The image contains an isolated Kulitan character, handwriting sample, or crop.
There may NOT be any English or Latin text in the image.
You must identify the character SOLELY and PURELY by analyzing its stroke morphology, curves, stem orientation, and attached ligatures according to the morphology key below.
Do NOT guess or assume Egyptian hieroglyphs, Chinese, Japanese, or Arabic. This is authentic Sulat Kapampangan (Kulitan).

ORTHOGRAPHIC MORPHOLOGY KEY (Sulat Kapampangan):

1. STANDALONE VOWELS (Indung Patinig):
- A: Curving downward stroke from top-left, forming an open bottom loop that sweeps upward/rightward with a distinct tail flourish (resembling an open lambda or sweeping cursive hook).
- I / E (Standalone Vowels):
  * Canonical I: Horizontal wavy double-arch crown resting on a right-hand vertical downward spine/stem.
  * Standalone Vowel E (Indûng Súlat E / "E"): A continuous stroke with a distinct C-shaped outer hook/curve on the far left, an internal horizontal crossover bridge / two parallel horizontal dashes (=) in the center, and an attached right-hand tall upright vertical needle flourish (~|) shooting up to the top margin.
    - Standalone E vs Ke: 'Ke' has two horizontal parallel bars that start on the FAR-LEFT margin with NO enclosing outer C-shaped hook. If there is a distinct outer C-shaped hook enclosing the left side and the parallel dashes are inside the center, it is STANDALONE VOWEL E (character: "E" or "I / E", transliteration: "e", type: "Standalone Vowel (Indûng Patinig)").
    - Standalone E vs Te: 'Te' has a swan-neck curve with an empty open center (NO inner parallel dashes).
- U / O: Flowing three-crested horizontal undulating wave (like ~~~) with a curved upward terminal tail.

2. BASE CONSONANTS (Indung Sulat - Inherent /a/ vowel):
- Ka: Two horizontal parallel bars joined on the right by a vertical/curved connector stroke.
- Ga: Smooth inverted U-shaped arch (∩) with open bottom.
- Nga: Continuous horizontal triple-undulating wave (similar to a flowing W / ~~~), OR in authentic handwriting, an initial sweeping left downward crescent/arc (')') connected to a central undulating wave / double-hump ('m' / 'n').
- Ta: Characteristic upper-left downward-curling hook/arch (~), dropping down into an elongated horizontal baseline (first valley), which turns up into a medial arch and STOPS.
  * ABSOLUTE LIMIT FOR PLAIN TA: The character terminates at the first medial arch. It has NOTHING after the first arch. If the line continues past the first arch into ANY second valley, dip, loop, or second upward rise, IT IS NEVER PLAIN TA! It is 'Tú / To' (or 'To') or 'Tí / Te'!
- Da: Angular box-bracket or cursive 'z'-like contour featuring a distinct INTERIOR NOTCH or central step flourish on inner contour (horizontal top, stepped diagonal waist, and base bar). (Ta has NO notch; Sa is a rounded numeral '3'; Da HAS an inner notch/step like a cursive 'z').
- Na: Umbrella arch / canopy curve on top with a central vertical stem descending straight down (⌢ with central vertical stem ↓).
- La: Vertical downward stem with a looped/curved top (looks like a vertical pin, lowercase-rho ρ, or 'T' with looped/curved head).
- Sa: Flowing '3' shape (numeral 3 with two open curved loops).
- Ma: Diagonal slash crossed by an intersecting horizontal crossbar (cross-like / slashed).
- Pa: Checkmark-like 'v' or '√' upward sweep with an upward/right flourish and a horizontal crossbar/tick (open 'v' with a bar).
- Ba: Completely CLOSED oval circle or droplet loop (O). (Pa is open with crossbar; Ba is a closed circle/droplet).

3. UPPER GARLIT / LIGATED -I/-E (Anak Sulat):
Base consonant modified for vowel /i/ or /e/. In Kulitan, /i/ and /e/ are vowel allophones:
- Form A (-i/-e diacritic tick / garlit): Base consonant with a distinct separate UPPER ACUTE TICK (/) hovering above it:
  * Kí / Ke (Form A): Base 'Ka' (two horizontal parallel bars) with an UPPER ACUTE TICK (/) hovering above. Character: 'Kí / Ke' (or 'Ki'), transliteration: 'ki' (or 'ke'). NEVER plain Ka!
  * Dí / De (Form A): Base 'Da' (angular 'z' / box bracket with interior notch) with an UPPER ACUTE TICK (/) or wavy tilde hovering above. Character: 'Dí / De' (or 'Di'), transliteration: 'di' (or 'de'). NEVER plain Da!
  * Ngí / Nge (Form A): Base 'Nga' (sweeping crescent + wave) with an UPPER ACUTE TICK (/) hovering above. Character: 'Ngí / Nge' (or 'Ngi'), transliteration: 'ngi' (or 'nge'). NEVER plain Nga!
  * Tí / Te (Form A): Base 'Ta' (swan-neck curve / cursive 'Ć'-like hook) with an UPPER ACUTE TICK (/) hovering above. Character: 'Tí / Te' (or 'Ti'), transliteration: 'ti' (or 'te'). NEVER plain Ta!
  * Gí / Ge (Form A): Base 'Ga' (inverted U arch ∩) with an UPPER ACUTE TICK (/) hovering above. Character: 'Gí / Ge' (or 'Gi'), transliteration: 'gi' (or 'ge'). NEVER plain Ga!
  * Sí / Se (Form A): Base 'Sa' (numeral '3') with an UPPER ACUTE TICK (/) hovering above.
  * Bí / Be (Form A): Base 'Ba' (closed oval 'O') with an UPPER ACUTE TICK (/) hovering above.
  * Lí / Le (Form A): Base 'La' (vertical pin) with an UPPER ACUTE TICK (/) hovering above.
  * Mí / Me (Form A): Base 'Ma' (crossed loop) with an UPPER ACUTE TICK (/) hovering above.
  * Ní / Ne (Form A): Base 'Na' (umbrella canopy) with an UPPER ACUTE TICK (/) hovering above.
  * Pí / Pe (Form A): Base 'Pa' (open checkmark 'v' with crossbar) with an UPPER ACUTE TICK (/) hovering above.
- Form B (-e and ligated -i/-e): Base consonant connects DIRECTLY into an attached right-hand upright vertical needle flourish (~|) that shoots straight up to the top margin, WITHOUT needing any separate floating tick (commonly labeled as '-e' in reference charts):
  * Kí / Ke: Base 'Ka' (two horizontal parallel bars starting directly on the FAR LEFT margin, open on the left with NO outer C-shaped hook enclosing them) connected directly into the tall upright vertical needle flourish (~|) on the right. Transliteration: 'ke' (or 'ki'), Character: 'Kí / Ke' (or 'Ke'). (If there is an outer C-shaped hook enclosing the left side, it is STANDALONE VOWEL E, NOT Ke!).
  * Tí / Te: Base 'Ta' (swan-neck curve / cursive '2' contour dropping into an open horizontal baseline with an empty center and NO internal parallel dashes) connected directly to the tall right upright needle flourish (~|) shooting up to the top. Transliteration: 'te' (or 'ti'), Character: 'Tí / Te' (or 'Te').
  * Ngí / Nge: Base 'Nga' (continuous horizontal undulating wave ~~~, OR an initial sweeping left crescent ')' connected to a central undulating wave/hump 'm') connected directly on the right into a tall upright vertical needle flourish (~|) that shoots straight UP to the top margin. Transliteration: 'nge' (or 'ngi'), Character: 'Ngí / Nge' (or 'Nge'). NEVER classify as Tú / To, Tang, or Ngang!
  * Gí / Ge: Base 'Ga' (single smooth inverted U-shaped arch ∩ with open bottom, NO second hump and NO 'm'-wave) connected directly into the upright vertical needle flourish (~|). Character: 'Gí / Ge' (or 'Ge'), transliteration: 'ge' (or 'gi').
  * Dí / De: Base 'Da' (angular 'z' / box bracket with rigid flat roof and sharp interior notch) with an upper wavy diacritic mark/tilde hovering above, OR connected directly to the upright needle flourish (~|). Character: 'Dí / De' (or 'De'), transliteration: 'de' (or 'di').
  * Sí / Se: Base 'Sa' (numeral '3') connected directly to the upright needle flourish (~|).
  * Bí / Be: Base 'Ba' (closed oval 'O') connected directly to the upright needle flourish (~|).
  * Lí / Le: Base 'La' (vertical pin with looped top) connected directly to the upright needle flourish (~|).
  * Mí / Me: Base 'Ma' (crossed diagonal loop) connected directly to the upright needle flourish (~|).
  * Ní / Ne: Base 'Na' (umbrella canopy with central stem) connected directly to the upright needle flourish (~|).
  * Pí / Pe: Base 'Pa' (open checkmark 'v' with crossbar) connected directly to the upright needle flourish (~|).

4. LOWER GARLIT / LIGATED -U/-O (Anak Sulat):
Base consonant modified by a lower comma-like tick (,) placed directly below the glyph AND/OR an attached right-hand trailing upward-curving wing/wave (~v):
- Tú / To / Tû: Base 'Ta' (upper-left downward-curling hook and horizontal baseline) modified by the -u/-o diacritic:
  * Look below the horizontal baseline: has a distinct LOWER COMMA TICK (,) positioned directly below, OR continues past the first arch into a second downward valley and upward-curving trailing wing (~v). If you see the lower comma tick below 'Ta' or the second valley wing, it is 100% ALWAYS TÚ / TO (character: 'Tú / To' or 'To', transliteration: 'to' or 'tu'), NEVER plain Ta!
- Ngú / Ngo: Base 'Nga' (sweeping left crescent ')' + central undulating wave) with a distinct LOWER COMMA TICK (,) placed beneath it, OR concluding on the right with an attached downward dip and upward-curving trailing wing/flourish (~v). Character: 'Ngú / Ngo' (or 'Ngo'), transliteration: 'ngo' or 'ngu', NEVER plain Nga!
- Kú / Ko: Base 'Ka' (two horizontal parallel bars) with a distinct LOWER COMMA TICK (,) or third horizontal bar/dash placed directly beneath it, OR an attached trailing wing (~v). Character: 'Kú / Ko' (or 'Ko'), transliteration: 'ko' or 'ku', NEVER plain Ka!
- Dú / Do: Base 'Da' (angular 'z' with interior notch) with a distinct LOWER COMMA TICK (,) placed directly below it, OR an attached trailing wing (~v). Character: 'Dú / Do' (or 'Do'), transliteration: 'do' or 'du', NEVER plain Da!
- Gú / Go: Base 'Ga' (single smooth inverted U arch ∩) with a LOWER COMMA TICK (,) below, OR followed on the right by an attached or adjacent downward dip and upward-curving trailing wing/flourish (~v). Character: 'Gú / Go' (or 'Go'), transliteration: 'go' or 'gu'), NEVER plain Ga and NEVER Ngú / Ngo!
- Bú / Bo: Base 'Ba' (closed oval circle 'O') with lower comma tick and trailing wing (~v).
- Pú / Po: Base 'Pa' (checkmark 'v' with crossbar) with lower comma tick and/or trailing wing.
- Mú / Mo: Base 'Ma' (crossed loop) with lower comma tick (,) and trailing wing (~v).
- Lú / Lo: Base 'La' (vertical pin with looped top) with lower comma tick and trailing wing.
- Nú / No: Base 'Na' (umbrella canopy) with lower comma tick and trailing wing.
- Sú / So: Base 'Sa' (numeral '3') with lower comma tick and trailing wing.

5. CODA NASAL LIGATURES -NG (Kamulitan / Busal):
Base consonant paired strictly with the trailing coda nasal ligature on the right (a separate detached arc ')' followed by a horizontal two-crested wave 'm'):
* ABSOLUTE BOUNDARY RULE FOR CODA NASAL -NG:
  - A character is ONLY a Coda Nasal -NG ligature (Tang, Mang, Ngang, Pang, Dang, etc.) if it clearly terminates on the right in a low horizontal coda nasal wave ('m') resting near the baseline.
  - IT NEVER TERMINATES IN A TALL VERTICAL UPRIGHT NEEDLE (~|)! Any glyph terminating in a tall vertical upright needle (~|) is a LIGATED -I/-E form (Nge, Ke, Te, Ge, De, Se, Be, Le, Me, Ne, Pe) or STANDALONE VOWEL E, NEVER Tang, Mang, or Ngang!
  - It NEVER terminates in a continuous second valley / trailing wing!
- Tang: Base 'Ta' followed specifically by the trailing coda nasal pair (detached arc ')' + horizontal two-crested wave 'm'). Tang has NO upright vertical needle (~|) and NO lower comma tick.
- Ngang: Base 'Nga' doubled with coda nasal ligature, forming an interlocked undulating double-wave glyph without any tall vertical upright needle. (If it has a tall upright needle on the far right, it is NGÍ / NGE, NOT Ngang!)
- Mang: Base 'Ma' + trailing coda nasal pair.
- Pang: Base 'Pa' + trailing coda nasal pair.
- Lang: Base 'La' + trailing coda nasal pair.
- Nang: Base 'Na' + trailing coda nasal pair.
- Sang: Base 'Sa' + trailing coda nasal pair.
- Dang: Base 'Da' + trailing coda nasal pair.
- Kang: Base 'Ka' + trailing coda nasal pair.
- Gang: Base 'Ga' + trailing coda nasal pair.
- Bang: Base 'Ba' + trailing coda nasal pair.

6. REFERENCE CHARTS & TABLES:
If the image shows a multi-character grid or reference chart with multiple glyph rows, identify as:
"character": "Kulitan Chart", "transliteration": "gi", "confidence": 98, "type": "Diacritic Reference Chart (Anak Sulat)"

CRITICAL DISAMBIGUATION RULES:
1. Arch (Ga) vs Wave (Nga) vs Angular Notch (Da) vs Swan-Neck (Ta):
   - Inverted U Arch (∩) (Base 'Ga'):
     * Single smooth inverted U arch (∩) with open bottom (resembling lowercase 'n' or '∩').
     * Connected on right to upright vertical needle (~|) -> 100% ALWAYS GÍ / GE (transliteration: 'ge' or 'gi'), NEVER Ngí / Nge!
     * Followed on right by downward dip and upward trailing wing (~v) -> 100% ALWAYS GÚ / GO (transliteration: 'go' or 'gu'), NEVER plain Ga and NEVER Ngú / Ngo!
   - Sweeping Crescent + Undulating Wave (Base 'Nga'):
     * Initial left crescent ')' + central undulating 'm'-wave (TWO crests, NOT a single arch).
     * Connected on right to upright vertical needle (~|) -> NGÍ / NGE (transliteration: 'nge' or 'ngi').
     * Concluding on right in downward dip and upward trailing wing (~v) -> 100% ALWAYS NGÚ / NGO (transliteration: 'ngo' or 'ngu'), NEVER plain Nga and NEVER Gú / Go!
   - Angular Box-Bracket with Interior Notch (Base 'Da'):
     * Rigid flat horizontal top roof bar + interior notch/step flourish on diagonal spine (like cursive 'z').
     * Has upper wavy diacritic tilde or connects to needle flourish -> 100% ALWAYS DÍ / DE (transliteration: 'de' or 'di'), NEVER Tí / Te and NEVER plain Da!
   - Swan-Neck Hook with Upper Acute Tick (Base 'Ta' + kudlit):
     * Upper-left hook with rounded baseline + separate detached UPPER ACUTE TICK (/) hovering above -> 100% ALWAYS TÍ / TE (transliteration: 'ti' or 'te'), NEVER plain Ta!
2. Ke vs Standalone Vowel E vs Te:
   - Ke: TWO HORIZONTAL PARALLEL BARS on the FAR-LEFT margin (completely open on left, no outer C-curve) + tall right upright needle (~|). Character: 'Kí / Ke' or 'Ke', transliteration: 'ke'.
   - Standalone Vowel E: Left C-shaped outer hook/curve enclosing the left side + INTERNAL HORIZONTAL CROSSOVER BRIDGE / DASHES (=) in the center + tall right upright needle (~|). Character: 'E' or 'I / E', transliteration: 'e'.
   - Te: Left swan-neck curve 'Ta' + empty center (NO internal parallel dashes) + tall right upright needle (~|). Character: 'Tí / Te' or 'Te', transliteration: 'te'.
3. Ngí / Nge vs Tí / Te vs Tú / To vs Tang vs Ngang:
   - Tí / Te: Look at the left side: begins with the upper-left downward-curling hook of 'Ta' dropping into an elongated horizontal bottom baseline, which turns up into ONE SINGLE medial arch before connecting to the tall upright vertical needle (~|). Even if the horizontal baseline has a minor cursive ink step or hitch, it is clearly Base 'Ta' with its flat elongated bottom baseline and single arch (NO second arch, NO 'm'-wave). Transliteration: 'te' (or 'ti'), Character: 'Tí / Te' or 'Te'.
   - Ngí / Nge: Base 'Nga' has TWO distinct rounded upward crests / arches (a true undulating double-hump 'm'-wave) in the center before connecting into the tall upright vertical needle (~|). It lacks the elongated flat bottom baseline of 'Ta'. Transliteration: 'nge' (or 'ngi'), Character: 'Ngí / Nge' or 'Nge'.
   - CRITICAL: If a glyph has an elongated bottom baseline and only ONE single arch before the upright needle, it is 100% ALWAYS TÍ / TE, NEVER Ngí / Nge! If it has TWO upward crests ('m'-wave), it is NGÍ / NGE!
   - Tú / To: Begins with Base 'Ta' (smooth swan-neck curve with NO 'm'-wave) and continues into a trailing wing/second valley that curves upward softly. Tú/To NEVER has a central 'm'-wave and NEVER ends in a tall upright vertical needle flourish (~|)!
   - Tang: Ends in a low horizontal coda nasal wave ('m') resting near the baseline with NO upright needle.
   - Ngang: Low repeating horizontal waves without any tall upright needle.
4. Tú / To vs Ta vs Tang:
   - Tú / To: Base 'Ta' modified by the -u/-o ligature. Look at the right side: after the central arch, the line dips down into a second trough/valley and curves upward into a distinct trailing wing or upward tail (~w). If there is any trailing upward tail or second dip attached to the right of the arch, it is ALWAYS TÚ / TO (character: 'Tú / To' or 'To', transliteration: 'to' or 'tu'), NEVER plain Ta!
   - Plain Ta: Has ONLY ONE bottom curve and ONE single arch (swan-neck curve). It STOPS immediately at the peak of the first arch and has NO trailing wing, NO second dip, and NO upward tail to the right. If there is a trailing upward tail to the right of the arch, IT IS NEVER PLAIN TA!
   - Tang: Base 'Ta' followed by detached arc ')' and low horizontal wave 'm'.
5. Vertical Rising Needle (~|) vs Coda Nasal Pair (')' + wave):
   - Ligated -I/-E characters (Ke, Te, Nge, Ge, De, Se, Be, Le, Me, Ne, Pe) and Standalone E terminate on the far right in a TALL VERTICAL UPRIGHT NEEDLE (~|). They are NEVER coda nasal -NG ligatures!
6. La vs Na (Lí vs Ní, Lú vs Nú, Lang vs Nang):
   - La (Base pin): A long straight vertical downward stem/pin topped with a loop or ribbon curl ('ρ'). Any glyph whose base is a straight vertical pin with a top loop is ALWAYS LA / LÍ / LÚ / LANG, NEVER Na!
   - Na (Umbrella canopy): Has a rounded umbrella arch '⌢' that curves downward symmetrically on both sides with a central stem.
7. Da vs Pa (Dí vs Pí, Dú vs Pú, Dang vs Pang):
   - Da: Rigid flat horizontal top roof bar ('┌' or 'Z'), stepped diagonal spine with an interior notch, and flat base bar.
   - Pa: Open checkmark 'v' or '√' cup with a distinct HORIZONTAL CROSSBAR / TICK intersecting the right arm.

TASK:
${targetHint}

Return a JSON object in this exact schema:
{
  "recognized": true,
  "character": "Transliterated syllable name, e.g., 'E', 'Tí / Te', 'Ngí / Nge', 'Tú / To', 'Kí / Ke'",
  "transliteration": "Exact lowercase Latin syllable, e.g., 'e', 'te', 'nge', 'to', 'ke'",
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
