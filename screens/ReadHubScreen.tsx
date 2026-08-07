import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Flashcard from '../components/Flashcard';
import { kulitanSyllables } from '../data/kulitanData';
import { useProfile } from '../context/ProfileContext';

type ReadHubScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

export default function ReadHubScreen({ navigation }: ReadHubScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { addXP, incrementFlashcards } = useProfile();

  const handleNext = () => {
    if (currentIndex < kulitanSyllables.length - 1) {
      setCurrentIndex(currentIndex + 1);
      // Give 5 XP for every card read
      addXP(5);
      incrementFlashcards();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentSyllable = kulitanSyllables[currentIndex];
  const progressPercentage = ((currentIndex + 1) / kulitanSyllables.length) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>READ HUB</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          LEARN SYLLABLES ({currentIndex + 1}/{kulitanSyllables.length})
        </Text>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
        </View>
      </View>

      <Flashcard data={currentSyllable} />

      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={[styles.controlButton, currentIndex === 0 && styles.controlButtonDisabled]} 
          onPress={handlePrevious}
          disabled={currentIndex === 0}
        >
          <Text style={styles.controlButtonText}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.controlButton, currentIndex === kulitanSyllables.length - 1 && styles.controlButtonDisabled]} 
          onPress={handleNext}
          disabled={currentIndex === kulitanSyllables.length - 1}
        >
          <Text style={styles.controlButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B2046', // Primary dark blue background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50, // safe area approximation
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: '#D9734E', // Coral/Orange
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#FAF5EE', // Light text
    fontSize: 20,
    fontWeight: 'bold',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressText: {
    color: '#D9734E',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#1E3A68', // Lighter blue for background
    borderRadius: 4,
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#D9734E',
    borderRadius: 4,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  controlButton: {
    backgroundColor: '#FAF5EE',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  controlButtonDisabled: {
    opacity: 0.5,
  },
  controlButtonText: {
    color: '#0B2046',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
