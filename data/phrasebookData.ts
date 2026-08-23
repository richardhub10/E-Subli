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
  // 7. NUMBERS & COUNTING (15 Phrases)
  // ==========================================
  { id: 'n1', category: 'Numbers', english: 'One', tagalog: 'Isa', kapampangan: 'Metung / Isa', kulitan: 'me-tu-ng' },
  { id: 'n2', category: 'Numbers', english: 'Two', tagalog: 'Dalawa', kapampangan: 'Adua', kulitan: 'a-du-wa' },
  { id: 'n3', category: 'Numbers', english: 'Three', tagalog: 'Tatlo', kapampangan: 'Atlu', kulitan: 'a-t-lu' },
  { id: 'n4', category: 'Numbers', english: 'Four', tagalog: 'Apat', kapampangan: 'Apat', kulitan: 'a-pa-t' },
  { id: 'n5', category: 'Numbers', english: 'Five', tagalog: 'Lima', kapampangan: 'Lima', kulitan: 'li-ma' },
  { id: 'n6', category: 'Numbers', english: 'Six', tagalog: 'Anim', kapampangan: 'Anam', kulitan: 'a-na-m' },
  { id: 'n7', category: 'Numbers', english: 'Seven', tagalog: 'Pito', kapampangan: 'Pitu', kulitan: 'pi-tu' },
  { id: 'n8', category: 'Numbers', english: 'Eight', tagalog: 'Walo', kapampangan: 'Walu', kulitan: 'wa-lu' },
  { id: 'n9', category: 'Numbers', english: 'Nine', tagalog: 'Siyam', kapampangan: 'Siyam', kulitan: 'si-ya-m' },
  { id: 'n10', category: 'Numbers', english: 'Ten', tagalog: 'Sampu', kapampangan: 'Apulu', kulitan: 'a-pu-lu' },
  { id: 'n11', category: 'Numbers', english: 'Twenty', tagalog: 'Dalawampu', kapampangan: 'Adwang pulu', kulitan: 'a-d-wa-ng pu-lu' },
  { id: 'n12', category: 'Numbers', english: 'Fifty', tagalog: 'Limampung', kapampangan: 'Limang pulu', kulitan: 'li-ma-ng pu-lu' },
  { id: 'n13', category: 'Numbers', english: 'One Hundred', tagalog: 'Isang daan', kapampangan: 'Dinalan', kulitan: 'di-na-la-n' },
  { id: 'n14', category: 'Numbers', english: 'One Thousand', tagalog: 'Isang libo', kapampangan: 'Libu', kulitan: 'li-bu' },
  { id: 'n15', category: 'Numbers', english: 'First / Top', tagalog: 'Una', kapampangan: 'Mumuna', kulitan: 'mu-mu-na' },

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
