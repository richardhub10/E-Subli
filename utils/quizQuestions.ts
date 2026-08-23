export type QuestionCategory = 'all' | 'basics' | 'kudlits' | 'words';

export type QuizQuestion = {
  id?: string;
  kapampangan: string;
  correct: string;
  options: string[];
  category?: 'basics' | 'kudlits' | 'words';
  syllables?: string;
};

// 1. BASICS: Standalone Vowels & Root Consonants
export const BASICS_POOL: QuizQuestion[] = [
  { kapampangan: 'A', correct: 'Vowel A', options: ['Vowel A', 'Vowel I / E', 'Vowel U / O', 'Syllable Ka'], category: 'basics', syllables: 'A' },
  { kapampangan: 'I', correct: 'Vowel I / E', options: ['Vowel I / E', 'Vowel U / O', 'Vowel A', 'Syllable Ga'], category: 'basics', syllables: 'I' },
  { kapampangan: 'U', correct: 'Vowel U / O', options: ['Vowel U / O', 'Vowel A', 'Vowel I / E', 'Syllable Nga'], category: 'basics', syllables: 'U' },
  { kapampangan: 'Ka', correct: 'Syllable Ka', options: ['Syllable Ka', 'Syllable Ga', 'Syllable Ta', 'Syllable Ba'], category: 'basics', syllables: 'Ka' },
  { kapampangan: 'Ga', correct: 'Syllable Ga', options: ['Syllable Ga', 'Syllable Ka', 'Syllable Na', 'Syllable La'], category: 'basics', syllables: 'Ga' },
  { kapampangan: 'Ta', correct: 'Syllable Ta', options: ['Syllable Ta', 'Syllable Da / Ra', 'Syllable Sa', 'Syllable Pa'], category: 'basics', syllables: 'Ta' },
  { kapampangan: 'Da', correct: 'Syllable Da / Ra', options: ['Syllable Da / Ra', 'Syllable Ta', 'Syllable Ba', 'Syllable Ma'], category: 'basics', syllables: 'Da' },
  { kapampangan: 'Na', correct: 'Syllable Na', options: ['Syllable Na', 'Syllable La', 'Syllable Nga', 'Syllable Ga'], category: 'basics', syllables: 'Na' },
  { kapampangan: 'La', correct: 'Syllable La', options: ['Syllable La', 'Syllable Na', 'Syllable Sa', 'Syllable Pa'], category: 'basics', syllables: 'La' },
  { kapampangan: 'Sa', correct: 'Syllable Sa', options: ['Syllable Sa', 'Syllable Ma', 'Syllable Ba', 'Syllable Ta'], category: 'basics', syllables: 'Sa' },
  { kapampangan: 'Ma', correct: 'Syllable Ma', options: ['Syllable Ma', 'Syllable Pa', 'Syllable Ba', 'Syllable Ka'], category: 'basics', syllables: 'Ma' },
  { kapampangan: 'Pa', correct: 'Syllable Pa', options: ['Syllable Pa', 'Syllable Ma', 'Syllable Ba', 'Syllable Ga'], category: 'basics', syllables: 'Pa' },
  { kapampangan: 'Ba', correct: 'Syllable Ba', options: ['Syllable Ba', 'Syllable Pa', 'Syllable Ka', 'Syllable Sa'], category: 'basics', syllables: 'Ba' },
  { kapampangan: 'Nga', correct: 'Syllable Nga', options: ['Syllable Nga', 'Syllable Na', 'Syllable Ga', 'Syllable La'], category: 'basics', syllables: 'Nga' },
];

