export const QUIZ_POOL = [
  { kapampangan: 'Nanu gagawan mu', correct: 'Ano ginagawa mo', options: ['Ano ginagawa mo', 'Saan ka pupunta', 'Kumusta ka', 'Anong pangalan mo'] },
  { kapampangan: 'Komusta', correct: 'Kumusta', options: ['Magandang umaga', 'Kumusta', 'Salamat', 'Paalam'] },
  { kapampangan: 'Mayap a abak', correct: 'Magandang umaga', options: ['Magandang gabi', 'Magandang tanghali', 'Magandang hapon', 'Magandang umaga'] },
  { kapampangan: 'Nukarin ka munta', correct: 'Saan ka pupunta', options: ['Ano ginagawa mo', 'Saan ka pupunta', 'Sino kasama mo', 'Anong oras na'] },
  { kapampangan: 'Kaluguran daka', correct: 'Mahal kita', options: ['Salamat', 'Maganda ka', 'Mahal kita', 'Kaibigan kita'] },
  { kapampangan: 'Mangan tamu', correct: 'Kain tayo', options: ['Kain tayo', 'Tulog na tayo', 'Aalis na tayo', 'Uwi na tayo'] },
  { kapampangan: 'Wa', correct: 'Oo', options: ['Oo', 'Hindi', 'Siguro', 'Ewan'] },
  { kapampangan: 'Ali', correct: 'Hindi', options: ['Oo', 'Hindi', 'Siguro', 'Ewan'] },
  { kapampangan: 'Dakal a salamat', correct: 'Maraming salamat', options: ['Maraming salamat', 'Walang anuman', 'Paumanhin', 'Magandang gabi'] },
  { kapampangan: 'Nanu lagyu mu', correct: 'Anong pangalan mo', options: ['Anong oras na', 'Ilang taon ka na', 'Saan ka nakatira', 'Anong pangalan mo'] },
  { kapampangan: 'Mako na ku', correct: 'Aalis na ako', options: ['Aalis na ako', 'Uuwi na ako', 'Matutulog na ako', 'Kakain na ako'] },
  { kapampangan: 'Mimwa ku', correct: 'Nagalit ako', options: ['Masaya ako', 'Malungkot ako', 'Nagalit ako', 'Natatakot ako'] },
  { kapampangan: 'Masanting', correct: 'Maganda/Gwapo', options: ['Pangit', 'Maganda/Gwapo', 'Maliit', 'Malaki'] },
  { kapampangan: 'Pilan ka banua', correct: 'Ilang taon ka na', options: ['Ilang taon ka na', 'Saan ka nakatira', 'Anong pangalan mo', 'Kailan ang birthday mo'] },
  { kapampangan: 'Malditang', correct: 'Masungit', options: ['Mabait', 'Masungit', 'Maingay', 'Tahimik'] }
];

export const getRandomQuestions = (count: number = 5) => {
  const shuffled = [...QUIZ_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
