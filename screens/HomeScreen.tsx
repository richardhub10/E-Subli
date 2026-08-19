import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../supabaseClient';
import { useProfile } from '../context/ProfileContext';

type HomeScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { profile } = useProfile();

  // Simple scale animation wrapper
  const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

  const Card = ({ title, subtitle, icon, gradient, onPress }: any) => {
    const scale = new Animated.Value(1);

    const onPressIn = () => {
      Animated.spring(scale, { toValue: 0.95, useNativeDriver: Platform.OS !== 'web' }).start();
    };
    const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

    const onPressOut = () => {
      Animated.spring(scale, { toValue: 1, useNativeDriver: Platform.OS !== 'web' }).start();
    };

    return (
      <AnimatedTouchable
        activeOpacity={1}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        style={[styles.cardContainer, { transform: [{ scale }] }]}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>{title}</Text>
              <Text style={styles.cardSubtitle}>{subtitle}</Text>
            </View>
            <View style={styles.iconContainer}>
              {icon}
            </View>
          </View>
        </LinearGradient>
      </AnimatedTouchable>
    );
  };

  return (
    <LinearGradient colors={['#FAF5EE', '#E8DAC9']} style={styles.container}>
      {/* Header Profile Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.emailText}>{profile.firstName || profile.email?.split('@')[0] || 'Scholar'}</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileAvatar} 
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.avatarText}>
            {profile.firstName?.charAt(0).toUpperCase() || profile.email?.charAt(0).toUpperCase() || 'U'}
          </Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{profile.level}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Journey</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Leaderboard')} style={styles.leaderboardButton}>
            <Ionicons name="trophy" size={20} color="#FBBF24" />
            <Text style={styles.leaderboardText}>Rankings</Text>
          </TouchableOpacity>
        </View>

        <Card 
          title="Read Hub" 
          subtitle="Master the Kulitan Syllables"
          icon={<Ionicons name="book" size={40} color="rgba(255,255,255,0.8)" />}
          gradient={['#D9734E', '#B85331']}
          onPress={() => navigation.navigate('ReadHub')}
        />

        <Card 
          title="Write & Trace" 
          subtitle="Practice physical strokes"
          icon={<MaterialCommunityIcons name="draw-pen" size={40} color="rgba(255,255,255,0.8)" />}
          gradient={['#3B82F6', '#2563EB']}
          onPress={() => navigation.navigate('WriteTrace')}
        />

        <Card 
          title="AI Scanner" 
          subtitle="Verify your handwriting"
          icon={<Ionicons name="scan-circle" size={40} color="rgba(255,255,255,0.8)" />}
          gradient={['#10B981', '#059669']}
          onPress={() => navigation.navigate('CameraScanner')}
        />

        <Card 
          title="Translator & Transliteration" 
          subtitle="Tagalog/English to Kulitan"
          icon={<Ionicons name="language" size={40} color="rgba(255,255,255,0.8)" />}
          gradient={['#8B5CF6', '#6D28D9']}
          onPress={() => navigation.navigate('Translator')}
        />

        <Card 
          title="Multiplayer (Beta)" 
          subtitle="1v1 Quiz Battle"
          icon={<Ionicons name="people" size={40} color="rgba(255,255,255,0.8)" />}
          gradient={['#EC4899', '#BE185D']}
          onPress={() => navigation.navigate('MultiplayerLobby')}
        />

        <Card 
          title="Solo Quiz (Offline)" 
          subtitle="Practice & Earn XP anywhere"
          icon={<Ionicons name="game-controller" size={40} color="rgba(255,255,255,0.8)" />}
          gradient={['#F59E0B', '#D97706']}
          onPress={() => navigation.navigate('OfflineQuiz')}
        />

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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 25,
    paddingBottom: 20,
  },
  welcomeText: {
    color: '#64748B',
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
  },
  emailText: {
    color: '#0F172A',
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: -0.5,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarText: {
    color: '#D1582D',
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#10B981',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  levelText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'Poppins_700Bold',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 22,
    fontFamily: 'Poppins_600SemiBold',
  },
  leaderboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  leaderboardText: {
    color: '#0F172A',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    marginLeft: 6,
  },
  cardContainer: {
    width: '100%',
    height: 150,
    marginBottom: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 24,
    padding: 24,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 26,
    fontFamily: 'Poppins_700Bold',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
