import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Dimensions, 
  StatusBar, 
  Platform, 
  Image, 
  Animated,
  Easing 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StackNavigationProp } from '@react-navigation/stack';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../utils/translations';

type WelcomeScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const { language, setLanguage, t } = useLanguage();

  // Floating & Pulse Animations
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Gentle floating motion
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 2. Subtle ambient pulse for the celestial gold ring
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Very slow ambient background rotation for the ornamental sun ring
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 36000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleLanguageChange = (lang: Language) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setLanguage(lang);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ATMOSPHERIC BACKGROUND GRADIENT */}
      <LinearGradient 
        colors={['#030712', '#081124', '#0E1D3B', '#060B18']} 
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* AMBIENT NEBULA GLOWS */}
      <View style={styles.ambientGlowTop} pointerEvents="none" />
      <View style={styles.ambientGlowCenter} pointerEvents="none" />

      {/* FLOATING KULITAN WATERMARK GLYPHS */}
      <View style={styles.watermarkContainer} pointerEvents="none">
        <Text style={[styles.watermarkChar, { top: height * 0.12, left: 16, transform: [{ rotate: '-14deg' }] }]}>ka</Text>
        <Text style={[styles.watermarkChar, { top: height * 0.22, right: 18, transform: [{ rotate: '16deg' }] }]}>la</Text>
        <Text style={[styles.watermarkChar, { top: height * 0.54, left: 24, transform: [{ rotate: '-8deg' }] }]}>ta</Text>
        <Text style={[styles.watermarkChar, { top: height * 0.62, right: 26, transform: [{ rotate: '12deg' }] }]}>ma</Text>
      </View>

      <SafeAreaView style={styles.safeArea}>
        
        {/* TOP BRAND HEADER */}
        <View style={styles.headerContainer}>
          <View style={styles.heritageBadge}>
            <Ionicons name="sparkles" size={11} color="#FBBF24" />
            <Text style={styles.heritageBadgeText}>INDIGENOUS PHILIPPINE SCRIPT</Text>
            <Ionicons name="sparkles" size={11} color="#FBBF24" />
          </View>
          
          <View style={styles.brandTitleRow}>
            <Text style={styles.brandLogoE}>e</Text>
            <Text style={styles.brandLogoSubli}>SUBLI</Text>
            <View style={styles.brandDotOrnament} />
          </View>
        </View>

        {/* CENTER HERO MEDALLION */}
        <View style={styles.heroSection}>
          
          {/* Orbital Celestial Pulse Ring */}
          <Animated.View 
            style={[
              styles.orbitalRingGlow, 
              { transform: [{ scale: pulseAnim }] }
            ]} 
          />

          {/* Slow Rotating Decorative Dashed Ring */}
          <Animated.View 
            style={[
              styles.orbitalDashedRing, 
              { transform: [{ rotate: spin }] }
            ]} 
          />

          {/* Floating Hero Emblem */}
          <Animated.View 
            style={[
              styles.emblemWrapper, 
              { transform: [{ translateY: floatAnim }] }
            ]}
          >
            <LinearGradient 
              colors={['#F59E0B', '#D97706', '#92400E']} 
              style={styles.emblemGoldBorder}
            >
              <View style={styles.emblemInnerPlate}>
                <Image 
                  source={require('../assets/esubli-logo.png')} 
                  style={styles.heroLogoImage} 
                  resizeMode="cover" 
                />
              </View>
            </LinearGradient>
          </Animated.View>
        </View>

        {/* HERO TITLE & CULTURAL DESCRIPTION */}
        <View style={styles.welcomeSection}>
          <View style={styles.subtitlePill}>
            <Ionicons name="shield-checkmark" size={12} color="#FB923C" />
            <Text style={styles.subtitlePillText}>
              {language === 'EN' ? 'HERITAGE IN SCRIPT' : language === 'PH' ? 'PAMANA SA SULAT' : 'MANA KING SULAT'}
            </Text>
          </View>

          <Text style={styles.welcomeDescription}>
            {language === 'EN' 
              ? 'Rediscover the ancient Kapampangan script with interactive lessons, writing studio & multiplayer battles.' 
              : language === 'PH' 
              ? 'Tuklasin muli ang sinaunang sulat Kapampangan sa pagsasanay, studio at labanan.' 
              : 'Abalu mu pasibayu ing matwang sulat Kapampangan king pamagaral, studio at labanan.'}
          </Text>

          {/* CULTURAL HIGHLIGHT CHIPS */}
          <View style={styles.highlightPillsRow}>
            <View style={styles.highlightPill}>
              <Ionicons name="create-outline" size={12} color="#FBBF24" />
              <Text style={styles.highlightPillText}>Trace Studio</Text>
            </View>
            <View style={styles.highlightPill}>
              <Ionicons name="flash-outline" size={12} color="#F97316" />
              <Text style={styles.highlightPillText}>PvP Battle</Text>
            </View>
            <View style={styles.highlightPill}>
              <Ionicons name="book-outline" size={12} color="#38BDF8" />
              <Text style={styles.highlightPillText}>Syllabary</Text>
            </View>
          </View>
        </View>

        {/* LIQUID FROSTED LANGUAGE SELECTOR */}
        <View style={styles.langSelectorWrapper}>
          <View style={styles.langCapsule}>
            {[
              { code: 'EN', label: 'English' },
              { code: 'PH', label: 'Tagalog' },
              { code: 'KPM', label: 'Kapampangan' }
            ].map((item) => {
              const isActive = language === item.code;
              return (
                <TouchableOpacity 
                  key={item.code} 
                  onPress={() => handleLanguageChange(item.code as Language)}
                  style={[styles.langSegment, isActive && styles.langSegmentActive]}
                  activeOpacity={0.8}
                >
                  {isActive ? (
                    <LinearGradient 
                      colors={['#D1582D', '#B83814']} 
                      style={styles.langSegmentGradient}
                    >
                      <Text style={styles.langTextActive}>{item.code}</Text>
                    </LinearGradient>
                  ) : (
                    <Text style={styles.langTextInactive}>{item.code}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* MODERN CALL-TO-ACTION BUTTONS */}
        <View style={styles.actionSection}>
          
          {/* PRIMARY BUTTON: START JOURNEY */}
          <TouchableOpacity 
            style={styles.primaryBtn}
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate('Login');
            }}
            activeOpacity={0.88}
          >
            <LinearGradient 
              colors={['#F97316', '#EA580C', '#C2410C']} 
              start={{ x: 0, y: 0 }} 
              end={{ x: 1, y: 1 }}
              style={styles.primaryBtnGradient}
            >
              <Text style={styles.primaryBtnText}>{t('start_journey')}</Text>
              <View style={styles.primaryBtnIconCircle}>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* SECONDARY BUTTON: KULITAN GUIDE */}
          <TouchableOpacity 
            style={styles.secondaryBtn}
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.selectionAsync();
              navigation.navigate('KulitanGuide');
            }}
            activeOpacity={0.8}
          >
            <View style={styles.secondaryBtnInner}>
              <Ionicons name="book-outline" size={17} color="#FBBF24" />
              <Text style={styles.secondaryBtnText}>{t('kulitan_guide')}</Text>
            </View>
          </TouchableOpacity>

        </View>

        {/* SUBTLE FOOTER EMBLEM */}
        <View style={styles.footerNoteContainer}>
          <Text style={styles.footerNoteText}>✦ SULAT KAPAMPANGAN LIVING HERITAGE ✦</Text>
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  ambientGlowTop: {
    position: 'absolute',
    top: -height * 0.1,
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: 'rgba(217, 119, 6, 0.08)',
    alignSelf: 'center',
  },
  ambientGlowCenter: {
    position: 'absolute',
    top: height * 0.2,
    width: width * 1.4,
    height: width * 1.4,
    borderRadius: width * 0.7,
    backgroundColor: 'rgba(249, 115, 22, 0.07)',
    alignSelf: 'center',
  },
  watermarkContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  watermarkChar: {
    position: 'absolute',
    fontFamily: 'Kulitan',
    fontSize: 96,
    color: 'rgba(251, 191, 36, 0.035)',
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 12 : 36,
  },
  heritageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    gap: 6,
    marginBottom: 8,
  },
  heritageBadgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    color: '#FBBF24',
    letterSpacing: 1.8,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  brandLogoE: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 38,
    color: '#FB923C',
    fontStyle: 'italic',
  },
  brandLogoSubli: {
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
    fontSize: 36,
    fontWeight: '700',
    color: '#FDE68A',
    letterSpacing: 6,
  },
  brandDotOrnament: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    marginBottom: 8,
    marginLeft: 2,
  },
  heroSection: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    position: 'relative',
  },
  orbitalRingGlow: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.28)',
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  orbitalDashedRing: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.2)',
    borderStyle: 'dashed',
  },
  emblemWrapper: {
    width: 176,
    height: 176,
    borderRadius: 88,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 16,
  },
  emblemGoldBorder: {
    width: 176,
    height: 176,
    borderRadius: 88,
    padding: 3.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emblemInnerPlate: {
    width: '100%',
    height: '100%',
    borderRadius: 84,
    backgroundColor: '#091329',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FDE68A',
  },
  heroLogoImage: {
    width: '100%',
    height: '100%',
  },
  welcomeSection: {
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: 4,
  },
  subtitlePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
    gap: 6,
    marginBottom: 10,
  },
  subtitlePillText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10.5,
    color: '#FB923C',
    letterSpacing: 2,
  },
  welcomeDescription: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13.5,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 14,
    maxWidth: 330,
  },
  highlightPillsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  highlightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 5,
  },
  highlightPillText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10.5,
    color: '#E2E8F0',
  },
  langSelectorWrapper: {
    marginVertical: 12,
  },
  langCapsule: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 22,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.22)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  langSegment: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  langSegmentActive: {
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  langSegmentGradient: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 18,
  },
  langTextActive: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  langTextInactive: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#64748B',
    letterSpacing: 1,
  },
  actionSection: {
    width: '100%',
    maxWidth: 350,
    gap: 12,
    marginTop: 4,
  },
  primaryBtn: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 28,
    gap: 12,
  },
  primaryBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 2.2,
  },
  primaryBtnIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtn: {
    borderRadius: 28,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.35)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  secondaryBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 24,
    gap: 10,
  },
  secondaryBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#FDE68A',
    letterSpacing: 2,
  },
  footerNoteContainer: {
    paddingVertical: 10,
  },
  footerNoteText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 8.5,
    color: 'rgba(251, 191, 36, 0.4)',
    letterSpacing: 1.8,
  },
});
