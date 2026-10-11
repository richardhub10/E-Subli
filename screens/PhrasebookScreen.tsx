import React, { useState, useMemo, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ScrollView, 
  Platform, 
  TextInput, 
  Image 
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useLanguage } from '../context/LanguageContext';
import { useQuest } from '../context/QuestContext';
import { phrasebookData, PhraseCategory, Phrase } from '../data/phrasebookData';
import { BackgroundImages } from '../constants/backgrounds';

type PhrasebookScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

const CATEGORIES: { id: PhraseCategory; en: string; ph: string; kpm: string; icon: any }[] = [
  { id: 'Greetings', en: 'Greetings', ph: 'Pagbati', kpm: 'Pamamuklat', icon: 'hand-left-outline' },
  { id: 'Basics', en: 'Basics', ph: 'Pang-araw-araw', kpm: 'Pang-alben', icon: 'sparkles-outline' },
  { id: 'Conversations', en: 'Conversations', ph: 'Pakikipag-usap', kpm: 'Pamiyabe', icon: 'chatbubbles-outline' },
  { id: 'Culture & Proverbs', en: 'Culture & Proverbs', ph: 'Kultura & Kasabihan', kpm: 'Kultura & Kasabian', icon: 'book-outline' },
  { id: 'Food & Dining', en: 'Food & Dining', ph: 'Pagkain', kpm: 'Pamangan', icon: 'restaurant-outline' },
  { id: 'Family', en: 'Family', ph: 'Pamilya', kpm: 'Pamilia', icon: 'people-outline' },
  { id: 'Love & Emotions', en: 'Love & Emotions', ph: 'Pag-ibig & Damdamin', kpm: 'Lugud & Panamdaman', icon: 'heart-outline' },
  { id: 'Numbers', en: 'Numbers', ph: 'Mga Bilang', kpm: 'Pamamilang', icon: 'calculator-outline' },
  { id: 'Directions', en: 'Directions & Places', ph: 'Direksyon & Lugar', kpm: 'Lugal & Dalan', icon: 'compass-outline' },
];

