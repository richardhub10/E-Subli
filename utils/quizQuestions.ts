export type QuestionCategory = 'all' | 'basics' | 'kudlits' | 'words';

export type QuizQuestion = {
  id?: string;
  kapampangan: string;
  correct: string;
  options: string[];
  category?: 'basics' | 'kudlits' | 'words';
  syllables?: string;
};

// 1. BASICS: Standalone Vowels & Root Consonants (31 Questions)
export const BASICS_POOL: QuizQuestion[] = [
  {
    "kapampangan": "A",
    "correct": "Vowel A",
    "options": [
      "Vowel A",
      "Vowel I / E",
      "Vowel U / O",
      "Syllable Ka"
    ],
    "category": "basics",
    "syllables": "A"
  },
  {
    "kapampangan": "I",
    "correct": "Vowel I / E",
    "options": [
      "Vowel I / E",
      "Vowel U / O",
      "Vowel A",
      "Syllable Ga"
    ],
    "category": "basics",
    "syllables": "I"
  },
  {
    "kapampangan": "U",
    "correct": "Vowel U / O",
    "options": [
      "Vowel U / O",
      "Vowel A",
      "Vowel I / E",
      "Syllable Nga"
    ],
    "category": "basics",
    "syllables": "U"
  },
  {
    "kapampangan": "E",
    "correct": "Vowel E / I",
    "options": [
      "Vowel E / I",
      "Vowel A",
      "Vowel O / U",
      "Syllable Ka"
    ],
    "category": "basics",
    "syllables": "E"
  },
  {
    "kapampangan": "O",
    "correct": "Vowel O / U",
    "options": [
      "Vowel O / U",
      "Vowel A",
      "Vowel E / I",
      "Syllable Ma"
    ],
    "category": "basics",
    "syllables": "O"
  },
  {
    "kapampangan": "Ka",
    "correct": "Syllable Ka",
    "options": [
      "Syllable Ka",
      "Syllable Ga",
      "Syllable Ta",
      "Syllable Ba"
    ],
    "category": "basics",
    "syllables": "Ka"
  },
  {
    "kapampangan": "Ga",
    "correct": "Syllable Ga",
    "options": [
      "Syllable Ga",
      "Syllable Ka",
      "Syllable Na",
      "Syllable La"
    ],
    "category": "basics",
    "syllables": "Ga"
  },
  {
    "kapampangan": "Ta",
    "correct": "Syllable Ta",
    "options": [
      "Syllable Ta",
      "Syllable Da / Ra",
      "Syllable Sa",
      "Syllable Pa"
    ],
    "category": "basics",
    "syllables": "Ta"
  },
  {
    "kapampangan": "Da",
    "correct": "Syllable Da / Ra",
    "options": [
      "Syllable Da / Ra",
      "Syllable Ta",
      "Syllable Ba",
      "Syllable Ma"
    ],
    "category": "basics",
    "syllables": "Da"
  },
  {
    "kapampangan": "Na",
    "correct": "Syllable Na",
    "options": [
      "Syllable Na",
      "Syllable La",
      "Syllable Nga",
      "Syllable Ga"
    ],
    "category": "basics",
    "syllables": "Na"
  },
  {
    "kapampangan": "La",
    "correct": "Syllable La",
    "options": [
      "Syllable La",
      "Syllable Na",
      "Syllable Sa",
      "Syllable Pa"
    ],
    "category": "basics",
    "syllables": "La"
  },
  {
    "kapampangan": "Sa",
    "correct": "Syllable Sa",
    "options": [
      "Syllable Sa",
      "Syllable Ma",
      "Syllable Ba",
      "Syllable Ta"
    ],
    "category": "basics",
    "syllables": "Sa"
  },
  {
    "kapampangan": "Ma",
    "correct": "Syllable Ma",
    "options": [
      "Syllable Ma",
      "Syllable Pa",
      "Syllable Ba",
      "Syllable Ka"
    ],
    "category": "basics",
    "syllables": "Ma"
  },
  {
    "kapampangan": "Pa",
    "correct": "Syllable Pa",
    "options": [
      "Syllable Pa",
      "Syllable Ma",
      "Syllable Ba",
      "Syllable Ga"
    ],
    "category": "basics",
    "syllables": "Pa"
  },
  {
    "kapampangan": "Ba",
    "correct": "Syllable Ba",
    "options": [
      "Syllable Ba",
      "Syllable Pa",
      "Syllable Ka",
      "Syllable Sa"
    ],
    "category": "basics",
    "syllables": "Ba"
  },
  {
    "kapampangan": "Nga",
    "correct": "Syllable Nga",
    "options": [
      "Syllable Nga",
      "Syllable Na",
      "Syllable Ga",
      "Syllable La"
    ],
    "category": "basics",
    "syllables": "Nga"
  },
  {
    "kapampangan": "Wa",
    "correct": "Syllable Wa",
    "options": [
      "Syllable Wa",
      "Syllable Ya",
      "Syllable Ba",
      "Syllable Da"
    ],
    "category": "basics",
    "syllables": "Wa"
  },
  {
    "kapampangan": "Ya",
    "correct": "Syllable Ya",
    "options": [
      "Syllable Ya",
      "Syllable Wa",
      "Syllable La",
      "Syllable Ga"
    ],
    "category": "basics",
    "syllables": "Ya"
  },
  {
    "kapampangan": "Ha",
    "correct": "Syllable Ha",
    "options": [
      "Syllable Ha",
      "Syllable Ka",
      "Syllable Sa",
      "Syllable Ta"
    ],
    "category": "basics",
    "syllables": "Ha"
  },
  {
    "kapampangan": "Ra",
    "correct": "Syllable Ra",
    "options": [
      "Syllable Ra",
      "Syllable Da / Ra",
      "Syllable La",
      "Syllable Ta"
    ],
    "category": "basics",
    "syllables": "Ra"
  },
  {
    "kapampangan": "Kang",
    "correct": "Ka + Final Consonant Ng (Kang)",
    "options": [
      "Ka + Final Consonant Ng (Kang)",
      "Ga + Final Consonant Ng (Gang)",
      "Ta + Final Consonant Ng (Tang)",
      "Ba + Final Consonant Ng (Bang)"
    ],
    "category": "basics",
    "syllables": "Kang"
  },
  {
    "kapampangan": "Gang",
    "correct": "Ga + Final Consonant Ng (Gang)",
    "options": [
      "Ga + Final Consonant Ng (Gang)",
      "Ka + Final Consonant Ng (Kang)",
      "Na + Final Consonant Ng (Nang)",
      "La + Final Consonant Ng (Lang)"
    ],
    "category": "basics",
    "syllables": "Gang"
  },
  {
    "kapampangan": "Tang",
    "correct": "Ta + Final Consonant Ng (Tang)",
    "options": [
      "Ta + Final Consonant Ng (Tang)",
      "Da + Final Consonant Ng (Dang)",
      "Sa + Final Consonant Ng (Sang)",
      "Pa + Final Consonant Ng (Pang)"
    ],
    "category": "basics",
    "syllables": "Tang"
  },
  {
    "kapampangan": "Dang",
    "correct": "Da + Final Consonant Ng (Dang)",
    "options": [
      "Da + Final Consonant Ng (Dang)",
      "Ta + Final Consonant Ng (Tang)",
      "Ba + Final Consonant Ng (Bang)",
      "La + Final Consonant Ng (Lang)"
    ],
    "category": "basics",
    "syllables": "Dang"
  },
  {
    "kapampangan": "Nang",
    "correct": "Na + Final Consonant Ng (Nang)",
    "options": [
      "Na + Final Consonant Ng (Nang)",
      "La + Final Consonant Ng (Lang)",
      "Nga + Final Consonant Ng (Ngang)",
      "Ma + Final Consonant Ng (Mang)"
    ],
    "category": "basics",
    "syllables": "Nang"
  },
  {
    "kapampangan": "Lang",
    "correct": "La + Final Consonant Ng (Lang)",
    "options": [
      "La + Final Consonant Ng (Lang)",
      "Na + Final Consonant Ng (Nang)",
      "Da + Final Consonant Ng (Dang)",
      "Sa + Final Consonant Ng (Sang)"
    ],
    "category": "basics",
    "syllables": "Lang"
  },
  {
    "kapampangan": "Sang",
    "correct": "Sa + Final Consonant Ng (Sang)",
    "options": [
      "Sa + Final Consonant Ng (Sang)",
      "Ta + Final Consonant Ng (Tang)",
      "Ma + Final Consonant Ng (Mang)",
      "Ka + Final Consonant Ng (Kang)"
    ],
    "category": "basics",
    "syllables": "Sang"
  },
  {
    "kapampangan": "Mang",
    "correct": "Ma + Final Consonant Ng (Mang)",
    "options": [
      "Ma + Final Consonant Ng (Mang)",
      "Pa + Final Consonant Ng (Pang)",
      "Na + Final Consonant Ng (Nang)",
      "Ba + Final Consonant Ng (Bang)"
    ],
    "category": "basics",
    "syllables": "Mang"
  },
  {
    "kapampangan": "Pang",
    "correct": "Pa + Final Consonant Ng (Pang)",
    "options": [
      "Pa + Final Consonant Ng (Pang)",
      "Ma + Final Consonant Ng (Mang)",
      "Ba + Final Consonant Ng (Bang)",
      "Ka + Final Consonant Ng (Kang)"
    ],
    "category": "basics",
    "syllables": "Pang"
  },
  {
    "kapampangan": "Bang",
    "correct": "Ba + Final Consonant Ng (Bang)",
    "options": [
      "Ba + Final Consonant Ng (Bang)",
      "Pa + Final Consonant Ng (Pang)",
      "Da + Final Consonant Ng (Dang)",
      "Ga + Final Consonant Ng (Gang)"
    ],
    "category": "basics",
    "syllables": "Bang"
  },
  {
    "kapampangan": "Ngang",
    "correct": "Nga + Final Consonant Ng (Ngang)",
    "options": [
      "Nga + Final Consonant Ng (Ngang)",
      "Na + Final Consonant Ng (Nang)",
      "Ga + Final Consonant Ng (Gang)",
      "La + Final Consonant Ng (Lang)"
    ],
    "category": "basics",
    "syllables": "Ngang"
  }
];

