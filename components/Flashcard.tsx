import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SyllableData } from '../data/kulitanData';
import KulitanGlyph from './KulitanGlyph';

type FlashcardProps = {
  data: SyllableData;
};

export default function Flashcard({ data }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <TouchableOpacity 
      style={styles.cardContainer} 
      activeOpacity={0.9}
      onPress={() => setIsFlipped(!isFlipped)}
    >
      <View style={[styles.card, isFlipped ? styles.cardFlipped : styles.cardFront]}>
        {!isFlipped ? (
          // Front of the card
          <View style={styles.cardContent}>
            <View style={styles.glyphWrapper}>
              <KulitanGlyph symbol={data.latin} size={110} color="#0B2046" strokeWidth={5} />
            </View>
            <Text style={styles.latinText}>{data.latin}</Text>
            {data.classification && (
              <View style={styles.classificationPill}>
                <Text style={styles.classificationPillText}>{data.classification}</Text>
              </View>
            )}
            <Text style={styles.instructionText}>Tap to reveal full definition</Text>
          </View>
        ) : (
          // Back of the card (Complete and Accurate Definition)
          <ScrollView 
            style={styles.backScroll} 
            contentContainerStyle={styles.backCardContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Classification Header */}
            <View style={styles.backHeaderBadge}>
              <Ionicons name="bookmark" size={14} color="#D1582D" />
              <Text style={styles.backHeaderBadgeText}>{data.classification || 'Kulitan Syllable'}</Text>
            </View>

            {/* Character & Pronunciation */}
            <Text style={styles.backLatinTitle}>{data.latin.toUpperCase()}</Text>
            {data.pronunciation && (
              <Text style={styles.backPronunciation}>{data.pronunciation}</Text>
            )}

            {/* Detailed Definition */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionHeader}>Meaning & Role</Text>
              <Text style={styles.definitionText}>{data.definition}</Text>
            </View>

            {/* Stroke / Writing Rule */}
            {data.writingRule && (
              <View style={styles.infoSection}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="pencil" size={13} color="#64748B" />
                  <Text style={styles.sectionHeader}>Writing Rule</Text>
                </View>
                <Text style={styles.writingRuleText}>{data.writingRule}</Text>
              </View>
            )}

            {/* Kapampangan Example */}
            {data.exampleWord && (
              <View style={styles.exampleSection}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="book" size={13} color="#D1582D" />
                  <Text style={[styles.sectionHeader, { color: '#D1582D' }]}>Example Word</Text>
                </View>
                <Text style={styles.exampleWordText}>
                  <Text style={styles.exampleWordBold}>{data.exampleWord}</Text>
                  {data.exampleMeaning ? ` — ${data.exampleMeaning}` : ''}
                </Text>
              </View>
            )}

            <Text style={styles.flipBackHint}>Tap card to flip back</Text>
          </ScrollView>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '90%',
    height: 450,
    alignSelf: 'center',
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  card: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardFront: {
    backgroundColor: '#FAF5EE',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  cardFlipped: {
    backgroundColor: '#FFFFFF',
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  glyphWrapper: {
    marginBottom: 16,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  latinText: {
    fontSize: 34,
    fontFamily: 'Poppins_700Bold',
    color: '#D1582D',
    marginBottom: 8,
  },
  classificationPill: {
    backgroundColor: 'rgba(209, 88, 45, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  classificationPillText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#9A3A17',
  },
  instructionText: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  backScroll: {
    flex: 1,
  },
  backCardContent: {
    padding: 18,
    paddingBottom: 28,
    alignItems: 'center',
  },
  backHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  backHeaderBadgeText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#C2410C',
    textTransform: 'uppercase',
  },
  backLatinTitle: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: '#0F172A',
    marginBottom: 2,
  },
  backPronunciation: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
    marginBottom: 12,
  },
  infoSection: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  sectionHeader: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  definitionText: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#334155',
    lineHeight: 19,
  },
  writingRuleText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#475569',
    lineHeight: 18,
  },
  exampleSection: {
    width: '100%',
    backgroundColor: '#FFF7ED',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3.5,
    borderLeftColor: '#D1582D',
  },
  exampleWordText: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#7C2D12',
  },
  exampleWordBold: {
    fontFamily: 'Poppins_700Bold',
    color: '#9A3A17',
  },
  flipBackHint: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#94A3B8',
    fontStyle: 'italic',
    marginTop: 4,
  },
});