export default function PhrasebookScreen({ navigation }: PhrasebookScreenProps) {
  const [activeCategory, setActiveCategory] = useState<PhraseCategory>('Greetings');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { language } = useLanguage();
  const { recordQuestAction } = useQuest();

  useEffect(() => {
    recordQuestAction('phrasebook');
  }, [activeCategory]);

  const filteredData = useMemo(() => {
    return phrasebookData.filter(item => {
      const matchesCategory = item.category === activeCategory;
      if (!searchQuery.trim()) return matchesCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        item.kapampangan.toLowerCase().includes(q) ||
        item.english.toLowerCase().includes(q) ||
        (item.tagalog && item.tagalog.toLowerCase().includes(q));

      return matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleCopy = async (item: Phrase) => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Clipboard.setStringAsync(`${item.kapampangan} — ${item.english} (${item.tagalog})`);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderItem = ({ item }: { item: Phrase }) => {
    const isCopied = copiedId === item.id;

    return (
      <View style={styles.card}>
        {/* Top Header Row: Peach badge & Peach circular copy button */}
        <View style={styles.cardTopRow}>
          <View style={styles.cardBadge}>
            <Text style={styles.cardBadgeText}>{item.kapampangan}</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.circleActionBtn, isCopied && styles.circleActionBtnCopied]} 
            onPress={() => handleCopy(item)}
            activeOpacity={0.75}
          >
            <Ionicons 
              name={isCopied ? "checkmark" : "copy-outline"} 
              size={15} 
              color={isCopied ? "#FFFFFF" : "#B97047"} 
            />
          </TouchableOpacity>
        </View>

        {/* Middle: Dedicated Kulitan Script Manuscript Box */}
        <View style={styles.kulitanBox}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.kulitanScrollContent}
          >
            {item.kulitan.split(' ').map((word, wordIdx) => (
              <View key={wordIdx} style={styles.verticalWordColumn}>
                {word.split('-').map((char, charIdx) => (
                  <Text key={charIdx} style={styles.kulitanText}>{char}</Text>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Bottom: Stacked Outlined Translation Rows */}
        <View style={styles.translationsContainer}>
          {/* Primary Translation */}
          <View style={styles.translationRow}>
            <View style={styles.flagPillTerracotta}>
              <Text style={styles.flagTextTerracotta}>
                {language === 'PH' ? 'TAG' : 'ENG'}
              </Text>
            </View>
            <View style={styles.translationTextBubble}>
              <Text style={styles.primaryTranslation}>
                {language === 'PH' ? item.tagalog : item.english}
              </Text>
            </View>
          </View>

          {/* Secondary Translation */}
          <View style={styles.translationRow}>
            <View style={styles.flagPillSage}>
              <Text style={styles.flagTextSage}>
                {language === 'PH' ? 'ENG' : 'TAG'}
              </Text>
            </View>
            <View style={styles.translationTextBubble}>
              <Text style={styles.secondaryTranslation}>
                {language === 'PH' ? item.english : item.tagalog}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Authentic Phrasebook Organic Wave Background */}
      <Image 
        source={BackgroundImages.phrasebook} 
        style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} 
        resizeMode="cover" 
      />

      {/* Top Header Bar matching Proposed Design */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton} 
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#1E1B18" />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('KulitanGuide')} 
          style={styles.guideButton} 
          activeOpacity={0.7}
        >
          <Ionicons name="book" size={20} color="#B97047" />
        </TouchableOpacity>
      </View>

      {/* Live Search Input Bar matching Proposed Mockup */}
      <View style={styles.searchBarContainer}>
        <Ionicons name="search" size={19} color="#78716C" style={{ marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder={
            language === 'EN' 
              ? "Search Kapampangan, Tagalog, English..." 
              : "Maghanap sa Kapampangan, Tagalog, Ingles..."
          }
          placeholderTextColor="#A8A29E"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close-circle" size={18} color="#A8A29E" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter Chips matching Proposed Mockup */}
      {!searchQuery && (
        <View style={styles.categoryContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              const label = language === 'EN' ? cat.en : language === 'PH' ? cat.ph : cat.kpm;
              
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryButton, isActive && styles.categoryButtonActive]}
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.selectionAsync();
                    setActiveCategory(cat.id);
                  }}
                  activeOpacity={0.75}
                >
                  <Ionicons 
                    name={cat.icon} 
                    size={16} 
                    color={isActive ? "#FFFFFF" : "#44403C"} 
                    style={{ marginRight: 6 }} 
                  />
                  <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Phrases List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={40} color="#CBD5E1" />
            <Text style={styles.emptyText}>
              {language === 'EN' ? 'No matching phrases found.' : 'Walang nahanap na parirala.'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F4EE',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 56 : 38,
    paddingHorizontal: 20,
    paddingBottom: 10,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  guideButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 25,
    height: 50,
    paddingHorizontal: 16,
    borderWidth: 1.2,
    borderColor: '#ECE1D2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: '#1C1917',
  },
  categoryContainer: {
    marginBottom: 10,
  },
  categoryScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#ECE1D2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryButtonActive: {
    backgroundColor: '#414836',
    borderColor: '#414836',
    shadowColor: '#414836',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryText: {
    color: '#44403C',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 4,
    gap: 14,
  },
  card: {
    backgroundColor: '#FAF5EE',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.2,
    borderColor: '#ECE1D2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardBadge: {
    backgroundColor: '#F2D7C4',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  cardBadgeText: {
    color: '#7C2D12',
    fontFamily: 'Poppins_700Bold',
    fontSize: 13.5,
  },
  circleActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F7DDCB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleActionBtnCopied: {
    backgroundColor: '#10B981',
  },
  kulitanBox: {
    backgroundColor: '#F4ECE1',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E8DCCB',
    marginBottom: 12,
  },
  kulitanScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  verticalWordColumn: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  kulitanText: {
    fontFamily: 'Kulitan',
    fontSize: 24,
    color: '#D1582D',
    lineHeight: 24,
  },
  translationsContainer: {
    gap: 7,
  },
  translationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flagPillTerracotta: {
    backgroundColor: '#B97047',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    width: 42,
    alignItems: 'center',
  },
  flagTextTerracotta: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 9.5,
  },
  flagPillSage: {
    backgroundColor: '#AFABA0',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    width: 42,
    alignItems: 'center',
  },
  flagTextSage: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 9.5,
  },
  translationTextBubble: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DC',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  primaryTranslation: {
    color: '#1C1917',
    fontSize: 12.5,
    fontFamily: 'Poppins_600SemiBold',
    lineHeight: 18,
  },
  secondaryTranslation: {
    color: '#57534E',
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    lineHeight: 17,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 8,
  },
  emptyText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: '#94A3B8',
  },
});

