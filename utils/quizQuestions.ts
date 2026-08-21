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
  { kapampangan: 'A', correct: 'Vowel A', options: ['Vowel A', 'Vowel I', 'Vowel U', 'Consonant Ka'], category: 'basics', syllables: 'A' },
  { kapampangan: 'I', correct: 'Vowel I / E', options: ['Vowel I / E', 'Vowel O', 'Vowel A', 'Consonant Ga'], category: 'basics', syllables: 'I' },
  { kapampangan: 'U', correct: 'Vowel U / O', options: ['Vowel U / O', 'Vowel A', 'Consonant Nga', 'Vowel I'], category: 'basics', syllables: 'U' },
  { kapampangan: 'Ka', correct: 'Syllable Ka', options: ['Syllable Ka', 'Syllable Ga', 'Syllable Ta', 'Syllable Ba'], category: 'basics', syllables: 'Ka' },
  { kapampangan: 'Ga', correct: 'Syllable Ga', options: ['Syllable Ga', 'Syllable Ka', 'Syllable Na', 'Syllable La'], category: 'basics', syllables: 'Ga' },
  { kapampangan: 'Ta', correct: 'Syllable Ta', options: ['Syllable Ta', 'Syllable Da', 'Syllable Sa', 'Syllable Pa'], category: 'basics', syllables: 'Ta' },
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
  { kapampangan: 'Ki', correct: 'Ka + upper Garlit (Ki)', options: ['Ka + upper Garlit (Ki)', 'Ka + lower Garlit (Ku)', 'Ga + upper Garlit (Gi)', 'Ta + upper Garlit (Ti)'], category: 'kudlits', syllables: 'Ki' },
  { kapampangan: 'Ku', correct: 'Ka + lower Garlit (Ku)', options: ['Ka + lower Garlit (Ku)', 'Ka + upper Garlit (Ki)', 'Ba + lower Garlit (Bu)', 'Pa + lower Garlit (Pu)'], category: 'kudlits', syllables: 'Ku' },
  { kapampangan: 'Gi', correct: 'Ga + upper Garlit (Gi)', options: ['Ga + upper Garlit (Gi)', 'Ga + lower Garlit (Gu)', 'Ka + upper Garlit (Ki)', 'Da + upper Garlit (Di)'], category: 'kudlits', syllables: 'Gi' },
  { kapampangan: 'Gu', correct: 'Ga + lower Garlit (Gu)', options: ['Ga + lower Garlit (Gu)', 'Ga + upper Garlit (Gi)', 'La + lower Garlit (Lu)', 'Sa + lower Garlit (Su)'], category: 'kudlits', syllables: 'Gu' },
  { kapampangan: 'Ti', correct: 'Ta + upper Garlit (Ti)', options: ['Ta + upper Garlit (Ti)', 'Ta + lower Garlit (Tu)', 'Da + upper Garlit (Di)', 'Na + upper Garlit (Ni)'], category: 'kudlits', syllables: 'Ti' },
  { kapampangan: 'Tu', correct: 'Ta + lower Garlit (Tu)', options: ['Ta + lower Garlit (Tu)', 'Ta + upper Garlit (Ti)', 'Pa + lower Garlit (Pu)', 'Ba + lower Garlit (Bu)'], category: 'kudlits', syllables: 'Tu' },
  { kapampangan: 'Di', correct: 'Da + upper Garlit (Di)', options: ['Da + upper Garlit (Di)', 'Da + lower Garlit (Du)', 'Ta + upper Garlit (Ti)', 'La + upper Garlit (Li)'], category: 'kudlits', syllables: 'Di' },
  { kapampangan: 'Du', correct: 'Da + lower Garlit (Du)', options: ['Da + lower Garlit (Du)', 'Da + upper Garlit (Di)', 'Ma + lower Garlit (Mu)', 'Na + lower Garlit (Nu)'], category: 'kudlits', syllables: 'Du' },
  { kapampangan: 'Ni', correct: 'Na + upper Garlit (Ni)', options: ['Na + upper Garlit (Ni)', 'Na + lower Garlit (Nu)', 'La + upper Garlit (Li)', 'Nga + upper Garlit (Ngi)'], category: 'kudlits', syllables: 'Ni' },
  { kapampangan: 'Nu', correct: 'Na + lower Garlit (Nu)', options: ['Na + lower Garlit (Nu)', 'Na + upper Garlit (Ni)', 'Lu', 'Su'], category: 'kudlits', syllables: 'Nu' },
  { kapampangan: 'Li', correct: 'La + upper Garlit (Li)', options: ['La + upper Garlit (Li)', 'La + lower Garlit (Lu)', 'Si', 'Pi'], category: 'kudlits', syllables: 'Li' },
  { kapampangan: 'Lu', correct: 'La + lower Garlit (Lu)', options: ['La + lower Garlit (Lu)', 'La + upper Garlit (Li)', 'Pu', 'Bu'], category: 'kudlits', syllables: 'Lu' },
  { kapampangan: 'Si', correct: 'Sa + upper Garlit (Si)', options: ['Sa + upper Garlit (Si)', 'Sa + lower Garlit (Su)', 'Mi', 'Bi'], category: 'kudlits', syllables: 'Si' },
  { kapampangan: 'Su', correct: 'Sa + lower Garlit (Su)', options: ['Sa + lower Garlit (Su)', 'Sa + upper Garlit (Si)', 'Mu', 'Tu'], category: 'kudlits', syllables: 'Su' },
  { kapampangan: 'Mi', correct: 'Ma + upper Garlit (Mi)', options: ['Ma + upper Garlit (Mi)', 'Ma + lower Garlit (Mu)', 'Pi', 'Ni'], category: 'kudlits', syllables: 'Mi' },
  { kapampangan: 'Mu', correct: 'Ma + lower Garlit (Mu)', options: ['Ma + lower Garlit (Mu)', 'Ma + upper Garlit (Mi)', 'Bu', 'Du'], category: 'kudlits', syllables: 'Mu' },
  { kapampangan: 'Pi', correct: 'Pa + upper Garlit (Pi)', options: ['Pa + upper Garlit (Pi)', 'Pa + lower Garlit (Pu)', 'Bi', 'Ti'], category: 'kudlits', syllables: 'Pi' },
  { kapampangan: 'Pu', correct: 'Pa + lower Garlit (Pu)', options: ['Pa + lower Garlit (Pu)', 'Pa + upper Garlit (Pi)', 'Bu', 'Ku'], category: 'kudlits', syllables: 'Pu' },
  { kapampangan: 'Bi', correct: 'Ba + upper Garlit (Bi)', options: ['Ba + upper Garlit (Bi)', 'Ba + lower Garlit (Bu)', 'Pi', 'Mi'], category: 'kudlits', syllables: 'Bi' },
  { kapampangan: 'Bu', correct: 'Ba + lower Garlit (Bu)', options: ['Ba + lower Garlit (Bu)', 'Ba + upper Garlit (Bi)', 'Pu', 'Gu'], category: 'kudlits', syllables: 'Bu' },
];

