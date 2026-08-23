import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, Animated, Easing, Dimensions, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StackNavigationProp } from '@react-navigation/stack';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { useLanguage } from '../context/LanguageContext';
import { getRandomQuestions } from '../utils/quizQuestions';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

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
  const { roomId, roomCode, isHost } = route?.params || {};
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { t, language } = useLanguage();
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [status, setStatus] = useState('waiting'); // waiting, playing, finished
  const [hasShownVsScreen, setHasShownVsScreen] = useState(false);
  const [vsCountdown, setVsCountdown] = useState(3);
  
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponentId, setOpponentId] = useState<string | null>(null);
  const [opponentName, setOpponentName] = useState<string>('OPPONENT');
  const [opponentAvatar, setOpponentAvatar] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [rematchStatus, setRematchStatus] = useState<'none' | 'waiting' | 'accepted'>('none');
  const [opponentWantsRematch, setOpponentWantsRematch] = useState(false);
  const [hasAwardedXP, setHasAwardedXP] = useState(false);
  
  // Animation & Selection State
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrectSelected, setIsCorrectSelected] = useState<boolean | null>(null);
  const [roundWinnerName, setRoundWinnerName] = useState<string | null>(null);
  const [speedBonusGained, setSpeedBonusGained] = useState(false);

  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const timerAnim = useRef(new Animated.Value(100)).current;
  const cardFloatAnim = useRef(new Animated.Value(0)).current;
  const optionsSlideAnim = useRef(new Animated.Value(50)).current;
  const optionsOpacityAnim = useRef(new Animated.Value(0)).current;
  const tugAnim = useRef(new Animated.Value(0.5)).current;

  // Question start timestamp for speed bonus calculation
  const questionStartTimeRef = useRef<number>(Date.now());

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
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

  // Update Tug of war animation when scores change
  useEffect(() => {
    const total = myScore + opponentScore;
    let target = 0.5;
    if (total > 0) {
      target = myScore / total;
      // Clamp between 0.15 and 0.85 for visual balance
      target = Math.min(0.85, Math.max(0.15, target));
    }
    Animated.spring(tugAnim, {
      toValue: target,
      friction: 6,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [myScore, opponentScore]);

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

    // Broadcast channel for live emojis and signals
    broadcastChannelRef.current = supabase.channel(`room_broadcast_${roomId}`, {
      config: { broadcast: { self: true } },
    });

    broadcastChannelRef.current
      .on('broadcast', { event: 'emoji' }, (payload: any) => {
        const newEmoji = {
          id: Math.random().toString(),
          emoji: payload.payload.emoji,
          xPosition: Math.random() * 75 + 12,
        };
        setFloatingEmojis((prev) => [...prev, newEmoji]);
        
        setTimeout(() => {
          setFloatingEmojis((prev) => prev.filter(e => e.id !== newEmoji.id));
        }, 2200);
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

  // VS Screen Countdown Timer
  useEffect(() => {
    if (status === 'playing' && !hasShownVsScreen && opponentId && questions.length > 0) {
      setVsCountdown(3);
      const interval = setInterval(() => {
        setVsCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setHasShownVsScreen(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status, hasShownVsScreen, opponentId, questions]);

  // Game Timer (Urgency)
  useEffect(() => {
    if (status === 'playing' && hasShownVsScreen && currentQuestionIndex < questions.length) {
      setSelectedOption(null);
      setIsCorrectSelected(null);
      setRoundWinnerName(null);
      setSpeedBonusGained(false);
      myAnswerWrongRef.current = false;
      opponentWrongRef.current = false;
      questionStartTimeRef.current = Date.now();
      
      optionsSlideAnim.setValue(45);
      optionsOpacityAnim.setValue(0);

      Animated.parallel([
        Animated.spring(optionsSlideAnim, {
          toValue: 0,
          friction: 6,
          tension: 42,
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

      Animated.loop(
        Animated.sequence([
          Animated.timing(cardFloatAnim, { toValue: -6, duration: 1600, useNativeDriver: true }),
          Animated.timing(cardFloatAnim, { toValue: 0, duration: 1600, useNativeDriver: true }),
        ])
      ).start();

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

  // Handle XP and Elo Awarding when finished
  useEffect(() => {
    if (status === 'finished' && !hasAwardedXP) {
      setHasAwardedXP(true);
      if (myScore > opponentScore) {
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        updateProfile({ 
          xp: (profile?.xp || 0) + 60,
          eloRating: (profile?.eloRating || 1000) + 25 
        });
      } else if (myScore < opponentScore) {
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        const newXp = Math.max(0, (profile?.xp || 0) - 15);
        const newElo = Math.max(0, (profile?.eloRating || 1000) - 20);
        updateProfile({ xp: newXp, eloRating: newElo });
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
    const elapsedSeconds = (Date.now() - questionStartTimeRef.current) / 1000;
    const isFast = elapsedSeconds <= 3.0;
    
    setSelectedOption(selectedOpt);
    setIsCorrectSelected(isCorrect);
    
    if (isHost && timerRef.current) clearTimeout(timerRef.current);
    timerAnim.stopAnimation();

    if (isCorrect) {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      const myName = profile?.firstName ? profile.firstName.toUpperCase() : 'YOU';
      broadcastChannelRef.current?.send({
        type: 'broadcast',
        event: 'round_winner',
        payload: { name: myName },
      });
      setRoundWinnerName(myName);
      if (isFast) setSpeedBonusGained(true);
    } else {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setTimeout(async () => {
      if (isCorrect) {
        // Point reward with speed bonus (+15 for <3s, +10 standard)
        const earnedPoints = isFast ? 15 : 10;
        const newScore = myScore + earnedPoints;
        setMyScore(newScore);
        
        const nextIndex = currentQuestionIndex + 1;
        
        if (newScore >= 60 || nextIndex >= questions.length) {
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
    }, 850);
  };

  const requestRematch = async () => {
    setRematchStatus('waiting');
    await supabase.from('quiz_room_players').update({ wants_rematch: true }).eq('room_id', roomId).eq('user_id', user?.id);

    if (isHost && opponentWantsRematch) {
      triggerRematch();
    }
  };

  useEffect(() => {
    if (isHost && rematchStatus === 'waiting' && opponentWantsRematch) {
      triggerRematch();
    }
  }, [rematchStatus, opponentWantsRematch]);

  const triggerRematch = async () => {
    const newQuestions = getRandomQuestions(30);
    await supabase.from('quiz_room_players').update({ score: 0, wants_rematch: false }).eq('room_id', roomId);
    await supabase.from('quiz_rooms').update({ 
      status: 'playing', 
      current_question_index: 0, 
      questions: newQuestions 
    }).eq('id', roomId);
  };

  const sendEmoji = (emoji: string) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
        <ActivityIndicator size="large" color="#D1582D" />
      </View>
    );
  }

  // Waiting Room View
  if (status === 'waiting') {
    return (
      <LinearGradient colors={['#0F172A', '#1E1B4B']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <TouchableOpacity onPress={leaveRoom} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.centerContainer}>
            <View style={styles.roomCodeBadge}>
              <Text style={styles.roomCodeLabel}>ROOM CODE</Text>
              <Text style={styles.roomCodeValue}>{roomCode}</Text>
            </View>

            <Text style={styles.waitingTitle}>
              {language === 'EN' ? 'Waiting for opponent...' : 'Naghihintay sa kalaban...'}
            </Text>

            {opponentId ? (
              <View style={styles.opponentFoundCard}>
                <View style={styles.oppAvatarCircle}>
                  <Ionicons name="person" size={28} color="#10B981" />
                </View>
                <Text style={styles.opponentFoundText}>{opponentName} has joined!</Text>
              </View>
            ) : (
              <ActivityIndicator size="large" color="#F59E0B" style={{ marginTop: 24 }} />
            )}
            
            {isHost && opponentId && (
              <TouchableOpacity style={styles.startButton} onPress={startGame} activeOpacity={0.8}>
                <LinearGradient colors={['#D1582D', '#9A3A17']} style={styles.startBtnGradient}>
                  <Ionicons name="flash" size={20} color="#FFF" />
                  <Text style={styles.startButtonText}>
                    {language === 'EN' ? 'Start Battle' : 'Simulan ang Laban'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            {!isHost && opponentId && (
              <Text style={styles.waitingHostText}>
                {language === 'EN' ? 'Waiting for host to start...' : 'Naghihintay sa host...'}
              </Text>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const myName = profile?.firstName ? profile.firstName.toUpperCase() : 'YOU';

  // Match Finished Results Screen
  if (status === 'finished') {
    const isWinner = myScore > opponentScore;
    const isTie = myScore === opponentScore;

    return (
      <LinearGradient colors={['#0F172A', '#1E1B4B']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.resultContainer}>
            
            {/* Trophy or Shield Icon */}
            <View style={[styles.resultIconCircle, isWinner ? styles.winCircle : styles.lossCircle]}>
              <Ionicons 
                name={isWinner ? "trophy" : isTie ? "ribbon" : "shield-half"} 
                size={54} 
                color={isWinner ? "#F59E0B" : isTie ? "#38BDF8" : "#94A3B8"} 
              />
            </View>

            <Text style={[styles.resultTitle, { color: isWinner ? "#F59E0B" : isTie ? "#38BDF8" : "#E2E8F0" }]}>
              {isTie ? "It's a Draw!" : (isWinner ? "VICTORY!" : "DEFEAT")}
            </Text>
            
            <Text style={styles.resultSubtitle}>
              {isWinner ? "Outstanding mastery in Kulitan!" : isTie ? "Evenly matched battle!" : "A valiant effort! Keep sharpening your skills."}
            </Text>

            {/* Scoreboard Result Card */}
            <View style={styles.resultScoreCard}>
              <View style={styles.resultScoreColumn}>
                <Text style={styles.resultScorePlayer}>{myName}</Text>
                <Text style={[styles.resultScoreValue, { color: '#38BDF8' }]}>{myScore}</Text>
                <Text style={styles.resultScorePts}>Points</Text>
              </View>

              <View style={styles.resultVsDivider}>
                <Text style={styles.resultVsDividerText}>VS</Text>
              </View>

              <View style={styles.resultScoreColumn}>
                <Text style={styles.resultScorePlayer}>{opponentName}</Text>
                <Text style={[styles.resultScoreValue, { color: '#F43F5E' }]}>{opponentScore}</Text>
                <Text style={styles.resultScorePts}>Points</Text>
              </View>
            </View>

            {/* Rewards Card */}
            <View style={styles.rewardsCard}>
              <View style={styles.rewardItem}>
                <Ionicons name="flash" size={20} color="#F59E0B" />
                <Text style={styles.rewardLabel}>XP</Text>
                <Text style={[styles.rewardValue, { color: isWinner ? '#10B981' : '#EF4444' }]}>
                  {isWinner ? '+60' : '-15'}
                </Text>
              </View>

              <View style={styles.rewardDivider} />

              <View style={styles.rewardItem}>
                <Ionicons name="trophy" size={20} color="#38BDF8" />
                <Text style={styles.rewardLabel}>Rank Points</Text>
                <Text style={[styles.rewardValue, { color: isWinner ? '#10B981' : '#EF4444' }]}>
                  {isWinner ? '+25' : '-20'}
                </Text>
              </View>
            </View>
            
            {/* Rematch & Exit Buttons */}
            <View style={styles.resultActionRow}>
              {rematchStatus === 'none' ? (
                <TouchableOpacity style={styles.rematchButton} onPress={requestRematch}>
                  <LinearGradient colors={['#D1582D', '#9A3A17']} style={styles.rematchGradient}>
                    <Ionicons name="refresh" size={18} color="#FFF" />
                    <Text style={styles.rematchButtonText}>Request Rematch</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <View style={styles.waitingRematchPill}>
                  <ActivityIndicator size="small" color="#F59E0B" style={{ marginRight: 8 }} />
                  <Text style={styles.waitingHostText}>Waiting for opponent...</Text>
                </View>
              )}

              {opponentWantsRematch && rematchStatus === 'none' && (
                <Text style={styles.opponentRematchNotice}>{opponentName} wants a rematch!</Text>
              )}

              <TouchableOpacity style={styles.leaveButton} onPress={leaveRoom}>
                <Text style={styles.leaveButtonText}>Back to Lobby</Text>
              </TouchableOpacity>
            </View>

          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Cinematic VS Screen Countdown
  if (status === 'playing' && !hasShownVsScreen && opponentId) {
    return (
      <LinearGradient colors={['#0F172A', '#1E1B4B']} style={styles.container}>
        <View style={styles.vsScreenContainer}>
          <View style={styles.vsPlayerCard}>
            <View style={[styles.vsAvatarCircle, { borderColor: '#38BDF8' }]}>
              <Text style={styles.vsAvatarInitial}>{myName.charAt(0)}</Text>
            </View>
            <Text style={styles.vsPlayerText} numberOfLines={1}>{myName}</Text>
            <Text style={styles.vsPlayerSub}>Lvl {profile?.level || 1} • {profile?.eloRating || 1000} RP</Text>
          </View>

          <View style={styles.vsCenterClash}>
            <View style={styles.vsBigCircle}>
              <Text style={styles.vsBigText}>VS</Text>
            </View>
            <View style={styles.vsCountdownPill}>
              <Text style={styles.vsCountdownText}>Starts in {vsCountdown}s</Text>
            </View>
          </View>

          <View style={styles.vsPlayerCard}>
            <View style={[styles.vsAvatarCircle, { borderColor: '#F43F5E' }]}>
              <Text style={styles.vsAvatarInitial}>{opponentName.charAt(0)}</Text>
            </View>
            <Text style={styles.vsPlayerText} numberOfLines={1}>{opponentName}</Text>
            <Text style={styles.vsPlayerSub}>Challenger</Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

  const currentQ = questions[currentQuestionIndex];
  if (!currentQ) return null;

  return (
    <LinearGradient colors={['#FAF5EE', '#E2E8F0']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        {/* Floating Emojis */}
        {floatingEmojis.map((emoji) => (
          <FloatingEmojiComponent key={emoji.id} emoji={emoji.emoji} xPosition={emoji.xPosition} />
        ))}

        {/* Live Tug-of-War Scoreboard Header */}
        <View style={styles.battleHeaderCard}>
          <View style={styles.battleHeaderRow}>
            {/* Player Info */}
            <View style={styles.playerScoreBox}>
              <Text style={styles.playerScoreName} numberOfLines={1}>{myName}</Text>
              <Text style={styles.playerScoreValue}>{myScore}</Text>
            </View>

            {/* Swords Icon */}
            <View style={styles.battleSwordsCircle}>
              <MaterialCommunityIcons name="sword-cross" size={20} color="#D1582D" />
            </View>

            {/* Opponent Info */}
            <View style={[styles.playerScoreBox, { alignItems: 'flex-end' }]}>
              <Text style={styles.playerScoreName} numberOfLines={1}>{opponentName}</Text>
              <Text style={[styles.playerScoreValue, { color: '#DC2626' }]}>{opponentScore}</Text>
            </View>
          </View>

          {/* Dynamic Tug-of-War Momentum Bar */}
          <View style={styles.tugBarBackground}>
            <Animated.View style={[
              styles.tugBarLeftFill,
              {
                width: tugAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                })
              }
            ]} />
          </View>
        </View>

        {/* Round Progress & Timer */}
        <View style={styles.timerContainer}>
          <Animated.View style={[
            styles.timerBarFill,
            { 
              width: timerAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
              backgroundColor: timerAnim.interpolate({ inputRange: [0, 30, 100], outputRange: ['#EF4444', '#F59E0B', '#10B981'] })
            }
          ]} />
        </View>

        {/* Round Winner Banner */}
        {roundWinnerName && (
          <Animated.View style={styles.winnerBanner}>
            <Ionicons name="flash" size={20} color="#F59E0B" />
            <Text style={styles.winnerBannerText}>
              {roundWinnerName} scored first! {speedBonusGained ? '(+15 Speed Bonus!)' : ''}
            </Text>
          </Animated.View>
        )}

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Question Card */}
          <Animated.View style={[styles.questionCard, { transform: [{ translateY: cardFloatAnim }] }]}>
            <View style={styles.questionBadge}>
              <Text style={styles.questionBadgeText}>
                QUESTION {currentQuestionIndex + 1} OF {questions.length}
              </Text>
            </View>

            <Text style={styles.questionPrompt}>
              {currentQ.category === 'words' ? t('what_does_this_mean') : 'Identify Glyph'}
            </Text>
            <Text style={styles.kapampanganWord}>
              {currentQ.category === 'words' ? currentQ.kapampangan : 'Read this Glyph'}
            </Text>
            
            <View style={styles.kulitanContainer}>
              {getKulitanSyllables(currentQ.kapampangan).map((syllables, index) => (
                <View key={index} style={styles.verticalWordColumn}>
                  <Text style={styles.kulitanText}>{syllables.join('\n')}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Options in 2x2 Responsive Grid */}
          <View style={styles.optionsGrid}>
            {currentQ.options.map((opt: string, i: number) => {
              const isSelected = selectedOption === opt;
              const isCorrect = isSelected && isCorrectSelected;
              const isWrong = isSelected && !isCorrectSelected;

              return (
                <Animated.View 
                  key={i}
                  style={[
                    styles.optionGridItem,
                    {
                      opacity: optionsOpacityAnim,
                      transform: [{ translateY: optionsSlideAnim }]
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
                    disabled={selectedOption !== null || roundWinnerName !== null}
                  >
                    <View style={[styles.optionBadge, (isCorrect || isWrong) && styles.optionBadgeActive]}>
                      <Text style={[styles.optionBadgeText, (isCorrect || isWrong) && { color: '#FFF' }]}>
                        {isCorrect ? '✓' : isWrong ? '✗' : ['A', 'B', 'C', 'D'][i]}
                      </Text>
                    </View>
                    <Text 
                      style={[
                        styles.optionText,
                        (isCorrect || isWrong) && styles.optionTextSelected
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

        {/* Quick Reaction Emoji Bar */}
        <View style={styles.emojiBar}>
          {['🔥', '⚡', '👏', '🤯', '😎', '🤝'].map(emoji => (
            <TouchableOpacity key={emoji} onPress={() => sendEmoji(emoji)} style={styles.emojiBtn} activeOpacity={0.6}>
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
        toValue: SCREEN_HEIGHT / 2.5,
        duration: 2200,
        useNativeDriver: true,
      }),
      Animated.timing(animOpacity, {
        toValue: 0,
        duration: 2200,
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 20 : 40,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  roomCodeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  roomCodeLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#94A3B8',
    letterSpacing: 1.5,
  },
  roomCodeValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
    color: '#F59E0B',
    letterSpacing: 2,
  },
  waitingTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  opponentFoundCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    gap: 12,
    marginTop: 10,
  },
  oppAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  opponentFoundText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#10B981',
  },
  startButton: {
    marginTop: 36,
    width: '80%',
    maxWidth: 280,
    borderRadius: 20,
    overflow: 'hidden',
  },
  startBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  startButtonText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#FFF',
  },
  waitingHostText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 20,
  },

  // VS Screen Clash Styles
  vsScreenContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  vsPlayerCard: {
    alignItems: 'center',
    flex: 1,
  },
  vsAvatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  vsAvatarInitial: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 32,
    color: '#FFF',
  },
  vsPlayerText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
  },
  vsPlayerSub: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  vsCenterClash: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  vsBigCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D1582D',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 8,
  },
  vsBigText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    color: '#FFF',
    letterSpacing: 1,
  },
  vsCountdownPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  vsCountdownText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#F59E0B',
  },

  // Battle Arena Header
  battleHeaderCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: Platform.OS === 'ios' ? 10 : 36,
    borderRadius: 20,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  battleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  playerScoreBox: {
    flex: 1,
  },
  playerScoreName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#64748B',
  },
  playerScoreValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    color: '#0284C7',
  },
  battleSwordsCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  tugBarBackground: {
    height: 8,
    backgroundColor: '#EF4444',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tugBarLeftFill: {
    height: '100%',
    backgroundColor: '#0284C7',
    borderRadius: 4,
  },
  timerContainer: {
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginHorizontal: 20,
    marginTop: 6,
    overflow: 'hidden',
  },
  timerBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  winnerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFBEB',
    marginHorizontal: 20,
    marginTop: 8,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 6,
  },
  winnerBannerText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#B45309',
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  questionBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },
  questionBadgeText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: '#94A3B8',
    letterSpacing: 1.2,
  },
  questionPrompt: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  kapampanganWord: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 26,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  kulitanContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    paddingVertical: 12,
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
    marginTop: 12,
    gap: 10,
  },
  optionGridItem: {
    width: '48%',
  },
  optionButton: {
    backgroundColor: '#FFF',
    paddingVertical: 14,
    paddingHorizontal: 12,
    minHeight: 68,
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
  },
  optionWrong: {
    backgroundColor: '#EF4444',
    borderColor: '#DC2626',
  },
  optionText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#334155',
    textAlign: 'center',
    marginTop: 4,
  },
  optionTextSelected: {
    color: '#FFF',
  },

  emojiBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  emojiBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emojiText: {
    fontSize: 22,
  },
  floatingEmoji: {
    position: 'absolute',
    fontSize: 36,
    zIndex: 100,
  },

  // Results Screen Styles
  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  resultIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  winCircle: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  lossCircle: {
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    borderWidth: 2,
    borderColor: '#94A3B8',
  },
  resultTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 32,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  resultSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
  },
  resultScoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 24,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  resultScoreColumn: {
    flex: 1,
    alignItems: 'center',
  },
  resultScorePlayer: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 4,
  },
  resultScoreValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 32,
  },
  resultScorePts: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#64748B',
  },
  resultVsDivider: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultVsDividerText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#FFF',
  },
  rewardsCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 28,
  },
  rewardItem: {
    alignItems: 'center',
  },
  rewardLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  rewardValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    marginTop: 2,
  },
  rewardDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  resultActionRow: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  rematchButton: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
  },
  rematchGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  rematchButtonText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#FFF',
  },
  waitingRematchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 18,
  },
  opponentRematchNotice: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#F59E0B',
    marginTop: 4,
  },
  leaveButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  leaveButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#94A3B8',
  },
});
