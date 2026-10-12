import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Platform, Dimensions, ScrollView, Modal, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StackNavigationProp } from '@react-navigation/stack';
import { getRandomQuestions, QuestionCategory, QuizQuestion } from '../utils/quizQuestions';
import { useProfile } from '../context/ProfileContext';
import { useLanguage } from '../context/LanguageContext';
import { useQuest } from '../context/QuestContext';
import KulitanGlyph from '../components/KulitanGlyph';
import { BackgroundImages } from '../constants/backgrounds';
import HeritageCornerOrnament from '../components/HeritageCornerOrnament';

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
    <View style={styles.container}>
      {/* AUTHENTIC HERITAGE BACKGROUND */}
      <Image 
        source={BackgroundImages.soloPractice} 
        style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} 
        resizeMode="cover" 
      />

      {/* MOUNT ARAYAT & SUN SCENIC HEADER ILLUSTRATION MATCHING MOCKUP */}
      <Image 
        source={BackgroundImages.mountArayat} 
        style={styles.mountArayatIllustration} 
        resizeMode="contain" 
      />

      <SafeAreaView style={styles.safeArea}>
        
        {/* HEADER BAR MATCHING MOCKUP */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleOpenRecap} style={styles.exitButton} activeOpacity={0.75}>
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </TouchableOpacity>

          {/* CENTER TERRACOTTA CAPSULE BADGE MATCHING MOCKUP */}
          <View style={styles.headerCapsuleBadge}>
            <Ionicons name="flash" size={13} color="#A94828" style={{ marginRight: 4 }} />
            <Text style={styles.headerCapsuleText}>
              {currentStreak >= 2 ? `${currentStreak}x COMBO` : `${sessionXP} XP`}
            </Text>
            <View style={styles.headerCapsuleDivider} />
            <Ionicons name="star" size={13} color="#D97706" style={{ marginRight: 4 }} />
            <Text style={styles.headerCapsuleScoreText}>{score}</Text>
          </View>

          {/* Right layout spacer so center capsule stays balanced */}
          <View style={styles.headerRightSpacer} />
        </View>

        {/* CATEGORY SELECTOR CAPSULES (4 PILLS MATCHING MOCKUP) */}
        <View style={styles.categoryContainer}>
          <View style={styles.categoryRow}>
            {categories.map(cat => {
              const isActive = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryCapsule, isActive && styles.categoryCapsuleActive]}
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.selectionAsync();
                    if (selectedCategory !== cat.id) {
                      startPractice(cat.id);
                    }
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.categoryCapsuleText, isActive && styles.categoryCapsuleTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* THIN HORIZONTAL PROGRESS / TIMER BAR MATCHING MOCKUP */}
        <View style={styles.progressBarTrack}>
          <Animated.View style={[
            styles.progressBarFill,
            {
              width: timerAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
            }
          ]} />
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* MAIN QUESTION BENTO CARD MATCHING MOCKUP */}
          <Animated.View style={[styles.questionCard, { transform: [{ translateY: cardFloatAnim }] }]}>
            <HeritageCornerOrnament position="topRight" />

            {/* TOP PILL BADGE INSIDE CARD */}
            <View style={styles.questionCategoryPill}>
              <Ionicons name="sparkles" size={11} color="#A94828" style={{ marginRight: 5 }} />
              <Text style={styles.questionCategoryPillText}>
                {currentQ.category === 'basics' 
                  ? (language === 'EN' ? 'IDENTIFY GLYPH' : 'KILALANIN ANG TITIK')
                  : currentQ.category === 'kudlits'
                  ? (language === 'EN' ? 'GARLIT DIACRITIC' : 'PANUNTUNAN NG GARLIT')
                  : (language === 'EN' ? 'WORD TRANSLATION' : 'SALITA AT KAHULUGAN')}
              </Text>
            </View>

            {/* LARGE CENTER MEDALLION CIRCLE WITH TERRACOTTA OUTLINE */}
            <View style={styles.centerMedallionCircle}>
              {currentQ.category === 'words' ? (
                <View style={styles.kulitanWordWrap}>
                  <Text style={styles.wordLatinText}>{currentQ.kapampangan}</Text>
                  <View style={styles.verticalWordRow}>
                    {getKulitanSyllables(currentQ.kapampangan).map((syllables, index) => (
                      <View key={index} style={styles.verticalWordCol}>
                        {syllables.map((syl: string, sIdx: number) => (
                          <KulitanGlyph key={sIdx} symbol={syl} size={34} color="#A94828" strokeWidth={3.4} />
                        ))}
                      </View>
                    ))}
                  </View>
                </View>
              ) : (
                <KulitanGlyph 
                  symbol={currentQ.kapampangan} 
                  size={96} 
                  color="#A94828" 
                  strokeWidth={4.5} 
                />
              )}
            </View>

            {/* BOTTOM PILL BADGE INSIDE CARD */}
            <View style={styles.questionCluePill}>
              <Text style={styles.questionClueText}>
                {currentQ.syllables 
                  ? (language === 'EN' ? `Syllable: "${currentQ.syllables}"` : `Pantig: "${currentQ.syllables}"`)
                  : (language === 'EN' ? 'Choose the matching answer below:' : 'Piliin ang tamang sagot sa ibaba:')}
              </Text>
            </View>
          </Animated.View>

          {/* 2x2 OPTIONS BENTO GRID MATCHING MOCKUP */}
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
                    activeOpacity={0.75}
                    disabled={selectedOption !== null}
                  >
                    {/* SOLID CARAMEL/TERRACOTTA CIRCLE BADGE ON LEFT */}
                    <View style={[
                      styles.optionCircleBadge,
                      isGreen && styles.optionCircleBadgeCorrect,
                      isRed && styles.optionCircleBadgeWrong
                    ]}>
                      <Text style={styles.optionCircleBadgeText}>
                        {isGreen ? '✓' : isRed ? '✗' : ['A', 'B', 'C', 'D'][index]}
                      </Text>
                    </View>

                    {/* OPTION TEXT ON RIGHT */}
                    <Text 
                      style={[
                        styles.optionText,
                        (isGreen || isRed) && styles.optionTextActive
                      ]}
                      numberOfLines={2}
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
              <View style={styles.recapModalContent}>
                
                {/* Trophy Icon & Header */}
                <View style={styles.recapTrophyCircle}>
                  <Ionicons name="trophy" size={38} color="#D1582D" />
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
                    <Ionicons name="flash" size={20} color="#A94828" />
                    <Text style={styles.recapStatValue}>+{sessionXP}</Text>
                    <Text style={styles.recapStatLabel}>XP Earned</Text>
                  </View>

                  <View style={styles.recapStatBox}>
                    <Ionicons name="checkmark-done" size={20} color="#10B981" />
                    <Text style={styles.recapStatValue}>{accuracyRate}%</Text>
                    <Text style={styles.recapStatLabel}>{correctCount}/{answeredCount} Correct</Text>
                  </View>

                  <View style={styles.recapStatBox}>
                    <Ionicons name="flame" size={20} color="#EF4444" />
                    <Text style={styles.recapStatValue}>{maxStreak}x</Text>
                    <Text style={styles.recapStatLabel}>Max Streak</Text>
                  </View>
                </View>

                {/* Modal Action Buttons */}
                <View style={styles.recapActionRow}>
                  <TouchableOpacity 
                    style={styles.recapSecondaryBtn}
                    onPress={handleExitToHome}
                    activeOpacity={0.75}
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
                    activeOpacity={0.85}
                  >
                    <Text style={styles.recapPrimaryBtnText}>
                      {language === 'EN' ? 'Keep Going' : 'Magpatuloy'}
                    </Text>
                  </TouchableOpacity>
                </View>

              </View>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </View>
  );
}

