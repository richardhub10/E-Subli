export type PhraseCategory = 'Greetings' | 'Basics' | 'Numbers' | 'Family';

export type Phrase = {
  id: string;
  category: PhraseCategory;
  english: string;
  kapampangan: string;
  kulitan: string; // The text to be rendered with the Kulitan font
};

export const phrasebookData: Phrase[] = [
  // Greetings
  { id: 'g1', category: 'Greetings', english: 'Good morning', kapampangan: 'Mayap a abak', kulitan: 'ma-ya-p a a-ba-k' },
  { id: 'g2', category: 'Greetings', english: 'Good afternoon', kapampangan: 'Mayap a gatpanapun', kulitan: 'ma-ya-p a ga-t-pa-na-pu-n' },
  { id: 'g3', category: 'Greetings', english: 'Good evening', kapampangan: 'Mayap a bengi', kulitan: 'ma-ya-p a be-ngi' },
  { id: 'g4', category: 'Greetings', english: 'Thank you', kapampangan: 'Dakal a salamat', kulitan: 'da-ka-l a sa-la-ma-t' },
  { id: 'g5', category: 'Greetings', english: 'How are you?', kapampangan: 'Komusta naka?', kulitan: 'ko-mu-s-ta na-ka' },
  
  // Basics
  { id: 'b1', category: 'Basics', english: 'Yes', kapampangan: 'Wa', kulitan: 'wa' },
  { id: 'b2', category: 'Basics', english: 'No', kapampangan: 'Ali', kulitan: 'a-li' },
  { id: 'b3', category: 'Basics', english: 'I do not know', kapampangan: 'Eku balu', kulitan: 'e-ku ba-lu' },
  { id: 'b4', category: 'Basics', english: 'What is your name?', kapampangan: 'Nanu ing lagyu mu?', kulitan: 'na-nu i-ng la-gyu mu' },
  { id: 'b5', category: 'Basics', english: 'I love you', kapampangan: 'Kaluguran daka', kulitan: 'ka-lu-gu-ra-n da-ka' },

  // Numbers
  { id: 'n1', category: 'Numbers', english: 'One', kapampangan: 'Isa / Metung', kulitan: 'i-sa / me-tu-ng' },
  { id: 'n2', category: 'Numbers', english: 'Two', kapampangan: 'Adua', kulitan: 'a-du-wa' },
  { id: 'n3', category: 'Numbers', english: 'Three', kapampangan: 'Atlu', kulitan: 'a-t-lu' },
  { id: 'n4', category: 'Numbers', english: 'Four', kapampangan: 'Apat', kulitan: 'a-pa-t' },
  { id: 'n5', category: 'Numbers', english: 'Five', kapampangan: 'Lima', kulitan: 'li-ma' },

  // Family
  { id: 'f1', category: 'Family', english: 'Father', kapampangan: 'Tatáng', kulitan: 'ta-ta-ng' },
  { id: 'f2', category: 'Family', english: 'Mother', kapampangan: 'Indú', kulitan: 'i-n-du' },
  { id: 'f3', category: 'Family', english: 'Child', kapampangan: 'Anak', kulitan: 'a-na-k' },
  { id: 'f4', category: 'Family', english: 'Sibling', kapampangan: 'Kapatad', kulitan: 'ka-pa-ta-d' },
  { id: 'f5', category: 'Family', english: 'Grandparent', kapampangan: 'Apû', kulitan: 'a-pu' },
];