// 2. KUDLITS: Modified Consonants with Garlit Marks (46 Questions)
export const KUDLITS_POOL: QuizQuestion[] = [
  {
    "kapampangan": "Ki",
    "correct": "Ka + Upper Garlit (Ki / Ke)",
    "options": [
      "Ka + Upper Garlit (Ki / Ke)",
      "Ka + Lower Garlit (Ku / Ko)",
      "Ga + Upper Garlit (Gi / Ge)",
      "Ta + Upper Garlit (Ti / Te)"
    ],
    "category": "kudlits",
    "syllables": "Ki"
  },
  {
    "kapampangan": "Ku",
    "correct": "Ka + Lower Garlit (Ku / Ko)",
    "options": [
      "Ka + Lower Garlit (Ku / Ko)",
      "Ka + Upper Garlit (Ki / Ke)",
      "Ba + Lower Garlit (Bu / Bo)",
      "Pa + Lower Garlit (Pu / Po)"
    ],
    "category": "kudlits",
    "syllables": "Ku"
  },
  {
    "kapampangan": "Ke",
    "correct": "Ka + Upper Garlit (Ke / Ki)",
    "options": [
      "Ka + Upper Garlit (Ke / Ki)",
      "Ka + Lower Garlit (Ko / Ku)",
      "Te + Upper Garlit (Te / Ti)",
      "Ge + Upper Garlit (Ge / Gi)"
    ],
    "category": "kudlits",
    "syllables": "Ke"
  },
  {
    "kapampangan": "Ko",
    "correct": "Ka + Lower Garlit (Ko / Ku)",
    "options": [
      "Ka + Lower Garlit (Ko / Ku)",
      "Ka + Upper Garlit (Ke / Ki)",
      "Bo + Lower Garlit (Bo / Bu)",
      "Po + Lower Garlit (Po / Pu)"
    ],
    "category": "kudlits",
    "syllables": "Ko"
  },
  {
    "kapampangan": "Gi",
    "correct": "Ga + Upper Garlit (Gi / Ge)",
    "options": [
      "Ga + Upper Garlit (Gi / Ge)",
      "Ga + Lower Garlit (Gu / Go)",
      "Ka + Upper Garlit (Ki / Ke)",
      "Da + Upper Garlit (Di / De)"
    ],
    "category": "kudlits",
    "syllables": "Gi"
  },
  {
    "kapampangan": "Gu",
    "correct": "Ga + Lower Garlit (Gu / Go)",
    "options": [
      "Ga + Lower Garlit (Gu / Go)",
      "Ga + Upper Garlit (Gi / Ge)",
      "La + Lower Garlit (Lu / Lo)",
      "Sa + Lower Garlit (Su / So)"
    ],
    "category": "kudlits",
    "syllables": "Gu"
  },
  {
    "kapampangan": "Ge",
    "correct": "Ga + Upper Garlit (Ge / Gi)",
    "options": [
      "Ga + Upper Garlit (Ge / Gi)",
      "Ga + Lower Garlit (Go / Gu)",
      "Ke + Upper Garlit (Ke / Ki)",
      "De + Upper Garlit (De / Di)"
    ],
    "category": "kudlits",
    "syllables": "Ge"
  },
  {
    "kapampangan": "Go",
    "correct": "Ga + Lower Garlit (Go / Gu)",
    "options": [
      "Ga + Lower Garlit (Go / Gu)",
      "Ga + Upper Garlit (Ge / Gi)",
      "Lo + Lower Garlit (Lo / Lu)",
      "So + Lower Garlit (So / Su)"
    ],
    "category": "kudlits",
    "syllables": "Go"
  },
  {
    "kapampangan": "Ti",
    "correct": "Ta + Upper Garlit (Ti / Te)",
    "options": [
      "Ta + Upper Garlit (Ti / Te)",
      "Ta + Lower Garlit (Tu / To)",
      "Da + Upper Garlit (Di / De)",
      "Na + Upper Garlit (Ni / Ne)"
    ],
    "category": "kudlits",
    "syllables": "Ti"
  },
  {
    "kapampangan": "Tu",
    "correct": "Ta + Lower Garlit (Tu / To)",
    "options": [
      "Ta + Lower Garlit (Tu / To)",
      "Ta + Upper Garlit (Ti / Te)",
      "Pa + Lower Garlit (Pu / Po)",
      "Ba + Lower Garlit (Bu / Bo)"
    ],
    "category": "kudlits",
    "syllables": "Tu"
  },
  {
    "kapampangan": "Te",
    "correct": "Ta + Upper Garlit (Te / Ti)",
    "options": [
      "Ta + Upper Garlit (Te / Ti)",
      "Ta + Lower Garlit (To / Tu)",
      "De + Upper Garlit (De / Di)",
      "Ne + Upper Garlit (Ne / Ni)"
    ],
    "category": "kudlits",
    "syllables": "Te"
  },
  {
    "kapampangan": "To",
    "correct": "Ta + Lower Garlit (To / Tu)",
    "options": [
      "Ta + Lower Garlit (To / Tu)",
      "Ta + Upper Garlit (Te / Ti)",
      "Po + Lower Garlit (Po / Pu)",
      "Bo + Lower Garlit (Bo / Bu)"
    ],
    "category": "kudlits",
    "syllables": "To"
  },
  {
    "kapampangan": "Di",
    "correct": "Da + Upper Garlit (Di / De)",
    "options": [
      "Da + Upper Garlit (Di / De)",
      "Da + Lower Garlit (Du / Do)",
      "Ta + Upper Garlit (Ti / Te)",
      "La + Upper Garlit (Li / Le)"
    ],
    "category": "kudlits",
    "syllables": "Di"
  },
  {
    "kapampangan": "Du",
    "correct": "Da + Lower Garlit (Du / Do)",
    "options": [
      "Da + Lower Garlit (Du / Do)",
      "Da + Upper Garlit (Di / De)",
      "Ma + Lower Garlit (Mu / Mo)",
      "Na + Lower Garlit (Nu / No)"
    ],
    "category": "kudlits",
    "syllables": "Du"
  },
  {
    "kapampangan": "De",
    "correct": "Da + Upper Garlit (De / Di)",
    "options": [
      "Da + Upper Garlit (De / Di)",
      "Da + Lower Garlit (Do / Du)",
      "Te + Upper Garlit (Te / Ti)",
      "Le + Upper Garlit (Le / Li)"
    ],
    "category": "kudlits",
    "syllables": "De"
  },
  {
    "kapampangan": "Do",
    "correct": "Da + Lower Garlit (Do / Du)",
    "options": [
      "Da + Lower Garlit (Do / Du)",
      "Da + Upper Garlit (De / Di)",
      "Mo + Lower Garlit (Mo / Mu)",
      "No + Lower Garlit (No / Nu)"
    ],
    "category": "kudlits",
    "syllables": "Do"
  },
  {
    "kapampangan": "Ni",
    "correct": "Na + Upper Garlit (Ni / Ne)",
    "options": [
      "Na + Upper Garlit (Ni / Ne)",
      "Na + Lower Garlit (Nu / No)",
      "La + Upper Garlit (Li / Le)",
      "Nga + Upper Garlit (Ngi / Nge)"
    ],
    "category": "kudlits",
    "syllables": "Ni"
  },
  {
    "kapampangan": "Nu",
    "correct": "Na + Lower Garlit (Nu / No)",
    "options": [
      "Na + Lower Garlit (Nu / No)",
      "Na + Upper Garlit (Ni / Ne)",
      "Da + Lower Garlit (Du / Do)",
      "Ma + Lower Garlit (Mu / Mo)"
    ],
    "category": "kudlits",
    "syllables": "Nu"
  },
  {
    "kapampangan": "Ne",
    "correct": "Na + Upper Garlit (Ne / Ni)",
    "options": [
      "Na + Upper Garlit (Ne / Ni)",
      "Na + Lower Garlit (No / Nu)",
      "Le + Upper Garlit (Le / Li)",
      "Me + Upper Garlit (Me / Mi)"
    ],
    "category": "kudlits",
    "syllables": "Ne"
  },
  {
    "kapampangan": "No",
    "correct": "Na + Lower Garlit (No / Nu)",
    "options": [
      "Na + Lower Garlit (No / Nu)",
      "Na + Upper Garlit (Ne / Ni)",
      "Do + Lower Garlit (Do / Du)",
      "Mo + Lower Garlit (Mo / Mu)"
    ],
    "category": "kudlits",
    "syllables": "No"
  },
  {
    "kapampangan": "Li",
    "correct": "La + Upper Garlit (Li / Le)",
    "options": [
      "La + Upper Garlit (Li / Le)",
      "La + Lower Garlit (Lu / Lo)",
      "Na + Upper Garlit (Ni / Ne)",
      "Sa + Upper Garlit (Si / Se)"
    ],
    "category": "kudlits",
    "syllables": "Li"
  },
  {
    "kapampangan": "Lu",
    "correct": "La + Lower Garlit (Lu / Lo)",
    "options": [
      "La + Lower Garlit (Lu / Lo)",
      "La + Upper Garlit (Li / Le)",
      "Ga + Lower Garlit (Gu / Go)",
      "Ba + Lower Garlit (Bu / Bo)"
    ],
    "category": "kudlits",
    "syllables": "Lu"
  },
  {
    "kapampangan": "Le",
    "correct": "La + Upper Garlit (Le / Li)",
    "options": [
      "La + Upper Garlit (Le / Li)",
      "La + Lower Garlit (Lo / Lu)",
      "Ne + Upper Garlit (Ne / Ni)",
      "Se + Upper Garlit (Se / Si)"
    ],
    "category": "kudlits",
    "syllables": "Le"
  },
  {
    "kapampangan": "Lo",
    "correct": "La + Lower Garlit (Lo / Lu)",
    "options": [
      "La + Lower Garlit (Lo / Lu)",
      "La + Upper Garlit (Le / Li)",
      "So + Lower Garlit (So / Su)",
      "Po + Lower Garlit (Po / Pu)"
    ],
    "category": "kudlits",
    "syllables": "Lo"
  },
  {
    "kapampangan": "Si",
    "correct": "Sa + Upper Garlit (Si / Se)",
    "options": [
      "Sa + Upper Garlit (Si / Se)",
      "Sa + Lower Garlit (Su / So)",
      "Ma + Upper Garlit (Mi / Me)",
      "Ta + Upper Garlit (Ti / Te)"
    ],
    "category": "kudlits",
    "syllables": "Si"
  },
  {
    "kapampangan": "Su",
    "correct": "Sa + Lower Garlit (Su / So)",
    "options": [
      "Sa + Lower Garlit (Su / So)",
      "Sa + Upper Garlit (Si / Se)",
      "Ma + Lower Garlit (Mu / Mo)",
      "Ta + Lower Garlit (Tu / To)"
    ],
    "category": "kudlits",
    "syllables": "Su"
  },
  {
    "kapampangan": "Se",
    "correct": "Sa + Upper Garlit (Se / Si)",
    "options": [
      "Sa + Upper Garlit (Se / Si)",
      "Sa + Lower Garlit (So / Su)",
      "Me + Upper Garlit (Me / Mi)",
      "Te + Upper Garlit (Te / Ti)"
    ],
    "category": "kudlits",
    "syllables": "Se"
  },
  {
    "kapampangan": "So",
    "correct": "Sa + Lower Garlit (So / Su)",
    "options": [
      "Sa + Lower Garlit (So / Su)",
      "Sa + Upper Garlit (Se / Si)",
      "To + Lower Garlit (To / Tu)",
      "Mo + Lower Garlit (Mo / Mu)"
    ],
    "category": "kudlits",
    "syllables": "So"
  },
  {
    "kapampangan": "Mi",
    "correct": "Ma + Upper Garlit (Mi / Me)",
    "options": [
      "Ma + Upper Garlit (Mi / Me)",
      "Ma + Lower Garlit (Mu / Mo)",
      "Pa + Upper Garlit (Pi / Pe)",
      "Na + Upper Garlit (Ni / Ne)"
    ],
    "category": "kudlits",
    "syllables": "Mi"
  },
  {
    "kapampangan": "Mu",
    "correct": "Ma + Lower Garlit (Mu / Mo)",
    "options": [
      "Ma + Lower Garlit (Mu / Mo)",
      "Ma + Upper Garlit (Mi / Me)",
      "Ba + Lower Garlit (Bu / Bo)",
      "Da + Lower Garlit (Du / Do)"
    ],
    "category": "kudlits",
    "syllables": "Mu"
  },
  {
    "kapampangan": "Me",
    "correct": "Ma + Upper Garlit (Me / Mi)",
    "options": [
      "Ma + Upper Garlit (Me / Mi)",
      "Ma + Lower Garlit (Mo / Mu)",
      "Pe + Upper Garlit (Pe / Pi)",
      "Be + Upper Garlit (Be / Bi)"
    ],
    "category": "kudlits",
    "syllables": "Me"
  },
  {
    "kapampangan": "Mo",
    "correct": "Ma + Lower Garlit (Mo / Mu)",
    "options": [
      "Ma + Lower Garlit (Mo / Mu)",
      "Ma + Upper Garlit (Me / Mi)",
      "Bo + Lower Garlit (Bo / Bu)",
      "Do + Lower Garlit (Do / Du)"
    ],
    "category": "kudlits",
    "syllables": "Mo"
  },
  {
    "kapampangan": "Pi",
    "correct": "Pa + Upper Garlit (Pi / Pe)",
    "options": [
      "Pa + Upper Garlit (Pi / Pe)",
      "Pa + Lower Garlit (Pu / Po)",
      "Ba + Upper Garlit (Bi / Be)",
      "Ta + Upper Garlit (Ti / Te)"
    ],
    "category": "kudlits",
    "syllables": "Pi"
  },
  {
    "kapampangan": "Pu",
    "correct": "Pa + Lower Garlit (Pu / Po)",
    "options": [
      "Pa + Lower Garlit (Pu / Po)",
      "Pa + Upper Garlit (Pi / Pe)",
      "Ba + Lower Garlit (Bu / Bo)",
      "Ka + Lower Garlit (Ku / Ko)"
    ],
    "category": "kudlits",
    "syllables": "Pu"
  },
  {
    "kapampangan": "Pe",
    "correct": "Pa + Upper Garlit (Pe / Pi)",
    "options": [
      "Pa + Upper Garlit (Pe / Pi)",
      "Pa + Lower Garlit (Po / Pu)",
      "Be + Upper Garlit (Be / Bi)",
      "Te + Upper Garlit (Te / Ti)"
    ],
    "category": "kudlits",
    "syllables": "Pe"
  },
  {
    "kapampangan": "Po",
    "correct": "Pa + Lower Garlit (Po / Pu)",
    "options": [
      "Pa + Lower Garlit (Po / Pu)",
      "Pa + Upper Garlit (Pe / Pi)",
      "Bo + Lower Garlit (Bo / Bu)",
      "Ko + Lower Garlit (Ko / Ku)"
    ],
    "category": "kudlits",
    "syllables": "Po"
  },
  {
    "kapampangan": "Bi",
    "correct": "Ba + Upper Garlit (Bi / Be)",
    "options": [
      "Ba + Upper Garlit (Bi / Be)",
      "Ba + Lower Garlit (Bu / Bo)",
      "Pa + Upper Garlit (Pi / Pe)",
      "Ma + Upper Garlit (Mi / Me)"
    ],
    "category": "kudlits",
    "syllables": "Bi"
  },
  {
    "kapampangan": "Bu",
    "correct": "Ba + Lower Garlit (Bu / Bo)",
    "options": [
      "Ba + Lower Garlit (Bu / Bo)",
      "Ba + Upper Garlit (Bi / Be)",
      "Pa + Lower Garlit (Pu / Po)",
      "Ga + Lower Garlit (Gu / Go)"
    ],
    "category": "kudlits",
    "syllables": "Bu"
  },
  {
    "kapampangan": "Be",
    "correct": "Ba + Upper Garlit (Be / Bi)",
    "options": [
      "Ba + Upper Garlit (Be / Bi)",
      "Ba + Lower Garlit (Bo / Bu)",
      "Pe + Upper Garlit (Pe / Pi)",
      "Me + Upper Garlit (Me / Mi)"
    ],
    "category": "kudlits",
    "syllables": "Be"
  },
  {
    "kapampangan": "Bo",
    "correct": "Ba + Lower Garlit (Bo / Bu)",
    "options": [
      "Ba + Lower Garlit (Bo / Bu)",
      "Ba + Upper Garlit (Be / Bi)",
      "Po + Lower Garlit (Po / Pu)",
      "Go + Lower Garlit (Go / Gu)"
    ],
    "category": "kudlits",
    "syllables": "Bo"
  },
  {
    "kapampangan": "Ngi",
    "correct": "Nga + Upper Garlit (Ngi / Nge)",
    "options": [
      "Nga + Upper Garlit (Ngi / Nge)",
      "Nga + Lower Garlit (Ngu / Ngo)",
      "Na + Upper Garlit (Ni / Ne)",
      "Ga + Upper Garlit (Gi / Ge)"
    ],
    "category": "kudlits",
    "syllables": "Ngi"
  },
  {
    "kapampangan": "Ngu",
    "correct": "Nga + Lower Garlit (Ngu / Ngo)",
    "options": [
      "Nga + Lower Garlit (Ngu / Ngo)",
      "Nga + Upper Garlit (Ngi / Nge)",
      "Na + Lower Garlit (Nu / No)",
      "Ga + Lower Garlit (Gu / Go)"
    ],
    "category": "kudlits",
    "syllables": "Ngu"
  },
  {
    "kapampangan": "Wi",
    "correct": "Wa + Upper Garlit (Wi / We)",
    "options": [
      "Wa + Upper Garlit (Wi / We)",
      "Wa + Lower Garlit (Wu / Wo)",
      "Ya + Upper Garlit (Yi / Ye)",
      "Ba + Upper Garlit (Bi / Be)"
    ],
    "category": "kudlits",
    "syllables": "Wi"
  },
  {
    "kapampangan": "Wu",
    "correct": "Wa + Lower Garlit (Wu / Wo)",
    "options": [
      "Wa + Lower Garlit (Wu / Wo)",
      "Wa + Upper Garlit (Wi / We)",
      "Ba + Lower Garlit (Bu / Bo)",
      "Lu + Lower Garlit (Lu / Lo)"
    ],
    "category": "kudlits",
    "syllables": "Wu"
  },
  {
    "kapampangan": "Yi",
    "correct": "Ya + Upper Garlit (Yi / Ye)",
    "options": [
      "Ya + Upper Garlit (Yi / Ye)",
      "Ya + Lower Garlit (Yu / Yo)",
      "Wa + Upper Garlit (Wi / We)",
      "Da + Upper Garlit (Di / De)"
    ],
    "category": "kudlits",
    "syllables": "Yi"
  },
  {
    "kapampangan": "Yu",
    "correct": "Ya + Lower Garlit (Yu / Yo)",
    "options": [
      "Ya + Lower Garlit (Yu / Yo)",
      "Ya + Upper Garlit (Yi / Ye)",
      "Tu + Lower Garlit (Tu / To)",
      "Lu + Lower Garlit (Lu / Lo)"
    ],
    "category": "kudlits",
    "syllables": "Yu"
  }
];

