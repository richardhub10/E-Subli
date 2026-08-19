export type Language = 'EN' | 'PH' | 'KPM';

type TranslationDictionary = {
  [key: string]: {
    EN: string;
    PH: string;
    KPM: string;
  };
};

export const translations: TranslationDictionary = {
  // General UI
  welcome: {
    EN: "Welcome",
    PH: "Maligayang Pagdating",
    KPM: "Luid Ya Ing Pamanatang"
  },
  start_journey: {
    EN: "START JOURNEY",
    PH: "SIMULAN ANG PAGLALAKBAY",
    KPM: "UMPISAN ING PAMAGLAKBE"
  },
  kulitan_guide: {
    EN: "KULITAN GUIDE",
    PH: "GABAY SA KULITAN",
    KPM: "GIYA KING KULITAN"
  },
  home: {
    EN: "Home",
    PH: "Tahanan",
    KPM: "Bale"
  },
  profile: {
    EN: "Profile",
    PH: "Profile",
    KPM: "Profile"
  },
  leaderboard: {
    EN: "Leaderboard",
    PH: "Liderato",
    KPM: "Pamanguna"
  },
  back: {
    EN: "Back",
    PH: "Bumalik",
    KPM: "Mibalik"
  },
  retry: {
    EN: "Retry",
    PH: "Subukan Ulit",
    KPM: "Pilitan Pasibayu"
  },
  lobby: {
    EN: "Lobby",
    PH: "Lobby",
    KPM: "Lobby"
  },

  // Auth
  login: {
    EN: "Login",
    PH: "Mag-login",
    KPM: "Mag-login"
  },
  register: {
    EN: "Register",
    PH: "Mag-rehistro",
    KPM: "Mag-rehistro"
  },
  email: {
    EN: "Email",
    PH: "Email",
    KPM: "Email"
  },
  password: {
    EN: "Password",
    PH: "Password",
    KPM: "Password"
  },
  first_name: {
    EN: "First Name",
    PH: "Pangalan",
    KPM: "Lagyu"
  },
  last_name: {
    EN: "Last Name",
    PH: "Apelyido",
    KPM: "Apelyidu"
  },
  create_account: {
    EN: "Create Account",
    PH: "Gumawa ng Account",
    KPM: "Gawa Account"
  },
  dont_have_account: {
    EN: "Don't have an account?",
    PH: "Wala pang account?",
    KPM: "Ala pang account?"
  },
  already_have_account: {
    EN: "Already have an account?",
    PH: "May account na?",
    KPM: "Atin na account?"
  },

  // Features
  read_hub: {
    EN: "Read Hub",
    PH: "Sentro ng Pagbasa",
    KPM: "Pipamasan"
  },
  write_trace: {
    EN: "Write & Trace",
    PH: "Magsulat at Bumakas",
    KPM: "Sumulat ampon Bakasan"
  },
  quiz_hub: {
    EN: "Quiz Hub",
    PH: "Sentro ng Pagsusulit",
    KPM: "Pipanyubukan"
  },
  translator: {
    EN: "Translator",
    PH: "Tagasalin",
    KPM: "Pamanalin"
  },

  // Quiz
  solo_practice: {
    EN: "Solo Practice",
    PH: "Pagsasanay Mag-isa",
    KPM: "Pagsane Mag-dili"
  },
  multiplayer_battle: {
    EN: "Multiplayer Battle",
    PH: "Labanang Maramihan",
    KPM: "Labang Dakal"
  },
  find_match: {
    EN: "FIND MATCH",
    PH: "MAGHANAP NG KALABAN",
    KPM: "MAMINTU KALABAN"
  },
  searching: {
    EN: "Searching for opponent...",
    PH: "Naghahanap ng kalaban...",
    KPM: "Manintun kalaban..."
  },
  match_found: {
    EN: "Match found! Joining...",
    PH: "May nahanap! Sumasali...",
    KPM: "Atin nahanap! Miki-sabe..."
  },
  creating_lobby: {
    EN: "Creating a lobby...",
    PH: "Gumagawa ng lobby...",
    KPM: "Gagawang lobby..."
  },
  waiting_opponent: {
    EN: "Waiting for an opponent to join...",
    PH: "Naghihintay na may sumali...",
    KPM: "Panayan ing ating miki-sabe..."
  },
  what_does_this_mean: {
    EN: "What does this mean?",
    PH: "Ano ang ibig sabihin nito?",
    KPM: "Nanu ing kabaldugan na niti?"
  },
  practice_complete: {
    EN: "Practice Complete!",
    PH: "Tapos na ang Pagsasanay!",
    KPM: "Mayari ne ing Pagsane!"
  },
  score: {
    EN: "Score",
    PH: "Puntos",
    KPM: "Puntos"
  },

  // Profile & Leaderboard
  level: {
    EN: "Level",
    PH: "Antas",
    KPM: "Antas"
  },
  xp: {
    EN: "XP",
    PH: "XP",
    KPM: "XP"
  },
  flashcards_read: {
    EN: "Flashcards Read",
    PH: "Nabasa na Flashcards",
    KPM: "Binasang Flashcards"
  },
  writing_practices: {
    EN: "Writing Practices",
    PH: "Mga Pagsasanay sa Pagsulat",
    KPM: "Pagsane keng Pamanyulat"
  },
  log_out: {
    EN: "Log Out",
    PH: "Mag-logout",
    KPM: "Mag-logout"
  },
  no_challengers_yet: {
    EN: "No challengers yet.",
    PH: "Wala pang mga kalahok.",
    KPM: "Ala pang sasali."
  }
};
