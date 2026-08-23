export type PhraseCategory = 
  | 'Greetings' 
  | 'Basics' 
  | 'Conversations' 
  | 'Food & Dining' 
  | 'Family' 
  | 'Love & Emotions' 
  | 'Numbers' 
  | 'Directions' 
  | 'Culture & Proverbs';

export type Phrase = {
  id: string;
  category: PhraseCategory;
  english: string;
  tagalog: string;
  kapampangan: string;
  kulitan: string; // Phonetic syllables rendered with Kulitan font
};

export const phrasebookData: Phrase[] = [
  // ==========================================
  // 1. GREETINGS (16 Phrases)
  // ==========================================
  { id: 'g1', category: 'Greetings', english: 'Good morning', tagalog: 'Magandang umaga', kapampangan: 'Mayap a abak', kulitan: 'ma-ya-p a a-ba-k' },
  { id: 'g2', category: 'Greetings', english: 'Good afternoon', tagalog: 'Magandang hapon', kapampangan: 'Mayap a gatpanapun', kulitan: 'ma-ya-p a ga-t-pa-na-pu-n' },
  { id: 'g3', category: 'Greetings', english: 'Good evening', tagalog: 'Magandang gabi', kapampangan: 'Mayap a bengi', kulitan: 'ma-ya-p a be-ngi' },
  { id: 'g4', category: 'Greetings', english: 'How are you?', tagalog: 'Kumusta ka?', kapampangan: 'Komusta naka?', kulitan: 'ko-mu-s-ta na-ka' },
  { id: 'g5', category: 'Greetings', english: 'Welcome (Please come in)', tagalog: 'Tuloy po kayo / Maligayang pagdating', kapampangan: 'Malaus ko pu', kulitan: 'ma-la-u-s ko pu' },
  { id: 'g6', category: 'Greetings', english: 'Goodbye (I will leave now)', tagalog: 'Aalis na po ako / Paalam', kapampangan: 'Mako naku pu', kulitan: 'ma-ko na-ku pu' },
  { id: 'g7', category: 'Greetings', english: 'See you later', tagalog: 'Magkikita tayo mamaya', kapampangan: 'Mikit kata pota', kulitan: 'mi-ki-t ka-ta po-ta' },
  { id: 'g8', category: 'Greetings', english: 'Take care', tagalog: 'Mag-ingat ka', kapampangan: 'Mim-ingat ka', kulitan: 'mi-m i-nga-t ka' },
  { id: 'g9', category: 'Greetings', english: 'Take care always', tagalog: 'Mag-ingat ka palagi', kapampangan: 'Mim-ingat pane', kulitan: 'mi-m i-nga-t pa-ne' },
  { id: 'g10', category: 'Greetings', english: 'Long time no see', tagalog: 'Matagal tayong hindi nagkita', kapampangan: 'Maluat na katang e mikit', kulitan: 'ma-lu-wa-t na ka-ta-ng e mi-ki-t' },
  { id: 'g11', category: 'Greetings', english: 'Nice to meet you', tagalog: 'Ikinagagalak kitang makilala', kapampangan: 'Masaya kung akilala daka', kulitan: 'ma-sa-ya ku-ng a-ki-la-la da-ka' },
  { id: 'g12', category: 'Greetings', english: 'Have a safe trip', tagalog: 'Ingat sa biyahe', kapampangan: 'Mayap a byahe', kulitan: 'ma-ya-p a bya-he' },
  { id: 'g13', category: 'Greetings', english: 'Welcome back', tagalog: 'Maligayang pagbabalik', kapampangan: 'Malaus ko pu pasibayu', kulitan: 'ma-la-u-s ko pu pa-si-ba-yu' },
  { id: 'g14', category: 'Greetings', english: 'Happy Birthday', tagalog: 'Maligayang Kaarawan', kapampangan: 'Masayang Kebaitan', kulitan: 'ma-sa-ya-ng ke-ba-i-ta-n' },
  { id: 'g15', category: 'Greetings', english: 'Happy New Year', tagalog: 'Manigong Bagong Taon', kapampangan: 'Masayang Bayung Banwa', kulitan: 'ma-sa-ya-ng ba-yu-ng ba-n-wa' },
  { id: 'g16', category: 'Greetings', english: 'Merry Christmas', tagalog: 'Maligayang Pasko', kapampangan: 'Masayang Pasku', kulitan: 'ma-sa-ya-ng pa-s-ku' },

  // ==========================================
  // 2. BASICS & COURTESY (18 Phrases)
  // ==========================================
  { id: 'b1', category: 'Basics', english: 'Yes', tagalog: 'Oo', kapampangan: 'Wa', kulitan: 'wa' },
  { id: 'b2', category: 'Basics', english: 'No', tagalog: 'Hindi', kapampangan: 'Ali', kulitan: 'a-li' },
  { id: 'b3', category: 'Basics', english: 'Thank you very much', tagalog: 'Maraming salamat', kapampangan: 'Dakal a salamat', kulitan: 'da-ka-l a sa-la-ma-t' },
  { id: 'b4', category: 'Basics', english: 'You are welcome', tagalog: 'Walang anuman', kapampangan: 'Alang nanu man', kulitan: 'a-la-ng na-nu ma-n' },
  { id: 'b5', category: 'Basics', english: 'Please', tagalog: 'Pakiusap', kapampangan: 'Paki / Soga', kulitan: 'pa-ki' },
  { id: 'b6', category: 'Basics', english: 'Excuse me (Passing by)', tagalog: 'Makikiraan po', kapampangan: 'Makikidalan pu', kulitan: 'ma-ki-ki-da-la-n pu' },
  { id: 'b7', category: 'Basics', english: 'I am sorry', tagalog: 'Patawad po / Pasensya na', kapampangan: 'Patawad pu / Pasensya na', kulitan: 'pa-ta-wa-d pu' },
  { id: 'b8', category: 'Basics', english: 'I do not know', tagalog: 'Hindi ko alam', kapampangan: 'Eku balu', kulitan: 'e-ku ba-lu' },
  { id: 'b9', category: 'Basics', english: 'I understand', tagalog: 'Naiintindihan ko', kapampangan: 'Aintindian ku', kulitan: 'a-i-n-ti-n-dya-n ku' },
  { id: 'b10', category: 'Basics', english: "I do not understand", tagalog: 'Hindi ko naiintindihan', kapampangan: 'Eku aintindian', kulitan: 'e-ku a-i-n-ti-n-dya-n' },
  { id: 'b11', category: 'Basics', english: 'Who is that?', tagalog: 'Sino iyan?', kapampangan: 'Ninu ita?', kulitan: 'ni-nu i-ta' },
  { id: 'b12', category: 'Basics', english: 'What is this?', tagalog: 'Ano ito?', kapampangan: 'Nanu ini?', kulitan: 'na-nu i-ni' },
  { id: 'b13', category: 'Basics', english: 'When?', tagalog: 'Kailan?', kapampangan: 'Kapilan?', kulitan: 'ka-pi-la-n' },
  { id: 'b14', category: 'Basics', english: 'Where is it?', tagalog: 'Nasaan ito?', kapampangan: 'Nukarin ya?', kulitan: 'nu-ka-ri-n ya' },
  { id: 'b15', category: 'Basics', english: 'Why?', tagalog: 'Bakit?', kapampangan: 'Obakit?', kulitan: 'o-ba-ki-t' },
  { id: 'b16', category: 'Basics', english: 'How to do this?', tagalog: 'Paano ito gawin?', kapampangan: 'Makananu ini gawan?', kulitan: 'ma-ka-na-nu i-ni ga-wa-n' },
  { id: 'b17', category: 'Basics', english: 'How much is this?', tagalog: 'Magkano ito?', kapampangan: 'Magkanu ya ini?', kulitan: 'ma-g-ka-nu ya i-ni' },
  { id: 'b18', category: 'Basics', english: 'God bless you', tagalog: 'Pagpalain ka ng Panginoon', kapampangan: 'Pabanalan naka ning Apung Ginu', kulitan: 'pa-ba-na-la-n na-ka ni-ng a-pu-ng gi-nu' },

  // ==========================================
  // 3. CONVERSATIONS & SOCIAL (16 Phrases)
  // ==========================================
  { id: 'c1', category: 'Conversations', english: 'What is your name?', tagalog: 'Ano ang pangalan mo?', kapampangan: 'Nanu ing lagyu mu?', kulitan: 'na-nu i-ng la-gyu mu' },
  { id: 'c2', category: 'Conversations', english: 'My name is...', tagalog: 'Ang pangalan ko ay...', kapampangan: 'Ing lagyu ku...', kulitan: 'i-ng la-gyu ku' },
  { id: 'c3', category: 'Conversations', english: 'Where are you from?', tagalog: 'Taga-saan ka?', kapampangan: 'Taga nukarin ka?', kulitan: 'ta-ga nu-ka-ri-n ka' },
  { id: 'c4', category: 'Conversations', english: 'I am from Pampanga', tagalog: 'Taga-Pampanga ako', kapampangan: 'Taga Pampanga ku', kulitan: 'ta-ga pa-m-pa-nga ku' },
  { id: 'c5', category: 'Conversations', english: 'What are you doing?', tagalog: 'Ano ang ginagawa mo?', kapampangan: 'Nanu ing gagawan mu?', kulitan: 'na-nu i-ng ga-ga-wa-n mu' },
  { id: 'c6', category: 'Conversations', english: 'Where are you going?', tagalog: 'Saan ka pupunta?', kapampangan: 'Nukarin ka munta?', kulitan: 'nu-ka-ri-n ka mu-n-ta' },
  { id: 'c7', category: 'Conversations', english: 'Come here', tagalog: 'Halika rito', kapampangan: 'Munta ka keni', kulitan: 'mu-n-ta ka ke-ni' },
  { id: 'c8', category: 'Conversations', english: 'Wait for me', tagalog: 'Hintayin mo ako', kapampangan: 'Panayan mu ku', kulitan: 'pa-na-ya-n mu ku' },
  { id: 'c9', category: 'Conversations', english: 'Let us go together', tagalog: 'Tayo nang sabay', kapampangan: 'Tana sabay', kulitan: 'ta-na sa-ba-y' },
  { id: 'c10', category: 'Conversations', english: 'Do you speak Kapampangan?', tagalog: 'Marunong ka bang mag-Kapampangan?', kapampangan: 'Balu mu mag-Kapampangan?', kulitan: 'ba-lu mu ma-g ka-pa-m-pa-nga-n' },
  { id: 'c11', category: 'Conversations', english: 'I am learning Kapampangan', tagalog: 'Nag-aaral akong mag-Kapampangan', kapampangan: 'Mag-aral kung Kapampangan', kulitan: 'ma-g a-ra-l ku-ng ka-pa-m-pa-nga-n' },
  { id: 'c12', category: 'Conversations', english: 'Please speak slowly', tagalog: 'Dahan-dahan lang po sa pagsasalita', kapampangan: 'Bagya-bagya mu pu magsalita', kulitan: 'ba-g-ya ba-g-ya mu pu ma-g-sa-li-ta' },
  { id: 'c13', category: 'Conversations', english: 'Can you help me?', tagalog: 'Maaari mo ba akong tulungan?', kapampangan: 'Malyari mu kung saupan?', kulitan: 'ma-l-ya-ri mu ku-ng sa-u-pa-n' },
  { id: 'c14', category: 'Conversations', english: 'Do not worry', tagalog: 'Huwag kang mag-alala', kapampangan: 'Eka mag-alala', kulitan: 'e-ka ma-g a-la-la' },
  { id: 'c15', category: 'Conversations', english: 'It is okay / No problem', tagalog: 'Ayos lang / Walang problema', kapampangan: 'Mayap mu / Alang problema', kulitan: 'ma-ya-p mu / a-la-ng pro-b-le-ma' },
  { id: 'c16', category: 'Conversations', english: 'Are you sure?', tagalog: 'Sigurado ka ba?', kapampangan: 'Siguradu ka?', kulitan: 'si-gu-ra-du ka' },

  // ==========================================
  // 4. FOOD & DINING (16 Phrases)
  // ==========================================
  { id: 'fd1', category: 'Food & Dining', english: 'Have you eaten?', tagalog: 'Kumain ka na ba?', kapampangan: 'Mengan naka?', kulitan: 'me-nga-n na-ka' },
  { id: 'fd2', category: 'Food & Dining', english: 'Let us eat!', tagalog: 'Kain na tayo!', kapampangan: 'Mangan tana!', kulitan: 'ma-nga-n ta-na' },
  { id: 'fd3', category: 'Food & Dining', english: 'This food is very delicious!', tagalog: 'Napakasarap ng pagkaing ito!', kapampangan: 'Manyaman ya ing pamangan!', kulitan: 'ma-nya-ma-n ya i-ng pa-ma-nga-n' },
  { id: 'fd4', category: 'Food & Dining', english: 'I am full', tagalog: 'Busog na ako', kapampangan: 'Mabsi naku', kulitan: 'ma-b-si na-ku' },
  { id: 'fd5', category: 'Food & Dining', english: 'I am hungry', tagalog: 'Gutom na ako', kapampangan: 'Danan naku', kulitan: 'da-na-n na-ku' },
  { id: 'fd6', category: 'Food & Dining', english: 'I am thirsty', tagalog: 'Nauuhaw ako', kapampangan: 'Kawatan naku', kulitan: 'ka-wa-ta-n na-ku' },
  { id: 'fd7', category: 'Food & Dining', english: 'Can I have some water?', tagalog: 'Pahingi po ng tubig', kapampangan: 'Panyad kung danum pu', kulitan: 'pa-nya-d ku-ng da-nu-m pu' },
  { id: 'fd8', category: 'Food & Dining', english: 'Cooked rice', tagalog: 'Kanin', kapampangan: 'Nasi', kulitan: 'na-si' },
  { id: 'fd9', category: 'Food & Dining', english: 'Viand / Dish', tagalog: 'Ulam', kapampangan: 'Asan', kulitan: 'a-sa-n' },
  { id: 'fd10', category: 'Food & Dining', english: 'Vegetables', tagalog: 'Gulay', kapampangan: 'Gule', kulitan: 'gu-le' },
  { id: 'fd11', category: 'Food & Dining', english: 'Fish', tagalog: 'Isda', kapampangan: 'Asan a danum / Asan', kulitan: 'a-sa-n' },
  { id: 'fd12', category: 'Food & Dining', english: 'Meat / Pork', tagalog: 'Karne / Baboy', kapampangan: 'Karne / Babi', kulitan: 'ka-r-ne / ba-bi' },
  { id: 'fd13', category: 'Food & Dining', english: 'Chicken', tagalog: 'Manok', kapampangan: 'Manuk', kulitan: 'ma-nu-k' },
  { id: 'fd14', category: 'Food & Dining', english: 'Sweet', tagalog: 'Matamis', kapampangan: 'Mamis', kulitan: 'ma-mi-s' },
  { id: 'fd15', category: 'Food & Dining', english: 'Sour', tagalog: 'Maasim', kapampangan: 'Maslam', kulitan: 'ma-s-la-m' },
  { id: 'fd16', category: 'Food & Dining', english: 'Salty', tagalog: 'Maalat', kapampangan: 'Maalat / Masampat', kulitan: 'ma-a-la-t' },

  // ==========================================
  // 5. FAMILY & KINSHIP (15 Phrases)
  // ==========================================
  { id: 'f1', category: 'Family', english: 'Father', tagalog: 'Ama / Tatay', kapampangan: 'Tatáng / Ibpa', kulitan: 'ta-ta-ng / i-b-pa' },
  { id: 'f2', category: 'Family', english: 'Mother', tagalog: 'Ina / Nanay', kapampangan: 'Indû / Ima', kulitan: 'i-n-du / i-ma' },
  { id: 'f3', category: 'Family', english: 'Child / Offspring', tagalog: 'Anak', kapampangan: 'Anak', kulitan: 'a-na-k' },
  { id: 'f4', category: 'Family', english: 'Sibling', tagalog: 'Kapatid', kapampangan: 'Kapatad', kulitan: 'ka-pa-ta-d' },
  { id: 'f5', category: 'Family', english: 'Elder Brother', tagalog: 'Kuya', kapampangan: 'Koya', kulitan: 'ko-ya' },
  { id: 'f6', category: 'Family', english: 'Elder Sister', tagalog: 'Ate', kapampangan: 'Atsi', kulitan: 'a-t-si' },
  { id: 'f7', category: 'Family', english: 'Grandfather', tagalog: 'Lolo / Ingkong', kapampangan: 'Ingkung', kulitan: 'i-ng-ku-ng' },
  { id: 'f8', category: 'Family', english: 'Grandmother', tagalog: 'Lola / Impo', kapampangan: 'Apu / Impo', kulitan: 'a-pu / i-m-po' },
  { id: 'f9', category: 'Family', english: 'Uncle', tagalog: 'Tiyo / Tito', kapampangan: 'Bapa', kulitan: 'ba-pa' },
  { id: 'f10', category: 'Family', english: 'Aunt', tagalog: 'Tiya / Tita', kapampangan: 'Dara', kulitan: 'da-ra' },
  { id: 'f11', category: 'Family', english: 'Cousin', tagalog: 'Pinsan', kapampangan: 'Pisan', kulitan: 'pi-sa-n' },
  { id: 'f12', category: 'Family', english: 'Grandchild', tagalog: 'Apo', kapampangan: 'Apo', kulitan: 'a-po' },
  { id: 'f13', category: 'Family', english: 'Spouse / Partner', tagalog: 'Asawa', kapampangan: 'Asawa', kulitan: 'a-sa-wa' },
  { id: 'f14', category: 'Family', english: 'Family / Household', tagalog: 'Pamilya / Angkan', kapampangan: 'Pamilia / Pipumpunan', kulitan: 'pa-mi-l-ya' },
  { id: 'f15', category: 'Family', english: 'Friend', tagalog: 'Kaibigan', kapampangan: 'Kakaluguran / Abe', kulitan: 'ka-ka-lu-gu-ra-n / a-be' },

  // ==========================================
  // 6. LOVE & EMOTIONS (15 Phrases)
  // ==========================================
  { id: 'le1', category: 'Love & Emotions', english: 'I love you', tagalog: 'Mahal kita', kapampangan: 'Kaluguran daka', kulitan: 'ka-lu-gu-ra-n da-ka' },
  { id: 'le2', category: 'Love & Emotions', english: 'I miss you', tagalog: 'Nangungulila ako sa iyo / Miss na kita', kapampangan: 'Mapanalala daka / Tumaila ku keka', kulitan: 'ma-pa-na-la-la da-ka' },
  { id: 'le3', category: 'Love & Emotions', english: 'You are beautiful', tagalog: 'Napakaganda mo', kapampangan: 'Kasanting mu / Kalagu mu', kulitan: 'ka-la-gu mu' },
  { id: 'le4', category: 'Love & Emotions', english: 'You are handsome', tagalog: 'Napakakisig mo / Guwapo ka', kapampangan: 'Kasanting mu', kulitan: 'ka-sa-n-ti-ng mu' },
  { id: 'le5', category: 'Love & Emotions', english: 'I am proud of you', tagalog: 'Ipinagmamalaki kita', kapampangan: 'Pagmaragul daka', kulitan: 'pa-g-ma-ra-gu-l da-ka' },
  { id: 'le6', category: 'Love & Emotions', english: 'I am happy', tagalog: 'Masaya ako', kapampangan: 'Masaya ku', kulitan: 'ma-sa-ya ku' },
  { id: 'le7', category: 'Love & Emotions', english: 'I am sad', tagalog: 'Malungkot ako', kapampangan: 'Malungkut ku', kulitan: 'ma-lu-ng-ku-t ku' },
  { id: 'le8', category: 'Love & Emotions', english: 'I am angry', tagalog: 'Galit ako', kapampangan: 'Mimwa ku', kulitan: 'mi-m-wa ku' },
  { id: 'le9', category: 'Love & Emotions', english: 'I am tired', tagalog: 'Pagod na ako', kapampangan: 'Mapagal naku', kulitan: 'ma-pa-ga-l na-ku' },
  { id: 'le10', category: 'Love & Emotions', english: 'Do not be afraid', tagalog: 'Huwag kang matakot', kapampangan: 'Eka tatakut', kulitan: 'e-ka ta-ta-ku-t' },
  { id: 'le11', category: 'Love & Emotions', english: 'Have courage', tagalog: 'Lakasan mo ang iyong loob', kapampangan: 'Pasikanan me ing lub mu', kulitan: 'pa-si-ka-na-n me i-ng lu-b mu' },
  { id: 'le12', category: 'Love & Emotions', english: 'You are special to me', tagalog: 'Espesyal ka sa akin', kapampangan: 'Espesyal ka kanaku', kulitan: 'e-s-pe-s-ya-l ka ka-na-ku' },
  { id: 'le13', category: 'Love & Emotions', english: 'Forever in my heart', tagalog: 'Habang-buhay sa aking puso', kapampangan: 'Kapilanman king pusu ku', kulitan: 'ka-pi-la-n-ma-n ki-ng pu-su ku' },
  { id: 'le14', category: 'Love & Emotions', english: 'My beloved', tagalog: 'Aking mahal / Giliw', kapampangan: 'Kakung kaluguran', kulitan: 'ka-ku-ng ka-lu-gu-ra-n' },
  { id: 'le15', category: 'Love & Emotions', english: 'You make me smile', tagalog: 'Pinangingiti mo ako', kapampangan: 'Papagkailitan mu ku', kulitan: 'pa-pa-g-ka-i-li-ta-n mu ku' },

  // ==========================================
  // 7. NUMBERS & COUNTING (1 to 100 Complete)
  // ==========================================
  { id: 'num_1', category: 'Numbers', english: '1. One', tagalog: 'Isa', kapampangan: 'Metung (1)', kulitan: 'me-tu-ng' },
  { id: 'num_2', category: 'Numbers', english: '2. Two', tagalog: 'Dalawa', kapampangan: 'Adua (2)', kulitan: 'a-du-wa' },
  { id: 'num_3', category: 'Numbers', english: '3. Three', tagalog: 'Tatlo', kapampangan: 'Atlu (3)', kulitan: 'a-t-lu' },
  { id: 'num_4', category: 'Numbers', english: '4. Four', tagalog: 'Apat', kapampangan: 'Apat (4)', kulitan: 'a-pa-t' },
  { id: 'num_5', category: 'Numbers', english: '5. Five', tagalog: 'Lima', kapampangan: 'Lima (5)', kulitan: 'li-ma' },
  { id: 'num_6', category: 'Numbers', english: '6. Six', tagalog: 'Anim', kapampangan: 'Anam (6)', kulitan: 'a-na-m' },
  { id: 'num_7', category: 'Numbers', english: '7. Seven', tagalog: 'Pito', kapampangan: 'Pitu (7)', kulitan: 'pi-tu' },
  { id: 'num_8', category: 'Numbers', english: '8. Eight', tagalog: 'Walo', kapampangan: 'Walu (8)', kulitan: 'wa-lu' },
  { id: 'num_9', category: 'Numbers', english: '9. Nine', tagalog: 'Siyam', kapampangan: 'Siyam (9)', kulitan: 'si-ya-m' },
  { id: 'num_10', category: 'Numbers', english: '10. Ten', tagalog: 'Sampu', kapampangan: 'Apulu (10)', kulitan: 'a-pu-lu' },
  { id: 'num_11', category: 'Numbers', english: '11. Eleven', tagalog: 'Labing-isa', kapampangan: 'Labing metung (11)', kulitan: 'la-bi-ng me-tu-ng' },
  { id: 'num_12', category: 'Numbers', english: '12. Twelve', tagalog: 'Labing-dalawa', kapampangan: 'Labing adua (12)', kulitan: 'la-bi-ng a-du-wa' },
  { id: 'num_13', category: 'Numbers', english: '13. Thirteen', tagalog: 'Labing-tatlo', kapampangan: 'Labing atlu (13)', kulitan: 'la-bi-ng a-t-lu' },
  { id: 'num_14', category: 'Numbers', english: '14. Fourteen', tagalog: 'Labing-apat', kapampangan: 'Labing apat (14)', kulitan: 'la-bi-ng a-pa-t' },
  { id: 'num_15', category: 'Numbers', english: '15. Fifteen', tagalog: 'Labing-lima', kapampangan: 'Labing lima (15)', kulitan: 'la-bi-ng li-ma' },
  { id: 'num_16', category: 'Numbers', english: '16. Sixteen', tagalog: 'Labing-anim', kapampangan: 'Labing anam (16)', kulitan: 'la-bi-ng a-na-m' },
  { id: 'num_17', category: 'Numbers', english: '17. Seventeen', tagalog: 'Labing-pito', kapampangan: 'Labing pitu (17)', kulitan: 'la-bi-ng pi-tu' },
  { id: 'num_18', category: 'Numbers', english: '18. Eighteen', tagalog: 'Labing-walo', kapampangan: 'Labing walu (18)', kulitan: 'la-bi-ng wa-lu' },
  { id: 'num_19', category: 'Numbers', english: '19. Nineteen', tagalog: 'Labing-siyam', kapampangan: 'Labing siyam (19)', kulitan: 'la-bi-ng si-ya-m' },
  { id: 'num_20', category: 'Numbers', english: '20. Twenty', tagalog: 'Dalawampu', kapampangan: 'Adwang pulu (20)', kulitan: 'a-d-wa-ng pu-lu' },
  { id: 'num_21', category: 'Numbers', english: '21. Twenty-one', tagalog: 'Dalawampu\'t isa', kapampangan: 'Adwang pulu\'t metung (21)', kulitan: 'a-d-wa-ng pu-lu-t me-tu-ng' },
  { id: 'num_22', category: 'Numbers', english: '22. Twenty-two', tagalog: 'Dalawampu\'t dalawa', kapampangan: 'Adwang pulu\'t adua (22)', kulitan: 'a-d-wa-ng pu-lu-t a-du-wa' },
  { id: 'num_23', category: 'Numbers', english: '23. Twenty-three', tagalog: 'Dalawampu\'t tatlo', kapampangan: 'Adwang pulu\'t atlu (23)', kulitan: 'a-d-wa-ng pu-lu-t a-t-lu' },
  { id: 'num_24', category: 'Numbers', english: '24. Twenty-four', tagalog: 'Dalawampu\'t apat', kapampangan: 'Adwang pulu\'t apat (24)', kulitan: 'a-d-wa-ng pu-lu-t a-pa-t' },
  { id: 'num_25', category: 'Numbers', english: '25. Twenty-five', tagalog: 'Dalawampu\'t lima', kapampangan: 'Adwang pulu\'t lima (25)', kulitan: 'a-d-wa-ng pu-lu-t li-ma' },
  { id: 'num_26', category: 'Numbers', english: '26. Twenty-six', tagalog: 'Dalawampu\'t anim', kapampangan: 'Adwang pulu\'t anam (26)', kulitan: 'a-d-wa-ng pu-lu-t a-na-m' },
  { id: 'num_27', category: 'Numbers', english: '27. Twenty-seven', tagalog: 'Dalawampu\'t pito', kapampangan: 'Adwang pulu\'t pitu (27)', kulitan: 'a-d-wa-ng pu-lu-t pi-tu' },
  { id: 'num_28', category: 'Numbers', english: '28. Twenty-eight', tagalog: 'Dalawampu\'t walo', kapampangan: 'Adwang pulu\'t walu (28)', kulitan: 'a-d-wa-ng pu-lu-t wa-lu' },
  { id: 'num_29', category: 'Numbers', english: '29. Twenty-nine', tagalog: 'Dalawampu\'t siyam', kapampangan: 'Adwang pulu\'t siyam (29)', kulitan: 'a-d-wa-ng pu-lu-t si-ya-m' },
  { id: 'num_30', category: 'Numbers', english: '30. Thirty', tagalog: 'Tatlumpu', kapampangan: 'Atlung pulu (30)', kulitan: 'a-t-lu-ng pu-lu' },
  { id: 'num_31', category: 'Numbers', english: '31. Thirty-one', tagalog: 'Tatlumpu\'t isa', kapampangan: 'Atlung pulu\'t metung (31)', kulitan: 'a-t-lu-ng pu-lu-t me-tu-ng' },
  { id: 'num_32', category: 'Numbers', english: '32. Thirty-two', tagalog: 'Tatlumpu\'t dalawa', kapampangan: 'Atlung pulu\'t adua (32)', kulitan: 'a-t-lu-ng pu-lu-t a-du-wa' },
  { id: 'num_33', category: 'Numbers', english: '33. Thirty-three', tagalog: 'Tatlumpu\'t tatlo', kapampangan: 'Atlung pulu\'t atlu (33)', kulitan: 'a-t-lu-ng pu-lu-t a-t-lu' },
  { id: 'num_34', category: 'Numbers', english: '34. Thirty-four', tagalog: 'Tatlumpu\'t apat', kapampangan: 'Atlung pulu\'t apat (34)', kulitan: 'a-t-lu-ng pu-lu-t a-pa-t' },
  { id: 'num_35', category: 'Numbers', english: '35. Thirty-five', tagalog: 'Tatlumpu\'t lima', kapampangan: 'Atlung pulu\'t lima (35)', kulitan: 'a-t-lu-ng pu-lu-t li-ma' },
  { id: 'num_36', category: 'Numbers', english: '36. Thirty-six', tagalog: 'Tatlumpu\'t anim', kapampangan: 'Atlung pulu\'t anam (36)', kulitan: 'a-t-lu-ng pu-lu-t a-na-m' },
  { id: 'num_37', category: 'Numbers', english: '37. Thirty-seven', tagalog: 'Tatlumpu\'t pito', kapampangan: 'Atlung pulu\'t pitu (37)', kulitan: 'a-t-lu-ng pu-lu-t pi-tu' },
  { id: 'num_38', category: 'Numbers', english: '38. Thirty-eight', tagalog: 'Tatlumpu\'t walo', kapampangan: 'Atlung pulu\'t walu (38)', kulitan: 'a-t-lu-ng pu-lu-t wa-lu' },
  { id: 'num_39', category: 'Numbers', english: '39. Thirty-nine', tagalog: 'Tatlumpu\'t siyam', kapampangan: 'Atlung pulu\'t siyam (39)', kulitan: 'a-t-lu-ng pu-lu-t si-ya-m' },
  { id: 'num_40', category: 'Numbers', english: '40. Forty', tagalog: 'Apatnapu', kapampangan: 'Apat a pulu (40)', kulitan: 'a-pa-t a pu-lu' },
  { id: 'num_41', category: 'Numbers', english: '41. Forty-one', tagalog: 'Apatnapu\'t isa', kapampangan: 'Apat a pulu\'t metung (41)', kulitan: 'a-pa-t a pu-lu-t me-tu-ng' },
  { id: 'num_42', category: 'Numbers', english: '42. Forty-two', tagalog: 'Apatnapu\'t dalawa', kapampangan: 'Apat a pulu\'t adua (42)', kulitan: 'a-pa-t a pu-lu-t a-du-wa' },
  { id: 'num_43', category: 'Numbers', english: '43. Forty-three', tagalog: 'Apatnapu\'t tatlo', kapampangan: 'Apat a pulu\'t atlu (43)', kulitan: 'a-pa-t a pu-lu-t a-t-lu' },
  { id: 'num_44', category: 'Numbers', english: '44. Forty-four', tagalog: 'Apatnapu\'t apat', kapampangan: 'Apat a pulu\'t apat (44)', kulitan: 'a-pa-t a pu-lu-t a-pa-t' },
  { id: 'num_45', category: 'Numbers', english: '45. Forty-five', tagalog: 'Apatnapu\'t lima', kapampangan: 'Apat a pulu\'t lima (45)', kulitan: 'a-pa-t a pu-lu-t li-ma' },
  { id: 'num_46', category: 'Numbers', english: '46. Forty-six', tagalog: 'Apatnapu\'t anim', kapampangan: 'Apat a pulu\'t anam (46)', kulitan: 'a-pa-t a pu-lu-t a-na-m' },
  { id: 'num_47', category: 'Numbers', english: '47. Forty-seven', tagalog: 'Apatnapu\'t pito', kapampangan: 'Apat a pulu\'t pitu (47)', kulitan: 'a-pa-t a pu-lu-t pi-tu' },
  { id: 'num_48', category: 'Numbers', english: '48. Forty-eight', tagalog: 'Apatnapu\'t walo', kapampangan: 'Apat a pulu\'t walu (48)', kulitan: 'a-pa-t a pu-lu-t wa-lu' },
  { id: 'num_49', category: 'Numbers', english: '49. Forty-nine', tagalog: 'Apatnapu\'t siyam', kapampangan: 'Apat a pulu\'t siyam (49)', kulitan: 'a-pa-t a pu-lu-t si-ya-m' },
  { id: 'num_50', category: 'Numbers', english: '50. Fifty', tagalog: 'Limampu', kapampangan: 'Limang pulu (50)', kulitan: 'li-ma-ng pu-lu' },
  { id: 'num_51', category: 'Numbers', english: '51. Fifty-one', tagalog: 'Limampu\'t isa', kapampangan: 'Limang pulu\'t metung (51)', kulitan: 'li-ma-ng pu-lu-t me-tu-ng' },
  { id: 'num_52', category: 'Numbers', english: '52. Fifty-two', tagalog: 'Limampu\'t dalawa', kapampangan: 'Limang pulu\'t adua (52)', kulitan: 'li-ma-ng pu-lu-t a-du-wa' },
  { id: 'num_53', category: 'Numbers', english: '53. Fifty-three', tagalog: 'Limampu\'t tatlo', kapampangan: 'Limang pulu\'t atlu (53)', kulitan: 'li-ma-ng pu-lu-t a-t-lu' },
  { id: 'num_54', category: 'Numbers', english: '54. Fifty-four', tagalog: 'Limampu\'t apat', kapampangan: 'Limang pulu\'t apat (54)', kulitan: 'li-ma-ng pu-lu-t a-pa-t' },
  { id: 'num_55', category: 'Numbers', english: '55. Fifty-five', tagalog: 'Limampu\'t lima', kapampangan: 'Limang pulu\'t lima (55)', kulitan: 'li-ma-ng pu-lu-t li-ma' },
  { id: 'num_56', category: 'Numbers', english: '56. Fifty-six', tagalog: 'Limampu\'t anim', kapampangan: 'Limang pulu\'t anam (56)', kulitan: 'li-ma-ng pu-lu-t a-na-m' },
  { id: 'num_57', category: 'Numbers', english: '57. Fifty-seven', tagalog: 'Limampu\'t pito', kapampangan: 'Limang pulu\'t pitu (57)', kulitan: 'li-ma-ng pu-lu-t pi-tu' },
  { id: 'num_58', category: 'Numbers', english: '58. Fifty-eight', tagalog: 'Limampu\'t walo', kapampangan: 'Limang pulu\'t walu (58)', kulitan: 'li-ma-ng pu-lu-t wa-lu' },
  { id: 'num_59', category: 'Numbers', english: '59. Fifty-nine', tagalog: 'Limampu\'t siyam', kapampangan: 'Limang pulu\'t siyam (59)', kulitan: 'li-ma-ng pu-lu-t si-ya-m' },
  { id: 'num_60', category: 'Numbers', english: '60. Sixty', tagalog: 'Animnapu', kapampangan: 'Anam a pulu (60)', kulitan: 'a-na-m a pu-lu' },
  { id: 'num_61', category: 'Numbers', english: '61. Sixty-one', tagalog: 'Animnapu\'t isa', kapampangan: 'Anam a pulu\'t metung (61)', kulitan: 'a-na-m a pu-lu-t me-tu-ng' },
  { id: 'num_62', category: 'Numbers', english: '62. Sixty-two', tagalog: 'Animnapu\'t dalawa', kapampangan: 'Anam a pulu\'t adua (62)', kulitan: 'a-na-m a pu-lu-t a-du-wa' },
  { id: 'num_63', category: 'Numbers', english: '63. Sixty-three', tagalog: 'Animnapu\'t tatlo', kapampangan: 'Anam a pulu\'t atlu (63)', kulitan: 'a-na-m a pu-lu-t a-t-lu' },
  { id: 'num_64', category: 'Numbers', english: '64. Sixty-four', tagalog: 'Animnapu\'t apat', kapampangan: 'Anam a pulu\'t apat (64)', kulitan: 'a-na-m a pu-lu-t a-pa-t' },
  { id: 'num_65', category: 'Numbers', english: '65. Sixty-five', tagalog: 'Animnapu\'t lima', kapampangan: 'Anam a pulu\'t lima (65)', kulitan: 'a-na-m a pu-lu-t li-ma' },
  { id: 'num_66', category: 'Numbers', english: '66. Sixty-six', tagalog: 'Animnapu\'t anim', kapampangan: 'Anam a pulu\'t anam (66)', kulitan: 'a-na-m a pu-lu-t a-na-m' },
  { id: 'num_67', category: 'Numbers', english: '67. Sixty-seven', tagalog: 'Animnapu\'t pito', kapampangan: 'Anam a pulu\'t pitu (67)', kulitan: 'a-na-m a pu-lu-t pi-tu' },
  { id: 'num_68', category: 'Numbers', english: '68. Sixty-eight', tagalog: 'Animnapu\'t walo', kapampangan: 'Anam a pulu\'t walu (68)', kulitan: 'a-na-m a pu-lu-t wa-lu' },
  { id: 'num_69', category: 'Numbers', english: '69. Sixty-nine', tagalog: 'Animnapu\'t siyam', kapampangan: 'Anam a pulu\'t siyam (69)', kulitan: 'a-na-m a pu-lu-t si-ya-m' },
  { id: 'num_70', category: 'Numbers', english: '70. Seventy', tagalog: 'Pitumpu', kapampangan: 'Pitung pulu (70)', kulitan: 'pi-tu-ng pu-lu' },
  { id: 'num_71', category: 'Numbers', english: '71. Seventy-one', tagalog: 'Pitumpu\'t isa', kapampangan: 'Pitung pulu\'t metung (71)', kulitan: 'pi-tu-ng pu-lu-t me-tu-ng' },
  { id: 'num_72', category: 'Numbers', english: '72. Seventy-two', tagalog: 'Pitumpu\'t dalawa', kapampangan: 'Pitung pulu\'t adua (72)', kulitan: 'pi-tu-ng pu-lu-t a-du-wa' },
  { id: 'num_73', category: 'Numbers', english: '73. Seventy-three', tagalog: 'Pitumpu\'t tatlo', kapampangan: 'Pitung pulu\'t atlu (73)', kulitan: 'pi-tu-ng pu-lu-t a-t-lu' },
  { id: 'num_74', category: 'Numbers', english: '74. Seventy-four', tagalog: 'Pitumpu\'t apat', kapampangan: 'Pitung pulu\'t apat (74)', kulitan: 'pi-tu-ng pu-lu-t a-pa-t' },
  { id: 'num_75', category: 'Numbers', english: '75. Seventy-five', tagalog: 'Pitumpu\'t lima', kapampangan: 'Pitung pulu\'t lima (75)', kulitan: 'pi-tu-ng pu-lu-t li-ma' },
  { id: 'num_76', category: 'Numbers', english: '76. Seventy-six', tagalog: 'Pitumpu\'t anim', kapampangan: 'Pitung pulu\'t anam (76)', kulitan: 'pi-tu-ng pu-lu-t a-na-m' },
  { id: 'num_77', category: 'Numbers', english: '77. Seventy-seven', tagalog: 'Pitumpu\'t pito', kapampangan: 'Pitung pulu\'t pitu (77)', kulitan: 'pi-tu-ng pu-lu-t pi-tu' },
  { id: 'num_78', category: 'Numbers', english: '78. Seventy-eight', tagalog: 'Pitumpu\'t walo', kapampangan: 'Pitung pulu\'t walu (78)', kulitan: 'pi-tu-ng pu-lu-t wa-lu' },
  { id: 'num_79', category: 'Numbers', english: '79. Seventy-nine', tagalog: 'Pitumpu\'t siyam', kapampangan: 'Pitung pulu\'t siyam (79)', kulitan: 'pi-tu-ng pu-lu-t si-ya-m' },
  { id: 'num_80', category: 'Numbers', english: '80. Eighty', tagalog: 'Walumpu', kapampangan: 'Walung pulu (80)', kulitan: 'wa-lu-ng pu-lu' },
  { id: 'num_81', category: 'Numbers', english: '81. Eighty-one', tagalog: 'Walumpu\'t isa', kapampangan: 'Walung pulu\'t metung (81)', kulitan: 'wa-lu-ng pu-lu-t me-tu-ng' },
  { id: 'num_82', category: 'Numbers', english: '82. Eighty-two', tagalog: 'Walumpu\'t dalawa', kapampangan: 'Walung pulu\'t adua (82)', kulitan: 'wa-lu-ng pu-lu-t a-du-wa' },
  { id: 'num_83', category: 'Numbers', english: '83. Eighty-three', tagalog: 'Walumpu\'t tatlo', kapampangan: 'Walung pulu\'t atlu (83)', kulitan: 'wa-lu-ng pu-lu-t a-t-lu' },
  { id: 'num_84', category: 'Numbers', english: '84. Eighty-four', tagalog: 'Walumpu\'t apat', kapampangan: 'Walung pulu\'t apat (84)', kulitan: 'wa-lu-ng pu-lu-t a-pa-t' },
  { id: 'num_85', category: 'Numbers', english: '85. Eighty-five', tagalog: 'Walumpu\'t lima', kapampangan: 'Walung pulu\'t lima (85)', kulitan: 'wa-lu-ng pu-lu-t li-ma' },
  { id: 'num_86', category: 'Numbers', english: '86. Eighty-six', tagalog: 'Walumpu\'t anim', kapampangan: 'Walung pulu\'t anam (86)', kulitan: 'wa-lu-ng pu-lu-t a-na-m' },
  { id: 'num_87', category: 'Numbers', english: '87. Eighty-seven', tagalog: 'Walumpu\'t pito', kapampangan: 'Walung pulu\'t pitu (87)', kulitan: 'wa-lu-ng pu-lu-t pi-tu' },
  { id: 'num_88', category: 'Numbers', english: '88. Eighty-eight', tagalog: 'Walumpu\'t walo', kapampangan: 'Walung pulu\'t walu (88)', kulitan: 'wa-lu-ng pu-lu-t wa-lu' },
  { id: 'num_89', category: 'Numbers', english: '89. Eighty-nine', tagalog: 'Walumpu\'t siyam', kapampangan: 'Walung pulu\'t siyam (89)', kulitan: 'wa-lu-ng pu-lu-t si-ya-m' },
  { id: 'num_90', category: 'Numbers', english: '90. Ninety', tagalog: 'Siyamnapu', kapampangan: 'Siyam a pulu (90)', kulitan: 'si-ya-m a pu-lu' },
  { id: 'num_91', category: 'Numbers', english: '91. Ninety-one', tagalog: 'Siyamnapu\'t isa', kapampangan: 'Siyam a pulu\'t metung (91)', kulitan: 'si-ya-m a pu-lu-t me-tu-ng' },
  { id: 'num_92', category: 'Numbers', english: '92. Ninety-two', tagalog: 'Siyamnapu\'t dalawa', kapampangan: 'Siyam a pulu\'t adua (92)', kulitan: 'si-ya-m a pu-lu-t a-du-wa' },
  { id: 'num_93', category: 'Numbers', english: '93. Ninety-three', tagalog: 'Siyamnapu\'t tatlo', kapampangan: 'Siyam a pulu\'t atlu (93)', kulitan: 'si-ya-m a pu-lu-t a-t-lu' },
  { id: 'num_94', category: 'Numbers', english: '94. Ninety-four', tagalog: 'Siyamnapu\'t apat', kapampangan: 'Siyam a pulu\'t apat (94)', kulitan: 'si-ya-m a pu-lu-t a-pa-t' },
  { id: 'num_95', category: 'Numbers', english: '95. Ninety-five', tagalog: 'Siyamnapu\'t lima', kapampangan: 'Siyam a pulu\'t lima (95)', kulitan: 'si-ya-m a pu-lu-t li-ma' },
  { id: 'num_96', category: 'Numbers', english: '96. Ninety-six', tagalog: 'Siyamnapu\'t anim', kapampangan: 'Siyam a pulu\'t anam (96)', kulitan: 'si-ya-m a pu-lu-t a-na-m' },
  { id: 'num_97', category: 'Numbers', english: '97. Ninety-seven', tagalog: 'Siyamnapu\'t pito', kapampangan: 'Siyam a pulu\'t pitu (97)', kulitan: 'si-ya-m a pu-lu-t pi-tu' },
  { id: 'num_98', category: 'Numbers', english: '98. Ninety-eight', tagalog: 'Siyamnapu\'t walo', kapampangan: 'Siyam a pulu\'t walu (98)', kulitan: 'si-ya-m a pu-lu-t wa-lu' },
  { id: 'num_99', category: 'Numbers', english: '99. Ninety-nine', tagalog: 'Siyamnapu\'t siyam', kapampangan: 'Siyam a pulu\'t siyam (99)', kulitan: 'si-ya-m a pu-lu-t si-ya-m' },
  { id: 'num_100', category: 'Numbers', english: '100. One Hundred', tagalog: 'Isang Daan', kapampangan: 'Dinalan (Metung a Dalan) (100)', kulitan: 'di-na-la-n' },

  // ==========================================
  // 8. DIRECTIONS & PLACES (15 Phrases)
  // ==========================================
  { id: 'dp1', category: 'Directions', english: 'Where is the restroom?', tagalog: 'Nasaan ang banyo / palikuran?', kapampangan: 'Nukarin ya ing banyu?', kulitan: 'nu-ka-ri-n ya i-ng ba-nyu' },
  { id: 'dp2', category: 'Directions', english: 'Turn right', tagalog: 'Kumanan ka', kapampangan: 'Kumana / Munta king wanan', kulitan: 'mu-n-ta ki-ng wa-na-n' },
  { id: 'dp3', category: 'Directions', english: 'Turn left', tagalog: 'Kumaliwa ka', kapampangan: 'Kumayli / Munta king kayli', kulitan: 'mu-n-ta ki-ng ka-y-li' },
  { id: 'dp4', category: 'Directions', english: 'Go straight', tagalog: 'Diretso lang', kapampangan: 'Tuntun diretso', kulitan: 'tu-n-tu-n di-re-t-so' },
  { id: 'dp5', category: 'Directions', english: 'Near', tagalog: 'Malapit', kapampangan: 'Malapit', kulitan: 'ma-la-pi-t' },
  { id: 'dp6', category: 'Directions', english: 'Far', tagalog: 'Malayo', kapampangan: 'Marayu', kulitan: 'ma-ra-yu' },
  { id: 'dp7', category: 'Directions', english: 'Here', tagalog: 'Dito', kapampangan: 'Keni', kulitan: 'ke-ni' },
  { id: 'dp8', category: 'Directions', english: 'There', tagalog: 'Doon', kapampangan: 'Keta', kulitan: 'ke-ta' },
  { id: 'dp9', category: 'Directions', english: 'Inside', tagalog: 'Sa loob', kapampangan: 'King kilub', kulitan: 'ki-ng ki-lu-b' },
  { id: 'dp10', category: 'Directions', english: 'Outside', tagalog: 'Sa labas', kapampangan: 'King lwal', kulitan: 'ki-ng l-wa-l' },
  { id: 'dp11', category: 'Directions', english: 'House / Home', tagalog: 'Bahay', kapampangan: 'Bale', kulitan: 'ba-le' },
  { id: 'dp12', category: 'Directions', english: 'Town / City', tagalog: 'Bayan / Lungsod', kapampangan: 'Balen / Syudad', kulitan: 'ba-le-n' },
  { id: 'dp13', category: 'Directions', english: 'Church', tagalog: 'Simbahan', kapampangan: 'Pisamban', kulitan: 'pi-sa-m-ba-n' },
  { id: 'dp14', category: 'Directions', english: 'Market', tagalog: 'Pamilihan / Palengke', kapampangan: 'Palengki / Tindahan', kulitan: 'pa-le-ng-ki' },
  { id: 'dp15', category: 'Directions', english: 'Mountain (Mount Arayat)', tagalog: 'Bundok (Bundok Arayat)', kapampangan: 'Bunduk (Bunduk Alaya / Arayat)', kulitan: 'bu-n-du-k a-la-ya' },

  // ==========================================
  // 9. CULTURE & PROVERBS (10 Phrases)
  // ==========================================
  { id: 'cp1', category: 'Culture & Proverbs', english: 'Long live the Kapampangan culture!', tagalog: 'Mabuhay ang kulturang Kapampangan!', kapampangan: 'Luid ya ing kulturang Kapampangan!', kulitan: 'lu-i-d ya i-ng ku-l-tu-ra-ng ka-pa-m-pa-nga-n' },
  { id: 'cp2', category: 'Culture & Proverbs', english: 'He who does not look back at where he came from will not reach his destination.', tagalog: 'Ang hindi lumingon sa pinanggalingan ay hindi makararating sa paroroonan.', kapampangan: 'Ing e biasang linikid king penibatan, e ya miras king pupuntalan.', kulitan: 'i-ng e bya-sa-ng li-ni-ki-d ki-ng pe-ni-ba-ta-n e ya mi-ra-s ki-ng pu-pu-n-ta-la-n' },
  { id: 'cp3', category: 'Culture & Proverbs', english: 'Ancient Kapampangan Script', tagalog: 'Sinaunang Sulat Kapampangan', kapampangan: 'Matwang Sulat Kulitan', kulitan: 'ma-t-wa-ng su-la-t ku-li-ta-n' },
  { id: 'cp4', category: 'Culture & Proverbs', english: 'A united family lives in peace.', tagalog: 'Ang nagkakaisang pamilya ay namumuhay nang mapayapa.', kapampangan: 'Ing pamilian mikakayabe, payapa yang mabibie.', kulitan: 'i-ng pa-mi-l-ya-n mi-ka-ka-ya-be pa-ya-pa ya-ng ma-bi-b-ye' },
  { id: 'cp5', category: 'Culture & Proverbs', english: 'No hardship that cannot be overcome by perseverance.', tagalog: 'Walang pagsubok na hindi malalampasan sa sipag at tiyaga.', kapampangan: 'Alang kasakitan a e malalampasan king kapagalan ampon kapagmasusian.', kulitan: 'a-la-ng ka-sa-ki-ta-n a e ma-la-la-m-pa-sa-n' },
  { id: 'cp6', category: 'Culture & Proverbs', english: 'Pampanga: Culinary Capital', tagalog: 'Pampanga: Kabisera ng Pagluluto', kapampangan: 'Pampanga: Balen ning Pamaglutu', kulitan: 'pa-m-pa-nga ba-le-n ni-ng pa-ma-g-lu-tu' },
  { id: 'cp7', category: 'Culture & Proverbs', english: 'Honesty is the root of honor.', tagalog: 'Ang katapatan ang ugat ng dangal.', kapampangan: 'Ing katapatan ya ing yamut ning dangalan.', kulitan: 'i-ng ka-ta-pa-ta-n ya i-ng ya-mu-t ni-ng da-nga-la-n' },
  { id: 'cp8', category: 'Culture & Proverbs', english: 'Light in the darkness', tagalog: 'Tanglaw sa gitna ng dilim', kapampangan: 'Sulu king kalibudtaran ning dalumdum', kulitan: 'su-lu ki-ng ka-li-bu-d-ta-ra-n ni-ng da-lu-m-du-m' },
  { id: 'cp9', category: 'Culture & Proverbs', english: 'Speak our native tongue with pride.', tagalog: 'Ipagmalaki ang ating sariling wika.', kapampangan: 'Pagmaragul me ing amanu tamung Kapampangan.', kulitan: 'pa-g-ma-ra-gu-l me i-ng a-ma-nu ta-mu-ng ka-pa-m-pa-nga-n' },
  { id: 'cp10', category: 'Culture & Proverbs', english: 'Stand tall like Mount Arayat.', tagalog: 'Tumindig nang matatag tulad ng Bundok Arayat.', kapampangan: 'Tinalakad kang matatag kalupa ning Bunduk Alaya.', kulitan: 'ti-na-la-ka-d ka-ng ma-ta-ta-g ka-lu-pa ni-ng bu-n-du-k a-la-ya' },
];
