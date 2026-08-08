import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

type LeaderboardScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

type LeaderboardEntry = {
  id: string;
  email: string;
  xp: number;
  level: number;
};

export default function LeaderboardScreen({ navigation }: LeaderboardScreenProps) {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(50));
        const querySnapshot = await getDocs(q);
        const fetchedLeaders: LeaderboardEntry[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.email) {
            fetchedLeaders.push({
              id: doc.id,
              email: data.email,
              xp: data.xp || 0,
              level: data.level || 1,
            });
          }
        });
        setLeaders(fetchedLeaders);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const renderItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const isTopThree = index < 3;
    const rankColors = ['#FBBF24', '#94A3B8', '#D97706']; // Gold, Silver, Bronze

    return (
      <View style={[styles.entryCard, isTopThree && styles.topEntryCard]}>
        <View style={styles.rankContainer}>
          <Text style={[styles.rankText, isTopThree && { color: rankColors[index] }]}>
            #{index + 1}
          </Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.emailText}>{item.email.split('@')[0]}</Text>
          <Text style={styles.levelText}>Lvl {item.level}</Text>
        </View>
        <View style={styles.xpContainer}>
          <Text style={styles.xpText}>{item.xp} XP</Text>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#FAF5EE', '#E8DAC9']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#D1582D" />
        ) : leaders.length === 0 ? (
          <Text style={styles.emptyText}>No challengers yet.</Text>
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
});
