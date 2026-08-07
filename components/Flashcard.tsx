import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SyllableData } from '../data/kulitanData';

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
            <Text style={styles.symbolText}>{data.kulitanSymbol}</Text>
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
