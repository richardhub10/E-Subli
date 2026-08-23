import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Platform, Dimensions, ScrollView, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StackNavigationProp } from '@react-navigation/stack';
import { getRandomQuestions, QuestionCategory, QuizQuestion } from '../utils/quizQuestions';
import { useProfile } from '../context/ProfileContext';
import { useLanguage } from '../context/LanguageContext';
import { useQuest } from '../context/QuestContext';

type OfflineQuizScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

const { width } = Dimensions.get('window');

export default function OfflineQuizScreen({ navigation }: OfflineQuizScreenProps) {
  const { addXP } = useProfile();
  const { recordQuestAction } = useQuest();
  const { t, language } = useLanguage();

  // Category Filter State
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory>('all');
  const [currentQ, setCurrentQ] = useState<QuizQuestion | null>(null);
  
  // Game & Scoring State
  const [score, setScore] = useState(0);
  const [sessionXP, setSessionXP] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  // Status & Modal State
  const [status, setStatus] = useState<'playing' | 'recap'>('playing');
  const [isRecapModalVisible, setIsRecapModalVisible] = useState(false);

  // Selection & Feedback State
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrectSelected, setIsCorrectSelected] = useState<boolean | null>(null);

  // Animations
  const timerAnim = useRef(new Animated.Value(100)).current;
  const cardFloatAnim = useRef(new Animated.Value(0)).current;
  const optionsSlideAnim = useRef(new Animated.Value(50)).current;
  const optionsOpacityAnim = useRef(new Animated.Value(0)).current;
  const comboScaleAnim = useRef(new Animated.Value(1)).current;

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Parse Kulitan vertical syllables
  const getKulitanSyllables = (text: string): string[][] => {
    const words = text.toLowerCase().split(/\s+/);
    return words.map(word => {
      const parts = word.match(/(?:ng|[bcdfghjklmnpqrstvwxyz])?[aeiou]|(?:ng|[bcdfghjklmnpqrstvwxyz])/gi);
      if (!parts) return [word];
      return parts.map(p => {
        if (/[aeiou]$/.test(p)) return p; 
        return p + 'u'; 
      });
    });
  };

  const nextQuestion = (category = selectedCategory) => {
    const nextQ = getRandomQuestions(1, category)[0];
    setCurrentQ(nextQ);
  };

  const startPractice = (category: QuestionCategory = 'all') => {
    setSelectedCategory(category);
    setScore(0);
    setSessionXP(0);
    setAnsweredCount(0);
    setCorrectCount(0);
    setCurrentStreak(0);
    setMaxStreak(0);
    setStatus('playing');
    setIsRecapModalVisible(false);
    nextQuestion(category);
  };

  useEffect(() => {
    startPractice('all');
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Floating Card Animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(cardFloatAnim, {
          toValue: -8,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(cardFloatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  // Trigger Combo Pop Animation
  const triggerComboAnimation = () => {
    comboScaleAnim.setValue(0.7);
    Animated.spring(comboScaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 50,
      useNativeDriver: true,
    }).start();
  };

  // Timer & Entry Animations
  useEffect(() => {
    if (status === 'playing' && currentQ) {
      setSelectedOption(null);
      setIsCorrectSelected(null);
      
      optionsSlideAnim.setValue(40);
      optionsOpacityAnim.setValue(0);
      
      Animated.parallel([
        Animated.spring(optionsSlideAnim, {
          toValue: 0,
          friction: 7,
          tension: 45,
          useNativeDriver: true,
        }),
        Animated.timing(optionsOpacityAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        })
      ]).start();

      timerAnim.setValue(100);
      Animated.timing(timerAnim, {
        toValue: 0,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        handleTimeOut();
      }, 10000);
    }
  }, [currentQ, status]);

  const handleTimeOut = () => {
    if (status !== 'playing' || selectedOption !== null) return;
    
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    
    setSelectedOption('__TIMEOUT__');
    setIsCorrectSelected(false);
    setCurrentStreak(0);
    setAnsweredCount(prev => prev + 1);
    
    if (timerRef.current) clearTimeout(timerRef.current);
    timerAnim.stopAnimation();

    setTimeout(() => {
      nextQuestion();
    }, 2200);
  };

  const handleAnswer = (selectedOpt: string) => {
    if (status !== 'playing' || selectedOption !== null || !currentQ) return;

    const isCorrect = selectedOpt === currentQ.correct;
    setSelectedOption(selectedOpt);
    setIsCorrectSelected(isCorrect);
    setAnsweredCount(prev => prev + 1);
    
    if (timerRef.current) clearTimeout(timerRef.current);
    timerAnim.stopAnimation();

    if (isCorrect) {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Calculate Streak & Combo XP Bonus
      const nextStreak = currentStreak + 1;
      setCurrentStreak(nextStreak);
      if (nextStreak > maxStreak) setMaxStreak(nextStreak);

      let xpGained = 10;
      if (nextStreak >= 5) xpGained = 30; // 5x on fire
      else if (nextStreak >= 3) xpGained = 20; // 3x combo
      else if (nextStreak >= 2) xpGained = 15; // 2x combo

      setCorrectCount(prev => prev + 1);
      setScore(prev => prev + (xpGained * 10));
      setSessionXP(prev => prev + xpGained);

      triggerComboAnimation();

      setTimeout(() => {
        nextQuestion();
      }, 950);
    } else {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setCurrentStreak(0); // Reset combo streak

      // Allow user 2.2s to clearly read the correct answer before advancing
      setTimeout(() => {
        nextQuestion();
      }, 2200);
    }
  };

  const handleOpenRecap = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerAnim.stopAnimation();

    if (sessionXP > 0) {
      addXP(sessionXP);
      recordQuestAction('quiz');
    }
    setIsRecapModalVisible(true);
  };

  const handleExitToHome = () => {
    setIsRecapModalVisible(false);
    navigation.goBack();
  };

  const categories: { id: QuestionCategory; label: string; icon: string }[] = [
    { id: 'all', label: language === 'EN' ? 'All' : 'Lahat', icon: 'infinite' },
    { id: 'basics', label: language === 'EN' ? 'Basics' : 'Patinig', icon: 'sparkles' },
    { id: 'kudlits', label: language === 'EN' ? 'Kudlits' : 'Garlit', icon: 'document-text' },
    { id: 'words', label: language === 'EN' ? 'Words' : 'Salita', icon: 'book' },
  ];

  const accuracyRate = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  if (!currentQ) return null;

  return (
    <LinearGradient colors={['#FAF5EE', '#E2E8F0']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        {/* Header Bar */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleOpenRecap} style={styles.exitButton} activeOpacity={0.8}>
            <Ionicons name="close" size={24} color="#0F172A" />
          </TouchableOpacity>

          {/* Dynamic Combo Streak Badge */}
          {currentStreak >= 2 ? (
            <Animated.View style={[styles.comboBadge, { transform: [{ scale: comboScaleAnim }] }]}>
              <Text style={styles.comboBadgeIcon}>
                {currentStreak >= 5 ? '🚀' : currentStreak >= 3 ? '⚡' : '🔥'}
              </Text>
              <Text style={styles.comboBadgeText}>
                {currentStreak}x {language === 'EN' ? 'Combo' : 'Sunod-sunod'}
              </Text>
            </Animated.View>
          ) : (
            <View style={styles.sessionScorePill}>
              <Ionicons name="flash" size={16} color="#F59E0B" />
              <Text style={styles.sessionScoreText}>+{sessionXP} XP</Text>
            </View>
          )}

          <View style={styles.scoreContainer}>
            <Ionicons name="star" size={18} color="#FBBF24" />
            <Text style={styles.scoreText}>{score}</Text>
          </View>
        </View>

        {/* Category Filters */}
        <View style={styles.categoryScrollContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            {categories.map(cat => {
              const isActive = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                  onPress={() => {
                    if (selectedCategory !== cat.id) {
                      startPractice(cat.id);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name={cat.icon as any} size={14} color={isActive ? '#FFF' : '#64748B'} />
                  <Text style={[styles.categoryPillText, isActive && styles.categoryPillTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Timer Bar */}
        <View style={styles.timerContainer}>
          <Animated.View style={[
            styles.timerFill,
            {
              width: timerAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
              backgroundColor: timerAnim.interpolate({
                inputRange: [0, 30, 100],
                outputRange: ['#EF4444', '#F59E0B', '#10B981']
              })
            }
          ]} />
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Question Card */}
          <Animated.View style={[styles.questionCard, { transform: [{ translateY: cardFloatAnim }] }]}>
            <View style={styles.questionHeaderBadge}>
              <Text style={styles.questionHeaderText}>
                {currentQ.category === 'basics' 
                  ? (language === 'EN' ? 'IDENTIFY GLYPH' : 'KILALANIN ANG TITIK')
                  : currentQ.category === 'kudlits'
                  ? (language === 'EN' ? 'KUDLIT RULE & SOUND' : 'TUNOG AT PANUNTUNAN NG GARLIT')
                  : (language === 'EN' ? 'WHAT DOES THIS MEAN?' : 'ANO ANG KAHULUGAN?')}
              </Text>
            </View>

            <Text style={styles.questionWord}>
              {currentQ.category === 'words' 
                ? currentQ.kapampangan 
                : (language === 'EN' ? 'Read this Glyph' : 'Basahin ang Titik')}
            </Text>

            {/* Syllable Breakdown Indicator - Shown immediately for words, or revealed upon answer for basics/kudlits */}
            {currentQ.syllables && (currentQ.category === 'words' || selectedOption !== null) && (
              <View style={styles.syllablesChip}>
                <Ionicons name="sparkles" size={12} color="#D1582D" />
                <Text style={styles.syllablesChipText}>{currentQ.syllables}</Text>
              </View>
            )}
            
            {/* Kulitan Vertical Glyph Display */}
            <View style={styles.kulitanContainer}>
              {getKulitanSyllables(currentQ.kapampangan).map((syllables, index) => (
                <View key={index} style={styles.verticalWordColumn}>
                  <Text style={styles.kulitanText}>{syllables.join('\n')}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* 2x2 Options Grid */}
          <View style={styles.optionsGrid}>
            {currentQ.options.map((opt: string, index: number) => {
              const isSelected = selectedOption === opt;
              const isCorrectSelection = isSelected && isCorrectSelected === true;
              const isWrongSelection = isSelected && isCorrectSelected === false;
              const isRevealedCorrect = selectedOption !== null && isCorrectSelected === false && opt === currentQ.correct;
              
              const isGreen = isCorrectSelection || isRevealedCorrect;
              const isRed = isWrongSelection;
              
              return (
                <Animated.View 
                  key={index}
                  style={[
                    styles.optionGridItem,
                    {
                      transform: [{ translateY: optionsSlideAnim }],
                      opacity: optionsOpacityAnim
                    }
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      isGreen && styles.optionCorrect,
                      isRed && styles.optionWrong
                    ]}
                    onPress={() => handleAnswer(opt)}
                    activeOpacity={0.7}
                    disabled={selectedOption !== null}
                  >
                    <View style={[styles.optionBadge, (isGreen || isRed) && styles.optionBadgeActive]}>
                      <Text style={[styles.optionBadgeText, (isGreen || isRed) && { color: '#FFF' }]}>
                        {isGreen ? '✓' : isRed ? '✗' : ['A', 'B', 'C', 'D'][index]}
                      </Text>
                    </View>
                    <Text 
                      style={[
                        styles.optionText,
                        (isGreen || isRed) && { color: '#FFF' }
                      ]}
                      numberOfLines={3}
                      adjustsFontSizeToFit
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>

          {/* Feedback Explanation Banners */}
          {selectedOption !== null && isCorrectSelected === false && (
            <View style={styles.feedbackBannerWrong}>
              <View style={styles.feedbackIconCircleWrong}>
                <Ionicons name="close" size={20} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.feedbackTitleWrong}>
                  {selectedOption === '__TIMEOUT__' ? 'Time Ran Out!' : 'Incorrect'}
                </Text>
                <Text style={styles.feedbackSubWrong}>
                  {language === 'EN' ? 'Correct answer: ' : 'Tamang sagot: '}
                  <Text style={styles.feedbackCorrectWord}>{currentQ.correct}</Text>
                </Text>
              </View>
            </View>
          )}

          {selectedOption !== null && isCorrectSelected === true && (
            <View style={styles.feedbackBannerCorrect}>
              <View style={styles.feedbackIconCircleCorrect}>
                <Ionicons name="checkmark" size={20} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.feedbackTitleCorrect}>
                  {currentStreak >= 5 ? 'Legendary Streak! 🚀' : currentStreak >= 3 ? 'On Fire! ⚡' : 'Correct! 🎉'}
                </Text>
                <Text style={styles.feedbackSubCorrect}>
                  +{currentStreak >= 5 ? 30 : currentStreak >= 3 ? 20 : currentStreak >= 2 ? 15 : 10} XP
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Session Performance Recap Modal */}
        <Modal
          visible={isRecapModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsRecapModalVisible(false)}
        >
          <View style={styles.recapModalOverlay}>
            <View style={styles.recapModalCard}>
              <LinearGradient colors={['#1E1B4B', '#0F172A']} style={styles.recapModalGradient}>
                
                {/* Trophy Icon & Header */}
                <View style={styles.recapTrophyCircle}>
                  <Ionicons name="trophy" size={44} color="#FBBF24" />
                </View>

                <Text style={styles.recapModalTitle}>
                  {language === 'EN' ? 'Practice Recap' : 'Pagsasanay Buod'}
                </Text>
                <Text style={styles.recapModalSubtitle}>
                  {language === 'EN' ? 'Great progress today, Scholar!' : 'Magandang simula, Mag-aaral!'}
                </Text>

                {/* Performance Stats Grid */}
                <View style={styles.recapStatsGrid}>
                  <View style={styles.recapStatBox}>
                    <Ionicons name="flash" size={22} color="#F59E0B" />
                    <Text style={styles.recapStatValue}>+{sessionXP}</Text>
                    <Text style={styles.recapStatLabel}>XP Earned</Text>
                  </View>

                  <View style={styles.recapStatBox}>
                    <Ionicons name="checkmark-done" size={22} color="#10B981" />
                    <Text style={styles.recapStatValue}>{accuracyRate}%</Text>
                    <Text style={styles.recapStatLabel}>{correctCount}/{answeredCount} Correct</Text>
                  </View>

                  <View style={styles.recapStatBox}>
                    <Ionicons name="flame" size={22} color="#EF4444" />
                    <Text style={styles.recapStatValue}>{maxStreak}x</Text>
                    <Text style={styles.recapStatLabel}>Max Streak</Text>
                  </View>
                </View>

                {/* Modal Action Buttons */}
                <View style={styles.recapActionRow}>
                  <TouchableOpacity 
                    style={styles.recapSecondaryBtn}
                    onPress={handleExitToHome}
                  >
                    <Text style={styles.recapSecondaryBtnText}>
                      {language === 'EN' ? 'Exit' : 'Lumabas'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.recapPrimaryBtn}
                    onPress={() => {
                      setIsRecapModalVisible(false);
                      nextQuestion();
                    }}
                  >
                    <LinearGradient colors={['#D1582D', '#9A3A17']} style={styles.recapPrimaryGradient}>
                      <Text style={styles.recapPrimaryBtnText}>
                        {language === 'EN' ? 'Keep Going' : 'Magpatuloy'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

              </LinearGradient>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </LinearGradient>
  );
}

const SafeAreaView = ({ children, style }: any) => <View style={[{ flex: 1 }, style]}>{children}</View>;

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 10,
  },
  exitButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  comboBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    gap: 6,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  comboBadgeIcon: {
    fontSize: 16,
  },
  comboBadgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#C2410C',
  },
  sessionScorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 5,
  },
  sessionScoreText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#D97706',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    gap: 5,
  },
  scoreText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#334155',
  },
  categoryScrollContainer: {
    paddingVertical: 6,
  },
  categoryRow: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  categoryPillActive: {
    backgroundColor: '#D1582D',
    borderColor: '#C2410C',
  },
  categoryPillText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#64748B',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },
  timerContainer: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginHorizontal: 20,
    marginTop: 6,
    overflow: 'hidden',
  },
  timerFill: {
    height: '100%',
    borderRadius: 3,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  questionHeaderBadge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 8,
  },
  questionHeaderText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#94A3B8',
    letterSpacing: 1.2,
  },
  questionWord: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 26,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
  },
  syllablesChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  syllablesChipText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#C2410C',
  },
  kulitanContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#FAF5EE',
    borderRadius: 18,
    width: '100%',
  },
  verticalWordColumn: {
    marginHorizontal: 12,
    alignItems: 'center',
  },
  kulitanText: {
    fontFamily: 'Kulitan',
    fontSize: 34,
    color: '#D1582D',
    lineHeight: 42,
    textAlign: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 14,
    gap: 10,
  },
  optionGridItem: {
    width: '48%',
  },
  optionButton: {
    backgroundColor: '#FFF',
    paddingVertical: 14,
    paddingHorizontal: 12,
    minHeight: 70,
    borderRadius: 20,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  optionBadge: {
    position: 'absolute',
    top: 6,
    left: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  optionBadgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    color: '#64748B',
  },
  optionCorrect: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
    shadowColor: '#10B981',
  },
  optionWrong: {
    backgroundColor: '#EF4444',
    borderColor: '#DC2626',
    shadowColor: '#EF4444',
  },
  optionText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#334155',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  feedbackBannerWrong: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    marginHorizontal: 20,
    marginTop: 14,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    gap: 12,
  },
  feedbackIconCircleWrong: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackTitleWrong: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#991B1B',
  },
  feedbackSubWrong: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: '#7F1D1D',
  },
  feedbackCorrectWord: {
    fontFamily: 'Poppins_700Bold',
    color: '#065F46',
  },
  feedbackBannerCorrect: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    marginHorizontal: 20,
    marginTop: 14,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    gap: 12,
  },
  feedbackIconCircleCorrect: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackTitleCorrect: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#065F46',
  },
  feedbackSubCorrect: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: '#047857',
  },

  // Recap Modal Styles
  recapModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  recapModalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  recapModalGradient: {
    padding: 24,
    alignItems: 'center',
  },
  recapTrophyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  recapModalTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  recapModalSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 20,
  },
  recapStatsGrid: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 18,
    padding: 12,
    marginBottom: 22,
    justifyContent: 'space-between',
  },
  recapStatBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  recapStatValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 4,
  },
  recapStatLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: '#94A3B8',
  },
  recapActionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  recapSecondaryBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recapSecondaryBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#CBD5E1',
  },
  recapPrimaryBtn: {
    flex: 1.4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  recapPrimaryGradient: {
    paddingVertical: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recapPrimaryBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