// 2. KUDLITS: Modified Consonants with Garlit Marks
export const KUDLITS_POOL: QuizQuestion[] = [
  { kapampangan: 'Ki', correct: 'Ka + Upper Garlit (Ki / Ke)', options: ['Ka + Upper Garlit (Ki / Ke)', 'Ka + Lower Garlit (Ku / Ko)', 'Ga + Upper Garlit (Gi / Ge)', 'Ta + Upper Garlit (Ti / Te)'], category: 'kudlits', syllables: 'Ki' },
  { kapampangan: 'Ku', correct: 'Ka + Lower Garlit (Ku / Ko)', options: ['Ka + Lower Garlit (Ku / Ko)', 'Ka + Upper Garlit (Ki / Ke)', 'Ba + Lower Garlit (Bu / Bo)', 'Pa + Lower Garlit (Pu / Po)'], category: 'kudlits', syllables: 'Ku' },
  { kapampangan: 'Gi', correct: 'Ga + Upper Garlit (Gi / Ge)', options: ['Ga + Upper Garlit (Gi / Ge)', 'Ga + Lower Garlit (Gu / Go)', 'Ka + Upper Garlit (Ki / Ke)', 'Da + Upper Garlit (Di / De)'], category: 'kudlits', syllables: 'Gi' },
  { kapampangan: 'Gu', correct: 'Ga + Lower Garlit (Gu / Go)', options: ['Ga + Lower Garlit (Gu / Go)', 'Ga + Upper Garlit (Gi / Ge)', 'La + Lower Garlit (Lu / Lo)', 'Sa + Lower Garlit (Su / So)'], category: 'kudlits', syllables: 'Gu' },
  { kapampangan: 'Ti', correct: 'Ta + Upper Garlit (Ti / Te)', options: ['Ta + Upper Garlit (Ti / Te)', 'Ta + Lower Garlit (Tu / To)', 'Da + Upper Garlit (Di / De)', 'Na + Upper Garlit (Ni / Ne)'], category: 'kudlits', syllables: 'Ti' },
  { kapampangan: 'Tu', correct: 'Ta + Lower Garlit (Tu / To)', options: ['Ta + Lower Garlit (Tu / To)', 'Ta + Upper Garlit (Ti / Te)', 'Pa + Lower Garlit (Pu / Po)', 'Ba + Lower Garlit (Bu / Bo)'], category: 'kudlits', syllables: 'Tu' },
  { kapampangan: 'Di', correct: 'Da + Upper Garlit (Di / De)', options: ['Da + Upper Garlit (Di / De)', 'Da + Lower Garlit (Du / Do)', 'Ta + Upper Garlit (Ti / Te)', 'La + Upper Garlit (Li / Le)'], category: 'kudlits', syllables: 'Di' },
  { kapampangan: 'Du', correct: 'Da + Lower Garlit (Du / Do)', options: ['Da + Lower Garlit (Du / Do)', 'Da + Upper Garlit (Di / De)', 'Ma + Lower Garlit (Mu / Mo)', 'Na + Lower Garlit (Nu / No)'], category: 'kudlits', syllables: 'Du' },
  { kapampangan: 'Ni', correct: 'Na + Upper Garlit (Ni / Ne)', options: ['Na + Upper Garlit (Ni / Ne)', 'Na + Lower Garlit (Nu / No)', 'La + Upper Garlit (Li / Le)', 'Nga + Upper Garlit (Ngi / Nge)'], category: 'kudlits', syllables: 'Ni' },
  { kapampangan: 'Nu', correct: 'Na + Lower Garlit (Nu / No)', options: ['Na + Lower Garlit (Nu / No)', 'Na + Upper Garlit (Ni / Ne)', 'La + Lower Garlit (Lu / Lo)', 'Sa + Lower Garlit (Su / So)'], category: 'kudlits', syllables: 'Nu' },
  { kapampangan: 'Li', correct: 'La + Upper Garlit (Li / Le)', options: ['La + Upper Garlit (Li / Le)', 'La + Lower Garlit (Lu / Lo)', 'Sa + Upper Garlit (Si / Se)', 'Pa + Upper Garlit (Pi / Pe)'], category: 'kudlits', syllables: 'Li' },
  { kapampangan: 'Lu', correct: 'La + Lower Garlit (Lu / Lo)', options: ['La + Lower Garlit (Lu / Lo)', 'La + Upper Garlit (Li / Le)', 'Pa + Lower Garlit (Pu / Po)', 'Ba + Lower Garlit (Bu / Bo)'], category: 'kudlits', syllables: 'Lu' },
  { kapampangan: 'Si', correct: 'Sa + Upper Garlit (Si / Se)', options: ['Sa + Upper Garlit (Si / Se)', 'Sa + Lower Garlit (Su / So)', 'Ma + Upper Garlit (Mi / Me)', 'Ba + Upper Garlit (Bi / Be)'], category: 'kudlits', syllables: 'Si' },
  { kapampangan: 'Su', correct: 'Sa + Lower Garlit (Su / So)', options: ['Sa + Lower Garlit (Su / So)', 'Sa + Upper Garlit (Si / Se)', 'Ma + Lower Garlit (Mu / Mo)', 'Ta + Lower Garlit (Tu / To)'], category: 'kudlits', syllables: 'Su' },
  { kapampangan: 'Mi', correct: 'Ma + Upper Garlit (Mi / Me)', options: ['Ma + Upper Garlit (Mi / Me)', 'Ma + Lower Garlit (Mu / Mo)', 'Pa + Upper Garlit (Pi / Pe)', 'Na + Upper Garlit (Ni / Ne)'], category: 'kudlits', syllables: 'Mi' },
  { kapampangan: 'Mu', correct: 'Ma + Lower Garlit (Mu / Mo)', options: ['Ma + Lower Garlit (Mu / Mo)', 'Ma + Upper Garlit (Mi / Me)', 'Ba + Lower Garlit (Bu / Bo)', 'Da + Lower Garlit (Du / Do)'], category: 'kudlits', syllables: 'Mu' },
  { kapampangan: 'Pi', correct: 'Pa + Upper Garlit (Pi / Pe)', options: ['Pa + Upper Garlit (Pi / Pe)', 'Pa + Lower Garlit (Pu / Po)', 'Ba + Upper Garlit (Bi / Be)', 'Ta + Upper Garlit (Ti / Te)'], category: 'kudlits', syllables: 'Pi' },
  { kapampangan: 'Pu', correct: 'Pa + Lower Garlit (Pu / Po)', options: ['Pa + Lower Garlit (Pu / Po)', 'Pa + Upper Garlit (Pi / Pe)', 'Ba + Lower Garlit (Bu / Bo)', 'Ka + Lower Garlit (Ku / Ko)'], category: 'kudlits', syllables: 'Pu' },
  { kapampangan: 'Bi', correct: 'Ba + Upper Garlit (Bi / Be)', options: ['Ba + Upper Garlit (Bi / Be)', 'Ba + Lower Garlit (Bu / Bo)', 'Pa + Upper Garlit (Pi / Pe)', 'Ma + Upper Garlit (Mi / Me)'], category: 'kudlits', syllables: 'Bi' },
  { kapampangan: 'Bu', correct: 'Ba + Lower Garlit (Bu / Bo)', options: ['Ba + Lower Garlit (Bu / Bo)', 'Ba + Upper Garlit (Bi / Be)', 'Pa + Lower Garlit (Pu / Po)', 'Ga + Lower Garlit (Gu / Go)'], category: 'kudlits', syllables: 'Bu' },
];

