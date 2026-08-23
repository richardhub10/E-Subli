import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { kulitanSyllables } from '../data/kulitanData';
import { useLanguage } from '../context/LanguageContext';
import KulitanGlyph from '../components/KulitanGlyph';

type KulitanGuideScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

type TabType = 'history' | 'rules' | 'sandbox' | 'syllabary';

export default function KulitanGuideScreen({ navigation }: KulitanGuideScreenProps) {
  const [activeTab, setActiveTab] = useState<TabType>('rules');
  const [sandboxRoot, setSandboxRoot] = useState('ka');
  const [sandboxVowel, setSandboxVowel] = useState<'a' | 'i' | 'u'>('a');

  const { language } = useLanguage();

  const baseCharacters = kulitanSyllables.filter(s => 
    s.latin === 'a' || s.latin === 'i' || s.latin === 'u' || 
    (s.latin.length === 2 && s.latin.endsWith('a')) || 
    s.latin === 'nga'
  );

  const getModifiedSyllable = () => {
    if (sandboxRoot === 'a') return sandboxVowel === 'i' ? 'i' : sandboxVowel === 'u' ? 'u' : 'a';
    const rootChar = sandboxRoot.replace(/[aiu]/g, '');
    return `${rootChar}${sandboxVowel}`;
  };

  const currentModified = getModifiedSyllable();

  return (
    <LinearGradient colors={['#FFFBF6', '#F8EFE4', '#EFE0CE', '#E8D5BF']} style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton} 
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={20} color="#1E1B18" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerSubtitle}>
            {language === 'EN' ? 'INDIGENOUS WRITING SYSTEM' : 'SINAUNANG PAMAMARAAN'}
          </Text>
          <Text style={styles.headerTitle}>
            {language === 'EN' ? 'Kulitan Guide & History' : 'Gabay sa Kulitan'}
          </Text>
        </View>

        <View style={styles.guideBadgeIcon}>
          <Ionicons name="school" size={17} color="#D1582D" />
        </View>
      </View>

      {/* HORIZONTAL TAB SELECTOR */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'rules' && styles.tabBtnActive]}
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.selectionAsync();
              setActiveTab('rules');
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="book-outline" size={14} color={activeTab === 'rules' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.tabBtnText, activeTab === 'rules' && styles.tabBtnTextActive]}>
              {language === 'EN' ? 'Writing Rules' : 'Mga Panuntunan'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'sandbox' && styles.tabBtnActive]}
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.selectionAsync();
              setActiveTab('sandbox');
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="sparkles" size={14} color={activeTab === 'sandbox' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.tabBtnText, activeTab === 'sandbox' && styles.tabBtnTextActive]}>
              {language === 'EN' ? 'Garlit Sandbox' : 'Garlit Simulator'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'history' && styles.tabBtnActive]}
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.selectionAsync();
              setActiveTab('history');
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="time-outline" size={14} color={activeTab === 'history' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.tabBtnText, activeTab === 'history' && styles.tabBtnTextActive]}>
              {language === 'EN' ? 'History & Origins' : 'Kasaysayan'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'syllabary' && styles.tabBtnActive]}
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.selectionAsync();
              setActiveTab('syllabary');
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="grid-outline" size={14} color={activeTab === 'syllabary' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.tabBtnText, activeTab === 'syllabary' && styles.tabBtnTextActive]}>
              {language === 'EN' ? 'Syllabary Grid' : 'Talaan ng Titik'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ========================================================= */}
        {/* TAB 1: WRITING RULES                                      */}
        {/* ========================================================= */}
        {activeTab === 'rules' && (
          <View style={styles.tabContentGroup}>
            
            {/* 1. Indû & Anak Concept */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.cardHeaderIcon, { backgroundColor: '#FFF7ED' }]}>
                  <Ionicons name="git-branch" size={16} color="#D1582D" />
                </View>
                <Text style={styles.cardTitle}>
                  {language === 'EN' ? 'INDÛ & ANAK SULAT CONCEPT' : 'INDÛ AT ANAK SULAT'}
                </Text>
              </View>
              <Text style={styles.cardText}>
                {language === 'EN' 
                  ? 'Kulitan is built on a familial structure of "Mother" and "Child" characters:'
                  : 'Ang Kulitan ay nakabatay sa istrukturang pampamilya ng mga titik:'}
              </Text>
              
              <View style={styles.bulletList}>
                <View style={styles.bulletItem}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>
                    <Text style={styles.boldText}>Indû Sulat (Mother Characters):</Text> {language === 'EN' ? 'Consonants that carry an inherent "A" vowel (e.g. Ka, Ga, Ta, Da, Pa, Ba, Ma, La, Sa).' : 'Mga katinig na may likas na patinig na "A".'}
                  </Text>
                </View>
                <View style={styles.bulletItem}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>
                    <Text style={styles.boldText}>Anak Sulat (Child Characters):</Text> {language === 'EN' ? 'Standalone vowels (A, I, U) and trailing suffix consonants attached beneath the mother character.' : 'Mga patayong patinig at katinig sa hulihan na nakakabit sa ilalim.'}
                  </Text>
                </View>
              </View>
            </View>

            {/* 2. Tinduk (Vertical Stacking) */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.cardHeaderIcon, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="swap-vertical" size={16} color="#2563EB" />
                </View>
                <Text style={styles.cardTitle}>
                  {language === 'EN' ? 'TINDUK (VERTICAL STACKING)' : 'TINDUK (PAGSASALANSAN)'}
                </Text>
              </View>
              <Text style={styles.cardText}>
                {language === 'EN'
                  ? 'Unlike horizontal scripts like Baybayin, traditional Kulitan is written vertically from top to bottom (Tinduk), and sequential columns read from right to left.'
                  : 'Hindi tulad ng Baybayin, ang tradisyonal na Kulitan ay isinusulat nang patayo mula itaas pababa (Tinduk), at ang mga kolum ay binabasa mula kanan pakaliwa.'}
              </Text>
            </View>

            {/* 3. The Garlit (Kudlit) Marks */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.cardHeaderIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="sparkles" size={16} color="#D97706" />
                </View>
                <Text style={styles.cardTitle}>
                  {language === 'EN' ? 'THE GARLIT (KUDLIT) SYSTEM' : 'ANG SISTEMA NG GARLIT'}
                </Text>
              </View>
              <Text style={[styles.cardText, { marginBottom: 12 }]}>
                {language === 'EN'
                  ? 'Placing a Garlit dot or slash changes the inherent "A" vowel sound:'
                  : 'Ang paglalagay ng Garlit ay nagbabago ng likas na patinig na "A":'}
              </Text>

              <View style={styles.kudlitDisplayRow}>
                <View style={styles.kudlitCard}>
                  <View style={styles.kudlitGlyphSquare}>
                    <Text style={styles.kudlitChar}>ki</Text>
                  </View>
                  <Text style={styles.kudlitCardTitle}>KI / KE</Text>
                  <Text style={styles.kudlitCardDesc}>{language === 'EN' ? 'Upper Dot (I/E)' : 'Tuldok sa Itaas'}</Text>
                </View>

                <View style={styles.kudlitCard}>
                  <View style={styles.kudlitGlyphSquare}>
                    <Text style={styles.kudlitChar}>ka</Text>
                  </View>
                  <Text style={styles.kudlitCardTitle}>KA</Text>
                  <Text style={styles.kudlitCardDesc}>{language === 'EN' ? 'Default Root (A)' : 'Likas na Ugat'}</Text>
                </View>

                <View style={styles.kudlitCard}>
                  <View style={styles.kudlitGlyphSquare}>
                    <Text style={styles.kudlitChar}>ku</Text>
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
              <Text style={styles.sandboxHeaderTitle}>
                {language === 'EN' ? 'Interactive Kudlit Modifier' : 'Interactive Garlit Simulator'}
              </Text>
              <Text style={styles.sandboxHeaderSubtitle}>
                {language === 'EN' ? 'Select a root consonant and apply vowel markers to see live transformations:' : 'Pumili ng ugat at baguhin ang patinig:'}
              </Text>

              {/* LIVE GLYPH PREVIEW MEDALLION */}
              <View style={styles.sandboxPreviewContainer}>
                <View style={styles.sandboxMedallion}>
                  <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.sandboxMedallionInner}>
                    <Text style={styles.sandboxKulitanChar}>{currentModified}</Text>
                  </LinearGradient>
                </View>

                <View style={styles.sandboxDetailsCol}>
                  <Text style={styles.sandboxLatinName}>{currentModified.toUpperCase()}</Text>
                  <Text style={styles.sandboxPhoneticText}>/{currentModified}/</Text>
                  <View style={styles.sandboxVowelBadge}>
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
              <Text style={[styles.selectorLabel, { marginTop: 14 }]}>{language === 'EN' ? '2. APPLY VOWEL GARLIT:' : '2. ILAPAT ANG PATINIG:'}</Text>
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
                onPress={() => navigation.navigate('WriteTrace')}
                activeOpacity={0.88}
              >
                <MaterialCommunityIcons name="draw-pen" size={18} color="#FFFFFF" />
                <Text style={styles.sandboxCtaBtnText}>
                  {language === 'EN' ? `Practice "${currentModified.toUpperCase()}" in Studio →` : `Sanayin ang "${currentModified.toUpperCase()}" sa Studio →`}
                </Text>
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
                <View style={[styles.cardHeaderIcon, { backgroundColor: '#FFF7ED' }]}>
                  <Ionicons name="compass-outline" size={16} color="#D1582D" />
                </View>
                <Text style={styles.cardTitle}>
                  {language === 'EN' ? 'ANCIENT AUSTRONESIAN ROOTS' : 'SINAUNANG PINAGMULAN'}
                </Text>
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
                  <Ionicons name="document-text-outline" size={16} color="#B45309" />
                </View>
                <Text style={styles.cardTitle}>
                  {language === 'EN' ? 'FRAY ÁLVARO DE BENAVENTE (1699)' : 'DOKUMENTASYON NOONG 1699'}
                </Text>
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
                  <Ionicons name="shield-checkmark-outline" size={16} color="#059669" />
                </View>
                <Text style={styles.cardTitle}>
                  {language === 'EN' ? 'HERITAGE REVIVAL TODAY' : 'PAGPAPANATILI NG PAMANA'}
                </Text>
              </View>
              <Text style={styles.cardText}>
                {language === 'EN'
                  ? 'Today, cultural advocacy groups, scholars, and academic institutions in Pampanga continue to promote Kulitan through calligraphy workshops, educational apps like E-Subli, and public signage to ensure this writing system thrives for generations to come.'
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
              <Text style={styles.gridSectionTitle}>
                {language === 'EN' ? 'ROOT SYLLABLES (INDÛ SULAT)' : 'MGA UGAT NA TITIK'}
              </Text>
              <Text style={styles.gridSectionDesc}>
                {language === 'EN' ? 'Tap any character to practice its calligraphy stroke in Studio:' : 'Pindutin ang titik upang sanayin sa Studio:'}
              </Text>

              <View style={styles.glyphGrid}>
                {baseCharacters.map((char) => (
                  <TouchableOpacity 
                    key={char.id} 
                    style={styles.glyphGridItem}
                    onPress={() => navigation.navigate('WriteTrace')}
                    activeOpacity={0.75}
                  >
                    <View style={styles.glyphBox}>
                      <KulitanGlyph symbol={char.latin} size={36} color="#D1582D" strokeWidth={3.6} />
                    </View>
                    <Text style={styles.glyphLatinText}>{char.latin.toUpperCase()}</Text>
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
    fontSize: 9,
    color: '#D1582D',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#1E1B18',
  },
  guideBadgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF1EE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  tabsContainer: {
    marginBottom: 8,
  },
  tabsScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: '#EDE3D8',
  },
  tabBtnActive: {
    backgroundColor: '#D1582D',
    borderColor: '#B83814',
  },
  tabBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11.5,
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
    paddingTop: 4,
  },
  tabContentGroup: {
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#EDE3D8',
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardHeaderIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11.5,
    color: '#D1582D',
    letterSpacing: 0.5,
  },
  cardText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },
  bulletList: {
    marginTop: 10,
    gap: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1582D',
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 12.5,
    color: '#4B5563',
    lineHeight: 18,
  },
  boldText: {
    fontFamily: 'Poppins_700Bold',
    color: '#1E1B18',
  },
  kudlitDisplayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  kudlitCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFF9F4',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  kudlitGlyphSquare: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#EDE3D8',
  },
  kudlitChar: {
    fontFamily: 'Kulitan',
    fontSize: 28,
    color: '#D1582D',
  },
  kudlitCardTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    color: '#1E1B18',
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
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  sandboxHeaderTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#1E1B18',
    marginBottom: 2,
  },
  sandboxHeaderSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#8C7E72',
    marginBottom: 14,
  },
  sandboxPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9F4',
    padding: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    marginBottom: 16,
    gap: 14,
  },
  sandboxMedallion: {
    width: 76,
    height: 76,
    borderRadius: 38,
    padding: 3,
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  sandboxMedallionInner: {
    flex: 1,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  sandboxKulitanChar: {
    fontFamily: 'Kulitan',
    fontSize: 40,
    color: '#FBBF24',
  },
  sandboxDetailsCol: {
    flex: 1,
  },
  sandboxLatinName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 26,
    color: '#1E1B18',
    lineHeight: 30,
  },
  sandboxPhoneticText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  sandboxVowelBadge: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  sandboxVowelBadgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9.5,
    color: '#C2410C',
  },
  selectorLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9.5,
    color: '#B45309',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  rootSelectorScroll: {
    gap: 6,
    paddingBottom: 4,
  },
  rootChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rootChipActive: {
    backgroundColor: '#D1582D',
    borderColor: '#B83814',
  },
  rootChipText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    color: '#64748B',
  },
  rootChipTextActive: {
    color: '#FFFFFF',
  },
  vowelModifierRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  vowelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF9F4',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 5,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  vowelBtnActive: {
    backgroundColor: '#D1582D',
    borderColor: '#B83814',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D1582D',
    paddingVertical: 13,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  sandboxCtaBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12.5,
    color: '#FFFFFF',
  },
  gridSectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#1E1B18',
    marginBottom: 2,
  },
  gridSectionDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11.5,
    color: '#8C7E72',
    marginBottom: 14,
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
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#FFF9F4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    marginBottom: 4,
  },
  glyphLatinText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#1E1B18',
  },
});
