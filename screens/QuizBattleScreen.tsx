import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, Animated, Easing, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { getRandomQuestions } from '../utils/quizQuestions';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type Props = {
  navigation: StackNavigationProp<any, any>;
  route: any;
};

type FloatingEmoji = {
  id: string;
  emoji: string;
  xPosition: number;
};

export default function QuizBattleScreen({ navigation, route }: Props) {
  const { roomId, roomCode, isHost } = route.params;
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [status, setStatus] = useState('waiting'); // waiting, playing, finished
  const [hasShownVsScreen, setHasShownVsScreen] = useState(false);
  
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponentId, setOpponentId] = useState<string | null>(null);
  const [opponentName, setOpponentName] = useState<string>('OPPONENT');
  
  const [isLoading, setIsLoading] = useState(true);
  const [rematchStatus, setRematchStatus] = useState<'none' | 'waiting' | 'accepted'>('none');
  const [opponentWantsRematch, setOpponentWantsRematch] = useState(false);
  const [hasAwardedXP, setHasAwardedXP] = useState(false);
  
  // Animation & Selection State
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrectSelected, setIsCorrectSelected] = useState<boolean | null>(null);
  const [roundWinnerName, setRoundWinnerName] = useState<string | null>(null);

  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const timerAnim = useRef(new Animated.Value(100)).current;
  const cardFloatAnim = useRef(new Animated.Value(0)).current;
  const optionsSlideAnim = useRef(new Animated.Value(50)).current;
  const optionsOpacityAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const broadcastChannelRef = useRef<any>(null);
  
  const myAnswerWrongRef = useRef(false);
  const opponentWrongRef = useRef(false);

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

  useEffect(() => {
    let roomSubscription: any;
    let playersSubscription: any;

    const fetchState = async () => {
      try {
        const { data: room, error: roomError } = await supabase
          .from('quiz_rooms')
          .select('*')
          .eq('id', roomId)
          .single();

        if (roomError) throw roomError;
        
        if (room) {
          if (room.questions) setQuestions(room.questions);
          setCurrentQuestionIndex(room.current_question_index || 0);
          setStatus(room.status || 'waiting');
        }

        const { data: players } = await supabase
          .from('quiz_room_players')
          .select('*')
          .eq('room_id', roomId);
          
        if (players) {
          const me = players.find(p => p.user_id === user?.id);
          const opp = players.find(p => p.user_id !== user?.id);
          if (me) {
            setMyScore(me.score);
            setRematchStatus(me.wants_rematch ? 'waiting' : 'none');
          }
          if (opp) {
            setOpponentScore(opp.score);
            setOpponentId(opp.user_id);
            setOpponentWantsRematch(!!opp.wants_rematch);
            if (opp.player_name) setOpponentName(opp.player_name);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchState();

    roomSubscription = supabase.channel(`quiz_room_${roomId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'quiz_rooms', filter: `id=eq.${roomId}` }, (payload) => {
        const newRecord = payload.new;
        if (newRecord.questions) setQuestions(newRecord.questions);
        if (newRecord.current_question_index !== undefined) setCurrentQuestionIndex(newRecord.current_question_index);
        
        if (newRecord.status !== undefined) {
          if (newRecord.status === 'playing' && status === 'finished') {
             // Reset state for rematch
             setHasShownVsScreen(false);
             setHasAwardedXP(false);
             setRematchStatus('none');
             setOpponentWantsRematch(false);
          }
          setStatus(newRecord.status);
        }
      })
      .subscribe();

    playersSubscription = supabase.channel(`quiz_players_${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quiz_room_players', filter: `room_id=eq.${roomId}` }, async () => {
        const { data: players } = await supabase.from('quiz_room_players').select('*').eq('room_id', roomId);
        if (players) {
          const me = players.find(p => p.user_id === user?.id);
          const opp = players.find(p => p.user_id !== user?.id);
          if (me) {
            setMyScore(me.score);
            setRematchStatus(me.wants_rematch ? 'waiting' : 'none');
          }
          if (opp) {
            setOpponentScore(opp.score);
            setOpponentWantsRematch(!!opp.wants_rematch);
            if (opp.user_id !== opponentId) {
              setOpponentId(opp.user_id);
              if (opp.player_name) setOpponentName(opp.player_name);
            }
          }
        }
      })
      .subscribe();

    // Broadcast channel for emojis
    broadcastChannelRef.current = supabase.channel(`room_broadcast_${roomId}`, {
      config: { broadcast: { self: true } },
    });

    broadcastChannelRef.current
      .on('broadcast', { event: 'emoji' }, (payload: any) => {
        const newEmoji = {
          id: Math.random().toString(),
          emoji: payload.payload.emoji,
          xPosition: Math.random() * 80 + 10,
        };
        setFloatingEmojis((prev) => [...prev, newEmoji]);
        
        setTimeout(() => {
          setFloatingEmojis((prev) => prev.filter(e => e.id !== newEmoji.id));
        }, 2000);
      })
      .on('broadcast', { event: 'round_winner' }, (payload: any) => {
        setRoundWinnerName(payload.payload.name);
      })
      .on('broadcast', { event: 'wrong_answer' }, () => {
        opponentWrongRef.current = true;
        if (isHost && myAnswerWrongRef.current) {
          handleTimeOut();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(roomSubscription);
      supabase.removeChannel(playersSubscription);
      supabase.removeChannel(broadcastChannelRef.current);
    };
  }, [roomId, status]);

  // VS Screen Timer
  useEffect(() => {
    if (status === 'playing' && !hasShownVsScreen && opponentId && questions.length > 0) {
      const timer = setTimeout(() => {
        setHasShownVsScreen(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, hasShownVsScreen, opponentId, questions]);

  // Game Timer (Urgency)
  useEffect(() => {
    if (status === 'playing' && hasShownVsScreen && currentQuestionIndex < questions.length) {
      // Reset selection state
      setSelectedOption(null);
      setIsCorrectSelected(null);
      setRoundWinnerName(null);
      myAnswerWrongRef.current = false;
      opponentWrongRef.current = false;
      
      // Reset entry animations
      optionsSlideAnim.setValue(50);
      optionsOpacityAnim.setValue(0);

      // Start entry animations
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

      // Reset timer animation to 100%
      timerAnim.setValue(100);
      Animated.timing(timerAnim, {
        toValue: 0,
        duration: 10000, // 10 seconds
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();

      // Start Card Floating Animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(cardFloatAnim, { toValue: -8, duration: 1500, useNativeDriver: true }),
          Animated.timing(cardFloatAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ])
      ).start();

      // Only host triggers the timeout update to avoid race conditions
      if (isHost) {
        timerRef.current = setTimeout(() => {
           handleTimeOut();
        }, 10000);
      }

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerAnim.stopAnimation();
        cardFloatAnim.stopAnimation();
      };
    }
  }, [currentQuestionIndex, status, hasShownVsScreen, questions]);

  // Handle XP Awarding when finished
  useEffect(() => {
    if (status === 'finished' && !hasAwardedXP) {
      setHasAwardedXP(true);
      if (myScore > opponentScore) {
        updateProfile({ xp: (profile?.xp || 0) + 50 });
      } else if (myScore < opponentScore) {
        const newXp = Math.max(0, (profile?.xp || 0) - 20);
        updateProfile({ xp: newXp });
      }
    }
  }, [status, myScore, opponentScore, hasAwardedXP]);


  const handleTimeOut = async () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex >= questions.length) {
      await supabase.from('quiz_rooms').update({ status: 'finished' }).eq('id', roomId);
    } else {
      await supabase.from('quiz_rooms').update({ current_question_index: nextIndex }).eq('id', roomId);
    }
  };

  const startGame = async () => {
    await supabase.from('quiz_rooms').update({ status: 'playing', current_question_index: 0 }).eq('id', roomId);
  };

  const handleAnswer = async (selectedOpt: string) => {
    if (status !== 'playing' || selectedOption !== null || roundWinnerName !== null) return;

    const currentQ = questions[currentQuestionIndex];
    const isCorrect = selectedOpt === currentQ.correct;
    
    setSelectedOption(selectedOpt);
    setIsCorrectSelected(isCorrect);
    
    // Clear timeout immediately
    if (isHost && timerRef.current) clearTimeout(timerRef.current);
    timerAnim.stopAnimation();

    if (isCorrect) {
      const myName = profile?.firstName ? profile.firstName.toUpperCase() : 'YOU';
      broadcastChannelRef.current?.send({
        type: 'broadcast',
        event: 'round_winner',
        payload: { name: myName },
      });
      setRoundWinnerName(myName);
    }

    // Wait 800ms to show the red/green feedback before advancing
    setTimeout(async () => {
      if (isCorrect) {
        const newScore = myScore + 10;
        setMyScore(newScore);
        
        const nextIndex = currentQuestionIndex + 1;
        
        if (newScore >= 50 || nextIndex >= questions.length) {
          setStatus('finished');
          await supabase.from('quiz_room_players').update({ score: newScore }).eq('room_id', roomId).eq('user_id', user?.id);
          await supabase.from('quiz_rooms').update({ status: 'finished' }).eq('id', roomId);
        } else {
          setCurrentQuestionIndex(nextIndex);
          await supabase.from('quiz_room_players').update({ score: newScore }).eq('room_id', roomId).eq('user_id', user?.id);
          await supabase.from('quiz_rooms').update({ current_question_index: nextIndex }).eq('id', roomId);
        }
      } else {
        myAnswerWrongRef.current = true;
        broadcastChannelRef.current?.send({ type: 'broadcast', event: 'wrong_answer' });
        
        if (isHost && opponentWrongRef.current) {
          handleTimeOut();
        }
      }
    }, 800);
  };

  const requestRematch = async () => {
    setRematchStatus('waiting');
    await supabase.from('quiz_room_players').update({ wants_rematch: true }).eq('room_id', roomId).eq('user_id', user?.id);

    // If I'm host and opponent already wants it, trigger it
    if (isHost && opponentWantsRematch) {
      triggerRematch();
    }
  };

  // Check if both want rematch (non-host might trigger this when host accepts)
  useEffect(() => {
    if (isHost && rematchStatus === 'waiting' && opponentWantsRematch) {
      triggerRematch();
    }
  }, [rematchStatus, opponentWantsRematch]);

  const triggerRematch = async () => {
    const newQuestions = getRandomQuestions(30);
    
    // Reset scores & rematch flags
    await supabase.from('quiz_room_players').update({ score: 0, wants_rematch: false }).eq('room_id', roomId);
    // Update room
    await supabase.from('quiz_rooms').update({ 
      status: 'playing', 
      current_question_index: 0, 
      questions: newQuestions 
    }).eq('id', roomId);
  };

  const sendEmoji = (emoji: string) => {
    broadcastChannelRef.current?.send({
      type: 'broadcast',
      event: 'emoji',
      payload: { emoji },
    });
  };

  const leaveRoom = () => {
    navigation.goBack();
    if (user) {
      supabase.from('quiz_room_players').delete().eq('room_id', roomId).eq('user_id', user.id).then();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (status === 'waiting') {
    return (
      <LinearGradient colors={['#0B2046', '#1A365D']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <TouchableOpacity onPress={leaveRoom} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.centerContainer}>
            <Text style={styles.waitingTitle}>Waiting for opponent...</Text>
            <Text style={styles.roomCodeText}>Room Code: {roomCode}</Text>
            {opponentId ? (
              <View style={styles.opponentFound}>
                <Ionicons name="checkmark-circle" size={48} color="#10B981" />
                <Text style={styles.opponentText}>Opponent Joined!</Text>
              </View>
            ) : (
              <ActivityIndicator size="large" color="#FFF" style={{ marginTop: 20 }} />
            )}
            
            {isHost && opponentId && (
              <TouchableOpacity style={styles.startButton} onPress={startGame}>
                <Text style={styles.startButtonText}>Start Battle</Text>
              </TouchableOpacity>
            )}
            {!isHost && opponentId && (
              <Text style={styles.waitingHostText}>Waiting for host to start...</Text>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const myName = profile?.firstName ? profile.firstName.toUpperCase() : 'YOU';

  if (status === 'finished') {
    const isWinner = myScore > opponentScore;
    const isTie = myScore === opponentScore;

    return (
      <LinearGradient colors={['#FAF5EE', '#E8DAC9']} style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="trophy" size={80} color={isWinner ? "#F59E0B" : "#94A3B8"} />
          <Text style={[styles.resultTitle, { color: isWinner ? "#F59E0B" : "#0F172A" }]}>
            {isTie ? "It's a Tie!" : (isWinner ? "You Won!" : "You Lost")}
          </Text>
          <Text style={styles.finalScoreText}>Your Score: {myScore}</Text>
          <Text style={styles.finalScoreText}>Opponent Score: {opponentScore}</Text>
          {isWinner && <Text style={styles.xpText}>+50 XP</Text>}
          {!isWinner && !isTie && <Text style={styles.xpTextNegative}>-20 XP</Text>}
          
          <View style={styles.rematchContainer}>
            {rematchStatus === 'none' ? (
              <TouchableOpacity style={styles.rematchButton} onPress={requestRematch}>
                <Ionicons name="refresh" size={20} color="#FFF" />
                <Text style={styles.rematchButtonText}>Rematch</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.waitingHostText}>Waiting for opponent...</Text>
            )}
            {opponentWantsRematch && rematchStatus === 'none' && (
              <Text style={styles.opponentRematchText}>{opponentName} wants a rematch!</Text>
            )}
          </View>

          <TouchableOpacity style={styles.leaveButton} onPress={leaveRoom}>
            <Text style={styles.leaveButtonText}>Back to Lobby</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  if (status === 'playing' && !hasShownVsScreen && opponentId) {
    return (
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
        <View style={styles.vsScreenContainer}>
          <Text style={styles.vsPlayerText} adjustsFontSizeToFit numberOfLines={1}>{myName}</Text>
          <View style={styles.vsBigCircle}>
            <Text style={styles.vsBigText}>VS</Text>
          </View>
          <Text style={styles.vsPlayerText} adjustsFontSizeToFit numberOfLines={1}>{opponentName}</Text>
        </View>
      </LinearGradient>
    );
  }

  const currentQ = questions[currentQuestionIndex];
  if (!currentQ) return null; // Safe guard if questions not loaded

  return (
    <LinearGradient colors={['#FAF5EE', '#E8DAC9']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        {/* Floating Emojis */}
        {floatingEmojis.map((emoji) => (
          <FloatingEmojiComponent key={emoji.id} emoji={emoji.emoji} xPosition={emoji.xPosition} />
        ))}

        {/* Header Scores */}
        <View style={styles.scoreBoard}>
          <View style={[styles.scorePill, styles.myScorePill]}>
            <Text style={styles.scoreLabel} adjustsFontSizeToFit numberOfLines={1}>{myName}</Text>
            <Text style={styles.scoreValue}>{myScore}</Text>
          </View>
          <View style={styles.vsCircle}>
            <Text style={styles.vsText}>VS</Text>
          </View>
          <View style={[styles.scorePill, styles.oppScorePill]}>
            <Text style={styles.scoreLabel} adjustsFontSizeToFit numberOfLines={1}>{opponentName}</Text>
            <Text style={styles.scoreValue}>{opponentScore}</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.timerBarBg}>
            <Animated.View style={[styles.timerBarFill, { 
              width: timerAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
              backgroundColor: timerAnim.interpolate({ inputRange: [0, 30, 100], outputRange: ['#EF4444', '#F59E0B', '#10B981'] })
            }]} />
          </View>
        </View>

        {roundWinnerName && (
          <Animated.View style={styles.winnerBanner}>
            <Ionicons name="flash" size={24} color="#F59E0B" />
            <Text style={styles.winnerBannerText}>{roundWinnerName} got it!</Text>
          </Animated.View>
        )}

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Question Area */}
          <Animated.View style={[styles.questionCard, { transform: [{ translateY: cardFloatAnim }] }]}>
            <Text style={styles.questionLabel}>What does this mean?</Text>
            <Text style={styles.kapampanganWord}>{currentQ.kapampangan}</Text>
            
            <View style={styles.kulitanContainer}>
              {getKulitanSyllables(currentQ.kapampangan).map((syllables, index) => (
                <View key={index} style={styles.verticalWordColumn}>
                  <Text style={styles.kulitanText}>{syllables.join('\n')}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {currentQ.options.map((opt: string, i: number) => {
              const isSelected = selectedOption === opt;
              const isCorrect = isSelected && isCorrectSelected;
              const isWrong = isSelected && !isCorrectSelected;

              return (
                <Animated.View 
                  key={i}
                  style={{
                    opacity: optionsOpacityAnim,
                    transform: [{ translateY: optionsSlideAnim }]
                  }}
                >
                  <TouchableOpacity 
                    style={[
                      styles.optionButton,
                      isCorrect && styles.optionCorrect,
                      isWrong && styles.optionWrong
                    ]}
                    onPress={() => handleAnswer(opt)}
                    activeOpacity={0.7}
                    disabled={selectedOption !== null || roundWinnerName !== null}
                  >
                    <Text style={[
                      styles.optionText,
                      (isCorrect || isWrong) && styles.optionTextSelected
                    ]}>{opt}</Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </ScrollView>

        {/* Emoji Bar */}
        <View style={styles.emojiBar}>
          {['🔥', '🤯', '😭', '😡'].map(emoji => (
            <TouchableOpacity key={emoji} onPress={() => sendEmoji(emoji)} style={styles.emojiBtn}>
              <Text style={styles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}

const FloatingEmojiComponent = ({ emoji, xPosition }: { emoji: string, xPosition: number }) => {
  const animY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const animOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animY, {
        toValue: SCREEN_HEIGHT / 2,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(animOpacity, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.Text style={[styles.floatingEmoji, { left: `${xPosition}%`, transform: [{ translateY: animY }], opacity: animOpacity }]}>
      {emoji}
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  backButton: { position: 'absolute', top: 50, left: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  waitingTitle: { fontFamily: 'Poppins_700Bold', fontSize: 24, color: '#FFF', marginBottom: 10 },
  roomCodeText: { fontFamily: 'Poppins_500Medium', fontSize: 18, color: '#93C5FD', letterSpacing: 2 },
  opponentFound: { alignItems: 'center', marginTop: 40 },
  opponentText: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#10B981', marginTop: 10 },
  startButton: { backgroundColor: '#3B82F6', paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30, marginTop: 50 },
  startButtonText: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#FFF' },
  waitingHostText: { fontFamily: 'Poppins_400Regular', fontSize: 16, color: '#94A3B8', marginTop: 20 },
  resultTitle: { fontFamily: 'Poppins_700Bold', fontSize: 32, marginVertical: 20 },
  finalScoreText: { fontFamily: 'Poppins_500Medium', fontSize: 18, color: '#475569', marginBottom: 10 },
  xpText: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: '#10B981', marginTop: 10 },
  xpTextNegative: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: '#EF4444', marginTop: 10 },
  rematchContainer: { marginTop: 40, alignItems: 'center', minHeight: 80 },
  rematchButton: { flexDirection: 'row', backgroundColor: '#3B82F6', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 20, alignItems: 'center', gap: 10 },
  rematchButtonText: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#FFF' },
  opponentRematchText: { fontFamily: 'Poppins_500Medium', color: '#3B82F6', marginTop: 10 },
  leaveButton: { backgroundColor: '#0F172A', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 20, marginTop: 20 },
  leaveButtonText: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#FFF' },
  scoreBoard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, zIndex: 1 },
  scorePill: { flex: 1, paddingVertical: 12, borderRadius: 16, alignItems: 'center' },
  myScorePill: { backgroundColor: '#DBEAFE' },
  oppScorePill: { backgroundColor: '#FEE2E2' },
  scoreLabel: { fontFamily: 'Poppins_500Medium', fontSize: 12, color: '#64748B' },
  scoreValue: { fontFamily: 'Poppins_700Bold', fontSize: 24, color: '#0F172A' },
  vsCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center', marginHorizontal: 15 },
  vsText: { fontFamily: 'Poppins_700Bold', fontSize: 14, color: '#FFF' },
  progressContainer: { paddingHorizontal: 20, marginBottom: 20 },
  timerBarBg: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  timerBarFill: { height: '100%', borderRadius: 4 },
  questionCard: { 
    marginHorizontal: 20, 
    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
    borderRadius: 30, 
    padding: 30, 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 15 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 30, 
    elevation: 8, 
    marginBottom: 30, 
    zIndex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  questionLabel: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  kapampanganWord: { fontFamily: 'Poppins_700Bold', fontSize: 28, color: '#0F172A', textAlign: 'center', marginBottom: 20 },
  kulitanContainer: { flexDirection: 'row-reverse', justifyContent: 'center', gap: 20 },
  verticalWordColumn: { alignItems: 'center' },
  kulitanText: { fontFamily: 'Kulitan', fontSize: 40, color: '#3B82F6', lineHeight: 50 },
  optionsContainer: { paddingHorizontal: 20, gap: 14, zIndex: 1 },
  optionButton: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    paddingVertical: 18, 
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  optionCorrect: {
    backgroundColor: '#10B981',
    borderWidth: 0,
    shadowColor: '#10B981',
    shadowOpacity: 0.4,
  },
  optionWrong: {
    backgroundColor: '#EF4444',
    borderWidth: 0,
    shadowColor: '#EF4444',
    shadowOpacity: 0.4,
  },
  optionText: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#334155', textAlign: 'center' },
  optionTextSelected: {
    color: '#FFF',
  },
  emojiBar: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 'auto', marginBottom: 20, zIndex: 2 },
  emojiBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  emojiText: { fontSize: 24 },
  floatingEmoji: { position: 'absolute', fontSize: 40, zIndex: 0 },
  vsScreenContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  vsPlayerText: { fontFamily: 'Poppins_700Bold', fontSize: 48, color: '#FFF', textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 10, marginVertical: 40 },
  vsBigCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center', shadowColor: '#EF4444', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 20, elevation: 10 },
  vsBigText: { fontFamily: 'Poppins_700Bold', fontSize: 40, color: '#FFF' },
  winnerBanner: { flexDirection: 'row', backgroundColor: '#FFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 30, position: 'absolute', top: 120, alignSelf: 'center', zIndex: 10, shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5, alignItems: 'center', gap: 10 },
  winnerBannerText: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: '#0F172A' },
});
