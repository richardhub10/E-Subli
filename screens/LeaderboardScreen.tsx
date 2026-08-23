import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert, Modal, Pressable, Image, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import FloatingBottomBar from '../components/FloatingBottomBar';

type LeaderboardScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

type LeaderboardEntry = {
  id: string;
  name: string;
  xp: number;
  level: number;
  eloRating: number;
  avatarUrl?: string;
};

export default function LeaderboardScreen({ navigation }: LeaderboardScreenProps) {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<LeaderboardEntry | null>(null);
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const { user } = useAuth();
  const { t, language } = useLanguage();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('xp', { ascending: false })
        .limit(50);
        
      if (error) throw error;

      const users: LeaderboardEntry[] = (data || []).map((doc: any) => {
        let name = 'Anonymous Scholar';
        if (doc.first_name) {
          name = doc.first_name + (doc.last_name ? ` ${doc.last_name}` : '');
        }
        return {
          id: doc.id,
          name: name,
          xp: doc.xp || 0,
          level: doc.level || 1,
          eloRating: doc.elo_rating || 1000,
          avatarUrl: doc.avatar_url,
        };
      });

      setLeaders(users);
    } catch (error) {
      console.error("Error fetching leaderboard: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (friendId: string) => {
    if (!user) return;
    if (user.id === friendId) {
      Alert.alert("Info", language === 'EN' ? "You can't add yourself." : "Hindi mo maaaring idagdag ang sarili mo.");
      setSelectedUser(null);
      return;
    }

    setIsAddingFriend(true);
    try {
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
      
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success!", language === 'EN' ? "Friend added successfully." : "Tagumpay na naidagdag ang kaibigan.");
      
      await supabase.from('friends').insert([{ user_id: friendId, friend_id: user.id }]);
      setSelectedUser(null);
    } catch (error) {
      console.error("Add friend error:", error);
      Alert.alert("Error", "Could not add friend.");
    } finally {
      setIsAddingFriend(false);
    }
  };

  const top3 = leaders.slice(0, 3);
  const remainingLeaders = leaders.slice(3);

  const renderItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const actualRank = index + 4;
    const isCurrentUser = user && item.id === user.id;

    return (
      <TouchableOpacity 
        style={[styles.entryCard, isCurrentUser && styles.entryCardSelf]}
        onPress={() => {
          if (Platform.OS !== 'web') Haptics.selectionAsync();
          setSelectedUser(item);
        }}
        activeOpacity={0.75}
      >
        <View style={styles.rankBadgeBox}>
          <Text style={styles.rankBadgeNum}>#{actualRank}</Text>
        </View>
        
        {item.avatarUrl ? (
          <Image source={{ uri: item.avatarUrl }} style={styles.entryAvatar} />
        ) : (
          <View style={styles.entryAvatarPlaceholder}>
            <Text style={styles.entryAvatarText}>{item.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        
        <View style={styles.infoContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={styles.nameText} numberOfLines={1}>{item.name}</Text>
            {isCurrentUser && (
              <View style={styles.youBadge}>
                <Text style={styles.youBadgeText}>YOU</Text>
              </View>
            )}
          </View>
          <Text style={styles.levelSubText}>{language === 'EN' ? 'Level' : 'Antas'} {item.level} Scholar</Text>
        </View>

        <View style={styles.xpPill}>
          <Ionicons name="flash" size={12} color="#D97706" />
          <Text style={styles.xpValText}>{item.xp} XP</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#FAF6F0', '#F3EAE0', '#EAE0D3']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#1E1B18" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerSubtitle}>
            {language === 'EN' ? 'GLOBAL RANKINGS' : 'PANGKALAHATANG RANGGO'}
          </Text>
          <Text style={styles.headerTitle}>{t('leaderboard')}</Text>
        </View>

        <View style={styles.trophyIconBox}>
          <Ionicons name="trophy" size={18} color="#D97706" />
        </View>
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#D1582D" />
            <Text style={styles.loadingText}>
              {language === 'EN' ? 'Loading top scholars...' : 'Kinukuha ang mga iskolar...'}
            </Text>
          </View>
        ) : leaders.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="podium-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>{t('no_challengers_yet')}</Text>
          </View>
        ) : (
          <FlatList
            data={remainingLeaders}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              top3.length > 0 ? (
                <View style={styles.podiumContainer}>
                  {/* Rank 2 (Silver) */}
                  {top3[1] && (
                    <TouchableOpacity 
                      style={[styles.podiumColumn, styles.podiumCol2]} 
                      onPress={() => setSelectedUser(top3[1])}
                      activeOpacity={0.8}
                    >
                      <View style={styles.silverCrown}>
                        <Ionicons name="medal" size={18} color="#94A3B8" />
                      </View>
                      <View style={[styles.podiumAvatarBox, { borderColor: '#94A3B8' }]}>
                        {top3[1].avatarUrl ? (
                          <Image source={{ uri: top3[1].avatarUrl }} style={styles.podiumAvatarImg} />
                        ) : (
                          <Text style={styles.podiumAvatarInitial}>{top3[1].name.charAt(0)}</Text>
                        )}
                        <View style={[styles.podiumRankBadge, { backgroundColor: '#94A3B8' }]}>
                          <Text style={styles.podiumRankBadgeText}>2</Text>
                        </View>
                      </View>
                      <Text style={styles.podiumName} numberOfLines={1}>{top3[1].name}</Text>
                      <Text style={styles.podiumXp}>{top3[1].xp} XP</Text>
                      <View style={[styles.podiumPedestal, styles.pedestalSilver]} />
                    </TouchableOpacity>
                  )}

                  {/* Rank 1 (Gold) */}
                  {top3[0] && (
                    <TouchableOpacity 
                      style={[styles.podiumColumn, styles.podiumCol1]} 
                      onPress={() => setSelectedUser(top3[0])}
                      activeOpacity={0.8}
                    >
                      <View style={styles.goldCrown}>
                        <MaterialCommunityIcons name="crown" size={24} color="#F59E0B" />
                      </View>
                      <View style={[styles.podiumAvatarBox, styles.podiumAvatarBoxGold]}>
                        {top3[0].avatarUrl ? (
                          <Image source={{ uri: top3[0].avatarUrl }} style={styles.podiumAvatarImg} />
                        ) : (
                          <Text style={styles.podiumAvatarInitial}>{top3[0].name.charAt(0)}</Text>
                        )}
                        <View style={[styles.podiumRankBadge, { backgroundColor: '#F59E0B' }]}>
                          <Text style={styles.podiumRankBadgeText}>1</Text>
                        </View>
                      </View>
                      <Text style={styles.podiumName} numberOfLines={1}>{top3[0].name}</Text>
                      <Text style={[styles.podiumXp, { color: '#B45309', fontFamily: 'Poppins_700Bold' }]}>
                        {top3[0].xp} XP
                      </Text>
                      <View style={[styles.podiumPedestal, styles.pedestalGold]} />
                    </TouchableOpacity>
                  )}

                  {/* Rank 3 (Bronze) */}
                  {top3[2] && (
                    <TouchableOpacity 
                      style={[styles.podiumColumn, styles.podiumCol3]} 
                      onPress={() => setSelectedUser(top3[2])}
                      activeOpacity={0.8}
                    >
                      <View style={styles.bronzeCrown}>
                        <Ionicons name="medal" size={18} color="#D97706" />
                      </View>
                      <View style={[styles.podiumAvatarBox, { borderColor: '#D97706' }]}>
                        {top3[2].avatarUrl ? (
                          <Image source={{ uri: top3[2].avatarUrl }} style={styles.podiumAvatarImg} />
                        ) : (
                          <Text style={styles.podiumAvatarInitial}>{top3[2].name.charAt(0)}</Text>
                        )}
                        <View style={[styles.podiumRankBadge, { backgroundColor: '#D97706' }]}>
                          <Text style={styles.podiumRankBadgeText}>3</Text>
                        </View>
                      </View>
                      <Text style={styles.podiumName} numberOfLines={1}>{top3[2].name}</Text>
                      <Text style={styles.podiumXp}>{top3[2].xp} XP</Text>
                      <View style={[styles.podiumPedestal, styles.pedestalBronze]} />
                    </TouchableOpacity>
                  )}
                </View>
              ) : null
            }
          />
        )}
      </View>

      {/* User Details & Friend Modal */}
      <Modal
        visible={!!selectedUser}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedUser(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedUser(null)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={styles.modalAvatarContainer}>
                {selectedUser?.avatarUrl ? (
                  <Image source={{ uri: selectedUser.avatarUrl }} style={styles.modalAvatar} />
                ) : (
                  <Text style={styles.modalAvatarInitial}>
                    {selectedUser?.name.charAt(0).toUpperCase() || 'S'}
                  </Text>
                )}
              </View>
              <Text style={styles.modalName}>{selectedUser?.name}</Text>
              <Text style={styles.modalLevel}>
                {language === 'EN' ? 'Level' : 'Antas'} {selectedUser?.level} Scholar • {selectedUser?.xp} XP
              </Text>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalAddButton}
                onPress={() => selectedUser && handleAddFriend(selectedUser.id)}
                disabled={isAddingFriend}
                activeOpacity={0.85}
              >
                {isAddingFriend ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="person-add" size={18} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.modalAddText}>{language === 'EN' ? 'Add Friend' : 'Idagdag'}</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setSelectedUser(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>{language === 'EN' ? 'Close' : 'Isara'}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Floating Curved Notch Bottom Navigation Bar */}
      <FloatingBottomBar activeTab="Leaderboard" navigation={navigation} />
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
    paddingTop: Platform.OS === 'ios' ? 56 : 38,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerSubtitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 9,
    color: '#D1582D',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#1E1B18',
  },
  trophyIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  content: {
    flex: 1,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: '#8C7E72',
  },
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: '#8C7E72',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 10,
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingVertical: 14,
    marginBottom: 10,
    gap: 8,
  },
  podiumColumn: {
    flex: 1,
    alignItems: 'center',
  },
  podiumCol1: {
    marginTop: -16,
  },
  podiumCol2: {
    marginTop: 10,
  },
  podiumCol3: {
    marginTop: 20,
  },
  goldCrown: {
    marginBottom: 4,
  },
  silverCrown: {
    marginBottom: 4,
  },
  bronzeCrown: {
    marginBottom: 4,
  },
  podiumAvatarBox: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    position: 'relative',
    marginBottom: 6,
  },
  podiumAvatarBoxGold: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderColor: '#F59E0B',
    borderWidth: 3,
  },
  podiumAvatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 34,
  },
  podiumAvatarInitial: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
  },
  podiumRankBadge: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: '#F59E0B',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  podiumRankBadgeText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
  },
  podiumName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#1E1B18',
    textAlign: 'center',
    marginBottom: 2,
  },
  podiumXp: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: '#8C7E72',
    marginBottom: 6,
  },
  podiumPedestal: {
    width: '100%',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  pedestalGold: {
    height: 50,
    backgroundColor: '#FDE68A',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  pedestalSilver: {
    height: 38,
    backgroundColor: '#E2E8F0',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  pedestalBronze: {
    height: 28,
    backgroundColor: '#FED7AA',
    borderWidth: 1.5,
    borderColor: '#FDBA74',
  },
  entryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EDE3D8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  entryCardSelf: {
    borderColor: '#FED7AA',
    backgroundColor: '#FFFDF9',
  },
  rankBadgeBox: {
    width: 32,
    alignItems: 'center',
  },
  rankBadgeNum: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#8C7E72',
  },
  entryAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
  },
  entryAvatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  entryAvatarText: {
    color: '#F59E0B',
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
  },
  infoContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
    color: '#1E1B18',
  },
  youBadge: {
    backgroundColor: '#D1582D',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  youBadgeText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 8,
  },
  levelSubText: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: '#8C7E72',
  },
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    gap: 4,
  },
  xpValText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    color: '#B45309',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalAvatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  modalAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
  },
  modalAvatarInitial: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: '#F59E0B',
  },
  modalName: {
    fontSize: 17,
    fontFamily: 'Poppins_700Bold',
    color: '#1E1B18',
    marginBottom: 2,
  },
  modalLevel: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#8C7E72',
  },
  modalActions: {
    width: '100%',
    gap: 8,
  },
  modalAddButton: {
    flexDirection: 'row',
    backgroundColor: '#D1582D',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalAddText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
  },
  modalCancelButton: {
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  modalCancelText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#64748B',
  },
});
