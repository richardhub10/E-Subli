import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

// Simple predefined flashcards
const FLASHCARDS = [
  { tagalog: 'Ano ginagawa mo', kapampangan: 'Nanu gagawan mu' },
  { tagalog: 'Kumusta', kapampangan: 'Komusta' },
  { tagalog: 'Salamat', kapampangan: 'Salamat' },
  { tagalog: 'Magandang umaga', kapampangan: 'Mayap a abak' },
  { tagalog: 'Saan ka pupunta', kapampangan: 'Nukarin ka munta' },
  { tagalog: 'Mahal kita', kapampangan: 'Kaluguran daka' }
];

type Props = {
  navigation: StackNavigationProp<any, any>;
  route: any;
};

export default function CooperativeFlashcardScreen({ navigation, route }: Props) {
  const { roomId, roomCode, isHost } = route.params;
  const { user } = useAuth();
  
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [memberCount, setMemberCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Sync state from Supabase
  useEffect(() => {
    let subscription: any;

    const fetchInitialState = async () => {
      try {
        const { data, error } = await supabase
          .from('flashcard_rooms')
          .select('*')
          .eq('id', roomId)
          .single();

        if (error) throw error;
        
        if (data) {
          setCurrentCardIndex(data.current_card_index || 0);
          setIsFlipped(data.is_flipped || false);
        }

        const { count } = await supabase
          .from('flashcard_room_members')
          .select('*', { count: 'exact' })
          .eq('room_id', roomId);
          
        setMemberCount(count || 1);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialState();

    // Subscribe to realtime updates
    subscription = supabase.channel(`room:${roomId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'flashcard_rooms',
        filter: `id=eq.${roomId}`
      }, (payload) => {
        const newRecord = payload.new;
        if (newRecord.current_card_index !== undefined) {
          setCurrentCardIndex(newRecord.current_card_index);
        }
        if (newRecord.is_flipped !== undefined) {
          setIsFlipped(newRecord.is_flipped);
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'flashcard_room_members',
        filter: `room_id=eq.${roomId}`
      }, () => {
        setMemberCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [roomId]);

  const updateRoomState = async (updates: any) => {
    try {
      await supabase
        .from('flashcard_rooms')
        .update(updates)
        .eq('id', roomId);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to sync with room.');
    }
  };

  const handleFlip = () => {
    const newState = !isFlipped;
    // Optimistic UI update
    setIsFlipped(newState);
    // Broadcast to others
    updateRoomState({ is_flipped: newState });
  };

  const handleNext = () => {
    const nextIndex = (currentCardIndex + 1) % FLASHCARDS.length;
    // Optimistic UI update
    setCurrentCardIndex(nextIndex);
    setIsFlipped(false);
    // Broadcast to others
    updateRoomState({ current_card_index: nextIndex, is_flipped: false });
  };

  const handlePrevious = () => {
    const prevIndex = currentCardIndex === 0 ? FLASHCARDS.length - 1 : currentCardIndex - 1;
    setCurrentCardIndex(prevIndex);
    setIsFlipped(false);
    updateRoomState({ current_card_index: prevIndex, is_flipped: false });
  };

  const leaveRoom = async () => {
    if (user) {
      await supabase
        .from('flashcard_room_members')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', user.id);
    }
    navigation.goBack();
  };

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

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF5EE' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const currentCard = FLASHCARDS[currentCardIndex];

  return (
    <LinearGradient colors={['#FAF5EE', '#E8DAC9']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={leaveRoom} style={styles.backButton}>
          <Ionicons name="exit-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
        <View style={styles.roomInfo}>
          <Text style={styles.roomCodeLabel}>ROOM CODE</Text>
          <Text style={styles.roomCodeText}>{roomCode}</Text>
        </View>
        <View style={styles.playersBadge}>
          <Ionicons name="people" size={16} color="#3B82F6" />
          <Text style={styles.playersCount}>{memberCount}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Card {currentCardIndex + 1} of {FLASHCARDS.length}</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${((currentCardIndex + 1) / FLASHCARDS.length) * 100}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity 
          style={[styles.flashcard, isFlipped && styles.flashcardFlipped]} 
          activeOpacity={0.9}
          onPress={handleFlip}
        >
          <View style={styles.cardInner}>
            {!isFlipped ? (
              <View style={styles.cardFront}>
                <Text style={styles.cardLabel}>Tagalog</Text>
                <Text style={styles.cardWord}>{currentCard.tagalog}</Text>
                <Text style={styles.flipHint}>Tap to flip</Text>
              </View>
            ) : (
              <View style={styles.cardBack}>
                <Text style={styles.cardLabel}>Kapampangan</Text>
                <Text style={styles.cardWordKapampangan}>{currentCard.kapampangan}</Text>
                
                <View style={styles.divider} />
                
                <Text style={styles.cardLabel}>Kulitan Script</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.verticalScrollContent}>
                  <View style={styles.verticalKulitanContainer}>
                    {getKulitanSyllables(currentCard.kapampangan).map((syllables, index) => (
                      <View key={index} style={styles.verticalWordColumn}>
                        <Text style={styles.kulitanResultText}>{syllables.join('\n')}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {isHost && (
          <View style={styles.controls}>
            <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
              <Ionicons name="chevron-back" size={32} color="#FFF" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.flipButton} onPress={handleFlip}>
              <Ionicons name="sync" size={24} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.flipButtonText}>Flip</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navButton} onPress={handleNext}>
              <Ionicons name="chevron-forward" size={32} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
        
        {!isHost && (
          <Text style={styles.hostNotice}>Waiting for Host to navigate...</Text>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
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
    backgroundColor: '#FEE2E2',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomInfo: {
    alignItems: 'center',
  },
  roomCodeLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    color: '#64748B',
    letterSpacing: 1,
  },
  roomCodeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#0F172A',
    letterSpacing: 2,
  },
  playersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  playersCount: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#3B82F6',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  flashcard: {
    width: '100%',
    minHeight: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 30,
  },
  flashcardFlipped: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
  },
  cardInner: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFront: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBack: {
    alignItems: 'center',
    width: '100%',
  },
  cardLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 16,
  },
  cardWord: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 32,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 40,
  },
  cardWordKapampangan: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
    color: '#3B82F6',
    textAlign: 'center',
    marginBottom: 20,
  },
  flipHint: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#CBD5E1',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 20,
  },
  verticalScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalKulitanContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 30,
    minWidth: '100%',
    paddingVertical: 10,
  },
  verticalWordColumn: {
    alignItems: 'center',
  },
  kulitanResultText: {
    fontFamily: 'Kulitan',
    fontSize: 48,
    color: '#0F172A',
    lineHeight: 60,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
  },
  navButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipButton: {
    flex: 1,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  flipButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  hostNotice: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#64748B',
    marginTop: 20,
    textAlign: 'center',
  },
});
