import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { getRandomQuestions } from '../utils/quizQuestions';

type MultiplayerLobbyScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

export default function MultiplayerLobbyScreen({ navigation }: MultiplayerLobbyScreenProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [roomId, setRoomId] = useState<string | null>(null);
  const { user } = useAuth();
  const { profile } = useProfile();

  // Handle host waiting for a player to join
  useEffect(() => {
    let subscription: any;
    
    if (isSearching && roomId) {
      subscription = supabase.channel(`wait_${roomId}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'quiz_rooms', filter: `id=eq.${roomId}` }, (payload) => {
          if (payload.new.status === 'playing') {
            setIsSearching(false);
            navigation.navigate('QuizBattle', { roomId: payload.new.id, isHost: true });
          }
        })
        .subscribe();
    }

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [isSearching, roomId, navigation]);

  const cancelSearch = async () => {
    setIsSearching(false);
    if (roomId) {
      await supabase.from('quiz_rooms').delete().eq('id', roomId);
      setRoomId(null);
    }
  };

  const findMatch = async () => {
    if (!user) return;
    setIsSearching(true);
    setStatusMessage('Searching for opponents...');
    setRoomId(null);
    
    try {
      // 1. Look for a waiting room
      const { data: waitingRooms, error: searchError } = await supabase
        .from('quiz_rooms')
        .select('*')
        .eq('status', 'waiting')
        .neq('host_id', user.id) // Don't join your own ghost room
        .limit(1);

      if (waitingRooms && waitingRooms.length > 0) {
        setStatusMessage('Match found! Joining...');
        const room = waitingRooms[0];
        
        // 2a. Join the room as player 2
        const myName = profile?.firstName ? profile.firstName.toUpperCase() : 'PLAYER 2';
        await supabase
          .from('quiz_room_players')
          .insert([{ room_id: room.id, user_id: user.id, score: 0, player_name: myName }]);
          
        // 2b. Update status to playing
        await supabase
          .from('quiz_rooms')
          .update({ status: 'playing' })
          .eq('id', room.id);

        setIsSearching(false);
        navigation.navigate('QuizBattle', { roomId: room.id, isHost: false });
        
      } else {
        // 3. No rooms available. Create a new one and wait.
        setStatusMessage('Creating a lobby...');
        
        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        const initialQuestions = getRandomQuestions(30);

        const { data: newRoom, error: createError } = await supabase
          .from('quiz_rooms')
          .insert([
            { room_code: newCode, host_id: user.id, status: 'waiting', current_question_index: 0, questions: initialQuestions }
          ])
          .select()
          .single();

        if (createError) throw createError;

        const myName = profile?.firstName ? profile.firstName.toUpperCase() : 'HOST';
        await supabase
          .from('quiz_room_players')
          .insert([{ room_id: newRoom.id, user_id: user.id, score: 0, player_name: myName }]);

        setRoomId(newRoom.id);
        setStatusMessage('Waiting for an opponent to join...');
      }
    } catch (err: any) {
      console.error(err);
      setIsSearching(false);
      Alert.alert('Matchmaking Error', 'Could not connect to the server.');
    }
  };

  return (
    <LinearGradient colors={['#0B2046', '#1A365D']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => {
              if (isSearching) cancelSearch();
              navigation.goBack();
            }} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Ionicons name="game-controller" size={80} color="#3B82F6" style={styles.icon} />
          <Text style={styles.title}>Quiz Battle</Text>
          <Text style={styles.subtitle}>Test your Kapampangan skills against real players!</Text>

          <View style={styles.matchContainer}>
            {isSearching ? (
              <View style={styles.searchingBox}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.searchingText}>{statusMessage}</Text>
                
                <TouchableOpacity style={styles.cancelButton} onPress={cancelSearch}>
                  <Text style={styles.cancelButtonText}>Cancel Search</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.findMatchButton} onPress={findMatch}>
                <Text style={styles.findMatchText}>Find Match</Text>
                <Ionicons name="search" size={24} color="#FFF" style={{ marginLeft: 10 }} />
              </TouchableOpacity>
            )}
          </View>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: -50,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 36,
    color: '#FFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  matchContainer: {
    width: '100%',
    alignItems: 'center',
  },
  findMatchButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    width: '80%',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  findMatchText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    color: '#FFF',
  },
  searchingBox: {
    alignItems: 'center',
  },
  searchingText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#93C5FD',
    marginTop: 20,
    marginBottom: 30,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: 'rgba(239,68,68,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.5)',
  },
  cancelButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#F87171',
  },
});
