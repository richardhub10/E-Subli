export const QUIZ_POOL = [
  { kapampangan: 'Mangabiran', correct: 'Maging biased', options: ['Maging biased', 'Magalit nang sobra', 'Maging mabilis', 'Maging malungkot'] },
  { kapampangan: 'Salangian', correct: 'Sindihan', options: ['Patayin', 'Sindihan', 'Takbuhan', 'Lutuin'] },
  { kapampangan: 'Alingasngas', correct: 'Eskandalo / Tsismis', options: ['Katahimikan', 'Magandang tanawin', 'Malakas na musika', 'Eskandalo / Tsismis'] },
  { kapampangan: 'Pipumpunan', correct: 'Mga ninuno', options: ['Mga apo', 'Mga ninuno', 'Mga anak', 'Mga kamag-anak'] },
  { kapampangan: 'Maglolo', correct: 'Manligaw', options: ['Manligaw', 'Makipag-away', 'Magsayaw', 'Magluto'] },
  { kapampangan: 'Makabayat', correct: 'Mabigat', options: ['Magaan', 'Mabigat', 'Makulay', 'Masarap'] },
  { kapampangan: 'Makatuknang', correct: 'Nakatira', options: ['Nakatira', 'Nagtatrabaho', 'Naglalaro', 'Natutulog'] },
  { kapampangan: 'Pamangamanu', correct: 'Wika / Salita', options: ['Awit / Kanta', 'Sulat / Liham', 'Wika / Salita', 'Sayaw'] },
  { kapampangan: 'Salapian', correct: 'Mayaman', options: ['Mayaman', 'Mahirap', 'Matamad', 'Matalino'] },
  { kapampangan: 'Katatawanan', correct: 'Katotohanan', options: ['Katotohanan', 'Kasinungalingan', 'Panaginip', 'Biro'] },
  { kapampangan: 'Paglalawen', correct: 'Pinagmamasdan', options: ['Binabalewala', 'Pinagmamasdan', 'Pinakikinggan', 'Inaamoy'] },
  { kapampangan: 'Luid', correct: 'Mabuhay / Kasaganaan', options: ['Paalam', 'Magandang gabi', 'Salamat', 'Mabuhay / Kasaganaan'] },
  { kapampangan: 'Bala-bala', correct: 'Nagkukunwari', options: ['Nagkukunwari', 'Totohanan', 'Galit', 'Seryoso'] },
  { kapampangan: 'Kaluklukan', correct: 'Upuan / Posisyon', options: ['Upuan / Posisyon', 'Higaan', 'Lamesa', 'Pintuan'] },
  { kapampangan: 'Kamalig', correct: 'Bangan / Imbakan', options: ['Bahay', 'Bangan / Imbakan', 'Simbahan', 'Palengke'] },
  { kapampangan: 'Gugulisak', correct: 'Sumisigaw', options: ['Bumubulong', 'Tumatawa', 'Umiiyak', 'Sumisigaw'] },
  { kapampangan: 'Makapangilabut', correct: 'Nakakatakot', options: ['Nakakatawa', 'Nakakabagot', 'Nakakatakot', 'Nakaka-excite'] },
  { kapampangan: 'Sasalikut', correct: 'Nagtatago', options: ['Nagtatago', 'Naghahanap', 'Tumatakbo', 'Tumatalon'] },
  { kapampangan: 'Alipugpug', correct: 'Ipu-ipo', options: ['Ipu-ipo', 'Ulan', 'Lindol', 'Baha'] },
  { kapampangan: 'Papanik', correct: 'Umaakyat', options: ['Umaakyat', 'Bumababa', 'Dumidiretso', 'Lumaliko'] },
  { kapampangan: 'Mamalipit', correct: 'Pumipilipit', options: ['Humihila', 'Nagtutulak', 'Sumisira', 'Pumipilipit'] },
  { kapampangan: 'Salilung', correct: 'Lilim', options: ['Araw', 'Lilim', 'Ulan', 'Hangin'] },
  { kapampangan: 'Taram', correct: 'Talim', options: ['Talim', 'Pupu', 'Dulas', 'Gaspang'] },
  { kapampangan: 'Pipikat', correct: 'Kumukurap', options: ['Kumukurap', 'Tumatitig', 'Pumipikit', 'Lumuha'] },
  { kapampangan: 'Dayat-malat', correct: 'Dagat', options: ['Ilog', 'Lawa', 'Sapa', 'Dagat'] }
];

export const getRandomQuestions = (count: number = 5) => {
  const shuffled = [...QUIZ_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
