import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator, Alert, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

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
};

export default function FriendsScreen({ navigation }: FriendsScreenProps) {
  const [activeTab, setActiveTab] = useState<'List' | 'Add'>('List');
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [searchResults, setSearchResults] = useState<FriendProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const { user } = useAuth();
  const { t, language } = useLanguage();

  useEffect(() => {
    if (activeTab === 'List') {
      fetchFriends();
    }
  }, [activeTab]);

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
        .select('id, first_name, last_name, xp, level, elo_rating')
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

  const searchFriend = async () => {
    if (!searchName.trim()) return;
    
    setIsSearching(true);
    setSearchResults([]);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, xp, level, elo_rating')
        .ilike('first_name', `%${searchName}%`)
        .limit(5);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Filter out the current user just in case
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
      
      const { error } = await supabase
        .from('friends')
        .insert([{ user_id: user.id, friend_id: friendId }]);
        
      if (error) throw error;
      
      Alert.alert("Success!", language === 'EN' ? "Friend added successfully." : "Tagumpay na naidagdag ang kaibigan.");
      setSearchName('');
      setSearchResults([]);
      
      // Also add reverse friendship for simplicity (optional, but good for UX)
      await supabase.from('friends').insert([{ user_id: friendId, friend_id: user.id }]);
      
    } catch (error) {
      console.error("Add friend error:", error);
      Alert.alert("Error", "Could not add friend.");
    }
  };

  const challengeFriend = () => {
    // Navigate to multiplayer lobby and automatically start a room, maybe copy code.
    Alert.alert(
      "Direct Challenge", 
      language === 'EN' ? "To challenge a friend, go to Multiplayer and share your room code!" : "Upang hamunin ang kaibigan, pumunta sa Multiplayer at ibahagi ang room code!"
    );
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
          loading ? (
            <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 50 }} />
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
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{item.first_name || 'Scholar'} {item.last_name || ''}</Text>
                    <Text style={styles.friendStats}>Lvl {item.level || 1} • {item.xp || 0} XP</Text>
                    <Text style={styles.eloStats}>Elo: {item.elo_rating || 1000}</Text>
                  </View>
                  <TouchableOpacity style={styles.challengeBtn} onPress={challengeFriend}>
                    <Ionicons name="game-controller" size={18} color="#FFF" />
                  </TouchableOpacity>
                </View>
              )}
            />
          )
        ) : (
          <View style={styles.addTabContainer}>
            <Text style={styles.searchPrompt}>
              {language === 'EN' ? "Enter your friend's name to add them:" : "Ilagay ang pangalan ng iyong kaibigan upang idagdag:"}
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
  headerTitle: {
    color: '#0F172A',
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#64748B',
  },
  tabTextActive: {
    color: '#3B82F6',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  friendCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#0F172A',
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
    fontSize: 13,
    color: '#64748B',
  },
  eloStats: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#8B5CF6',
  },
  challengeBtn: {
    backgroundColor: '#EF4444',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
    marginBottom: 24,
  },
  addFriendBtn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  addFriendBtnText: {
    color: '#FFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
  },
  addTabContainer: {
    paddingHorizontal: 20,
  },
  searchPrompt: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    color: '#334155',
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchBtn: {
    backgroundColor: '#3B82F6',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  addConfirmBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addConfirmText: {
    color: '#FFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
  }
});
