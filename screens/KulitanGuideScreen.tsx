import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { kulitanSyllables } from '../data/kulitanData';
import { useLanguage } from '../context/LanguageContext';
import KulitanGlyph from '../components/KulitanGlyph';

type KulitanGuideScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

export default function KulitanGuideScreen({ navigation }: KulitanGuideScreenProps) {
  // Filter for the base characters (A, I, U, and consonants with 'a' plus 'nga')
  const baseCharacters = kulitanSyllables.filter(s => 
    s.latin === 'a' || s.latin === 'i' || s.latin === 'u' || 
    (s.latin.length === 2 && s.latin.endsWith('a')) || 
    s.latin === 'nga'
  );
  const { language } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FBBF24" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{language === 'EN' ? 'KULITAN GUIDE' : language === 'PH' ? 'GABAY SA KULITAN' : 'GABAY KING KULITAN'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* The Writing System */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{language === 'EN' ? 'THE WRITING SYSTEM' : language === 'PH' ? 'ANG SISTEMA NG PAGSULAT' : 'ING SISTEMA NING PAMANYULAT'}</Text>
          <Text style={styles.cardText}>
            {language === 'EN' ? 'Kulitan (Sulat Kapampangan) is an indigenous vertical script used to write Kapampangan. Unlike other ancient Philippine scripts that flow horizontally, Kulitan flows vertically from top to bottom.' : language === 'PH' ? 'Ang Kulitan (Sulat Kapampangan) ay isang katutubong patayong script na ginagamit sa pagsulat ng Kapampangan. Hindi tulad ng ibang sinaunang script sa Pilipinas na pahalang, ang Kulitan ay patayo mula itaas pababa.' : 'Ing Kulitan (Sulat Kapampangan) metung yang katutubung patikdo a script a gagamitan king pamanulat Kapampangan. E kalupa ring aliwang matuang script king Pilipinas a pakera, ing Kulitan patikdo ya manibat babo pababa.'}
          </Text>
        </View>

        {/* Vertical Stacking */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{language === 'EN' ? 'VERTICAL STACKING' : language === 'PH' ? 'PAGSASALANSAN NANG PATAYO' : 'PAMANSALANSAN A PATIKDO'}</Text>
          <Text style={styles.cardText}>
            {language === 'EN' ? 'In traditional Kulitan, consonant clusters or combinations are stacked directly below each other in vertical columns. The columns then read from right to left.' : language === 'PH' ? 'Sa tradisyonal na Kulitan, ang mga kumpol ng katinig o kumbinasyon ay pinagsasalansan nang direkta sa ibaba ng bawat isa sa mga patayong kolum. Ang mga kolum ay binabasa mula kanan pakaliwa.' : 'King tradisyunal a Kulitan, ding kumpol da ring katinig o kumbinasyun pansasalansan do mismu king lalam ning balang metung karing patikdong kolum. Ding kolum babasan la manibat wanang papunta kaili.'}
          </Text>
        </View>

        {/* The Kudlit */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{language === 'EN' ? 'THE KUDLIT (VOWEL MARKS)' : language === 'PH' ? 'ANG KUDLIT (MGA PATINIG)' : 'ING KUDLIT (DING PATINIG)'}</Text>
          <View style={styles.kudlitContainer}>
            <View style={styles.kudlitItem}>
              <View style={styles.kudlitBox}>
                <Text style={styles.kudlitBase}>ka</Text>
                {/* Simulated Kudlit dot using absolute positioning on a text, but in our actual parser it's handled by fonts.
                    We can just type 'ki' to show the font's dot */}
                <Text style={[styles.kudlitBase, { position: 'absolute' }]}>ki</Text>
              </View>
              <Text style={styles.kudlitLabel}>KE / KI</Text>
              <Text style={styles.kudlitSub}>{language === 'EN' ? 'Top-Right Dot' : language === 'PH' ? 'Tuldok sa Itaas-Kanan' : 'Tuldok king Babo-Wanan'}</Text>
            </View>
            <View style={styles.kudlitItem}>
              <View style={styles.kudlitBox}>
                <Text style={[styles.kudlitBase, { position: 'absolute' }]}>ku</Text>
              </View>
              <Text style={styles.kudlitLabel}>KO / KU</Text>
              <Text style={styles.kudlitSub}>{language === 'EN' ? 'Bottom-Left Dot' : language === 'PH' ? 'Tuldok sa Ibaba-Kaliwa' : 'Tuldok king Lalam-Kaili'}</Text>
            </View>
          </View>
        </View>

        {/* Syllabary */}
        <View style={styles.syllabarySection}>
          <Text style={[styles.cardTitle, { paddingHorizontal: 20, marginBottom: 15 }]}>
            {language === 'EN' ? 'SYLLABARY (ALL 24 CHARACTERS)' : language === 'PH' ? 'SILABARYO (LAHAT NG 24 NA LETRA)' : 'SILABARYO (EGANAGANANG 24 A LETRA)'}
          </Text>
          
          <View style={styles.card}>
            <View style={styles.grid}>
              {baseCharacters.map((char) => (
                <View key={char.id} style={styles.gridItem}>
                  <View style={styles.charBox}>
                    <KulitanGlyph symbol={char.latin} size={42} color="#D1582D" strokeWidth={3.8} />
                  </View>
                  <Text style={styles.latinChar}>{char.latin.toUpperCase()}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050B14', // Deep Navy
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 20,
  },
  backButton: {
    paddingRight: 15,
  },
  headerTitle: {
    fontFamily: 'Times New Roman',
    fontSize: 20,
    color: '#FBBF24',
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 15,
  },
  card: {
    backgroundColor: '#0F1A2C',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#F97316',
    letterSpacing: 2,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  cardText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 22,
  },
  kudlitContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  kudlitItem: {
    alignItems: 'center',
  },
  kudlitBox: {
    width: 80,
    height: 80,
    backgroundColor: '#0A1220',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  kudlitBase: {
    fontFamily: 'Kulitan',
    fontSize: 40,
    color: '#FBBF24',
  },
  kudlitLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#E2E8F0',
  },
  kudlitSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#64748B',
  },
  syllabarySection: {
    marginTop: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 30,
  },
  gridItem: {
    width: '30%',
    alignItems: 'center',
  },
  charBox: {
    width: 60,
    height: 60,
    backgroundColor: '#0A1220',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  kulitanChar: {
    fontFamily: 'Kulitan',
    fontSize: 32,
    color: '#FBBF24',
  },
  latinChar: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#F97316',
  },
});
