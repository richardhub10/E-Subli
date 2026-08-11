import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

// Quiz Data
const QUIZ_QUESTIONS = [
  { 
    kapampangan: 'Nanu gagawan mu', 
    correct: 'Ano ginagawa mo',
    options: ['Ano ginagawa mo', 'Saan ka pupunta', 'Kumusta ka', 'Anong pangalan mo']
  },
  { 
    kapampangan: 'Komusta', 
    correct: 'Kumusta',
    options: ['Magandang umaga', 'Kumusta', 'Salamat', 'Paalam']
  },
  { 
    kapampangan: 'Mayap a abak', 
    correct: 'Magandang umaga',
    options: ['Magandang gabi', 'Magandang tanghali', 'Magandang hapon', 'Magandang umaga']
  },
  { 
    kapampangan: 'Nukarin ka munta', 
    correct: 'Saan ka pupunta',
    options: ['Ano ginagawa mo', 'Saan ka pupunta', 'Sino kasama mo', 'Anong oras na']
  },
  { 
    kapampangan: 'Kaluguran daka', 
    correct: 'Mahal kita',
    options: ['Salamat', 'Maganda ka', 'Mahal kita', 'Kaibigan kita']
  }
];

type Props = {
  navigation: StackNavigationProp<any, any>;
  route: any;
};