// 3. WORDS: Vocabulary Words & Phrases
export const WORDS_POOL: QuizQuestion[] = [
  { kapampangan: 'Kaluguran', correct: 'Love / Beloved (Mahal)', options: ['Love / Beloved (Mahal)', 'Friend (Kaibigan)', 'Enemy (Kaaway)', 'Family (Pamilya)'], category: 'words', syllables: 'Ka • lu • gu • ran' },
  { kapampangan: 'Mayap', correct: 'Good / Fine (Mabuti)', options: ['Good / Fine (Mabuti)', 'Bad (Masama)', 'Fast (Mabilis)', 'Beautiful (Maganda)'], category: 'words', syllables: 'Ma • yap' },
  { kapampangan: 'Abak', correct: 'Morning (Umaga)', options: ['Morning (Umaga)', 'Night (Gabi)', 'Afternoon (Hapon)', 'Noon (Tanghali)'], category: 'words', syllables: 'A • bak' },
  { kapampangan: 'Bengi', correct: 'Night / Evening (Gabi)', options: ['Night / Evening (Gabi)', 'Morning (Umaga)', 'Dawn (Madaling araw)', 'Sunset (Takipsilim)'], category: 'words', syllables: 'Be • ngi' },
  { kapampangan: 'Balen', correct: 'Town / Nation (Bayan)', options: ['Town / Nation (Bayan)', 'House (Bahay)', 'School (Paaralan)', 'Church (Simbahan)'], category: 'words', syllables: 'Ba • len' },
  { kapampangan: 'Luid', correct: 'Long live / Prosper (Mabuhay)', options: ['Long live / Prosper (Mabuhay)', 'Goodbye (Paalam)', 'Thank you (Salamat)', 'Welcome (Tuloy)'] , category: 'words', syllables: 'Lu • id' },
  { kapampangan: 'Salamat', correct: 'Thank you (Salamat)', options: ['Thank you (Salamat)', 'Sorry (Patawad)', 'Please (Pakiusap)', 'Hello (Kamusta)'], category: 'words', syllables: 'Sa • la • mat' },
  { kapampangan: 'Sulu', correct: 'Light / Torch (Ilaw)', options: ['Light / Torch (Ilaw)', 'Darkness (Dilim)', 'Fire (Apoy)', 'Water (Tubig)'], category: 'words', syllables: 'Su • lu' },
  { kapampangan: 'Gamat', correct: 'Hand / Arm (Kamay)', options: ['Hand / Arm (Kamay)', 'Foot (Paa)', 'Head (Ulo)', 'Eye (Mata)'], category: 'words', syllables: 'Ga • mat' },
  { kapampangan: 'Bitis', correct: 'Foot / Leg (Paa / Binti)', options: ['Foot / Leg (Paa / Binti)', 'Hand (Kamay)', 'Chest (Dibdib)', 'Back (Likod)'], category: 'words', syllables: 'Bi • tis' },
  { kapampangan: 'Pipumpunan', correct: 'Ancestors (Mga Ninuno)', options: ['Ancestors (Mga Ninuno)', 'Grandchildren (Mga Apo)', 'Children (Mga Anak)', 'Siblings (Mga Kapatid)'], category: 'words', syllables: 'Pi • pum • pu • nan' },
  { kapampangan: 'Alingasngas', correct: 'Gossip / Scandal (Tsismis)', options: ['Gossip / Scandal (Tsismis)', 'Silence (Katahimikan)', 'Music (Musika)', 'Story (Kwento)'], category: 'words', syllables: 'A • li • ngas • ngas' },
  { kapampangan: 'Pamangamanu', correct: 'Language / Speech (Wika)', options: ['Language / Speech (Wika)', 'Song (Awit)', 'Letter (Liham)', 'Dance (Sayaw)'], category: 'words', syllables: 'Pa • ma • nga • ma • nu' },
  { kapampangan: 'Dayat-malat', correct: 'Sea / Ocean (Dagat)', options: ['Sea / Ocean (Dagat)', 'River (Ilog)', 'Lake (Lawa)', 'Stream (Sapa)'], category: 'words', syllables: 'Da • yat • ma • lat' },
  { kapampangan: 'Sampaga', correct: 'Flower (Bulaklak)', options: ['Flower (Bulaklak)', 'Leaf (Dahon)', 'Tree (Puno)', 'Fruit (Bunga)'], category: 'words', syllables: 'Sam • pa • ga' },
  { kapampangan: 'Batuin', correct: 'Star (Bituin)', options: ['Star (Bituin)', 'Moon (Buwan)', 'Sun (Araw)', 'Cloud (Ulap)'], category: 'words', syllables: 'Ba • tu • in' },
  { kapampangan: 'Buntuk', correct: 'Head (Ulo)', options: ['Head (Ulo)', 'Foot (Paa)', 'Stomach (Tiyan)', 'Shoulder (Balikat)'], category: 'words', syllables: 'Bun • tuk' },
  { kapampangan: 'Sibul', correct: 'Water Spring (Bukal)', options: ['Water Spring (Bukal)', 'Rain (Ulan)', 'Sea (Dagat)', 'River (Ilog)'], category: 'words', syllables: 'Si • bul' },
  { kapampangan: 'Kapatad', correct: 'Sibling / Brother / Sister (Kapatid)', options: ['Sibling / Brother / Sister (Kapatid)', 'Cousin (Pinsan)', 'Friend (Kaibigan)', 'Uncle (Tito)'], category: 'words', syllables: 'Ka • pa • tad' },
  { kapampangan: 'Mangabiran', correct: 'Being Biased (May Kinikilingan)', options: ['Being Biased (May Kinikilingan)', 'Very Angry (Galit)', 'Fast (Mabilis)', 'Sad (Malungkot)'], category: 'words', syllables: 'Ma • nga • bi • ran' },
  { kapampangan: 'Salangian', correct: 'To Light up (Sindihan)', options: ['To Light up (Sindihan)', 'To Turn off (Patayin)', 'To Run (Takbuhan)', 'To Cook (Lutuin)'], category: 'words', syllables: 'Sa • la • ngi • an' },
  { kapampangan: 'Makabayat', correct: 'Heavy (Mabigat)', options: ['Heavy (Mabigat)', 'Light (Magaan)', 'Colorful (Makulay)', 'Delicious (Masarap)'], category: 'words', syllables: 'Ma • ka • ba • yat' },
  { kapampangan: 'Makatuknang', correct: 'Residing / Living (Nakatira)', options: ['Residing / Living (Nakatira)', 'Working (Nagtatrabaho)', 'Playing (Naglalaro)', 'Sleeping (Natutulog)'], category: 'words', syllables: 'Ma • ka • tuk • nang' },
  { kapampangan: 'Salapian', correct: 'Wealthy (Mayaman)', options: ['Wealthy (Mayaman)', 'Poor (Mahirap)', 'Lazy (Matamad)', 'Wise (Matalino)'], category: 'words', syllables: 'Sa • la • pi • an' },
  { kapampangan: 'Katatawanan', correct: 'Truth / Reality (Katotohanan)', options: ['Truth / Reality (Katotohanan)', 'Lie (Kasinungalingan)', 'Dream (Panaginip)', 'Joke (Biro)'], category: 'words', syllables: 'Ka • ta • ta • wa • nan' },
  { kapampangan: 'Paglalawen', correct: 'Gazing at (Pinagmamasdan)', options: ['Gazing at (Pinagmamasdan)', 'Ignoring (Binabalewala)', 'Listening (Pinakikinggan)', 'Smelling (Inaamoy)'], category: 'words', syllables: 'Pag • la • la • wen' },
  { kapampangan: 'Kamalig', correct: 'Granary / Storehouse (Bangan)', options: ['Granary / Storehouse (Bangan)', 'House (Bahay)', 'Church (Simbahan)', 'Market (Palengke)'], category: 'words', syllables: 'Ka • ma • lig' },
  { kapampangan: 'Makapangilabut', correct: 'Terrifying / Frightening (Nakakatakot)', options: ['Terrifying / Frightening (Nakakatakot)', 'Funny (Nakakatawa)', 'Boring (Nakakabagot)', 'Exciting (Nakaka-excite)'], category: 'words', syllables: 'Ma • ka • pa • ngi • la • but' },
  { kapampangan: 'Sasalikut', correct: 'Hiding (Nagtatago)', options: ['Hiding (Nagtatago)', 'Seeking (Naghahanap)', 'Running (Tumatakbo)', 'Jumping (Tumatalon)'], category: 'words', syllables: 'Sa • sa • li • kut' },
  { kapampangan: 'Alipugpug', correct: 'Whirlwind / Cyclone (Ipu-ipo)', options: ['Whirlwind / Cyclone (Ipu-ipo)', 'Rain (Ulan)', 'Earthquake (Lindol)', 'Flood (Baha)'], category: 'words', syllables: 'A • li • pug • pug' },
  { kapampangan: 'Yamut', correct: 'Root (Ugat)', options: ['Root (Ugat)', 'Branch (Sangá)', 'Leaf (Dahon)', 'Bark (Balat)'], category: 'words', syllables: 'Ya • mut' },
  { kapampangan: 'Makatapak', correct: 'Barefoot (Nakayapak)', options: ['Barefoot (Nakayapak)', 'With Shoes (Nakasapatos)', 'Tied (Nakatali)', 'Floating (Nakalutang)'], category: 'words', syllables: 'Ma • ka • ta • pak' },
  { kapampangan: 'Timawa', correct: 'Free / Liberated (Malaya)', options: ['Free / Liberated (Malaya)', 'Imprisoned (Nakulong)', 'Slave (Alipin)', 'Poor (Mahirap)'], category: 'words', syllables: 'Ti • ma • wa' },
];

export const QUIZ_POOL: QuizQuestion[] = [...BASICS_POOL, ...KUDLITS_POOL, ...WORDS_POOL];

export const getRandomQuestions = (count: number = 5, category: QuestionCategory = 'all'): QuizQuestion[] => {
  let pool = QUIZ_POOL;
  if (category === 'basics') pool = BASICS_POOL;
  else if (category === 'kudlits') pool = KUDLITS_POOL;
  else if (category === 'words') pool = WORDS_POOL;

  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
};
