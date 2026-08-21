import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
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
      activeOpacity={0.8}
      onPress={() => setIsFlipped(!isFlipped)}
    >
      <View style={[styles.card, isFlipped ? styles.cardFlipped : styles.cardFront]}>
        {!isFlipped ? (
          // Front of the card
          <View style={styles.cardContent}>
            <TouchableOpacity 
              style={styles.speakerButton} 
              onPress={(e) => {
                e.stopPropagation();
                // Lower pitch slightly for regional intonation
                Speech.speak(data.latin, { language: 'fil-PH', rate: 0.85, pitch: 0.85 });
              }}
            >
              <Ionicons name="volume-high" size={28} color="#0EA5E9" />
            </TouchableOpacity>
            <View style={{ marginBottom: 16 }}>
              <KulitanGlyph symbol={data.latin} size={110} color="#0B2046" strokeWidth={5} />
            </View>
            <Text style={styles.latinText}>{data.latin}</Text>
            <Text style={styles.instructionText}>Tap to reveal definition</Text>
          </View>
        ) : (
          // Back of the card
          <View style={styles.cardContent}>
            <Text style={styles.latinText}>{data.latin}</Text>
            <Text style={styles.definitionText}>{data.definition}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '90%',
    height: 400,
    alignSelf: 'center',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5, // for Android
  },
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  cardFront: {
    backgroundColor: '#FAF5EE', // Light mode aesthetic
  },
  cardFlipped: {
    backgroundColor: '#fff',
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  speakerButton: {
    position: 'absolute',
    top: -10,
    right: 0,
    padding: 10,
    backgroundColor: '#F0F9FF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  symbolText: {
    fontFamily: 'Kulitan',
    fontSize: 100, // Adjusted size to fit the font
    color: '#0B2046', // Dark blue
    marginBottom: 20,
  },
  latinText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D9734E', // Coral/Orange
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    color: '#888',
    marginTop: 20,
    fontStyle: 'italic',
  },
  definitionText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  }
});
