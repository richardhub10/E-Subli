import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert, Modal, Pressable } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

type LeaderboardScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

type LeaderboardEntry = {
  id: string;
  name: string;
  xp: number;
  level: number;
};

export default function LeaderboardScreen({ navigation }: LeaderboardScreenProps) {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<LeaderboardEntry | null>(null);
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const { user } = useAuth();
  const { t, language } = useLanguage();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('xp', { ascending: false })
          .limit(50);
          
        if (error) throw error;

        const users: LeaderboardEntry[] = data.map((doc: any) => {
          let name = 'Anonymous Scholar';
          if (doc.first_name) {
            name = doc.first_name + (doc.last_name ? ` ${doc.last_name}` : '');
          }
          return {
            id: doc.id,
            name: name,
            xp: doc.xp || 0,
            level: doc.level || 1,
          };
        });

        setLeaders(users);
      } catch (error) {
        console.error("Error fetching leaderboard: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const handleAddFriend = async (friendId: string, friendName: string) => {
    if (!user) return;
    if (user.id === friendId) {
      Alert.alert("Info", language === 'EN' ? "You can't add yourself." : "Hindi mo maaaring idagdag ang sarili mo.");
      setSelectedUser(null);
      return;
    }

    setIsAddingFriend(true);
    try {
      // Check if already friends
      const { data: existing } = await supabase
        .from('friends')
        .select('*')
        .eq('user_id', user.id)
        .eq('friend_id', friendId);
        
      if (existing && existing.length > 0) {
        Alert.alert("Info", language === 'EN' ? "You are already friends!" : "Magkaibigan na kayo!");
        setSelectedUser(null);
        return;
      }
      
      const { error } = await supabase
        .from('friends')
        .insert([{ user_id: user.id, friend_id: friendId }]);
        
      if (error) throw error;
      
      Alert.alert("Success!", language === 'EN' ? "Friend added successfully." : "Tagumpay na naidagdag ang kaibigan.");
      
      // Also add reverse friendship for simplicity
      await supabase.from('friends').insert([{ user_id: friendId, friend_id: user.id }]);
      setSelectedUser(null);
    } catch (error) {
      console.error("Add friend error:", error);
      Alert.alert("Error", "Could not add friend.");
    } finally {
      setIsAddingFriend(false);
    }
  };

  const renderItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const isTopThree = index < 3;
    const rankColors = ['#FBBF24', '#94A3B8', '#D97706']; // Gold, Silver, Bronze

    return (
      <TouchableOpacity 
        style={[styles.entryCard, isTopThree && styles.topEntryCard]}
        onPress={() => setSelectedUser(item)}
      >
        <View style={styles.rankContainer}>
          <Text style={[styles.rankText, isTopThree && { color: rankColors[index] }]}>
            #{index + 1}
          </Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.emailText} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.levelText}>{language === 'EN' ? 'Lvl' : 'Antas'} {item.level}</Text>
        </View>
        <View style={styles.xpContainer}>
          <Text style={styles.xpText}>{item.xp} XP</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#FAF5EE', '#E8DAC9']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('leaderboard')}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Friends')} style={styles.friendsButton}>
          <Ionicons name="people" size={24} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#D1582D" />
        ) : leaders.length === 0 ? (
          <Text style={styles.emptyText}>{t('no_challengers_yet')}</Text>
        ) : (
          <FlatList
            data={leaders}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Profile Modal */}
      <Modal
        visible={!!selectedUser}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedUser(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedUser(null)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Ionicons name="person-circle" size={64} color="#3B82F6" />
              <Text style={styles.modalName}>{selectedUser?.name}</Text>
              <Text style={styles.modalLevel}>Lvl {selectedUser?.level} • {selectedUser?.xp} XP</Text>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalAddButton}
                onPress={() => selectedUser && handleAddFriend(selectedUser.id, selectedUser.name)}
                disabled={isAddingFriend}
              >
                {isAddingFriend ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="person-add" size={20} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.modalAddText}>{language === 'EN' ? 'Add Friend' : 'Idagdag'}</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setSelectedUser(null)}
              >
                <Text style={styles.modalCancelText}>{language === 'EN' ? 'Cancel' : 'Kanselahin'}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  friendsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContainer: {
    paddingBottom: 40,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#64748B',
  },
  entryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  topEntryCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#D1582D',
    borderWidth: 1,
  },
  rankContainer: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#0F172A',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  emailText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0F172A',
  },
  levelText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
    marginTop: 2,
  },
  xpContainer: {
    backgroundColor: '#D1582D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  xpText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    color: '#0F172A',
    marginTop: 8,
  },
  modalLevel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#64748B',
  },
  modalActions: {
    width: '100%',
    gap: 12,
  },
  modalAddButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalAddText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#FFF',
  },
  modalCancelButton: {
    paddingVertical: 14,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#F1F5F9',
  },
  modalCancelText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#64748B',
  },
});
