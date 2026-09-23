import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, Animated, Platform, Modal, ScrollView, Image } from 'react-native';
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
import { checkAppVersion, VersionCheckResult } from '../services/versionService';
import UpdateModal from '../components/UpdateModal';

type MultiplayerLobbyScreenProps = {
  navigation: StackNavigationProp<any, any>;
  route: any;
};

export default function MultiplayerLobbyScreen({ navigation, route }: MultiplayerLobbyScreenProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [versionInfo, setVersionInfo] = useState<VersionCheckResult | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const { user } = useAuth();
  const { profile } = useProfile();
  const { t, language } = useLanguage();
  const { onlineCount, onlinePlayers, setActivity } = useOnlinePresence();
  const [showPlayersModal, setShowPlayersModal] = useState(false);
  const livePulseAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Broadcast current activity to global presence
  useEffect(() => {
    setActivity('Multiplayer Lobby');
    return () => {
      setActivity('Online');
    };
  }, []);

  // Pulse animation for live active players indicator
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(livePulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(livePulseAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const pulseScale = livePulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.9],
  });

  const pulseOpacity = livePulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.65, 0],
  });

  // Check version on lobby mount
  useEffect(() => {
    async function checkVersionOnLoad() {
      const verResult = await checkAppVersion();
      setVersionInfo(verResult);
      if (verResult.isUpdateRequired || verResult.isUpdateAvailable) {
        setShowUpdateModal(true);
      }
    }
    checkVersionOnLoad();
  }, []);

  useEffect(() => {
    if (route.params?.privateRoomId) {
      setRoomId(route.params.privateRoomId);
      setIsSearching(true);
      setStatusMessage(language === 'EN' ? 'Waiting for friend to accept...' : 'Naghihintay na tanggapin...');
    }
  }, [route.params?.privateRoomId]);

  useEffect(() => {
    let subscription: any;
    
    if (isSearching && roomId) {
      subscription = supabase.channel(`wait_${roomId}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'quiz_rooms', filter: `id=eq.${roomId}` }, (payload) => {
          if (payload.new.status === 'playing') {
            setIsSearching(false);
            if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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

  useEffect(() => {
    if (isSearching) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();

      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [isSearching]);

  const cancelSearch = async () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSearching(false);
    if (roomId) {
      await supabase.from('quiz_rooms').delete().eq('id', roomId);
      setRoomId(null);
    }
  };

  const findMatch = async () => {
    if (!user) return;
    
    // Guard against outdated game versions before joining matchmaking
    if (versionInfo?.isUpdateRequired || versionInfo?.isUpdateAvailable) {
      setShowUpdateModal(true);
      return;
    }

    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSearching(true);
    setStatusMessage(t('searching'));
    setRoomId(null);
    
    try {
      let { data: waitingRooms } = await supabase
        .from('quiz_rooms')
        .select('*')
        .eq('status', 'waiting')
        .neq('host_id', user.id)
        .gte('host_elo', (profile?.eloRating || 1000) - 200)
        .lte('host_elo', (profile?.eloRating || 1000) + 200)
        .limit(1);

      if (!waitingRooms || waitingRooms.length === 0) {
        const fallbackSearch = await supabase
          .from('quiz_rooms')
          .select('*')
          .eq('status', 'waiting')
          .neq('host_id', user.id)
          .limit(1);
        waitingRooms = fallbackSearch.data;
      }

      if (waitingRooms && waitingRooms.length > 0) {
        setStatusMessage(t('match_found'));
        const room = waitingRooms[0];
        
        const myName = profile?.firstName ? profile.firstName.toUpperCase() : 'SCHOLAR 2';
        await supabase
          .from('quiz_room_players')
          .insert([{ room_id: room.id, user_id: user.id, score: 0, player_name: myName }]);
          
        await supabase
          .from('quiz_rooms')
          .update({ status: 'playing' })
          .eq('id', room.id);

        setIsSearching(false);
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        navigation.navigate('QuizBattle', { roomId: room.id, isHost: false });
        
      } else {
        setStatusMessage(t('creating_lobby'));
        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
        const initialQuestions = getRandomQuestions(30);

        const { data: newRoom, error: createError } = await supabase
          .from('quiz_rooms')
          .insert([
            { 
              room_code: newCode, 
              host_id: user.id, 
              status: 'waiting', 
              current_question_index: 0, 
              questions: initialQuestions,
              host_elo: profile?.eloRating || 1000
            }
          ])
          .select()
          .single();

        if (createError) throw createError;

        const myName = profile?.firstName ? profile.firstName.toUpperCase() : 'HOST';
        await supabase
          .from('quiz_room_players')
          .insert([{ room_id: newRoom.id, user_id: user.id, score: 0, player_name: myName }]);

        setRoomId(newRoom.id);
        setStatusMessage(t('waiting_opponent'));
      }
    } catch (err: any) {
      console.error(err);
      setIsSearching(false);
      Alert.alert('Matchmaking Error', 'Could not connect to the server.');
    }
  };

  return (
    <LinearGradient colors={['#FAF6F0', '#F3EAE0', '#EAE0D3']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => {
              if (isSearching) cancelSearch();
              navigation.goBack();
            }} 
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#1E1B18" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerSubtitle}>
              {language === 'EN' ? 'LIVE MULTIPLAYER' : 'REAL-TIME NA LABANAN'}
            </Text>
            <Text style={styles.headerTitle}>{t('multiplayer_battle')}</Text>
          </View>

          <View style={styles.headerRightContainer}>
            {/* Live Active Players Card */}
            <TouchableOpacity 
              style={styles.activePlayersCard}
              activeOpacity={0.75}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowPlayersModal(true);
              }}
            >
              <View style={styles.activePulseWrap}>
                <Animated.View 
                  style={[
                    styles.activePulseRing, 
                    { 
                      transform: [{ scale: pulseScale }], 
                      opacity: pulseOpacity 
                    }
                  ]} 
                />
                <View style={styles.activePulseCore} />
              </View>
              <Ionicons name="people" size={13} color="#059669" />
              <Text style={styles.activePlayersCount}>{onlineCount}</Text>
              <Text style={styles.activePlayersLabel}>
                {language === 'EN' ? (onlineCount === 1 ? 'Online' : 'Online') : 'Aktibo'}
              </Text>
            </TouchableOpacity>

            {/* RP Badge */}
            <View style={styles.headerBadgePill}>
              <Ionicons name="shield-checkmark" size={11} color="#059669" />
              <Text style={styles.headerBadgeText}>{profile.eloRating || 1000} RP</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          
          {/* Central Arena Shield Medallion */}
          <View style={styles.arenaMedallionWrap}>
            <LinearGradient 
              colors={['#059669', '#047857', '#065F46']} 
              style={styles.arenaMedallion}
            >
              <MaterialCommunityIcons name="sword-cross" size={68} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.arenaLiveBadge}>
              <View style={styles.livePulseDot} />
              <Text style={styles.arenaLiveBadgeText}>RANKED 1v1</Text>
            </View>
          </View>

          {/* Title & Description */}
          <Text style={styles.mainTitle}>{t('multiplayer_battle')}</Text>
          <Text style={styles.subtitle}>
            {language === 'EN' 
              ? 'Match with fellow scholars in a real-time speed & accuracy Kulitan duel!' 
              : language === 'PH' 
              ? 'Lumaban sa ibang mga iskolar sa real-time na bilis at wastong pagsagot!' 
              : 'Lumaban karing aliwang iskolar keng real-time Quiz Battle!'}
          </Text>

          {/* Rewards Callout */}
          <View style={styles.rewardBanner}>
            <Ionicons name="trophy" size={18} color="#F59E0B" />
            <Text style={styles.rewardBannerText}>
              {language === 'EN' ? 'Winner earns +25 RP & +50 XP' : 'Mananalo: +25 RP & +50 XP'}
            </Text>
          </View>

          {/* Matchmaking Action / Searching Animation Box */}
          <View style={styles.matchContainer}>
            {isSearching ? (
              <Animated.View style={[styles.searchingBox, { transform: [{ scale: pulseAnim }] }]}>
                <ActivityIndicator size="large" color="#059669" />
                <Text style={styles.searchingText}>{statusMessage}</Text>
                
                <TouchableOpacity style={styles.cancelButton} onPress={cancelSearch} activeOpacity={0.8}>
                  <Text style={styles.cancelButtonText}>{language === 'EN' ? 'Cancel Match' : 'Kanselahin'}</Text>
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <TouchableOpacity style={styles.findMatchButtonWrap} onPress={findMatch} activeOpacity={0.88}>
                <LinearGradient 
                  colors={['#059669', '#047857']} 
                  start={{ x: 0, y: 0 }} 
                  end={{ x: 1, y: 0 }} 
                  style={styles.findMatchButton}
                >
                  <Ionicons name="flash" size={20} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.findMatchText}>{t('find_match')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* In-App Multiplayer Version Check Guard Modal */}
        <UpdateModal
          visible={showUpdateModal}
          versionInfo={versionInfo}
          isForceUpdate={versionInfo?.isUpdateRequired}
          onClose={() => setShowUpdateModal(false)}
        />

        {/* Active Scholars Online Modal */}
        <Modal
          visible={showPlayersModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPlayersModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.playersModalContent}>
              <View style={styles.playersModalHeader}>
                <View style={styles.playersModalTitleRow}>
                  <View style={styles.modalPulseCore} />
                  <Text style={styles.playersModalTitle}>
                    {language === 'EN' ? 'Active Scholars' : 'Mga Aktibong Iskolar'} ({onlineCount})
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setShowPlayersModal(false)} 
                  style={styles.modalCloseBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.playersModalSubtitle}>
                {language === 'EN' 
                  ? 'All scholars currently active across the app' 
                  : 'Lahat ng iskolar na kasalukuyang aktibo sa app'}
              </Text>

              <ScrollView style={styles.playersList} showsVerticalScrollIndicator={false}>
                {onlinePlayers.map((player) => {
                  const isMe = player.id === user?.id;
                  const initials = player.name ? player.name.slice(0, 2).toUpperCase() : 'SC';
                  return (
                    <View key={player.id} style={[styles.playerItemRow, isMe && styles.playerItemRowMe]}>
                      <View style={styles.playerAvatarWrap}>
                        {player.avatarUrl ? (
                          <Image source={{ uri: player.avatarUrl }} style={styles.playerAvatarImg} />
                        ) : (
                          <LinearGradient colors={['#059669', '#047857']} style={styles.playerInitialsBadge}>
                            <Text style={styles.playerInitialsText}>{initials}</Text>
                          </LinearGradient>
                        )}
                        <View style={styles.playerStatusDot} />
                      </View>

                      <View style={styles.playerInfoCol}>
                        <View style={styles.playerNameRow}>
                          <Text style={styles.playerNameText} numberOfLines={1}>
                            {player.name}
                          </Text>
                          {isMe && (
                            <View style={styles.youTag}>
                              <Text style={styles.youTagText}>YOU</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.playerSubText}>
                          🛡️ {player.eloRating || 1000} RP
                        </Text>
                      </View>

                      <View style={styles.playerActivityPill}>
                        <Text style={styles.playerActivityText}>
                          {player.activity || 'Active'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>

              <TouchableOpacity 
                style={styles.modalDoneBtn} 
                onPress={() => setShowPlayersModal(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.modalDoneBtnText}>
                  {language === 'EN' ? 'Close' : 'Isara'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 14 : 36,
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
    color: '#059669',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#1E1B18',
  },
  headerRightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
  },
  activePlayersCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#A7F3D0',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    gap: 4.5,
  },
  activePulseWrap: {
    width: 10,
    height: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activePulseRing: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  activePulseCore: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  activePlayersCount: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#065F46',
  },
  activePlayersLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: '#059669',
  },
  headerBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 3,
  },
  headerBadgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10.5,
    color: '#059669',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  playersModalContent: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '75%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  playersModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  playersModalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalPulseCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  playersModalTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#1E1B18',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playersModalSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14,
  },
  playersList: {
    maxHeight: 320,
  },
  playerItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  playerItemRowMe: {
    borderColor: '#A7F3D0',
    backgroundColor: '#ECFDF5',
  },
  playerAvatarWrap: {
    position: 'relative',
    marginRight: 12,
  },
  playerAvatarImg: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  playerInitialsBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerInitialsText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  playerStatusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  playerInfoCol: {
    flex: 1,
  },
  playerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  playerNameText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#1E1B18',
    maxWidth: 140,
  },
  youTag: {
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  youTagText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    color: '#FFFFFF',
  },
  playerSubText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#059669',
    marginTop: 1,
  },
  playerActivityPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  playerActivityText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10.5,
    color: '#475569',
  },
  modalDoneBtn: {
    marginTop: 14,
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalDoneBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  arenaMedallionWrap: {
    position: 'relative',
    marginBottom: 20,
    alignItems: 'center',
  },
  arenaMedallion: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#A7F3D0',
  },
  arenaLiveBadge: {
    position: 'absolute',
    bottom: -8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#34D399',
    gap: 5,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  arenaLiveBadgeText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  mainTitle: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: '#1E1B18',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#8C7E72',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
  },
  rewardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 6,
    marginBottom: 28,
  },
  rewardBannerText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#B45309',
  },
  matchContainer: {
    width: '100%',
  },
  findMatchButtonWrap: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  findMatchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 18,
  },
  findMatchText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  searchingBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    gap: 12,
  },
  searchingText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#1E1B18',
    textAlign: 'center',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  cancelButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#64748B',
  },
});
