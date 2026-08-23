import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, Platform, TextInput } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useLanguage } from '../context/LanguageContext';
import { phrasebookData, PhraseCategory, Phrase } from '../data/phrasebookData';

type PhrasebookScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

const CATEGORIES: { id: PhraseCategory; en: string; ph: string; kpm: string; icon: any }[] = [
  { id: 'Greetings', en: 'Greetings', ph: 'Pagbati', kpm: 'Pamamuklat', icon: 'hand-left-outline' },
  { id: 'Basics', en: 'Basics', ph: 'Pang-araw-araw', kpm: 'Pang-alben', icon: 'sparkles-outline' },
  { id: 'Conversations', en: 'Conversations', ph: 'Pakikipag-usap', kpm: 'Pamiyabe', icon: 'chatbubbles-outline' },
  { id: 'Food & Dining', en: 'Food & Dining', ph: 'Pagkain', kpm: 'Pamangan', icon: 'restaurant-outline' },
  { id: 'Family', en: 'Family', ph: 'Pamilya', kpm: 'Pamilia', icon: 'people-outline' },
  { id: 'Love & Emotions', en: 'Love & Emotions', ph: 'Pag-ibig & Damdamin', kpm: 'Lugud & Panamdaman', icon: 'heart-outline' },
  { id: 'Numbers', en: 'Numbers', ph: 'Mga Bilang', kpm: 'Pamamilang', icon: 'calculator-outline' },
  { id: 'Directions', en: 'Directions & Places', ph: 'Direksyon & Lugar', kpm: 'Lugal & Dalan', icon: 'compass-outline' },
  { id: 'Culture & Proverbs', en: 'Culture & Proverbs', ph: 'Kultura & Kasabihan', kpm: 'Kultura & Kasabian', icon: 'book-outline' },
];

export default function PhrasebookScreen({ navigation }: PhrasebookScreenProps) {
  const [activeCategory, setActiveCategory] = useState<PhraseCategory>('Greetings');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { t, language } = useLanguage();

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
        {/* Top Header Row: Kapampangan Title & Copy Button */}
        <View style={styles.cardTopRow}>
          <View style={styles.kapampanganTitleWrap}>
            <Text style={styles.kapampanganText}>{item.kapampangan}</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.iconButton, isCopied && styles.iconButtonCopied]} 
            onPress={() => handleCopy(item)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={isCopied ? "checkmark" : "copy-outline"} 
              size={16} 
              color={isCopied ? "#FFF" : "#D1582D"} 
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

        {/* Bottom: Translations */}
        <View style={styles.translationsContainer}>
          <View style={styles.translationRow}>
            <View style={styles.langFlagPill}>
              <Text style={styles.langFlagText}>{language === 'PH' ? 'TAG' : 'ENG'}</Text>
            </View>
            <Text style={styles.primaryTranslation}>
              {language === 'PH' ? item.tagalog : item.english}
            </Text>
          </View>

          <View style={[styles.translationRow, { marginTop: 4 }]}>
            <View style={[styles.langFlagPill, { backgroundColor: '#F1F5F9' }]}>
              <Text style={[styles.langFlagText, { color: '#64748B' }]}>{language === 'PH' ? 'ENG' : 'TAG'}</Text>
            </View>
            <Text style={styles.secondaryTranslation}>
              {language === 'PH' ? item.english : item.tagalog}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#FAF5EE', '#E8DAC9']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerSubtitle}>
            {phrasebookData.length} {language === 'EN' ? 'PHRASES & IDIOMS' : 'MGA PARIRALA AT KASABIHAN'}
          </Text>
          <Text style={styles.headerTitle}>
            {language === 'EN' ? 'Phrasebook' : language === 'PH' ? 'Talasalitaan' : 'Talasalitan'}
          </Text>
        </View>

        <View style={styles.phraseCountBadge}>
          <Ionicons name="library" size={14} color="#D1582D" />
          <Text style={styles.phraseCountText}>{filteredData.length}</Text>
        </View>
      </View>

      {/* Live Search Input Bar */}
      <View style={styles.searchBarContainer}>
        <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder={
            language === 'EN' 
              ? "Search Kapampangan, Tagalog, English..." 
              : "Maghanap sa Kapampangan, Tagalog, Ingles..."
          }
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close-circle" size={18} color="#CBD5E1" />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories Horizontal Scroll */}
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
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={cat.icon} 
                    size={14} 
                    color={isActive ? "#FFF" : "#64748B"} 
                    style={{ marginRight: 5 }} 
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerSubtitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: '#D1582D',
    letterSpacing: 1,
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
  },
  phraseCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  phraseCountText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#0F172A',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
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
    color: '#0F172A',
  },
  categoryContainer: {
    marginBottom: 8,
  },
  categoryScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryButtonActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryText: {
    color: '#64748B',
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
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#EDE3D8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  kapampanganTitleWrap: {
    flex: 1,
    paddingRight: 10,
  },
  kapampanganText: {
    color: '#1E1B18',
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    lineHeight: 22,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF1EE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  iconButtonCopied: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  kulitanBox: {
    backgroundColor: '#FFF9F4',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.2,
    borderColor: '#EDE3D8',
    marginBottom: 10,
  },
  kulitanScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    gap: 4,
  },
  translationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  langFlagPill: {
    backgroundColor: '#FFEFE6',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginTop: 1,
  },
  langFlagText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 8.5,
    color: '#D1582D',
  },
  primaryTranslation: {
    flex: 1,
    color: '#0F172A',
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    lineHeight: 18,
  },
  secondaryTranslation: {
    flex: 1,
    color: '#64748B',
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
