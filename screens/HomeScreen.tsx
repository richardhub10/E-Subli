import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, Platform, Image, Dimensions } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useProfile } from '../context/ProfileContext';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../utils/translations';
import { kulitanSyllables } from '../data/kulitanData';

const { width, height } = Dimensions.get('window');

type HomeScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { profile } = useProfile();
  const { t, language, setLanguage } = useLanguage();

  const [expandingFeature, setExpandingFeature] = useState<any>(null);
  const expandAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Syllable of the day based on day of year
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const dailySyllable = kulitanSyllables[dayOfYear % kulitanSyllables.length] || kulitanSyllables[0];

  const currentLevelXp = profile.xp % 100;
  const xpPercentage = Math.min(100, Math.max(0, currentLevelXp));

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: xpPercentage,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [xpPercentage]);

  const handleFeaturePress = (route: string, title: string, icon: any, gradient: string[]) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setExpandingFeature({ route, title, icon, gradient });
    expandAnim.setValue(0);
    
    Animated.timing(expandAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false
    }).start(() => {
      navigation.navigate(route);
      setTimeout(() => {
        setExpandingFeature(null);
        expandAnim.setValue(0);
      }, 700);
    });
  };

  const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

  // Hero Card with Dual-Tone Glow
  const HeroCard = ({ title, subtitle, icon, badge, gradient, onPress }: any) => {
    const scale = new Animated.Value(1);
    const onPressIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: Platform.OS !== 'web' }).start();
    const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: Platform.OS !== 'web' }).start();

    return (
      <AnimatedTouchable 
        activeOpacity={0.95} 
        onPressIn={onPressIn} 
        onPressOut={onPressOut} 
        onPress={onPress} 
        style={[styles.heroCardContainer, { transform: [{ scale }] }]}
      >
        <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCardGradient}>
          <View style={styles.heroCardContent}>
            <View style={styles.heroTextContainer}>
              {badge && (
                <View style={styles.cardMiniBadge}>
                  <Text style={styles.cardMiniBadgeText}>{badge}</Text>
                </View>
              )}
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

  // Bento Card for Battles and Practice
  const BentoCard = ({ title, subtitle, icon, badge, gradient, onPress }: any) => {
    const scale = new Animated.Value(1);
    const onPressIn = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: Platform.OS !== 'web' }).start();
    const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: Platform.OS !== 'web' }).start();

    return (
      <AnimatedTouchable 
        activeOpacity={0.95} 
        onPressIn={onPressIn} 
        onPressOut={onPressOut} 
        onPress={onPress} 
        style={[styles.bentoCardContainer, { transform: [{ scale }] }]}
      >
        <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.bentoCardGradient}>
          <View style={styles.bentoTopRow}>
            <View style={styles.bentoIconBox}>
              {icon}
            </View>
            {badge && (
              <View style={styles.bentoBadge}>
                <Text style={styles.bentoBadgeText}>{badge}</Text>
              </View>
            )}
          </View>
          <Text style={styles.bentoTitle}>{title}</Text>
          <Text style={styles.bentoSubtitle}>{subtitle}</Text>
        </LinearGradient>
      </AnimatedTouchable>
    );
  };

  // Tool Card
  const ToolCard = ({ title, desc, icon, gradient, onPress }: any) => {
    const scale = new Animated.Value(1);
    const onPressIn = () => Animated.spring(scale, { toValue: 0.94, useNativeDriver: Platform.OS !== 'web' }).start();
    const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: Platform.OS !== 'web' }).start();

    return (
      <AnimatedTouchable 
        activeOpacity={0.95} 
        onPressIn={onPressIn} 
        onPressOut={onPressOut} 
        onPress={onPress} 
        style={[styles.toolCardContainer, { transform: [{ scale }] }]}
      >
        <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.toolCardGradient}>
          <View style={styles.toolIconBox}>{icon}</View>
          <View style={{ flex: 1 }}>
            <Text style={styles.toolTitle} numberOfLines={1}>{title}</Text>
            <Text style={styles.toolDesc} numberOfLines={1}>{desc}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.7)" />
        </LinearGradient>
      </AnimatedTouchable>
    );
  };

  return (
    <LinearGradient colors={['#FAF5EE', '#E8DAC9']} style={styles.container}>
      
      {/* Header Profile & Language Section */}
      <View style={styles.header}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.welcomeSub}>{t('welcome')},</Text>
          <Text style={styles.scholarName} numberOfLines={1}>
            {profile.firstName || profile.email?.split('@')[0] || 'Scholar'}
          </Text>
        </View>

        <View style={styles.headerRightGroup}>
          {/* Language Switcher Pill */}
          <View style={styles.langPillContainer}>
            {(['EN', 'PH', 'KPM'] as Language[]).map((lang) => (
              <TouchableOpacity
                key={lang}
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.selectionAsync();
                  setLanguage(lang);
                }}
                style={[styles.langPillBtn, language === lang && styles.langPillBtnActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.langPillText, language === lang && styles.langPillTextActive]}>
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Profile Avatar Button */}
          <TouchableOpacity 
            style={styles.profileAvatar} 
            onPress={() => navigation.navigate('Profile')} 
            activeOpacity={0.8}
          >
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
      </View>

      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* PLAYER LEVEL & XP MASTERY PROGRESS CARD */}
        <View style={styles.levelProgressCard}>
          <View style={styles.levelCardTop}>
            <View style={styles.levelInfoLeft}>
              <Text style={styles.levelTag}>LEVEL {profile.level} SCHOLAR</Text>
              <Text style={styles.xpText}>{currentLevelXp} / 100 XP</Text>
            </View>
            
            <View style={styles.rpPill}>
              <Ionicons name="trophy" size={14} color="#F59E0B" />
              <Text style={styles.rpPillText}>{profile.eloRating || 1000} RP</Text>
            </View>
          </View>

          {/* Glowing Animated Progress Bar */}
          <View style={styles.progressBarTrack}>
            <Animated.View 
              style={[
                styles.progressBarFill, 
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  })
                }
              ]} 
            />
          </View>

          {/* Quick Stat Highlights */}
          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Text style={styles.statChipEmoji}>🔥</Text>
              <Text style={styles.statChipValue}>{profile.streakCount || 0} {language === 'EN' ? 'Day Streak' : 'Araw'}</Text>
            </View>

            <TouchableOpacity 
              onPress={() => navigation.navigate('Leaderboard')} 
              style={styles.statActionChip}
              activeOpacity={0.7}
            >
              <Ionicons name="podium-outline" size={14} color="#D1582D" />
              <Text style={styles.statActionText}>{t('leaderboard')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigation.navigate('Friends')} 
              style={styles.statActionChip}
              activeOpacity={0.7}
            >
              <Ionicons name="people-outline" size={14} color="#2563EB" />
              <Text style={[styles.statActionText, { color: '#2563EB' }]}>
                {language === 'EN' ? 'Friends' : 'Kaibigan'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SPOTLIGHT: SYLLABLE OF THE DAY CARD */}
        <TouchableOpacity 
          style={styles.dailyCard} 
          activeOpacity={0.88}
          onPress={() => navigation.navigate('WriteTrace')}
        >
          <View style={styles.dailyCardLeft}>
            <View style={styles.dailyBadgeRow}>
              <Ionicons name="sparkles" size={12} color="#F59E0B" />
              <Text style={styles.dailyBadgeText}>
                {language === 'EN' ? 'SYLLABLE OF THE DAY' : 'TITIK SA ARAW NA ITO'}
              </Text>
            </View>
            <Text style={styles.dailySyllableLatin}>
              {dailySyllable.latin.toUpperCase()} ({dailySyllable.pronunciation || dailySyllable.latin})
            </Text>
            <Text style={styles.dailySyllableHint}>
              {dailySyllable.classification || 'Indû (Root Consonant)'}
            </Text>
          </View>

          <View style={styles.dailyGlyphCircle}>
            <Text style={styles.dailyGlyphKulitan}>{dailySyllable.latin}</Text>
          </View>
        </TouchableOpacity>

        {/* SECTION 1: CORE LEARNING PATH */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            {language === 'EN' ? 'Learning Path' : 'Dalan ng Pagkatuto'}
          </Text>
          <Text style={styles.sectionBadge}>CORE</Text>
        </View>
        
        <HeroCard 
          title={t('read_hub')} 
          subtitle={language === 'EN' ? 'Master reading with spaced repetition flashcards' : 'Kabisaduhin ang pagbasa ng mga titik at pantig'}
          badge="FOUNDATION"
          icon={<Ionicons name="book" size={42} color="rgba(255,255,255,0.92)" />}
          gradient={['#D1582D', '#9A3A17']}
          onPress={() => handleFeaturePress('ReadHub', t('read_hub'), <Ionicons name="book" size={72} color="#FFF" />, ['#D1582D', '#9A3A17'])}
        />

        <HeroCard 
          title={t('write_trace')} 
          subtitle={language === 'EN' ? 'Interactive calligraphy canvas & anti-cheat grader' : 'Sanayin ang pagsulat sa gabay ng panulat'}
          badge="STUDIO"
          icon={<MaterialCommunityIcons name="draw-pen" size={42} color="rgba(255,255,255,0.92)" />}
          gradient={['#1E293B', '#0F172A']}
          onPress={() => handleFeaturePress('WriteTrace', t('write_trace'), <MaterialCommunityIcons name="draw-pen" size={72} color="#FFF" />, ['#1E293B', '#0F172A'])}
        />

        {/* SECTION 2: BATTLE & PRACTICE ARENA */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            {language === 'EN' ? 'Battle & Practice' : 'Labanan at Pagsasanay'}
          </Text>
          <Text style={[styles.sectionBadge, { color: '#059669', borderColor: '#A7F3D0', backgroundColor: '#ECFDF5' }]}>
            ARENA
          </Text>
        </View>

        <View style={styles.bentoGrid}>
          <BentoCard 
            title={t('multiplayer_battle')} 
            subtitle={language === 'EN' ? 'Live 1v1 PvP Duel' : 'Real-time na Labanan'}
            badge="LIVE 1v1"
            icon={<MaterialCommunityIcons name="sword-cross" size={26} color="#FFF" />}
            gradient={['#059669', '#047857']}
            onPress={() => handleFeaturePress('MultiplayerLobby', t('multiplayer_battle'), <MaterialCommunityIcons name="sword-cross" size={72} color="#FFF" />, ['#059669', '#047857'])}
          />

          <BentoCard 
            title={t('solo_practice')} 
            subtitle={language === 'EN' ? 'Combos & Streaks' : 'Pagsasanay & Multipliers'}
            badge="RANKED"
            icon={<Ionicons name="flash" size={26} color="#FFF" />}
            gradient={['#D97706', '#B45309']}
            onPress={() => handleFeaturePress('OfflineQuiz', t('solo_practice'), <Ionicons name="flash" size={72} color="#FFF" />, ['#D97706', '#B45309'])}
          />
        </View>

        {/* SECTION 3: EXPANDED TOOLS & UTILITIES */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            {language === 'EN' ? 'Scholar Utilities' : 'Mga Kagamitan'}
          </Text>
          <Text style={[styles.sectionBadge, { color: '#7C3AED', borderColor: '#DDD6FE', backgroundColor: '#F5F3FF' }]}>
            TOOLS
          </Text>
        </View>

        <View style={styles.toolsList}>
          <ToolCard 
            title={language === 'EN' ? 'Kulitan Guide & History' : 'Gabay sa Kulitan'}
            desc={language === 'EN' ? 'Indû, Anak, and Kudlit historical rules' : 'Kasaysayan at panuntunan ng pagsulat'}
            icon={<Ionicons name="school-outline" size={22} color="#FFF" />}
            gradient={['#D1582D', '#B8461E']}
            onPress={() => navigation.navigate('KulitanGuide')}
          />

          <ToolCard 
            title={language === 'EN' ? 'AI Camera Scanner' : 'AI Scanner ng Titik'}
            desc={language === 'EN' ? 'Scan real-world Kulitan with Gemini AI' : 'Tukuyin ang mga titik gamit ang AI'}
            icon={<Ionicons name="scan-circle-outline" size={22} color="#FFF" />}
            gradient={['#8B5CF6', '#6D28D9']}
            onPress={() => handleFeaturePress('CameraScanner', 'Scanner', <Ionicons name="scan-circle" size={72} color="#FFF" />, ['#8B5CF6', '#6D28D9'])}
          />

          <ToolCard 
            title={t('phrasebook')} 
            desc={language === 'EN' ? '120+ authentic Kapampangan idioms' : '120+ mga parirala at kasabihan'}
            icon={<Ionicons name="library-outline" size={22} color="#FFF" />}
            gradient={['#0EA5E9', '#0284C7']}
            onPress={() => handleFeaturePress('Phrasebook', t('phrasebook'), <Ionicons name="library" size={72} color="#FFF" />, ['#0EA5E9', '#0284C7'])}
          />

          <ToolCard 
            title={t('translator')} 
            desc={language === 'EN' ? 'Kapampangan ↔ Tagalog ↔ English' : 'Pagsasalin ng wika at Kulitan'}
            icon={<Ionicons name="language-outline" size={22} color="#FFF" />}
            gradient={['#475569', '#334155']}
            onPress={() => handleFeaturePress('Translator', t('translator'), <Ionicons name="language" size={72} color="#FFF" />, ['#475569', '#334155'])}
          />
        </View>

      </ScrollView>

      {/* Hero Expanding Transition Overlay */}
      {expandingFeature && (
        <Animated.View style={[StyleSheet.absoluteFill, { 
          zIndex: 999, 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: expandAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(250,245,238,0)', 'rgba(250,245,238,1)']
          })
        }]} pointerEvents="none">
          <Animated.View style={{
            width: expandAnim.interpolate({ inputRange: [0, 1], outputRange: [80, width * 1.6] }),
            height: expandAnim.interpolate({ inputRange: [0, 1], outputRange: [80, height * 1.6] }),
            opacity: expandAnim.interpolate({ inputRange: [0, 0.8, 1], outputRange: [0, 1, 1] }),
            transform: [
              { scale: expandAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }
            ],
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: expandAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }),
            overflow: 'hidden',
          }}>
            <LinearGradient colors={expandingFeature.gradient} style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}>
                {expandingFeature.icon}
                <Animated.Text style={{
                  color: 'white',
                  fontFamily: 'Poppins_700Bold',
                  fontSize: 28,
                  marginTop: 18,
                  opacity: expandAnim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0, 0, 1] })
                }}>
                  {expandingFeature.title}
                </Animated.Text>
            </LinearGradient>
          </Animated.View>
        </Animated.View>
      )}
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
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  welcomeSub: {
    color: '#64748B',
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
  },
  scholarName: {
    color: '#0F172A',
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: -0.5,
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  langPillContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 3,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  langPillBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  langPillBtnActive: {
    backgroundColor: '#D1582D',
  },
  langPillText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#64748B',
  },
  langPillTextActive: {
    color: '#FFFFFF',
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F59E0B',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  avatarText: {
    color: '#F59E0B',
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#D1582D',
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  levelText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 4,
  },
  levelProgressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  levelCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  levelInfoLeft: {
    flex: 1,
  },
  levelTag: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  xpText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: '#64748B',
  },
  rpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  rpPillText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#B45309',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#D1582D',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    gap: 4,
  },
  statChipEmoji: {
    fontSize: 13,
  },
  statChipValue: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#C2410C',
  },
  statActionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  statActionText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#D1582D',
  },
  dailyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  dailyCardLeft: {
    flex: 1,
  },
  dailyBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  dailyBadgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    color: '#D97706',
    letterSpacing: 0.5,
  },
  dailySyllableLatin: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#0F172A',
  },
  dailySyllableHint: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#64748B',
  },
  dailyGlyphCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F59E0B',
    marginLeft: 12,
  },
  dailyGlyphKulitan: {
    fontFamily: 'Kulitan',
    fontSize: 26,
    color: '#F59E0B',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_700Bold',
    color: '#0F172A',
  },
  sectionBadge: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    color: '#D1582D',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD8C9',
    backgroundColor: '#FFF5F0',
    letterSpacing: 0.5,
  },
  heroCardContainer: {
    marginBottom: 12,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  heroCardGradient: {
    borderRadius: 22,
    padding: 20,
  },
  heroCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  cardMiniBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  cardMiniBadgeText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  heroSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 16,
  },
  heroIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bentoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  bentoCardContainer: {
    flex: 1,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bentoCardGradient: {
    borderRadius: 20,
    padding: 16,
  },
  bentoTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bentoIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bentoBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bentoBadgeText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 8,
    letterSpacing: 0.5,
  },
  bentoTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  bentoSubtitle: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  toolsList: {
    gap: 10,
    marginBottom: 20,
  },
  toolCardContainer: {
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  toolCardGradient: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toolIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  toolDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
