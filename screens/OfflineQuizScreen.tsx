import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Platform, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StackNavigationProp } from '@react-navigation/stack';
import { getRandomQuestions } from '../utils/quizQuestions';
import { useProfile } from '../context/ProfileContext';
import { useLanguage } from '../context/LanguageContext';

type OfflineQuizScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

const { width } = Dimensions.get('window');

export default function OfflineQuizScreen({ navigation }: OfflineQuizScreenProps) {
  const { addXP } = useProfile();
  const { t } = useLanguage();
  const [currentQ, setCurrentQ] = useState<any>(null);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<'playing' | 'finished'>('playing');

  // Animation & Selection State
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrectSelected, setIsCorrectSelected] = useState<boolean | null>(null);

  const timerAnim = useRef(new Animated.Value(100)).current;
  const cardFloatAnim = useRef(new Animated.Value(0)).current;
  const optionsSlideAnim = useRef(new Animated.Value(50)).current;
  const optionsOpacityAnim = useRef(new Animated.Value(0)).current;

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Parse Kulitan
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

  const startGame = () => {
    setCurrentQ(getRandomQuestions(1)[0]);
    setScore(0);
    setStatus('playing');
  };

  useEffect(() => {
    startGame();
  }, []);

  // Floating Card Animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(cardFloatAnim, {
          toValue: -10,
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

  // Game Timer (Urgency) & Animations
  useEffect(() => {
    if (status === 'playing' && currentQ) {
      // Reset selection state
      setSelectedOption(null);
      setIsCorrectSelected(null);
      
      // Reset entry animations
      optionsSlideAnim.setValue(50);
      optionsOpacityAnim.setValue(0);
      
      // Play entry animations
      Animated.parallel([
        Animated.spring(optionsSlideAnim, {
          toValue: 0,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(optionsOpacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        })
      ]).start();

      timerAnim.setValue(100);
      
      Animated.timing(timerAnim, {
        toValue: 0,
        duration: 10000, // 10 seconds
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
    if (status !== 'playing') return;
    
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    
    // Endless mode: just give a new question
    setCurrentQ(getRandomQuestions(1)[0]);
  };

  const handleAnswer = (selectedOpt: string) => {
    if (status !== 'playing' || selectedOption !== null) return;

    const isCorrect = selectedOpt === currentQ.correct;
    
    setSelectedOption(selectedOpt);
    setIsCorrectSelected(isCorrect);
    
    if (timerRef.current) clearTimeout(timerRef.current);
    timerAnim.stopAnimation();

    setTimeout(() => {
      if (isCorrect) {
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const newScore = score + 10;
        setScore(newScore);
        
        setCurrentQ(getRandomQuestions(1)[0]);
      } else {
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setCurrentQ(getRandomQuestions(1)[0]);
      }
    }, 800);
  };

  const leaveRoom = () => {
    if (score > 0 && status === 'playing') {
      // Award XP when leaving endless mode manually
      addXP(score);
    }
    navigation.goBack();
  };

  if (status === 'finished') {
    return (
      <LinearGradient colors={['#FAF5EE', '#E8DAC9']} style={styles.container}>
        <View style={styles.centerContainer}>
        {/* Finished State inside the endless logic isn't used much anymore, but keep for safety */}
        {status === 'finished' && (
          <View style={styles.finishedContainer}>
            <Ionicons name="trophy" size={80} color="#FBBF24" />
            <Text style={styles.finishedTitle}>{t('practice_complete')}</Text>
            <Text style={styles.finalScoreText}>{t('score')}: {score}</Text>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={leaveRoom}
            >
              <Text style={styles.actionButtonText}>{t('back')}</Text>
            </TouchableOpacity>
          </View>
        )}
        </View>
      </LinearGradient>
    );
  }

  if (!currentQ) return null;

  return (
    <LinearGradient colors={['#E2E8F0', '#CBD5E1']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={leaveRoom} style={styles.exitButton}>
              <Ionicons name="close" size={28} color="#64748B" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('solo_practice')}</Text>
          </View>
          <View style={styles.scoreContainer}>
            <Ionicons name="star" size={20} color="#FBBF24" />
            <Text style={styles.scoreText}>{score}</Text>
          </View>
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
          {/* Question Area */}
          <Animated.View style={[styles.questionCard, { transform: [{ translateY: cardFloatAnim }] }]}>
            <Text style={styles.questionLabel}>{t('what_does_this_mean')}</Text>
            <Text style={styles.questionWord}>{currentQ.kapampangan}</Text>
            
            <View style={styles.kulitanContainer}>
              {getKulitanSyllables(currentQ.kapampangan).map((syllables, index) => (
                <View key={index} style={styles.verticalWordColumn}>
                  <Text style={styles.kulitanText}>{syllables.join('\n')}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Options in 2x2 Grid */}
          <View style={styles.optionsGrid}>
            {currentQ.options.map((opt: string, index: number) => {
              const isSelected = selectedOption === opt;
              const isCorrect = isSelected && isCorrectSelected === true;
              const isWrong = isSelected && isCorrectSelected === false;
              
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
                      isCorrect && styles.optionCorrect,
                      isWrong && styles.optionWrong
                    ]}
                    onPress={() => handleAnswer(opt)}
                    activeOpacity={0.7}
                    disabled={selectedOption !== null}
                  >
                    <View style={[styles.optionBadge, (isCorrect || isWrong) && styles.optionBadgeActive]}>
                      <Text style={[styles.optionBadgeText, (isCorrect || isWrong) && { color: '#FFF' }]}>
                        {['A', 'B', 'C', 'D'][index]}
                      </Text>
                    </View>
                    <Text 
                      style={[
                        styles.optionText,
                        (isCorrect || isWrong) && { color: '#FFF' }
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
        </ScrollView>

      </SafeAreaView>
    </LinearGradient>
  );
}

// Minimal SafeAreaView for non-Expo apps if needed
const SafeAreaView = ({ children, style }: any) => <View style={[{ flex: 1 }, style]}>{children}</View>;

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: '#0F172A', marginLeft: 10 },
  exitButton: { padding: 10 },
  scoreContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, gap: 6 },
  scoreText: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#334155' },
  timerContainer: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, marginHorizontal: 20, marginTop: 20, overflow: 'hidden', flexShrink: 0 },
  timerFill: { height: '100%', borderRadius: 4 },
  scrollContent: { flexGrow: 1, justifyContent: 'space-between', paddingBottom: 20 },
  questionCard: { backgroundColor: 'rgba(255, 255, 255, 0.95)', marginHorizontal: 16, marginTop: 16, borderRadius: 24, paddingVertical: 16, paddingHorizontal: 20, alignItems: 'center', shadowColor: '#64748B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)', flexShrink: 0 },
  questionLabel: { fontFamily: 'Poppins_500Medium', fontSize: 12, color: '#94A3B8', letterSpacing: 1.5, marginBottom: 6, textTransform: 'uppercase' },
  questionWord: { fontFamily: 'Poppins_700Bold', fontSize: 24, color: '#0F172A', textAlign: 'center', marginBottom: 10 },
  kulitanContainer: { flexDirection: 'row-reverse', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#F8FAFC', borderRadius: 16, width: '100%' },
  verticalWordColumn: { marginHorizontal: 10, alignItems: 'center' },
  kulitanText: { fontFamily: 'Kulitan', fontSize: 32, color: '#2563EB', lineHeight: 40, textAlign: 'center' },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 16, gap: 10 },
  optionGridItem: { width: '48%' },
  optionButton: { backgroundColor: '#FFF', paddingVertical: 14, paddingHorizontal: 12, minHeight: 64, borderRadius: 20, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3, justifyContent: 'center', alignItems: 'center', position: 'relative', borderWidth: 1.5, borderColor: '#E2E8F0' },
  optionBadge: { position: 'absolute', top: 6, left: 8, width: 20, height: 20, borderRadius: 10, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  optionBadgeActive: { backgroundColor: 'rgba(255, 255, 255, 0.3)' },
  optionBadgeText: { fontFamily: 'Poppins_700Bold', fontSize: 10, color: '#64748B' },
  optionCorrect: { backgroundColor: '#10B981', borderColor: '#059669', shadowColor: '#10B981' },
  optionWrong: { backgroundColor: '#EF4444', borderColor: '#DC2626', shadowColor: '#EF4444' },
  optionText: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#334155', textAlign: 'center', marginTop: 4 },
  resultTitle: { fontFamily: 'Poppins_700Bold', fontSize: 40, marginTop: 20, marginBottom: 10 },
  finishedContainer: { alignItems: 'center', padding: 20, backgroundColor: '#FFF', borderRadius: 20, elevation: 5 },
  finishedTitle: { fontFamily: 'Poppins_700Bold', fontSize: 24, color: '#FBBF24', marginVertical: 10 },
  finalScoreText: { fontFamily: 'Poppins_600SemiBold', fontSize: 24, color: '#334155', marginBottom: 10 },
  xpText: { fontFamily: 'Poppins_700Bold', fontSize: 28, color: '#10B981' },
  actionButton: { flexDirection: 'row', backgroundColor: '#3B82F6', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 30, alignItems: 'center', gap: 10, shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  actionButtonText: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#FFF' },
});