const SafeAreaView = ({ children, style }: any) => <View style={[{ flex: 1 }, style]}>{children}</View>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEDEC8',
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
  },
  mountArayatIllustration: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 42 : 24,
    right: -4,
    width: 220,
    height: 90,
    opacity: 0.95,
    zIndex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 44 : 28,
    paddingBottom: 8,
    zIndex: 10,
  },
  exitButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: '#EDE3D8',
  },
  headerCapsuleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#A94828',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  headerCapsuleText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#A94828',
  },
  headerCapsuleDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#D6C8B8',
    marginHorizontal: 8,
  },
  headerCapsuleScoreText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#D97706',
  },
  headerRightSpacer: {
    width: 42,
    height: 42,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 8,
    zIndex: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  categoryCapsule: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1.5,
    borderColor: '#EDE3D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCapsuleActive: {
    backgroundColor: '#A94828',
    borderColor: '#A94828',
    shadowColor: '#A94828',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  categoryCapsuleText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11.5,
    color: '#6E5D4F',
  },
  categoryCapsuleTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
  },
  progressBarTrack: {
    height: 5,
    backgroundColor: 'rgba(169, 72, 40, 0.15)',
    borderRadius: 3,
    marginHorizontal: 20,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#A94828',
    borderRadius: 3,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EDE3D8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    position: 'relative',
  },
  questionCategoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1EE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginBottom: 12,
  },
  questionCategoryPillText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9.5,
    color: '#A94828',
    letterSpacing: 0.8,
  },
  centerMedallionCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFDFB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#A94828',
    shadowColor: '#A94828',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 14,
  },
  questionCluePill: {
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EDE3D8',
    width: '100%',
    alignItems: 'center',
  },
  questionClueText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#6E5D4F',
    textAlign: 'center',
  },
  kulitanWordWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordLatinText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 4,
  },
  verticalWordRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    gap: 8,
  },
  verticalWordCol: {
    alignItems: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 12,
    gap: 10,
  },
  optionGridItem: {
    width: '48.5%',
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 10,
    minHeight: 68,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#EDE3D8',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  optionCircleBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#A94828',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  optionCircleBadgeCorrect: {
    backgroundColor: '#10B981',
  },
  optionCircleBadgeWrong: {
    backgroundColor: '#EF4444',
  },
  optionCircleBadgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  optionText: {
    flex: 1,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#1E1B18',
    lineHeight: 18,
  },
  optionTextActive: {
    color: '#0F172A',
  },
  optionCorrect: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  optionWrong: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  feedbackBannerWrong: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    marginHorizontal: 20,
    marginTop: 12,
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
    marginTop: 12,
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EDE3D8',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  recapModalContent: {
    padding: 24,
    alignItems: 'center',
  },
  recapTrophyCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFF1EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FED7AA',
  },
  recapModalTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    color: '#0F172A',
    marginBottom: 2,
  },
  recapModalSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  recapStatsGrid: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#FAF5EE',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EDE3D8',
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
    fontSize: 17,
    color: '#0F172A',
    marginTop: 4,
  },
  recapStatLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10.5,
    color: '#64748B',
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
    backgroundColor: '#FAF5EE',
    borderWidth: 1.5,
    borderColor: '#EDE3D8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recapSecondaryBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#64748B',
  },
  recapPrimaryBtn: {
    flex: 1.3,
    borderRadius: 16,
    backgroundColor: '#A94828',
    paddingVertical: 13,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#A94828',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  recapPrimaryBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
