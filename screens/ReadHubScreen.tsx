import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Modal, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StackNavigationProp } from '@react-navigation/stack';
import Flashcard from '../components/Flashcard';
import { kulitanSyllables } from '../data/kulitanData';
import { useProfile } from '../context/ProfileContext';
import { useLanguage } from '../context/LanguageContext';

type ReadHubScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

export default function ReadHubScreen({ navigation }: ReadHubScreenProps) {
  const [category, setCategory] = useState<'All' | 'Vowels' | 'Consonants'>('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeData, setResumeData] = useState<{index: number, category: string} | null>(null);
  const { profile, updateProfile, addXP, incrementFlashcards } = useProfile();
  const { t, language } = useLanguage();

  const filteredData = useMemo(() => {
    if (category === 'Vowels') return kulitanSyllables.slice(0, 5);
    if (category === 'Consonants') return kulitanSyllables.slice(5);
    return kulitanSyllables;
  }, [category]);

  React.useEffect(() => {
    // Only prompt once on mount if there is saved progress
    if (profile.readHubIndex && profile.readHubIndex > 0 && profile.readHubCategory) {
      setResumeData({ index: profile.readHubIndex, category: profile.readHubCategory });
      setShowResumeModal(true);
    }
  }, []); // Run only once on mount

  const saveProgress = (newIndex: number, newCategory: string) => {
    updateProfile({ readHubIndex: newIndex, readHubCategory: newCategory });
  };

  const handleNext = () => {
    if (currentIndex < filteredData.length - 1) {
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentIndex(currentIndex + 1);
      
      // Combine updates into a single call to prevent race conditions
      updateProfile({ 
        readHubIndex: currentIndex + 1, 
        readHubCategory: category,
        xp: profile.xp + 5,
        flashcardsRead: (profile.flashcardsRead || 0) + 1
      }, 5);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentIndex(currentIndex - 1);
      updateProfile({ 
        readHubIndex: currentIndex - 1, 
        readHubCategory: category 
      });
    }
  };

  const currentSyllable = filteredData[currentIndex];
  const progressPercentage = ((currentIndex + 1) / filteredData.length) * 100;

  const handleCategoryChange = (newCategory: 'All' | 'Vowels' | 'Consonants') => {
    setCategory(newCategory);
    setCurrentIndex(0);
    updateProfile({ 
      readHubIndex: 0, 
      readHubCategory: newCategory 
    });
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <LinearGradient colors={['#FAF5EE', '#E8DAC9']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('read_hub')}</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.tabsContainer}>
        {['All', 'Vowels', 'Consonants'].map((cat) => (
          <TouchableOpacity 
            key={cat} 
            style={[styles.tabButton, category === cat && styles.tabButtonActive]}
            onPress={() => handleCategoryChange(cat as any)}
          >
            <Text style={[styles.tabText, category === cat && styles.tabTextActive]}>
              {cat === 'All' ? (language === 'EN' ? 'All' : 'Lahat') : cat === 'Vowels' ? (language === 'EN' ? 'Vowels' : 'Patinig') : (language === 'EN' ? 'Consonants' : 'Katinig')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {language === 'EN' ? 'LEARN' : 'PAG-ARALAN'} {category.toUpperCase()} ({currentIndex + 1}/{filteredData.length})
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
          <Text style={styles.controlButtonText}>{language === 'EN' ? 'Previous' : 'Nakaraan'}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.controlButton, styles.controlButtonPrimary, currentIndex === filteredData.length - 1 && styles.controlButtonDisabled]} 
          onPress={handleNext}
          disabled={currentIndex === filteredData.length - 1}
        >
          <Text style={[styles.controlButtonText, styles.controlButtonTextPrimary]}>{language === 'EN' ? 'Next' : 'Susunod'}</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showResumeModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{language === 'EN' ? 'Resume Progress?' : 'Ituloy ang Progreso?'}</Text>
            <Text style={styles.modalDescription}>
              {language === 'EN' ? 'Do you want to continue from' : 'Nais mo bang ituloy mula sa'} {resumeData?.category} {language === 'EN' ? 'card' : 'card'} {resumeData ? resumeData.index + 1 : 1}?
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButtonSecondary}
                onPress={() => {
                  updateProfile({ readHubIndex: 0, readHubCategory: category });
                  setShowResumeModal(false);
                }}
              >
                <Text style={styles.modalButtonSecondaryText}>{language === 'EN' ? 'Start Over' : 'Ulitin'}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalButtonPrimary}
                onPress={() => {
                  if (resumeData) {
                    setCategory(resumeData.category as any);
                    setCurrentIndex(resumeData.index);
                  }
                  setShowResumeModal(false);
                }}
              >
                <Text style={styles.modalButtonPrimaryText}>{language === 'EN' ? 'Continue' : 'Ituloy'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    paddingTop: 60, 
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabButtonActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  progressText: {
    color: '#D1582D',
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 10,
    backgroundColor: '#D1582D',
    borderRadius: 5,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 40,
  },
  controlButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 16,
    minWidth: '46%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  controlButtonPrimary: {
    backgroundColor: '#D1582D',
    shadowColor: '#D1582D',
    shadowOpacity: 0.3,
  },
  controlButtonDisabled: {
    opacity: 0.4,
  },
  controlButtonText: {
    color: '#64748B',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
  },
  controlButtonTextPrimary: {
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FAF5EE',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  modalTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    color: '#0F172A',
    marginBottom: 12,
  },
  modalDescription: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#E2D3C1',
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#475569',
  },
  modalButtonPrimary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#E87954',
    alignItems: 'center',
  },
  modalButtonPrimaryText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  }
});
