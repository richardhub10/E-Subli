import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Modal, Animated, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StackNavigationProp } from '@react-navigation/stack';
import Flashcard from '../components/Flashcard';
import { kulitanSyllables } from '../data/kulitanData';
import { useProfile } from '../context/ProfileContext';
import { useLanguage } from '../context/LanguageContext';
import FloatingBottomBar from '../components/FloatingBottomBar';

type ReadHubScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

export default function ReadHubScreen({ navigation }: ReadHubScreenProps) {
  const [category, setCategory] = useState<'All' | 'Vowels' | 'Consonants'>('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeData, setResumeData] = useState<{ index: number; category: string } | null>(null);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const { profile, updateProfile, addXP, updateSrsData } = useProfile();
  const { t, language } = useLanguage();

  const filteredData = useMemo(() => {
    let data = [...kulitanSyllables];
    if (category === 'Vowels') data = kulitanSyllables.slice(0, 5);
    if (category === 'Consonants') data = kulitanSyllables.slice(5);

    if (isPracticeMode) {
      data.sort((a, b) => {
        const dueA = profile.srsData?.[a.id]?.nextReview || 0;
        const dueB = profile.srsData?.[b.id]?.nextReview || 0;
        return dueA - dueB;
      });
    }

    return data;
  }, [category, isPracticeMode, profile.srsData]);

  React.useEffect(() => {
    if (profile.readHubIndex && profile.readHubIndex > 0 && profile.readHubCategory) {
      setResumeData({ index: profile.readHubIndex, category: profile.readHubCategory });
      setShowResumeModal(true);
    }
  }, []);

  const handleNext = () => {
    if (currentIndex < filteredData.length - 1) {
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentIndex(currentIndex + 1);
      
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
    if (Platform.OS !== 'web') Haptics.selectionAsync();
  };

  const handleRateCard = (rating: 'Hard' | 'Good' | 'Easy') => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateSrsData(currentSyllable.id, rating);
    
    addXP(10);
    updateProfile({ flashcardsRead: (profile.flashcardsRead || 0) + 1 });
    
    if (currentIndex < filteredData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
      setIsPracticeMode(false);
    }
  };

  return (
    <LinearGradient colors={['#FAF5EE', '#E8DAC9']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerSubtitle}>
            {isPracticeMode ? 'SPACED REPETITION' : 'FLASHCARD MASTER'}
          </Text>
          <Text style={styles.headerTitle}>{t('read_hub')}</Text>
        </View>

        <View style={styles.xpPill}>
          <Ionicons name="sparkles" size={13} color="#D1582D" />
          <Text style={styles.xpPillText}>+5 XP</Text>
        </View>
      </View>

      {/* Mode & Category Bar */}
      <View style={styles.tabsContainer}>
        <View style={styles.practiceToggleContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name={isPracticeMode ? "timer" : "book-outline"} size={16} color={isPracticeMode ? "#10B981" : "#64748B"} />
            <Text style={styles.practiceToggleText}>
              {language === 'EN' ? 'SRS Review Mode' : 'Pagsasanay (SRS)'}
            </Text>
          </View>
          <Switch 
            value={isPracticeMode} 
            onValueChange={(val) => {
              if (Platform.OS !== 'web') Haptics.selectionAsync();
              setIsPracticeMode(val);
              setCurrentIndex(0);
            }} 
            trackColor={{ false: '#CBD5E1', true: '#10B981' }}
            thumbColor={'#FFFFFF'}
          />
        </View>

        <View style={styles.categoryRow}>
          {(['All', 'Vowels', 'Consonants'] as const).map((cat) => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.tabButton, category === cat && styles.tabButtonActive]}
              onPress={() => handleCategoryChange(cat)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, category === cat && styles.tabTextActive]}>
                {cat === 'All' 
                  ? (language === 'EN' ? 'All (Lahat)' : 'Lahat') 
                  : cat === 'Vowels' 
                  ? (language === 'EN' ? 'Vowels (Patinig)' : 'Patinig') 
                  : (language === 'EN' ? 'Consonants' : 'Katinig')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Progress Track */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeaderRow}>
          <Text style={styles.progressText}>
            {category.toUpperCase()} ({currentIndex + 1} of {filteredData.length})
          </Text>
          <Text style={styles.progressPercentText}>{Math.round(progressPercentage)}%</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
        </View>
      </View>

      {/* Central 3D Flippable Flashcard */}
      <Flashcard data={currentSyllable} />

      {/* Navigation Controls / Spaced Repetition Rating Buttons */}
      <View style={styles.controlsContainer}>
        {isPracticeMode ? (
          <View style={styles.srsButtonsContainer}>
            <TouchableOpacity 
              style={[styles.srsButton, { backgroundColor: '#EF4444' }]} 
              onPress={() => handleRateCard('Hard')}
              activeOpacity={0.8}
            >
              <Ionicons name="alert-circle" size={16} color="#FFF" style={{ marginRight: 4 }} />
              <Text style={styles.srsButtonText}>{language === 'EN' ? 'Hard' : 'Mahirap'}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.srsButton, { backgroundColor: '#F59E0B' }]} 
              onPress={() => handleRateCard('Good')}
              activeOpacity={0.8}
            >
              <Ionicons name="thumbs-up" size={16} color="#FFF" style={{ marginRight: 4 }} />
              <Text style={styles.srsButtonText}>{language === 'EN' ? 'Good' : 'Tama lang'}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.srsButton, { backgroundColor: '#10B981' }]} 
              onPress={() => handleRateCard('Easy')}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-done" size={16} color="#FFF" style={{ marginRight: 4 }} />
              <Text style={styles.srsButtonText}>{language === 'EN' ? 'Easy' : 'Madali'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.navButtonsRow}>
            <TouchableOpacity 
              style={[styles.controlButton, currentIndex === 0 && styles.controlButtonDisabled]} 
              onPress={handlePrevious}
              disabled={currentIndex === 0}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={18} color={currentIndex === 0 ? "#CBD5E1" : "#0F172A"} style={{ marginRight: 6 }} />
              <Text style={[styles.controlButtonText, currentIndex === 0 && { color: '#CBD5E1' }]}>
                {language === 'EN' ? 'Previous' : 'Nakaraan'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.controlButtonPrimary, currentIndex === filteredData.length - 1 && styles.controlButtonDisabled]} 
              onPress={handleNext}
              disabled={currentIndex === filteredData.length - 1}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#E87954', '#D1582D']} style={styles.nextBtnGradient}>
                <Text style={styles.controlButtonTextPrimary}>{language === 'EN' ? 'Next' : 'Susunod'}</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Resume Progress Modal */}
      <Modal
        visible={showResumeModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.resumeBadgeCircle}>
              <Ionicons name="bookmark" size={24} color="#D1582D" />
            </View>
            <Text style={styles.modalTitle}>{language === 'EN' ? 'Resume Progress?' : 'Ituloy ang Progreso?'}</Text>
            <Text style={styles.modalDescription}>
              {language === 'EN' ? 'Continue from' : 'Nais mo bang ituloy mula sa'} {resumeData?.category} {language === 'EN' ? 'card' : 'card'} {resumeData ? resumeData.index + 1 : 1}?
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButtonSecondary}
                onPress={() => {
                  updateProfile({ readHubIndex: 0, readHubCategory: category });
                  setShowResumeModal(false);
                }}
                activeOpacity={0.7}
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
                activeOpacity={0.85}
              >
                <Text style={styles.modalButtonPrimaryText}>{language === 'EN' ? 'Continue' : 'Ituloy'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Floating Curved Notch Bottom Navigation Bar */}
      <FloatingBottomBar activeTab="Learn" navigation={navigation} />
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
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingHorizontal: 20,
    paddingBottom: 10,
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
    color: '#0F172A',
  },
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    gap: 4,
  },
  xpPillText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    color: '#C2410C',
  },
  tabsContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  practiceToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  practiceToggleText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#334155',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabButtonActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  tabText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: '#64748B',
    letterSpacing: 0.5,
  },
  progressPercentText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    color: '#D1582D',
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#D1582D',
    borderRadius: 3,
  },
  controlsContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 95 : 85,
    paddingTop: 10,
  },
  navButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  controlButtonPrimary: {
    flex: 1.4,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  controlButtonDisabled: {
    opacity: 0.4,
  },
  controlButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#0F172A',
  },
  controlButtonTextPrimary: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  srsButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  srsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  srsButtonText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  resumeBadgeCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFF1EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  modalTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  modalDescription: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#64748B',
  },
  modalButtonPrimary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#D1582D',
    alignItems: 'center',
  },
  modalButtonPrimaryText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
});
