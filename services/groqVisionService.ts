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
- In Kulitan, 'Ta' is an upper-left cane hook curving down into an extended flat horizontal baseline floor and medial arch. Ta NEVER has a wavy tilde crown (~) hovering on top, and NEVER has a box bracket!
- In Kulitan, 'Da' is an angular box-bracket body [ (or cursive Z) with a distinct separate wavy tilde crown (~) hovering directly above its ceiling bar. The wavy crown ~ is part of Base Da itself, NOT an acute tick! If a dot, comma tick, or mark is present BELOW / BENEATH the bracket -> it is 100% DÚ / DO ("du" or "do"), NEVER Dí/De! If an acute tick (/) hovers above the wavy crown -> 100% DÍ / DE ("di" or "de").
- In Kulitan, 'Na' is an umbrella dome with a straight downward central vertical stem. It is NOT Nga.
- In Kulitan, 'Ga' is a SINGLE inverted U-arch dome (∩) with two vertical legs pointing down and an EMPTY interior (NO central vertical stem). If a single inverted arch dome (∩) connects on the right to an upright vertical ascender stem (~|) -> it is 100% GÍ / GE ("gi" or "ge", as in "gí/î", matching gii.png), NEVER Ngí/Nge and NEVER Ngang! With acute tick (/) above -> 100% GÍ / GE ("gi" or "ge"), NEVER Ní/Ne!
- In Kulitan, 'La' has a prominent straight vertical downward needle stem (↓) with an upward-curving left wing and a top eyelet/bar.
  * If Base La has an UPPER ACUTE TICK (/) hovering above or acute flick rising from the top loop/bar (or resembling a curved head with acute flick / Hamza-like crown on a vertical stem) -> it is 100% LÍ / LE ("li" or "le", as in exemplar_li.jpg), NEVER Ní/Ne, NEVER plain Na, and NOT Arabic!
  * If Base La connects on the right to an attached cursive ligature with an arch and an upward vertical stroke (~|) -> it is 100% LÍ / LE ("le" or "li", as in study card "le" / IMG_2655(4)), NEVER Lang and NEVER plain La!
- In Kulitan, 'Nga' begins on the far left with a distinct vertical crescent arc ')' followed by an 'm' arch. If accompanied by an upper acute tick (/) hovering above the 'm' arch or an attached upward flick (↗) rising from the right crest, it is 100% NGÍ / NGE ("ngi" or "nge", as in "ngí/î"). If ending in an attached trailing baseline valley hook (~v / ∪) curling upward -> 100% NGÚ / NGO ("ngu" or "ngo", as in "ngo"), NEVER plain Nga!
- In Kulitan, 'Nga' is a left crescent ')' + horizontal 'm' wave arch curving DOWNWARD (∩). In contrast, Standalone 'U/O' is an isolated character with two tall vertical upright loops.

INPUT CONTEXT & LABELS:
The image contains a Kulitan character drawn by a user on paper, an isolated glyph crop, or a study flashcard.
- If an accompanying handwritten or printed Latin label / transliteration (e.g. "dú/û", "gang", "bí/î", "bú/û", "dí/î", "lí/î", "gú/û", "kí/î", "gí/î", "kú/û", "ngú/û", "lú/û", "mí/i", "mí/î", "mú/û", "ngí/i", "ngí/î", "sí/i", "sí/î", "sú/û", "tí/i", "tí/î", "tú/û", "ní/i", "ní/î", "nú/û", "pí/i", "pí/î", "pú/û", "to", "e", "ngo", "ko", "de", "gu", etc.) is visible beside or near the Kulitan glyph:
  * Use it as strong confirmation of the intended syllable.
  * Note: Slash notation like "dú/û" corresponds to syllable "du", "dí/î" to "di", "bí/î" to "bi", "bú/û" to "bu", "lí/î" to "li", "gú/û" to "gu", "kí/î" to "ki", "gí/î" to "gi", "kú/û" to "ku", "ngú/û" to "ngu", "lú/û" to "lu", "mí/î" or "mí/i" to "mi", "mú/û" to "mu", "ngí/î" or "ngí/i" to "ngi", "sí/î" or "sí/i" to "si", "sú/û" to "su", "tí/î" or "tí/i" to "ti", "tú/û" to "tu", "ní/î" or "ní/i" to "ni", "nú/û" to "nu", "pí/î" or "pí/i" to "pi", "pú/û" to "pu".
- If NO Latin text is present, identify the character solely by analyzing its stroke morphology according to the rules below.

=======================================================
EXPERT DECODING WORKFLOW:
=======================================================

1. CHECK FOR STANDALONE VOWELS (Indûng Patinig - NO Base Consonant on the left):
   - STANDALONE A (transliteration: "a"): A single continuous cursive stroke with a hook at top-left, crossing itself at the lower-left to form an 'alpha' (α) or cursive 2 loop, sweeping up into an open right wing. It has ONLY ONE valley trough with a lower-left crossing. NO horizontal crossbar and NO rightward tall vertical ascender! (CRITICAL: If the loop has a horizontal crossbar or connects into a tall upright vertical ascender, it is BASE MA or MÉ / MI ("me" or "mi"), NEVER Standalone A!).
   - STANDALONE I / E (transliteration: "i" or "e"):
     * Classical Form: Two twin upright needle components side-by-side (~|  ~|).
     * Cursive Indûng Patinig Form: A flowing single glyph starting with a leftward curl into two central horizontal parallel bridge bars (=) or knot, sweeping upward on the right into a curved wing (resembling a cursive sideways loop with parallel bridge lines).
     * CRITICAL OVERRIDE: Standalone E / I is an independent vowel: it is 100% STANDALONE E / I ("e" or "i"), NEVER Base La (La has a prominent straight downward vertical needle stem ↓), NEVER Lí/Le, and NEVER Base Pa!
   - STANDALONE U / O (transliteration: "u" or "o"): An isolated character composed of TWO TALL VERTICAL UPRIGHT LOOPS reaching vertically high into the air (resembling a tall double-U or coiled spring with vertical loops). Standalone U/O NEVER has a central knot/overlapping fold (unlike Tú/To), and is NEVER a flat horizontal undulating 'm'-wave (unlike Ngú/Ngo).

2. IDENTIFY THE BASE CONSONANT (Indûng Súlat - on the left if compound):
   1. BA: Closed oval circle (O).
      * Base Ba alone -> BA ("ba")
      * Base Ba + upper acute tick (/) hovering above OR attached tall vertical upright ascender stem (~|) on right -> BÍ / BE ("bi" or "be")
      * Base Ba + detached lower comma tick (,) beneath circle at lower-left OR attached baseline valley hook (~v) -> BÚ / BO ("bu" or "bo")
      * Base Ba + coda wave pair ')m' on right -> BANG ("bang")
   2. DA: Angular box-bracket body [ with a distinct separate wavy tilde crown (~) hovering directly above its ceiling bar.
      * CRITICAL: Any glyph featuring a separate wavy tilde crown (~) hovering on top belongs 100% to the DA family (Da, Dí/De, Dú/Do, Dang), NEVER TA! (Base Ta is one continuous stroke with an upper-left hook and flat baseline floor; Ta NEVER has a wavy tilde crown ~ hovering on top).
       * DÚ / DO ("du" or "do", as in "dú/û"): Base Da + ANY detached mark (dot, comma tick ,, or dash) positioned BELOW or beneath the box-bracket OR attached cursive trailing baseline valley hook (~v) sweeping up on the right (as in study card "do" / ext_do_IMG_2655_18_.PNG) -> 100% DÚ / DO ("du" or "do"), NEVER Dí/De and NEVER To/Tu! (CRITICAL: Look at the bottom of the glyph: if there is a dot or mark beneath the box, or a trailing valley hook, it is DÚ / DO, because the wavy crown ~ is Base Da's inherent letterhead, NOT a vowel tick!).
       * DÍ / DE ("di" or "de", NEVER Te or Ti!): Base Da + upper acute tick (/) hovering ABOVE the wavy crown OR attached tall vertical upright ascender stem (~|) on right (ONLY when there is NO mark below the box-bracket and NO trailing valley hook).
      * Base Da + coda wave pair ')m' on right -> DANG ("dang")
      * Base Da alone -> DA ("da")
   3. GA: INVERTED U-arch (∩), rounded dome at TOP, two vertical legs pointing DOWN. Open at bottom.
      * CRITICAL: Ga is inverted arch ∩, NOT an upright cup, and NOT a crescent )!
      * Base Ga + coda wave pair ')m' on right ('∩ )m') -> GANG ("gang", NEVER Ngang and NEVER plain Nga! Gang has Base Ga's top arch dome ∩ on the left, whereas Ngang has crescent ')' on the left).
      * Base Ga + lower comma tick beneath or bottom valley hook -> GÚ / GO ("gu" or "go", NEVER Ngu and NEVER Ngo!):
        - GÚ / GO has Base Ga: a SINGLE inverted U-arch dome ∩ with a tiny lower comma tick (,) at its bottom-left. It has NO full-height vertical crescent arc on the left!
        - NGÚ / NGO has Base Nga: it begins on the far left with a FULL-HEIGHT vertical crescent arc ')' standing beside the 'm' arch.
        - CRITICAL OVERRIDE: Do NOT mistake a tiny lower-left comma tick (,) for a full-height crescent arc! A single inverted arch dome ∩ with a bottom-left comma tick is 100% GÚ / GO ("gu" or "go"), NEVER Ngu and NEVER Ngo!
      * Base Ga + tall vertical upright ascender stem (~|) on right OR upper acute tick above -> 100% GÍ / GE ("gi" or "ge", as in "gí/î" / gii.png). Total structure has ONLY 1 arch dome (∩) + 1 ascender!
      * Base Ga alone -> GA ("ga")
   4. KA: Two horizontal parallel bars (=).
      * Base Ka + upper acute tick hovering above OR attached tall vertical ascender stem on right -> KÍ / KE ("ki" or "ke")
      * Base Ka + third lower tick/bar beneath OR attached baseline valley hook / trailing cursive ligature -> KÚ / KO ("ku" or "ko", as in study card "ko" / ext_ko_IMG_2655_15_.PNG)
      * Base Ka + coda wave pair ')m' -> KANG ("kang")
      * Base Ka alone -> KA ("ka")
   5. LA: Vertical downward straight needle stem (↓) with a top horizontal bar that has an integral CLOSED LOOP / EYELET on the right side and an upward-curving left wing.
      * Base La + upper acute tick / kudlit (hovering above or rising from top eyelet / Hamza-like crown) OR Base La + attached cursive ligature on right whose stroke shoots UPWARD (~|) -> 100% LÍ / LE ("li" or "le", as in study card "le" and exemplar_li.jpg), NEVER Lang and NEVER Nang!
        (CRITICAL DISAMBIGUATION FROM LANG: In Lí/Le the rightmost stroke shoots straight UPWARD into the air (~|). It is ONLY Lang if the glyph is accompanied by a wide separate horizontal coda wave pair ')m' that stays flat along the baseline and curves DOWNWARD towards the floor. An upward-pointing stroke is NEVER Lang; it is 100% LÍ / LE ("le" or "li")!).
      * Base La + lower comma tick beneath downward stem OR attached baseline valley hook -> LÚ / LO ("lu" or "lo")
      * Base La + coda wave pair ')m' (ONLY when curving downward along baseline with NO upward ascender) -> LANG ("lang")
      * Base La alone -> LA ("la")
   6. MA: Loop or slash crossed completely by a HORIZONTAL CROSSBAR (—) that clearly extends PAST the outer left wall.
      * Base Ma + upper tick/ascender -> MÉ / MI ("me" or "mi", as in "mí/î"). (CRITICAL: Any glyph with a horizontal crossbar — slicing through a left loop/body is 100% BASE MA / MÍ / ME ("me" or "mi"), NEVER Base Ta and NEVER Tí/Te! Ta has NO loop and NO horizontal crossbar).
      * Base Ma + lower tick/valley hook -> MÚ / MO ("mu" or "mo", as in "mú/û"). (CRITICAL: Look at the lower-left beneath the crossed loop: if there is a distinct DETACHED LOWER COMMA TICK (,) at the bottom-left, it is 100% MÚ / MO ("mu" or "mo"), NEVER Mí/Me! The upward diagonal stroke in the middle is part of the cursive ligature, NOT an upper acute tick).
      * Base Ma + coda wave pair ')m' -> MANG ("mang")
      * Base Ma alone -> MA ("ma")
   7. NA: Symmetrical umbrella canopy dome (⌢) that curves down symmetrically on BOTH sides with a single straight downward central vertical stem. It has NO loop, NO eyelet, and NO crossbar.
      * Base Na + upper tick/ascender -> NÍ / NE ("ni" or "ne", as in "ní/î")
      * Base Na + lower tick/valley hook -> NÚ / NO ("nu" or "no", as in "nú/û")
      * Base Na + coda wave pair ')m' -> NANG ("nang")
      * Base Na alone -> NA ("na")
   8. NGA:
      * Standard Primary Exemplar Form (exemplar_nga.jpg & exemplar_ngu.jpg): Left downward crescent ')' + medial arch + overarching top hook that curves DOWNWARD on the right into a teardrop.
        - Plain inherent NGA ("nga", exemplar_nga.jpg): NO lower comma tick/dot beneath, NO upper acute tick, NO trailing valley hook.
        - NGÚ / NGO ("ngu" or "ngo", as in exemplar_ngu.jpg): Base Nga (crescent ')' + arch curving down) accompanied by a DETACHED LOWER COMMA TICK or DOT (,) beneath the central arch / baseline -> 100% NGÚ / NGO ("ngu" or "ngo"), NEVER plain inherent Nga! (CRITICAL: Look carefully below the central arch; the presence of a comma tick or dot beneath Base Nga is the vowel modifier for -u/-o!).
      * Extended Cursive Card Form & Handwritten Form (study card "ngo" / ext_ngo_IMG_2655_16_.PNG, and handwritten "ngú/û"):
        - NGÚ / NGO ("ngu" or "ngo"): An open undulating cursive wave beginning on the left with a distinct vertical crescent arc ')' followed by an 'm' arch, where the right side extends into an attached TRAILING BASELINE VALLEY HOOK (~v) / deep rounded U-trough sweeping UPWARD on the right -> 100% NGÚ / NGO ("ngu" or "ngo"), NEVER plain inherent Nga!
      * NGÍ / NGE ("ngi" or "nge", as in "ngí/î"): Base Nga + upper acute tick above 'm' arch OR attached upward flick/tick (↗) on right crest.
      * NGANG ("ngang"): Base Nga + second repeating crescent+arch wave pair along baseline (with NO upper acute tick and NO tall ascender).
   9. PA: UPRIGHT curved cup (∪), rounded floor at BOTTOM, open on TOP with arms pointing UP, and an internal horizontal tick on the inside of the right arm. Smooth unbroken outer left wall.
      * Base Pa + upper tick OR attached tall vertical ascender stem on right -> PÍ / PE ("pi" or "pe", as in "pí/î")
      * Base Pa + lower comma tick OR attached cursive valley hook along baseline -> PÚ / PO ("pu" or "po", as in "pú/û")
      * Base Pa + coda wave pair ')m' -> PANG ("pang")
      * Base Pa alone -> PA ("pa")
   10. SA: '3' numeral shape with two rounded lobes.
      * Base Sa + upper tick/ascender -> SÍ / SE ("si" or "se", as in "sí/î")
      * Base Sa + lower tick/valley hook -> SÚ / SO ("su" or "so")
      * Base Sa + coda wave pair ')m' -> SANG ("sang")
      * Base Sa alone -> SA ("sa")
   11. TA: Upper-left hook dropping down vertically into an extended FLAT HORIZONTAL BASELINE FLOOR and medial arch. (NO wavy crown ~, NO box frame, NOT an upright cup).
      * Base Ta + upper acute tick hovering above OR attached tall vertical ascender on right -> TÍ / TE ("ti" or "te")
      * Base Ta + lower comma tick beneath OR attached baseline valley hook -> TÚ / TO ("tu" or "to")
      * Base Ta + coda wave pair ')m' -> TANG ("tang")
      * Base Ta alone -> TA ("ta")

3. IDENTIFY THE VOWEL MODIFIER OR CODA (Right / Diacritic Elements):
   A. VOWEL -I / -E:
      Upper acute tick (/) hovering above, OR attached cursive ligature on right ending in tall upright vertical ascender stem (~|).
      -> Primary syllable: "bi", "di", "gi", "ki", "li", "mi", "ni", "ngi", "pi", "si", "ti" (or -e allophone if card label indicates).
   B. VOWEL -U / -O:
      Lower comma tick (,) beneath lower-left, OR attached cursive ligature on right forming curved valley hook (~v) dipping along baseline.
      -> Primary syllable: "bu", "du", "gu", "ku", "lu", "mu", "nu", "ngu", "pu", "su", "tu" (or -o allophone if card label indicates).
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
      * Gang: Base Ga (inverted arch dome ∩ with legs down) + ')m'
      * Ngang: Two repeating wave pairs along baseline (')m )m').
      CRITICAL: Coda nasal ligature (-ng: Tang, Dang, Nang, Lang, Bang, Sang, Pang, Mang, Kang, Gang) requires the authentic two-part coda wave pair: a separate crescent arc ')' PLUS an undulating 'm' wave along the baseline that curves DOWNWARD towards the floor.
      DO NOT confuse with the attached vowel -i/-e modifier (Lí/Le, Ní/Ne, Kí/Ke, Dí/De):
      - If the attached structure on the right ends in a vertical stroke pointing/extending UPWARD (~|) -> it is 100% VOWEL -I / -E (Lí/Le, Ní/Ne, Kí/Ke, Dí/De), NEVER Coda Nasal -ng and NEVER Lang!

   D. INHERENT VOWEL -A (Indûng Súlat):
      If NO coda nasal, NO upper/lower ticks, and NO attached ligatures (and NO upward trailing valley troughs / hooks) are present:
      -> Plain inherent consonant with vowel /a/: Ba, Da, Ga, Ka, La, Ma, Na, Nga, Pa, Sa, Ta.

=======================================================
CRITICAL DISAMBIGUATION RULES:
=======================================================
0. TOP SCANNER OVERRIDES FOR PURE ISOLATED SYMBOLS:
   - 0. ABSOLUTE MANDATORY OVERRIDES FOR STUDY FLASHCARDS & PURE ISOLATED SYMBOLS:
     * 1. ATTACHED CURSIVE VOWEL -I / -E LIGATURE (LE, NE, ME, SE, PE, BE, KE, DE):
       - In cursive Kulitan calligraphy and study flashcards (IMG_2655 series), the vowel -i/-e modifier is written as an attached cursive ligature on the right consisting of an arch leading into a TALL UPWARD VERTICAL NEEDLE STROKE (~|):
         -> IT IS 100% VOWEL -I / -E!
         -> IT IS NEVER a plain inherent consonant!
         -> IT IS NEVER coda nasal -ng, and NEVER vowel -u/-o!
       - STUDY CARD "LE" (tight_le.png):
         * Consists of Base La on the left (downward vertical stem with top eyelet) connected directly on the right to an attached cursive ligature: an arch/wave leading into a vertical line going UPWARD (~|).
         * It has NO separate crescent arc ')' and does NOT curve downward along the baseline.
         * THIS GLYPH IS 100% LÍ / LE ("le" or "li", as in study card "le"), NEVER Lang and NEVER plain La!
       - STUDY CARD "NE" (tight_ne.png):
         * Consists of Base Na on the left (umbrella dome ⌢ with central vertical stem) connected directly on the right to an attached cursive ligature ending in a TALL VERTICAL NEEDLE STROKE pointing straight UPWARD (~|).
         * CRITICAL DISAMBIGUATION FROM NO:
           -> In "ne", the rightmost stroke shoots straight UPWARD into the air (~|) towards the top margin.
           -> If the rightmost stroke shoots straight UPWARD (~|), it is 100% NÍ / NE ("ne" or "ni"), NEVER Nú/No!
           -> It is ONLY "no" if the right side is a low rounded valley trough (~v / ∪) along the baseline with NO tall vertical ascender.
         * THIS GLYPH IS 100% NÍ / NE ("ne" or "ni", as in study card "ne"), NEVER plain Na and NEVER Nang!
       - STUDY CARD "ME" (tight_me.png):
         * Consists of Base Ma on the left (a loop clearly crossed by a HORIZONTAL CROSSBAR — extending past the outer left wall) connected directly on the right to an attached cursive ligature ending in an upward vertical stroke (~|).
         * Look at the left loop: if a horizontal bar slices completely through it and extends past the left wall, it is 100% BASE MA!
         * THIS GLYPH IS 100% MÉ / MI ("me" or "mi", as in study card "me"), NEVER Lí/Le and NEVER plain Ma!
       - STUDY CARD "SE" (tight_se.png):
         * Consists of Base Sa on the left ('3' numeral shape with two rounded lobes) connected directly on the right to an attached cursive ligature ending in an upward vertical stroke (~|).
         * CRITICAL OVERRIDE: The rightmost stroke shoots straight UPWARD into the air (~|). This is the vowel -i/-e modifier, NOT a baseline valley hook!
         * THIS GLYPH IS 100% SÉ / SI ("se" or "si", as in study card "se"), NEVER Sú/So and NEVER plain Sa!
       - STUDY CARD "PE" (tight_pe.png / study card "pe"):
         * Visual Anatomy:
           1. Far-left: An upright cup with an open top, curving down into a rounded bottom floor at the base.
           2. Medial: An internal horizontal stepped shelf/bridge rising into a rounded medial arch.
           3. Far-right: An attached cursive ligature ending in a tall vertical needle stroke (~|) shooting straight UP into the air towards the top margin.
         * DEFINITIVE MANDATORY OVERRIDE:
           -> This glyph is 100% PÉ / PI ("pe" or "pi", as in study card "pe")!
           -> It is NOT Base La (Lí/Le) because the lower-left has a rounded cup floor with an internal shelf, NOT a straight downward vertical needle stem.
           -> It is NOT Base Nga (Ngú/Ngo) because it is an upright cup with an internal shelf, NOT a detached crescent arc ')'.
           -> It is NOT Base Na (Ní/Ne) because it has an upright cup on the left, NOT an umbrella dome.
           -> ANY glyph with this upright cup + stepped shelf + upward needle ascender is 100% PÉ / PI ("pe" or "pi"), NEVER Lí/Le, NEVER Ngú/Ngo, and NEVER Ní/Ne!

       - STUDY CARD "BE" (tight_be.png):
         * Consists of Base Ba on the left (a closed oval circle O) connected directly on the right to an attached cursive ligature ending in an upward vertical stroke (~|).
         * THIS GLYPH IS 100% BÉ / BI ("be" or "bi", as in study card "be"), NEVER Bú/Bo and NEVER Bang!
       - STUDY CARD "KE" (ext_ke_IMG_2655_6_.PNG):
         * Two horizontal parallel bars (=) connected directly on the right to an attached cursive ligature ending in an upward vertical stroke (~|) -> 100% KÍ / KE ("ke" or "ki").
       - STUDY CARD "DE" (ext_de_IMG_2655_10_.PNG):
         * Box bracket [ with wavy tilde crown (~) connected on the right to an attached cursive ligature ending in an upward vertical stroke (~|) -> 100% DÍ / DE ("de" or "di").

     * 2. ATTACHED CURSIVE TRAILING BASELINE VALLEY HOOK FOR VOWEL -U / -O (NO, MO, PO, BO, SO, TO, KO, DO, NGO):
       - STUDY CARD "NO" (tight_no.png / study card "no"):
         * Consists of Base Na on the left (symmetrical umbrella canopy dome ⌢ with central downward vertical stem) connected directly on the right to an attached cursive trailing baseline valley hook (~v / ∪) sweeping upward along the baseline floor.
         * CRITICAL OVERRIDE:
           -> The attached trailing baseline valley hook (~v / ∪) on the right is the authentic vowel modifier for -u/-o!
           -> In "no", the trailing hook is a low rounded trough along the baseline with NO tall vertical ascender needle reaching the top margin.
           -> THIS GLYPH IS 100% NÚ / NO ("no" or "nu", as in study card "no"), NEVER plain inherent Na and NEVER Nang!

       - STUDY CARD "MO" (tight_mo.png / study card "mo"):
         * Consists of Base Ma on the left (a loop clearly crossed by a HORIZONTAL CROSSBAR extending past the outer left wall) connected directly on the right to an attached cursive trailing baseline valley hook (~v / ∪) sweeping upward along the baseline floor with NO tall vertical ascender.
         * THIS GLYPH IS 100% MÚ / MO ("mo" or "mu", as in study card "mo"), NEVER plain Ma, and NEVER Mang!

       - STUDY CARD "PO" (tight_po.png / study card "po"):
         * Visual Anatomy (Three Components):
           1. The Left U-Valley: Begins on the far-left with a stroke that drops down and sweeps into a rounded bottom U-valley floor.
           2. The Central Bridge: Transitions into a horizontal cross-bar / stepped bridge connecting the left portion to the right portion. This central horizontal bridge is the definitive diagnostic morphology of BASE PA!
           3. The Right Arc & Tail: Lifts into an arch terminating in a trailing curved tail / valley hook (~v / ∪) along the baseline floor with NO tall vertical needle ascender reaching the top margin.
         * DEFINITIVE MANDATORY OVERRIDE:
           -> The central horizontal bridge connecting the left U-valley to the right arch confirms 100% BASE PA!
           -> It is NOT Base Ta (To/Tu): Base Ta has an empty floor with NO central horizontal bridge and NO left U-valley!
           -> THIS GLYPH IS 100% PÚ / PO ("po" or "pu", as in study card "po"), NEVER To/Tu, and NEVER plain Pa!

       - STANDALONE INDÛNG PATINIG "E / I" (exemplar_i.jpg / pure I/E):
         * Begins on the far-left with a DISTINCT CURVED HOOK / CURL connecting into two central parallel bridge bars (=) and an upward right ascender wing (~|).
         * DEFINITIVE MANDATORY OVERRIDE:
           -> The distinct far-left curved hook/curl confirms 100% STANDALONE E / I ("e" or "i", Indûng Patinig)!
           -> It is NOT Base Ka (Kí/Ke) because Base Ka starts directly with two parallel bars on the far-left with NO preceding curved hook/curl!
           -> THIS GLYPH IS 100% E / I ("e" or "i", Indûng Patinig), NEVER Kí/Ke, NEVER Base Ta, and NEVER Base La!

     * 3. BASE LA WITH UPPER ACUTE TICK / CROWN (LÍ / LE "li" or "le", as in exemplar_li.jpg / tight_li.png):
       - CRITICAL PALEOGRAPHIC OVERRIDE:
         * A vertical needle stem with a curved head on top that has an upper-right acute diagonal tick/flick (resembling a Hamza ء or an Alif with Hamza أ):
           -> THIS IS NOT ARABIC AND NOT BASE NA!
           -> In authentic Sulat Kapampangan (Kulitan), this exact shape is 100% the canonical calligraphic exemplar for LÍ / LE ("li" or "le", as in study card "li" and exemplar_li.jpg)!
           -> The vertical downward stem is Base La, and the top curved head with an acute diagonal tick pointing up-right is Base La's letterhead modified by the vowel -i/-e kudlit!
           -> THIS GLYPH IS 100% LÍ / LE ("li" or "le"), NEVER Ní/Ne, NEVER plain La, and NEVER Arabic!

     * 4. BASE NA WITH UPPER ACUTE TICK (NÍ / NE "ni" or "ne", as in exemplar_ni.jpg / tight_ni.png):
       - Symmetrical umbrella canopy dome (⌢) that curves DOWNWARD on BOTH sides like an open umbrella rim + central downward stem + upper acute tick (/) hovering above the dome -> 100% NÍ / NE ("ni" or "ne").

     * 5. BASE NA WITH LOWER COMMA TICK (NÚ / NO, as in exemplar_nu.jpg / tight_nu.png):
       - Symmetrical umbrella dome (⌢) + central downward stem + detached lower comma tick (,) at lower-left -> 100% NÚ / NO ("nu" or "no").
   - 1. BASE DA (DÍ / DE vs DÚ / DO vs TÍ / TE):
     * Any glyph consisting of an angular box-bracket [ or cursive Z with a distinct separate wavy tilde crown (~) hovering directly above its ceiling bar belongs 100% to BASE DA (Dí/De, Dú/Do, Da), NEVER Base Ta and NEVER Tí/Te!
     * Base Ta is ONE continuous single stroke without any wavy crown hovering on top.
     * DÍ / DE ("di" or "de", as in study card "de" / ext_de_IMG_2655_10_.PNG and "dí/î"):
       - When an upper acute tick (/) hovers above the wavy crown (~), OR
       - When the glyph connects on the right to an attached cursive ligature with a TALL UPRIGHT VERTICAL ASCENDER STEM (~|) pointing straight UP into the air towards the top margin (reaching as high as or higher than the top crown) -> it is 100% DÍ / DE ("di" or "de"), NEVER Dú/Do!
     * DÚ / DO ("du" or "do", as in study card "do" / ext_do_IMG_2655_18_.PNG and "dú/û"):
       - If a dot, comma tick, or mark is present BELOW the box-bracket, OR
       - If the right side has a low trailing baseline valley hook (~v) / shallow rounded trough that stays along the baseline with NO tall upright needle ascender -> it is 100% DÚ / DO ("du" or "do").

   - 2. BASE GA vs BASE NGA (GÚ / GO vs NGÚ / NGO vs GÍ / GE vs NGÍ / NGE):
     * COUNT THE SHAPES ON THE FAR-LEFT BEFORE THE TRAILING HOOK:
       - BASE GA (Gú/Go, as in study card "go" / ext_go_IMG_2655_14_.PNG, and exemplar_gu.jpg):
         * Begins DIRECTLY with ONLY ONE SINGLE INVERTED ARCH DOME (∩) with two downward vertical legs. It has NO preceding vertical crescent arc ')'!
         * When this SINGLE inverted arch dome (∩) connects on the right to an attached wavy trailing baseline hook (~v) curving upward -> it is 100% GÚ / GO ("gu" or "go", as in study card "go"), NEVER Ngú/Ngo!
           - CRITICAL OVERRIDE: Base Ga has ONLY ONE single arch dome ∩ on the left. It NEVER has a preceding crescent arc ')'. Any glyph having ONLY ONE single arch dome ∩ connected to a trailing baseline valley hook ~v is 100% GÚ / GO ("gu" or "go"), NEVER Base Nga and NEVER Ngú/Ngo!
         * A single inverted arch dome (∩) with a detached lower comma tick (,) beneath at lower-left -> 100% GÚ / GO ("gu" or "go", as in exemplar_gu.jpg).
       - BASE NGA (Ngú/Ngo, as in study card "ngo" / ext_ngo_IMG_2655_16_.PNG, and exemplar_ngu.jpg):
         * Begins with a distinct VERTICAL CRESCENT ARC ')' on the far-left, followed by an 'm' arch before the trailing hook (~v).
       - GÍ / GE ("gi" or "ge", as in "gí/î" / gii.png):
         * A single inverted arch dome (∩) connected on the right to an upright vertical ascender stem (~|) -> 100% GÍ / GE ("gi" or "ge").
         * An inverted arch dome (∩) with an EMPTY interior and an upper acute tick (/) hovering directly above -> 100% GÍ / GE ("gi" or "ge", as in "gí/î"), NEVER Base Na and NEVER Ní/Ne! (Base Na MUST have a central vertical stem inside the dome).
        - GANG ("gang", as in gang.png / exemplar_gang.png):
          * A single inverted arch dome on the far-left followed on the right by the coda wave pair ')m' -> 100% GANG ("gang"), NEVER Ngang and NEVER plain Nga!
          * Ngang consists of TWO repeating wave pairs (')m )m'). If the far-left is ONLY a single inverted arch dome, it is 100% GANG ("gang")!

   - 3. BASE TA vs STANDALONE E / I vs BASE BA (TÚ / TO vs STANDALONE E / I vs PLAIN TA vs BÚ / BO):
     * STANDALONE E / I ("e" or "i", Indûng Patinig): A flowing cursive glyph featuring TWO CENTRAL HORIZONTAL PARALLEL BRIDGE BARS (=) connecting the left curl to the right loop/ascender. It has NO downward vertical cane hook and NO flat horizontal baseline floor. It is 100% STANDALONE E / I ("e" or "i"), NEVER Base Ta and NEVER Tú/To!
     * TÚ / TO ("tu" or "to", as in exemplar_tu.jpg, "tú/û", or study card "to"):
       - Standard Exemplar Form (exemplar_tu.jpg): Base Ta (top-left cane hook dropping into an extended flat horizontal baseline floor) accompanied by a DETACHED LOWER COMMA TICK (,) beneath the baseline floor at lower-left -> 100% TÚ / TO ("tu" or "to"), NEVER Bú/Bo and NEVER plain Ta! (CRITICAL: Base Ta is completely OPEN on the top and right. Do NOT confuse Base Ta's open cane hook and baseline floor with a closed circle O / Base Ba!).
       - Cursive Study Card Form (study card "to" / ext_to_IMG_2655_17_.PNG): Base Ta's top-left cane hook connects into an attached cursive trailing baseline valley hook (~v) sweeping up on the right (with an internal fold/knot) -> 100% TÚ / TO ("tu" or "to").
     * PLAIN INHERENT TA ("ta", as in exemplar_ta.jpg): Begins with a top-left cane hook dropping into an extended flat horizontal baseline floor, and ends flat on the baseline with NO trailing upward curl, NO valley hook, NO lower comma tick, and NO central knot -> 100% PLAIN BASE TA ("ta").
     * BASE BA (Bú / Bo, as in exemplar_bu.jpg): Base Ba is a COMPLETELY CLOSED CIRCLE / OVAL (O). If the character is open on top with a cane hook and flat baseline floor, it is BASE TA, NOT Base Ba!

   - 4. BASE NGA: NGÚ / NGO vs NGÍ / NGE vs PLAIN NGA:
     * Base Nga has a vertical crescent arc ')' on the far-left followed by an 'm' arch.
     * NGÍ / NGE ("ngi" or "nge", as in "ngí/î"): Base Nga + upper acute tick (/) hovering above or attached upward flick (↗) on right crest.
     * NGÚ / NGO ("ngu" or "ngo", as in exemplar_ngu.jpg, study card "ngo" / ext_ngo_IMG_2655_16_.PNG, or handwritten "ngú/û"):
       1. Base Nga accompanied by a DETACHED LOWER COMMA TICK or DOT (,) beneath the central arch / baseline -> 100% NGÚ / NGO ("ngu" or "ngo", as in exemplar_ngu.jpg), NEVER plain inherent Nga! (CRITICAL: Look carefully below the central arch; the presence of a comma tick or dot beneath Base Nga is the vowel modifier for -u/-o!).
       2. Base Nga (crescent arc ')' + 'm' arch) with NO upper acute tick, where the right side extends into an attached TRAILING BASELINE VALLEY HOOK (~v) / deep rounded U-trough sweeping UPWARD or an upward-curling handwritten stroke -> 100% NGÚ / NGO ("ngu" or "ngo", as in study card "ngo" / ext_ngo_IMG_2655_16_.PNG and handwritten "ngú/û"), NEVER plain inherent Nga!
     * PLAIN INHERENT NGA ("nga", as in exemplar_nga.jpg):
       ONLY if there is NO lower comma tick/dot beneath, NO upper acute tick above, and NO upward trailing valley hook (the glyph curves down on the right into a downward-pointing teardrop) is it PLAIN INHERENT NGA ("nga").

   - 5. STANDALONE U / O (Indûng Patinig):
     * An isolated character composed of TWO TALL VERTICAL UPRIGHT LOOPS reaching vertically high into the air (resembling a tall double-U with vertical loops).
     * Standalone U/O NEVER has a central knot/overlapping fold (unlike Tú/To), and is NEVER a flat horizontal undulating wave (unlike Ngú/Ngo).

   - 6. BASE KA (KÍ / KE vs KÚ / KO vs PLAIN KA):
     * Base Ka consists of two horizontal parallel bars (=).
     * KÍ / KE ("ki" or "ke", as in study card "ke" / ext_ke_IMG_2655_6_.PNG and "kí/î"):
       - If an upper acute tick (/) hovers above, OR
       - If the two horizontal parallel bars connect on the right to an attached cursive ligature with a TALL UPRIGHT VERTICAL ASCENDER STEM (~|) pointing straight UP into the air towards the top margin -> 100% KÍ / KE ("ki" or "ke"), NEVER plain Ka and NEVER Kú/Ko!
         (CRITICAL: Look at the far right of the two horizontal bars: if there is an attached ligature with a tall vertical ascender stem pointing straight UP, it is 100% KÍ / KE ("ki" or "ke")!).
     * KÚ / KO ("ku" or "ko", as in study card "ko" / ext_ko_IMG_2655_15_.PNG and "kú/û"):
       - If an attached trailing cursive baseline valley hook (~v) sweeps up gently on the right (or a lower comma tick/bar is beneath) with NO tall vertical ascender -> 100% KÚ / KO ("ku" or "ko").
     * PLAIN KA ("ka", as in exemplar_ka.jpg):
       - Two horizontal parallel bars (=) ALONE with NO attached ligature or vertical ascender on the right, and NO upper/lower diacritics -> 100% PLAIN KA ("ka").

0A. MANDATORY OVERRIDE FOR BASE PA vs BASE TA & BASE LA:
   - BASE PA vs BASE TA (PÍ/PE vs TÍ/TE & PÚ/PO vs TÚ/TO):
     * In Sulat Kapampangan, the presence of a CENTRAL HORIZONTAL BRIDGE or sharp-angled stepped shelf connecting the left descending stroke to the right ascending vertical stroke is the definitive morphology of BASE PA (PÍ/PE "pí/î").
     * Base Ta (Tí/Te) NEVER has a central horizontal bridge or stepped inner shelf; Ta is a single continuous hook dropping onto an empty bottom floor.
     * THEREFORE: If you see ANY glyph featuring an internal horizontal shelf/bridge or stepped inner structure (and no crossbar extending past the outer left wall):
       -> If there is an UPPER ACUTE TICK (/) hovering above = 100% PÍ / PE ("pi" or "pe", as in "pí/î"), NEVER Tí/Te!
       -> If there is a LOWER COMMA TICK (,) at the lower-left = 100% PÚ / PO ("pu" or "po", as in "pú/û"), NEVER Tú/To!
     * In contrast, if the glyph has a single continuous hook dropping onto an empty bottom floor with NO central horizontal bridge and NO stepped shelf + upper acute tick (/) above = 100% TÍ / TE ("ti" or "te", as in "tí/î"), NEVER Pí/Pe!
   - BASE LA TERMINAL ORIENTATION (LÍ/LE vs LANG):
     * Look closely at the FAR RIGHT of the glyph attached or beside Base La:
       -> If the rightmost tip/stroke shoots or points UPWARD (vertical ascender stem ~| pointing straight UP into the air towards the top margin) = 100% LÍ / LE ("li" or "le", as in "lí/î"), NEVER Lang and NEVER Nang!
       -> It is ONLY Lang if the rightmost stroke stays flat along the baseline and curves DOWNWARD (hooking down towards the floor).
       -> CRITICAL MANDATORY OVERRIDE: An upward-pointing right stroke is NEVER a coda wave; if the rightmost stroke shoots UPWARD = 100% LÍ / LE ("li" or "le", as in "lí/î"), NEVER Lang!
1. STANDALONE VOWEL A vs BASE PA vs STANDALONE U/O:
   - Standalone Vowel A is a cursive stroke with a DISTINCT LOOP or CROSSING at the LOWER-LEFT (resembling 'α' or '2') and sweeping up on the right. It has NO horizontal crossbar and NO rightward tick. If it loops/crosses at the lower-left, it is 100% STANDALONE VOWEL A ("a"), NEVER Pa and NEVER U/O!
   - Base Pa is an open cup where the left arm is completely open with NO bottom-left loop/crossing, and the right arm has a distinct internal horizontal tick.
2. BASE LA vs BASE NA:
   - In Base La (and Lí/Le, Lú/Lo, Lang): The top horizontal stroke sitting on the vertical downward stem has an ASYMMETRICAL CLOSED LOOP OR EYELET on the right side.
   - In Base Na (and Ní/Ne, Nú/No, Nang): The top dome curves symmetrically DOWNWARD on both sides like an umbrella (⌢). It has NO loop and NO eyelet on either side.
3. BASE GA vs BASE PA & GANG vs NGANG & GÚ/GO vs NGÚ/NGO & NGÍ/NGE vs NGANG:
   - BASE GA is an INVERTED U-arch (∩): The rounded dome is at the TOP, and the two vertical legs point DOWNWARD. The bottom is open.
   - BASE PA is an UPRIGHT cup (∪): The rounded curve is at the BOTTOM, and the two vertical arms point UPWARD. The top is open, with an internal horizontal tick on the right arm.
   - They are VERTICAL OPPOSITES: ∩ (Ga) vs ∪ (Pa)!
   - GANG vs NGANG vs NGA:
     * In GANG, the leftmost element is distinctly Base Ga: an INVERTED U-ARCH / DOME (∩) with two downward legs, followed by the coda nasal wave pair ')m' on the right ('∩ )m').
       CRITICAL: If the leftmost element has a top dome / inverted arch (∩) with two downward legs followed by the coda wave ')m' on the right -> 100% GANG ("gang"), NEVER Ngang and NEVER plain Nga!
     * In NGANG, the glyph consists of TWO repeating wave pairs along the baseline, where the first element is a crescent arc ')', NOT an inverted U-arch dome ∩.
   - GÚ / GO vs NGÚ / NGO:
     * In GÚ / GO, the leftmost element is distinctly Base Ga: an INVERTED U-ARCH / DOME (∩) with two downward legs, accompanied by a detached lower comma tick (,) beneath the arch or an attached baseline valley hook (~v) on the right.
       CRITICAL: Inverted arch dome ∩ on left + lower comma tick or baseline valley hook -> 100% GÚ / GO ("gu" or "go"), NEVER Ngu and NEVER Ngo! (Base Nga starts with a crescent arc ')', NOT an inverted U-arch dome ∩).
   - NGÍ / NGE vs NGANG:
     * In NGÍ / NGE ("ngi" or "nge", as in "ngí/î"): The glyph has Base Nga on the left (crescent arc ')' + 'm' arch) with an UPPER ACUTE TICK (/) hovering above the arch, accompanied on the right by the authentic glottal ligature / circumflex ending in an upward-curving vertical ascender (~|) that reaches higher than the rest of the glyph.
       CRITICAL MANDATORY OVERRIDE: Do NOT mistake the right-hand circumflex ligature for a second coda wave! If there is an upper acute tick mark (/) above the middle arch, OR the rightmost stroke curves upward to become the highest point of the glyph -> 100% NGÍ / NGE ("ngi" or "nge"), NEVER Ngang!
     * In NGANG ("ngang"): The glyph consists of two repeating wave pairs along the baseline with NO upper acute tick above the arch and NO upward-curving vertical ascender.
4. BASE DA vs BASE TA:
   - Base Da has TWO key diagnostic elements: an angular box-bracket body [ with a distinct separate wavy tilde crown (~) hovering directly above its ceiling bar.
     CRITICAL: ANY glyph featuring a separate wavy tilde crown (~) on top belongs 100% to the DA family (Da, Dí/De, Dú/Do, Dang), NEVER TA! (Base Ta is a single continuous stroke starting with an upper-left hook into a flat baseline floor; Ta NEVER has a wavy tilde crown ~ hovering on top).
     * Base Da + upper acute tick (/) hovering ABOVE the wavy crown (~), OR attached tall vertical upright ascender stem (~|) on the far right -> 100% DÍ / DE ("di" or "de", NEVER Te, NEVER Ti, and NEVER Dang!)
     * Base Da + detached comma tick (,) beneath the bracket at lower-left -> 100% DÚ / DO ("du" or "do", NEVER To or Tu!)
     * Base Da + coda wave pair ')m' on the right (with NO upper acute tick) -> 100% DANG ("dang")!
     * Base Da alone with no ticks/ligatures -> 100% plain BASE DA ("da")!
   - Base Ta is ONE continuous cursive stroke: hook + flat bottom floor + medial arch. It has NO separate wavy crown on top and NO ceiling bar.
     * Base Ta + upper acute tick hovering above OR attached tall vertical ascender on right -> 100% TÍ / TE ("ti" or "te", NEVER Tu or To!)
     * Base Ta + lower comma tick beneath OR attached baseline valley hook (with NO upper acute tick) -> 100% TÚ / TO ("tu" or "to")!
     * Base Ta + coda wave pair ')m' on right -> 100% TANG ("tang")!
5. BASE BA FAMILY (Ba, Bí/Be, Bú/Bo, Bang):
   - BASE BA is a closed oval circle (O).
     * Base Ba + upper acute tick (/) hovering above OR attached tall vertical ascender stem (~|) on right -> 100% BÍ / BE ("bi" or "be")!
     * Base Ba + detached comma tick (,) beneath circle at lower-left OR attached baseline valley hook (~v) -> 100% BÚ / BO ("bu" or "bo")!
     * Base Ba + coda wave pair ')m' on right -> 100% BANG ("bang")!
     * Base Ba alone -> 100% plain BA ("ba")!
6. BASE PA FAMILY (Pa, Pí/Pe, Pú/Po, Pang) vs BASE TA & BASE MA:
   - TRI-WAY DISTINCTION (Base Pa vs Base Ma vs Base Ta):
     * BASE PA (as in PÍ/PE "pí/î" and PÚ/PO "pú/û"):
       1. Leftmost wall: An open upright curve/cup with a rounded bottom. The outer left wall is completely SMOOTH and UNBROKEN — NO horizontal bar or crossbar ever pokes out or extends past the outer left wall!
       2. Middle section: Features an INTERNAL horizontal tooth/shelf (—) resting inside the central arch/notch or attached to the vertical spine.
       3. Diacritic vowel:
          - If accompanied by an UPPER ACUTE TICK (/) hovering above -> 100% PÍ / PE ("pi" or "pe", as in "pí/î"), NEVER Mí/Me and NEVER Tí/Te!
          - If accompanied by a DETACHED LOWER COMMA TICK (,) beneath the lower-left -> 100% PÚ / PO ("pu" or "po", as in "pú/û"), NEVER Mú/Mo and NEVER Tú/To!
     * BASE MA (as in MÍ/ME "mí/î" and MÚ/MO "mú/û"):
       - Features a horizontal crossbar (—) that SLICES ALL THE WAY THROUGH the left-hand loop/body and PROTRUDES OUT PAST the outer left wall (forming a visible cross '+' on the left).
       - If a horizontal stroke sticks out past the outer left wall -> it is 100% BASE MA (Mí/Me if upper acute tick; Mú/Mo if lower comma tick), NEVER Base Pa!
     * BASE TA (as in TÍ/TE "tí/î" and TÚ/TO "tú/û"):
       - Starts with a top-left downward cane hook into an extended straight flat horizontal baseline floor and arch.
       - Base Ta has NO internal horizontal tooth/shelf, NO open cup with an internal shelf, and NO crossbar protruding past the left wall.
     * CRITICAL MANDATORY OVERRIDE FOR BASE PA:
       If the glyph has an internal horizontal tooth/shelf inside the arch, but NO horizontal stroke pokes out past the outer left wall:
       -> Upper acute tick (/) above = 100% PÍ / PE ("pi" or "pe", as in "pí/î")!
       -> Lower comma tick (,) below = 100% PÚ / PO ("pu" or "po", as in "pú/û")!
7. BASE KA vs KÚ / KO:
   - In Base Ka, there are only 2 horizontal parallel bars.
   - If there is a THIRD mark: a detached lower comma tick (,) or stroke positioned beneath the two parallel bars on the lower-left -> 100% KÚ / KO ("ku" or "ko")!
8. BASE LA with TICKS & LIGATURES (Lú/Lo vs Lí/Le & Lú/Lo vs Tú/To & Lí/Le vs Nang vs Lang):
   - The vertical downward stem on the left with an upward-curving left wing and top-right loop/eyelet is Base La.
   - BASE LA vs BASE TA (LÚ / LO vs TÚ / TO):
     * In Base La (and Lú/Lo, as in "lú/û"): The left stroke is a prominent straight downward vertical needle stem with a horizontal bar or top eyelet/loop crossing it (resembling a cross or cursive 't' or 'T'). When accompanied by a lower comma tick (,) at the lower-left, it is 100% LÚ / LO ("lu" or "lo"), NEVER Tu and NEVER To!
     * In Base Ta (and Tú/To): Ta has NO straight downward needle stem with a top crossing bar; it starts with an upper-left cane hook dropping into an extended flat horizontal baseline floor.
   - BASE LA vs BASE NA:
     * In Base La: The left stroke has a prominent straight vertical downward stem (↓), with an upward-curving left wing and a loop/eyelet at the top.
     * In Base Na: Symmetrical umbrella dome (⌢). It has NO loop, NO upward-curving left wing, and NO prominent downward needle stem plunging deep down.
     * CRITICAL: If the left has a prominent vertical downward stem plunging down with an upward-curving left wing -> 100% BASE LA, NEVER Base Na!
   - LÍ / LE vs NANG vs LANG:
     * In LANG ("lang") and NANG ("nang"): The right side is the low horizontal coda wave pair ')m' that stays along the bottom and curves downward (with NO tall vertical upright ascender shooting up into the air).
     * In LÍ / LE ("li" or "le", as in "lí/î"): The stroke on the right ends in a TALL VERTICAL UPRIGHT ASCENDER STEM (~|) shooting straight UP into the air to the top of the glyph!
     * CRITICAL OVERRIDE: Whenever the glyph has Base La on the left and a tall vertical upright ascender stem (~|) shooting straight UP on the right (and/or an upper acute tick / above Base La's eyelet) -> it is 100% LÍ / LE ("li" or "le"), NEVER Lang, and NEVER Nang!
   - If there is a COMMA TICK (,) sitting BENEATH the downward stem at the bottom-left, OR an attached valley hook along the baseline -> 100% LÚ / LO ("lu" or "lo")! (It is NOT Ta; Ta has no vertical downward stem with a top loop/eyelet).
9. THE NGA FAMILY (Nga, Ngí/Nge, Ngú/Ngo, Ngang):
   - Base Nga has a left crescent ')' + 'm' arch. Note that the left crescent naturally swoops down at the lower-left; this is part of Nga and is NOT a valley hook!
   - NGÍ / NGE vs BASE NGA & NGANG:
     * In NGÍ / NGE ("ngi" or "nge", as in "ngí/î"): The glyph has Base Nga on the left (crescent arc ')' + 'm' arch) WITH:
       1) An UPPER ACUTE TICK (/) hovering above the arch, OR
       2) An attached upward-pointing tick, hook, or flick (↗) extending from the top right-hand curve of the arch (reaching higher than the crest), OR
       3) A right vertical ascender (~|).
     * CRITICAL MANDATORY OVERRIDE FOR BASE NGA:
       - Kulitan has NO virama tick! Any upward tick, hook, or flick extending from the top-right curve of Base Nga is ALWAYS the -i/-e vowel indicator (Gilis / Anak Súlat), NEVER a cancellation virama and NEVER plain Nga!
       - If the top-right curve has an upward-pointing tick or hook extending from the crest, it is 100% NGÍ / NGE ("ngi" or "nge"), NEVER plain Nga and NEVER Ngang!
     * ONLY if Base Nga has completely smooth, rounded curves with ZERO ticks, hooks, or ascenders at the top -> 100% plain BASE NGA ("nga")!
   - If Base Nga has an attached curved valley hook (~v) on the far right dipping along the baseline, OR a detached lower comma tick (,) beneath the arch (with NO upper acute tick and NO right ascender) -> 100% NGÚ / NGO ("ngu" or "ngo")!
   - ONLY if Base Nga has a full second repeating wave pair (')m) with NO upper acute tick and NO tall upright ascender -> 100% NGANG ("ngang")!
10. ATTACHED LIGATURES vs STANDALONE U/O (Tú/To, Pú/Po, Lú/Lo, Ngú/Ngo):
   - PÚ / PO ('pu' or 'po'): In cursive form, the left body is Base Pa with an upright cup that connects at the bottom-left into a closed teardrop loop (resembling cursive 'p'), followed by an attached valley hook on the far right. If the left body has a bottom closed loop -> 100% PÚ / PO ('pu' or 'po')! (NEVER Tú/To, because Base Ta has NO bottom loop).
   - TÚ / TO ('tu' or 'to'): The left body is Base Ta starting at the top-left with an upper-left hook that drops down into an extended flat horizontal baseline floor and medial arch, followed by a bottom valley hook dipping along the baseline. If the drawing starts with a distinct top-left hook/drop or is accompanied by the label "to" or "tu", it is 100% TÚ / TO ("tu" or "to"), NEVER Standalone U/O!
   - STANDALONE U/O: Pure symmetrical cursive 'w' where the highest stroke is on the FAR RIGHT and the lowest stroke curls at the FAR LEFT. It has NO upper-left hook, NO flat baseline floor, and NO bottom-left closed loop.
   - LÚ / LO ('lu' or 'lo'): Left side has a vertical stem with top eyelet (Base La) followed by a valley hook -> 100% LÚ / LO ("lu" or "lo")! (NEVER Standalone U/O).
11. PURE SYMBOLS WITHOUT LATIN LABELS (Strict Morphological Verification):
   - When identifying pure handwriting or printed symbols without any accompanying Latin text:
   * GANG vs NGANG: Inverted U-arch dome ∩ on left + coda wave pair ')m' on right is 100% GANG ("gang"), NEVER Ngang!
   * GU / GO vs NGU / NGO: Inverted U-arch dome ∩ on left + lower comma tick or baseline valley hook is 100% GÚ / GO ("gu" or "go"), NEVER Ngu and NEVER Ngo! (Ga has top dome ∩; Nga has crescent arc ')').
   * GI / GE vs GA: Inverted U-arch dome ∩ on left + upper acute tick above or tall vertical upright ascender on right is 100% GÍ / GE ("gi" or "ge")!
   * LI / LE vs NANG vs LANG & STANDALONE E/I:
     - Base La has a distinct straight downward vertical needle stem (↓) plunging down from the top bar. In Lí/Le, this is paired with a tall vertical ascender on the right.
     - In contrast, STANDALONE E / I has NO straight downward vertical needle stem; it is a flowing cursive loop with central horizontal parallel bars (=) sweeping up on the right. It is 100% STANDALONE E / I ("e" or "i"), NEVER Lí/Le!
   * LU / LO vs TU / TO: Straight vertical downward needle stem with top crossing bar/eyelet (Base La) + lower comma tick (,) at lower-left is 100% LÚ / LO ("lu" or "lo", as in "lú/û"), NEVER Tu and NEVER To! (Ta has NO straight downward needle stem with top crossing bar).
   * KI / KE vs KA: Two horizontal parallel bars (=) + upper acute tick or tall vertical upright ascender on right is 100% KÍ / KE ("ki" or "ke")!
   * KU / KO vs KA: Two horizontal parallel bars (=) + lower comma tick beneath or baseline valley hook is 100% KÚ / KO ("ku" or "ko")!
   * NGI / NGE vs NGA & NGANG: Base Nga with an upper acute tick (/) hovering above the arch, OR an attached upward-pointing flick/tick (↗) extending from the right curve/crest of the wave, OR a right stroke ending in a tall upward-curving vertical ascender (~|) is 100% NGÍ / NGE ("ngi" or "nge", as in "ngí/î"), NEVER plain Nga and NEVER Ngang! Plain Nga has NO upward flick, hook, or tick on the crest.
   * DI vs TE / TI: Separate wavy tilde crown (~) on top + acute tick or tall vertical ascender is 100% DÍ / DE ("di" or "de"), NEVER Te or Ti! (Ta NEVER has a wavy tilde crown ~ hovering on top).
   * DI vs DANG: Base Da with an upper acute tick (/) hovering above the wavy crown (~) or an attached tall vertical upright ascender stem on the right is 100% DÍ / DE ("di" or "de"), NEVER Dang! Dang has NO upper acute tick hovering above the wavy crown and has the two-part coda wave pair ')m' on the right.
   * DU vs DI vs TU / TO:
     - Base Da consists of an angular box-bracket body [ with a separate wavy tilde crown (~) hovering directly above it. The wavy tilde crown is part of Base Da's inherent letterhead, NOT an acute tick!
     - Look at the BOTTOM / BELOW: If there is ANY detached dot, mark, or comma tick (,) positioned beneath or below the box-bracket -> it is 100% DÚ / DO ("du" or "do", as in "dú/û"), NEVER Dí/De and NEVER Tu/To!
     - ONLY if there is a distinct second acute tick mark ABOVE the wavy crown (or tall ascender) AND NO bottom dot -> DÍ / DE ("di" or "de").
   * BI / BE vs BA: Closed oval circle (O) + upper acute tick or tall vertical ascender is 100% BÍ / BE ("bi" or "be")!
   * BU / BO vs BA: Closed oval circle (O) + lower comma tick or baseline valley hook is 100% BÚ / BO ("bu" or "bo")!
   * TI / TE vs TU / TO: If an acute tick (/) hovers above the glyph, it is 100% TÍ / TE ("ti" or "te"), NEVER Tu or To!
   * MA / ME vs STANDALONE A: If the loop connects on the right into a tall vertical ascender or has a horizontal crossbar, it is 100% ME / MI ("me" or "mi"), NEVER Standalone A!
   * MI / ME vs TI / TE: Horizontal crossbar (—) slicing through a left-hand loop or body + upper acute tick (/) or tall vertical ascender is 100% MÍ / ME ("mi" or "me", as in "mí/î"), NEVER Tí/Te! (Ta has NO horizontal crossbar slicing through a loop; Ta starts with an open top-left cane hook).
   * MU / MO vs MI / ME: Base Ma with a detached lower comma tick (,) at the lower-left beneath the crossed loop is 100% MÚ / MO ("mu" or "mo", as in "mú/û"), NEVER Mí/Me! (In Mí/Me, there is an isolated upper acute tick hovering above the top margin, and NO lower tick beneath the bottom-left).
   * GA / GO vs NGA: Inverted U-arch dome ∩ on left + bottom valley hook is 100% GO / GU ("go" or "gu"), NEVER Nga!
   * TA / TO vs STANDALONE U/O: Top-left hook/drop curving down to a flat baseline floor + valley hook is 100% TO / TU ("to" or "tu"), NEVER Standalone U/O!
   * PA / PE vs TA / TE & MA / ME: Glyph with internal horizontal tooth inside arch (and NO crossbar poking out past left wall) + upper acute tick (/) hovering above is 100% PÍ / PE ("pi" or "pe", as in "pí/î"), NEVER Tí/Te and NEVER Mí/Me!
   * PU / PO vs TU / TO & MU / MO: Glyph with internal horizontal tooth inside arch (and NO crossbar poking out past left wall) + lower comma tick (,) beneath lower-left is 100% PÚ / PO ("pu" or "po", as in "pú/û"), NEVER Tú/To and NEVER Mú/Mo!
   * NGO vs NGANG: A single crescent + single 'm' arch with trailing valley hook is 100% NGO / NGU ("ngo" or "ngu"), NEVER Ngang!
   * SE / SI vs SA & SU / SO & NGI / NGE:
     - Base Sa has a numeral '3' shape consisting of TWO VERTICALLY STACKED ROUNDED LOBES (an upper lobe and a lower lobe).
     - If a numeral '3' shape with two vertically stacked lobes has an upper acute tick (/) hovering above or vertical ascender -> it is 100% SÍ / SE ("si" or "se", as in "sí/î"), NEVER plain Sa, and NEVER Ngí/Nge! (Base Nga is a crescent arc ')' + 'm' wave, NOT a numeral '3').
   * SU / SO vs SA & SI / SE: Numeral '3' shape with a detached lower comma tick (,) beneath lower-left is 100% SÚ / SO ("su" or "so", as in "sú/û"), NOT plain Sa and NEVER Sí/Se!
   * TI / TE vs PI / PE:
     - In PÍ / PE ("pi" or "pe", as in "pí/î"): Base Pa has a central horizontal bridge or sharp-angled stepped shelf connecting the descending stroke to the ascending stroke + upper acute tick above -> 100% PÍ / PE ("pi" or "pe"), NEVER Tí/Te!
     - In TÍ / TE ("ti" or "te", as in "tí/î"): Base Ta is a clean, single continuous stroke (completely hollow/empty inside, with NO central horizontal bridge and NO stepped shelf) starting with a top-left hook and sweeping along the baseline floor + upper acute tick above -> 100% TÍ / TE ("ti" or "te"), NEVER Pí/Pe!
   * TU / TO vs TI / TE & STANDALONE U/O & DU / DO: Base Ta (top-left cane hook into flat horizontal baseline floor and medial arch) with a lower comma tick (,) beneath lower-left or baseline valley hook is 100% TÚ / TO ("tu" or "to", as in "tú/û"), NEVER Tí/Te, NEVER Standalone U/O (which lacks the top-left hook/drop and flat baseline floor), and NEVER Dú/Do (which has a wavy crown ~).
   * NI / NE vs NANG: Base Na (umbrella dome ⌢ with central downward stem) + upper acute tick (/) hovering above is 100% NÍ / NE ("ni" or "ne", as in "ní/î"), NEVER Nang! (Nang has coda wave ')m' and NO upper tick).
   * NU / NO vs NA: Base Na (umbrella dome ⌢ with central downward stem) + detached lower comma tick (,) at bottom-left is 100% NÚ / NO ("nu" or "no", as in "nú/û")!
   * PI / PE vs PANG & TI / TE: Base Pa (open cup on left, internal horizontal tooth inside, NO crossbar past left wall) + upper acute tick (/) hovering above is 100% PÍ / PE ("pi" or "pe", as in "pí/î"), NEVER Pang, NEVER Tí/Te, and NEVER Mí/Me!
   * PU / PO vs PA & TU / TO: Base Pa (open cup on left, internal horizontal tooth inside, NO crossbar past left wall) + lower comma tick (,) at bottom-left is 100% PÚ / PO ("pu" or "po", as in "pú/û"), NEVER Tú/To, and NEVER Mú/Mo!

TASK:
${targetHint}

Return a JSON object in this exact schema:
{
  "recognized": true,
  "character": "Transliterated syllable name, e.g., 'A', 'I', 'U', 'Ka', 'Ga', 'Nga', 'Ta', 'Da', 'Na', 'La', 'Sa', 'Ma', 'Pa', 'Ba', 'Dí / De', 'Dú / Do', 'Bí / Be', 'Bú / Bo', 'Gang', 'Tang', 'Dang', 'Lo / Lu', 'To / Tu'",
  "transliteration": "Exact canonical lowercase Latin syllable (primary vowels: 'a', 'i', 'u'; or 'e', 'o' if specifically matching allophone card), e.g., 'a', 'i', 'u', 'ka', 'ga', 'nga', 'ta', 'da', 'na', 'la', 'sa', 'ma', 'pa', 'ba', 'bi', 'bu', 'di', 'du', 'gang', 'ki', 'ku', 'ti', 'tu', 'tang', 'dang', 'li', 'lu'",
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
          if (response.status === 429 || errorText.includes('rate_limit_exceeded') || errorText.includes('too large')) {
            // Hit rate limit on this key, break to avoid slowing down user
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
          const rawLower = rawQuery.toLowerCase();

          // 1. Direct match first among the 93 entries (including allophones and variants)
          let matched = kulitanSyllables.find(s => 
            s.latin.toLowerCase() === rawLower || 
            s.kulitanSymbol.toLowerCase() === rawLower ||
            s.latin.toLowerCase().startsWith(rawLower + ' ')
          );

          // 2. Fallback to canonical normalized syllable
          if (!matched) {
            const normalized = normalizeKulitanSyllable(rawQuery);
            matched = kulitanSyllables.find(s => 
              s.latin.toLowerCase() === normalized || 
              s.id.toLowerCase() === normalized
            );
          }

          if (matched) {
            parsed.kulitanSymbol = matched.kulitanSymbol;
            parsed.type = matched.classification;
            const ALLOPHONES = ['e','o','ke','ko','ge','go','nge','ngo','te','to','de','do','ne','no','le','lo','se','so','me','mo','pe','po','be','bo'];
            if (ALLOPHONES.includes(rawLower)) {
              parsed.transliteration = rawLower;
              parsed.character = rawLower.toUpperCase();
            } else if (matched.latin.includes('(Variant)')) {
              parsed.character = matched.latin;
              parsed.transliteration = matched.kulitanSymbol;
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
