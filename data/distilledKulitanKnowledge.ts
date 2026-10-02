export interface KulitanCharacterKnowledge {
  latin: string;
  name: string;
  symbol: string;
  classification: string;
  pronunciation: string;
  anatomy: {
    en: string;
    fil: string;
  };
  strokeSequence: {
    en: string[];
    fil: string[];
  };
  commonMistakes: {
    en: string[];
    fil: string[];
  };
  baybayinDistinction: {
    en: string;
    fil: string;
  };
  feedbackTemplates: {
    high: { en: string; fil: string };
    moderate: { en: string; fil: string };
    needsPractice: { en: string; fil: string };
  };
}

/**
 * Distilled paleographic knowledge base for Sulat Kapampangan (Kulitan).
 * Extracted from Gemini Vision & Groq orthographic paleography models
 * to provide comprehensive, offline-accessible stroke analysis and feedback.
 */
export const DISTILLED_KULITAN_KNOWLEDGE: Record<string, KulitanCharacterKnowledge> = {
  a: {
    latin: 'A',
    name: 'A',
    symbol: 'a',
    classification: 'Indung Patinig (Standalone Vowel)',
    pronunciation: '/a/ as in "abak" (morning)',
    anatomy: {
      en: 'A prominent downward hook starting from top-left, curving down into an open bottom bowl that loops upward with a right-hand flourish.',
      fil: 'Isang pakurbang guhit pababa mula itaas-kaliwa, umiikot sa ilalim at umaangat pakanan na may buntot o flourish.',
    },
    strokeSequence: {
      en: [
        '1. Begin at the upper left with a firm descending curve.',
        '2. Sweep smoothly into the bottom bowl without lifting the pen.',
        '3. Conclude with an upward and outward tail flourish.',
      ],
      fil: [
        '1. Magsimula sa itaas-kaliwa na may pabilog na guhit pababa.',
        '2. I-arko nang tuloy-tuloy sa ilalim nang hindi inaangat ang panulat.',
        '3. Tapusin sa paitaas at palabas na buntot.',
      ],
    },
    commonMistakes: {
      en: [
        'Closing the bottom loop completely (turns it into a droplet shape).',
        'Confusing with Tagalog Baybayin "A" (ᜀ), which has two stacked open curves.',
        'Omitting the ascending flourish at the finish.',
      ],
      fil: [
        'Pagsasara ng bilog sa ilalim (nagiging hugis patak).',
        'Pagkakalito sa Tagalog Baybayin "A" (ᜀ) na may magkapatong na kurba.',
        'Pagkakaiwan ng paitaas na buntot sa dulo.',
      ],
    },
    baybayinDistinction: {
      en: 'Kulitan "A" is a single continuous looping hook, whereas Baybayin "A" consists of two undulating curves with an interior pocket.',
      fil: 'Ang Kulitan "A" ay iisang tuloy-tuloy na kawit, samantalang ang Baybayin "A" ay may dalawang alon at panloob na espasyo.',
    },
    feedbackTemplates: {
      high: {
        en: 'Outstanding Kulitan "A"! The descending hook and bottom sweep exhibit authentic Kapampangan paleography.',
        fil: 'Napakahusay na Kulitan "A"! Ang kurba at buntot sa ilalim ay sumusunod sa tunay na sulat Kapampangan.',
      },
      moderate: {
        en: 'Recognized as "A". Ensure the bottom hook curls upward with a clear flourish rather than a flat horizontal line.',
        fil: 'Kinilala bilang "A". Siguraduhing may pataas na arko ang dulo sa halip na patag na linya.',
      },
      needsPractice: {
        en: 'Needs practice on "A". Make sure you do not close the loop or draw the Baybayin double-curve variant.',
        fil: 'Kailangan pa ng pagsasanay sa "A". Huwag isara ang bilog at iwasang maisulat ang Baybayin na anyo.',
      },
    },
  },

  i: {
    latin: 'I',
    name: 'I / E',
    symbol: 'i',
    classification: 'Indung Patinig (Standalone Vowel)',
    pronunciation: '/i/ or /e/ as in "ingat" (careful)',
    anatomy: {
      en: 'A horizontal wavy undulating crown with two rounded crests and a decisive vertical stem dropping on the right side.',
      fil: 'Isang pahigang maalong korona na may dalawang taluktok at pababang patayong guhit sa kanang bahagi.',
    },
    strokeSequence: {
      en: [
        '1. Draw the horizontal wavy crown from left to right.',
        '2. Without lifting, drop a vertical or slight inward spine on the right.',
      ],
      fil: [
        '1. Iguhit ang pahigang maalong korona mula kaliwa pakanan.',
        '2. Mula sa dulo, ibaba ang patayong guhit sa kanan.',
      ],
    },
    commonMistakes: {
      en: [
        'Drawing a straight horizontal bar instead of the authentic undulating double-crest wave.',
        'Placing the vertical stem on the left instead of the right.',
        'Confusing with Tagalog Baybayin "I" (ᜁ), which lacks the right-side stem.',
      ],
      fil: [
        'Pagguhit ng tuwid na linya sa halip na may dalawang alon ang korona.',
        'Paglalagay ng patayong guhit sa kaliwa sa halip na sa kanan.',
        'Pagkakalito sa Baybayin "I" (ᜁ) na walang kanang tangkay.',
      ],
    },
    baybayinDistinction: {
      en: 'Kulitan "I" requires the distinctive right-side vertical stem beneath the wave; Baybayin "I" is an open S-curve facing right.',
      fil: 'Kailangan ng Kulitan "I" ang patayong tangkay sa kanan; ang Baybayin "I" ay bukas na kurbang hugis-S.',
    },
    feedbackTemplates: {
      high: {
        en: 'Superb Kulitan "I/E"! Wave crests and vertical stem alignment match classical manuscript proportions.',
        fil: 'Napakagandang Kulitan "I/E"! Ang alon at patayong tangkay ay tugmang-tugma sa sinaunang anyo.',
      },
      moderate: {
        en: 'Detected "I/E". Accentuate the undulating double-wave crown so it does not look like a flat bar.',
        fil: 'Kinilala bilang "I/E". Mas palinawin ang dalawang alon sa itaas upang hindi magmukhang patag na linya.',
      },
      needsPractice: {
        en: 'Unclear "I/E". Remember: horizontal double-crested wave on top with a vertical right-hand stem.',
        fil: 'Hindi malinaw ang "I/E". Tandaan: dalawang alon sa itaas at may pababang guhit sa kanan.',
      },
    },
  },

  u: {
    latin: 'U',
    name: 'U / O',
    symbol: 'u',
    classification: 'Indung Patinig (Standalone Vowel)',
    pronunciation: '/u/ or /o/ as in "ugat" (root)',
    anatomy: {
      en: 'A flowing three-crested horizontal serpentine wave (approx. ~~~) curling gently upward at the terminal tail.',
      fil: 'Isang maalong pahigang guhit na may tatlong kurba at banayad na umaangat na dulo.',
    },
    strokeSequence: {
      en: [
        '1. Start left with a smooth upward crest.',
        '2. Flow through three equal rhythmic waves horizontally.',
        '3. End with an upward curl.',
      ],
      fil: [
        '1. Simulan sa kaliwa nang may banayad na kurba pataas.',
        '2. Dumaloy sa tatlong pantay na alon nang pahiga.',
        '3. Tapusin sa maliit na arko pataas.',
      ],
    },
    commonMistakes: {
      en: [
        'Drawing only two waves (resembles "Nga" instead of "U").',
        'Drawing sharp angular zig-zags rather than rounded Brahmic curves.',
      ],
      fil: [
        'Pagguhit ng dalawang alon lamang (magiging "Nga" sa halip na "U").',
        'Pagguhit ng matulis na zig-zag sa halip na bilugang alon.',
      ],
    },
    baybayinDistinction: {
      en: 'Kulitan "U" is a flowing horizontal multi-crested wave, completely distinct from Baybayin "U" (ᜂ) which resembles a hook with a foot.',
      fil: 'Ang Kulitan "U" ay maalong pahigang guhit, malayo sa Baybayin "U" (ᜂ) na may paa sa ilalim.',
    },
    feedbackTemplates: {
      high: {
        en: 'Excellent Kulitan "U/O"! Clean, flowing 3-crested wave with proportional amplitude.',
        fil: 'Napakagaling na Kulitan "U/O"! Malinis at may tatlong maalong kurba na may tamang sukat.',
      },
      moderate: {
        en: 'Identified as "U/O". Ensure all three crests are visible so it cannot be mistaken for "Nga".',
        fil: 'Kinilala bilang "U/O". Siguraduhing kita ang tatlong alon upang hindi mapagkamalang "Nga".',
      },
      needsPractice: {
        en: 'Stroke needs practice. Draw a continuous 3-crested wave horizontally with rounded contours.',
        fil: 'Magsanay pa sa "U/O". Gumuhit ng tatlong tuloy-tuloy at bilugang alon.',
      },
    },
  },

  ka: {
    latin: 'Ka',
    name: 'Ka',
    symbol: 'k',
    classification: 'Indung Sulat (Root Consonant)',
    pronunciation: '/ka/ as in "kabyayan" (livelihood)',
    anatomy: {
      en: 'Two parallel horizontal bars joined by a vertical stem or connector on the right edge (like an open sideways bracket).',
      fil: 'Dalawang magkaagapay na pahigang linya na pinagdurugtong ng patayong guhit sa kanang dulo.',
    },
    strokeSequence: {
      en: [
        '1. Draw the top horizontal bar left to right.',
        '2. Turn downward at the right corner to form the vertical connector.',
        '3. Draw the bottom horizontal bar right to left, or parallel beneath.',
      ],
      fil: [
        '1. Iguhit ang itaas na pahigang linya mula kaliwa pakanan.',
        '2. Lumiko pababa sa kanang dulo para sa tangkay.',
        '3. Iguhit ang ibabang pahigang linya na kahanay ng una.',
      ],
    },
    commonMistakes: {
      en: [
        'CRITICAL: Drawing a cross shape "+". That is Tagalog Baybayin (ᜃ), NOT Kulitan!',
        'Placing the vertical connector on the left instead of the right (turns it into bracket).',
        'Merging the parallel bars into a single thick blob.',
      ],
      fil: [
        'MAHALAGA: Pagguhit ng hugis-krus "+". Baybayin Tagalog (ᜃ) iyon, HINDI Kulitan!',
        'Paglalagay ng dugtungan sa kaliwa sa halip na sa kanan.',
        'Pagdidikit ng dalawang pahigang linya na nagiging makapal na guhit.',
      ],
    },
    baybayinDistinction: {
      en: 'Baybayin "Ka" is a cross (ᜃ). Kulitan "Ka" is strictly two horizontal parallel bars with a right-hand spine.',
      fil: 'Ang Baybayin "Ka" ay hugis-krus (ᜃ). Ang Kulitan "Ka" ay dalawang magkaagapay na pahigang linya na may dugtungan sa kanan.',
    },
    feedbackTemplates: {
      high: {
        en: 'Perfect authentic Kulitan "Ka"! Distinct parallel horizontal bars and clean right-side connector.',
        fil: 'Perpektong Kulitan "Ka"! Malinaw ang dalawang magkaagapay na linya at ang kanang dugtungan.',
      },
      moderate: {
        en: 'Good "Ka". Keep the top and bottom bars parallel with sufficient spacing between them.',
        fil: 'Magandang "Ka". Panatilihing magkaagapay ang dalawang linya na may sapat na pagitan.',
      },
      needsPractice: {
        en: 'Incorrect form for Kulitan "Ka". Do NOT draw a Baybayin cross "+". Draw two parallel horizontal bars connected on the right.',
        fil: 'Maling anyo ng Kulitan "Ka". HUWAG gumuhit ng krus "+". Gumuhit ng dalawang pahigang linya na magkadugtong sa kanan.',
      },
    },
  },

  ga: {
    latin: 'Ga',
    name: 'Ga',
    symbol: 'g',
    classification: 'Indung Sulat (Root Consonant)',
    pronunciation: '/ga/ as in "gamat" (hand)',
    anatomy: {
      en: 'A smooth rounded arch opening downward (∩) with the right leg curving slightly inward.',
      fil: 'Isang makinis at pabaligtad na arko (∩) na bukas sa ilalim, kung saan ang kanang paa ay bahagyang kumukurba paloob.',
    },
    strokeSequence: {
      en: [
        '1. Ascend from the lower left upward into a rounded curve.',
        '2. Curve across the top crest.',
        '3. Descend on the right, bowing gently inward.',
      ],
      fil: [
        '1. Umakyat mula ibabang kaliwa patungo sa pabilog na taluktok.',
        '2. Kumurba sa itaas.',
        '3. Bumaba sa kanan nang may banayad na kurba paloob.',
      ],
    },
    commonMistakes: {
      en: [
        'Closing the bottom with a flat baseline (turns it into a triangle).',
        'Flattening the rounded dome into a sharp square corner.',
      ],
      fil: [
        'Pagsasara sa ilalim ng patag na linya (nagiging tatsulok).',
        'Pagpapatulis sa arko na nagiging kanto.',
      ],
    },
    baybayinDistinction: {
      en: 'Kulitan "Ga" is an open rounded dome (∩); Baybayin "Ga" has a characteristic kink or step in its descending limb.',
      fil: 'Ang Kulitan "Ga" ay bukas na arko (∩); ang Baybayin "Ga" ay may kanto o liko sa kanang binti.',
    },
    feedbackTemplates: {
      high: {
        en: 'Flawless Kulitan "Ga"! Well-balanced inverted U-arch with smooth organic curvature.',
        fil: 'Napakagandang Kulitan "Ga"! Balanseng arko na bukas sa ilalim na may makinis na kurba.',
      },
      moderate: {
        en: 'Recognized as "Ga". Ensure the arch remains open at the bottom without any closing stroke.',
        fil: 'Kinilala bilang "Ga". Siguraduhing bukas ang ilalim at walang guhit na sumasara dito.',
      },
      needsPractice: {
        en: 'Needs practice on "Ga". Draw a clean, rounded open arch resembling an inverted U (∩).',
        fil: 'Kailangan ng pagsasanay sa "Ga". Gumuhit ng malinis na bukas na arko tulad ng pabaligtad na U (∩).',
      },
    },
  },

  nga: {
    latin: 'Nga',
    name: 'Nga',
    symbol: 'N',
    classification: 'Indung Sulat (Root Consonant)',
    pronunciation: '/ŋa/ as in "ngungut" (coconut)',
    anatomy: {
      en: 'A continuous horizontal undulating double-wave curve (similar to a rounded lowercase w or m sideways).',
      fil: 'Isang tuloy-tuloy na maalong dalawahang alon na pahiga (parang nakahigang W o M).',
    },
    strokeSequence: {
      en: [
        '1. Start left with the first crest.',
        '2. Drop into a trough and rise into the second crest in one fluid motion.',
      ],
      fil: [
        '1. Simulan sa kaliwa ang unang arko.',
        '2. Bumaba at umakyat sa ikalawang arko sa iisang tuloy-tuloy na guhit.',
      ],
    },
    commonMistakes: {
      en: [
        'Adding a third crest (which turns it into standalone vowel "U").',
        'Drawing sharp angular V-shapes instead of soft Brahmic ripples.',
      ],
      fil: [
        'Pagdaragdag ng ikatlong alon (nagiging patinig "U").',
        'Pagguhit ng matulis na V sa halip na malumanay na alon.',
      ],
    },
    baybayinDistinction: {
      en: 'Kulitan "Nga" has 2 smooth crests; Baybayin "Nga" (4) has a closed teardrop loop on the left.',
      fil: 'Ang Kulitan "Nga" ay may 2 malinis na alon; ang Baybayin "Nga" ay may buhol o bilog sa kaliwa.',
    },
    feedbackTemplates: {
      high: {
        en: 'Excellent "Nga"! Dual horizontal crests are proportionate and distinctly separated.',
        fil: 'Napakagaling na "Nga"! Ang dalawang alon ay pantay at malinaw ang pagkakahiwalay.',
      },
      moderate: {
        en: 'Identified as "Nga". Keep it strictly to two crests so it is not confused with vowel "U".',
        fil: 'Kinilala bilang "Nga". Panatilihing dalawang alon lamang upang hindi mapagkamalang "U".',
      },
      needsPractice: {
        en: 'Double-wave shape needs practice. Draw two continuous rounded horizontal ripples.',
        fil: 'Magsanay sa dalawahang alon. Gumuhit ng dalawang tuloy-tuloy na bilugang kurba.',
      },
    },
  },

  ta: {
    latin: 'Ta',
    name: 'Ta',
    symbol: 't',
    classification: 'Indung Sulat (Root Consonant)',
    pronunciation: '/ta/ as in "tau" (person)',
    anatomy: {
      en: 'An open C-shaped or top-curving dome terminating in an angled horizontal bottom base.',
      fil: 'Isang pabilog na kurba sa itaas na nagtatapos sa pahigang guhit sa ilalim.',
    },
    strokeSequence: {
      en: [
        '1. Begin with an upper rounded loop from left to center.',
        '2. Bring the stroke down and sweep horizontally across the base.',
      ],
      fil: [
        '1. Simulan sa pabilog na arko sa itaas mula kaliwa.',
        '2. Ibaba ang guhit at ihiga pakanan sa ilalim.',
      ],
    },
    commonMistakes: {
      en: [
        'Confusing with "Da" (which has an interior central step or notch).',
        'Leaving out the flat bottom base.',
      ],
      fil: [
        'Pagkakalito sa "Da" (na may liko o kanto sa gitna).',
        'Pagkakaiwan ng pahigang linya sa ilalim.',
      ],
    },
    baybayinDistinction: {
      en: 'Kulitan "Ta" has an angled bottom base; Baybayin "Ta" (ᜆ) has an internal center indentation.',
      fil: 'Ang Kulitan "Ta" ay may pahigang paa sa ilalim; ang Baybayin "Ta" (ᜆ) ay may lubog sa gitna.',
    },
    feedbackTemplates: {
      high: {
        en: 'Superb Kulitan "Ta"! Upper curve and horizontal lower foot form an authentic balance.',
        fil: 'Napakagandang Kulitan "Ta"! Ang itaas na arko at ibabang paa ay may tamang proporsyon.',
      },
      moderate: {
        en: 'Good "Ta". Make sure the lower base extends clearly to establish the glyph footprint.',
        fil: 'Magandang "Ta". Siguraduhing malinaw ang pahigang linya sa ilalim.',
      },
      needsPractice: {
        en: 'Form needs practice. Draw a smooth upper curve transitioning cleanly into a flat bottom base.',
        fil: 'Magsanay sa "Ta". Gumuhit ng arko sa itaas na lumiliko sa patag na linya sa ilalim.',
      },
    },
  },

  da: {
    latin: 'Da',
    name: 'Da / Ra',
    symbol: 'd',
    classification: 'Indung Sulat (Root Consonant)',
    pronunciation: '/da/ or /ra/ as in "dalan" (road)',
    anatomy: {
      en: 'An open angular box or bracket with an interior central step or notch.',
      fil: 'Isang bukas na parisukat o bracket na may kanto o liko sa gitnang loob.',
    },
    strokeSequence: {
      en: [
        '1. Draw top horizontal stroke.',
        '2. Descend with a middle indentation / step.',
        '3. Conclude with bottom horizontal stroke.',
      ],
      fil: [
        '1. Iguhit ang itaas na pahigang linya.',
        '2. Bumaba nang may liko o baytang sa gitna.',
        '3. Tapusin sa ibabang pahigang linya.',
      ],
    },
    commonMistakes: {
      en: [
        'Omitting the central notch (makes it look like a plain C or open square).',
        'Confusing with "Ta".',
      ],
      fil: [
        'Pag-iwan sa liko sa gitna (nagiging simpleng C o bukas na kahon).',
        'Pagkakalito sa titik "Ta".',
      ],
    },
    baybayinDistinction: {
      en: 'Kulitan "Da/Ra" uses an angular stepped bracket; Baybayin "Da" (ᜇ) is an open S-like curve.',
      fil: 'Ang Kulitan "Da/Ra" ay may baytang na bracket; ang Baybayin "Da" (ᜇ) ay hugis-S na kurba.',
    },
    feedbackTemplates: {
      high: {
        en: 'Accurate Kulitan "Da/Ra"! The central interior step is crisp and properly defined.',
        fil: 'Tumpak na Kulitan "Da/Ra"! Ang baytang o kanto sa gitna ay malinaw at maayos.',
      },
      moderate: {
        en: 'Detected "Da/Ra". Emphasize the middle notch so it is easily distinguished from "Ta".',
        fil: 'Kinilala bilang "Da/Ra". Mas palinawin ang kanto sa gitna upang maiba sa "Ta".',
      },
      needsPractice: {
        en: 'Needs practice on "Da/Ra". Include the central interior notch between top and bottom strokes.',
        fil: 'Magsanay sa "Da/Ra". Isama ang liko o baytang sa gitna sa pagitan ng itaas at ibabang linya.',
      },
    },
  },

  na: {
    latin: 'Na',
    name: 'Na',
    symbol: 'n',
    classification: 'Indung Sulat (Root Consonant)',
    pronunciation: '/na/ as in "nasi" (cooked rice)',
    anatomy: {
      en: 'A left-side downward arc with an upward sweeping right tail or hook.',
      fil: 'Isang pabilog na kurba pababa sa kaliwa na may paitaas na buntot sa kanan.',
    },
    strokeSequence: {
      en: [
        '1. Descend from top left curving through the base.',
        '2. Sweep smoothly upward and to the right in one fluid gesture.',
      ],
      fil: [
        '1. Bumaba mula itaas-kaliwa na kumukurba sa ilalim.',
        '2. I-arko pataas at pakanan sa iisang hagod.',
      ],
    },
    commonMistakes: {
      en: [
        'Closing the shape into an oval.',
        'Inverting the sweep direction.',
      ],
      fil: [
        'Pagsasara ng guhit na nagiging bilog.',
        'Pabaligtad na direksyon ng hagod.',
      ],
    },
    baybayinDistinction: {
      en: 'Kulitan "Na" is an open swooping curve; Baybayin "Na" (ᜈ) looks like a distinct arch with two legs.',
      fil: 'Ang Kulitan "Na" ay bukas na arko; ang Baybayin "Na" (ᜈ) ay may dalawang paa.',
    },
    feedbackTemplates: {
      high: {
        en: 'Beautiful Kulitan "Na"! Smooth descending contour with an energetic upward tail sweep.',
        fil: 'Napakagandang Kulitan "Na"! Makinis na kurba na may masiglang buntot pataas.',
      },
      moderate: {
        en: 'Recognized as "Na". Keep the right tail sweeping upward rather than flat.',
        fil: 'Kinilala bilang "Na". Panatilihing pataas ang kanang buntot sa halip na patag.',
      },
      needsPractice: {
        en: 'Practice the fluid motion of "Na". Do not close the bottom or break the stroke.',
        fil: 'Sanayin ang tuloy-tuloy na hagod ng "Na". Huwag isara ang ilalim.',
      },
    },
  },

  la: {
    latin: 'La',
    name: 'La',
    symbol: 'l',
    classification: 'Indung Sulat (Root Consonant)',
    pronunciation: '/la/ as in "lupa" (face)',
    anatomy: {
      en: 'A vertical spine beginning with an upper left curl and descending into an upward right hook.',
      fil: 'Isang patayong tangkay na may kurba sa itaas-kaliwa at kawit sa ibabang-kanan.',
    },
    strokeSequence: {
      en: [
        '1. Begin with an upper left curl.',
        '2. Descend down the central spine.',
        '3. Hook upward to the right.',
      ],
      fil: [
        '1. Magsimula sa maliit na kurba sa itaas-kaliwa.',
        '2. Bumaba sa gitnang tangkay.',
        '3. Ikawit pataas sa kanan.',
      ],
    },
    commonMistakes: {
      en: [
        'Drawing a straight letter "L".',
        'Confusing with "Sa" (which flows in an S-curve).',
      ],
      fil: [
        'Pagguhit ng simpleng titik "L".',
        'Pagkakalito sa "Sa" (na hugis-S ang buong katawan).',
      ],
    },
    baybayinDistinction: {
      en: 'Kulitan "La" has a vertical spine with bottom-right curl; Baybayin "La" (ᜎ) has a double heart-like top arch.',
      fil: 'Ang Kulitan "La" ay may patayong tangkay at kawit; ang Baybayin "La" (ᜎ) ay may dalawang arko sa itaas.',
    },
    feedbackTemplates: {
      high: {
        en: 'Classic Kulitan "La"! Strong central spine with proportionate terminal hook.',
        fil: 'Klasikong Kulitan "La"! Matatag na tangkay na may tamang sukat ng kawit sa dulo.',
      },
      moderate: {
        en: 'Identified as "La". Ensure the bottom hook is distinct from the main vertical stem.',
        fil: 'Kinilala bilang "La". Siguraduhing malinaw ang kawit sa ilalim mula sa gitnang tangkay.',
      },
      needsPractice: {
        en: 'Form needs practice. Start with upper curve, descend vertically, then hook upward right.',
        fil: 'Magsanay sa "La". Simulan sa itaas na kurba, bumaba nang patayo, at ikawit pakanan.',
      },
    },
  },

  sa: {
    latin: 'Sa',
    name: 'Sa',
    symbol: 's',
    classification: 'Indung Sulat (Root Consonant)',
    pronunciation: '/sa/ as in "salita" (word)',
    anatomy: {
      en: 'An elegant vertical S-shaped flowing serpentine curve with balanced upper and lower bays.',
      fil: 'Isang eleganteng hugis-S na pababang kurba na may balanseng arko sa itaas at ilalim.',
    },
    strokeSequence: {
      en: [
        '1. Curve from top right to left in the upper crest.',
        '2. Diagonal transition through the center.',
        '3. Curve from left to right in the bottom bowl.',
      ],
      fil: [
        '1. Kumurba mula itaas-kanan pakaliwa sa unang arko.',
        '2. Tumawid nang pahilis sa gitna.',
        '3. Kumurba pakanan sa ibabang arko.',
      ],
    },
    commonMistakes: {
      en: [
        'Drawing a rigid English "S" instead of the elongated Brahmic curve.',
        'Collapsing the center waist.',
      ],
      fil: [
        'Pagguhit ng maikling Ingles na "S" sa halip na mahabang sinaunang kurba.',
        'Pagpapakipot nang labis sa gitna.',
      ],
    },
    baybayinDistinction: {
      en: 'Kulitan "Sa" is a tall continuous S-ribbon; Baybayin "Sa" (ᜐ) has an angular split head.',
      fil: 'Ang Kulitan "Sa" ay tuloy-tuloy na hugis-S; ang Baybayin "Sa" (ᜐ) ay may biyak sa itaas.',
    },
    feedbackTemplates: {
      high: {
        en: 'Gorgeous Kulitan "Sa"! Excellent curvature balance between upper crest and lower tail.',
        fil: 'Napakagandang Kulitan "Sa"! Balanseng-balanse ang itaas at ibabang kurba.',
      },
      moderate: {
        en: 'Recognized as "Sa". Elongate the vertical stroke to match authentic Sulat Kapampangan height.',
        fil: 'Kinilala bilang "Sa". Bahagyang pahabain pababa ang guhit upang umangkop sa sukat ng Kulitan.',
      },
      needsPractice: {
        en: 'Practice the flowing S-contour. Maintain equal balance between top and bottom loops.',
        fil: 'Sanayin ang hugis-S na kurba. Panatilihing pantay ang laki ng itaas at ibabang arko.',
      },
    },
  },

  ma: {
    latin: 'Ma',
    name: 'Ma',
    symbol: 'm',
    classification: 'Indung Sulat (Root Consonant)',
    pronunciation: '/ma/ as in "malagu" (beautiful)',
    anatomy: {
      en: 'A double horizontal loop or infinity-like swirl (∞) linked by an interior bridge.',
      fil: 'Isang dalawahang bilog o hugis-infinity (∞) na pinagdurugtong sa gitna.',
    },
    strokeSequence: {
      en: [
        '1. Form the left circular or teardrop loop.',
        '2. Sweep through the central waist into the right circular loop in one continuous gesture.',
      ],
      fil: [
        '1. Buuin ang kaliwang bilog o patak.',
        '2. Tumawid sa gitna patungo sa kanang bilog sa iisang hagod.',
      ],
    },
    commonMistakes: {
      en: [
        'Drawing disjointed circles.',
        'Confusing with "Ba" (which has only a single loop).',
      ],
      fil: [
        'Pagguhit ng magkahiwalay na bilog.',
        'Pagkakalito sa "Ba" (na may iisang bilog lamang).',
      ],
    },
    baybayinDistinction: {
      en: 'Kulitan "Ma" has dual horizontal looping lobes; Baybayin "Ma" (ᜋ) resembles an open cup with a crown.',
      fil: 'Ang Kulitan "Ma" ay may dalawang pahigang buhol; ang Baybayin "Ma" (ᜋ) ay parang bukas na tasa.',
    },
    feedbackTemplates: {
      high: {
        en: 'Superb Kulitan "Ma"! Symmetrical dual loops with an authentic central junction.',
        fil: 'Napakagaling na Kulitan "Ma"! Pantay ang dalawang bilog at maayos ang dugtungan sa gitna.',
      },
      moderate: {
        en: 'Detected "Ma". Ensure both lobes have comparable size for harmonious balance.',
        fil: 'Kinilala bilang "Ma". Siguraduhing halos magkasinglaki ang dalawang bilog para sa magandang balanse.',
      },
      needsPractice: {
        en: 'Needs practice on "Ma". Draw a figure-eight or infinity-style dual loop horizontally.',
        fil: 'Magsanay sa "Ma". Gumuhit ng dalawang pahigang bilog na magkadugtong tulad ng infinity.',
      },
    },
  },

  pa: {
    latin: 'Pa',
    name: 'Pa',
    symbol: 'p',
    classification: 'Indung Sulat (Root Consonant)',
    pronunciation: '/pa/ as in "pusu" (heart)',
    anatomy: {
      en: 'A vertical descending spine looping upward on the right into a hook head, with an open bottom.',
      fil: 'Isang patayong tangkay na may kawit sa itaas-kanan, ngunit bukas ang ilalim.',
    },
    strokeSequence: {
      en: [
        '1. Descend with a firm vertical left spine.',
        '2. Loop upward to form the right hook or curl.',
      ],
      fil: [
        '1. Bumaba sa patayong kaliwang tangkay.',
        '2. Umarko pataas para sa kanang kawit.',
      ],
    },
    commonMistakes: {
      en: [
        'Closing the loop at the bottom (turns it into "Ba").',
        'Confusing with English "P" (where loop is closed at top).',
      ],
      fil: [
        'Pagsasara ng bilog sa ilalim (nagiging "Ba").',
        'Pagkakalito sa Ingles na "P" (kung saan nakasara ang bilog).',
      ],
    },
    baybayinDistinction: {
      en: 'Kulitan "Pa" is an open hook-descender; Baybayin "Pa" (ᜉ) resembles a bucket with an interior loop.',
      fil: 'Ang Kulitan "Pa" ay bukas na kawit; ang Baybayin "Pa" (ᜉ) ay parang timba na may kurbang paloob.',
    },
    feedbackTemplates: {
      high: {
        en: 'Accurate Kulitan "Pa"! Distinct vertical stem with an open terminal hook.',
        fil: 'Tumpak na Kulitan "Pa"! Malinaw ang patayong tangkay at bukas ang kawit sa dulo.',
      },
      moderate: {
        en: 'Identified as "Pa". Leave the hook open so it is not mistaken for closed loop "Ba".',
        fil: 'Kinilala bilang "Pa". Panatilihing bukas ang kawit upang hindi mapagkamalang "Ba".',
      },
      needsPractice: {
        en: 'Practice the stroke of "Pa". A descending spine with an open hook; do not close the loop.',
        fil: 'Sanayin ang guhit ng "Pa". Patayong linya na may bukas na kawit; huwag isara ang bilog.',
      },
    },
  },

  ba: {
    latin: 'Ba',
    name: 'Ba',
    symbol: 'b',
    classification: 'Indung Sulat (Root Consonant)',
    pronunciation: '/ba/ as in "bengi" (night)',
    anatomy: {
      en: 'A fully closed teardrop, droplet, or rounded oval loop with a pointed or cresting top.',
      fil: 'Isang nakasarang patak ng luha o pabilog na hugis na may patusok o matikas na dulo sa itaas.',
    },
    strokeSequence: {
      en: [
        '1. Start at the top apex.',
        '2. Descend around the rounded belly.',
        '3. Return to close completely at the apex.',
      ],
      fil: [
        '1. Magsimula sa itaas na dulo.',
        '2. Umikot pababa sa mabilog na tiyan.',
        '3. Bumalik at isara nang buo sa itaas.',
      ],
    },
    commonMistakes: {
      en: [
        'Leaving the loop open (makes it look like "Pa").',
        'Adding a center crossbar (which is Baybayin, not Kulitan).',
      ],
      fil: [
        'Pag-iwan na bukas ang bilog (nagiging "Pa").',
        'Paglalagay ng linya sa gitna (anyo ng Baybayin, hindi Kulitan).',
      ],
    },
    baybayinDistinction: {
      en: 'Kulitan "Ba" is a clean closed droplet (💧); Baybayin "Ba" (ᜊ) is shaped like a heart or kidney bean with an indentation.',
      fil: 'Ang Kulitan "Ba" ay saradong patak (💧); ang Baybayin "Ba" (ᜊ) ay hugis-puso na may lubog.',
    },
    feedbackTemplates: {
      high: {
        en: 'Spot-on Kulitan "Ba"! Seamlessly closed droplet form with classic Kapampangan proportions.',
        fil: 'Eksaktong Kulitan "Ba"! Malinis na saradong hugis-patak na may wastong proporsyon.',
      },
      moderate: {
        en: 'Recognized as "Ba". Ensure the loop is completely sealed at the top apex.',
        fil: 'Kinilala bilang "Ba". Siguraduhing ganap na nakasara ang bilog sa itaas.',
      },
      needsPractice: {
        en: 'Form needs practice on "Ba". Draw a closed teardrop shape; do not leave the contour open.',
        fil: 'Magsanay sa "Ba". Gumuhit ng saradong hugis-patak; huwag iwang bukas ang linya.',
      },
    },
  },
};