// 3. WORDS: Vocabulary Words & Phrases (166 Questions)
export const WORDS_POOL: QuizQuestion[] = [
  {
    "kapampangan": "Kaluguran",
    "correct": "Love / Beloved (Mahal)",
    "options": [
      "Love / Beloved (Mahal)",
      "Friend / Companion (Kaibigan)",
      "Kinship / Family (Pamilya)",
      "Devotion / Faith (Pananalig)"
    ],
    "category": "words",
    "syllables": "Ka • lu • gu • ran"
  },
  {
    "kapampangan": "Mayap",
    "correct": "Good / Fine (Mabuti)",
    "options": [
      "Good / Fine (Mabuti)",
      "Beautiful / Fair (Maganda)",
      "True / Genuine (Tunay)",
      "Pure / Clean (Malinis)"
    ],
    "category": "words",
    "syllables": "Ma • yap"
  },
  {
    "kapampangan": "Abak",
    "correct": "Morning (Umaga)",
    "options": [
      "Morning (Umaga)",
      "Evening / Night (Gabi)",
      "Afternoon (Hapon)",
      "Noon (Tanghali)"
    ],
    "category": "words",
    "syllables": "A • bak"
  },
  {
    "kapampangan": "Bengi",
    "correct": "Night / Evening (Gabi)",
    "options": [
      "Night / Evening (Gabi)",
      "Morning (Umaga)",
      "Dawn (Madaling araw)",
      "Dusk (Takipsilim)"
    ],
    "category": "words",
    "syllables": "Be • ngi"
  },
  {
    "kapampangan": "Gatpanapun",
    "correct": "Afternoon (Hapon)",
    "options": [
      "Afternoon (Hapon)",
      "Morning (Umaga)",
      "Evening (Gabi)",
      "Midnight (Hatinggabi)"
    ],
    "category": "words",
    "syllables": "Gat • pa • na • pun"
  },
  {
    "kapampangan": "Luid",
    "correct": "Long live / Prosper (Mabuhay)",
    "options": [
      "Long live / Prosper (Mabuhay)",
      "Peace / Farewell (Paalam)",
      "Gratitude (Salamat)",
      "Welcome (Tuloy po kayo)"
    ],
    "category": "words",
    "syllables": "Lu • id"
  },
  {
    "kapampangan": "Salamat",
    "correct": "Thank you (Salamat)",
    "options": [
      "Thank you (Salamat)",
      "Pardon / Forgive (Patawad)",
      "Please / Favor (Pakiusap)",
      "Greetings (Pagbati)"
    ],
    "category": "words",
    "syllables": "Sa • la • mat"
  },
  {
    "kapampangan": "Komusta",
    "correct": "How are you? (Kumusta?)",
    "options": [
      "How are you? (Kumusta?)",
      "Where are you going? (Saan ka pupunta?)",
      "Who is that? (Sino iyan?)",
      "What is that? (Ano iyan?)"
    ],
    "category": "words",
    "syllables": "Ko • mus • ta"
  },
  {
    "kapampangan": "Malaus",
    "correct": "Welcome / Come In (Tuloy po kayo)",
    "options": [
      "Welcome / Come In (Tuloy po kayo)",
      "Goodbye / Leave (Paalam)",
      "Stop here (Huminto)",
      "Wait a moment (Maghintay)"
    ],
    "category": "words",
    "syllables": "Ma • la • us"
  },
  {
    "kapampangan": "Mako",
    "correct": "To Leave / Depart (Aalis)",
    "options": [
      "To Leave / Depart (Aalis)",
      "To Arrive (Darating)",
      "To Return (Babalik)",
      "To Stay / Rest (Manatili)"
    ],
    "category": "words",
    "syllables": "Ma • ko"
  },
  {
    "kapampangan": "Mikit",
    "correct": "To Meet / See Each Other (Magkita)",
    "options": [
      "To Meet / See Each Other (Magkita)",
      "To Separate (Maghiwalay)",
      "To Speak (Magsalita)",
      "To Depart (Umalis)"
    ],
    "category": "words",
    "syllables": "Mi • kit"
  },
  {
    "kapampangan": "Mimingat",
    "correct": "Take Care (Mag-ingat)",
    "options": [
      "Take Care (Mag-ingat)",
      "Hurry Up (Magmadali)",
      "Be Quiet (Tumahimik)",
      "Sleep well (Matulog nang mahimbing)"
    ],
    "category": "words",
    "syllables": "Mim • i • ngat"
  },
  {
    "kapampangan": "Patawad",
    "correct": "Pardon / Forgive (Patawad)",
    "options": [
      "Pardon / Forgive (Patawad)",
      "Thank you (Salamat)",
      "Welcome (Tuloy po)",
      "Farewell (Paalam)"
    ],
    "category": "words",
    "syllables": "Pa • ta • wad"
  },
  {
    "kapampangan": "Ninu",
    "correct": "Who (Sino)",
    "options": [
      "Who (Sino)",
      "What (Ano)",
      "Where (Saan)",
      "Why (Bakit)"
    ],
    "category": "words",
    "syllables": "Ni • nu"
  },
  {
    "kapampangan": "Nanu",
    "correct": "What (Ano)",
    "options": [
      "What (Ano)",
      "Who (Sino)",
      "When (Kailan)",
      "How (Paano)"
    ],
    "category": "words",
    "syllables": "Na • nu"
  },
  {
    "kapampangan": "Kapilan",
    "correct": "When (Kailan)",
    "options": [
      "When (Kailan)",
      "Where (Saan)",
      "Who (Sino)",
      "How much (Magkano)"
    ],
    "category": "words",
    "syllables": "Ka • pi • lan"
  },
  {
    "kapampangan": "Nukarin",
    "correct": "Where (Saan)",
    "options": [
      "Where (Saan)",
      "When (Kailan)",
      "Why (Bakit)",
      "Who (Sino)"
    ],
    "category": "words",
    "syllables": "Nu • ka • rin"
  },
  {
    "kapampangan": "Obakit",
    "correct": "Why (Bakit)",
    "options": [
      "Why (Bakit)",
      "How (Paano)",
      "What (Ano)",
      "Where (Saan)"
    ],
    "category": "words",
    "syllables": "O • ba • kit"
  },
  {
    "kapampangan": "Makananu",
    "correct": "How (Paano)",
    "options": [
      "How (Paano)",
      "Why (Bakit)",
      "When (Kailan)",
      "Who (Sino)"
    ],
    "category": "words",
    "syllables": "Ma • ka • na • nu"
  },
  {
    "kapampangan": "Balu",
    "correct": "Knowledge / Know (Alam / Marunong)",
    "options": [
      "Knowledge / Know (Alam / Marunong)",
      "Ignorance (Kawalang-alam)",
      "Skill / Craft (Sining)",
      "Question (Tanong)"
    ],
    "category": "words",
    "syllables": "Ba • lu"
  },
  {
    "kapampangan": "Amanu",
    "correct": "Word / Language (Salita / Wika)",
    "options": [
      "Word / Language (Salita / Wika)",
      "Story / Tale (Kuwento)",
      "Book (Aklat)",
      "Song (Awit)"
    ],
    "category": "words",
    "syllables": "A • ma • nu"
  },
  {
    "kapampangan": "Pamangamanu",
    "correct": "Speech / Language (Wika / Pananalita)",
    "options": [
      "Speech / Language (Wika / Pananalita)",
      "Song / Hymn (Awit)",
      "Letter / Script (Liham)",
      "Storytelling (Pagsasalaysay)"
    ],
    "category": "words",
    "syllables": "Pa • ma • nga • ma • nu"
  },
  {
    "kapampangan": "Bale",
    "correct": "House / Home (Bahay)",
    "options": [
      "House / Home (Bahay)",
      "Town / Nation (Bayan)",
      "Church (Simbahan)",
      "Market (Palengke)"
    ],
    "category": "words",
    "syllables": "Ba • le"
  },
  {
    "kapampangan": "Balen",
    "correct": "Town / Nation (Bayan)",
    "options": [
      "Town / Nation (Bayan)",
      "Household / Home (Bahay)",
      "School (Paaralan)",
      "Sacred Place (Simbahan)"
    ],
    "category": "words",
    "syllables": "Ba • len"
  },
  {
    "kapampangan": "Pisamban",
    "correct": "Church / Shrine (Simbahan)",
    "options": [
      "Church / Shrine (Simbahan)",
      "School (Paaralan)",
      "Town Hall (Munisipyo)",
      "Cemetery (Sementeryo)"
    ],
    "category": "words",
    "syllables": "Pi • sam • ban"
  },
  {
    "kapampangan": "Palengki",
    "correct": "Marketplace (Palengke)",
    "options": [
      "Marketplace (Palengke)",
      "House (Bahay)",
      "Farm (Bukid)",
      "Harbor / Port (Pantalan)"
    ],
    "category": "words",
    "syllables": "Pa • leng • ki"
  },
  {
    "kapampangan": "Eskwela",
    "correct": "School / Academy (Paaralan)",
    "options": [
      "School / Academy (Paaralan)",
      "Church (Simbahan)",
      "Library (Aklatan)",
      "Office (Tanggapan)"
    ],
    "category": "words",
    "syllables": "Es • kwe • la"
  },
  {
    "kapampangan": "Kamalig",
    "correct": "Granary / Barn (Bangan / Kamalig)",
    "options": [
      "Granary / Barn (Bangan / Kamalig)",
      "Dwelling / Cottage (Bahay)",
      "Marketplace (Palengke)",
      "Altar / Shrine (Dambana)"
    ],
    "category": "words",
    "syllables": "Ka • ma • lig"
  },
  {
    "kapampangan": "Dalan",
    "correct": "Road / Pathway (Daan / Kalsada)",
    "options": [
      "Road / Pathway (Daan / Kalsada)",
      "Bridge (Tulay)",
      "River (Ilog)",
      "Wall (Pader)"
    ],
    "category": "words",
    "syllables": "Da • lan"
  },
  {
    "kapampangan": "Sulu",
    "correct": "Light / Torch (Ilaw / Tanglaw)",
    "options": [
      "Light / Torch (Ilaw / Tanglaw)",
      "Shadow / Dark (Dilim)",
      "Flame / Fire (Apoy)",
      "Sunlight (Sikat ng Araw)"
    ],
    "category": "words",
    "syllables": "Su • lu"
  },
  {
    "kapampangan": "Api",
    "correct": "Fire / Flame (Apoy)",
    "options": [
      "Fire / Flame (Apoy)",
      "Water (Tubig)",
      "Smoke (Usok)",
      "Ash (Abo)"
    ],
    "category": "words",
    "syllables": "A • pi"
  },
  {
    "kapampangan": "Danum",
    "correct": "Water / Liquid (Tubig)",
    "options": [
      "Water / Liquid (Tubig)",
      "Fire (Apoy)",
      "Soil / Ground (Lupa)",
      "Wind (Hangin)"
    ],
    "category": "words",
    "syllables": "Da • num"
  },
  {
    "kapampangan": "Aldo",
    "correct": "Sun / Day (Araw)",
    "options": [
      "Sun / Day (Araw)",
      "Moon / Month (Buwan)",
      "Star (Bituin)",
      "Sky (Langit)"
    ],
    "category": "words",
    "syllables": "Al • do"
  },
  {
    "kapampangan": "Bulan",
    "correct": "Moon / Month (Buwan)",
    "options": [
      "Moon / Month (Buwan)",
      "Sun / Day (Araw)",
      "Cloud (Ulap)",
      "Night (Gabi)"
    ],
    "category": "words",
    "syllables": "Bu • lan"
  },
  {
    "kapampangan": "Batuin",
    "correct": "Star / Celestial (Bituin)",
    "options": [
      "Star / Celestial (Bituin)",
      "Moon / Lunar (Buwan)",
      "Sun / Solar (Araw)",
      "Cloud / Mist (Ulap)"
    ],
    "category": "words",
    "syllables": "Ba • tu • in"
  },
  {
    "kapampangan": "Banwa",
    "correct": "Sky / Heaven / Year (Langit / Taon)",
    "options": [
      "Sky / Heaven / Year (Langit / Taon)",
      "Earth / Soil (Lupa)",
      "Sea / Ocean (Dagat)",
      "Mountain (Bundok)"
    ],
    "category": "words",
    "syllables": "Ban • wa"
  },
  {
    "kapampangan": "Gabun",
    "correct": "Earth / Soil / Land (Lupa)",
    "options": [
      "Earth / Soil / Land (Lupa)",
      "Sky / Heaven (Langit)",
      "Stone / Rock (Bato)",
      "Sand (Buhangin)"
    ],
    "category": "words",
    "syllables": "Ga • bun"
  },
  {
    "kapampangan": "Angin",
    "correct": "Wind / Air / Breeze (Hangin)",
    "options": [
      "Wind / Air / Breeze (Hangin)",
      "Rain (Ulan)",
      "Cloud (Ulap)",
      "Thunder (Kulog)"
    ],
    "category": "words",
    "syllables": "A • ngin"
  },
  {
    "kapampangan": "Ulan",
    "correct": "Rain / Rainfall (Ulan)",
    "options": [
      "Rain / Rainfall (Ulan)",
      "Wind (Hangin)",
      "Flood (Baha)",
      "Dew (Hamog)"
    ],
    "category": "words",
    "syllables": "U • lan"
  },
  {
    "kapampangan": "Bunduk",
    "correct": "Mountain / Peak (Bundok)",
    "options": [
      "Mountain / Peak (Bundok)",
      "Valley (Lambak)",
      "Plains (Kapatagan)",
      "Forest (Gubat)"
    ],
    "category": "words",
    "syllables": "Bun • duk"
  },
  {
    "kapampangan": "Ilug",
    "correct": "River / Stream (Ilog)",
    "options": [
      "River / Stream (Ilog)",
      "Ocean / Sea (Dagat)",
      "Lake (Lawa)",
      "Waterfall (Talon)"
    ],
    "category": "words",
    "syllables": "I • lug"
  },
  {
    "kapampangan": "Dayat-malat",
    "correct": "Sea / Ocean (Dagat)",
    "options": [
      "Sea / Ocean (Dagat)",
      "River / Stream (Ilog)",
      "Lake (Lawa)",
      "Waterfall (Talon)"
    ],
    "category": "words",
    "syllables": "Da • yat • ma • lat"
  },
  {
    "kapampangan": "Sibul",
    "correct": "Water Spring / Fountain (Bukal)",
    "options": [
      "Water Spring / Fountain (Bukal)",
      "Rainfall (Ulan)",
      "Ocean (Dagat)",
      "River (Ilog)"
    ],
    "category": "words",
    "syllables": "Si • bul"
  },
  {
    "kapampangan": "Sampaga",
    "correct": "Flower / Blossom (Bulaklak)",
    "options": [
      "Flower / Blossom (Bulaklak)",
      "Foliage / Leaf (Dahon)",
      "Tree (Puno)",
      "Seed / Fruit (Bunga)"
    ],
    "category": "words",
    "syllables": "Sam • pa • ga"
  },
  {
    "kapampangan": "Dutung",
    "correct": "Tree / Timber / Wood (Puno / Kahoy)",
    "options": [
      "Tree / Timber / Wood (Puno / Kahoy)",
      "Grass / Herb (Damo)",
      "Flower (Bulaklak)",
      "Vine (Baging)"
    ],
    "category": "words",
    "syllables": "Du • tung"
  },
  {
    "kapampangan": "Dikut",
    "correct": "Grass / Herb (Damo)",
    "options": [
      "Grass / Herb (Damo)",
      "Tree (Puno)",
      "Leaf (Dahon)",
      "Root (Ugat)"
    ],
    "category": "words",
    "syllables": "Di • kut"
  },
  {
    "kapampangan": "Yamut",
    "correct": "Plant Root (Ugat)",
    "options": [
      "Plant Root (Ugat)",
      "Branch / Limb (Sanga)",
      "Leaf (Dahon)",
      "Bark (Balat ng Kahoy)"
    ],
    "category": "words",
    "syllables": "Ya • mut"
  },
  {
    "kapampangan": "Alipugpug",
    "correct": "Whirlwind / Cyclone (Ipu-ipo)",
    "options": [
      "Whirlwind / Cyclone (Ipu-ipo)",
      "Monsoon Rain (Habagat)",
      "Thunderstorm (Kulog at Kidlat)",
      "Dense Fog (Makapal na Ulap)"
    ],
    "category": "words",
    "syllables": "A • li • pug • pug"
  },
  {
    "kapampangan": "Aslag",
    "correct": "Sunbeam / Ray of Light (Sinag ng Araw)",
    "options": [
      "Sunbeam / Ray of Light (Sinag ng Araw)",
      "Shadow / Shade (Lilim)",
      "Twilight (Takipsilim)",
      "Lightning (Kidlat)"
    ],
    "category": "words",
    "syllables": "As • lag"
  },
  {
    "kapampangan": "Dalumdum",
    "correct": "Darkness / Gloom (Dilim)",
    "options": [
      "Darkness / Gloom (Dilim)",
      "Light / Brightness (Liwanag)",
      "Shade (Lilim)",
      "Fog (Hamog)"
    ],
    "category": "words",
    "syllables": "Da • lum • dum"
  },
  {
    "kapampangan": "Sala",
    "correct": "Light / Radiance (Liwanag)",
    "options": [
      "Light / Radiance (Liwanag)",
      "Darkness (Dilim)",
      "Gloom (Lumbay)",
      "Smoke (Usok)"
    ],
    "category": "words",
    "syllables": "Sa • la"
  },
  {
    "kapampangan": "Pamangan",
    "correct": "Food / Meal (Pagkain)",
    "options": [
      "Food / Meal (Pagkain)",
      "Drink / Water (Inumin)",
      "Feast (Piging)",
      "Cooking pot (Palayok)"
    ],
    "category": "words",
    "syllables": "Pa • ma • ngan"
  },
  {
    "kapampangan": "Nasi",
    "correct": "Cooked Rice (Kanin)",
    "options": [
      "Cooked Rice (Kanin)",
      "Uncooked Rice (Bigas)",
      "Rice Porridge (Lugaw)",
      "Bread (Tinapay)"
    ],
    "category": "words",
    "syllables": "Na • si"
  },
  {
    "kapampangan": "Asan",
    "correct": "Viand / Fish (Ulam / Isda)",
    "options": [
      "Viand / Fish (Ulam / Isda)",
      "Rice (Kanin)",
      "Vegetable (Gulay)",
      "Soup (Sabaw)"
    ],
    "category": "words",
    "syllables": "A • san"
  },
  {
    "kapampangan": "Gule",
    "correct": "Vegetables (Gulay)",
    "options": [
      "Vegetables (Gulay)",
      "Meat (Karne)",
      "Fruit (Prutas)",
      "Grains (Butil)"
    ],
    "category": "words",
    "syllables": "Gu • le"
  },
  {
    "kapampangan": "Manuk",
    "correct": "Chicken / Fowl (Manok)",
    "options": [
      "Chicken / Fowl (Manok)",
      "Duck (Itik)",
      "Pork / Pig (Baboy)",
      "Bird (Ibon)"
    ],
    "category": "words",
    "syllables": "Ma • nuk"
  },
  {
    "kapampangan": "Babi",
    "correct": "Pork / Pig (Baboy)",
    "options": [
      "Pork / Pig (Baboy)",
      "Beef / Cow (Baka)",
      "Carabao (Kalabaw)",
      "Goat (Kambing)"
    ],
    "category": "words",
    "syllables": "Ba • bi"
  },
  {
    "kapampangan": "Manyaman",
    "correct": "Delicious / Savory (Masarap)",
    "options": [
      "Delicious / Savory (Masarap)",
      "Bland / Tasteless (Matabang)",
      "Bitter (Mapait)",
      "Spoiled / Rotten (Panis)"
    ],
    "category": "words",
    "syllables": "Ma • nya • man"
  },
  {
    "kapampangan": "Mamis",
    "correct": "Sweet (Matamis)",
    "options": [
      "Sweet (Matamis)",
      "Sour (Maasim)",
      "Salty (Maalat)",
      "Bitter (Mapait)"
    ],
    "category": "words",
    "syllables": "Ma • mis"
  },
  {
    "kapampangan": "Maslam",
    "correct": "Sour (Maasim)",
    "options": [
      "Sour (Maasim)",
      "Sweet (Matamis)",
      "Spicy (Maanghang)",
      "Salty (Maalat)"
    ],
    "category": "words",
    "syllables": "Mas • lam"
  },
  {
    "kapampangan": "Maalat",
    "correct": "Salty (Maalat)",
    "options": [
      "Salty (Maalat)",
      "Sweet (Matamis)",
      "Bland (Matabang)",
      "Sour (Maasim)"
    ],
    "category": "words",
    "syllables": "Ma • a • lat"
  },
  {
    "kapampangan": "Mapait",
    "correct": "Bitter (Mapait)",
    "options": [
      "Bitter (Mapait)",
      "Sweet (Matamis)",
      "Savory (Malinamnam)",
      "Spicy (Maanghang)"
    ],
    "category": "words",
    "syllables": "Ma • pa • it"
  },
  {
    "kapampangan": "Maparas",
    "correct": "Spicy / Pungent (Maanghang)",
    "options": [
      "Spicy / Pungent (Maanghang)",
      "Sweet (Matamis)",
      "Mild / Bland (Matabang)",
      "Sour (Maasim)"
    ],
    "category": "words",
    "syllables": "Ma • pa • ras"
  },
  {
    "kapampangan": "Mabsi",
    "correct": "Full / Satiated (Busog)",
    "options": [
      "Full / Satiated (Busog)",
      "Hungry (Gutom)",
      "Thirsty (Uhaw)",
      "Tired (Pagod)"
    ],
    "category": "words",
    "syllables": "Mab • si"
  },
  {
    "kapampangan": "Danan",
    "correct": "Hungry (Gutom)",
    "options": [
      "Hungry (Gutom)",
      "Full / Satiated (Busog)",
      "Thirsty (Uhaw)",
      "Sick (May sakit)"
    ],
    "category": "words",
    "syllables": "Da • nan"
  },
  {
    "kapampangan": "Kawatan",
    "correct": "Thirsty (Uhaw)",
    "options": [
      "Thirsty (Uhaw)",
      "Hungry (Gutom)",
      "Full (Busog)",
      "Sleepy (Inaantok)"
    ],
    "category": "words",
    "syllables": "Ka • wa • tan"
  },
  {
    "kapampangan": "Pamaglutu",
    "correct": "Cooking / Culinary Art (Pagluluto)",
    "options": [
      "Cooking / Culinary Art (Pagluluto)",
      "Eating (Pagkain)",
      "Baking (Paghurno)",
      "Harvesting (Pag-ani)"
    ],
    "category": "words",
    "syllables": "Pa • mag • lu • tu"
  },
  {
    "kapampangan": "Damulag",
    "correct": "Water Buffalo / Carabao (Kalabaw)",
    "options": [
      "Water Buffalo / Carabao (Kalabaw)",
      "Horse (Kabayo)",
      "Cow / Cattle (Baka)",
      "Pig (Baboy)"
    ],
    "category": "words",
    "syllables": "Da • mu • lag"
  },
  {
    "kapampangan": "Asu",
    "correct": "Dog (Aso)",
    "options": [
      "Dog (Aso)",
      "Cat (Pusa)",
      "Goat (Kambing)",
      "Wolf (Lobo)"
    ],
    "category": "words",
    "syllables": "A • su"
  },
  {
    "kapampangan": "Pusa",
    "correct": "Cat (Pusa)",
    "options": [
      "Cat (Pusa)",
      "Dog (Aso)",
      "Rabbit (Kuneho)",
      "Mouse / Rat (Daga)"
    ],
    "category": "words",
    "syllables": "Pu • sa"
  },
  {
    "kapampangan": "Ayup",
    "correct": "Bird / Fowl (Ibon)",
    "options": [
      "Bird / Fowl (Ibon)",
      "Fish (Isda)",
      "Insect (Kulisap)",
      "Bat (Paniki)"
    ],
    "category": "words",
    "syllables": "A • yup"
  },
  {
    "kapampangan": "Kambing",
    "correct": "Goat (Kambing)",
    "options": [
      "Goat (Kambing)",
      "Sheep (Tupa)",
      "Carabao (Kalabaw)",
      "Deer (Usa)"
    ],
    "category": "words",
    "syllables": "Kam • bing"
  },
  {
    "kapampangan": "Talubang",
    "correct": "Butterfly (Paruparo)",
    "options": [
      "Butterfly (Paruparo)",
      "Dragonfly (Tutubi)",
      "Bee (Bubuyog)",
      "Moth (Gamu-gamo)"
    ],
    "category": "words",
    "syllables": "Ta • lu • bang"
  },
  {
    "kapampangan": "Tugu",
    "correct": "Frog (Palaka)",
    "options": [
      "Frog (Palaka)",
      "Lizard (Butiki)",
      "Crab (Alimango)",
      "Turtle (Pagong)"
    ],
    "category": "words",
    "syllables": "Tu • gu"
  },
  {
    "kapampangan": "Tatang",
    "correct": "Father / Dad (Tatay)",
    "options": [
      "Father / Dad (Tatay)",
      "Mother (Nanay)",
      "Grandfather (Lolo)",
      "Uncle (Tiyo)"
    ],
    "category": "words",
    "syllables": "Ta • tang"
  },
  {
    "kapampangan": "Ibpa",
    "correct": "Father / Sire (Ama)",
    "options": [
      "Father / Sire (Ama)",
      "Mother (Ina)",
      "Elder Brother (Kuya)",
      "Brother-in-law (Bayaw)"
    ],
    "category": "words",
    "syllables": "Ib • pa"
  },
  {
    "kapampangan": "Inda",
    "correct": "Mother / Mom (Nanay / Inang)",
    "options": [
      "Mother / Mom (Nanay / Inang)",
      "Father (Tatay)",
      "Aunt (Tiya)",
      "Grandmother (Lola)"
    ],
    "category": "words",
    "syllables": "In • da"
  },
  {
    "kapampangan": "Ima",
    "correct": "Mother / Matriarch (Ina)",
    "options": [
      "Mother / Matriarch (Ina)",
      "Father (Ama)",
      "Elder Sister (Ate)",
      "Daughter (Anak na babae)"
    ],
    "category": "words",
    "syllables": "I • ma"
  },
  {
    "kapampangan": "Anak",
    "correct": "Child / Offspring (Anak)",
    "options": [
      "Child / Offspring (Anak)",
      "Parent (Magulang)",
      "Sibling (Kapatid)",
      "Grandchild (Apo)"
    ],
    "category": "words",
    "syllables": "A • nak"
  },
  {
    "kapampangan": "Kapatad",
    "correct": "Sibling / Brethren (Kapatid)",
    "options": [
      "Sibling / Brethren (Kapatid)",
      "First Cousin (Pinsan)",
      "Close Friend (Kaibigan)",
      "Elder / Parent (Magulang)"
    ],
    "category": "words",
    "syllables": "Ka • pa • tad"
  },
  {
    "kapampangan": "Koya",
    "correct": "Elder Brother (Kuya)",
    "options": [
      "Elder Brother (Kuya)",
      "Younger Brother (Bunsong Kapatid)",
      "Elder Sister (Ate)",
      "Cousin (Pinsan)"
    ],
    "category": "words",
    "syllables": "Ko • ya"
  },
  {
    "kapampangan": "Atsi",
    "correct": "Elder Sister (Ate)",
    "options": [
      "Elder Sister (Ate)",
      "Elder Brother (Kuya)",
      "Mother (Nanay)",
      "Aunt (Tita)"
    ],
    "category": "words",
    "syllables": "At • si"
  },
  {
    "kapampangan": "Ingkung",
    "correct": "Grandfather (Lolo / Ingkong)",
    "options": [
      "Grandfather (Lolo / Ingkong)",
      "Grandmother (Lola)",
      "Uncle (Tiyo)",
      "Father (Tatay)"
    ],
    "category": "words",
    "syllables": "Ing • kung"
  },
  {
    "kapampangan": "Apu",
    "correct": "Grandparent / Grandchild (Lolo / Lola / Apo)",
    "options": [
      "Grandparent / Grandchild (Lolo / Lola / Apo)",
      "Parent (Magulang)",
      "Cousin (Pinsan)",
      "Nephew / Niece (Pamangkin)"
    ],
    "category": "words",
    "syllables": "A • pu"
  },
  {
    "kapampangan": "Bapa",
    "correct": "Uncle (Tiyo / Tito)",
    "options": [
      "Uncle (Tiyo / Tito)",
      "Aunt (Tiya / Tita)",
      "Grandfather (Lolo)",
      "Brother-in-law (Bayaw)"
    ],
    "category": "words",
    "syllables": "Ba • pa"
  },
  {
    "kapampangan": "Dara",
    "correct": "Aunt (Tiya / Tita)",
    "options": [
      "Aunt (Tiya / Tita)",
      "Uncle (Tiyo / Tito)",
      "Mother (Nanay)",
      "Mother-in-law (Biyanan)"
    ],
    "category": "words",
    "syllables": "Da • ra"
  },
  {
    "kapampangan": "Pisan",
    "correct": "Cousin (Pinsan)",
    "options": [
      "Cousin (Pinsan)",
      "Sibling (Kapatid)",
      "Friend (Kaibigan)",
      "Neighbor (Kapitbahay)"
    ],
    "category": "words",
    "syllables": "Pi • san"
  },
  {
    "kapampangan": "Asawa",
    "correct": "Spouse / Partner (Asawa)",
    "options": [
      "Spouse / Partner (Asawa)",
      "Friend (Kaibigan)",
      "Sibling (Kapatid)",
      "Companion (Kasama)"
    ],
    "category": "words",
    "syllables": "A • sa • wa"
  },
  {
    "kapampangan": "Pipumpunan",
    "correct": "Ancestors / Heritage (Mga Ninuno)",
    "options": [
      "Ancestors / Heritage (Mga Ninuno)",
      "Descendants (Mga Apo)",
      "Children (Mga Anak)",
      "Siblings (Mga Kapatid)"
    ],
    "category": "words",
    "syllables": "Pi • pum • pu • nan"
  },
  {
    "kapampangan": "Pamilia",
    "correct": "Family / Household (Pamilya)",
    "options": [
      "Family / Household (Pamilya)",
      "Neighborhood (Kapitbahayan)",
      "Council (Sanggunian)",
      "Clan / Tribe (Lahi)"
    ],
    "category": "words",
    "syllables": "Pa • mi • lia"
  },
  {
    "kapampangan": "Kakaluguran",
    "correct": "Friend / Companion (Kaibigan)",
    "options": [
      "Friend / Companion (Kaibigan)",
      "Enemy / Rival (Kaaway)",
      "Stranger (Dayuhan)",
      "Acquaintance (Kakilala)"
    ],
    "category": "words",
    "syllables": "Ka • ka • lu • gu • ran"
  },
  {
    "kapampangan": "Abe",
    "correct": "Companion / Partner (Kasama)",
    "options": [
      "Companion / Partner (Kasama)",
      "Leader (Pinuno)",
      "Opponent (Kalaban)",
      "Stranger (Ibang tao)"
    ],
    "category": "words",
    "syllables": "A • be"
  },
  {
    "kapampangan": "Timawa",
    "correct": "Free / Liberated (Malaya)",
    "options": [
      "Free / Liberated (Malaya)",
      "Enslaved / Captive (Alipin)",
      "Exiled (Pinalayas)",
      "Pauper / Beggar (Pulubi)"
    ],
    "category": "words",
    "syllables": "Ti • ma • wa"
  },
  {
    "kapampangan": "Alipan",
    "correct": "Servant / Enslaved (Alipin)",
    "options": [
      "Servant / Enslaved (Alipin)",
      "Master / Chieftain (Panginoon)",
      "Freeman (Malaya)",
      "Warrior (Mandirigma)"
    ],
    "category": "words",
    "syllables": "A • li • pan"
  },
  {
    "kapampangan": "Buntuk",
    "correct": "Head / Forehead (Ulo / Noo)",
    "options": [
      "Head / Forehead (Ulo / Noo)",
      "Foot / Sole (Paa)",
      "Stomach / Core (Tiyan)",
      "Chest (Dibdib)"
    ],
    "category": "words",
    "syllables": "Bun • tuk"
  },
  {
    "kapampangan": "Gamat",
    "correct": "Hand / Arm (Kamay)",
    "options": [
      "Hand / Arm (Kamay)",
      "Foot / Leg (Paa / Binti)",
      "Face / Head (Mukha / Ulo)",
      "Shoulder (Balikat)"
    ],
    "category": "words",
    "syllables": "Ga • mat"
  },
  {
    "kapampangan": "Bitis",
    "correct": "Foot / Leg (Paa / Binti)",
    "options": [
      "Foot / Leg (Paa / Binti)",
      "Hand / Arm (Kamay)",
      "Chest (Dibdib)",
      "Spine / Back (Likod)"
    ],
    "category": "words",
    "syllables": "Bi • tis"
  },
  {
    "kapampangan": "Mata",
    "correct": "Eye / Vision (Mata)",
    "options": [
      "Eye / Vision (Mata)",
      "Ear (Tainga)",
      "Nose (Ilong)",
      "Mouth (Bibig)"
    ],
    "category": "words",
    "syllables": "Ma • ta"
  },
  {
    "kapampangan": "Asbuk",
    "correct": "Mouth / Lips (Bibig)",
    "options": [
      "Mouth / Lips (Bibig)",
      "Nose (Ilong)",
      "Tongue (Dila)",
      "Teeth (Ngipin)"
    ],
    "category": "words",
    "syllables": "As • buk"
  },
  {
    "kapampangan": "Balugbug",
    "correct": "Ear / Hearing (Tainga)",
    "options": [
      "Ear / Hearing (Tainga)",
      "Eyes (Mata)",
      "Cheek (Pisngi)",
      "Forehead (Noo)"
    ],
    "category": "words",
    "syllables": "Ba • lug • bug"
  },
  {
    "kapampangan": "Arung",
    "correct": "Nose (Ilong)",
    "options": [
      "Nose (Ilong)",
      "Mouth (Bibig)",
      "Chin (Baba)",
      "Throat (Lalamunan)"
    ],
    "category": "words",
    "syllables": "A • rung"
  },
  {
    "kapampangan": "Salu",
    "correct": "Chest / Breast (Dibdib)",
    "options": [
      "Chest / Breast (Dibdib)",
      "Back (Likod)",
      "Shoulder (Balikat)",
      "Waist (Baywang)"
    ],
    "category": "words",
    "syllables": "Sa • lu"
  },
  {
    "kapampangan": "Gulut",
    "correct": "Back / Spine (Likod)",
    "options": [
      "Back / Spine (Likod)",
      "Chest (Dibdib)",
      "Stomach (Tiyan)",
      "Neck (Leeg)"
    ],
    "category": "words",
    "syllables": "Gu • lut"
  },
  {
    "kapampangan": "Tiyan",
    "correct": "Stomach / Belly (Tiyan)",
    "options": [
      "Stomach / Belly (Tiyan)",
      "Chest (Dibdib)",
      "Heart (Puso)",
      "Navel (Pusod)"
    ],
    "category": "words",
    "syllables": "Ti • yan"
  },
  {
    "kapampangan": "Metung",
    "correct": "One (Isa)",
    "options": [
      "One (Isa)",
      "Two (Dalawa)",
      "Three (Tatlo)",
      "Ten (Sampu)"
    ],
    "category": "words",
    "syllables": "Me • tung"
  },
  {
    "kapampangan": "Adua",
    "correct": "Two (Dalawa)",
    "options": [
      "Two (Dalawa)",
      "Three (Tatlo)",
      "Four (Apat)",
      "One (Isa)"
    ],
    "category": "words",
    "syllables": "A • dua"
  },
  {
    "kapampangan": "Atlu",
    "correct": "Three (Tatlo)",
    "options": [
      "Three (Tatlo)",
      "Two (Dalawa)",
      "Five (Lima)",
      "Six (Anim)"
    ],
    "category": "words",
    "syllables": "At • lu"
  },
  {
    "kapampangan": "Apat",
    "correct": "Four (Apat)",
    "options": [
      "Four (Apat)",
      "Three (Tatlo)",
      "Eight (Walo)",
      "Seven (Pito)"
    ],
    "category": "words",
    "syllables": "A • pat"
  },
  {
    "kapampangan": "Lima",
    "correct": "Five (Lima)",
    "options": [
      "Five (Lima)",
      "Six (Anim)",
      "Four (Apat)",
      "Ten (Sampu)"
    ],
    "category": "words",
    "syllables": "Li • ma"
  },
  {
    "kapampangan": "Anam",
    "correct": "Six (Anim)",
    "options": [
      "Six (Anim)",
      "Seven (Pito)",
      "Five (Lima)",
      "Nine (Siyam)"
    ],
    "category": "words",
    "syllables": "A • nam"
  },
  {
    "kapampangan": "Pitu",
    "correct": "Seven (Pito)",
    "options": [
      "Seven (Pito)",
      "Eight (Walo)",
      "Six (Anim)",
      "Four (Apat)"
    ],
    "category": "words",
    "syllables": "Pi • tu"
  },
  {
    "kapampangan": "Walu",
    "correct": "Eight (Walo)",
    "options": [
      "Eight (Walo)",
      "Seven (Pito)",
      "Nine (Siyam)",
      "Ten (Sampu)"
    ],
    "category": "words",
    "syllables": "Wa • lu"
  },
  {
    "kapampangan": "Siyam",
    "correct": "Nine (Siyam)",
    "options": [
      "Nine (Siyam)",
      "Eight (Walo)",
      "Seven (Pito)",
      "Ten (Sampu)"
    ],
    "category": "words",
    "syllables": "Si • yam"
  },
  {
    "kapampangan": "Apulu",
    "correct": "Ten (Sampu)",
    "options": [
      "Ten (Sampu)",
      "One Hundred (Dinalan)",
      "Twenty (Dalawampu)",
      "Five (Lima)"
    ],
    "category": "words",
    "syllables": "A • pu • lu"
  },
  {
    "kapampangan": "Dinalan",
    "correct": "One Hundred (Isang Daan)",
    "options": [
      "One Hundred (Isang Daan)",
      "One Thousand (Libu)",
      "Ten (Sampu)",
      "Fifty (Limampulu)"
    ],
    "category": "words",
    "syllables": "Di • na • lan"
  },
  {
    "kapampangan": "Libu",
    "correct": "One Thousand (Isang Libo)",
    "options": [
      "One Thousand (Isang Libo)",
      "One Hundred (Dinalan)",
      "Ten Thousand (Laksang)",
      "Ten (Sampu)"
    ],
    "category": "words",
    "syllables": "Li • bu"
  },
  {
    "kapampangan": "Wanan",
    "correct": "Right / Right-hand side (Kanan)",
    "options": [
      "Right / Right-hand side (Kanan)",
      "Left side (Kaliwa)",
      "Straight ahead (Diretso)",
      "Behind (Likod)"
    ],
    "category": "words",
    "syllables": "Wa • nan"
  },
  {
    "kapampangan": "Kayli",
    "correct": "Left / Left-hand side (Kaliwa)",
    "options": [
      "Left / Left-hand side (Kaliwa)",
      "Right side (Kanan)",
      "Forward (Harap)",
      "Inside (Loob)"
    ],
    "category": "words",
    "syllables": "Kay • li"
  },
  {
    "kapampangan": "Babo",
    "correct": "Above / Upper / Top (Ibabaw)",
    "options": [
      "Above / Upper / Top (Ibabaw)",
      "Under / Bottom (Ilalim)",
      "Beside (Tabi)",
      "Inside (Loob)"
    ],
    "category": "words",
    "syllables": "Ba • bo"
  },
  {
    "kapampangan": "Lalam",
    "correct": "Under / Below / Deep (Ilalim)",
    "options": [
      "Under / Below / Deep (Ilalim)",
      "Above / Top (Ibabaw)",
      "Outside (Labas)",
      "Front (Harap)"
    ],
    "category": "words",
    "syllables": "La • lam"
  },
  {
    "kapampangan": "Kilub",
    "correct": "Inside / Interior (Loob)",
    "options": [
      "Inside / Interior (Loob)",
      "Outside (Labas)",
      "Far away (Malayo)",
      "Nearby (Malapit)"
    ],
    "category": "words",
    "syllables": "Ki • lub"
  },
  {
    "kapampangan": "Lwal",
    "correct": "Outside / Exterior (Labas)",
    "options": [
      "Outside / Exterior (Labas)",
      "Inside (Loob)",
      "Behind (Likod)",
      "Above (Ibabaw)"
    ],
    "category": "words",
    "syllables": "Lwal"
  },
  {
    "kapampangan": "Keni",
    "correct": "Here (Dito)",
    "options": [
      "Here (Dito)",
      "There (Doon)",
      "Somewhere (Kung saan)",
      "Everywhere (Kahit saan)"
    ],
    "category": "words",
    "syllables": "Ke • ni"
  },
  {
    "kapampangan": "Keta",
    "correct": "There / Yonder (Doon)",
    "options": [
      "There / Yonder (Doon)",
      "Here (Dito)",
      "Inside (Loob)",
      "Above (Taas)"
    ],
    "category": "words",
    "syllables": "Ke • ta"
  },
  {
    "kapampangan": "Marayu",
    "correct": "Far / Distant (Malayo)",
    "options": [
      "Far / Distant (Malayo)",
      "Near / Close (Malapit)",
      "Narrow (Makipot)",
      "Wide (Malawak)"
    ],
    "category": "words",
    "syllables": "Ma • ra • yu"
  },
  {
    "kapampangan": "Malapit",
    "correct": "Near / Close (Malapit)",
    "options": [
      "Near / Close (Malapit)",
      "Far / Distant (Malayo)",
      "High (Mataas)",
      "Hidden (Tago)"
    ],
    "category": "words",
    "syllables": "Ma • la • pit"
  },
  {
    "kapampangan": "Maragul",
    "correct": "Big / Large (Malaki)",
    "options": [
      "Big / Large (Malaki)",
      "Small / Tiny (Maliit)",
      "Narrow (Makitid)",
      "Thin (Payat)"
    ],
    "category": "words",
    "syllables": "Ma • ra • gul"
  },
  {
    "kapampangan": "Malati",
    "correct": "Small / Little (Maliit)",
    "options": [
      "Small / Little (Maliit)",
      "Big / Huge (Malaki)",
      "Tall / High (Mataas)",
      "Heavy (Mabigat)"
    ],
    "category": "words",
    "syllables": "Ma • la • ti"
  },
  {
    "kapampangan": "Matas",
    "correct": "High / Tall (Mataas)",
    "options": [
      "High / Tall (Mataas)",
      "Low / Short (Mababa)",
      "Deep (Malalim)",
      "Broad (Malapad)"
    ],
    "category": "words",
    "syllables": "Ma • tas"
  },
  {
    "kapampangan": "Mababa",
    "correct": "Low / Short (Mababa)",
    "options": [
      "Low / Short (Mababa)",
      "High / Tall (Mataas)",
      "Long (Mahaba)",
      "Stout (Mataba)"
    ],
    "category": "words",
    "syllables": "Ma • ba • ba"
  },
  {
    "kapampangan": "Masanting",
    "correct": "Handsome / Beautiful (Guwapo / Maganda)",
    "options": [
      "Handsome / Beautiful (Guwapo / Maganda)",
      "Ugly / Bad (Pangit)",
      "Weak (Mahina)",
      "Rough (Mmagaspang)"
    ],
    "category": "words",
    "syllables": "Ma • san • ting"
  },
  {
    "kapampangan": "Malagu",
    "correct": "Beautiful / Fair (Maganda)",
    "options": [
      "Beautiful / Fair (Maganda)",
      "Ugly (Pangit)",
      "Plain (Simple)",
      "Old (Matanda)"
    ],
    "category": "words",
    "syllables": "Ma • la • gu"
  },
  {
    "kapampangan": "Matsura",
    "correct": "Ugly / Bad-looking (Pangit)",
    "options": [
      "Ugly / Bad-looking (Pangit)",
      "Beautiful (Maganda)",
      "Splendid (Marikit)",
      "Clean (Malinis)"
    ],
    "category": "words",
    "syllables": "Mat • su • ra"
  },
  {
    "kapampangan": "Masipag",
    "correct": "Hardworking / Diligent (Masipag)",
    "options": [
      "Hardworking / Diligent (Masipag)",
      "Lazy / Idle (Tamad)",
      "Careless (Pabaya)",
      "Stubborn (Matigas ang ulo)"
    ],
    "category": "words",
    "syllables": "Ma • si • pag"
  },
  {
    "kapampangan": "Matamad",
    "correct": "Lazy / Slothful (Tamad)",
    "options": [
      "Lazy / Slothful (Tamad)",
      "Hardworking (Masipag)",
      "Clever (Matalino)",
      "Agile (Mabilis)"
    ],
    "category": "words",
    "syllables": "Ma • ta • mad"
  },
  {
    "kapampangan": "Masikan",
    "correct": "Strong / Powerful (Malakas)",
    "options": [
      "Strong / Powerful (Malakas)",
      "Weak / Fragile (Mahina)",
      "Gentle (Mahinahon)",
      "Slow (Mabagal)"
    ],
    "category": "words",
    "syllables": "Ma • si • kan"
  },
  {
    "kapampangan": "Mayna",
    "correct": "Weak / Feeble (Mahina)",
    "options": [
      "Weak / Feeble (Mahina)",
      "Strong / Mighty (Malakas)",
      "Fierce (Mabangis)",
      "Solid (Matibay)"
    ],
    "category": "words",
    "syllables": "May • na"
  },
  {
    "kapampangan": "Biasa",
    "correct": "Skilled / Intelligent (Marunong / Matalino)",
    "options": [
      "Skilled / Intelligent (Marunong / Matalino)",
      "Ignorant (Mangmang)",
      "Careless (Pabaya)",
      "Foolish (Hangal)"
    ],
    "category": "words",
    "syllables": "Bia • sa"
  },
  {
    "kapampangan": "Maluka",
    "correct": "Poor / Impoverished (Mahirap)",
    "options": [
      "Poor / Impoverished (Mahirap)",
      "Wealthy / Rich (Mayaman)",
      "Greedy (Makasarili)",
      "Royal (Maharlika)"
    ],
    "category": "words",
    "syllables": "Ma • lu • ka"
  },
  {
    "kapampangan": "Salapian",
    "correct": "Wealthy / Prosperous (Mayaman)",
    "options": [
      "Wealthy / Prosperous (Mayaman)",
      "Impoverished (Mahirap)",
      "Hardworking (Masipag)",
      "Honorable (Marangal)"
    ],
    "category": "words",
    "syllables": "Sa • la • pi • an"
  },
  {
    "kapampangan": "Makabayat",
    "correct": "Heavy / Burdensome (Mabigat)",
    "options": [
      "Heavy / Burdensome (Mabigat)",
      "Light / Weightless (Magaan)",
      "Dense / Solid (Siksik)",
      "Broad / Wide (Malapad)"
    ],
    "category": "words",
    "syllables": "Ma • ka • ba • yat"
  },
  {
    "kapampangan": "Makatuknang",
    "correct": "Residing / Inhabiting (Nakatira)",
    "options": [
      "Residing / Inhabiting (Nakatira)",
      "Laboring / Working (Nagtatrabaho)",
      "Resting (Nagpapahinga)",
      "Visiting (Bumisita)"
    ],
    "category": "words",
    "syllables": "Ma • ka • tuk • nang"
  },
  {
    "kapampangan": "Makatapak",
    "correct": "Barefoot (Nakayapak)",
    "options": [
      "Barefoot (Nakayapak)",
      "Shod / With Footwear (Nakasapatos)",
      "Bound / Shackled (Nakatali)",
      "Walking Slowly (Dahan-dahan)"
    ],
    "category": "words",
    "syllables": "Ma • ka • ta • pak"
  },
  {
    "kapampangan": "Masaya",
    "correct": "Happy / Joyful (Masaya)",
    "options": [
      "Happy / Joyful (Masaya)",
      "Sad (Malungkot)",
      "Angry (Galit)",
      "Anxious (Balisa)"
    ],
    "category": "words",
    "syllables": "Ma • sa • ya"
  },
  {
    "kapampangan": "Malungkut",
    "correct": "Sad / Sorrowful (Malungkot)",
    "options": [
      "Sad / Sorrowful (Malungkot)",
      "Happy (Masaya)",
      "Excited (Nasasabik)",
      "Furious (Nanggagalaiti)"
    ],
    "category": "words",
    "syllables": "Ma • lung • kut"
  },
  {
    "kapampangan": "Mimwa",
    "correct": "Angry / Enraged (Galit)",
    "options": [
      "Angry / Enraged (Galit)",
      "Calm (Payapa)",
      "Joyful (Masaya)",
      "Afraid (Takot)"
    ],
    "category": "words",
    "syllables": "Mim • wa"
  },
  {
    "kapampangan": "Mapagal",
    "correct": "Tired / Exhausted (Pagod)",
    "options": [
      "Tired / Exhausted (Pagod)",
      "Energetic (Masigla)",
      "Restless (Hindi mapakali)",
      "Hungry (Gutom)"
    ],
    "category": "words",
    "syllables": "Ma • pa • gal"
  },
  {
    "kapampangan": "Tatakut",
    "correct": "Afraid / Frightened (Takot)",
    "options": [
      "Afraid / Frightened (Takot)",
      "Brave (Matapang)",
      "Reckless (Pusok)",
      "Confident (Panatag)"
    ],
    "category": "words",
    "syllables": "Ta • ta • kut"
  },
  {
    "kapampangan": "Katapatan",
    "correct": "Honesty / Sincerity (Katapatan)",
    "options": [
      "Honesty / Sincerity (Katapatan)",
      "Deceit (Kasinungalingan)",
      "Pride (Kayabangan)",
      "Cowardice (Kaduwagan)"
    ],
    "category": "words",
    "syllables": "Ka • ta • pa • tan"
  },
  {
    "kapampangan": "Dangalan",
    "correct": "Honor / Dignity (Dangal)",
    "options": [
      "Honor / Dignity (Dangal)",
      "Shame (Kahihiyan)",
      "Treasure (Kayamanan)",
      "Victory (Tagumpay)"
    ],
    "category": "words",
    "syllables": "Da • nga • lan"
  },
  {
    "kapampangan": "Katatawanan",
    "correct": "Truth / Reality (Katotohanan)",
    "options": [
      "Truth / Reality (Katotohanan)",
      "Falsehood / Lie (Kasinungalingan)",
      "Illusion / Dream (Panaginip)",
      "Mystery / Secret (Lihim)"
    ],
    "category": "words",
    "syllables": "Ka • ta • ta • wa • nan"
  },
  {
    "kapampangan": "Kabyayan",
    "correct": "Life / Livelihood (Buhay / Hanapbuhay)",
    "options": [
      "Life / Livelihood (Buhay / Hanapbuhay)",
      "Death (Kamatayan)",
      "Illness (Karamdaman)",
      "Fate (Kapalaran)"
    ],
    "category": "words",
    "syllables": "Kab • ya • yan"
  },
  {
    "kapampangan": "Kapayapan",
    "correct": "Peace / Tranquility (Kapayapaan)",
    "options": [
      "Peace / Tranquility (Kapayapaan)",
      "War / Conflict (Digmaan)",
      "Chaos (Kaguluhan)",
      "Noise (Ingay)"
    ],
    "category": "words",
    "syllables": "Ka • pa • ya • pan"
  },
  {
    "kapampangan": "Kalayan",
    "correct": "Freedom / Liberty (Kalayaan)",
    "options": [
      "Freedom / Liberty (Kalayaan)",
      "Captivity (Pagkabihag)",
      "Servitude (Pagkaalipin)",
      "Silence (Katahimikan)"
    ],
    "category": "words",
    "syllables": "Ka • la • yan"
  },
  {
    "kapampangan": "Kasalpantayanan",
    "correct": "Faith / Devotion (Pananampalataya)",
    "options": [
      "Faith / Devotion (Pananampalataya)",
      "Doubt (Pag-aalinlangan)",
      "Denial (Pagtanggi)",
      "Despair (Kawalan ng pag-asa)"
    ],
    "category": "words",
    "syllables": "Ka • sal • pan • ta • ya • nan"
  },
  {
    "kapampangan": "Maganaka",
    "correct": "Kind / Considerate (Mabait / Maalalahanin)",
    "options": [
      "Kind / Considerate (Mabait / Maalalahanin)",
      "Cruel / Mean (Malupit)",
      "Greedy (Sakim)",
      "Arrogant (Mayabang)"
    ],
    "category": "words",
    "syllables": "Ma • ga • na • ka"
  },
  {
    "kapampangan": "Malugud",
    "correct": "Loving / Affectionate (Mapagmahal)",
    "options": [
      "Loving / Affectionate (Mapagmahal)",
      "Cold / Indifferent (Malamig ang loob)",
      "Envious (Mainggitin)",
      "Hateful (Mapoot)"
    ],
    "category": "words",
    "syllables": "Ma • lu • gud"
  },
  {
    "kapampangan": "Kulitan",
    "correct": "Indigenous Kapampangan Script (Sulat Kulitan)",
    "options": [
      "Indigenous Kapampangan Script (Sulat Kulitan)",
      "Modern Alphabet (Abakada)",
      "Ancient Weapon (Sandata)",
      "Sacred Ritual (Seremonya)"
    ],
    "category": "words",
    "syllables": "Ku • li • tan"
  },
  {
    "kapampangan": "Alaya",
    "correct": "Dawn / East / Mount Arayat (Silangan / Bundok Alaya)",
    "options": [
      "Dawn / East / Mount Arayat (Silangan / Bundok Alaya)",
      "West / Sunset (Kanluran)",
      "Sea / Abyss (Karagatan)",
      "North (Hilaga)"
    ],
    "category": "words",
    "syllables": "A • la • ya"
  },
  {
    "kapampangan": "Pagmaragul",
    "correct": "To Take Pride In (Ipagmalaki)",
    "options": [
      "To Take Pride In (Ipagmalaki)",
      "To Deny (Itanggi)",
      "To Forget (Kalimutan)",
      "To Despise (Hamakin)"
    ],
    "category": "words",
    "syllables": "Pag • ma • ra • gul"
  },
  {
    "kapampangan": "Salangian",
    "correct": "To Light Up / Ignite (Sindihan)",
    "options": [
      "To Light Up / Ignite (Sindihan)",
      "To Extinguish (Patayin)",
      "To Kindle / Fan (Paypayan)",
      "To Burn down (Sunugin)"
    ],
    "category": "words",
    "syllables": "Sa • la • ngi • an"
  },
  {
    "kapampangan": "Sasalikut",
    "correct": "Hiding / Concealing (Nagtatago)",
    "options": [
      "Hiding / Concealing (Nagtatago)",
      "Searching / Hunting (Naghahanap)",
      "Escaping / Fleeing (Tumatakas)",
      "Watching (Nagmamasid)"
    ],
    "category": "words",
    "syllables": "Sa • sa • li • kut"
  },
  {
    "kapampangan": "Makapangilabut",
    "correct": "Terrifying / Dreadful (Nakakatakot)",
    "options": [
      "Terrifying / Dreadful (Nakakatakot)",
      "Astonishing (Kahanga-hanga)",
      "Desolate / Lonely (Nakalulungkot)",
      "Dangerous (Mapanganib)"
    ],
    "category": "words",
    "syllables": "Ma • ka • pa • ngi • la • but"
  },
  {
    "kapampangan": "Paglalawen",
    "correct": "Gazing At / Observing (Pinagmamasdan)",
    "options": [
      "Gazing At / Observing (Pinagmamasdan)",
      "Ignoring / Neglecting (Binabalewala)",
      "Listening Carefully (Pinakikinggan)",
      "Contemplating (Iniisip)"
    ],
    "category": "words",
    "syllables": "Pag • la • la • wen"
  },
  {
    "kapampangan": "Mangabiran",
    "correct": "Being Biased / Partial (May Kinikilingan)",
    "options": [
      "Being Biased / Partial (May Kinikilingan)",
      "Rage / Wrath (Galit)",
      "Deceitful (Manloloko)",
      "Hesitant (Nag-aalangan)"
    ],
    "category": "words",
    "syllables": "Ma • nga • bi • ran"
  },
  {
    "kapampangan": "Alingasngas",
    "correct": "Gossip / Rumor (Tsismis / Alingasngas)",
    "options": [
      "Gossip / Rumor (Tsismis / Alingasngas)",
      "Quietness (Katahimikan)",
      "Folklore (Kwentong Bayan)",
      "Poetry / Chant (Tula)"
    ],
    "category": "words",
    "syllables": "A • li • ngas • ngas"
  }
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
