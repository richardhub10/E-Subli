import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { kulitanSyllables } from '../data/kulitanData';
import { useLanguage } from '../context/LanguageContext';
import KulitanGlyph from '../components/KulitanGlyph';

type KulitanGuideScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

export default function KulitanGuideScreen({ navigation }: KulitanGuideScreenProps) {
  const baseCharacters = kulitanSyllables.filter(s => 
    s.latin === 'a' || s.latin === 'i' || s.latin === 'u' || 
    (s.latin.length === 2 && s.latin.endsWith('a')) || 
    s.latin === 'nga'
  );
  const { language } = useLanguage();

  return (
    <LinearGradient colors={['#FAF6F0', '#F3EAE0', '#EAE0D3']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#1E1B18" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerSubtitle}>
            {language === 'EN' ? 'HISTORICAL WRITING SYSTEM' : 'SINAUNANG PAMAMARAAN'}
          </Text>
          <Text style={styles.headerTitle}>
            {language === 'EN' ? 'Kulitan Guide' : language === 'PH' ? 'Gabay sa Kulitan' : 'Gabay king Kulitan'}
          </Text>
        </View>

        <View style={styles.guideBadgeIcon}>
          <Ionicons name="school" size={18} color="#D1582D" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 1. The Writing System */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.cardHeaderIcon, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="book-outline" size={16} color="#D1582D" />
            </View>
            <Text style={styles.cardTitle}>
              {language === 'EN' ? 'THE WRITING SYSTEM' : language === 'PH' ? 'ANG SISTEMA NG PAGSULAT' : 'ING SISTEMA NING PAMANYULAT'}
            </Text>
          </View>
          <Text style={styles.cardText}>
            {language === 'EN' 
              ? 'Kulitan (Sulat Kapampangan) is an indigenous vertical script used to write Kapampangan. Unlike other ancient Philippine scripts that flow horizontally, Kulitan flows vertically from top to bottom.' 
              : language === 'PH' 
              ? 'Ang Kulitan (Sulat Kapampangan) ay isang katutubong patayong script na ginagamit sa pagsulat ng Kapampangan. Hindi tulad ng ibang sinaunang script sa Pilipinas na pahalang, ang Kulitan ay patayo mula itaas pababa.' 
              : 'Ing Kulitan (Sulat Kapampangan) metung yang katutubung patikdo a script a gagamitan king pamanulat Kapampangan. E kalupa ring aliwang matuang script king Pilipinas a pakera, ing Kulitan patikdo ya manibat babo pababa.'}
          </Text>
        </View>

        {/* 2. Vertical Stacking & Right-to-Left Direction */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.cardHeaderIcon, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="swap-vertical" size={16} color="#2563EB" />
            </View>
            <Text style={styles.cardTitle}>
              {language === 'EN' ? 'VERTICAL STACKING' : language === 'PH' ? 'PAGSASALANSAN NANG PATAYO' : 'PAMANSALANSAN A PATIKDO'}
            </Text>
          </View>
          <Text style={styles.cardText}>
            {language === 'EN' 
              ? 'In traditional Kulitan, consonant clusters or combinations are stacked directly below each other in vertical columns. The columns then read sequentially from right to left.' 
              : language === 'PH' 
              ? 'Sa tradisyonal na Kulitan, ang mga kumpol ng katinig o kumbinasyon ay pinagsasalansan nang direkta sa ibaba ng bawat isa sa mga patayong kolum. Ang mga kolum ay binabasa mula kanan pakaliwa.' 
              : 'King tradisyunal a Kulitan, ding kumpol da ring katinig o kumbinasyun pansasalansan do mismu king lalam ning balang metung karing patikdong kolum. Ding kolum babasan la manibat wanang papunta kaili.'}
          </Text>
        </View>

        {/* 3. The Kudlit (Garlit Marks) */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.cardHeaderIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="sparkles" size={16} color="#D97706" />
            </View>
            <Text style={styles.cardTitle}>
              {language === 'EN' ? 'THE GARLIT / KUDLIT MARKS' : language === 'PH' ? 'ANG MGA KUDLIT (GARLIT)' : 'DING KUDLIT (GARLIT)'}
            </Text>
          </View>
          
          <Text style={[styles.cardText, { marginBottom: 14 }]}>
            {language === 'EN'
              ? 'Root consonants carry the default vowel sound "A". Placing a Garlit dot changes the vowel:'
              : 'Ang mga ugat na katinig ay may likas na tunog na "A". Ang paglalagay ng tuldok ay nagbabago ng patinig:'}
          </Text>

          <View style={styles.kudlitContainer}>
            <View style={styles.kudlitItem}>
              <View style={styles.kudlitBox}>
                <Text style={styles.kudlitBase}>ki</Text>
              </View>
              <Text style={styles.kudlitLabel}>KI / KE</Text>
              <Text style={styles.kudlitSub}>
                {language === 'EN' ? 'Upper Garlit Dot' : 'Tuldok sa Itaas'}
              </Text>
            </View>

            <View style={styles.kudlitItem}>
              <View style={styles.kudlitBox}>
                <Text style={styles.kudlitBase}>ku</Text>
              </View>
              <Text style={styles.kudlitLabel}>KU / KO</Text>
              <Text style={styles.kudlitSub}>
                {language === 'EN' ? 'Lower Garlit Dot' : 'Tuldok sa Ibaba'}
              </Text>
            </View>
          </View>
        </View>

        {/* 4. Complete Base Syllabary Grid */}
        <View style={styles.syllabarySection}>
          <Text style={styles.sectionHeaderTitle}>
            {language === 'EN' ? 'ROOT SYLLABARY (INDÛ SULAT)' : language === 'PH' ? 'MGA UGAT NA TITIK (INDÛ SULAT)' : 'DING INDÛ SULAT'}
          </Text>
          
          <View style={styles.card}>
            <View style={styles.glyphGrid}>
              {baseCharacters.map((char) => (
                <View key={char.id} style={styles.glyphGridItem}>
                  <View style={styles.glyphBox}>
                    <KulitanGlyph symbol={char.latin} size={38} color="#D1582D" strokeWidth={3.8} />
                  </View>
                  <Text style={styles.glyphLatinText}>{char.latin.toUpperCase()}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

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
    paddingTop: Platform.OS === 'ios' ? 56 : 38,
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
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerSubtitle: {
    fontFamily: 'Poppins_600SemiBold',
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#EDE3D8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
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
    fontSize: 12,
    color: '#D1582D',
    letterSpacing: 0.5,
  },
  cardText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },
  kudlitContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  kudlitItem: {
    alignItems: 'center',
  },
  kudlitBox: {
    width: 72,
    height: 72,
    backgroundColor: '#FAF6F0',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#E8DED3',
  },
  kudlitBase: {
    fontFamily: 'Kulitan',
    fontSize: 34,
    color: '#D1582D',
  },
  kudlitLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#1E1B18',
  },
  kudlitSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#8C7E72',
  },
  syllabarySection: {
    marginTop: 6,
  },
  sectionHeaderTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#1E1B18',
    marginBottom: 8,
    paddingHorizontal: 4,
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
    backgroundColor: '#FAF6F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8DED3',
    marginBottom: 4,
  },
  glyphLatinText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#1E1B18',
  },
});
