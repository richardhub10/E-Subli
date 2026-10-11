import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  Alert, 
  ScrollView, 
  Platform, 
  Switch,
  Image 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { translateText, TranslationResult } from '../services/geminiService';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useProfile } from '../context/ProfileContext';
import { useLanguage } from '../context/LanguageContext';
import { useQuest } from '../context/QuestContext';
import { BackgroundImages } from '../constants/backgrounds';

type TranslatorScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

type LangType = 'Tagalog' | 'English' | 'Kapampangan';

const ALL_SAMPLE_PHRASES = [
  'Magandang araw sa inyong lahat',
  'Mahal na mahal kita',
  'Maraming salamat sa tulong',
  'Saan po ang papuntang Pampanga?',
  'Mayap a abak kekayo ngan',
  'Kaluguran daka',
  'Dakal a salamat',
  'Nukarin ya ing dalan papuntang Angeles?'
];

export default function TranslatorScreen({ navigation }: TranslatorScreenProps) {
  const [sourceLanguage, setSourceLanguage] = useState<LangType>('Tagalog');
  const [targetLanguage, setTargetLanguage] = useState<LangType>('Kapampangan');
  const [sourceText, setSourceText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [translationSource, setTranslationSource] = useState<'gemini' | 'online' | 'local'>('local');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showKulitan, setShowKulitan] = useState(true);
  const [orientation, setOrientation] = useState<'Horizontal' | 'Vertical'>('Horizontal');
  const [isCopied, setIsCopied] = useState(false);
  const [phrasePageIndex, setPhrasePageIndex] = useState(0);
  const [copiedPromptIdx, setCopiedPromptIdx] = useState<number | null>(null);

  const { addXP } = useProfile();
  const { recordQuestAction } = useQuest();
  const { t, language } = useLanguage();

  const handleSwapLanguages = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const prevSource = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(prevSource);
    if (translatedText) {
      setSourceText(translatedText);
      setTranslatedText('');
    }
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    setIsTranslating(true);
    setTranslatedText('');

    try {
      const res = await translateText(sourceText, sourceLanguage, targetLanguage, apiKey);
      if (res && res.text) {
        setTranslatedText(res.text);
        setTranslationSource(res.source);
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        addXP(5);
        recordQuestAction('translator');
      } else {
        Alert.alert("Translation Notice", "Could not complete translation. Please check your network connection.");
      }
    } catch (err) {
      console.error("Translation Error:", err);
      Alert.alert("Translation Notice", "Could not complete translation. Please check your network connection.");
    } finally {
      setIsTranslating(false);
    }
  };

  const copyToClipboard = async () => {
    if (translatedText) {
      await Clipboard.setStringAsync(translatedText);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const getKulitanSyllables = (text: string): string[][] => {
    if (!text) return [];
    // Clean punctuation
    const clean = text.replace(/[^a-zA-Z\s]/g, ' ').trim();
    const words = clean.split(/\s+/).filter(Boolean);

    return words.map(word => {
      // Map 'ng' to uppercase 'N' for Bay_K_Pamagkulit font which maps 'N' to Nga
      const formattedWord = word.replace(/ng/gi, 'N');
      const parts = formattedWord.match(/(?:[bcdfghjklmnpqrstvwxyzN])?[aeiou]+|(?:[bcdfghjklmnpqrstvwxyzN])+/gi);
      return parts && parts.length > 0 ? parts : [formattedWord];
    });
  };

  // Filter or paginate phrases for the 2x2 Bento grid
  const currentPhrases = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const filtered = ALL_SAMPLE_PHRASES.filter(p => p.toLowerCase().includes(q));
      return filtered.slice(0, 4);
    }
    const startIndex = (phrasePageIndex * 4) % ALL_SAMPLE_PHRASES.length;
    return ALL_SAMPLE_PHRASES.slice(startIndex, startIndex + 4);
  }, [searchQuery, phrasePageIndex]);

  const handleNextPhrases = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setPhrasePageIndex(prev => (prev + 1) % Math.ceil(ALL_SAMPLE_PHRASES.length / 4));
  };

  return (
    <View style={styles.container}>
      {/* Authentic Parchment Organic Wave Background */}
      <Image 
        source={BackgroundImages.phrasebook} 
        style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} 
        resizeMode="cover" 
      />

      {/* TOP HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton} 
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={20} color="#1E1B18" />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('KulitanGuide')} 
          style={styles.guidePillBtn} 
          activeOpacity={0.75}
        >
          <Ionicons name="book-outline" size={15} color="#B97047" />
          <Text style={styles.guidePillText}>
            {language === 'EN' ? 'Guide' : 'Gabay'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollArea} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* ROW 1: SEARCH / LOOKUP CAPSULE BAR */}
        <View style={styles.searchBarContainer}>
          <Ionicons name="search" size={18} color="#78716C" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={
              language === 'EN' 
                ? "Search or enter phrase to inscribe..." 
                : "Maghanap o mag-type ng parirala..."
            }
            placeholderTextColor="#A8A29E"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (text.trim() && !sourceText) {
                setSourceText(text);
              }
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')} 
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={18} color="#A8A29E" />
            </TouchableOpacity>
          )}
        </View>

        {/* ROW 2: SEGMENTED HORIZONTAL LANGUAGE BAR */}
        <View style={styles.langSelectorBar}>
          {/* Source Language Chips (Olive when active) */}
          <View style={styles.langPillsGroup}>
            {(['Tagalog', 'English', 'Kapampangan'] as LangType[]).map((lang) => {
              const isActive = sourceLanguage === lang;
              return (
                <TouchableOpacity
                  key={`src-${lang}`}
                  style={[styles.langChip, isActive && styles.langChipSourceActive]}
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.selectionAsync();
                    setSourceLanguage(lang);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.langChipText, isActive && styles.langChipTextActive]}>
                    {lang.slice(0, 3).toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Central Circular Swap Button with Terracotta Arrows */}
          <TouchableOpacity 
            style={styles.swapCircleBtn} 
            onPress={handleSwapLanguages}
            activeOpacity={0.75}
          >
            <Ionicons name="swap-horizontal" size={18} color="#B97047" />
          </TouchableOpacity>

          {/* Target Language Chips (Terracotta when active) */}
          <View style={styles.langPillsGroup}>
            {(['Tagalog', 'English', 'Kapampangan'] as LangType[]).map((lang) => {
              const isActive = targetLanguage === lang;
              return (
                <TouchableOpacity
                  key={`tgt-${lang}`}
                  style={[styles.langChip, isActive && styles.langChipTargetActive]}
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.selectionAsync();
                    setTargetLanguage(lang);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.langChipText, isActive && styles.langChipTextActive]}>
                    {lang.slice(0, 3).toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ROW 3: MAIN TEXT INPUT BENTO CARD (WITH SPEECH BUBBLE) */}
        <View style={styles.bentoCard}>
          <View style={styles.bentoHeaderRow}>
            <Ionicons name="chatbubble-outline" size={20} color="#78716C" />
          </View>

          <View style={styles.textInputBox}>
            <TextInput
              style={styles.mainTextInput}
              multiline
              placeholder={
                language === 'EN' 
                  ? `Enter ${sourceLanguage} message or phrase to translate...` 
                  : `I-type ang pariralang ${sourceLanguage}...`
              }
              placeholderTextColor="#A8A29E"
              value={sourceText}
              onChangeText={setSourceText}
              maxLength={300}
            />

            <View style={styles.inputFooterRow}>
              <Text style={styles.charCounterText}>{sourceText.length} / 300</Text>
              {sourceText.length > 0 ? (
                <TouchableOpacity 
                  onPress={() => setSourceText('')}
                  style={styles.clearBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={15} color="#94A3B8" />
                  <Text style={styles.clearBtnText}>
                    {language === 'EN' ? 'Clear' : 'Burahin'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Ionicons name="pencil-outline" size={14} color="#A8A29E" />
              )}
            </View>
          </View>
        </View>

        {/* ROW 4: SUGGESTED PHRASES BENTO CARD (2x2 GRID WITH SPARKLE & COPY ICONS) */}
        <View style={styles.bentoCard}>
          <View style={styles.bentoHeaderRow}>
            <Ionicons name="sparkles" size={18} color="#B97047" />
            <TouchableOpacity onPress={handleNextPhrases} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="chevron-forward" size={18} color="#A8A29E" />
            </TouchableOpacity>
          </View>

          <View style={styles.promptsGrid}>
            {currentPhrases.map((phrase, idx) => {
              const isCopiedPrompt = copiedPromptIdx === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  style={styles.promptPill}
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.selectionAsync();
                    setSourceText(phrase);
                  }}
                  activeOpacity={0.72}
                >
                  <Text style={styles.promptPillText} numberOfLines={1}>
                    {phrase}
                  </Text>
                  <TouchableOpacity
                    onPress={async () => {
                      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      await Clipboard.setStringAsync(phrase);
                      setCopiedPromptIdx(idx);
                      setTimeout(() => setCopiedPromptIdx(null), 1500);
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons 
                      name={isCopiedPrompt ? "checkmark" : "copy-outline"} 
                      size={14} 
                      color={isCopiedPrompt ? "#059669" : "#8C827A"} 
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ROW 5: SCRIPT RENDERING PREFERENCES BENTO CARD */}
        <View style={styles.bentoCard}>
          <View style={styles.bentoHeaderRow}>
            <View style={styles.preferenceLabelRow}>
              <Ionicons name="sparkles" size={18} color="#B97047" />
              <Text style={styles.preferenceTitleText}>
                {language === 'EN' ? 'Render in Kulitan Script' : 'Ipakita sa Sulat Kulitan'}
              </Text>
            </View>

            <Switch
              value={showKulitan}
              onValueChange={setShowKulitan}
              trackColor={{ false: '#D6C8B8', true: '#454E3C' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {showKulitan && (
            <View style={styles.segmentedSlider}>
              <TouchableOpacity
                style={[styles.segmentHalf, orientation === 'Horizontal' && styles.segmentHalfActive]}
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.selectionAsync();
                  setOrientation('Horizontal');
                }}
                activeOpacity={0.75}
              >
                <Ionicons 
                  name="reorder-two-outline" 
                  size={14} 
                  color={orientation === 'Horizontal' ? '#FFFFFF' : '#6E665D'} 
                />
                <Text style={[styles.segmentHalfText, orientation === 'Horizontal' && styles.segmentHalfTextActive]}>
                  {language === 'EN' ? 'Horizontal (Padron)' : 'Pahalang (Padron)'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.segmentHalf, orientation === 'Vertical' && styles.segmentHalfActive]}
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.selectionAsync();
                  setOrientation('Vertical');
                }}
                activeOpacity={0.75}
              >
                <Ionicons 
                  name="git-commit-outline" 
                  size={14} 
                  color={orientation === 'Vertical' ? '#FFFFFF' : '#6E665D'} 
                />
                <Text style={[styles.segmentHalfText, orientation === 'Vertical' && styles.segmentHalfTextActive]}>
                  {language === 'EN' ? 'Vertical (Tinduk)' : 'Pababa (Tinduk)'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ROW 6: SOLID TERRACOTTA PILL ACTION BUTTON */}
        <TouchableOpacity 
          style={[styles.primaryActionBtn, (!sourceText.trim() || isTranslating) && styles.primaryActionBtnDisabled]}
          onPress={handleTranslate}
          disabled={!sourceText.trim() || isTranslating}
          activeOpacity={0.88}
        >
          {isTranslating ? (
            <View style={styles.btnContentRow}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.primaryActionBtnText}>
                {language === 'EN' ? 'Inscribing...' : 'Isinasalin...'}
              </Text>
            </View>
          ) : (
            <View style={styles.btnContentRow}>
              <Ionicons name="sparkles" size={17} color="#FFFFFF" />
              <Text style={styles.primaryActionBtnText}>
                {language === 'EN' ? 'Translate & Inscribe' : 'Isalin at Isulat'}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* ROW 7: TRANSLATION RESULT CARD */}
        {translatedText ? (
          <View style={styles.resultBentoCard}>
            {/* Result Header */}
            <View style={styles.resultHeader}>
              <View style={styles.resultBadgeRow}>
                <View style={styles.resultBadgePill}>
                  <Text style={styles.resultBadgeText}>{targetLanguage.toUpperCase()}</Text>
                </View>

                <View style={styles.sourceBadgePill}>
                  <Ionicons 
                    name={translationSource === 'local' ? 'book-outline' : 'sparkles'} 
                    size={11} 
                    color={translationSource === 'local' ? '#92400E' : '#B45309'} 
                  />
                  <Text style={styles.sourceBadgeText}>
                    {translatedText.trim().toLowerCase() === sourceText.trim().toLowerCase()
                      ? (language === 'EN' ? 'OFFLINE DICT' : 'TALASALITAAN')
                      : translationSource === 'gemini' 
                        ? 'GEMINI AI' 
                        : translationSource === 'online' 
                          ? 'NEURAL AI' 
                          : 'AUTHENTIC KPM'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.copyBtn, isCopied && styles.copyBtnSuccess]} 
                onPress={copyToClipboard}
                activeOpacity={0.75}
              >
                <Ionicons 
                  name={isCopied ? "checkmark" : "copy-outline"} 
                  size={15} 
                  color={isCopied ? "#FFFFFF" : "#B97047"} 
                />
                <Text style={[styles.copyBtnText, isCopied && styles.copyBtnTextSuccess]}>
                  {isCopied ? (language === 'EN' ? 'Copied!' : 'Kopyado!') : (language === 'EN' ? 'Copy' : 'Kopyahin')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Romanized Latin Text */}
            <Text style={styles.latinResultText}>{translatedText}</Text>

            {/* Kulitan Manuscript Script Box */}
            {showKulitan && (
              <View style={styles.kulitanManuscriptBox}>
                <View style={styles.manuscriptHeaderRow}>
                  <Text style={styles.manuscriptLabel}>
                    {orientation === 'Vertical' ? 'TRADITIONAL VERTICAL (TINDUK)' : 'HORIZONTAL (PADRON)'}
                  </Text>
                  <Ionicons name="brush" size={13} color="#B97047" />
                </View>

                {orientation === 'Horizontal' ? (
                  <View style={styles.kulitanHorizontalWrap}>
                    <Text style={styles.kulitanResultText}>
                      {getKulitanSyllables(translatedText).map(word => word.join('')).join(' ')}
                    </Text>
                  </View>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.verticalScrollContent}>
                    <View style={styles.verticalKulitanContainer}>
                      {getKulitanSyllables(translatedText).map((syllables, index) => (
                        <View key={index} style={styles.verticalWordColumn}>
                          <Text style={styles.kulitanResultText}>{syllables.join('\n')}</Text>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                )}
              </View>
            )}

            {/* Direct Link to Write & Trace Studio */}
            <TouchableOpacity 
              style={styles.traceActionTile}
              onPress={() => navigation.navigate('WriteTrace')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="draw-pen" size={18} color="#B97047" />
              <Text style={styles.traceActionText}>
                {language === 'EN' ? 'Practice writing these glyphs in Studio →' : 'Sanayin ang pagsulat sa Studio →'}
              </Text>
            </TouchableOpacity>

          </View>
        ) : null}

      </ScrollView>
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
    paddingTop: Platform.OS === 'ios' ? 56 : Platform.OS === 'android' ? 44 : 26,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: '#ECE1D2',
  },
  guidePillBtn: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 19,
    backgroundColor: '#FAF5EE',
    borderWidth: 1.5,
    borderColor: '#ECE1D2',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  guidePillText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#B97047',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
    paddingTop: 4,
  },
  /* Search / Quick Lookup Capsule */
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderRadius: 25,
    height: 48,
    paddingHorizontal: 16,
    borderWidth: 1.2,
    borderColor: '#ECE1D2',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#1E1B18',
  },
  /* Segmented Horizontal Language Bar */
  langSelectorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF5EE',
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: '#ECE1D2',
    paddingHorizontal: 8,
    paddingVertical: 7,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  langPillsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  langChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: '#F3ECE2',
  },
  langChipSourceActive: {
    backgroundColor: '#454E3C', // Deep olive green matching mockup
  },
  langChipTargetActive: {
    backgroundColor: '#B97047', // Terracotta matching mockup
  },
  langChipText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10.5,
    color: '#6E665D',
  },
  langChipTextActive: {
    color: '#FFFFFF',
  },
  swapCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#ECE1D2',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  /* Common Bento Card Style */
  bentoCard: {
    backgroundColor: '#FAF5EE',
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: '#ECE1D2',
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  bentoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  /* Text Input Bento Area */
  textInputBox: {
    backgroundColor: '#F3ECE2',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7DDD0',
    padding: 12,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  mainTextInput: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#1E1B18',
    minHeight: 70,
    textAlignVertical: 'top',
    lineHeight: 20,
  },
  inputFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EBE2D5',
  },
  charCounterText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    color: '#8C827A',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  clearBtnText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10.5,
    color: '#8C827A',
  },
  /* Suggested Prompts 2x2 Grid */
  promptsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  promptPill: {
    width: '48.5%',
    backgroundColor: '#F3ECE2',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E7DDD0',
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promptPillText: {
    flex: 1,
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: '#57534E',
    marginRight: 6,
  },
  /* Preferences Card */
  preferenceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  preferenceTitleText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12.5,
    color: '#292524',
  },
  segmentedSlider: {
    flexDirection: 'row',
    backgroundColor: '#F3ECE2',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E7DDD0',
    padding: 3,
    marginTop: 4,
  },
  segmentHalf: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 15,
    gap: 6,
  },
  segmentHalfActive: {
    backgroundColor: '#B97047', // Terracotta matching mockup
  },
  segmentHalfText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#6E665D',
  },
  segmentHalfTextActive: {
    color: '#FFFFFF',
  },
  /* Primary Action Terracotta Button */
  primaryActionBtn: {
    backgroundColor: '#B97047',
    borderRadius: 26,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 16,
    shadowColor: '#B97047',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryActionBtnDisabled: {
    backgroundColor: '#D6C8B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryActionBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14.5,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  /* Result Card */
  resultBentoCard: {
    backgroundColor: '#FAF5EE',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#ECE1D2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resultBadgePill: {
    backgroundColor: '#B97047',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  resultBadgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9.5,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  sourceBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 3,
  },
  sourceBadgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    color: '#B45309',
    letterSpacing: 0.5,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#ECE1D2',
  },
  copyBtnSuccess: {
    backgroundColor: '#059669',
    borderColor: '#047857',
  },
  copyBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#B97047',
  },
  copyBtnTextSuccess: {
    color: '#FFFFFF',
  },
  latinResultText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#1E1B18',
    lineHeight: 23,
    marginBottom: 12,
  },
  kulitanManuscriptBox: {
    backgroundColor: '#F3ECE2',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E7DDD0',
    marginBottom: 12,
  },
  manuscriptHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E6DCCF',
    paddingBottom: 6,
  },
  manuscriptLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 8.5,
    color: '#B97047',
    letterSpacing: 0.8,
  },
  kulitanHorizontalWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  kulitanResultText: {
    fontFamily: 'Kulitan',
    fontSize: 48,
    color: '#B97047',
    textAlign: 'center',
    lineHeight: 52,
  },
  verticalScrollContent: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  verticalKulitanContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 20,
    minWidth: '100%',
  },
  verticalWordColumn: {
    alignItems: 'center',
  },
  traceActionTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3ECE2',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E7DDD0',
  },
  traceActionText: {
    flex: 1,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11.5,
    color: '#B97047',
  },
});
