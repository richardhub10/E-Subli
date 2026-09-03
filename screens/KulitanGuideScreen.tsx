import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Dimensions } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { kulitanSyllables } from '../data/kulitanData';
import { useLanguage } from '../context/LanguageContext';
import { useQuest } from '../context/QuestContext';
import KulitanGlyph from '../components/KulitanGlyph';

const { width } = Dimensions.get('window');

type KulitanGuideScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

type TabType = 'rules' | 'sandbox' | 'history' | 'syllabary';
type GridFilterType = 'all' | 'roots' | 'vowel_i' | 'vowel_u' | 'coda';

export default function KulitanGuideScreen({ navigation }: KulitanGuideScreenProps) {
  const [activeTab, setActiveTab] = useState<TabType>('rules');
  const [sandboxRoot, setSandboxRoot] = useState('ka');
  const [sandboxVowel, setSandboxVowel] = useState<'a' | 'i' | 'u'>('a');
  const [gridFilter, setGridFilter] = useState<GridFilterType>('all');

  const { language } = useLanguage();
  const quest = useQuest();

  useEffect(() => {
    try {
      quest?.recordQuestAction?.('guide');
    } catch (e) {
      // Safe guard for guest users
    }
  }, []);

  const getFilteredSyllables = () => {
    switch (gridFilter) {
      case 'roots':
        return kulitanSyllables.filter(s => 
          s.latin === 'a' || s.latin === 'i' || s.latin === 'u' || 
          (s.latin.length === 2 && s.latin.endsWith('a')) || 
          s.latin === 'nga'
        );
      case 'vowel_i':
        return kulitanSyllables.filter(s => s.latin.endsWith('i') && s.latin !== 'i');
      case 'vowel_u':
        return kulitanSyllables.filter(s => s.latin.endsWith('u') && s.latin !== 'u');
      case 'coda':
        return kulitanSyllables.filter(s => s.latin.endsWith('ang'));
      default:
        return kulitanSyllables;
    }
  };

  const displayedSyllables = getFilteredSyllables();

  const getModifiedSyllable = () => {
    if (sandboxRoot === 'a') return sandboxVowel === 'i' ? 'i' : sandboxVowel === 'u' ? 'u' : 'a';
    const rootChar = sandboxRoot.replace(/[aiu]/g, '');
    return `${rootChar}${sandboxVowel}`;
  };

  const currentModified = getModifiedSyllable();

  return (
    <LinearGradient colors={['#FAF5EE', '#F3E9DD', '#EDE2D3']} style={styles.container}>
      
      {/* BACKGROUND WATERMARK GLYPHS */}
      <View style={styles.watermarkContainer} pointerEvents="none">
        <Text style={[styles.watermarkGlyph, { top: 70, left: -15, transform: [{ rotate: '-10deg' }] }]}>ka</Text>
        <Text style={[styles.watermarkGlyph, { top: 260, right: -25, transform: [{ rotate: '12deg' }] }]}>ga</Text>
        <Text style={[styles.watermarkGlyph, { top: 540, left: -20, transform: [{ rotate: '-8deg' }] }]}>ta</Text>
      </View>

      {/* MODERN E-SUBLI HEADER */}
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
            <Ionicons name="sparkles" size={10} color="#D1582D" />
            <Text style={styles.headerSubtitle}>
              {language === 'EN' ? 'HERITAGE IN SCRIPT' : 'SINAUNANG PAMAMARAAN'}
            </Text>
          </View>
          <Text style={styles.headerTitle}>
            {language === 'EN' ? 'Kulitan Guide & History' : 'Gabay sa Kulitan'}
          </Text>
        </View>

        <View style={styles.guideBadgeIcon}>
          <Ionicons name="school" size={18} color="#D1582D" />
        </View>
      </View>

      {/* LIQUID FROSTED TAB SELECTOR */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {[
            { id: 'rules', labelEn: 'Writing Rules', labelPh: 'Mga Panuntunan', icon: 'book-outline' },
            { id: 'sandbox', labelEn: 'Garlit Sandbox', labelPh: 'Garlit Simulator', icon: 'sparkles' },
            { id: 'history', labelEn: 'History & Roots', labelPh: 'Kasaysayan', icon: 'time-outline' },
            { id: 'syllabary', labelEn: 'Syllabary Grid', labelPh: 'Talaan ng Titik', icon: 'grid-outline' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.selectionAsync();
                  setActiveTab(tab.id as TabType);
                }}
                activeOpacity={0.75}
              >
                {isActive ? (
                  <LinearGradient colors={['#D1582D', '#B83814']} style={styles.tabGradientActive}>
                    <Ionicons name={tab.icon as any} size={14} color="#FFFFFF" />
                    <Text style={styles.tabBtnTextActive}>
                      {language === 'EN' ? tab.labelEn : tab.labelPh}
                    </Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.tabInnerInactive}>
                    <Ionicons name={tab.icon as any} size={14} color="#64748B" />
                    <Text style={styles.tabBtnText}>
                      {language === 'EN' ? tab.labelEn : tab.labelPh}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.scrollArea} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* ========================================================= */}
        {/* TAB 1: WRITING RULES                                      */}
        {/* ========================================================= */}
        {activeTab === 'rules' && (
          <View style={styles.tabContentGroup}>
            
            {/* 1. Indû & Anak Concept */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.cardHeaderIcon, { backgroundColor: '#FFF1EE' }]}>
                  <Ionicons name="git-branch" size={17} color="#D1582D" />
                </View>
                <View style={styles.cardTitleCol}>
                  <Text style={styles.cardSectionBadge}>CONCEPT</Text>
                  <Text style={styles.cardTitle}>
                    {language === 'EN' ? 'INDÛ & ANAK SULAT' : 'INDÛ AT ANAK SULAT'}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardText}>
                {language === 'EN' 
                  ? 'Kulitan is structured on a familial relationship of "Mother" and "Child" characters:'
                  : 'Ang Kulitan ay nakabatay sa istrukturang pampamilya ng mga titik:'}
              </Text>
              
              <View style={styles.conceptBoxRow}>
                <View style={styles.conceptBox}>
                  <View style={styles.conceptPillTag}>
                    <Text style={styles.conceptPillText}>MOTHER</Text>
                  </View>
                  <Text style={styles.conceptBoxTitle}>Indû Sulat</Text>
                  <Text style={styles.conceptBoxDesc}>
                    {language === 'EN' 
                      ? 'Base consonants carrying default "A" vowel (Ka, Ga, Ta, Da, Pa, Ba, Ma, La, Sa).'
                      : 'Mga katinig na may likas na patinig na "A".'}
                  </Text>
                </View>

                <View style={[styles.conceptBox, { borderColor: '#DDD6FE', backgroundColor: '#FAF5FF' }]}>
                  <View style={[styles.conceptPillTag, { backgroundColor: '#7C3AED' }]}>
                    <Text style={styles.conceptPillText}>CHILD</Text>
                  </View>
                  <Text style={[styles.conceptBoxTitle, { color: '#5B21B6' }]}>Anak Sulat</Text>
                  <Text style={styles.conceptBoxDesc}>
                    {language === 'EN' 
                      ? 'Standalone vowels (A, I, U) and trailing codas stacked beneath the mother character.'
                      : 'Mga patinig at katinig sa hulihan na nakakabit sa ilalim.'}
                  </Text>
                </View>
              </View>
            </View>

            {/* 2. Tinduk (Vertical Stacking) */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.cardHeaderIcon, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="swap-vertical" size={17} color="#2563EB" />
                </View>
                <View style={styles.cardTitleCol}>
                  <Text style={[styles.cardSectionBadge, { color: '#2563EB' }]}>DIRECTION</Text>
                  <Text style={styles.cardTitle}>
                    {language === 'EN' ? 'TINDUK (VERTICAL STACKING)' : 'TINDUK (PAGSASALANSAN)'}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardText}>
                {language === 'EN'
                  ? 'Unlike horizontal scripts such as Baybayin or Latin, traditional Kulitan is written vertically from top to bottom (Tinduk), and columns read from right to left.'
                  : 'Hindi tulad ng Baybayin, ang tradisyonal na Kulitan ay isinusulat nang patayo mula itaas pababa (Tinduk), at ang mga kolum ay binabasa mula kanan pakaliwa.'}
              </Text>

              {/* Visual Tinduk Diagram */}
              <View style={styles.tindukDiagramContainer}>
                <View style={styles.tindukColumn}>
                  <View style={styles.tindukGlyphCircle}>
                    <Text style={styles.tindukGlyph}>a</Text>
                  </View>
                  <Ionicons name="arrow-down" size={14} color="#D1582D" />
                  <View style={styles.tindukGlyphCircle}>
                    <Text style={styles.tindukGlyph}>na</Text>
                  </View>
                  <Ionicons name="arrow-down" size={14} color="#D1582D" />
                  <View style={styles.tindukGlyphCircle}>
                    <Text style={styles.tindukGlyph}>ka</Text>
                  </View>
                </View>

                <View style={styles.tindukInfoCol}>
                  <View style={styles.tindukBadge}>
                    <Ionicons name="arrow-down-outline" size={12} color="#D1582D" />
                    <Text style={styles.tindukBadgeText}>
                      {language === 'EN' ? 'Top-to-Bottom Flow' : 'Itaas Pababa'}
                    </Text>
                  </View>
                  <Text style={styles.tindukExampleWord}>A • NA • K</Text>
                  <Text style={styles.tindukExplanation}>
                    {language === 'EN'
                      ? 'Syllables within a word are stacked vertically in columns. Successive lines progress from right to left.'
                      : 'Ang mga pantig sa isang salita ay isinusulat nang patayo. Ang bawat hanay ay binabasa mula kanan pakaliwa.'}
                  </Text>
                </View>
              </View>
            </View>

            {/* 3. The Garlit (Kudlit) Marks */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.cardHeaderIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="sparkles" size={17} color="#D97706" />
                </View>
                <View style={styles.cardTitleCol}>
                  <Text style={[styles.cardSectionBadge, { color: '#D97706' }]}>DIACRITICS</Text>
                  <Text style={styles.cardTitle}>
                    {language === 'EN' ? 'THE GARLIT (KUDLIT) SYSTEM' : 'ANG SISTEMA NG GARLIT'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.cardText, { marginBottom: 14 }]}>
                {language === 'EN'
                  ? 'Placing a Garlit diacritic alters the inherent "A" vowel sound of any consonant:'
                  : 'Ang paglalagay ng Garlit ay nagbabago ng likas na patinig na "A":'}
              </Text>

              <View style={styles.kudlitDisplayRow}>
                <View style={styles.kudlitCard}>
                  <View style={styles.kudlitGlyphSquare}>
                    <Text style={styles.kudlitChar}>ki</Text>
                  </View>
                  <View style={[styles.vowelDotPill, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                    <Text style={[styles.vowelDotText, { color: '#1D4ED8' }]}>▲ UPPER</Text>
                  </View>
                  <Text style={styles.kudlitCardTitle}>KI / KE</Text>
                  <Text style={styles.kudlitCardDesc}>{language === 'EN' ? 'Upper Dot (I/E)' : 'Tuldok sa Itaas'}</Text>
                </View>

                <View style={[styles.kudlitCard, { borderColor: '#FED7AA', backgroundColor: '#FFFDFB' }]}>
                  <View style={styles.kudlitGlyphSquare}>
                    <Text style={styles.kudlitChar}>ka</Text>
                  </View>
                  <View style={[styles.vowelDotPill, { backgroundColor: '#FFF1EE', borderColor: '#FFDDD4' }]}>
                    <Text style={[styles.vowelDotText, { color: '#D1582D' }]}>● ROOT</Text>
                  </View>
                  <Text style={styles.kudlitCardTitle}>KA</Text>
                  <Text style={styles.kudlitCardDesc}>{language === 'EN' ? 'Default Root (A)' : 'Likas na Ugat'}</Text>
                </View>

                <View style={styles.kudlitCard}>
                  <View style={styles.kudlitGlyphSquare}>
                    <Text style={styles.kudlitChar}>ku</Text>
                  </View>
                  <View style={[styles.vowelDotPill, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                    <Text style={[styles.vowelDotText, { color: '#B45309' }]}>▼ LOWER</Text>
                  </View>
                  <Text style={styles.kudlitCardTitle}>KU / KO</Text>
                  <Text style={styles.kudlitCardDesc}>{language === 'EN' ? 'Lower Dot (U/O)' : 'Tuldok sa Ibaba'}</Text>
                </View>
              </View>
            </View>

          </View>
        )}

        {/* ========================================================= */}
        {/* TAB 2: INTERACTIVE GARLIT SANDBOX                         */}
        {/* ========================================================= */}
        {activeTab === 'sandbox' && (
          <View style={styles.tabContentGroup}>
            <View style={styles.sandboxCard}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.cardHeaderIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="flask" size={17} color="#D97706" />
                </View>
                <View style={styles.cardTitleCol}>
                  <Text style={[styles.cardSectionBadge, { color: '#D97706' }]}>INTERACTIVE LAB</Text>
                  <Text style={styles.sandboxHeaderTitle}>
                    {language === 'EN' ? 'Garlit Modifier Lab' : 'Garlit Simulator'}
                  </Text>
                </View>
              </View>
              <Text style={styles.sandboxHeaderSubtitle}>
                {language === 'EN' ? 'Select a base consonant and toggle vowel diacritics to witness live transformations:' : 'Pumili ng ugat at baguhin ang patinig:'}
              </Text>

              {/* LIVE GLYPH PREVIEW MEDALLION */}
              <View style={styles.sandboxPreviewContainer}>
                <View style={styles.sandboxMedallion}>
                  <LinearGradient colors={['#0B132B', '#1E293B']} style={styles.sandboxMedallionInner}>
                    <Text style={styles.sandboxKulitanChar}>{currentModified}</Text>
                  </LinearGradient>
                </View>

                <View style={styles.sandboxDetailsCol}>
                  <Text style={styles.sandboxLatinName}>{currentModified.toUpperCase()}</Text>
                  <Text style={styles.sandboxPhoneticText}>/{currentModified}/</Text>
                  <View style={styles.sandboxVowelBadge}>
                    <Ionicons name="sparkles" size={10} color="#D1582D" />
                    <Text style={styles.sandboxVowelBadgeText}>
                      {sandboxVowel === 'a' ? 'Inherent "A" Vowel' : sandboxVowel === 'i' ? 'Upper Garlit (I/E)' : 'Lower Garlit (U/O)'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* ROOT CONSONANT SELECTOR */}
              <Text style={styles.selectorLabel}>{language === 'EN' ? '1. CHOOSE ROOT CONSONANT (INDÛ):' : '1. PUMILI NG UGAT (INDÛ):'}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rootSelectorScroll}>
                {['ka', 'ga', 'nga', 'ta', 'da', 'na', 'pa', 'ba', 'ma', 'ya', 'la', 'wa', 'sa', 'a'].map((root) => {
                  const isSelected = sandboxRoot === root;
                  return (
                    <TouchableOpacity
                      key={root}
                      style={[styles.rootChip, isSelected && styles.rootChipActive]}
                      onPress={() => {
                        if (Platform.OS !== 'web') Haptics.selectionAsync();
                        setSandboxRoot(root);
                      }}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.rootChipText, isSelected && styles.rootChipTextActive]}>
                        {root.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* VOWEL GARLIT POSITION SELECTOR */}
              <Text style={[styles.selectorLabel, { marginTop: 16 }]}>{language === 'EN' ? '2. APPLY VOWEL GARLIT:' : '2. ILAPAT ANG PATINIG:'}</Text>
              <View style={styles.vowelModifierRow}>
                <TouchableOpacity
                  style={[styles.vowelBtn, sandboxVowel === 'i' && styles.vowelBtnActive]}
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.selectionAsync();
                    setSandboxVowel('i');
                  }}
                  activeOpacity={0.75}
                >
                  <Ionicons name="chevron-up-circle" size={16} color={sandboxVowel === 'i' ? '#FFFFFF' : '#D1582D'} />
                  <Text style={[styles.vowelBtnText, sandboxVowel === 'i' && styles.vowelBtnTextActive]}>
                    Upper ( -I / -E )
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.vowelBtn, sandboxVowel === 'a' && styles.vowelBtnActive]}
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.selectionAsync();
                    setSandboxVowel('a');
                  }}
                  activeOpacity={0.75}
                >
                  <Ionicons name="remove-circle" size={16} color={sandboxVowel === 'a' ? '#FFFFFF' : '#D1582D'} />
                  <Text style={[styles.vowelBtnText, sandboxVowel === 'a' && styles.vowelBtnTextActive]}>
                    Default ( -A )
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.vowelBtn, sandboxVowel === 'u' && styles.vowelBtnActive]}
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.selectionAsync();
                    setSandboxVowel('u');
                  }}
                  activeOpacity={0.75}
                >
                  <Ionicons name="chevron-down-circle" size={16} color={sandboxVowel === 'u' ? '#FFFFFF' : '#D1582D'} />
                  <Text style={[styles.vowelBtnText, sandboxVowel === 'u' && styles.vowelBtnTextActive]}>
                    Lower ( -U / -O )
                  </Text>
                </TouchableOpacity>
              </View>

              {/* PRACTICE CTA */}
              <TouchableOpacity
                style={styles.sandboxCtaBtn}
                onPress={() => navigation.navigate('WriteTrace', { selectedSyllable: currentModified })}
                activeOpacity={0.88}
              >
                <LinearGradient colors={['#D1582D', '#B83814']} style={styles.sandboxCtaGradient}>
                  <MaterialCommunityIcons name="draw-pen" size={18} color="#FFFFFF" />
                  <Text style={styles.sandboxCtaBtnText}>
                    {language === 'EN' ? `Practice "${currentModified.toUpperCase()}" in Studio →` : `Sanayin ang "${currentModified.toUpperCase()}" sa Studio →`}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ========================================================= */}
        {/* TAB 3: HISTORY & ORIGINS                                  */}
        {/* ========================================================= */}
        {activeTab === 'history' && (
          <View style={styles.tabContentGroup}>
            
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.cardHeaderIcon, { backgroundColor: '#FFF1EE' }]}>
                  <Ionicons name="compass-outline" size={17} color="#D1582D" />
                </View>
                <View style={styles.cardTitleCol}>
                  <Text style={styles.cardSectionBadge}>CHRONOLOGY</Text>
                  <Text style={styles.cardTitle}>
                    {language === 'EN' ? 'ANCIENT AUSTRONESIAN ROOTS' : 'SINAUNANG PINAGMULAN'}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardText}>
                {language === 'EN'
                  ? 'Kulitan is descended from the Brahmic family of scripts, evolving through the Kawi (Old Javanese) script across maritime Southeast Asia. Ancient Kapampangans inscribed messages on bamboo, river stones, and palm leaves.'
                  : 'Ang Kulitan ay nagmula sa pamilya ng mga script na Brahmic, na umunlad sa pamamagitan ng Kawi sa Timog-Silangang Asya. Ang mga sinaunang Kapampangan ay sumulat sa kawayan, bato, at dahon.'}
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.cardHeaderIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="document-text-outline" size={17} color="#B45309" />
                </View>
                <View style={styles.cardTitleCol}>
                  <Text style={[styles.cardSectionBadge, { color: '#B45309' }]}>1699 HISTORIC RECORD</Text>
                  <Text style={styles.cardTitle}>
                    {language === 'EN' ? 'FRAY ÁLVARO DE BENAVENTE' : 'DOKUMENTASYON NOONG 1699'}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardText}>
                {language === 'EN'
                  ? 'In 1699, Spanish Augustinian missionary Fray Álvaro de Benavente documented the orthography and vertical writing system of Sulat Kapampangan in his Arte y Vocabulario de la Lengua Pampanga, preserving this heritage for posterity.'
                  : 'Noong 1699, itinala ng misyonerong Agustinong si Fray Álvaro de Benavente ang ortograpiya at patayong pagsulat ng Sulat Kapampangan sa kanyang Arte y Vocabulario de la Lengua Pampanga.'}
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.cardHeaderIcon, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="shield-checkmark-outline" size={17} color="#059669" />
                </View>
                <View style={styles.cardTitleCol}>
                  <Text style={[styles.cardSectionBadge, { color: '#059669' }]}>MODERN PRESERVATION</Text>
                  <Text style={styles.cardTitle}>
                    {language === 'EN' ? 'HERITAGE REVIVAL TODAY' : 'PAGPAPANATILI NG PAMANA'}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardText}>
                {language === 'EN'
                  ? 'Today, cultural advocacy groups, scholars, and academic institutions in Pampanga continue to promote Kulitan through calligraphy workshops, educational platforms like E-Subli, and public signage to ensure this writing system thrives for generations to come.'
                  : 'Sa kasalukuyan, patuloy na itinataguyod ng mga kultural na grupo at institusyon sa Pampanga ang Kulitan sa pamamagitan ng mga palihan at digital na aplikasyon tulad ng E-Subli.'}
              </Text>
            </View>

          </View>
        )}

        {/* ========================================================= */}
        {/* TAB 4: COMPLETE SYLLABARY GRID                            */}
        {/* ========================================================= */}
        {activeTab === 'syllabary' && (
          <View style={styles.tabContentGroup}>
            <View style={styles.card}>
              <View style={styles.gridHeaderRow}>
                <View>
                  <Text style={styles.gridSectionTitle}>
                    {language === 'EN' ? 'COMPLETE SYLLABARY' : 'KUMPLETONG TALAAN'}
                  </Text>
                  <Text style={styles.gridSectionDesc}>
                    {language === 'EN' ? `Showing ${displayedSyllables.length} authentic glyphs:` : `Ipinapakita ang ${displayedSyllables.length} na mga titik:`}
                  </Text>
                </View>
                <View style={styles.syllableCountPill}>
                  <Text style={styles.syllableCountText}>{displayedSyllables.length}</Text>
                </View>
              </View>

              {/* GRID FILTER CHIPS */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gridFilterScroll}>
                {[
                  { id: 'all', label: language === 'EN' ? 'All Characters' : 'Lahat' },
                  { id: 'roots', label: language === 'EN' ? '👑 Roots (Indû)' : '👑 Mga Ugat' },
                  { id: 'vowel_i', label: language === 'EN' ? '▲ Upper (-I / -E)' : '▲ Itaas (-I/-E)' },
                  { id: 'vowel_u', label: language === 'EN' ? '▼ Lower (-U / -O)' : '▼ Ibaba (-U/-O)' },
                  { id: 'coda', label: language === 'EN' ? '💫 Nasal (-NG)' : '💫 May -NG' },
                ].map((filt) => {
                  const isActive = gridFilter === filt.id;
                  return (
                    <TouchableOpacity
                      key={filt.id}
                      style={[styles.gridFilterChip, isActive && styles.gridFilterChipActive]}
                      onPress={() => {
                        if (Platform.OS !== 'web') Haptics.selectionAsync();
                        setGridFilter(filt.id as any);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.gridFilterChipText, isActive && styles.gridFilterChipTextActive]}>
                        {filt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* COMPLETE SYLLABARY GRID */}
              <View style={styles.glyphGrid}>
                {displayedSyllables.map((char) => (
                  <TouchableOpacity 
                    key={char.id} 
                    style={styles.glyphGridItem}
                    onPress={() => navigation.navigate('WriteTrace', { selectedSyllable: char.latin })}
                    activeOpacity={0.75}
                  >
                    <View style={styles.glyphBox}>
                      <KulitanGlyph symbol={char.latin} size={34} color="#D1582D" strokeWidth={3.4} />
                    </View>
                    <Text style={styles.glyphLatinText} numberOfLines={1}>
                      {char.latin.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  watermarkContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  watermarkGlyph: {
    position: 'absolute',
    fontFamily: 'Kulitan',
    fontSize: 160,
    color: 'rgba(209, 88, 45, 0.04)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 56 : Platform.OS === 'android' ? 44 : 26,
    paddingHorizontal: 20,
    paddingBottom: 14,
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
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
    marginBottom: 3,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  headerSubtitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 8.5,
    color: '#D1582D',
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#0F172A',
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
  tabsContainer: {
    marginBottom: 10,
  },
  tabsScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tabBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  tabBtnActive: {
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  tabGradientActive: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 16,
    gap: 6,
  },
  tabInnerInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#EDE3D8',
  },
  tabBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#64748B',
  },
  tabBtnTextActive: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120, // ample space above persistent bottom bar!
    paddingTop: 4,
  },
  tabContentGroup: {
    gap: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#EDE3D8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  cardHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(209, 88, 45, 0.15)',
  },
  cardTitleCol: {
    flex: 1,
  },
  cardSectionBadge: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 8,
    color: '#D1582D',
    letterSpacing: 1,
  },
  cardTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#0F172A',
  },
  cardText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  conceptBoxRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  conceptBox: {
    flex: 1,
    backgroundColor: '#FFFDFB',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
  },
  conceptPillTag: {
    backgroundColor: '#D1582D',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  conceptPillText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 7.5,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  conceptBoxTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#D1582D',
    marginBottom: 4,
  },
  conceptBoxDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  tindukDiagramContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFDFB',
    borderRadius: 20,
    padding: 16,
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    gap: 16,
    alignItems: 'center',
  },
  tindukColumn: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: '#EDE3D8',
  },
  tindukGlyphCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF1EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tindukGlyph: {
    fontFamily: 'Kulitan',
    fontSize: 22,
    color: '#D1582D',
  },
  tindukInfoCol: {
    flex: 1,
  },
  tindukBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  tindukBadgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    color: '#D1582D',
  },
  tindukExampleWord: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 4,
  },
  tindukExplanation: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 17,
  },
  kudlitDisplayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  kudlitCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#EDE3D8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  kudlitGlyphSquare: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FAF5EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EDE3D8',
  },
  kudlitChar: {
    fontFamily: 'Kulitan',
    fontSize: 30,
    color: '#D1582D',
  },
  vowelDotPill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 6,
  },
  vowelDotText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 7.5,
    letterSpacing: 0.5,
  },
  kudlitCardTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#0F172A',
  },
  kudlitCardDesc: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 9.5,
    color: '#8C7E72',
    textAlign: 'center',
  },
  sandboxCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sandboxHeaderTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#0F172A',
  },
  sandboxHeaderSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 18,
  },
  sandboxPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDFB',
    padding: 16,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    marginBottom: 18,
    gap: 16,
  },
  sandboxMedallion: {
    width: 84,
    height: 84,
    borderRadius: 42,
    padding: 3.5,
    backgroundColor: '#F59E0B',
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  sandboxMedallionInner: {
    flex: 1,
    borderRadius: 38.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FDE68A',
  },
  sandboxKulitanChar: {
    fontFamily: 'Kulitan',
    fontSize: 44,
    color: '#FBBF24',
  },
  sandboxDetailsCol: {
    flex: 1,
  },
  sandboxLatinName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
    color: '#0F172A',
    lineHeight: 32,
  },
  sandboxPhoneticText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
  },
  sandboxVowelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#FED7AA',
    gap: 4,
  },
  sandboxVowelBadgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9.5,
    color: '#C2410C',
  },
  selectorLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9.5,
    color: '#D1582D',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  rootSelectorScroll: {
    gap: 7,
    paddingBottom: 4,
  },
  rootChip: {
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#EDE3D8',
  },
  rootChipActive: {
    backgroundColor: '#D1582D',
    borderColor: '#B83814',
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  rootChipText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11.5,
    color: '#64748B',
  },
  rootChipTextActive: {
    color: '#FFFFFF',
  },
  vowelModifierRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  vowelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFDFB',
    paddingVertical: 11,
    borderRadius: 14,
    gap: 5,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
  },
  vowelBtnActive: {
    backgroundColor: '#D1582D',
    borderColor: '#B83814',
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  vowelBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: '#D1582D',
  },
  vowelBtnTextActive: {
    color: '#FFFFFF',
  },
  sandboxCtaBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  sandboxCtaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  sandboxCtaBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  gridHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  gridSectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#0F172A',
  },
  gridSectionDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11.5,
    color: '#64748B',
  },
  syllableCountPill: {
    backgroundColor: '#FFF1EE',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  syllableCountText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11.5,
    color: '#D1582D',
  },
  gridFilterScroll: {
    gap: 7,
    paddingBottom: 14,
    marginTop: 4,
  },
  gridFilterChip: {
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#EDE3D8',
  },
  gridFilterChipActive: {
    backgroundColor: '#D1582D',
    borderColor: '#B83814',
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  gridFilterChipText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#64748B',
  },
  gridFilterChipTextActive: {
    color: '#FFFFFF',
  },
  glyphGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  glyphGridItem: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 10,
  },
  glyphBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#FFFDFB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1.5,
  },
  glyphLatinText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11.5,
    color: '#0F172A',
    textAlign: 'center',
  },
});
