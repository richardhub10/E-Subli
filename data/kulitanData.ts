export type SyllableData = {
  id: string;
  latin: string;
  kulitanSymbol: string;
  classification: string;
  definition: string;
  pronunciation: string;
  writingRule: string;
  exampleWord: string;
  exampleMeaning: string;
};

// Authentic Sulat Kapampangan (Kulitan) Syllabary and Orthography
export const kulitanSyllables: SyllableData[] = [
  {
    "id": "1",
    "latin": "a",
    "kulitanSymbol": "a",
    "classification": "Indung Patinig (Standalone Vowel)",
    "pronunciation": "/a/ as in \"abak\" (morning)",
    "definition": "Primary standalone vowel \"A\" in Sulat Kapampangan. Written at the beginning of words or independent vowel syllables.",
    "writingRule": "Downward curve starting top-left, looping into a bottom hook with an upward flourish.",
    "exampleWord": "Abak",
    "exampleMeaning": "Morning"
  },
  {
    "id": "2",
    "latin": "i",
    "kulitanSymbol": "i",
    "classification": "Indung Patinig (Standalone Vowel)",
    "pronunciation": "/i/ as in \"ingat\" (careful)",
    "definition": "Independent standalone vowel \"I\" / \"E\" in Sulat Kapampangan. Represents front high/mid vowels.",
    "writingRule": "Drawn with a horizontal wavy double-arch crown and a right downward vertical stem.",
    "exampleWord": "Ingat",
    "exampleMeaning": "Care / Beware"
  },
  {
    "id": "3",
    "latin": "u",
    "kulitanSymbol": "u",
    "classification": "Indung Patinig (Standalone Vowel)",
    "pronunciation": "/u/ as in \"ugat\" (root)",
    "definition": "Independent standalone vowel \"U\" / \"O\" in Sulat Kapampangan. Represents back rounded vowels.",
    "writingRule": "Three-crested flowing wave with upward-curving end tail.",
    "exampleWord": "Ugat",
    "exampleMeaning": "Root / Vein"
  },
  {
    "id": "4",
    "latin": "ka",
    "kulitanSymbol": "k",
    "classification": "Indung Sulat (Mother Consonant)",
    "pronunciation": "/ka/ as in \"kabyayan\" (livelihood)",
    "definition": "Root consonant \"Ka\" carrying inherent vowel /a/.",
    "writingRule": "Two horizontal parallel bars with a right-hand connector.",
    "exampleWord": "Kabyayan",
    "exampleMeaning": "Livelihood"
  },
  {
    "id": "5",
    "latin": "ki",
    "kulitanSymbol": "ki",
    "classification": "Anak Sulat (Upper Garlit -I/-E)",
    "pronunciation": "/ki/ as in \"kilala\" (known)",
    "definition": "Consonant \"Ka\" modified with upper Garlit for /i/ or /e/.",
    "writingRule": "Base \"Ka\" with an acute tick placed above.",
    "exampleWord": "Kilala",
    "exampleMeaning": "Acquaintance / Known"
  },
  {
    "id": "6",
    "latin": "ku",
    "kulitanSymbol": "ku",
    "classification": "Anak Sulat (Lower Garlit -U/-O)",
    "pronunciation": "/ku/ as in \"kuraldal\" (dance feast)",
    "definition": "Consonant \"Ka\" modified with lower Garlit for /u/ or /o/.",
    "writingRule": "Base \"Ka\" with a descending tick below.",
    "exampleWord": "Kuraldal",
    "exampleMeaning": "Sasamu Feast Dance"
  },
  {
    "id": "7",
    "latin": "kang",
    "kulitanSymbol": "kank",
    "classification": "Busal / Ligature (Final -ng)",
    "pronunciation": "/kaŋ/ as in \"kang\" (to you / for)",
    "definition": "Consonant \"Ka\" ligated with final nasal consonant -ng.",
    "writingRule": "Base \"Ka\" connected directly to the trailing \"Nga\" glyph.",
    "exampleWord": "Kang",
    "exampleMeaning": "For / To"
  },
  {
    "id": "8",
    "latin": "ga",
    "kulitanSymbol": "g",
    "classification": "Indung Sulat (Mother Consonant)",
    "pronunciation": "/ga/ as in \"gamat\" (hand)",
    "definition": "Root consonant \"Ga\" carrying inherent vowel /a/.",
    "writingRule": "Smooth inverted U-shaped arch (∩).",
    "exampleWord": "Gamat",
    "exampleMeaning": "Hand / Arm"
  },
  {
    "id": "9",
    "latin": "gi",
    "kulitanSymbol": "gi",
    "classification": "Anak Sulat (Upper Garlit -I/-E)",
    "pronunciation": "/gi/ as in \"ginu\" (lord)",
    "definition": "Consonant \"Ga\" modified with upper Garlit for /i/ or /e/.",
    "writingRule": "Base \"Ga\" arch with an acute tick placed above.",
    "exampleWord": "Ginu",
    "exampleMeaning": "Lord / Master"
  },
  {
    "id": "10",
    "latin": "gu",
    "kulitanSymbol": "gu",
    "classification": "Anak Sulat (Lower Garlit -U/-O)",
    "pronunciation": "/gu/ as in \"gulis\" (line)",
    "definition": "Consonant \"Ga\" modified with lower Garlit for /u/ or /o/.",
    "writingRule": "Base \"Ga\" arch with a descending tick below.",
    "exampleWord": "Gulis",
    "exampleMeaning": "Line / Stroke"
  },
  {
    "id": "11",
    "latin": "gang",
    "kulitanSymbol": "gang",
    "classification": "Busal / Ligature (Final -ng)",
    "pronunciation": "/gaŋ/ as in \"gang\" (border)",
    "definition": "Consonant \"Ga\" ligated with final nasal consonant -ng.",
    "writingRule": "Base \"Ga\" connected to trailing \"Nga\" glyph.",
    "exampleWord": "Gangan",
    "exampleMeaning": "Border"
  },
  {
    "id": "12",
    "latin": "nga",
    "kulitanSymbol": "N",
    "classification": "Indung Sulat (Mother Consonant)",
    "pronunciation": "/ŋa/ as in \"ngan\" (all)",
    "definition": "Root velar nasal \"Nga\" carrying inherent vowel /a/.",
    "writingRule": "Undulating triple wave flowing horizontally.",
    "exampleWord": "Ngan",
    "exampleMeaning": "All / Everyone"
  },
  {
    "id": "13",
    "latin": "ngi",
    "kulitanSymbol": "Ni",
    "classification": "Anak Sulat (Upper Garlit -I/-E)",
    "pronunciation": "/ŋi/ as in \"ngisi\" (smile)",
    "definition": "Consonant \"Nga\" modified with upper Garlit for /i/ or /e/.",
    "writingRule": "Base \"Nga\" with an acute tick placed above.",
    "exampleWord": "Ngisi",
    "exampleMeaning": "Smile / Grin"
  },
  {
    "id": "14",
    "latin": "ngu",
    "kulitanSymbol": "Nu",
    "classification": "Anak Sulat (Lower Garlit -U/-O)",
    "pronunciation": "/ŋu/ as in \"ngungut\" (coconut)",
    "definition": "Consonant \"Nga\" modified with lower Garlit for /u/ or /o/.",
    "writingRule": "Base \"Nga\" with a descending tick below.",
    "exampleWord": "Ngungut",
    "exampleMeaning": "Coconut"
  },
  {
    "id": "15",
    "latin": "ngang",
    "kulitanSymbol": "ngang",
    "classification": "Busal / Ligature (Final -ng)",
    "pronunciation": "/ŋaŋ/ as in \"ngang\"",
    "definition": "Consonant \"Nga\" doubled with trailing final nasal -ng.",
    "writingRule": "Interlocked undulating double-wave glyphs.",
    "exampleWord": "Ngang",
    "exampleMeaning": "Emphatic Particle"
  },
  {
    "id": "16",
    "latin": "ta",
    "kulitanSymbol": "t",
    "classification": "Indung Sulat (Mother Consonant)",
    "pronunciation": "/ta/ as in \"tau\" (person)",
    "definition": "Root consonant \"Ta\" carrying inherent vowel /a/.",
    "writingRule": "C-shaped loop with an angled bottom horizontal base.",
    "exampleWord": "Tau",
    "exampleMeaning": "Person / Human"
  },
  {
    "id": "17",
    "latin": "ti",
    "kulitanSymbol": "ti",
    "classification": "Anak Sulat (Upper Garlit -I/-E)",
    "pronunciation": "/ti/ as in \"tigtigan\" (music)",
    "definition": "Consonant \"Ta\" modified with upper Garlit for /i/ or /e/.",
    "writingRule": "Base \"Ta\" with an acute tick placed above.",
    "exampleWord": "Tigtigan",
    "exampleMeaning": "Music / Rhythm"
  },
  {
    "id": "18",
    "latin": "tu",
    "kulitanSymbol": "tu",
    "classification": "Anak Sulat (Lower Garlit -U/-O)",
    "pronunciation": "/tu/ as in \"tula\" (joy)",
    "definition": "Consonant \"Ta\" modified with lower Garlit for /u/ or /o/.",
    "writingRule": "Base \"Ta\" with a descending tick below.",
    "exampleWord": "Tula",
    "exampleMeaning": "Joy / Gladness"
  },
  {
    "id": "19",
    "latin": "tang",
    "kulitanSymbol": "tang",
    "classification": "Busal / Ligature (Final -ng)",
    "pronunciation": "/taŋ/ as in \"tangisan\" (weep)",
    "definition": "Consonant \"Ta\" ligated with final nasal consonant -ng.",
    "writingRule": "Base \"Ta\" connected to trailing \"Nga\" glyph.",
    "exampleWord": "Tangis",
    "exampleMeaning": "Cry / Weeping"
  },
  {
    "id": "20",
    "latin": "da",
    "kulitanSymbol": "d",
    "classification": "Indung Sulat (Mother Consonant)",
    "pronunciation": "/da/ or /ra/ as in \"dalan\" (path)",
    "definition": "Root consonant \"Da\" / \"Ra\" carrying inherent vowel /a/.",
    "writingRule": "Open box bracket with an interior central step flourish.",
    "exampleWord": "Dalan",
    "exampleMeaning": "Road / Way"
  },
  {
    "id": "21",
    "latin": "di",
    "kulitanSymbol": "di",
    "classification": "Anak Sulat (Upper Garlit -I/-E)",
    "pronunciation": "/di/ as in \"dilat\" (tongue)",
    "definition": "Consonant \"Da\" modified with upper Garlit for /i/ or /e/.",
    "writingRule": "Base \"Da\" with an acute tick placed above.",
    "exampleWord": "Dilat",
    "exampleMeaning": "Tongue / Lick"
  },
  {
    "id": "22",
    "latin": "du",
    "kulitanSymbol": "du",
    "classification": "Anak Sulat (Lower Garlit -U/-O)",
    "pronunciation": "/du/ as in \"duyan\" (hammock)",
    "definition": "Consonant \"Da\" modified with lower Garlit for /u/ or /o/.",
    "writingRule": "Base \"Da\" with a descending tick below.",
    "exampleWord": "Duyan",
    "exampleMeaning": "Cradle / Hammock"
  },
  {
    "id": "23",
    "latin": "dang",
    "kulitanSymbol": "dang",
    "classification": "Busal / Ligature (Final -ng)",
    "pronunciation": "/daŋ/ as in \"dangal\" (honor)",
    "definition": "Consonant \"Da\" ligated with final nasal consonant -ng.",
    "writingRule": "Base \"Da\" connected to trailing \"Nga\" glyph.",
    "exampleWord": "Dangal",
    "exampleMeaning": "Honor / Dignity"
  },
  {
    "id": "24",
    "latin": "na",
    "kulitanSymbol": "n",
    "classification": "Indung Sulat (Mother Consonant)",
    "pronunciation": "/na/ as in \"nana\" (mother/aunt)",
    "definition": "Root consonant \"Na\" carrying inherent vowel /a/.",
    "writingRule": "Central vertical post with an umbrella-like curved canopy.",
    "exampleWord": "Nanu",
    "exampleMeaning": "What"
  },
  {
    "id": "25",
    "latin": "ni",
    "kulitanSymbol": "ni",
    "classification": "Anak Sulat (Upper Garlit -I/-E)",
    "pronunciation": "/ni/ as in \"ninu\" (who)",
    "definition": "Consonant \"Na\" modified with upper Garlit for /i/ or /e/.",
    "writingRule": "Base \"Na\" with an acute tick placed above.",
    "exampleWord": "Ninu",
    "exampleMeaning": "Who"
  },
  {
    "id": "26",
    "latin": "nu",
    "kulitanSymbol": "nu",
    "classification": "Anak Sulat (Lower Garlit -U/-O)",
    "pronunciation": "/nu/ as in \"nukarin\" (where)",
    "definition": "Consonant \"Na\" modified with lower Garlit for /u/ or /o/.",
    "writingRule": "Base \"Na\" with a descending tick below.",
    "exampleWord": "Nukarin",
    "exampleMeaning": "Where"
  },
  {
    "id": "27",
    "latin": "nang",
    "kulitanSymbol": "nang",
    "classification": "Busal / Ligature (Final -ng)",
    "pronunciation": "/naŋ/ as in \"nang\"",
    "definition": "Consonant \"Na\" ligated with final nasal consonant -ng.",
    "writingRule": "Base \"Na\" connected to trailing \"Nga\" glyph.",
    "exampleWord": "Kapampangan",
    "exampleMeaning": "The Kapampangan People"
  },
  {
    "id": "28",
    "latin": "la",
    "kulitanSymbol": "l",
    "classification": "Indung Sulat (Mother Consonant)",
    "pronunciation": "/la/ as in \"lugud\" (love)",
    "definition": "Root consonant \"La\" carrying inherent vowel /a/.",
    "writingRule": "Vertical spine with two symmetrical downward branching arms.",
    "exampleWord": "Lugud",
    "exampleMeaning": "Love / Compassion"
  },
  {
    "id": "29",
    "latin": "li",
    "kulitanSymbol": "li",
    "classification": "Anak Sulat (Upper Garlit -I/-E)",
    "pronunciation": "/li/ as in \"lihim\" (secret)",
    "definition": "Consonant \"La\" modified with upper Garlit for /i/ or /e/.",
    "writingRule": "Base \"La\" with an acute tick placed above.",
    "exampleWord": "Lihim",
    "exampleMeaning": "Secret"
  },
  {
    "id": "30",
    "latin": "lu",
    "kulitanSymbol": "lu",
    "classification": "Anak Sulat (Lower Garlit -U/-O)",
    "pronunciation": "/lu/ as in \"lupa\" (face)",
    "definition": "Consonant \"La\" modified with lower Garlit for /u/ or /o/.",
    "writingRule": "Base \"La\" with a descending tick below.",
    "exampleWord": "Lupa",
    "exampleMeaning": "Face"
  },
  {
    "id": "31",
    "latin": "lang",
    "kulitanSymbol": "lang",
    "classification": "Busal / Ligature (Final -ng)",
    "pronunciation": "/laŋ/ as in \"lang\"",
    "definition": "Consonant \"La\" ligated with final nasal consonant -ng.",
    "writingRule": "Base \"La\" connected to trailing \"Nga\" glyph.",
    "exampleWord": "Alang",
    "exampleMeaning": "None / Without"
  },
  {
    "id": "32",
    "latin": "sa",
    "kulitanSymbol": "s",
    "classification": "Indung Sulat (Mother Consonant)",
    "pronunciation": "/sa/ as in \"sulat\" (write)",
    "definition": "Root consonant \"Sa\" carrying inherent vowel /a/.",
    "writingRule": "Number-3 shaped flowing double-looped glyph.",
    "exampleWord": "Sulat",
    "exampleMeaning": "Write / Script"
  },
  {
    "id": "33",
    "latin": "si",
    "kulitanSymbol": "si",
    "classification": "Anak Sulat (Upper Garlit -I/-E)",
    "pronunciation": "/si/ as in \"sinup\" (save / treasure)",
    "definition": "Consonant \"Sa\" modified with upper Garlit for /i/ or /e/.",
    "writingRule": "Base \"Sa\" with an acute tick placed above.",
    "exampleWord": "Sinup",
    "exampleMeaning": "Keep / Save"
  },
  {
    "id": "34",
    "latin": "su",
    "kulitanSymbol": "su",
    "classification": "Anak Sulat (Lower Garlit -U/-O)",
    "pronunciation": "/su/ as in \"subli\" (inherit / revive)",
    "definition": "Consonant \"Sa\" modified with lower Garlit for /u/ or /o/.",
    "writingRule": "Base \"Sa\" with a descending tick below.",
    "exampleWord": "Subli",
    "exampleMeaning": "Inherit / Return / Revive"
  },
  {
    "id": "35",
    "latin": "sang",
    "kulitanSymbol": "sang",
    "classification": "Busal / Ligature (Final -ng)",
    "pronunciation": "/saŋ/ as in \"sangkap\" (ingredient)",
    "definition": "Consonant \"Sa\" ligated with final nasal consonant -ng.",
    "writingRule": "Base \"Sa\" connected to trailing \"Nga\" glyph.",
    "exampleWord": "Masanting",
    "exampleMeaning": "Handsome / Beautiful"
  },
  {
    "id": "36",
    "latin": "ma",
    "kulitanSymbol": "m",
    "classification": "Indung Sulat (Mother Consonant)",
    "pronunciation": "/ma/ as in \"mayap\" (good)",
    "definition": "Root consonant \"Ma\" carrying inherent vowel /a/.",
    "writingRule": "Diagonal slash crossed by an intersecting curved horizontal crossbar.",
    "exampleWord": "Mayap",
    "exampleMeaning": "Good / Fine"
  },
  {
    "id": "37",
    "latin": "mi",
    "kulitanSymbol": "mi",
    "classification": "Anak Sulat (Upper Garlit -I/-E)",
    "pronunciation": "/mi/ as in \"minum\" (drink)",
    "definition": "Consonant \"Ma\" modified with upper Garlit for /i/ or /e/.",
    "writingRule": "Base \"Ma\" with an acute tick placed above.",
    "exampleWord": "Minum",
    "exampleMeaning": "Drink"
  },
  {
    "id": "38",
    "latin": "mu",
    "kulitanSymbol": "mu",
    "classification": "Anak Sulat (Lower Garlit -U/-O)",
    "pronunciation": "/mu/ as in \"mura\" (cheap/young)",
    "definition": "Consonant \"Ma\" modified with lower Garlit for /u/ or /o/.",
    "writingRule": "Base \"Ma\" with a descending tick below.",
    "exampleWord": "Mura",
    "exampleMeaning": "Cheap / Fresh"
  },
  {
    "id": "39",
    "latin": "mang",
    "kulitanSymbol": "mang",
    "classification": "Busal / Ligature (Final -ng)",
    "pronunciation": "/maŋ/ as in \"mangan\" (eat)",
    "definition": "Consonant \"Ma\" ligated with final nasal consonant -ng.",
    "writingRule": "Base \"Ma\" connected to trailing \"Nga\" glyph.",
    "exampleWord": "Mangan",
    "exampleMeaning": "Eat / Dine"
  },
  {
    "id": "40",
    "latin": "pa",
    "kulitanSymbol": "p",
    "classification": "Indung Sulat (Mother Consonant)",
    "pronunciation": "/pa/ as in \"pamangan\" (food)",
    "definition": "Root consonant \"Pa\" carrying inherent vowel /a/.",
    "writingRule": "Checkmark-like upward sweep ending in a right flourish.",
    "exampleWord": "Pamangan",
    "exampleMeaning": "Food / Feast"
  },
  {
    "id": "41",
    "latin": "pi",
    "kulitanSymbol": "pi",
    "classification": "Anak Sulat (Upper Garlit -I/-E)",
    "pronunciation": "/pi/ as in \"pisan\" (cousin)",
    "definition": "Consonant \"Pa\" modified with upper Garlit for /i/ or /e/.",
    "writingRule": "Base \"Pa\" with an acute tick placed above.",
    "exampleWord": "Pisan",
    "exampleMeaning": "Cousin"
  },
  {
    "id": "42",
    "latin": "pu",
    "kulitanSymbol": "pu",
    "classification": "Anak Sulat (Lower Garlit -U/-O)",
    "pronunciation": "/pu/ as in \"pusu\" (heart)",
    "definition": "Consonant \"Pa\" modified with lower Garlit for /u/ or /o/.",
    "writingRule": "Base \"Pa\" with a descending tick below.",
    "exampleWord": "Pusu",
    "exampleMeaning": "Heart"
  },
  {
    "id": "43",
    "latin": "pang",
    "kulitanSymbol": "pang",
    "classification": "Busal / Ligature (Final -ng)",
    "pronunciation": "/paŋ/ as in \"panganiban\" (peril)",
    "definition": "Consonant \"Pa\" ligated with final nasal consonant -ng.",
    "writingRule": "Base \"Pa\" connected to trailing \"Nga\" glyph.",
    "exampleWord": "Panganiban",
    "exampleMeaning": "Peril / Danger"
  },
  {
    "id": "44",
    "latin": "ba",
    "kulitanSymbol": "b",
    "classification": "Indung Sulat (Mother Consonant)",
    "pronunciation": "/ba/ as in \"balen\" (town)",
    "definition": "Root consonant \"Ba\" carrying inherent vowel /a/.",
    "writingRule": "Closed oval circle (O).",
    "exampleWord": "Balen",
    "exampleMeaning": "Town / Homeland"
  },
  {
    "id": "45",
    "latin": "bi",
    "kulitanSymbol": "bi",
    "classification": "Anak Sulat (Upper Garlit -I/-E)",
    "pronunciation": "/bi/ as in \"bitis\" (feet)",
    "definition": "Consonant \"Ba\" modified with upper Garlit for /i/ or /e/.",
    "writingRule": "Base \"Ba\" oval with an acute tick placed above.",
    "exampleWord": "Bitis",
    "exampleMeaning": "Feet / Legs"
  },
  {
    "id": "46",
    "latin": "bu",
    "kulitanSymbol": "bu",
    "classification": "Anak Sulat (Lower Garlit -U/-O)",
    "pronunciation": "/bu/ as in \"bukas\" (tomorrow)",
    "definition": "Consonant \"Ba\" modified with lower Garlit for /u/ or /o/.",
    "writingRule": "Base \"Ba\" oval with a descending tick below.",
    "exampleWord": "Bukas",
    "exampleMeaning": "Tomorrow"
  },
  {
    "id": "47",
    "latin": "bang",
    "kulitanSymbol": "bang",
    "classification": "Busal / Ligature (Final -ng)",
    "pronunciation": "/baŋ/ as in \"bangan\" (granary)",
    "definition": "Consonant \"Ba\" ligated with final nasal consonant -ng.",
    "writingRule": "Base \"Ba\" connected to trailing \"Nga\" glyph.",
    "exampleWord": "Bangan",
    "exampleMeaning": "Storehouse / Granary"
  }
];
