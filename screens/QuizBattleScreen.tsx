import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, Animated, Easing, Dimensions, ScrollView, Platform, AppState, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StackNavigationProp } from '@react-navigation/stack';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { useLanguage } from '../context/LanguageContext';
import { useOnlinePresence } from '../context/OnlinePresenceContext';
import { getRandomQuestions } from '../utils/quizQuestions';
import { AiOpponent } from '../utils/aiOpponents';
import KulitanGlyph from '../components/KulitanGlyph';
import { BackgroundImages } from '../constants/backgrounds';

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
  const { roomId, roomCode, isHost, isAiMatch, aiOpponent } = route?.params || {};
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { t, language } = useLanguage();
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const currentQuestionIndexRef = useRef(0);

  useEffect(() => {
    currentQuestionIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  const [status, setStatus] = useState('waiting'); // waiting, playing, finished
  const [hasShownVsScreen, setHasShownVsScreen] = useState(false);
  const [vsCountdown, setVsCountdown] = useState(3);
  
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponentId, setOpponentId] = useState<string | null>(isAiMatch && aiOpponent?.id ? aiOpponent.id : null);
  const [opponentName, setOpponentName] = useState<string>(isAiMatch && aiOpponent?.name ? aiOpponent.name : 'OPPONENT');
  const [opponentAvatar, setOpponentAvatar] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [rematchStatus, setRematchStatus] = useState<'none' | 'waiting' | 'accepted'>('none');
  const [opponentWantsRematch, setOpponentWantsRematch] = useState(false);
  const [hasAwardedXP, setHasAwardedXP] = useState(false);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);
  const statusRef = useRef(status);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);
  
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
      if (aiDecisionTimerRef.current) clearTimeout(aiDecisionTimerRef.current);
    };
  }, []);

  // Set current activity in global presence while in live battle
  const { setActivity } = useOnlinePresence();
  useEffect(() => {
    setActivity('In Quiz Battle');
    return () => {
      setActivity('Online');
    };
  }, []);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const aiDecisionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const broadcastChannelRef = useRef<any>(null);
  
  const myAnswerWrongRef = useRef(false);
  const opponentWrongRef = useRef(false);

  // Parse Kulitan safely
  const getKulitanSyllables = (text: string): string[][] => {
    if (!text || typeof text !== 'string') return [['a']];
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

  // Failsafe: if status is playing but questions is empty, immediately populate questions
  useEffect(() => {
    if (status === 'playing' && questions.length === 0) {
      setQuestions(getRandomQuestions(30));
    }
  }, [status, questions.length]);

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

  // Initialize AI match once on mount
  useEffect(() => {
    if (!isAiMatch) return;

    const initialQuestions = getRandomQuestions(30);
    setQuestions(initialQuestions);
    setCurrentQuestionIndex(0);
    setMyScore(0);
    setOpponentScore(0);
    setStatus('playing');
    setOpponentId(aiOpponent?.id || 'ai-opponent');
    setOpponentName(aiOpponent?.name || 'Scholar');
    setIsLoading(false);
  }, []);

  // Supabase subscriptions for human multiplayer only
  useEffect(() => {
    if (isAiMatch || !roomId) return;

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
          let parsedQuestions = room.questions;
          if (typeof parsedQuestions === 'string') {
            try { parsedQuestions = JSON.parse(parsedQuestions); } catch {}
          }
          const qList = (parsedQuestions && Array.isArray(parsedQuestions) && parsedQuestions.length > 0)
            ? parsedQuestions
            : getRandomQuestions(30);
          setQuestions(prev => (prev.length === 0 ? qList : prev));
          setCurrentQuestionIndex(prev => Math.max(prev, room.current_question_index || 0));
          setStatus(room.status || 'waiting');
          if (isHost && (!room.questions || room.questions.length === 0)) {
            supabase.from('quiz_rooms').update({ questions: qList }).eq('id', roomId).then();
          }
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
        console.error('QuizBattle fetchState error:', e);
        // Guaranteed fallback so battle never loads with 0 questions:
        setQuestions(prev => (prev.length === 0 ? getRandomQuestions(30) : prev));
      } finally {
        setIsLoading(false);
      }
    };

    fetchState();

    roomSubscription = supabase.channel(`quiz_room_${roomId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'quiz_rooms', filter: `id=eq.${roomId}` }, (payload) => {
        const newRecord = payload.new;
        if (!newRecord) return;

        let parsedPayloadQs = newRecord.questions;
        if (typeof parsedPayloadQs === 'string') {
          try { parsedPayloadQs = JSON.parse(parsedPayloadQs); } catch {}
        }

        if (newRecord.status !== undefined) {
          if (newRecord.status === 'playing' && statusRef.current === 'finished') {
             // Reset state for rematch
             currentQuestionIndexRef.current = 0;
             setCurrentQuestionIndex(0);
             if (parsedPayloadQs && Array.isArray(parsedPayloadQs) && parsedPayloadQs.length > 0) {
               setQuestions(parsedPayloadQs);
             } else {
               setQuestions(getRandomQuestions(30));
             }
             setHasShownVsScreen(false);
             setHasAwardedXP(false);
             setRematchStatus('none');
             setOpponentWantsRematch(false);
             setOpponentDisconnected(false);
          }
          setStatus(newRecord.status);
        }

        // Only populate questions once if empty to avoid breaking active round animations
        if (parsedPayloadQs && Array.isArray(parsedPayloadQs) && parsedPayloadQs.length > 0) {
          setQuestions(prev => (prev.length === 0 ? parsedPayloadQs : prev));
        }

        // Strictly monotonic forward progress: never jump backward to an old question!
        if (newRecord.current_question_index !== undefined) {
          const incomingIdx = newRecord.current_question_index;
          setCurrentQuestionIndex(prev => (incomingIdx > prev ? incomingIdx : prev));
        }
      })
      .subscribe();

    playersSubscription = supabase.channel(`quiz_players_${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quiz_room_players', filter: `room_id=eq.${roomId}` }, (payload: any) => {
        const newRecord = payload.new;
        if (newRecord && newRecord.user_id) {
          if (newRecord.user_id === user?.id) {
            setMyScore(newRecord.score ?? 0);
            setRematchStatus(newRecord.wants_rematch ? 'waiting' : 'none');
          } else {
            setOpponentScore(newRecord.score ?? 0);
            setOpponentWantsRematch(!!newRecord.wants_rematch);
            if (newRecord.user_id !== opponentId) {
              setOpponentId(newRecord.user_id);
            }
            if (newRecord.player_name) {
              setOpponentName(newRecord.player_name);
            }
          }
        } else if (payload.eventType === 'DELETE') {
          if (statusRef.current === 'playing') {
            setOpponentDisconnected(true);
            setStatus('finished');
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
        // Cap floating emojis to prevent memory bloat and frame drops
        setFloatingEmojis((prev) => [...prev.slice(-3), newEmoji]);
        
        setTimeout(() => {
          setFloatingEmojis((prev) => prev.filter(e => e.id !== newEmoji.id));
        }, 2200);
      })
      .on('broadcast', { event: 'round_winner' }, (payload: any) => {
        // Freeze local round timer so loser does not time out or fire stale updates
        if (timerRef.current) clearTimeout(timerRef.current);
        timerAnim.stopAnimation();
        setRoundWinnerName(payload.payload.name);
      })
      .on('broadcast', { event: 'wrong_answer' }, () => {
        opponentWrongRef.current = true;
        if (isHost && myAnswerWrongRef.current) {
          if (timerRef.current) clearTimeout(timerRef.current);
          timerAnim.stopAnimation();
          setTimeout(() => {
            handleTimeOut();
          }, 850);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(roomSubscription);
      supabase.removeChannel(playersSubscription);
      supabase.removeChannel(broadcastChannelRef.current);
    };
  }, [roomId]);

  // VS Screen Countdown Timer
  useEffect(() => {
    if (status === 'playing' && !hasShownVsScreen) {
      if (questions.length === 0) {
        setQuestions(getRandomQuestions(30));
      }
      setVsCountdown(3);
      let count = 3;
      const interval = setInterval(() => {
        count -= 1;
        setVsCountdown(count > 0 ? count : 0);
        if (count <= 0) {
          clearInterval(interval);
          setHasShownVsScreen(true);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status, hasShownVsScreen]);

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

      const floatLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(cardFloatAnim, { toValue: -6, duration: 1600, useNativeDriver: true }),
          Animated.timing(cardFloatAnim, { toValue: 0, duration: 1600, useNativeDriver: true }),
        ])
      );
      floatLoop.start();

      if (isHost || isAiMatch) {
        timerRef.current = setTimeout(() => {
           handleTimeOut();
        }, 10000);
      } else {
        // Failsafe for non-host: if host lags severely or disconnects, advance after 13s grace period
        timerRef.current = setTimeout(() => {
           handleTimeOut();
        }, 13000);
      }

      if (isAiMatch) {
        // Competitive dynamic speed & rubber-banding
        const scoreDiff = opponentScore - myScore;
        let baseMin = aiOpponent?.minDelay || 1900;
        let baseMax = aiOpponent?.maxDelay || 3600;

        if (scoreDiff < -10) {
          // Opponent is trailing: speeds up to contest aggressively
          baseMin = Math.max(1500, baseMin - 400);
          baseMax = Math.max(2400, baseMax - 600);
        } else if (scoreDiff > 20) {
          // Opponent has a large lead: slight hesitation window
          baseMin += 300;
          baseMax += 500;
        }

        const aiDelay = Math.floor(Math.random() * (baseMax - baseMin)) + baseMin;
        const accuracy = aiOpponent?.accuracy || 0.86;
        const willBeCorrect = Math.random() < accuracy;

        aiDecisionTimerRef.current = setTimeout(() => {
          handleAiTurn(willBeCorrect, aiDelay);
        }, aiDelay);
      }

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (aiDecisionTimerRef.current) clearTimeout(aiDecisionTimerRef.current);
        timerAnim.stopAnimation();
        floatLoop.stop();
        cardFloatAnim.setValue(0);
      };
    }
  }, [currentQuestionIndex, status, hasShownVsScreen, questions.length]);

  // Handle XP and Elo Awarding when finished
  useEffect(() => {
    if (status === 'finished' && !hasAwardedXP) {
      setHasAwardedXP(true);
      const isWinner = opponentDisconnected || myScore > opponentScore;
      const isTie = !opponentDisconnected && myScore === opponentScore;

      if (isWinner) {
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        updateProfile({ 
          xp: (profile?.xp || 0) + 60,
          eloRating: (profile?.eloRating || 1000) + 25 
        });
      } else if (!isTie && myScore < opponentScore) {
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        const newXp = Math.max(0, (profile?.xp || 0) - 15);
        const newElo = Math.max(0, (profile?.eloRating || 1000) - 20);
        updateProfile({ xp: newXp, eloRating: newElo });
      }
    }
  }, [status, myScore, opponentScore, hasAwardedXP, opponentDisconnected]);

  const triggerAiEmoji = () => {
    const aiEmojis = ['🔥', '⚡', '👏', '🧠', '✨', '💪', '🎯'];
    const randomEmoji = aiEmojis[Math.floor(Math.random() * aiEmojis.length)];
    const newEmoji = {
      id: Math.random().toString(),
      emoji: randomEmoji,
      xPosition: Math.random() * 30 + 55,
    };
    setFloatingEmojis((prev) => [...prev, newEmoji]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter(e => e.id !== newEmoji.id));
    }, 2200);
  };

  const handleAiTurn = (willBeCorrect: boolean, delayMs: number) => {
    // If round was already won by user, do nothing
    if (roundWinnerName !== null || (selectedOption !== null && isCorrectSelected)) {
      return;
    }

    const isFast = delayMs <= 3000;
    const earnedPoints = isFast ? 15 : 10;

    if (willBeCorrect) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerAnim.stopAnimation();

      setRoundWinnerName(opponentName);
      if (isFast) setSpeedBonusGained(true);

      if (Math.random() < 0.4) {
        triggerAiEmoji();
      }

      setTimeout(() => {
        setOpponentScore(prev => {
          const newScore = prev + earnedPoints;
          const nextIndex = currentQuestionIndexRef.current + 1;
          if (newScore >= 60 || nextIndex >= questions.length) {
            setStatus('finished');
          } else {
            setCurrentQuestionIndex(nextIndex);
          }
          return newScore;
        });
      }, 850);
    } else {
      // Opponent missed
      opponentWrongRef.current = true;
      if (myAnswerWrongRef.current) {
        // Both answered incorrectly -> advance smoothly
        if (timerRef.current) clearTimeout(timerRef.current);
        timerAnim.stopAnimation();
        setTimeout(() => {
          handleTimeOut();
        }, 850);
      }
    }
  };

  const handleTimeOut = async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (aiDecisionTimerRef.current) clearTimeout(aiDecisionTimerRef.current);
    timerAnim.stopAnimation();

    if (!questions || questions.length === 0) return;

    const nextIndex = currentQuestionIndexRef.current + 1;
    if (nextIndex >= questions.length) {
      setStatus('finished');
      if (!isAiMatch && roomId && isHost) {
        await supabase.from('quiz_rooms').update({ status: 'finished' }).eq('id', roomId);
      }
    } else {
      setCurrentQuestionIndex(nextIndex);
      if (!isAiMatch && roomId && isHost) {
        await supabase.from('quiz_rooms').update({ current_question_index: nextIndex }).eq('id', roomId);
      }
    }
  };

  const startGame = async () => {
    currentQuestionIndexRef.current = 0;
    setCurrentQuestionIndex(0);
    await supabase.from('quiz_rooms').update({ status: 'playing', current_question_index: 0 }).eq('id', roomId);
  };

  const handleAnswer = async (selectedOpt: string) => {
    if (status !== 'playing' || selectedOption !== null || roundWinnerName !== null) return;
    if (!questions || questions.length === 0) return;

    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return;
    const isCorrect = selectedOpt === currentQ.correct;
    const elapsedSeconds = (Date.now() - questionStartTimeRef.current) / 1000;
    const isFast = elapsedSeconds <= 3.0;
    
    setSelectedOption(selectedOpt);
    setIsCorrectSelected(isCorrect);

    if (isCorrect) {
      // Correct! Cancel remaining question timers and award points
      if (timerRef.current) clearTimeout(timerRef.current);
      if (aiDecisionTimerRef.current) clearTimeout(aiDecisionTimerRef.current);
      timerAnim.stopAnimation();

      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      const myName = profile?.firstName ? profile.firstName.toUpperCase() : 'YOU';
      if (!isAiMatch) {
        broadcastChannelRef.current?.send({
          type: 'broadcast',
          event: 'round_winner',
          payload: { name: myName },
        });
      }
      setRoundWinnerName(myName);
      if (isFast) setSpeedBonusGained(true);

      setTimeout(async () => {
        const earnedPoints = isFast ? 15 : 10;
        const newScore = myScore + earnedPoints;
        setMyScore(newScore);
        
        const nextIndex = currentQuestionIndexRef.current + 1;
        
        if (newScore >= 60 || nextIndex >= questions.length) {
          setStatus('finished');
          if (!isAiMatch && roomId && user) {
            await supabase.from('quiz_room_players').update({ score: newScore }).eq('room_id', roomId).eq('user_id', user.id);
            await supabase.from('quiz_rooms').update({ status: 'finished' }).eq('id', roomId);
          }
        } else {
          setCurrentQuestionIndex(nextIndex);
          if (!isAiMatch && roomId && user) {
            await supabase.from('quiz_room_players').update({ score: newScore }).eq('room_id', roomId).eq('user_id', user.id);
            await supabase.from('quiz_rooms').update({ current_question_index: nextIndex }).eq('id', roomId);
          }
        }
      }, 850);
    } else {
      // WRONG answer selected!
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      myAnswerWrongRef.current = true;

      if (!isAiMatch) {
        // Human multiplayer: broadcast wrong answer
        broadcastChannelRef.current?.send({ type: 'broadcast', event: 'wrong_answer' });
        if (isHost && opponentWrongRef.current) {
          if (timerRef.current) clearTimeout(timerRef.current);
          timerAnim.stopAnimation();
          setTimeout(() => {
            handleTimeOut();
          }, 850);
        }
      } else {
        // AI match: competitive opponent steals the question!
        if (aiDecisionTimerRef.current) clearTimeout(aiDecisionTimerRef.current);

        if (opponentWrongRef.current) {
          // Opponent was already wrong -> both wrong, advance
          if (timerRef.current) clearTimeout(timerRef.current);
          timerAnim.stopAnimation();
          setTimeout(() => {
            handleTimeOut();
          }, 850);
        } else {
          // Competitive opponent immediately capitalizes and steals (900ms - 1400ms)
          const stealDelay = Math.floor(Math.random() * 500) + 900;
          const stealAccuracy = Math.min(0.93, (aiOpponent?.accuracy || 0.86) + 0.08);
          const willStealCorrect = Math.random() < stealAccuracy;

          aiDecisionTimerRef.current = setTimeout(() => {
            if (roundWinnerName !== null) return;

            if (willStealCorrect) {
              if (timerRef.current) clearTimeout(timerRef.current);
              timerAnim.stopAnimation();

              setRoundWinnerName(opponentName);
              const earnedPoints = 10;

              if (Math.random() < 0.35) {
                triggerAiEmoji();
              }

              setTimeout(() => {
                setOpponentScore(prev => {
                  const newScore = prev + earnedPoints;
                  const nextIndex = currentQuestionIndexRef.current + 1;
                  if (newScore >= 60 || nextIndex >= questions.length) {
                    setStatus('finished');
                  } else {
                    setCurrentQuestionIndex(nextIndex);
                  }
                  return newScore;
                });
              }, 850);
            } else {
              // Opponent also missed! Both are wrong -> advance
              opponentWrongRef.current = true;
              if (timerRef.current) clearTimeout(timerRef.current);
              timerAnim.stopAnimation();
              setTimeout(() => {
                handleTimeOut();
              }, 850);
            }
          }, stealDelay);

          // Guaranteed failsafe timeout: never ever hang!
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => {
            handleTimeOut();
          }, 2800);
        }
      }
    }
  };

  const requestRematch = async () => {
    if (isAiMatch) {
      setRematchStatus('waiting');
      setTimeout(() => {
        setOpponentWantsRematch(true);
        setRematchStatus('accepted');
        setTimeout(() => {
          triggerAiRematch();
        }, 700);
      }, 1200);
      return;
    }

    setRematchStatus('waiting');
    await supabase.from('quiz_room_players').update({ wants_rematch: true }).eq('room_id', roomId).eq('user_id', user?.id);

    if (isHost && opponentWantsRematch) {
      triggerRematch();
    }
  };

  const triggerAiRematch = () => {
    const newQuestions = getRandomQuestions(30);
    currentQuestionIndexRef.current = 0;
    setCurrentQuestionIndex(0);
    setQuestions(newQuestions);
    setMyScore(0);
    setOpponentScore(0);
    setHasShownVsScreen(false);
    setHasAwardedXP(false);
    setRematchStatus('none');
    setOpponentWantsRematch(false);
    setStatus('playing');
  };

  useEffect(() => {
    if (isHost && rematchStatus === 'waiting' && opponentWantsRematch) {
      triggerRematch();
    }
  }, [rematchStatus, opponentWantsRematch]);

  const triggerRematch = async () => {
    const newQuestions = getRandomQuestions(30);
    currentQuestionIndexRef.current = 0;
    setCurrentQuestionIndex(0);
    setQuestions(newQuestions);
    setMyScore(0);
    setOpponentScore(0);
    setHasShownVsScreen(false);
    setHasAwardedXP(false);
    setRematchStatus('none');
    setOpponentWantsRematch(false);
    await supabase.from('quiz_room_players').update({ score: 0, wants_rematch: false }).eq('room_id', roomId);
    await supabase.from('quiz_rooms').update({ 
      status: 'playing', 
      current_question_index: 0, 
      questions: newQuestions 
    }).eq('id', roomId);
  };

  const sendEmoji = (emoji: string) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!isAiMatch) {
      broadcastChannelRef.current?.send({
        type: 'broadcast',
        event: 'emoji',
        payload: { emoji },
      });
    } else {
      const newEmoji = {
        id: Math.random().toString(),
        emoji,
        xPosition: Math.random() * 30 + 15,
      };
      setFloatingEmojis((prev) => [...prev, newEmoji]);
      setTimeout(() => {
        setFloatingEmojis((prev) => prev.filter(e => e.id !== newEmoji.id));
      }, 2200);

      if (Math.random() < 0.45) {
        setTimeout(() => {
          triggerAiEmoji();
        }, 1100);
      }
    }
  };

  const leaveRoom = () => {
    navigation.goBack();
    if (!isAiMatch && roomId && user) {
      supabase.from('quiz_room_players').delete().eq('room_id', roomId).eq('user_id', user.id).then();
      if (status === 'playing') {
        supabase.from('quiz_rooms').update({ status: 'finished' }).eq('id', roomId).then();
      }
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
  if (status === 'waiting' || status === 'private_waiting') {
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
    const isWinner = opponentDisconnected || myScore > opponentScore;
    const isTie = !opponentDisconnected && myScore === opponentScore;

    const resultTitleText = opponentDisconnected 
      ? "VICTORY!" 
      : isTie 
      ? (myScore === 0 ? "MATCH ENDED" : "It's a Draw!") 
      : (isWinner ? "VICTORY!" : "DEFEAT");

    const resultSubtitleText = opponentDisconnected
      ? (language === 'EN' ? `${opponentName} disconnected or forfeited the match.` : `Umalis si ${opponentName}. Panalo sa forfeit!`)
      : isWinner 
      ? "Outstanding mastery in Kulitan!" 
      : isTie 
      ? (myScore === 0 
          ? (language === 'EN' ? "Match ended before answers were submitted." : "Natapos ang laban bago makapagsagot.")
          : "Evenly matched battle!") 
      : "A valiant effort! Keep sharpening your skills.";

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
              {resultTitleText}
            </Text>
            
            <Text style={styles.resultSubtitle}>
              {resultSubtitleText}
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
                  <Text style={styles.waitingHostText}>{isAiMatch ? `Waiting for ${opponentName}...` : 'Waiting for opponent...'}</Text>
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
  if (status === 'playing' && !hasShownVsScreen) {
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
              <Text style={styles.vsAvatarInitial}>{(opponentName || 'O').charAt(0)}</Text>
            </View>
            <Text style={styles.vsPlayerText} numberOfLines={1}>{opponentName || 'OPPONENT'}</Text>
            <Text style={styles.vsPlayerSub}>Lvl {aiOpponent?.level || 1} • {aiOpponent?.elo || 1000} RP</Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

  const currentQ = (questions && questions.length > 0)
    ? (questions[currentQuestionIndex] || questions[0])
    : null;

  const currentKulitanSyllables = useMemo(() => {
    if (!currentQ?.kapampangan || currentQ.category !== 'words') return [];
    try {
      return getKulitanSyllables(String(currentQ.kapampangan));
    } catch {
      return [];
    }
  }, [currentQ?.kapampangan, currentQ?.category]);

  // NEVER return a blank white screen (null)! Always show parchment arena with loader if waiting for question:
  if (!currentQ) {
    return (
      <View style={styles.container}>
        <Image 
          source={BackgroundImages.ranksAndProfile} 
          style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} 
          resizeMode="cover" 
        />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#D1582D" />
            <Text style={{ marginTop: 16, fontFamily: 'Poppins_600SemiBold', color: '#78350F', fontSize: 14 }}>
              {language === 'EN' ? 'Entering Battle Arena...' : 'Pumapasok sa Arena...'}
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ANCIENT ARENA PARCHMENT BACKGROUND */}
      <Image 
        source={BackgroundImages.ranksAndProfile} 
        style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} 
        resizeMode="cover" 
      />
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
              <Text style={styles.playerScoreName} numberOfLines={1}>{opponentName || 'OPPONENT'}</Text>
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
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
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
              width: timerAnim.interpolate({ 
                inputRange: [0, 100], 
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
              backgroundColor: timerAnim.interpolate({ 
                inputRange: [0, 30, 100], 
                outputRange: ['#EF4444', '#F59E0B', '#10B981'],
                extrapolate: 'clamp',
              })
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
              {currentQ.category === 'words' ? t('what_does_this_mean') : (language === 'EN' ? 'Identify This Glyph' : 'Tukuyin ang Glyph na Ito')}
            </Text>

            {currentQ.category === 'words' ? (
              <>
                <Text style={styles.kapampanganWord}>{currentQ.kapampangan || ''}</Text>
                <View style={styles.kulitanContainer}>
                  {currentKulitanSyllables.map((syllables, index) => (
                    <View key={index} style={styles.verticalWordColumn}>
                      {syllables.map((syl: string, sIdx: number) => (
                        <View key={sIdx} style={styles.syllableGlyphBox}>
                          <KulitanGlyph symbol={syl} size={46} color="#B45309" strokeWidth={4} />
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <View style={styles.glyphHeroWrapper}>
                <View style={styles.glyphPedestalCircle}>
                  <KulitanGlyph 
                    symbol={currentQ.kapampangan || 'a'} 
                    size={110} 
                    color="#B45309" 
                    strokeWidth={4.8} 
                  />
                </View>
                <View style={styles.glyphRunePill}>
                  <MaterialCommunityIcons name="feather" size={13} color="#D97706" />
                  <Text style={styles.glyphRunePillText}>
                    {language === 'EN' ? 'ANCIENT SULAT KAPAMPANGAN' : 'SINAUNANG SULAT KAPAMPANGAN'}
                  </Text>
                </View>
              </View>
            )}
          </Animated.View>

          {/* Options in 2x2 Responsive Grid */}
          <View style={styles.optionsGrid}>
            {(Array.isArray(currentQ?.options) && currentQ.options.length > 0 
              ? currentQ.options 
              : ['Option A', 'Option B', 'Option C', 'Option D']
            ).map((opt: string, i: number) => {
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
    </View>
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
  container: { 
    flex: 1, 
    backgroundColor: '#FAF5EE', 
    overflow: 'hidden' 
  },
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
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
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
    color: '#78350F',
  },
  playerScoreValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    color: '#D97706',
  },
  battleSwordsCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  tugBarBackground: {
    height: 8,
    backgroundColor: '#FCA5A5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tugBarLeftFill: {
    height: '100%',
    backgroundColor: '#D97706',
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
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  questionBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  questionBadgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    color: '#B45309',
    letterSpacing: 1.2,
  },
  questionPrompt: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#78350F',
    marginBottom: 4,
  },
  kapampanganWord: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 26,
    color: '#1E1B18',
    textAlign: 'center',
    marginBottom: 8,
  },
  glyphHeroWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    width: '100%',
  },
  glyphPedestalCircle: {
    width: 144,
    height: 144,
    borderRadius: 72,
    backgroundColor: '#FFFDF9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FDE68A',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 10,
  },
  glyphRunePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 4,
  },
  glyphRunePillText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9.5,
    color: '#92400E',
    letterSpacing: 0.8,
  },
  syllableGlyphBox: {
    marginVertical: 2,
  },
  kulitanContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FFFDF9',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    width: '100%',
  },
  verticalWordColumn: {
    marginHorizontal: 10,
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
