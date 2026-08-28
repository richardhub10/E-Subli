import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, StatusBar, Platform, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../utils/translations';

type WelcomeScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background Decor (optional faint circles or gradients can go here) */}
      <View style={styles.bgGlow} />

      {/* Header Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>
          <Text style={styles.logoE}>e</Text>SUBLI
        </Text>
      </View>

      {/* Center Hero Logo */}
      <View style={styles.artContainer}>
        <View style={styles.logoBadgeWrap}>
          <Image 
            source={require('../assets/esubli-logo.png')} 
            style={styles.heroLogoImage} 
            resizeMode="contain" 
          />
        </View>
      </View>

      {/* Welcome Text */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.subtitle}>{language === 'EN' ? 'HERITAGE IN SCRIPT' : language === 'PH' ? 'PAMANA SA SULAT' : 'MANA KING SULAT'}</Text>
        <Text style={styles.welcomeText}>
          {language === 'EN' 
            ? "Rediscover the ancient Kapampangan script with interactive lessons & battles." 
            : language === 'PH' 
            ? "Tuklasin muli ang sinaunang sulat Kapampangan sa pagsasanay at laban." 
            : "Abalu mu pasibayu ing matwang sulat Kapampangan king pamagaral at labanan."}
        </Text>
      </View>

      {/* Language Selector */}
      <View style={styles.langSelector}>
        {(['EN', 'PH', 'KPM'] as Language[]).map((lang) => (
          <TouchableOpacity 
            key={lang} 
            onPress={() => setLanguage(lang)}
            style={styles.langButton}
          >
            <Text style={[
              styles.langText, 
              language === lang && styles.langTextActive
            ]}>
              {lang}
            </Text>
            {language === lang && <View style={styles.langIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.primaryButtonText}>{t('start_journey')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('KulitanGuide')}
        >
          <Text style={styles.secondaryButtonText}>{t('kulitan_guide')}</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050B14', // Deep Navy from mockup
    alignItems: 'center',
  },
  bgGlow: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width,
    backgroundColor: '#0F1A2C',
    top: '20%',
    opacity: 0.5,
    zIndex: -1,
  },
  logoContainer: {
    marginTop: height * 0.08,
    alignItems: 'center',
  },
  logoText: {
    fontFamily: 'Times New Roman', // Or any serif font available
    fontSize: 42,
    color: '#FBBF24',
    letterSpacing: 4,
    fontWeight: '400',
  },
  logoE: {
    color: '#F97316',
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  artContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBadgeWrap: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#0F1A2C',
    borderWidth: 2.5,
    borderColor: '#FBBF24',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  heroLogoImage: {
    width: 160,
    height: 160,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 30,
  },
  subtitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#FBBF24',
    letterSpacing: 3,
    marginBottom: 15,
  },
  welcomeText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 24,
  },
  langSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    marginBottom: 50,
  },
  langButton: {
    alignItems: 'center',
  },
  langText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#475569',
  },
  langTextActive: {
    color: '#FBBF24',
  },
  langIndicator: {
    width: 20,
    height: 2,
    backgroundColor: '#FBBF24',
    marginTop: 4,
    borderRadius: 2,
  },
  actionContainer: {
    width: '100%',
    paddingHorizontal: 30,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    gap: 15,
  },
  primaryButton: {
    backgroundColor: '#F97316',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryButtonText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#F97316',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#F97316',
    letterSpacing: 2,
  },
});