export default function QuizBattleScreen({ navigation, route }: Props) {
  const { roomId, roomCode, isHost } = route.params;
  const { user } = useAuth();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [status, setStatus] = useState('waiting'); // waiting, playing, finished
  const [showVsScreen, setShowVsScreen] = useState(false);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponentId, setOpponentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
          if (me) setMyScore(me.score);
          if (opp) {
            setOpponentScore(opp.score);
            setOpponentId(opp.user_id);
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
        if (newRecord.current_question_index !== undefined) setCurrentQuestionIndex(newRecord.current_question_index);
        
        if (newRecord.status !== undefined) {
          if (status === 'waiting' && newRecord.status === 'playing') {
            setShowVsScreen(true);
            setTimeout(() => {
              setShowVsScreen(false);
            }, 3000);
          }
          setStatus(newRecord.status);
        }
      })
      .subscribe();

    playersSubscription = supabase.channel(`quiz_players_${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quiz_room_players', filter: `room_id=eq.${roomId}` }, async () => {
        // Just re-fetch players on any change
        const { data: players } = await supabase.from('quiz_room_players').select('*').eq('room_id', roomId);
        if (players) {
          const me = players.find(p => p.user_id === user?.id);
          const opp = players.find(p => p.user_id !== user?.id);
          if (me) setMyScore(me.score);
          if (opp) {
            setOpponentScore(opp.score);
            setOpponentId(opp.user_id);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(roomSubscription);
      supabase.removeChannel(playersSubscription);
    };
  }, [roomId]);

  const startGame = async () => {
    // Show VS screen on host immediately
    setShowVsScreen(true);
    setTimeout(() => {
      setShowVsScreen(false);
    }, 3000);
    
    await supabase.from('quiz_rooms').update({ status: 'playing', current_question_index: 0 }).eq('id', roomId);
  };

  const handleAnswer = async (selectedOption: string) => {
    const currentQ = QUIZ_QUESTIONS[currentQuestionIndex];
    
    if (selectedOption === currentQ.correct) {
      // Correct! Increment score
      const newScore = myScore + 10;
      setMyScore(newScore); // Optimistic score
      
      const nextIndex = currentQuestionIndex + 1;
      
      if (nextIndex >= QUIZ_QUESTIONS.length) {
        setStatus('finished'); // Optimistic status
        await supabase.from('quiz_room_players').update({ score: newScore }).eq('room_id', roomId).eq('user_id', user?.id);
        await supabase.from('quiz_rooms').update({ status: 'finished' }).eq('id', roomId);
      } else {
        setCurrentQuestionIndex(nextIndex); // Optimistic next question
        await supabase.from('quiz_room_players').update({ score: newScore }).eq('room_id', roomId).eq('user_id', user?.id);
        await supabase.from('quiz_rooms').update({ current_question_index: nextIndex }).eq('id', roomId);
      }
    } else {
      Alert.alert("Incorrect", "Try the next one or wait for your opponent!");
    }
  };

  const leaveRoom = async () => {
    if (user) {
      await supabase.from('quiz_room_players').delete().eq('room_id', roomId).eq('user_id', user.id);
    }
    navigation.goBack();
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
          
          <TouchableOpacity style={styles.leaveButton} onPress={leaveRoom}>
            <Text style={styles.leaveButtonText}>Back to Lobby</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  if (showVsScreen) {
    return (
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
        <View style={styles.vsScreenContainer}>
          <Text style={styles.vsPlayerText}>YOU</Text>
          <View style={styles.vsBigCircle}>
            <Text style={styles.vsBigText}>VS</Text>
          </View>
          <Text style={styles.vsPlayerText}>OPPONENT</Text>
        </View>
      </LinearGradient>
    );
  }

  const currentQ = QUIZ_QUESTIONS[currentQuestionIndex];

  return (
    <LinearGradient colors={['#FAF5EE', '#E8DAC9']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header Scores */}
        <View style={styles.scoreBoard}>
          <View style={[styles.scorePill, styles.myScorePill]}>
            <Text style={styles.scoreLabel}>YOU</Text>
            <Text style={styles.scoreValue}>{myScore}</Text>
          </View>
          <View style={styles.vsCircle}>
            <Text style={styles.vsText}>VS</Text>
          </View>
          <View style={[styles.scorePill, styles.oppScorePill]}>
            <Text style={styles.scoreLabel}>OPP</Text>
            <Text style={styles.scoreValue}>{opponentScore}</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${((currentQuestionIndex) / QUIZ_QUESTIONS.length) * 100}%` }]} />
          </View>
        </View>

        {/* Question Area */}
        <View style={styles.questionCard}>
          <Text style={styles.questionLabel}>What does this mean?</Text>
          <Text style={styles.kapampanganWord}>{currentQ.kapampangan}</Text>
          
          <View style={styles.kulitanContainer}>
            {getKulitanSyllables(currentQ.kapampangan).map((syllables, index) => (
              <View key={index} style={styles.verticalWordColumn}>
                <Text style={styles.kulitanText}>{syllables.join('\n')}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQ.options.map((opt, i) => (
            <TouchableOpacity 
              key={i} 
              style={styles.optionButton}
              onPress={() => handleAnswer(opt)}
            >
              <Text style={styles.optionText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  waitingTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    color: '#FFF',
    marginBottom: 10,
  },
  roomCodeText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 18,
    color: '#93C5FD',
    letterSpacing: 2,
  },
  opponentFound: {
    alignItems: 'center',
    marginTop: 40,
  },
  opponentText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#10B981',
    marginTop: 10,
  },
  startButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 50,
  },
  startButtonText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#FFF',
  },
  waitingHostText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 50,
  },
  resultTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 32,
    marginVertical: 20,
  },
  finalScoreText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 18,
    color: '#475569',
    marginBottom: 10,
  },
  leaveButton: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 20,
    marginTop: 40,
  },
  leaveButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#FFF',
  },
  scoreBoard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  scorePill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  myScorePill: {
    backgroundColor: '#DBEAFE',
  },
  oppScorePill: {
    backgroundColor: '#FEE2E2',
  },
  scoreLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#64748B',
  },
  scoreValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    color: '#0F172A',
  },
  vsCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
  },
  vsText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#FFF',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  questionCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    marginBottom: 20,
  },
  questionLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  kapampanganWord: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 20,
  },
  kulitanContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    gap: 20,
  },
  verticalWordColumn: {
    alignItems: 'center',
  },
  kulitanText: {
    fontFamily: 'Kulitan',
    fontSize: 40,
    color: '#3B82F6',
    lineHeight: 50,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  optionText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#334155',
    textAlign: 'center',
  },
  vsScreenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsPlayerText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 48,
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
    marginVertical: 40,
  },
  vsBigCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  vsBigText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 40,
    color: '#FFF',
  },
});
