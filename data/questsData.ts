export type QuestActionType = 
  | 'flashcards' 
  | 'writing' 
  | 'quiz' 
  | 'phrasebook' 
  | 'translator' 
  | 'guide' 
  | 'battle';

export type ScholarQuest = {
  id: string;
  titleEn: string;
  titlePh: string;
  target: number;
  rewardXp: number;
  icon: string;
  route: string;
  actionType: QuestActionType;
  descriptionEn: string;
  descriptionPh: string;
};

export const SCHOLAR_QUESTS: ScholarQuest[] = [
  {
    id: 'quest_1_read',
    titleEn: 'Daily Quest: Review 5 Syllables',
    titlePh: 'Arawang Misyon: Magbasa ng 5 Titik',
    target: 5,
    rewardXp: 25,
    icon: 'book',
    route: 'ReadHub',
    actionType: 'flashcards',
    descriptionEn: 'Review 5 flashcards in the Syllable Reader',
    descriptionPh: 'Magbasa ng 5 flashcards sa Syllable Reader'
  },
  {
    id: 'quest_2_trace',
    titleEn: 'Scholar Quest: Trace 2 Characters',
    titlePh: 'Misyon: Mag-trace ng 2 Titik',
    target: 2,
    rewardXp: 35,
    icon: 'brush',
    route: 'WriteTrace',
    actionType: 'writing',
    descriptionEn: 'Complete 2 stroke tracing practices in Studio',
    descriptionPh: 'Mag-ensayo ng 2 guhit sa Tracing Studio'
  },
  {
    id: 'quest_3_quiz',
    titleEn: 'Arena Quest: Score in Solo Practice',
    titlePh: 'Misyon: Pagsasanay sa Arena',
    target: 1,
    rewardXp: 40,
    icon: 'flash',
    route: 'OfflineQuiz',
    actionType: 'quiz',
    descriptionEn: 'Complete 1 solo quiz challenge',
    descriptionPh: 'Tapusin ang 1 pagsasanay sa quiz'
  },
  {
    id: 'quest_4_phrase',
    titleEn: 'Cultural Quest: Explore 5 Phrases',
    titlePh: 'Misyon: Magbasa ng 5 Parirala',
    target: 5,
    rewardXp: 30,
    icon: 'library',
    route: 'Phrasebook',
    actionType: 'phrasebook',
    descriptionEn: 'Explore 5 authentic Kapampangan phrases',
    descriptionPh: 'Tuklasin ang 5 pariralang Kapampangan'
  },
  {
    id: 'quest_5_translate',
    titleEn: 'Linguist Quest: Translate 2 Phrases',
    titlePh: 'Misyon: Magsalin ng 2 Parirala',
    target: 2,
    rewardXp: 30,
    icon: 'language',
    route: 'Translator',
    actionType: 'translator',
    descriptionEn: 'Translate 2 phrases into Kulitan script',
    descriptionPh: 'Magsalin ng 2 parirala sa Kulitan'
  },
  {
    id: 'quest_6_guide',
    titleEn: 'Heritage Quest: Study Kulitan Rules',
    titlePh: 'Misyon: Pag-aralan ang Panuntunan',
    target: 1,
    rewardXp: 25,
    icon: 'school',
    route: 'KulitanGuide',
    actionType: 'guide',
    descriptionEn: 'Study Indû, Anak, and Garlit rules',
    descriptionPh: 'Pag-aralan ang mga panuntunan sa Kulitan'
  },
  {
    id: 'quest_7_battle',
    titleEn: 'Battle Quest: Play in 1v1 Arena',
    titlePh: 'Misyon: Lumaban sa 1v1 Arena',
    target: 1,
    rewardXp: 50,
    icon: 'sword-cross',
    route: 'MultiplayerLobby',
    actionType: 'battle',
    descriptionEn: 'Enter the multiplayer 1v1 battle arena',
    descriptionPh: 'Pumasok sa multiplayer 1v1 arena'
  }
];
