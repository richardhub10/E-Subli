import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

type MultiplayerLobbyScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

export default function MultiplayerLobbyScreen({ navigation }: MultiplayerLobbyScreenProps) {
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const generateRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const createRoom = async () => {
    if (!user) return;
    setIsLoading(true);
    const newCode = generateRoomCode();
    
    try {
      const { data, error } = await supabase
        .from('quiz_rooms')
        .insert([
          { room_code: newCode, host_id: user.id, status: 'waiting', current_question_index: 0 }
        ])
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('quiz_room_players')
        .insert([
          { room_id: data.id, user_id: user.id, score: 0 }
        ]);

      navigation.navigate('QuizBattle', { roomId: data.id, roomCode: newCode, isHost: true });
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', 'Could not create a room.');
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!user || !roomCode.trim()) return;
    setIsLoading(true);
    
    try {
      // Find room by code
      const { data: room, error: findError } = await supabase
        .from('quiz_rooms')
        .select('*')
        .eq('room_code', roomCode.trim().toUpperCase())
        .single();

      if (findError || !room) {
        throw new Error('Room not found or invalid code.');
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('quiz_room_players')
        .select('*')
        .eq('room_id', room.id)
        .eq('user_id', user.id)
        .single();

      if (!existingMember) {
        // Join room
        await supabase
          .from('quiz_room_players')
          .insert([
            { room_id: room.id, user_id: user.id, score: 0 }
          ]);
      }

      navigation.navigate('QuizBattle', { roomId: room.id, roomCode: room.room_code, isHost: room.host_id === user.id });
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'Could not join room.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#FAF5EE', '#E8DAC9']} style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quiz Battle</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Race to Translate!</Text>
          <Text style={styles.subtitle}>Create a room and invite your friends, or enter a room code to join an existing session.</Text>

          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.createButton} 
              onPress={createRoom}
              disabled={isLoading}
            >
              {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.createButtonText}>Create a New Room</Text>}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.joinContainer}>
              <Text style={styles.label}>Enter Room Code</Text>
              <TextInput
                style={styles.input}
                value={roomCode}
                onChangeText={(text) => setRoomCode(text.toUpperCase())}
                placeholder="e.g. A7X9B2"
                placeholderTextColor="#94A3B8"
                maxLength={6}
                autoCapitalize="characters"
              />
              <TouchableOpacity 
                style={[styles.joinButton, !roomCode.trim() && styles.joinButtonDisabled]}
                onPress={joinRoom}
                disabled={isLoading || !roomCode.trim()}
              >
                <Text style={styles.joinButtonText}>Join Room</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  headerTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    color: '#0F172A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  createButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#94A3B8',
    paddingHorizontal: 16,
  },
  joinContainer: {
    gap: 12,
  },
  label: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#475569',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 24,
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: 4,
  },
  joinButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  joinButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  joinButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
  },
});
