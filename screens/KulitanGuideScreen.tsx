import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { kulitanSyllables } from '../data/kulitanData';

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

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FBBF24" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KULITAN GUIDE</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* The Writing System */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>THE WRITING SYSTEM</Text>
          <Text style={styles.cardText}>
            Kulitan (Sulat Kapampangan) is an indigenous vertical script used to write Kapampangan. Unlike other ancient Philippine scripts that flow horizontally, Kulitan flows vertically from top to bottom.
          </Text>
        </View>

        {/* Vertical Stacking */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>VERTICAL STACKING</Text>
          <Text style={styles.cardText}>
            In traditional Kulitan, consonant clusters or combinations are stacked directly below each other in vertical columns. The columns then read from right to left.
          </Text>
        </View>

        {/* The Kudlit */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>THE KUDLIT (VOWEL MARKS)</Text>
          <View style={styles.kudlitContainer}>
            <View style={styles.kudlitItem}>
              <View style={styles.kudlitBox}>
                <Text style={styles.kudlitBase}>ka</Text>
                {/* Simulated Kudlit dot using absolute positioning on a text, but in our actual parser it's handled by fonts.
                    We can just type 'ki' to show the font's dot */}
                <Text style={[styles.kudlitBase, { position: 'absolute' }]}>ki</Text>
              </View>
              <Text style={styles.kudlitLabel}>KE / KI</Text>
              <Text style={styles.kudlitSub}>Top-Right Dot</Text>
            </View>
            <View style={styles.kudlitItem}>
              <View style={styles.kudlitBox}>
                <Text style={[styles.kudlitBase, { position: 'absolute' }]}>ku</Text>
              </View>
              <Text style={styles.kudlitLabel}>KO / KU</Text>
              <Text style={styles.kudlitSub}>Bottom-Left Dot</Text>
            </View>
          </View>
        </View>

        {/* Syllabary */}
        <View style={styles.syllabarySection}>
          <Text style={[styles.cardTitle, { paddingHorizontal: 20, marginBottom: 15 }]}>
            SYLLABARY (ALL 24 CHARACTERS)
          </Text>
          
          <View style={styles.card}>
            <View style={styles.grid}>
              {baseCharacters.map((char) => (
                <View key={char.id} style={styles.gridItem}>
                  <View style={styles.charBox}>
                    <Text style={styles.kulitanChar}>{char.kulitanSymbol}</Text>
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