/**
 * Retrieves the distilled paleographic analysis for any recognized Kulitan syllable.
 */
export function getDistilledFeedback(
  latinKey: string,
  strokeAccuracy: 'High' | 'Moderate' | 'Needs Practice',
  language: 'EN' | 'FIL' = 'EN',
  neuralConfidence = 85
): string {
  const normalized = (latinKey || '').trim().toLowerCase();
  const entry = DISTILLED_KULITAN_KNOWLEDGE[normalized];

  if (!entry) {
    if (language === 'FIL') {
      return `Kinilala bilang ${latinKey.toUpperCase()} (${neuralConfidence}% Katumpakan). Sumunod sa pamantayang direksyon ng guhit sa Sulat Kapampangan.`;
    }
    return `Classified as ${latinKey.toUpperCase()} (${neuralConfidence}% Confidence). Follow standard Sulat Kapampangan stroke topology.`;
  }

  const langKey = language === 'FIL' ? 'fil' : 'en';

  if (strokeAccuracy === 'High') {
    return `${entry.feedbackTemplates.high[langKey]} ${entry.anatomy[langKey]}`;
  } else if (strokeAccuracy === 'Moderate') {
    return `${entry.feedbackTemplates.moderate[langKey]} ${entry.anatomy[langKey]}`;
  } else {
    const tip = entry.commonMistakes[langKey][0] || entry.anatomy[langKey];
    return `${entry.feedbackTemplates.needsPractice[langKey]} Paalala: ${tip}`;
  }
}
