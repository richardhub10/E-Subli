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
import FloatingBottomBar from '../components/FloatingBottomBar';

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
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

    // Subtle breathing animation for live cards
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, [xpPercentage]);

  const handleFeaturePress = (route: string, title: string, icon: any, gradient: string[]) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setExpandingFeature({ route, title, icon, gradient });
    expandAnim.setValue(0);
    
    Animated.timing(expandAnim, {
      toValue: 1,
      duration: 450,
      useNativeDriver: false
    }).start(() => {
      navigation.navigate(route);
      setTimeout(() => {
        setExpandingFeature(null);
        expandAnim.setValue(0);
      }, 600);
    });
  };

  const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

  // Clean Pronunciation for Syllable Spotlight
  const cleanPronunciation = dailySyllable.pronunciation
    ? dailySyllable.pronunciation.split('as in')[0].replace(/[\/\\"]/g, '').trim()
    : dailySyllable.latin;

  return (
    <View style={styles.container}>
      {/* 1. ATMOSPHERIC PARCHMENT GRADIENT BACKGROUND */}
      <LinearGradient 
        colors={['#FFFBF6', '#F8EFE4', '#EFE0CE', '#E8D5BF']} 
        start={{ x: 0, y: 0 }} 
        end={{ x: 0.8, y: 1 }} 
        style={StyleSheet.absoluteFill} 
      />

      {/* 2. AMBIENT GLOW RADIAL ORBS */}
      {/* Top-Right Solar Gold Bloom */}
      <View style={styles.topRightGlowOrb} pointerEvents="none" />
      {/* Mid-Left Terracotta Radiance Bloom */}
      <View style={styles.midLeftGlowOrb} pointerEvents="none" />
      {/* Bottom-Right Amber Warm Mist */}
      <View style={styles.bottomRightGlowOrb} pointerEvents="none" />

      {/* 3. SUBTLE WATERMARK KULITAN MANUSCRIPT GLYPHS */}
      <View style={styles.watermarkContainer} pointerEvents="none">
        <Text style={[styles.watermarkGlyph, { top: 40, left: -20, transform: [{ rotate: '-12deg' }] }]}>ka</Text>
        <Text style={[styles.watermarkGlyph, { top: 220, right: -30, transform: [{ rotate: '15deg' }] }]}>ga</Text>
        <Text style={[styles.watermarkGlyph, { top: 480, left: -10, transform: [{ rotate: '8deg' }] }]}>ta</Text>
        <Text style={[styles.watermarkGlyph, { top: 720, right: -20, transform: [{ rotate: '-10deg' }] }]}>ma</Text>
      </View>
      
      {/* 4. TOP STATUS / GREETING BAR */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greetingSub}>{t('welcome')},</Text>
          <View style={styles.nameRow}>
            <Text style={styles.scholarName} numberOfLines={1}>
              {profile.firstName || profile.email?.split('@')[0] || 'Scholar'}
            </Text>
            <View style={styles.verifiedDot}>
              <Ionicons name="sparkles" size={10} color="#D1582D" />
            </View>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* Glass Language Switcher */}
          <View style={styles.langGlassPill}>
            {(['EN', 'PH', 'KPM'] as Language[]).map((lang) => {
              const isActive = language === lang;
              return (
                <TouchableOpacity
                  key={lang}
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.selectionAsync();
                    setLanguage(lang);
                  }}
                  style={[styles.langBtn, isActive && styles.langBtnActive]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.langText, isActive && styles.langTextActive]}>
                    {lang}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Profile Medallion */}
          <TouchableOpacity 
            style={styles.profileMedallion} 
            onPress={() => navigation.navigate('Profile')} 
            activeOpacity={0.85}
          >
            {profile.avatarUrl ? (
              <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarInitials}>
                {profile.firstName?.charAt(0).toUpperCase() || profile.email?.charAt(0).toUpperCase() || 'S'}
              </Text>
            )}
            <View style={styles.levelPill}>
              <Text style={styles.levelPillNum}>{profile.level}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollArea} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* 5. MASTER SCHOLAR PROGRESS CARD */}
        <View style={styles.masterCard}>
          <LinearGradient 
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 252, 248, 0.90)']} 
            style={styles.masterCardInner}
          >
            {/* Top Row: Rank & Elo */}
            <View style={styles.masterTopRow}>
              <View>
                <View style={styles.scholarTierBadge}>
                  <Ionicons name="ribbon" size={12} color="#D1582D" />
                  <Text style={styles.scholarTierText}>
                    LEVEL {profile.level} SCHOLAR
                  </Text>
                </View>
                <Text style={styles.xpFractionText}>
                  <Text style={styles.xpBold}>{currentLevelXp}</Text> / 100 XP
                </Text>
              </View>

              <TouchableOpacity 
                style={styles.rpPillBtn}
                onPress={() => navigation.navigate('Leaderboard')}
                activeOpacity={0.7}
              >
                <Ionicons name="trophy" size={13} color="#D97706" />
                <Text style={styles.rpPillVal}>{profile.eloRating || 1000} RP</Text>
                <Ionicons name="chevron-forward" size={12} color="#D97706" />
              </TouchableOpacity>
            </View>

            {/* Glowing Shimmer Progress Bar */}
            <View style={styles.progressTrack}>
              <Animated.View 
                style={[
                  styles.progressFill, 
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    })
                  }
                ]} 
              >
                <LinearGradient 
                  colors={['#F59E0B', '#E87954', '#D1582D']} 
                  start={{ x: 0, y: 0 }} 
                  end={{ x: 1, y: 0 }} 
                  style={StyleSheet.absoluteFill} 
                />
              </Animated.View>
            </View>

            {/* Quick Actions Row */}
            <View style={styles.masterStatsRow}>
              {/* Streak */}
              <View style={styles.statPillStreak}>
                <Text style={styles.streakFlameIcon}>🔥</Text>
                <Text style={styles.streakCountText}>
                  {profile.streakCount || 0} {language === 'EN' ? 'Day Streak' : 'Araw'}
                </Text>
              </View>

              {/* Leaderboard Action */}
              <TouchableOpacity 
                style={styles.statActionBtn}
                onPress={() => navigation.navigate('Leaderboard')}
                activeOpacity={0.7}
              >
                <Ionicons name="podium-outline" size={14} color="#D1582D" />
                <Text style={styles.statActionBtnText}>{t('leaderboard')}</Text>
              </TouchableOpacity>

              {/* Friends Action */}
              <TouchableOpacity 
                style={styles.statActionBtn}
                onPress={() => navigation.navigate('Friends')}
                activeOpacity={0.7}
              >
                <Ionicons name="people-outline" size={14} color="#2563EB" />
                <Text style={[styles.statActionBtnText, { color: '#2563EB' }]}>
                  {language === 'EN' ? 'Friends' : 'Kaibigan'}
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* 6. SYLLABLE OF THE DAY SPOTLIGHT */}
        <TouchableOpacity 
          style={styles.spotlightCard}
          onPress={() => navigation.navigate('WriteTrace')}
          activeOpacity={0.9}
        >
          <LinearGradient 
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 250, 243, 0.92)']} 
            style={styles.spotlightInner}
          >
            <View style={styles.spotlightLeft}>
              <View style={styles.spotlightTagRow}>
                <Ionicons name="sparkles" size={11} color="#D97706" />
                <Text style={styles.spotlightTagText}>
                  {language === 'EN' ? 'SYLLABLE SPOTLIGHT' : 'TITIK NG ARAW'}
                </Text>
              </View>

              <Text style={styles.spotlightCharTitle}>
                {dailySyllable.latin.toUpperCase()}
              </Text>

              <Text style={styles.spotlightSubDetails} numberOfLines={1}>
                {dailySyllable.classification?.split('(')[0]?.trim() || 'Indû'} • /{cleanPronunciation}/
                {dailySyllable.exampleWord ? ` • "${dailySyllable.exampleWord}"` : ''}
              </Text>

              <View style={styles.practiceNowPill}>
                <Text style={styles.practiceNowText}>
                  {language === 'EN' ? 'Practice Stroke →' : 'Magsanay Sumulat →'}
                </Text>
              </View>
            </View>

            {/* Glowing Golden Kulitan Seal */}
            <View style={styles.glyphMedallion}>
              <LinearGradient 
                colors={['#1E293B', '#0F172A']} 
                style={styles.glyphMedallionGradient}
              >
                <Text style={styles.glyphMedallionChar}>
                  {dailySyllable.latin}
                </Text>
              </LinearGradient>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* 7. SECTION 1: CORE LEARNING PATH */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>
            {language === 'EN' ? 'Learning Path' : 'Dalan ng Pagkatuto'}
          </Text>
          <View style={styles.sectionPillCore}>
            <Text style={styles.sectionPillCoreText}>CORE</Text>
          </View>
        </View>

        {/* Hero Card: Read Hub */}
        <AnimatedTouchable 
          style={styles.heroCardWrap}
          activeOpacity={0.92}
          onPress={() => handleFeaturePress('ReadHub', t('read_hub'), <Ionicons name="book" size={64} color="#FFF" />, ['#E05326', '#B83814'])}
        >
          <LinearGradient 
            colors={['#E05326', '#B83814', '#942B0D']} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 1 }} 
            style={styles.heroCardGradient}
          >
            <View style={styles.heroCardLeft}>
              <View style={styles.heroBadgePill}>
                <Text style={styles.heroBadgeText}>FOUNDATION</Text>
              </View>
              <Text style={styles.heroCardTitle}>{t('read_hub')}</Text>
              <Text style={styles.heroCardDesc}>
                {language === 'EN' 
                  ? 'Master reading with spaced repetition flashcards' 
                  : 'Kabisaduhin ang pagbasa ng mga titik at pantig'}
              </Text>
              <View style={styles.heroActionChip}>
                <Ionicons name="play-circle" size={14} color="#FFF" />
                <Text style={styles.heroActionText}>{language === 'EN' ? 'Start Reading' : 'Simulan'}</Text>
              </View>
            </View>

            <View style={styles.heroIconBubble}>
              <Ionicons name="book" size={38} color="#FFFFFF" />
            </View>
          </LinearGradient>
        </AnimatedTouchable>

        {/* Hero Card: Write & Trace */}
        <AnimatedTouchable 
          style={styles.heroCardWrap}
          activeOpacity={0.92}
          onPress={() => handleFeaturePress('WriteTrace', t('write_trace'), <MaterialCommunityIcons name="draw-pen" size={64} color="#FFF" />, ['#1E293B', '#0F172A'])}
        >
          <LinearGradient 
            colors={['#1E293B', '#111827', '#0A0E17']} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 1 }} 
            style={styles.heroCardGradient}
          >
            <View style={styles.heroCardLeft}>
              <View style={[styles.heroBadgePill, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                <Text style={[styles.heroBadgeText, { color: '#FBBF24' }]}>STUDIO CANVAS</Text>
              </View>
              <Text style={styles.heroCardTitle}>{t('write_trace')}</Text>
              <Text style={styles.heroCardDesc}>
                {language === 'EN' 
                  ? 'Interactive calligraphy canvas with stroke evaluation' 
                  : 'Sanayin ang pagsulat sa gabay ng panulat'}
              </Text>
              <View style={styles.heroActionChip}>
                <Ionicons name="pencil" size={13} color="#FFF" />
                <Text style={styles.heroActionText}>{language === 'EN' ? 'Practice Stroke' : 'Gumuhit'}</Text>
              </View>
            </View>

            <View style={[styles.heroIconBubble, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
              <MaterialCommunityIcons name="draw-pen" size={38} color="#FBBF24" />
            </View>
          </LinearGradient>
        </AnimatedTouchable>

        {/* 8. SECTION 2: BATTLE & PRACTICE ARENA */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>
            {language === 'EN' ? 'Battle & Practice' : 'Labanan at Pagsasanay'}
          </Text>
          <View style={[styles.sectionPillCore, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
            <Text style={[styles.sectionPillCoreText, { color: '#059669' }]}>ARENA</Text>
          </View>
        </View>

        <View style={styles.bentoArenaRow}>
          {/* Multiplayer 1v1 */}
          <AnimatedTouchable 
            style={styles.bentoBox}
            activeOpacity={0.92}
            onPress={() => handleFeaturePress('MultiplayerLobby', t('multiplayer_battle'), <MaterialCommunityIcons name="sword-cross" size={64} color="#FFF" />, ['#059669', '#047857'])}
          >
            <LinearGradient 
              colors={['#059669', '#047857', '#065F46']} 
              style={styles.bentoGradient}
            >
              <View style={styles.bentoHeaderRow}>
                <View style={styles.bentoIconRing}>
                  <MaterialCommunityIcons name="sword-cross" size={22} color="#FFF" />
                </View>
                <View style={styles.livePulsePill}>
                  <View style={styles.pulseDot} />
                  <Text style={styles.livePulseText}>LIVE 1v1</Text>
                </View>
              </View>

              <Text style={styles.bentoMainTitle}>{t('multiplayer_battle')}</Text>
              <Text style={styles.bentoSubDesc}>
                {language === 'EN' ? 'Challenge scholars' : 'Labanan online'}
              </Text>
            </LinearGradient>
          </AnimatedTouchable>

          {/* Solo Practice */}
          <AnimatedTouchable 
            style={styles.bentoBox}
            activeOpacity={0.92}
            onPress={() => handleFeaturePress('OfflineQuiz', t('solo_practice'), <Ionicons name="flash" size={64} color="#FFF" />, ['#D97706', '#B45309'])}
          >
            <LinearGradient 
              colors={['#D97706', '#B45309', '#92400E']} 
              style={styles.bentoGradient}
            >
              <View style={styles.bentoHeaderRow}>
                <View style={styles.bentoIconRing}>
                  <Ionicons name="flash" size={22} color="#FFF" />
                </View>
                <View style={[styles.livePulsePill, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Text style={styles.livePulseText}>COMBOS</Text>
                </View>
              </View>

              <Text style={styles.bentoMainTitle}>{t('solo_practice')}</Text>
              <Text style={styles.bentoSubDesc}>
                {language === 'EN' ? '5x streak multipliers' : 'Mag-ipon ng XP'}
              </Text>
            </LinearGradient>
          </AnimatedTouchable>
        </View>

        {/* 9. SECTION 3: UTILITIES & TOOLS */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>
            {language === 'EN' ? 'Scholar Utilities' : 'Mga Kagamitan'}
          </Text>
          <View style={[styles.sectionPillCore, { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' }]}>
            <Text style={[styles.sectionPillCoreText, { color: '#7C3AED' }]}>TOOLS</Text>
          </View>
        </View>

        <View style={styles.toolsVerticalList}>
          {/* Kulitan Guide */}
          <TouchableOpacity 
            style={styles.toolGlassCard}
            onPress={() => navigation.navigate('KulitanGuide')}
            activeOpacity={0.85}
          >
            <View style={[styles.toolIconSquare, { backgroundColor: '#FFF1EE' }]}>
              <Ionicons name="school" size={20} color="#D1582D" />
            </View>
            <View style={styles.toolTextCol}>
              <Text style={styles.toolMainTitle}>
                {language === 'EN' ? 'Kulitan Guide & History' : 'Gabay sa Kulitan'}
              </Text>
              <Text style={styles.toolSubDesc}>
                {language === 'EN' ? 'Indû, Anak, and Kudlit rules' : 'Panuntunan ng pagsulat'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>

          {/* AI Camera Scanner */}
          <TouchableOpacity 
            style={styles.toolGlassCard}
            onPress={() => handleFeaturePress('CameraScanner', 'Scanner', <Ionicons name="scan-circle" size={64} color="#FFF" />, ['#8B5CF6', '#6D28D9'])}
            activeOpacity={0.85}
          >
            <View style={[styles.toolIconSquare, { backgroundColor: '#F5F3FF' }]}>
              <Ionicons name="scan-circle" size={22} color="#7C3AED" />
            </View>
            <View style={styles.toolTextCol}>
              <Text style={styles.toolMainTitle}>
                {language === 'EN' ? 'AI Camera Scanner' : 'AI Scanner ng Titik'}
              </Text>
              <Text style={styles.toolSubDesc}>
                {language === 'EN' ? 'Scan real glyphs with AI' : 'Tukuyin gamit ang Gemini AI'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>

          {/* Phrasebook */}
          <TouchableOpacity 
            style={styles.toolGlassCard}
            onPress={() => handleFeaturePress('Phrasebook', t('phrasebook'), <Ionicons name="library" size={64} color="#FFF" />, ['#0EA5E9', '#0284C7'])}
            activeOpacity={0.85}
          >
            <View style={[styles.toolIconSquare, { backgroundColor: '#F0F9FF' }]}>
              <Ionicons name="library" size={20} color="#0284C7" />
            </View>
            <View style={styles.toolTextCol}>
              <Text style={styles.toolMainTitle}>
                {t('phrasebook')}
              </Text>
              <Text style={styles.toolSubDesc}>
                {language === 'EN' ? '120+ authentic Kapampangan idioms' : '120+ mga parirala at kasabihan'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>

          {/* Translator */}
          <TouchableOpacity 
            style={styles.toolGlassCard}
            onPress={() => handleFeaturePress('Translator', t('translator'), <Ionicons name="language" size={64} color="#FFF" />, ['#475569', '#334155'])}
            activeOpacity={0.85}
          >
            <View style={[styles.toolIconSquare, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="language" size={20} color="#475569" />
            </View>
            <View style={styles.toolTextCol}>
              <Text style={styles.toolMainTitle}>
                {t('translator')}
              </Text>
              <Text style={styles.toolSubDesc}>
                {language === 'EN' ? 'Kapampangan ↔ Tagalog ↔ English' : 'Pagsasalin ng wika'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Floating Curved Notch Bottom Navigation Bar */}
      <FloatingBottomBar activeTab="Home" navigation={navigation} />

      {/* Hero Expanding Transition Ripple Overlay */}
      {expandingFeature && (
        <Animated.View style={[StyleSheet.absoluteFill, { 
          zIndex: 999, 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: expandAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(255,251,246,0)', 'rgba(255,251,246,1)']
          })
        }]} pointerEvents="none">
          <Animated.View style={{
            width: expandAnim.interpolate({ inputRange: [0, 1], outputRange: [70, width * 1.6] }),
            height: expandAnim.interpolate({ inputRange: [0, 1], outputRange: [70, height * 1.6] }),
            opacity: expandAnim.interpolate({ inputRange: [0, 0.8, 1], outputRange: [0, 1, 1] }),
            transform: [
              { scale: expandAnim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }) }
            ],
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: expandAnim.interpolate({ inputRange: [0, 1], outputRange: [35, 0] }),
            overflow: 'hidden',
          }}>
            <LinearGradient colors={expandingFeature.gradient} style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}>
                {expandingFeature.icon}
                <Animated.Text style={{
                  color: 'white',
                  fontFamily: 'Poppins_700Bold',
                  fontSize: 26,
                  marginTop: 16,
                  opacity: expandAnim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0, 0, 1] })
                }}>
                  {expandingFeature.title}
                </Animated.Text>
            </LinearGradient>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBF6',
  },
  topRightGlowOrb: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
  },
  midLeftGlowOrb: {
    position: 'absolute',
    top: 260,
    left: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(209, 88, 45, 0.10)',
  },
  bottomRightGlowOrb: {
    position: 'absolute',
    bottom: -60,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
  },
  watermarkContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  watermarkGlyph: {
    position: 'absolute',
    fontFamily: 'Kulitan',
    fontSize: 160,
    color: '#D1582D',
    opacity: 0.045,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 56 : 38,
    paddingHorizontal: 20,
    paddingBottom: 14,
    zIndex: 2,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 8,
  },
  greetingSub: {
    color: '#9E8E81',
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scholarName: {
    color: '#1E1B18',
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: -0.4,
  },
  verifiedDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFEFE6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  langGlassPill: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.90)',
    padding: 3,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  langBtn: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 12,
  },
  langBtnActive: {
    backgroundColor: '#D1582D',
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  langText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: '#8C7E72',
  },
  langTextActive: {
    color: '#FFFFFF',
  },
  profileMedallion: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F59E0B',
    position: 'relative',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  avatarInitials: {
    color: '#F59E0B',
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
  },
  levelPill: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    backgroundColor: '#D1582D',
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  levelPillNum: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
  },
  scrollArea: {
    flex: 1,
    zIndex: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  masterCard: {
    borderRadius: 24,
    marginBottom: 14,
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  masterCardInner: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  masterTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  scholarTierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  scholarTierText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    color: '#D1582D',
    letterSpacing: 0.5,
  },
  xpFractionText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#8C7E72',
  },
  xpBold: {
    fontFamily: 'Poppins_700Bold',
    color: '#1E1B18',
  },
  rpPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  rpPillVal: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#B45309',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#EAE0D3',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  masterStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statPillStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FED7AA',
    gap: 4,
  },
  streakFlameIcon: {
    fontSize: 13,
  },
  streakCountText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    color: '#C2410C',
  },
  statActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8DED3',
    gap: 4,
  },
  statActionBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#D1582D',
  },
  spotlightCard: {
    borderRadius: 22,
    marginBottom: 18,
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  spotlightInner: {
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
  },
  spotlightLeft: {
    flex: 1,
    paddingRight: 8,
  },
  spotlightTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  spotlightTagText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    color: '#D97706',
    letterSpacing: 0.5,
  },
  spotlightCharTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    color: '#1E1B18',
    lineHeight: 26,
  },
  spotlightSubDetails: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#8C7E72',
    marginBottom: 6,
  },
  practiceNowPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  practiceNowText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: '#D1582D',
  },
  glyphMedallion: {
    width: 56,
    height: 56,
    borderRadius: 28,
    padding: 2,
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  glyphMedallionGradient: {
    flex: 1,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glyphMedallionChar: {
    fontFamily: 'Kulitan',
    fontSize: 28,
    color: '#F59E0B',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 6,
  },
  sectionHeading: {
    fontSize: 15,
    fontFamily: 'Poppins_700Bold',
    color: '#1E1B18',
  },
  sectionPillCore: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD8C9',
    backgroundColor: '#FFF5F0',
  },
  sectionPillCoreText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    color: '#D1582D',
    letterSpacing: 0.5,
  },
  heroCardWrap: {
    borderRadius: 22,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  heroCardGradient: {
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroCardLeft: {
    flex: 1,
    paddingRight: 12,
  },
  heroBadgePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 8,
    letterSpacing: 0.5,
  },
  heroCardTitle: {
    fontSize: 21,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  heroCardDesc: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255, 255, 255, 0.88)',
    lineHeight: 15,
    marginBottom: 8,
  },
  heroActionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  heroActionText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  heroIconBubble: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  bentoArenaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  bentoBox: {
    flex: 1,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bentoGradient: {
    borderRadius: 22,
    padding: 16,
  },
  bentoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bentoIconRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  livePulsePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  livePulseText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 8,
    letterSpacing: 0.5,
  },
  bentoMainTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  bentoSubDesc: {
    fontSize: 10,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  toolsVerticalList: {
    gap: 8,
    marginBottom: 20,
  },
  toolGlassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  toolIconSquare: {
    width: 38,
    height: 38,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolTextCol: {
    flex: 1,
  },
  toolMainTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#1E1B18',
  },
  toolSubDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#8C7E72',
  },
});
