import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator, Alert, FlatList, Image, Platform, Modal, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useProfile } from '../context/ProfileContext';
import { getRandomQuestions } from '../utils/quizQuestions';

type FriendsScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

type FriendProfile = {
  id: string;
  first_name: string;
  last_name: string;
  xp: number;
  level: number;
  elo_rating: number;
  avatar_url?: string;
};

type FriendRequestItem = {
  id: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  sender_profile?: FriendProfile;
};

export default function FriendsScreen({ navigation }: FriendsScreenProps) {
  const [activeTab, setActiveTab] = useState<'List' | 'Add'>('List');
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequestItem[]>([]);
  const [isRequestsModalVisible, setIsRequestsModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

  const [searchName, setSearchName] = useState('');
  const [searchResults, setSearchResults] = useState<FriendProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [challengeModalFriend, setChallengeModalFriend] = useState<FriendProfile | null>(null);
  
  const { user } = useAuth();
  const { profile } = useProfile();
  const { t, language } = useLanguage();

  useEffect(() => {
    fetchFriends();
    fetchFriendRequests();
  }, []);

  const getTimePassed = (dateString?: string): string => {
    if (!dateString) return 'Recently';
    const created = new Date(dateString).getTime();
    if (isNaN(created)) return 'Recently';
    const now = Date.now();
    const diffMs = Math.max(0, now - created);
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 1) {
      return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    }
    if (diffHours >= 1) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    }
    if (diffMinutes >= 1) {
      return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
    }
    return 'Just now';
  };

  const fetchFriends = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Get friend IDs
      const { data: friendsData, error: friendsError } = await supabase
        .from('friends')
        .select('friend_id')
        .eq('user_id', user.id);
        
      if (friendsError) throw friendsError;
      
      if (!friendsData || friendsData.length === 0) {
        setFriends([]);
        setLoading(false);
        return;
      }
      
      const friendIds = friendsData.map(f => f.friend_id);
      
      // 2. Fetch profiles for those IDs
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, xp, level, elo_rating, avatar_url')
        .in('id', friendIds)
        .order('xp', { ascending: false });
        
      if (profilesError) throw profilesError;
      
      setFriends(profiles || []);
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFriendRequests = async () => {
    if (!user) return;
    setLoadingRequests(true);
    try {
      const { data: requests, error } = await supabase
        .from('friend_requests')
        .select('id, sender_id, receiver_id, created_at')
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.log("Friend requests notice:", error.message);
        setFriendRequests([]);
        return;
      }

      if (requests && requests.length > 0) {
        const senderIds = requests.map(r => r.sender_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, xp, level, elo_rating, avatar_url')
          .in('id', senderIds);

        const profilesMap = new Map((profiles || []).map(p => [p.id, p]));
        const enriched: FriendRequestItem[] = requests.map(r => ({
          ...r,
          sender_profile: profilesMap.get(r.sender_id)
        }));
        setFriendRequests(enriched);
      } else {
        setFriendRequests([]);
      }
    } catch (err) {
      console.error("Error fetching friend requests:", err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const acceptFriendRequest = async (request: FriendRequestItem) => {
    if (!user) return;
    setProcessingRequestId(request.id);
    try {
      // 1. Add reciprocal friendship
      await supabase.from('friends').insert([
        { user_id: user.id, friend_id: request.sender_id },
        { user_id: request.sender_id, friend_id: user.id }
      ]);

      // 2. Remove the request
      await supabase.from('friend_requests').delete().eq('id', request.id);

      Alert.alert(
        "Friend Added!",
        language === 'EN' 
          ? `${request.sender_profile?.first_name || 'Scholar'} is now your friend!`
          : `Kaibigan mo na si ${request.sender_profile?.first_name || 'Scholar'}!`
      );
      
      fetchFriends();
      fetchFriendRequests();
    } catch (err) {
      console.error("Accept error:", err);
      Alert.alert("Error", "Could not accept friend request.");
    } finally {
      setProcessingRequestId(null);
    }
  };

  const declineFriendRequest = async (requestId: string) => {
    setProcessingRequestId(requestId);
    try {
      await supabase.from('friend_requests').delete().eq('id', requestId);
      setFriendRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      console.error("Decline error:", err);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const searchFriend = async () => {
    if (!searchName.trim()) return;
    
    setIsSearching(true);
    setSearchResults([]);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, xp, level, elo_rating, avatar_url')
        .ilike('first_name', `%${searchName}%`)
        .limit(5);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const filteredData = data.filter(u => u.id !== user?.id);
        setSearchResults(filteredData);
      } else {
        Alert.alert("Not Found", language === 'EN' ? "No user found with that name." : "Walang gumagamit na natagpuan sa pangalang iyon.");
      }
    } catch (error) {
      console.error("Search error:", error);
      Alert.alert("Error", "Failed to search for user.");
    } finally {
      setIsSearching(false);
    }
  };

  const addFriend = async (friendId: string) => {
    if (!user) return;
    try {
      // Check if already friends
      const { data: existing } = await supabase
        .from('friends')
        .select('*')
        .eq('user_id', user.id)
        .eq('friend_id', friendId);
        
      if (existing && existing.length > 0) {
        Alert.alert("Info", language === 'EN' ? "You are already friends!" : "Magkaibigan na kayo!");
        return;
      }

      // Check if already requested
      const { data: existingReq } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('sender_id', user.id)
        .eq('receiver_id', friendId);

      if (existingReq && existingReq.length > 0) {
        Alert.alert("Info", language === 'EN' ? "Friend request already sent!" : "Naipadala na ang kahilingan!");
        return;
      }
      
      // Send request with created_at timestamp
      const { error } = await supabase
        .from('friend_requests')
        .insert([{ 
          sender_id: user.id, 
          receiver_id: friendId,
          created_at: new Date().toISOString() 
        }]);
        
      if (error) {
        // Fallback: direct insert to friends if table doesn't exist
        await supabase.from('friends').insert([
          { user_id: user.id, friend_id: friendId },
          { user_id: friendId, friend_id: user.id }
        ]);
      }
      
      Alert.alert("Success!", language === 'EN' ? "Friend request sent." : "Naipadala ang kahilingan ng pagkakaibigan.");
      setSearchName('');
      setSearchResults([]);
      
      // Broadcast real-time ping
      const senderName = profile?.firstName || user.email?.split('@')[0] || 'A user';
      const friendChannel = supabase.channel(`user_${friendId}`);
      friendChannel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await friendChannel.send({
            type: 'broadcast',
            event: 'friend_request',
            payload: { senderName }
          });
          supabase.removeChannel(friendChannel);
        }
      });

    } catch (error) {
      console.error("Add friend error:", error);
      Alert.alert("Error", "Could not send friend request.");
    }
  };

  const executeChallenge = async (friend: FriendProfile) => {
    try {
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      const initialQuestions = getRandomQuestions(30);
      
      const { data: newRoom, error: createError } = await supabase
        .from('quiz_rooms')
        .insert([{ 
          room_code: newCode, 
          host_id: user?.id, 
          status: 'private_waiting', 
          current_question_index: 0, 
          questions: initialQuestions, 
          host_elo: profile?.eloRating || 1000 
        }])
        .select()
        .single();
        
      if (createError) throw createError;
      
      const myName = profile?.firstName ? profile.firstName.toUpperCase() : (user?.email?.split('@')[0]?.toUpperCase() || 'HOST');
      await supabase
        .from('quiz_room_players')
        .insert([{ room_id: newRoom.id, user_id: user?.id, score: 0, player_name: myName }]);

      const friendChannel = supabase.channel(`user_${friend.id}`);
      friendChannel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await friendChannel.send({
            type: 'broadcast',
            event: 'challenge',
            payload: { 
              challengerName: profile?.firstName || user?.email?.split('@')[0] || 'A Scholar',
              roomId: newRoom.id
            }
          });
          supabase.removeChannel(friendChannel);
        }
      });

      navigation.navigate('MultiplayerLobby', { privateRoomId: newRoom.id });
      
    } catch (err) {
      console.error("Challenge error:", err);
      if (Platform.OS === 'web') {
        window.alert("Could not create challenge. Please try again.");
      } else {
        Alert.alert("Error", "Could not create challenge.");
      }
    }
  };

  const challengeFriend = (friend: FriendProfile) => {
    if (!user) return;
    setChallengeModalFriend(friend);
  };

  return (
    <LinearGradient colors={['#FAF5EE', '#E8DAC9']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{language === 'EN' ? 'Friends' : 'Mga Kaibigan'}</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'List' && styles.tabButtonActive]}
            onPress={() => setActiveTab('List')}
          >
            <Text style={[styles.tabText, activeTab === 'List' && styles.tabTextActive]}>
              {language === 'EN' ? 'My Friends' : 'Kaibigan'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'Add' && styles.tabButtonActive]}
            onPress={() => setActiveTab('Add')}
          >
            <Text style={[styles.tabText, activeTab === 'Add' && styles.tabTextActive]}>
              {language === 'EN' ? 'Add Friend' : 'Magdagdag'}
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'List' ? (
          <View style={{ flex: 1 }}>
            {/* Friend Requests Action Banner */}
            <TouchableOpacity 
              style={styles.requestsBanner}
              activeOpacity={0.8}
              onPress={() => {
                fetchFriendRequests();
                setIsRequestsModalVisible(true);
              }}
            >
              <View style={styles.requestsBannerLeft}>
                <View style={styles.requestsIconCircle}>
                  <Ionicons name="person-add" size={20} color="#D1582D" />
                </View>
                <View>
                  <Text style={styles.requestsBannerTitle}>
                    {language === 'EN' ? 'Friend Requests' : 'Mga Kahilingan'}
                  </Text>
                  <Text style={styles.requestsBannerSub}>
                    {friendRequests.length === 0 
                      ? (language === 'EN' ? 'View incoming requests' : 'Tingnan ang mga kahilingan')
                      : `${friendRequests.length} ${language === 'EN' ? 'pending request(s)' : 'nakabinbing kahilingan'}`}
                  </Text>
                </View>
              </View>
              
              <View style={styles.requestsBannerRight}>
                {friendRequests.length > 0 && (
                  <View style={styles.requestsBadge}>
                    <Text style={styles.requestsBadgeText}>{friendRequests.length}</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </View>
            </TouchableOpacity>

            {loading ? (
              <ActivityIndicator size="large" color="#D1582D" style={{ marginTop: 40 }} />
            ) : friends.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={60} color="#94A3B8" />
                <Text style={styles.emptyText}>{language === 'EN' ? "You don't have any friends yet." : "Wala ka pang kaibigan."}</Text>
                <TouchableOpacity style={styles.addFriendBtn} onPress={() => setActiveTab('Add')}>
                  <Text style={styles.addFriendBtnText}>{language === 'EN' ? "Find Friends" : "Maghanap"}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={friends}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item, index }) => (
                  <View style={styles.friendCard}>
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>{index + 1}</Text>
                    </View>
                    {item.avatar_url ? (
                      <Image source={{ uri: item.avatar_url }} style={styles.friendAvatar} />
                    ) : (
                      <View style={styles.friendAvatarPlaceholder}>
                        <Text style={styles.friendAvatarText}>{item.first_name ? item.first_name.charAt(0) : 'S'}</Text>
                      </View>
                    )}
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>{item.first_name || 'Scholar'} {item.last_name || ''}</Text>
                      <Text style={styles.friendStats}>Lvl {item.level || 1} • {item.xp || 0} XP</Text>
                      <Text style={styles.eloStats}>{item.elo_rating || 1000} RP</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.challengeBtn} 
                      activeOpacity={0.7}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      onPress={() => challengeFriend(item)}
                    >
                      <Ionicons name="game-controller" size={20} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </View>
        ) : (
          <View style={styles.addTabContainer}>
            <Text style={styles.searchPrompt}>
              {language === 'EN' ? "Enter your friend's name to send a request:" : "Ilagay ang pangalan upang magpadala ng kahilingan:"}
            </Text>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder={language === 'EN' ? "First Name" : "Pangalan"}
                value={searchName}
                onChangeText={setSearchName}
                autoCapitalize="words"
              />
              <TouchableOpacity style={styles.searchBtn} onPress={searchFriend} disabled={isSearching}>
                {isSearching ? <ActivityIndicator color="#FFF" /> : <Ionicons name="search" size={24} color="#FFF" />}
              </TouchableOpacity>
            </View>

            {searchResults.length > 0 && (
              <FlatList
                data={searchResults}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={styles.resultCard}>
                    {item.avatar_url ? (
                      <Image source={{ uri: item.avatar_url }} style={styles.friendAvatar} />
                    ) : (
                      <View style={styles.friendAvatarPlaceholder}>
                        <Text style={styles.friendAvatarText}>{item.first_name ? item.first_name.charAt(0) : 'S'}</Text>
                      </View>
                    )}
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>{item.first_name || 'Scholar'} {item.last_name || ''}</Text>
                      <Text style={styles.friendStats}>Lvl {item.level || 1} • {item.xp || 0} XP</Text>
                    </View>
                    <TouchableOpacity style={styles.addConfirmBtn} onPress={() => addFriend(item.id)}>
                      <Text style={styles.addConfirmText}>{language === 'EN' ? "Add" : "Idagdag"}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </View>
        )}

        {/* Friend Requests Modal */}
        <Modal 
          visible={isRequestsModalVisible} 
          transparent 
          animationType="slide" 
          onRequestClose={() => setIsRequestsModalVisible(false)}
        >
          <View style={styles.requestsModalOverlay}>
            <View style={styles.requestsModalContainer}>
              <View style={styles.requestsModalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="mail-unread" size={24} color="#D1582D" />
                  <Text style={styles.requestsModalTitle}>
                    {language === 'EN' ? 'Friend Requests' : 'Mga Kahilingan'}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.modalCloseBtn}
                  onPress={() => setIsRequestsModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              {loadingRequests ? (
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#D1582D" />
                </View>
              ) : friendRequests.length === 0 ? (
                <View style={styles.requestsEmptyState}>
                  <Ionicons name="mail-open-outline" size={56} color="#CBD5E1" />
                  <Text style={styles.requestsEmptyTitle}>
                    {language === 'EN' ? 'No pending requests' : 'Walang nakabinbing kahilingan'}
                  </Text>
                  <Text style={styles.requestsEmptySub}>
                    {language === 'EN' 
                      ? 'When someone adds you, their friend request and time sent will appear here.'
                      : 'Kapag may nagdagdag sa iyo, makikita rito ang kanilang kahilingan at oras.'}
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={friendRequests}
                  keyExtractor={item => item.id}
                  contentContainerStyle={{ padding: 16 }}
                  renderItem={({ item }) => {
                    const isProcessing = processingRequestId === item.id;
                    const p = item.sender_profile;
                    
                    return (
                      <View style={styles.requestCard}>
                        {p?.avatar_url ? (
                          <Image source={{ uri: p.avatar_url }} style={styles.requestAvatar} />
                        ) : (
                          <View style={styles.requestAvatarPlaceholder}>
                            <Text style={styles.requestAvatarText}>
                              {p?.first_name ? p.first_name.charAt(0).toUpperCase() : 'S'}
                            </Text>
                          </View>
                        )}
                        
                        <View style={styles.requestInfo}>
                          <Text style={styles.requestName} numberOfLines={1}>
                            {p?.first_name || 'Scholar'} {p?.last_name || ''}
                          </Text>
                          <Text style={styles.requestStats}>
                            Lvl {p?.level || 1} • {p?.xp || 0} XP
                          </Text>
                          
                          {/* Time elapsed badge */}
                          <View style={styles.timeBadge}>
                            <Ionicons name="time-outline" size={13} color="#C2410C" />
                            <Text style={styles.timeBadgeText}>
                              Added {getTimePassed(item.created_at)}
                            </Text>
                          </View>
                        </View>

                        {/* Action buttons */}
                        <View style={styles.requestActions}>
                          <TouchableOpacity
                            style={[styles.requestActionBtn, styles.acceptBtn]}
                            disabled={isProcessing}
                            onPress={() => acceptFriendRequest(item)}
                          >
                            {isProcessing ? (
                              <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                              <>
                                <Ionicons name="checkmark" size={16} color="#FFF" />
                                <Text style={styles.acceptBtnText}>
                                  {language === 'EN' ? 'Accept' : 'Tanggapin'}
                                </Text>
                              </>
                            )}
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.requestActionBtn, styles.declineBtn]}
                            disabled={isProcessing}
                            onPress={() => declineFriendRequest(item.id)}
                          >
                            <Ionicons name="close" size={16} color="#64748B" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  }}
                />
              )}
            </View>
          </View>
        </Modal>

        {/* Custom In-App Challenge Modal */}
        {challengeModalFriend && (
          <Modal visible={true} transparent animationType="fade" onRequestClose={() => setChallengeModalFriend(null)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <LinearGradient colors={['#1E1B4B', '#0F172A']} style={styles.modalCard}>
                  <View style={styles.modalBadge}>
                    <Ionicons name="flash" size={15} color="#F59E0B" />
                    <Text style={styles.modalBadgeText}>DIRECT CHALLENGE</Text>
                  </View>

                  <View style={styles.modalAvatarContainer}>
                    {challengeModalFriend.avatar_url ? (
                      <Image source={{ uri: challengeModalFriend.avatar_url }} style={styles.modalAvatar} />
                    ) : (
                      <View style={styles.modalAvatarPlaceholder}>
                        <Text style={styles.modalAvatarText}>
                          {challengeModalFriend.first_name ? challengeModalFriend.first_name.charAt(0).toUpperCase() : 'S'}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.modalFriendName}>
                    {challengeModalFriend.first_name} {challengeModalFriend.last_name || ''}
                  </Text>
                  
                  <View style={styles.modalStatsRow}>
                    <Text style={styles.modalStatsText}>Lvl {challengeModalFriend.level || 1}</Text>
                    <Text style={styles.modalStatsDot}>•</Text>
                    <Text style={styles.modalStatsText}>{challengeModalFriend.elo_rating || 1000} RP</Text>
                  </View>

                  <Text style={styles.modalSubtitle}>
                    Ready to prove your mastery in Kulitan?
                  </Text>

                  <View style={styles.modalButtonRow}>
                    <TouchableOpacity 
                      style={styles.modalCancelBtn}
                      onPress={() => setChallengeModalFriend(null)}
                    >
                      <Text style={styles.modalCancelText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.modalConfirmBtn}
                      onPress={() => {
                        const target = challengeModalFriend;
                        setChallengeModalFriend(null);
                        executeChallenge(target);
                      }}
                    >
                      <LinearGradient colors={['#D1582D', '#9A3A17']} style={styles.modalConfirmGradient}>
                        <Text style={styles.modalConfirmText}>Start Challenge</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            </View>
          </Modal>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 15,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    color: '#0F172A',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 16,
  },
  tabButtonActive: {
    backgroundColor: '#D1582D',
  },
  tabText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFF',
  },
  requestsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FED7AA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  requestsBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  requestsIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  requestsBannerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#0F172A',
  },
  requestsBannerSub: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#64748B',
  },
  requestsBannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requestsBadge: {
    backgroundColor: '#D1582D',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  requestsBadgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#FFF',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  rankText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#64748B',
  },
  friendAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 12,
  },
  friendAvatarPlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  friendAvatarText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#D1582D',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#0F172A',
  },
  friendStats: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#64748B',
  },
  eloStats: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#10B981',
  },
  challengeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D1582D',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  addFriendBtn: {
    backgroundColor: '#D1582D',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 20,
  },
  addFriendBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: '#FFF',
  },
  addTabContainer: {
    paddingHorizontal: 20,
  },
  searchPrompt: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchBtn: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#D1582D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addConfirmBtn: {
    backgroundColor: '#D1582D',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 14,
  },
  addConfirmText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#FFF',
  },

  // Friend Requests Modal Styles
  requestsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  requestsModalContainer: {
    backgroundColor: '#FAF5EE',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '80%',
    minHeight: 380,
  },
  requestsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  requestsModalTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#0F172A',
  },
  modalCloseBtn: {
    padding: 4,
  },
  requestsEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  requestsEmptyTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#475569',
    marginTop: 16,
    marginBottom: 6,
  },
  requestsEmptySub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  requestAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  requestAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  requestAvatarText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#D1582D',
  },
  requestInfo: {
    flex: 1,
    marginRight: 8,
  },
  requestName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#0F172A',
  },
  requestStats: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#64748B',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  timeBadgeText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#C2410C',
  },
  requestActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  requestActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  acceptBtn: {
    backgroundColor: '#10B981',
  },
  acceptBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#FFF',
  },
  declineBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalCard: {
    padding: 24,
    alignItems: 'center',
  },
  modalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
    marginBottom: 16,
  },
  modalBadgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    color: '#F59E0B',
    letterSpacing: 1,
  },
  modalAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#1E1B4B',
  },
  modalAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  modalAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    backgroundColor: '#312E81',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalAvatarText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 32,
    color: '#FFF',
  },
  modalFriendName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    color: '#FFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  modalStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  modalStatsText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#94A3B8',
  },
  modalStatsDot: {
    color: '#64748B',
  },
  modalSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#CBD5E1',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#94A3B8',
  },
  modalConfirmBtn: {
    flex: 1.4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalConfirmGradient: {
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalConfirmText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#FFF',
  },
});
