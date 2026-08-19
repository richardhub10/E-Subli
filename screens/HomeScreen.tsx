import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, Platform, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useProfile } from '../context/ProfileContext';
import { useLanguage } from '../context/LanguageContext';

type HomeScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { profile } = useProfile();
  const { t, language } = useLanguage();

  const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

  // 1. Hero Card (Large, full width, for primary learning)
  const HeroCard = ({ title, subtitle, icon, gradient, onPress }: any) => {
    const scale = new Animated.Value(1);

    const onPressIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: Platform.OS !== 'web' }).start();
    const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: Platform.OS !== 'web' }).start();

    return (
      <AnimatedTouchable activeOpacity={1} onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress} style={[styles.heroCardContainer, { transform: [{ scale }] }]}>
        <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCardGradient}>
          <View style={styles.heroCardContent}>
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>{title}</Text>
              <Text style={styles.heroSubtitle}>{subtitle}</Text>
            </View>
            <View style={styles.heroIconContainer}>
              {icon}
            </View>
          </View>
        </LinearGradient>
      </AnimatedTouchable>
    );
  };

  // 2. Grid Card (Half width, for practice modes)
  const GridCard = ({ title, icon, gradient, onPress }: any) => {
    const scale = new Animated.Value(1);

    const onPressIn = () => Animated.spring(scale, { toValue: 0.94, useNativeDriver: Platform.OS !== 'web' }).start();
    const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: Platform.OS !== 'web' }).start();

    return (
      <AnimatedTouchable activeOpacity={1} onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress} style={[styles.gridCardContainer, { transform: [{ scale }] }]}>
        <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gridCardGradient}>
          <View style={styles.gridIconContainer}>
            {icon}
          </View>
          <Text style={styles.gridTitle}>{title}</Text>
        </LinearGradient>
      </AnimatedTouchable>
    );
  };

  // 3. Mini Tool Card (For utilities, horizontal scroll)
  const ToolCard = ({ title, icon, gradient, onPress }: any) => {
    const scale = new Animated.Value(1);

    const onPressIn = () => Animated.spring(scale, { toValue: 0.92, useNativeDriver: Platform.OS !== 'web' }).start();
    const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: Platform.OS !== 'web' }).start();

    return (
      <AnimatedTouchable activeOpacity={1} onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress} style={[styles.toolCardContainer, { transform: [{ scale }] }]}>
        <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.toolCardGradient}>
          {icon}
          <Text style={styles.toolTitle} numberOfLines={1}>{title}</Text>
        </LinearGradient>
      </AnimatedTouchable>
    );
  };

  return (
    <LinearGradient colors={['#FAF5EE', '#E8DAC9']} style={styles.container}>
      {/* Header Profile Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>{t('welcome')},</Text>
          <Text style={styles.emailText}>{profile.firstName || profile.email?.split('@')[0] || 'Scholar'}</Text>
        </View>
        <TouchableOpacity style={styles.profileAvatar} onPress={() => navigation.navigate('Profile')}>
          {profile.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>
              {profile.firstName?.charAt(0).toUpperCase() || profile.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          )}
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{profile.level}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        
        {/* TOP STATS ROW */}
        <View style={styles.statsRow}>
          <View style={styles.streakBadge}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.streakText}>{profile.streakCount || 0}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Leaderboard')} style={styles.leaderboardButton}>
            <Ionicons name="trophy" size={20} color="#FBBF24" />
            <Text style={styles.leaderboardText}>{t('leaderboard')}</Text>
          </TouchableOpacity>
        </View>

        {/* SECTION 1: PRIMARY LEARNING */}
        <Text style={styles.sectionTitle}>{language === 'EN' ? 'Learning Path' : 'Dalan ng Pagkatuto'}</Text>
        
        <HeroCard 
          title={t('read_hub')} 
          subtitle={language === 'EN' ? 'Master the Kulitan Syllables' : language === 'PH' ? 'Kabisaduhin ang Kulitan' : 'Kabisadwan ing Kulitan'}
          icon={<Ionicons name="book" size={44} color="rgba(255,255,255,0.9)" />}
          gradient={['#D1582D', '#9A3A17']}
          onPress={() => navigation.navigate('ReadHub')}
        />

        <HeroCard 
          title={t('write_trace')} 
          subtitle={language === 'EN' ? 'Practice writing the script' : language === 'PH' ? 'Sanayin ang pagsulat' : 'Pagsanayan ing pamanyulat'}
          icon={<MaterialCommunityIcons name="draw-pen" size={44} color="rgba(255,255,255,0.9)" />}
          gradient={['#1E293B', '#0F172A']}
          onPress={() => navigation.navigate('WriteTrace')}
        />

        {/* SECTION 2: PRACTICE & PLAY (Grid) */}
        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>{language === 'EN' ? 'Practice & Play' : 'Pagsasanay'}</Text>
        <View style={styles.gridContainer}>
          <GridCard 
            title={t('multiplayer_battle')} 
            icon={<Ionicons name="people" size={36} color="rgba(255,255,255,0.9)" />}
            gradient={['#059669', '#047857']}
            onPress={() => navigation.navigate('MultiplayerLobby')}
          />
          <GridCard 
            title={t('solo_practice')} 
            icon={<Ionicons name="flash" size={36} color="rgba(255,255,255,0.9)" />}
            gradient={['#D97706', '#B45309']}
            onPress={() => navigation.navigate('OfflineQuiz')}
          />
        </View>

        {/* SECTION 3: UTILITIES & TOOLS (Horizontal Scroll) */}
        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>{language === 'EN' ? 'Tools & Utilities' : 'Kagamitan'}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolsScrollContainer}>
          <ToolCard 
            title="Scanner" 
            icon={<Ionicons name="scan-circle" size={32} color="rgba(255,255,255,0.9)" />}
            gradient={['#8B5CF6', '#6D28D9']}
            onPress={() => navigation.navigate('CameraScanner')}
          />
          <ToolCard 
            title={t('translator')} 
            icon={<Ionicons name="language" size={32} color="rgba(255,255,255,0.9)" />}
            gradient={['#64748B', '#475569']}
            onPress={() => navigation.navigate('Translator')}
          />
          <ToolCard 
            title={t('phrasebook')} 
            icon={<Ionicons name="library" size={32} color="rgba(255,255,255,0.9)" />}
            gradient={['#0EA5E9', '#0284C7']}
            onPress={() => navigation.navigate('Phrasebook')}
          />
        </ScrollView>

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
    paddingHorizontal: 24,
    paddingBottom: 15,
  },
  welcomeText: {
    color: '#64748B',
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
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
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
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
    paddingHorizontal: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  leaderboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  leaderboardText: {
    color: '#0F172A',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    marginLeft: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  streakIcon: {
    fontSize: 16,
  },
  streakText: {
    color: '#D97706',
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    marginLeft: 6,
  },
  sectionTitle: {
    color: '#334155',
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    marginBottom: 16,
  },
  
  /* Hero Card Styles */
  heroCardContainer: {
    width: '100%',
    height: 140,
    marginBottom: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  heroCardGradient: {
    flex: 1,
    borderRadius: 24,
    padding: 24,
  },
  heroCardContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    marginBottom: 4,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  heroIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Grid Card Styles */
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridCardContainer: {
    width: '48%',
    height: 130,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gridCardGradient: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridTitle: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
  },

  /* Tool Card Styles */
  toolsScrollContainer: {
    paddingBottom: 10,
    gap: 16,
    paddingRight: 24, // extra padding at end
  },
  toolCardContainer: {
    width: 110,
    height: 110,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  toolCardGradient: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolTitle: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
    marginTop: 10,
  }
});