// 3. WORDS: Vocabulary Words & Phrases (with challenging, contextually plausible distractors)
export const WORDS_POOL: QuizQuestion[] = [
  { kapampangan: 'Kaluguran', correct: 'Love / Beloved (Mahal)', options: ['Love / Beloved (Mahal)', 'Friend / Companion (Kaibigan)', 'Kinship / Family (Pamilya)', 'Devotion / Faith (Pananalig)'], category: 'words', syllables: 'Ka • lu • gu • ran' },
  { kapampangan: 'Mayap', correct: 'Good / Fine (Mabuti)', options: ['Good / Fine (Mabuti)', 'Beautiful / Fair (Maganda)', 'True / Genuine (Tunay)', 'Pure / Clean (Malinis)'], category: 'words', syllables: 'Ma • yap' },
  { kapampangan: 'Abak', correct: 'Morning (Umaga)', options: ['Morning (Umaga)', 'Evening / Night (Gabi)', 'Afternoon (Hapon)', 'Noon (Tanghali)'], category: 'words', syllables: 'A • bak' },
  { kapampangan: 'Bengi', correct: 'Night / Evening (Gabi)', options: ['Night / Evening (Gabi)', 'Morning (Umaga)', 'Dawn (Madaling araw)', 'Dusk (Takipsilim)'], category: 'words', syllables: 'Be • ngi' },
  { kapampangan: 'Balen', correct: 'Town / Nation (Bayan)', options: ['Town / Nation (Bayan)', 'Household / Home (Bahay)', 'School (Paaralan)', 'Sacred Place (Simbahan)'], category: 'words', syllables: 'Ba • len' },
  { kapampangan: 'Luid', correct: 'Long live / Prosper (Mabuhay)', options: ['Long live / Prosper (Mabuhay)', 'Peace / Farewell (Paalam)', 'Gratitude (Salamat)', 'Welcome (Tuloy po kayo)'] , category: 'words', syllables: 'Lu • id' },
  { kapampangan: 'Salamat', correct: 'Thank you (Salamat)', options: ['Thank you (Salamat)', 'Pardon / Forgive (Patawad)', 'Please / Favor (Pakiusap)', 'Greetings (Pagbati)'], category: 'words', syllables: 'Sa • la • mat' },
  { kapampangan: 'Sulu', correct: 'Light / Torch (Ilaw / Tanglaw)', options: ['Light / Torch (Ilaw / Tanglaw)', 'Shadow / Dark (Dilim)', 'Flame / Fire (Apoy)', 'Sunlight (Sikat ng Araw)'], category: 'words', syllables: 'Su • lu' },
  { kapampangan: 'Gamat', correct: 'Hand / Arm (Kamay)', options: ['Hand / Arm (Kamay)', 'Foot / Leg (Paa / Binti)', 'Face / Head (Mukha / Ulo)', 'Shoulder (Balikat)'], category: 'words', syllables: 'Ga • mat' },
  { kapampangan: 'Bitis', correct: 'Foot / Leg (Paa / Binti)', options: ['Foot / Leg (Paa / Binti)', 'Hand / Arm (Kamay)', 'Chest (Dibdib)', 'Spine / Back (Likod)'], category: 'words', syllables: 'Bi • tis' },
  { kapampangan: 'Pipumpunan', correct: 'Ancestors / Heritage (Mga Ninuno)', options: ['Ancestors / Heritage (Mga Ninuno)', 'Descendants (Mga Apo)', 'Children (Mga Anak)', 'Siblings (Mga Kapatid)'], category: 'words', syllables: 'Pi • pum • pu • nan' },
  { kapampangan: 'Alingasngas', correct: 'Gossip / Rumor (Tsismis / Alingasngas)', options: ['Gossip / Rumor (Tsismis / Alingasngas)', 'Quietness (Katahimikan)', 'Folklore (Kwentong Bayan)', 'Poetry / Chant (Tula)'], category: 'words', syllables: 'A • li • ngas • ngas' },
  { kapampangan: 'Pamangamanu', correct: 'Language / Speech (Wika / Pananalita)', options: ['Language / Speech (Wika / Pananalita)', 'Song / Hymn (Awit)', 'Letter / Script (Liham)', 'Storytelling (Pagsasalaysay)'], category: 'words', syllables: 'Pa • ma • nga • ma • nu' },
  { kapampangan: 'Dayat-malat', correct: 'Sea / Ocean (Dagat)', options: ['Sea / Ocean (Dagat)', 'River / Stream (Ilog)', 'Lake (Lawa)', 'Waterfall (Talon)'], category: 'words', syllables: 'Da • yat • ma • lat' },
  { kapampangan: 'Sampaga', correct: 'Flower / Blossom (Bulaklak)', options: ['Flower / Blossom (Bulaklak)', 'Foliage / Leaf (Dahon)', 'Tree (Puno)', 'Seed / Fruit (Bunga)'], category: 'words', syllables: 'Sam • pa • ga' },
  { kapampangan: 'Batuin', correct: 'Star / Celestial (Bituin)', options: ['Star / Celestial (Bituin)', 'Moon / Lunar (Buwan)', 'Sun / Solar (Araw)', 'Cloud / Mist (Ulap)'], category: 'words', syllables: 'Ba • tu • in' },
  { kapampangan: 'Buntuk', correct: 'Head / Forehead (Ulo / Noo)', options: ['Head / Forehead (Ulo / Noo)', 'Foot / Sole (Paa)', 'Stomach / Core (Tiyan)', 'Chest (Dibdib)'], category: 'words', syllables: 'Bun • tuk' },
  { kapampangan: 'Sibul', correct: 'Water Spring / Fountain (Bukal)', options: ['Water Spring / Fountain (Bukal)', 'Rainfall (Ulan)', 'Ocean (Dagat)', 'River (Ilog)'], category: 'words', syllables: 'Si • bul' },
  { kapampangan: 'Kapatad', correct: 'Sibling / Brethren (Kapatid)', options: ['Sibling / Brethren (Kapatid)', 'First Cousin (Pinsan)', 'Close Friend (Kaibigan)', 'Elder / Parent (Magulang)'], category: 'words', syllables: 'Ka • pa • tad' },
  { kapampangan: 'Mangabiran', correct: 'Being Biased / Partial (May Kinikilingan)', options: ['Being Biased / Partial (May Kinikilingan)', 'Rage / Wrath (Galit)', 'Deceitful (Manloloko)', 'Hesitant (Nag-aalangan)'], category: 'words', syllables: 'Ma • nga • bi • ran' },
  { kapampangan: 'Salangian', correct: 'To Light Up / Ignite (Sindihan)', options: ['To Light Up / Ignite (Sindihan)', 'To Extinguish (Patayin)', 'To Kindle / Fan (Paypayan)', 'To Burn down (Sunugin)'], category: 'words', syllables: 'Sa • la • ngi • an' },
  { kapampangan: 'Makabayat', correct: 'Heavy / Burdensome (Mabigat)', options: ['Heavy / Burdensome (Mabigat)', 'Light / Weightless (Magaan)', 'Dense / Solid (Siksik)', 'Broad / Wide (Malapad)'], category: 'words', syllables: 'Ma • ka • ba • yat' },
  { kapampangan: 'Makatuknang', correct: 'Residing / Inhabiting (Nakatira)', options: ['Residing / Inhabiting (Nakatira)', 'Laboring / Working (Nagtatrabaho)', 'Resting (Nagpapahinga)', 'Visiting (Bumisita)'], category: 'words', syllables: 'Ma • ka • tuk • nang' },
  { kapampangan: 'Salapian', correct: 'Wealthy / Prosperous (Mayaman)', options: ['Wealthy / Prosperous (Mayaman)', 'Impoverished (Mahirap)', 'Hardworking (Masipag)', 'Honorable (Marangal)'], category: 'words', syllables: 'Sa • la • pi • an' },
  { kapampangan: 'Katatawanan', correct: 'Truth / Reality (Katotohanan)', options: ['Truth / Reality (Katotohanan)', 'Falsehood / Lie (Kasinungalingan)', 'Illusion / Dream (Panaginip)', 'Mystery / Secret (Lihim)'], category: 'words', syllables: 'Ka • ta • ta • wa • nan' },
  { kapampangan: 'Paglalawen', correct: 'Gazing At / Observing (Pinagmamasdan)', options: ['Gazing At / Observing (Pinagmamasdan)', 'Ignoring / Neglecting (Binabalewala)', 'Listening Carefully (Pinakikinggan)', 'Contemplating (Iniisip)'], category: 'words', syllables: 'Pag • la • la • wen' },
  { kapampangan: 'Kamalig', correct: 'Granary / Barn (Bangan / Kamalig)', options: ['Granary / Barn (Bangan / Kamalig)', 'Dwelling / Cottage (Bahay)', 'Marketplace (Palengke)', 'Altar / Shrine (Dambana)'], category: 'words', syllables: 'Ka • ma • lig' },
  { kapampangan: 'Makapangilabut', correct: 'Terrifying / Dreadful (Nakakatakot)', options: ['Terrifying / Dreadful (Nakakatakot)', 'Astonishing (Kahanga-hanga)', 'Desolate / Lonely (Nakalulungkot)', 'Dangerous (Mapanganib)'], category: 'words', syllables: 'Ma • ka • pa • ngi • la • but' },
  { kapampangan: 'Sasalikut', correct: 'Hiding / Concealing (Nagtatago)', options: ['Hiding / Concealing (Nagtatago)', 'Searching / Hunting (Naghahanap)', 'Escaping / Fleeing (Tumatakas)', 'Watching (Nagmamasid)'], category: 'words', syllables: 'Sa • sa • li • kut' },
  { kapampangan: 'Alipugpug', correct: 'Whirlwind / Cyclone (Ipu-ipo)', options: ['Whirlwind / Cyclone (Ipu-ipo)', 'Monsoon Rain (Habagat)', 'Thunderstorm (Kulog at Kidlat)', 'Dense Fog (Makapal na Ulap)'], category: 'words', syllables: 'A • li • pug • pug' },
  { kapampangan: 'Yamut', correct: 'Plant Root (Ugat)', options: ['Plant Root (Ugat)', 'Branch / Limb (Sangá)', 'Leaf (Dahon)', 'Bark (Balat ng Kahoy)'], category: 'words', syllables: 'Ya • mut' },
  { kapampangan: 'Makatapak', correct: 'Barefoot (Nakayapak)', options: ['Barefoot (Nakayapak)', 'Shod / With Footwear (Nakasapatos)', 'Bound / Shackled (Nakatali)', 'Walking Slowly (Dahan-dahan)'], category: 'words', syllables: 'Ma • ka • ta • pak' },
  { kapampangan: 'Timawa', correct: 'Free / Liberated (Malaya)', options: ['Free / Liberated (Malaya)', 'Enslaved / Captive (Alipin)', 'Exiled (Pinalayas)', 'Pauper / Beggar (Pulubi)'], category: 'words', syllables: 'Ti • ma • wa' },
];

export const QUIZ_POOL: QuizQuestion[] = [...BASICS_POOL, ...KUDLITS_POOL, ...WORDS_POOL];

export const getRandomQuestions = (count: number = 5, category: QuestionCategory = 'all'): QuizQuestion[] => {
  let pool = QUIZ_POOL;
  if (category === 'basics') pool = BASICS_POOL;
  else if (category === 'kudlits') pool = KUDLITS_POOL;
  else if (category === 'words') pool = WORDS_POOL;

  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length)).map(q => ({
    ...q,
    options: [...q.options].sort(() => 0.5 - Math.random()) // Shuffle options dynamically!
  }));
};
