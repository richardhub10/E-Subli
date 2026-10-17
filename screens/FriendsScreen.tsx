import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  TextInput, 
  ActivityIndicator, 
  Alert, 
  FlatList, 
  Image, 
  Platform, 
  Modal, 
  ScrollView 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StackNavigationProp } from '@react-navigation/stack';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useProfile } from '../context/ProfileContext';
import { getRandomQuestions } from '../utils/quizQuestions';
import { BackgroundImages } from '../constants/backgrounds';

type FriendsScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

export type FriendProfile = {
  id: string;
  first_name: string;
  last_name: string;
  xp: number;
  level: number;
  elo_rating: number;
  avatar_url?: string;
  email?: string;
};

export default function FriendsScreen({ navigation }: FriendsScreenProps) {
  const [activeTab, setActiveTab] = useState<'List' | 'Requests' | 'Add'>('List');
  const [mutualFriends, setMutualFriends] = useState<FriendProfile[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendProfile[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Search in Add tab
  const [searchName, setSearchName] = useState('');
  const [searchResults, setSearchResults] = useState<FriendProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Direct challenge modal
  const [challengeModalFriend, setChallengeModalFriend] = useState<FriendProfile | null>(null);
  const [isChallenging, setIsChallenging] = useState(false);

  const { user } = useAuth();
  const { profile } = useProfile();
  const { language } = useLanguage();

  useEffect(() => {
    fetchFriendsData();

    if (!user) return;

    // Real-time listener on friends table changes
    const friendsChannel = supabase
      .channel(`friends_sync_${user.id}_${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friends' }, () => {
        fetchFriendsData();
      })
      .subscribe();

    // Also listen on personal broadcast channel for instant real-time friend alerts
    const personalChannel = supabase.channel(`friends_events_${user.id}`)
      .on('broadcast', { event: 'friend_request' }, () => {
        fetchFriendsData();
      })
      .on('broadcast', { event: 'friend_accepted' }, () => {
        fetchFriendsData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(friendsChannel);
      supabase.removeChannel(personalChannel);
    };
  }, [user?.id]);

  const fetchFriendsData = async () => {
    if (!user) return;
    try {
      // 1. Fetch all friendship records involving the current user
      const { data: rows, error } = await supabase
        .from('friends')
        .select('id, user_id, friend_id, created_at')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

      if (error) throw error;

      const outgoingSet = new Set<string>(); // IDs that current user sent a request to
      const incomingSet = new Set<string>(); // IDs that sent a request to current user

      (rows || []).forEach(r => {
        if (r.user_id === user.id && r.friend_id) {
          outgoingSet.add(r.friend_id);
        } else if (r.friend_id === user.id && r.user_id) {
          incomingSet.add(r.user_id);
        }
      });

      const mutualIds: string[] = [];
      const incomingIds: string[] = [];
      const outgoingIds: string[] = [];

      const allIds = new Set<string>([...outgoingSet, ...incomingSet]);
      allIds.delete(user.id);

      allIds.forEach(id => {
        const isOut = outgoingSet.has(id);
        const isIn = incomingSet.has(id);
        if (isOut && isIn) {
          mutualIds.push(id);
        } else if (isIn && !isOut) {
          incomingIds.push(id);
        } else if (isOut && !isIn) {
          outgoingIds.push(id);
        }
      });

      if (allIds.size === 0) {
        setMutualFriends([]);
        setIncomingRequests([]);
        setOutgoingRequests([]);
        setLoading(false);
        return;
      }

      // 2. Fetch profiles for all involved users
      const { data: profiles, error: profError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, xp, level, elo_rating, avatar_url, email')
        .in('id', Array.from(allIds));

      if (profError) throw profError;

      const profileMap = new Map<string, FriendProfile>();
      (profiles || []).forEach(p => profileMap.set(p.id, p));

      const mutualList: FriendProfile[] = [];
      mutualIds.forEach(id => {
        const p = profileMap.get(id);
        if (p) mutualList.push(p);
      });
      mutualList.sort((a, b) => (b.xp || 0) - (a.xp || 0));

      const incomingList: FriendProfile[] = [];
      incomingIds.forEach(id => {
        const p = profileMap.get(id);
        if (p) incomingList.push(p);
      });

      const outgoingList: FriendProfile[] = [];
      outgoingIds.forEach(id => {
        const p = profileMap.get(id);
        if (p) outgoingList.push(p);
      });

      setMutualFriends(mutualList);
      setIncomingRequests(incomingList);
      setOutgoingRequests(outgoingList);
    } catch (err) {
      console.error('Error fetching friends:', err);
    } finally {
      setLoading(false);
    }
  };

  const notify = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // Search scholars
  const searchFriend = async () => {
    const q = searchName.trim();
    if (!q) return;

    setIsSearching(true);
    setSearchResults([]);
    try {
      const words = q.split(/\s+/);
      let filter = '';

      if (words.length > 1) {
        const first = words[0];
        const second = words.slice(1).join(' ');
        filter = `first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%,and(first_name.ilike.%${first}%,last_name.ilike.%${second}%),and(first_name.ilike.%${second}%,last_name.ilike.%${first}%)`;
      } else {
        filter = `first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, xp, level, elo_rating, avatar_url, email')
        .or(filter)
        .limit(12);

      if (error) throw error;

      if (data && data.length > 0) {
        const filteredData = data.filter(u => u.id !== user?.id);
        if (filteredData.length > 0) {
          setSearchResults(filteredData);
        } else {
          notify("Info", language === 'EN' ? "That is your own account." : "Iyan ang sarili mong account.");
        }
      } else {
        notify("Not Found", language === 'EN' ? "No scholar found with that name or email." : "Walang scholar na natagpuan sa pangalan o email na iyon.");
      }
    } catch (error) {
      console.error("Search error:", error);
      notify("Error", "Failed to search for scholar.");
    } finally {
      setIsSearching(false);
    }
  };

  // Send friend request (non auto-accept: user decides whether to accept or decline)
  const sendFriendRequest = async (targetId: string, targetName?: string) => {
    if (!user) return;
    setActionLoadingId(targetId);
    try {
      // Check if reciprocal already exists
      const isMutual = mutualFriends.some(f => f.id === targetId);
      if (isMutual) {
        notify("Info", language === 'EN' ? "You are already friends!" : "Magkaibigan na kayo!");
        return;
      }

      const isOutgoing = outgoingRequests.some(f => f.id === targetId);
      if (isOutgoing) {
        notify("Info", language === 'EN' ? "Friend request already sent. Awaiting their response." : "Naipadala na ang kahilingan. Naghihintay ng sagot.");
        return;
      }

      const isIncoming = incomingRequests.some(f => f.id === targetId);
      if (isIncoming) {
        // Target already sent us a request, accept directly!
        await acceptFriendRequest(targetId, targetName);
        return;
      }

      // Insert outgoing request record
      const { error: insertError } = await supabase
        .from('friends')
        .insert([{
          user_id: user.id,
          friend_id: targetId,
        }]);

      if (insertError) throw insertError;

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      notify(
        language === 'EN' ? "Request Sent! 🤝" : "Naipadala ang Kahilingan! 🤝",
        language === 'EN'
          ? `Friend request sent to ${targetName || 'the scholar'}. They will decide whether to accept or decline.`
          : `Naipadala ang kahilingan kay ${targetName || 'scholar'}. Sila ang magpapasya kung tatanggapin o tatanggihan.`
      );

      // Real-time broadcast ping with senderId so recipient can accept/decline seamlessly
      const senderName = profile?.firstName || user.email?.split('@')[0] || 'A scholar';
      const friendChannel = supabase.channel(`user_${targetId}`);
      friendChannel.subscribe(async (st) => {
        if (st === 'SUBSCRIBED') {
          await friendChannel.send({
            type: 'broadcast',
            event: 'friend_request',
            payload: { senderName, senderId: user.id }
          });
          setTimeout(() => supabase.removeChannel(friendChannel), 3500);
        }
      });

      await fetchFriendsData();
    } catch (err: any) {
      console.error("Send friend request error:", err);
      notify("Error", err?.message || "Could not send friend request. Please try again.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Accept incoming friend request
  const acceptFriendRequest = async (senderId: string, senderName?: string) => {
    if (!user) return;
    setActionLoadingId(senderId);
    try {
      // Insert reciprocal row to complete mutual friendship
      const { error: insertError } = await supabase
        .from('friends')
        .insert([{
          user_id: user.id,
          friend_id: senderId,
        }]);

      if (insertError) throw insertError;

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      notify(
        language === 'EN' ? "Friend Accepted! 🎉" : "Tinanggap ang Kaibigan! 🎉",
        language === 'EN'
          ? `You and ${senderName || 'this scholar'} are now friends! You can now challenge each other to live duels.`
          : `Kayo ni ${senderName || 'scholar'} ay magkaibigan na! Maaari na kayong maglaban sa live duel.`
      );

      // Broadcast back to sender that their request was accepted
      const senderChannel = supabase.channel(`user_${senderId}`);
      senderChannel.subscribe(async (st) => {
        if (st === 'SUBSCRIBED') {
          await senderChannel.send({
            type: 'broadcast',
            event: 'friend_accepted',
            payload: {
              acceptorName: profile?.firstName || user.email?.split('@')[0] || 'A scholar',
              acceptorId: user.id
            }
          });
          setTimeout(() => supabase.removeChannel(senderChannel), 3500);
        }
      });

      await fetchFriendsData();
    } catch (err: any) {
      console.error("Accept friend request error:", err);
      notify("Error", err?.message || "Could not accept request.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Decline incoming friend request
  const declineFriendRequest = async (senderId: string) => {
    if (!user) return;
    setActionLoadingId(senderId);
    try {
      await supabase
        .from('friends')
        .delete()
        .eq('user_id', senderId)
        .eq('friend_id', user.id);

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }

      await fetchFriendsData();
    } catch (err: any) {
      console.error("Decline request error:", err);
      notify("Error", "Could not decline request.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Cancel outgoing pending request
  const cancelSentRequest = async (recipientId: string) => {
    if (!user) return;
    setActionLoadingId(recipientId);
    try {
      await supabase
        .from('friends')
        .delete()
        .eq('user_id', user.id)
        .eq('friend_id', recipientId);

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }

      await fetchFriendsData();
    } catch (err: any) {
      console.error("Cancel sent request error:", err);
      notify("Error", "Could not cancel request.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Remove mutual friend
  const removeFriend = (friend: FriendProfile) => {
    const confirmMessage = language === 'EN'
      ? `Are you sure you want to remove ${friend.first_name || 'this scholar'} from your friends list?`
      : `Sigurado ka bang nais mong alisin si ${friend.first_name || 'scholar'} sa iyong listahan ng mga kaibigan?`;

    const executeRemove = async () => {
      try {
        await supabase
          .from('friends')
          .delete()
          .or(`and(user_id.eq.${user?.id},friend_id.eq.${friend.id}),and(user_id.eq.${friend.id},friend_id.eq.${user?.id})`);

        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
        await fetchFriendsData();
      } catch (err) {
        console.error("Remove friend error:", err);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(confirmMessage)) {
        executeRemove();
      }
      return;
    }

    Alert.alert(
      language === 'EN' ? "Remove Friend" : "Alisin ang Kaibigan",
      confirmMessage,
      [
        { text: language === 'EN' ? "Cancel" : "Kanselahin", style: "cancel" },
        { 
          text: language === 'EN' ? "Remove" : "Alisin", 
          style: "destructive",
          onPress: executeRemove
        }
      ]
    );
  };

  // Execute Duel challenge to friend
  const executeChallenge = async (friend: FriendProfile) => {
    if (!user) return;
    setIsChallenging(true);
    try {
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      const initialQuestions = getRandomQuestions(30);

      const { data: newRoom, error: createError } = await supabase
        .from('quiz_rooms')
        .insert([{
          room_code: newCode,
          host_id: user.id,
          status: 'private_waiting',
          current_question_index: 0,
          questions: initialQuestions,
          host_elo: profile?.eloRating || 1000
        }])
        .select()
        .single();

      if (createError) throw createError;

      const myName = profile?.firstName ? profile.firstName.toUpperCase() : (user.email?.split('@')[0]?.toUpperCase() || 'HOST');
      await supabase
        .from('quiz_room_players')
        .insert([{ room_id: newRoom.id, user_id: user.id, score: 0, player_name: myName }]);

      // Await subscription and broadcast send so challenge is dispatched before screen navigates
      await new Promise<void>((resolve) => {
        const friendChannel = supabase.channel(`user_${friend.id}`);
        friendChannel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await friendChannel.send({
              type: 'broadcast',
              event: 'challenge',
              payload: {
                challengerName: profile?.firstName || user.email?.split('@')[0] || 'A Scholar',
                roomId: newRoom.id
              }
            });
            setTimeout(() => {
              supabase.removeChannel(friendChannel);
            }, 3500);
            resolve();
          }
        });
        setTimeout(resolve, 1500);
      });

      setChallengeModalFriend(null);
      navigation.navigate('MultiplayerLobby', { privateRoomId: newRoom.id });
    } catch (err: any) {
      console.error("Challenge error:", err);
      notify("Error", err?.message || "Could not create challenge. Please try again.");
    } finally {
      setIsChallenging(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image 
        source={BackgroundImages.ranksAndProfile} 
        style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} 
        resizeMode="cover" 
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color="#1E1B18" />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerSubtitle}>
              {language === 'EN' ? 'SCHOLAR NETWORK' : 'MGA KASAMANG ISKOLAR'}
            </Text>
            <Text style={styles.headerTitle}>
              {language === 'EN' ? 'Friends & Duels' : 'Mga Kaibigan'}
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.headerAddBtn}
            onPress={() => setActiveTab('Add')}
            activeOpacity={0.75}
          >
            <Ionicons name="person-add" size={17} color="#D1582D" />
          </TouchableOpacity>
        </View>

        {/* 3 Navigation Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'List' && styles.tabButtonActive]}
            onPress={() => setActiveTab('List')}
            activeOpacity={0.8}
          >
            <Ionicons 
              name="people" 
              size={15} 
              color={activeTab === 'List' ? '#FFF' : '#64748B'} 
              style={{ marginRight: 5 }} 
            />
            <Text style={[styles.tabText, activeTab === 'List' && styles.tabTextActive]}>
              {language === 'EN' ? 'Friends' : 'Kaibigan'} ({mutualFriends.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'Requests' && styles.tabButtonActive]}
            onPress={() => setActiveTab('Requests')}
            activeOpacity={0.8}
          >
            <Ionicons 
              name="mail-unread" 
              size={15} 
              color={activeTab === 'Requests' ? '#FFF' : '#64748B'} 
              style={{ marginRight: 5 }} 
            />
            <Text style={[styles.tabText, activeTab === 'Requests' && styles.tabTextActive]}>
              {language === 'EN' ? 'Requests' : 'Kahilingan'}
            </Text>
            {incomingRequests.length > 0 && (
              <View style={[styles.tabBadge, activeTab === 'Requests' && styles.tabBadgeActive]}>
                <Text style={[styles.tabBadgeText, activeTab === 'Requests' && styles.tabBadgeTextActive]}>
                  {incomingRequests.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'Add' && styles.tabButtonActive]}
            onPress={() => setActiveTab('Add')}
            activeOpacity={0.8}
          >
            <Ionicons 
              name="search" 
              size={14} 
              color={activeTab === 'Add' ? '#FFF' : '#64748B'} 
              style={{ marginRight: 4 }} 
            />
            <Text style={[styles.tabText, activeTab === 'Add' && styles.tabTextActive]}>
              {language === 'EN' ? 'Find' : 'Maghanap'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: MUTUAL FRIENDS LIST */}
        {activeTab === 'List' && (
          <View style={{ flex: 1 }}>
            {/* Pending Requests Banner Notice */}
            {incomingRequests.length > 0 && (
              <TouchableOpacity 
                style={styles.pendingNoticeBanner}
                onPress={() => setActiveTab('Requests')}
                activeOpacity={0.85}
              >
                <View style={styles.pendingNoticeLeft}>
                  <View style={styles.pendingNoticeIcon}>
                    <Ionicons name="mail" size={18} color="#D1582D" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pendingNoticeTitle}>
                      {language === 'EN' 
                        ? `${incomingRequests.length} Pending Friend Request${incomingRequests.length > 1 ? 's' : ''}` 
                        : `${incomingRequests.length} Bagong Kahilingan sa Kaibigan`}
                    </Text>
                    <Text style={styles.pendingNoticeSub}>
                      {language === 'EN' ? 'Tap to decide whether to accept or decline' : 'Pindutin para tanggapin o tanggihan'}
                    </Text>
                  </View>
                </View>
                <View style={styles.pendingNoticeBadge}>
                  <Text style={styles.pendingNoticeBadgeText}>{incomingRequests.length}</Text>
                  <Ionicons name="chevron-forward" size={14} color="#FFF" />
                </View>
              </TouchableOpacity>
            )}

            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color="#D1582D" />
                <Text style={styles.loadingText}>
                  {language === 'EN' ? 'Loading friends list...' : 'Kinukuha ang listahan ng kaibigan...'}
                </Text>
              </View>
            ) : mutualFriends.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="people-outline" size={48} color="#D1582D" />
                </View>
                <Text style={styles.emptyTitle}>
                  {language === 'EN' ? 'No Friends Yet' : 'Wala Pang Kaibigan'}
                </Text>
                <Text style={styles.emptyText}>
                  {language === 'EN' 
                    ? 'Connect with fellow scholars, accept friend requests, and challenge each other to live 1v1 duels!' 
                    : 'Kumonekta sa ibang iskolar, tanggapin ang mga kahilingan, at maglaban sa 1v1 duels!'}
                </Text>
                <TouchableOpacity 
                  style={styles.emptyActionBtn} 
                  onPress={() => setActiveTab('Add')}
                  activeOpacity={0.85}
                >
                  <Ionicons name="person-add" size={18} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.emptyActionBtnText}>
                    {language === 'EN' ? 'Find Scholars to Add' : 'Maghanap ng Iskolar'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={mutualFriends}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => (
                  <View style={styles.friendCard}>
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>#{index + 1}</Text>
                    </View>

                    {item.avatar_url ? (
                      <Image source={{ uri: item.avatar_url }} style={styles.friendAvatar} />
                    ) : (
                      <View style={styles.friendAvatarPlaceholder}>
                        <Text style={styles.friendAvatarText}>
                          {item.first_name ? item.first_name.charAt(0).toUpperCase() : 'S'}
                        </Text>
                      </View>
                    )}

                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName} numberOfLines={1}>
                        {item.first_name || 'Scholar'} {item.last_name || ''}
                      </Text>
                      <View style={styles.friendStatsRow}>
                        <Text style={styles.friendStats}>Lvl {item.level || 1} • {item.xp || 0} XP</Text>
                        <View style={styles.rpBadge}>
                          <Ionicons name="shield-checkmark" size={10} color="#059669" />
                          <Text style={styles.rpBadgeText}>{item.elo_rating || 1000} RP</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.friendActionGroup}>
                      {/* Duel Button */}
                      <TouchableOpacity 
                        style={styles.challengeBtn} 
                        activeOpacity={0.8}
                        onPress={() => setChallengeModalFriend(item)}
                      >
                        <MaterialCommunityIcons name="sword-cross" size={18} color="#FFF" />
                        <Text style={styles.challengeBtnText}>Duel</Text>
                      </TouchableOpacity>

                      {/* Remove Friend Button */}
                      <TouchableOpacity 
                        style={styles.removeFriendBtn} 
                        activeOpacity={0.7}
                        onPress={() => removeFriend(item)}
                      >
                        <Ionicons name="trash-outline" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        )}

        {/* TAB 2: REQUESTS (INCOMING & OUTGOING) */}
        {activeTab === 'Requests' && (
          <ScrollView 
            style={{ flex: 1 }}
            contentContainerStyle={styles.requestsScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Section 1: Incoming Requests */}
            <View style={styles.requestSectionHeader}>
              <View style={styles.requestSectionTitleRow}>
                <Ionicons name="arrow-down-circle" size={18} color="#059669" />
                <Text style={styles.requestSectionTitle}>
                  {language === 'EN' ? 'Received Requests' : 'Natanggap na Kahilingan'}
                </Text>
              </View>
              <View style={[styles.sectionCountBadge, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                <Text style={[styles.sectionCountText, { color: '#059669' }]}>
                  {incomingRequests.length}
                </Text>
              </View>
            </View>

            {incomingRequests.length === 0 ? (
              <View style={styles.requestsEmptyBox}>
                <Ionicons name="mail-open-outline" size={36} color="#94A3B8" />
                <Text style={styles.requestsEmptyText}>
                  {language === 'EN' ? 'No pending incoming requests.' : 'Walang bagong kahilingan mula sa iba.'}
                </Text>
              </View>
            ) : (
              incomingRequests.map((item) => {
                const isActing = actionLoadingId === item.id;
                return (
                  <View key={item.id} style={styles.requestCard}>
                    {item.avatar_url ? (
                      <Image source={{ uri: item.avatar_url }} style={styles.requestAvatar} />
                    ) : (
                      <View style={styles.requestAvatarPlaceholder}>
                        <Text style={styles.requestAvatarText}>
                          {item.first_name ? item.first_name.charAt(0).toUpperCase() : 'S'}
                        </Text>
                      </View>
                    )}

                    <View style={styles.requestInfo}>
                      <Text style={styles.requestName} numberOfLines={1}>
                        {item.first_name || 'Scholar'} {item.last_name || ''}
                      </Text>
                      <Text style={styles.requestStats}>
                        Lvl {item.level || 1} • {item.elo_rating || 1000} RP
                      </Text>
                      <Text style={styles.requestSubHint}>
                        {language === 'EN' ? 'Wants to connect with you' : 'Nais makipagkaibigan'}
                      </Text>
                    </View>

                    <View style={styles.requestActions}>
                      {isActing ? (
                        <ActivityIndicator size="small" color="#059669" />
                      ) : (
                        <>
                          {/* Decline Button */}
                          <TouchableOpacity 
                            style={styles.declineBtn} 
                            onPress={() => declineFriendRequest(item.id)}
                            activeOpacity={0.75}
                          >
                            <Ionicons name="close" size={16} color="#64748B" />
                            <Text style={styles.declineBtnText}>
                              {language === 'EN' ? 'Decline' : 'Tanggihan'}
                            </Text>
                          </TouchableOpacity>

                          {/* Accept Button */}
                          <TouchableOpacity 
                            style={styles.acceptBtn} 
                            onPress={() => acceptFriendRequest(item.id, item.first_name)}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="checkmark" size={16} color="#FFF" />
                            <Text style={styles.acceptBtnText}>
                              {language === 'EN' ? 'Accept' : 'Tanggapin'}
                            </Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                );
              })
            )}

            {/* Section 2: Outgoing Requests */}
            <View style={[styles.requestSectionHeader, { marginTop: 26 }]}>
              <View style={styles.requestSectionTitleRow}>
                <Ionicons name="arrow-up-circle" size={18} color="#D1582D" />
                <Text style={styles.requestSectionTitle}>
                  {language === 'EN' ? 'Sent Requests (Pending)' : 'Ipinadala (Naghihintay)'}
                </Text>
              </View>
              <View style={[styles.sectionCountBadge, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}>
                <Text style={[styles.sectionCountText, { color: '#D1582D' }]}>
                  {outgoingRequests.length}
                </Text>
              </View>
            </View>

            {outgoingRequests.length === 0 ? (
              <View style={styles.requestsEmptyBox}>
                <Ionicons name="paper-plane-outline" size={36} color="#94A3B8" />
                <Text style={styles.requestsEmptyText}>
                  {language === 'EN' ? 'No pending sent requests.' : 'Walang naghihintay na ipinadalang kahilingan.'}
                </Text>
              </View>
            ) : (
              outgoingRequests.map((item) => {
                const isActing = actionLoadingId === item.id;
                return (
                  <View key={item.id} style={styles.requestCard}>
                    {item.avatar_url ? (
                      <Image source={{ uri: item.avatar_url }} style={styles.requestAvatar} />
                    ) : (
                      <View style={styles.requestAvatarPlaceholder}>
                        <Text style={styles.requestAvatarText}>
                          {item.first_name ? item.first_name.charAt(0).toUpperCase() : 'S'}
                        </Text>
                      </View>
                    )}

                    <View style={styles.requestInfo}>
                      <Text style={styles.requestName} numberOfLines={1}>
                        {item.first_name || 'Scholar'} {item.last_name || ''}
                      </Text>
                      <Text style={styles.requestStats}>
                        Lvl {item.level || 1} • {item.elo_rating || 1000} RP
                      </Text>
                      <View style={styles.awaitingBadge}>
                        <Ionicons name="time-outline" size={11} color="#C2410C" />
                        <Text style={styles.awaitingBadgeText}>
                          {language === 'EN' ? 'Awaiting decision...' : 'Naghihintay ng pasya...'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.requestActions}>
                      {isActing ? (
                        <ActivityIndicator size="small" color="#D1582D" />
                      ) : (
                        <TouchableOpacity 
                          style={styles.cancelSentBtn} 
                          onPress={() => cancelSentRequest(item.id)}
                          activeOpacity={0.75}
                        >
                          <Text style={styles.cancelSentBtnText}>
                            {language === 'EN' ? 'Cancel' : 'Kanselahin'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        )}

        {/* TAB 3: ADD FRIENDS (SEARCH & CONTEXTUAL STATUS) */}
        {activeTab === 'Add' && (
          <ScrollView 
            style={{ flex: 1 }}
            contentContainerStyle={styles.addTabContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.searchCard}>
              <Text style={styles.searchPrompt}>
                {language === 'EN' 
                  ? 'Search scholars by name or email address:' 
                  : 'Maghanap ng iskolar gamit ang pangalan o email:'}
              </Text>
              
              <View style={styles.searchRow}>
                <TextInput
                  style={styles.searchInput}
                  placeholder={language === 'EN' ? "e.g. Juan, Maria, Sicat..." : "hal. Juan, Maria, Sicat..."}
                  placeholderTextColor="#94A3B8"
                  value={searchName}
                  onChangeText={setSearchName}
                  onSubmitEditing={searchFriend}
                  returnKeyType="search"
                  autoCapitalize="words"
                />
                {searchName.length > 0 && (
                  <TouchableOpacity 
                    style={styles.clearSearchBtn}
                    onPress={() => setSearchName('')}
                  >
                    <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={styles.searchBtn} 
                  onPress={searchFriend} 
                  disabled={isSearching}
                  activeOpacity={0.8}
                >
                  {isSearching ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Ionicons name="search" size={20} color="#FFF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Results */}
            {searchResults.length > 0 && (
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsHeader}>
                  {language === 'EN' ? `Search Results (${searchResults.length})` : `Mga Nahanap (${searchResults.length})`}
                </Text>

                {searchResults.map((item) => {
                  const isMutual = mutualFriends.some(f => f.id === item.id);
                  const isSentPending = outgoingRequests.some(f => f.id === item.id);
                  const isReceivedPending = incomingRequests.some(f => f.id === item.id);
                  const isActing = actionLoadingId === item.id;

                  return (
                    <View key={item.id} style={styles.resultCard}>
                      {item.avatar_url ? (
                        <Image source={{ uri: item.avatar_url }} style={styles.friendAvatar} />
                      ) : (
                        <View style={styles.friendAvatarPlaceholder}>
                          <Text style={styles.friendAvatarText}>
                            {item.first_name ? item.first_name.charAt(0).toUpperCase() : 'S'}
                          </Text>
                        </View>
                      )}

                      <View style={styles.friendInfo}>
                        <Text style={styles.friendName} numberOfLines={1}>
                          {item.first_name || 'Scholar'} {item.last_name || ''}
                        </Text>
                        <Text style={styles.friendStats}>
                          Lvl {item.level || 1} • {item.elo_rating || 1000} RP
                        </Text>
                      </View>

                      {isActing ? (
                        <ActivityIndicator size="small" color="#D1582D" />
                      ) : isMutual ? (
                        <View style={styles.alreadyFriendBadge}>
                          <Ionicons name="checkmark-circle" size={16} color="#059669" />
                          <Text style={styles.alreadyFriendText}>
                            {language === 'EN' ? 'Friends' : 'Kaibigan'}
                          </Text>
                        </View>
                      ) : isSentPending ? (
                        <TouchableOpacity 
                          style={styles.pendingBadgeBtn}
                          onPress={() => cancelSentRequest(item.id)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="time" size={13} color="#C2410C" />
                          <Text style={styles.pendingBadgeText}>
                            {language === 'EN' ? 'Pending' : 'Naghihintay'}
                          </Text>
                        </TouchableOpacity>
                      ) : isReceivedPending ? (
                        <TouchableOpacity 
                          style={styles.acceptResultBtn}
                          onPress={() => acceptFriendRequest(item.id, item.first_name)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="checkmark" size={14} color="#FFF" />
                          <Text style={styles.acceptResultText}>
                            {language === 'EN' ? 'Accept' : 'Tanggapin'}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity 
                          style={styles.addConfirmBtn} 
                          onPress={() => sendFriendRequest(item.id, item.first_name)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="person-add" size={14} color="#FFF" style={{ marginRight: 4 }} />
                          <Text style={styles.addConfirmText}>
                            {language === 'EN' ? 'Add Friend' : 'Idagdag'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>
        )}

        {/* Custom Duel Confirmation Modal */}
        {challengeModalFriend && (
          <Modal 
            visible={true} 
            transparent 
            animationType="fade" 
            onRequestClose={() => !isChallenging && setChallengeModalFriend(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <LinearGradient colors={['#1E1B4B', '#0F172A']} style={styles.modalCard}>
                  <View style={styles.modalBadge}>
                    <Ionicons name="flash" size={14} color="#F59E0B" />
                    <Text style={styles.modalBadgeText}>DIRECT 1V1 DUEL</Text>
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
                    {language === 'EN' 
                      ? 'Challenge your friend to a real-time Kulitan speed & accuracy duel!' 
                      : 'Hamunin ang iyong kaibigan sa live na labanan ng bilis at talas sa Kulitan!'}
                  </Text>

                  <View style={styles.modalButtonRow}>
                    <TouchableOpacity 
                      style={styles.modalCancelBtn}
                      onPress={() => setChallengeModalFriend(null)}
                      disabled={isChallenging}
                    >
                      <Text style={styles.modalCancelText}>
                        {language === 'EN' ? 'Cancel' : 'Kanselahin'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.modalConfirmBtn}
                      onPress={() => executeChallenge(challengeModalFriend)}
                      disabled={isChallenging}
                    >
                      <LinearGradient colors={['#D1582D', '#9A3A17']} style={styles.modalConfirmGradient}>
                        {isChallenging ? (
                          <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                          <Text style={styles.modalConfirmText}>
                            {language === 'EN' ? 'Send Challenge' : 'Ipadala ang Hamon'}
                          </Text>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            </View>
          </Modal>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#FAF5EE',
  },
  safeArea: { 
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 14 : 36,
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
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#1E1B18',
  },
  headerAddBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EDE3D8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  tabButtonActive: {
    backgroundColor: '#D1582D',
  },
  tabText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12.5,
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    marginLeft: 4,
  },
  tabBadgeActive: {
    backgroundColor: '#FFFFFF',
  },
  tabBadgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  tabBadgeTextActive: {
    color: '#D1582D',
  },
  pendingNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF7ED',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pendingNoticeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  pendingNoticeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingNoticeTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#C2410C',
  },
  pendingNoticeSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#8C7E72',
  },
  pendingNoticeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1582D',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 2,
  },
  pendingNoticeBadgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    color: '#FFF',
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  loadingText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: '#8C7E72',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 28,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
  },
  emptyTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#1E1B18',
    marginBottom: 6,
  },
  emptyText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#8C7E72',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1582D',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  emptyActionBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13.5,
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#EDE3D8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  rankText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    color: '#64748B',
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  friendAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  friendAvatarText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#D1582D',
  },
  friendInfo: {
    flex: 1,
    marginRight: 8,
  },
  friendName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14.5,
    color: '#1E1B18',
  },
  friendStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  friendStats: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11.5,
    color: '#8C7E72',
  },
  rpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  rpBadgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    color: '#059669',
  },
  friendActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  challengeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  challengeBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11.5,
    color: '#FFFFFF',
  },
  removeFriendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF1F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECDD3',
  },

  // Requests Screen
  requestsScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  requestSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  requestSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  requestSectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#1E1B18',
  },
  sectionCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  sectionCountText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
  },
  requestsEmptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EDE3D8',
    gap: 6,
  },
  requestsEmptyText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#8C7E72',
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 18,
    marginBottom: 9,
    borderWidth: 1.5,
    borderColor: '#EDE3D8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  requestAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  requestAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
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
    fontSize: 14,
    color: '#1E1B18',
  },
  requestStats: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11.5,
    color: '#8C7E72',
  },
  requestSubHint: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10.5,
    color: '#059669',
    marginTop: 1,
  },
  awaitingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  awaitingBadgeText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10.5,
    color: '#C2410C',
  },
  requestActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#059669',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 12,
  },
  acceptBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11.5,
    color: '#FFFFFF',
  },
  declineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 12,
  },
  declineBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#64748B',
  },
  cancelSentBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  cancelSentBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11.5,
    color: '#64748B',
  },

  // Add Friends Tab
  addTabContent: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  searchCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#EDE3D8',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  searchPrompt: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12.5,
    color: '#1E1B18',
    marginBottom: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    paddingRight: 36,
    fontFamily: 'Poppins_500Medium',
    fontSize: 13.5,
    color: '#1E1B18',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  clearSearchBtn: {
    position: 'absolute',
    right: 56,
    padding: 4,
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#D1582D',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  resultsContainer: {
    marginTop: 4,
  },
  resultsHeader: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#1E1B18',
    marginBottom: 10,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 18,
    marginBottom: 9,
    borderWidth: 1.5,
    borderColor: '#EDE3D8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  addConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1582D',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  addConfirmText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11.5,
    color: '#FFFFFF',
  },
  alreadyFriendBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  alreadyFriendText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    color: '#059669',
  },
  pendingBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  pendingBadgeText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#C2410C',
  },
  acceptResultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#059669',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 12,
  },
  acceptResultText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11.5,
    color: '#FFFFFF',
  },

  // Direct Challenge Modal
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
    lineHeight: 18,
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
