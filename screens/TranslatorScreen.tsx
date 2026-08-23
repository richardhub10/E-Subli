import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView, Platform, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { GoogleGenAI } from '@google/genai';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useProfile } from '../context/ProfileContext';
import { useLanguage } from '../context/LanguageContext';

type TranslatorScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

type LangType = 'Tagalog' | 'English' | 'Kapampangan';

const SAMPLE_PHRASES = [
  'Magandang araw sa inyong lahat',
  'Mahal na mahal kita',
  'Maraming salamat sa tulong',
  'Saan po ang papuntang Pampanga?',
];

export default function TranslatorScreen({ navigation }: TranslatorScreenProps) {
  const [sourceLanguage, setSourceLanguage] = useState<LangType>('Tagalog');
  const [targetLanguage, setTargetLanguage] = useState<LangType>('Kapampangan');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showKulitan, setShowKulitan] = useState(true);
  const [orientation, setOrientation] = useState<'Horizontal' | 'Vertical'>('Horizontal');
  const [isCopied, setIsCopied] = useState(false);

  const { addXP } = useProfile();
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
    if (!apiKey) {
      Alert.alert(
        "API Key Missing",
        "Add EXPO_PUBLIC_GEMINI_API_KEY to your environment variables to enable the AI translator.",
        [{ text: "OK" }]
      );
      return;
    }

    setIsTranslating(true);
    setTranslatedText('');

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          `You are an expert linguist specializing in authentic Kapampangan (Amanung Sisuan), Tagalog, and English. Translate the following text from ${sourceLanguage} to natural, fluent ${targetLanguage}. Output ONLY the translated ${targetLanguage} text with no commentary, no markdown, and no quotes. Text to translate: "${sourceText.trim()}"`
        ],
      });
      
      const text = response.text?.trim() || '';
      setTranslatedText(text);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addXP(5);
    } catch (err) {
      console.error("Gemini API Error:", err);
      Alert.alert("Translation Failed", "Could not translate the text. Please check your internet connection and try again.");
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
    const words = text.toLowerCase().split(/\s+/);
    return words.map(word => {
      const parts = word.match(/(?:ng|[bcdfghjklmnpqrstvwxyz])?[aeiou]|(?:ng|[bcdfghjklmnpqrstvwxyz])/gi);
      if (!parts) return [word];
      
      return parts.map(p => {
        if (/[aeiou]$/.test(p)) {
          return p;
        } else {
          return p + 'u';
        }
      });
    });
  };

  return (
    <LinearGradient colors={['#FFFBF6', '#F8EFE4', '#EFE0CE', '#E8D5BF']} style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.75}>
          <Ionicons name="arrow-back" size={20} color="#1E1B18" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerSubtitle}>
            {language === 'EN' ? 'AI SCRIPT INSCRIBER' : 'TAGAPAGSALIN NG TITIK'}
          </Text>
          <Text style={styles.headerTitle}>{t('translator')}</Text>
        </View>

        <View style={styles.geminiBadgePill}>
          <Ionicons name="sparkles" size={11} color="#D97706" />
          <Text style={styles.geminiBadgeText}>AI</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollArea} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* TRANSLATOR WORKSPACE CARD */}
        <View style={styles.workspaceCard}>
          
          {/* LANGUAGE SELECTOR BENTO */}
          <View style={styles.langSelectorContainer}>
            
            {/* FROM COLUMN */}
            <View style={styles.langColumn}>
              <Text style={styles.langColLabel}>{language === 'EN' ? 'FROM' : 'MULA'}</Text>
              <View style={styles.langPillRow}>
                {(['Tagalog', 'English', 'Kapampangan'] as LangType[]).map((lang) => {
                  const isActive = sourceLanguage === lang;
                  return (
                    <TouchableOpacity
                      key={lang}
                      style={[styles.langPillBtn, isActive && styles.langPillBtnActive]}
                      onPress={() => {
                        if (Platform.OS !== 'web') Haptics.selectionAsync();
                        setSourceLanguage(lang);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.langPillText, isActive && styles.langPillTextActive]}>
                        {lang.slice(0, 3).toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* SWAP ICON BUTTON */}
            <TouchableOpacity 
              style={styles.swapBtn} 
              onPress={handleSwapLanguages}
              activeOpacity={0.75}
            >
              <Ionicons name="swap-horizontal" size={18} color="#D1582D" />
            </TouchableOpacity>

            {/* TO COLUMN */}
            <View style={styles.langColumn}>
              <Text style={styles.langColLabel}>{language === 'EN' ? 'TO' : 'PATUNGO'}</Text>
              <View style={styles.langPillRow}>
                {(['Tagalog', 'English', 'Kapampangan'] as LangType[]).map((lang) => {
                  const isActive = targetLanguage === lang;
                  return (
                    <TouchableOpacity
                      key={lang}
                      style={[styles.langPillBtn, isActive && styles.langPillBtnActive]}
                      onPress={() => {
                        if (Platform.OS !== 'web') Haptics.selectionAsync();
                        setTargetLanguage(lang);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.langPillText, isActive && styles.langPillTextActive]}>
                        {lang.slice(0, 3).toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

          </View>

          {/* TEXT INPUT AREA */}
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              multiline
              placeholder={language === 'EN' ? `Enter ${sourceLanguage} phrase here...` : `I-type ang pariralang ${sourceLanguage}...`}
              placeholderTextColor="#94A3B8"
              value={sourceText}
              onChangeText={setSourceText}
              maxLength={300}
            />

            <View style={styles.inputBottomBar}>
              <Text style={styles.charCountText}>{sourceText.length} / 300</Text>
              {sourceText.length > 0 && (
                <TouchableOpacity 
                  onPress={() => setSourceText('')}
                  style={styles.clearTextBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={16} color="#94A3B8" />
                  <Text style={styles.clearTextLabel}>{language === 'EN' ? 'Clear' : 'Burahin'}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* QUICK PROMPT CHIPS */}
          {!sourceText && (
            <View style={styles.sampleChipsRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {SAMPLE_PHRASES.map((phrase, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.sampleChip}
                    onPress={() => {
                      if (Platform.OS !== 'web') Haptics.selectionAsync();
                      setSourceText(phrase);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.sampleChipText}>"{phrase}"</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* SCRIPT RENDERING PREFERENCES */}
          <View style={styles.preferencesBox}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextGroup}>
                <Ionicons name="sparkles" size={14} color="#D1582D" />
                <Text style={styles.toggleTitle}>
                  {language === 'EN' ? 'Render in Kulitan Script' : 'Ipakita sa Sulat Kulitan'}
                </Text>
              </View>
              <Switch
                value={showKulitan}
                onValueChange={setShowKulitan}
                trackColor={{ false: '#CBD5E1', true: '#FED7AA' }}
                thumbColor={showKulitan ? '#D1582D' : '#F1F5F9'}
              />
            </View>

            {showKulitan && (
              <View style={styles.orientationTabsRow}>
                <TouchableOpacity 
                  style={[styles.orientationTab, orientation === 'Horizontal' && styles.orientationTabActive]}
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.selectionAsync();
                    setOrientation('Horizontal');
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name="reorder-two-outline" 
                    size={14} 
                    color={orientation === 'Horizontal' ? '#FFFFFF' : '#64748B'} 
                  />
                  <Text style={[styles.orientationTabText, orientation === 'Horizontal' && styles.orientationTabTextActive]}>
                    {language === 'EN' ? 'Horizontal Flow' : 'Pahalang (Padron)'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.orientationTab, orientation === 'Vertical' && styles.orientationTabActive]}
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.selectionAsync();
                    setOrientation('Vertical');
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name="git-commit-outline" 
                    size={14} 
                    color={orientation === 'Vertical' ? '#FFFFFF' : '#64748B'} 
                  />
                  <Text style={[styles.orientationTabText, orientation === 'Vertical' && styles.orientationTabTextActive]}>
                    {language === 'EN' ? 'Vertical Column' : 'Pababa (Tinduk)'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* PRIMARY ACTION BUTTON */}
          <TouchableOpacity 
            style={[styles.translateButtonWrap, (!sourceText.trim() || isTranslating) && styles.translateButtonDisabled]}
            onPress={handleTranslate}
            disabled={!sourceText.trim() || isTranslating}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={(!sourceText.trim() || isTranslating) ? ['#CBD5E1', '#94A3B8'] : ['#E05326', '#D1582D', '#B83814']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.translateGradient}
            >
              {isTranslating ? (
                <View style={styles.translatingContent}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.translateButtonText}>
                    {language === 'EN' ? 'Inscribing...' : 'Isinasalin...'}
                  </Text>
                </View>
              ) : (
                <View style={styles.translatingContent}>
                  <Ionicons name="sparkles" size={17} color="#FFFFFF" />
                  <Text style={styles.translateButtonText}>
                    {language === 'EN' ? 'Translate & Inscribe' : 'Isalin at Isulat'}
                  </Text>
                  <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

        </View>

        {/* TRANSLATION RESULT CARD */}
        {translatedText ? (
          <View style={styles.resultCard}>
            
            {/* Result Header */}
            <View style={styles.resultHeader}>
              <View style={styles.resultBadgePill}>
                <Text style={styles.resultBadgeText}>{targetLanguage.toUpperCase()}</Text>
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

            {/* Kulitan Manuscript Script Section */}
            {showKulitan && (
              <View style={styles.kulitanManuscriptBox}>
                <View style={styles.manuscriptHeaderRow}>
                  <Text style={styles.manuscriptLabel}>
                    {orientation === 'Vertical' ? 'TRADITIONAL VERTICAL (TINDUK)' : 'HORIZONTAL (PADRON)'}
                  </Text>
                  <Ionicons name="brush" size={13} color="#D1582D" />
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
              <MaterialCommunityIcons name="draw-pen" size={18} color="#D1582D" />
              <Text style={styles.traceActionText}>
                {language === 'EN' ? 'Practice writing these glyphs in Studio →' : 'Sanayin ang pagsulat sa Studio →'}
              </Text>
            </TouchableOpacity>

          </View>
        ) : null}

      </ScrollView>
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
    paddingTop: Platform.OS === 'ios' ? 56 : Platform.OS === 'android' ? 44 : 26,
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
    borderWidth: 1,
    borderColor: '#EDE3D8',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerSubtitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9.5,
    color: '#D1582D',
    letterSpacing: 1,
  },
  headerTitle: {
    color: '#1E1B18',
    fontSize: 19,
    fontFamily: 'Poppins_700Bold',
  },
  geminiBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 3,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  geminiBadgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    color: '#B45309',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
    paddingTop: 4,
  },
  workspaceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#EDE3D8',
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  langSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF9F4',
    padding: 10,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: '#FED7AA',
    marginBottom: 12,
  },
  langColumn: {
    flex: 1,
  },
  langColLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 8.5,
    color: '#B45309',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  langPillRow: {
    flexDirection: 'row',
    gap: 4,
  },
  langPillBtn: {
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  langPillBtnActive: {
    backgroundColor: '#D1582D',
    borderColor: '#B83814',
  },
  langPillText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 9.5,
    color: '#64748B',
  },
  langPillTextActive: {
    color: '#FFFFFF',
  },
  swapBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#FED7AA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  inputWrapper: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 10,
  },
  textInput: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14.5,
    color: '#1E1B18',
    minHeight: 80,
    textAlignVertical: 'top',
    lineHeight: 20,
  },
  inputBottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    marginTop: 4,
  },
  charCountText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    color: '#94A3B8',
  },
  clearTextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  clearTextLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10.5,
    color: '#94A3B8',
  },
  sampleChipsRow: {
    marginBottom: 12,
  },
  sampleChip: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  sampleChipText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10.5,
    color: '#C2410C',
  },
  preferencesBox: {
    backgroundColor: '#FFF9F4',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#EDE3D8',
    marginBottom: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleTextGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toggleTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#1E1B18',
  },
  orientationTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 3,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  orientationTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 9,
    gap: 5,
  },
  orientationTabActive: {
    backgroundColor: '#D1582D',
  },
  orientationTabText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#64748B',
  },
  orientationTabTextActive: {
    color: '#FFFFFF',
  },
  translateButtonWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  translateButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  translateGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  translatingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  translateButtonText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14.5,
    color: '#FFFFFF',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultBadgePill: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  resultBadgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9.5,
    color: '#D1582D',
    letterSpacing: 0.8,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1EE',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
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
    fontSize: 17,
    color: '#1E1B18',
    lineHeight: 24,
    marginBottom: 14,
  },
  kulitanManuscriptBox: {
    backgroundColor: '#FFF9F4',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.2,
    borderColor: '#EDE3D8',
    marginBottom: 12,
  },
  manuscriptHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EBE1',
    paddingBottom: 6,
  },
  manuscriptLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 8.5,
    color: '#B45309',
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
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#EDE3D8',
  },
  traceActionText: {
    flex: 1,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11.5,
    color: '#D1582D',
  },
});
