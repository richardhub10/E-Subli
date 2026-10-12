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
import HeritageCornerOrnament from '../components/HeritageCornerOrnament';
import HeritageDividerOrnament from '../components/HeritageDividerOrnament';

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
        <HeritageCornerOrnament position="topRight" />
        
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
              color={isCopied ? "#FFFFFF" : "#D1582D"} 
            />
          </TouchableOpacity>
        </View>

        {/* Middle: Dedicated Kulitan Script Manuscript Box */}
        <View style={styles.kulitanBox}>
          <HeritageCornerOrnament position="bottomRight" color="#E8C3B0" size={18} />
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
      {/* AUTHENTIC UNIFIED HERITAGE BACKGROUND */}
      <Image 
        source={BackgroundImages.heritageUnified} 
        style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} 
        resizeMode="cover" 
      />

      {/* TOP ORNAMENTAL ACCENT LINE MATCHING MOCKUP */}
      <HeritageDividerOrnament style={{ marginTop: Platform.OS === 'ios' ? 44 : 28, marginBottom: 4 }} />

      {/* MODERN E-SUBLI UNIFIED HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton} 
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <View style={styles.headerPillTag}>
            <Ionicons name="sparkles" size={11} color="#D1582D" style={{ marginRight: 6 }} />
            <Text style={styles.headerSubtitle}>
              {language === 'EN' ? 'KAPAMPANGAN PHRASEBOOK' : 'TALASALITAANG KAPAMPANGAN'}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => navigation.navigate('KulitanGuide')} 
          style={styles.guideBadgeIcon} 
          activeOpacity={0.75}
        >
          <Ionicons name="school" size={20} color="#D1582D" />
        </TouchableOpacity>
      </View>

      {/* Live Search Input Bar matching Proposed Mockup */}
      <View style={styles.searchBarContainer}>
        <Ionicons name="search" size={18} color="#8C7A6B" style={{ marginRight: 10 }} />
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

      {/* Category Filter Chips matching Proposed Mockup (Liquid Capsule Tabs) */}
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
                    size={15} 
                    color={isActive ? "#FFFFFF" : "#8C7A6B"} 
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

      {/* Phrases List with ample bottom padding for persistent bottom bar */}
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
    backgroundColor: '#EEDEC8',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 4 : 2,
    paddingHorizontal: 20,
    paddingBottom: 10,
    zIndex: 10,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: '#EDE3D8',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerPillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1EE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  headerSubtitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    color: '#D1582D',
    letterSpacing: 1.1,
  },
  guideBadgeIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFF1EE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 22,
    height: 46,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#EDE3D8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins_500Medium',
    fontSize: 12.5,
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
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1.5,
    borderColor: '#EDE3D8',
  },
  categoryButtonActive: {
    backgroundColor: '#D1582D',
    borderColor: '#D1582D',
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryText: {
    color: '#64748B',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 120, // Ample room above persistent floating bottom bar!
    paddingTop: 4,
    gap: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#EDE3D8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardBadge: {
    backgroundColor: '#FFF1EE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  cardBadgeText: {
    color: '#D1582D',
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
  },
  circleActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF1EE',
    borderWidth: 1,
    borderColor: '#FED7AA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleActionBtnCopied: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  kulitanBox: {
    backgroundColor: '#FFFDFB',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#EDE3D8',
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
    backgroundColor: '#D1582D',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    width: 44,
    alignItems: 'center',
  },
  flagTextTerracotta: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
  },
  flagPillSage: {
    backgroundColor: '#4B5E40',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    width: 44,
    alignItems: 'center',
  },
  flagTextSage: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
  },
  translationTextBubble: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EDE3D8',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
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

