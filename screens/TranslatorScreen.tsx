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
import HeritageCornerOrnament from '../components/HeritageCornerOrnament';
import HeritageDividerOrnament from '../components/HeritageDividerOrnament';

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
  const [translatedText, setTranslatedText] = useState('');
  const [translationSource, setTranslationSource] = useState<'gemini' | 'online' | 'local'>('local');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showKulitan, setShowKulitan] = useState(true);
  const [orientation, setOrientation] = useState<'Horizontal' | 'Vertical'>('Horizontal');
  const [isCopied, setIsCopied] = useState(false);
  const [phrasePageIndex, setPhrasePageIndex] = useState(0);
  const [copiedPromptIdx, setCopiedPromptIdx] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<'auto' | 'compact' | 'regular' | 'large'>('auto');

  const { addXP } = useProfile();
  const { recordQuestAction } = useQuest();
  const { t, language } = useLanguage();

  // Compute syllables and word breakdown
  const words = useMemo(() => getKulitanSyllables(translatedText), [translatedText]);
  const rawWordList = useMemo(() => {
    if (!translatedText) return [];
    return translatedText.replace(/[^a-zA-Z\s]/g, ' ').trim().split(/\s+/).filter(Boolean);
  }, [translatedText]);

  // Responsive dynamic glyph size
  const activeFontSize = useMemo(() => {
    if (zoomLevel === 'compact') return 24;
    if (zoomLevel === 'regular') return 34;
    if (zoomLevel === 'large') return 46;

    // 'auto' adaptive sizing based on text length
    if (words.length >= 10 || translatedText.length > 80) return 26;
    if (words.length >= 5 || translatedText.length > 35) return 34;
    return 46;
  }, [zoomLevel, words.length, translatedText.length]);

  const activeLineHeight = Math.round(activeFontSize * 1.14);
  const columnGap = Math.max(12, Math.min(22, Math.round(activeFontSize * 0.4)));

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

  // Paginate sample phrases for the 2x2 Bento grid
  const currentPhrases = useMemo(() => {
    const startIndex = (phrasePageIndex * 4) % ALL_SAMPLE_PHRASES.length;
    return ALL_SAMPLE_PHRASES.slice(startIndex, startIndex + 4);
  }, [phrasePageIndex]);

  const handleNextPhrases = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setPhrasePageIndex(prev => (prev + 1) % Math.ceil(ALL_SAMPLE_PHRASES.length / 4));
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
              {language === 'EN' ? 'AI KULITAN TRANSLATOR' : 'AI TAGASALIN NG KULITAN'}
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

      <ScrollView 
        style={styles.scrollArea} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* SEGMENTED HORIZONTAL LANGUAGE BAR */}
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
          <HeritageCornerOrnament position="topRight" />
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
              maxLength={500}
            />

            <View style={styles.inputFooterRow}>
              <Text style={styles.charCounterText}>{sourceText.length} / 500</Text>
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
          <HeritageCornerOrnament position="topRight" />
          <View style={styles.bentoHeaderRow}>
            <Ionicons name="sparkles" size={18} color="#D1582D" />
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
          <HeritageCornerOrnament position="topRight" />
          <View style={styles.bentoHeaderRow}>
            <View style={styles.preferenceLabelRow}>
              <Ionicons name="sparkles" size={18} color="#D1582D" />
              <Text style={styles.preferenceTitleText}>
                {language === 'EN' ? 'Render in Kulitan Script' : 'Ipakita sa Sulat Kulitan'}
              </Text>
            </View>

            <Switch
              value={showKulitan}
              onValueChange={setShowKulitan}
              trackColor={{ false: '#D6C8B8', true: '#4B5E40' }}
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
            <HeritageCornerOrnament position="topRight" />
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
                  color={isCopied ? "#FFFFFF" : "#D1582D"} 
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
                <HeritageCornerOrnament position="bottomRight" color="#E8C3B0" size={18} />
                
                {/* Header with Title, Word count & Zoom Controls */}
                <View style={styles.manuscriptHeaderRow}>
                  <View style={styles.manuscriptHeaderLeft}>
                    <Ionicons name="brush" size={13} color="#D1582D" style={{ marginRight: 5 }} />
                    <Text style={styles.manuscriptLabel}>
                      {orientation === 'Vertical' ? 'TRADITIONAL VERTICAL (TINDUK)' : 'HORIZONTAL (PADRON)'}
                    </Text>
                    {words.length > 0 && (
                      <View style={styles.wordCountBadge}>
                        <Text style={styles.wordCountText}>
                          {words.length} {language === 'EN' ? (words.length === 1 ? 'col' : 'cols') : 'kolum'}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Dynamic Zoom Size Buttons */}
                  <View style={styles.zoomControlRow}>
                    <TouchableOpacity 
                      style={[styles.zoomBtn, zoomLevel === 'compact' && styles.zoomBtnActive]} 
                      onPress={() => {
                        if (Platform.OS !== 'web') Haptics.selectionAsync();
                        setZoomLevel(prev => prev === 'compact' ? 'auto' : 'compact');
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.zoomBtnText, zoomLevel === 'compact' && styles.zoomBtnTextActive]}>A-</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.zoomBtn, zoomLevel === 'regular' && styles.zoomBtnActive]} 
                      onPress={() => {
                        if (Platform.OS !== 'web') Haptics.selectionAsync();
                        setZoomLevel(prev => prev === 'regular' ? 'auto' : 'regular');
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.zoomBtnText, zoomLevel === 'regular' && styles.zoomBtnTextActive]}>A</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.zoomBtn, zoomLevel === 'large' && styles.zoomBtnActive]} 
                      onPress={() => {
                        if (Platform.OS !== 'web') Haptics.selectionAsync();
                        setZoomLevel(prev => prev === 'large' ? 'auto' : 'large');
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.zoomBtnText, zoomLevel === 'large' && styles.zoomBtnTextActive]}>A+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Reading Direction Banner for Vertical Tinduk */}
                {orientation === 'Vertical' && words.length > 1 && (
                  <View style={styles.readingDirectionBar}>
                    <Ionicons name="arrow-back" size={12} color="#92400E" />
                    <Text style={styles.readingDirectionText}>
                      {language === 'EN' 
                        ? 'Read right-to-left (columns), top-to-bottom (syllables)' 
                        : 'Basa: kanan-pakaliwa (kolum), itaas-pababa (pantig)'}
                    </Text>
                    <Ionicons name="arrow-down" size={12} color="#92400E" />
                  </View>
                )}

                {orientation === 'Horizontal' ? (
                  <View style={styles.kulitanHorizontalWrap}>
                    <Text 
                      style={[
                        styles.kulitanResultText,
                        { 
                          fontSize: activeFontSize, 
                          lineHeight: Math.round(activeFontSize * 1.2),
                          textAlign: 'center' 
                        }
                      ]}
                    >
                      {words.map(word => word.join('')).join(' ')}
                    </Text>
                  </View>
                ) : (
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={true} 
                    contentContainerStyle={[
                      styles.verticalScrollContent,
                      words.length <= 3 && { justifyContent: 'center' }
                    ]}
                  >
                    <View style={[
                      styles.verticalKulitanContainer,
                      { gap: columnGap },
                      words.length > 3 ? { justifyContent: 'flex-start' } : { justifyContent: 'center' }
                    ]}>
                      {words.map((syllables, index) => {
                        const originalWord = rawWordList[index] || '';
                        return (
                          <View key={index} style={[styles.verticalWordColumn, { minWidth: activeFontSize + 8 }]}>
                            <Text 
                              style={[
                                styles.kulitanResultText,
                                {
                                  fontSize: activeFontSize,
                                  lineHeight: activeLineHeight,
                                }
                              ]}
                            >
                              {syllables.join('\n')}
                            </Text>

                            {/* Subscript Latin Word Label */}
                            {originalWord ? (
                              <View style={styles.wordSubscriptPill}>
                                <Text style={styles.wordSubscriptText} numberOfLines={1}>
                                  {originalWord}
                                </Text>
                              </View>
                            ) : null}
                          </View>
                        );
                      })}
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
              <MaterialCommunityIcons name="draw-pen" size={18} color="#D1582D" />
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
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120, // Ample room above persistent floating bottom bar!
    paddingTop: 4,
  },
  /* Segmented Horizontal Language Bar */
  langSelectorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#EDE3D8',
    paddingHorizontal: 8,
    paddingVertical: 7,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
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
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EDE3D8',
  },
  langChipSourceActive: {
    backgroundColor: '#4B5E40', // Deep olive green matching mockup
    borderColor: '#4B5E40',
  },
  langChipTargetActive: {
    backgroundColor: '#D1582D', // Terracotta matching mockup
    borderColor: '#D1582D',
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
    backgroundColor: '#FFF1EE',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#EDE3D8',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  bentoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  /* Text Input Bento Area */
  textInputBox: {
    backgroundColor: '#FAF7F2',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#EDE3D8',
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
    borderTopColor: '#EDE3D8',
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
    backgroundColor: '#FAF7F2',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#EDE3D8',
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
    backgroundColor: '#FAF7F2',
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: '#EDE3D8',
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
    backgroundColor: '#D1582D', // Terracotta matching mockup
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
    backgroundColor: '#D1582D',
    borderRadius: 26,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 16,
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
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
    backgroundColor: '#D1582D',
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
    backgroundColor: '#FFF1EE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  copyBtnSuccess: {
    backgroundColor: '#059669',
    borderColor: '#047857',
  },
  copyBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#D1582D',
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
    backgroundColor: '#FFFDFB',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#EDE3D8',
    marginBottom: 12,
  },
  manuscriptHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE3D8',
    paddingBottom: 6,
  },
  manuscriptHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  wordCountBadge: {
    backgroundColor: '#FFF1EE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  wordCountText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 8.5,
    color: '#D1582D',
  },
  zoomControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF7F2',
    padding: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EDE3D8',
  },
  zoomBtn: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  zoomBtnActive: {
    backgroundColor: '#D1582D',
  },
  zoomBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9.5,
    color: '#78716C',
  },
  zoomBtnTextActive: {
    color: '#FFFFFF',
  },
  readingDirectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  readingDirectionText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 9,
    color: '#92400E',
    letterSpacing: 0.3,
  },
  manuscriptLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 8.5,
    color: '#D1582D',
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
    color: '#D1582D',
    textAlign: 'center',
    lineHeight: 52,
  },
  verticalScrollContent: {
    flexGrow: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
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
  wordSubscriptPill: {
    marginTop: 6,
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EDE3D8',
    maxWidth: 70,
  },
  wordSubscriptText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 9,
    color: '#78716C',
    textAlign: 'center',
  },
  traceActionTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1EE',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  traceActionText: {
    flex: 1,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11.5,
    color: '#D1582D',
  },
});

