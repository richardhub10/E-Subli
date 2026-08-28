import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Animated, ScrollView, SafeAreaView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../supabaseClient';
import { StackNavigationProp } from '@react-navigation/stack';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../utils/translations';

WebBrowser.maybeCompleteAuthSession();

type LoginScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { t, language, setLanguage } = useLanguage();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        language === 'EN' ? 'Missing Fields' : 'Kulang na Impormasyon',
        language === 'EN' ? 'Please enter both your email and password.' : 'Mangyaring ilagay ang iyong email at password.'
      );
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        language === 'EN' ? 'Login Failed' : 'Bigo ang Pag-login',
        error.message || 'Invalid email or password.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const redirectUrl = Platform.OS === 'web' 
        ? window.location.origin 
        : 'esubli://auth/callback';

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: Platform.OS !== 'web',
        },
      });

      if (error) throw error;

      if (Platform.OS !== 'web' && data?.url) {
        const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        if (res.type === 'success' && res.url) {
          const parsedUrl = new URL(res.url.replace('#', '?'));
          const access_token = parsedUrl.searchParams.get('access_token');
          const refresh_token = parsedUrl.searchParams.get('refresh_token');

          if (access_token && refresh_token) {
            await supabase.auth.setSession({ access_token, refresh_token });
          }
        }
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      Alert.alert(
        'Google Sign-In',
        error.message || 'Could not complete Google sign-in.'
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      language === 'EN' ? 'Reset Password' : 'I-reset ang Password',
      language === 'EN' 
        ? 'Please check your registered email or contact support to reset your account password.'
        : 'Mangyaring suriin ang iyong rehistradong email upang i-reset ang password.'
    );
  };

  // Button Press Animation
  const scaleAnim = new Animated.Value(1);
  const onPressIn = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: Platform.OS !== 'web' }).start();
  };
  const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: Platform.OS !== 'web' }).start();

  return (
    <LinearGradient colors={['#FAF5EE', '#E8DAC9']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        {/* Top Navigation Row: Back Button & Language Pill */}
        <View style={styles.topNavRow}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>

          {/* Language Switcher Pill */}
          <View style={styles.langPillContainer}>
            {(['EN', 'PH', 'KPM'] as Language[]).map((lang) => (
              <TouchableOpacity
                key={lang}
                onPress={() => setLanguage(lang)}
                style={[styles.langPillBtn, language === lang && styles.langPillBtnActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.langPillText, language === lang && styles.langPillTextActive]}>
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            
            {/* Header Brand & Heritage Seal */}
            <View style={styles.headerContainer}>
              <View style={styles.sealCircle}>
                <Image 
                  source={require('../assets/esubli-logo.png')} 
                  style={styles.sealLogoImage} 
                  resizeMode="contain" 
                />
              </View>

              <Text style={styles.logoTitle}>
                <Text style={styles.logoE}>e</Text>SUBLI
              </Text>
              
              <Text style={styles.subtitle}>
                {language === 'EN' 
                  ? 'Sign in to continue your Kulitan journey' 
                  : language === 'PH' 
                  ? 'Mag-login upang magpatuloy sa pag-aaral' 
                  : 'Mag-login bang mituluy ing kekang pamagaral'}
              </Text>
            </View>
            
            {/* Input Fields */}
            <View style={styles.formContainer}>
              
              {/* Email Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>{t('email')}</Text>
                <View style={[
                  styles.inputBox, 
                  focusedField === 'email' && styles.inputBoxFocused
                ]}>
                  <Ionicons 
                    name="mail-outline" 
                    size={20} 
                    color={focusedField === 'email' ? '#D1582D' : '#94A3B8'} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInputField}
                    placeholder="name@example.com"
                    placeholderTextColor="#94A3B8"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                  {email.length > 0 && (
                    <TouchableOpacity onPress={() => setEmail('')}>
                      <Ionicons name="close-circle" size={18} color="#CBD5E1" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Password Input with Show/Hide Eye Toggle */}
              <View style={styles.inputWrapper}>
                <View style={styles.passwordLabelRow}>
                  <Text style={styles.inputLabel}>{t('password')}</Text>
                  <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
                    <Text style={styles.forgotPassText}>
                      {language === 'EN' ? 'Forgot?' : 'Nakalimutan?'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={[
                  styles.inputBox, 
                  focusedField === 'password' && styles.inputBoxFocused
                ]}>
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={focusedField === 'password' ? '#D1582D' : '#94A3B8'} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInputField}
                    placeholder="••••••••••••"
                    placeholderTextColor="#94A3B8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color="#94A3B8" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

            </View>

            {/* Login Action Button */}
            <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%', marginTop: 4 }}>
              <TouchableOpacity 
                activeOpacity={0.85}
                onPress={handleLogin} 
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                disabled={loading}
                style={styles.buttonShadow}
              >
                <LinearGradient colors={['#E87954', '#D1582D']} style={styles.button}>
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <View style={styles.buttonContentRow}>
                      <Text style={styles.buttonText}>{t('login')}</Text>
                      <Ionicons name="arrow-forward" size={18} color="#FFF" />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Divider OR */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>
                {language === 'EN' ? 'OR CONTINUE WITH' : language === 'PH' ? 'O MAGPATULOY GAMIT ANG' : 'O MITULUY GAMIT ING'}
              </Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google / Gmail Sign-In Button */}
            <TouchableOpacity
              style={styles.googleButton}
              activeOpacity={0.8}
              onPress={handleGoogleAuth}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <ActivityIndicator color="#D1582D" />
              ) : (
                <View style={styles.googleBtnContent}>
                  <Ionicons name="logo-google" size={20} color="#EA4335" />
                  <Text style={styles.googleBtnText}>
                    {language === 'EN' ? 'Continue with Google' : language === 'PH' ? 'Magpatuloy gamit ang Google' : 'Mituluy gamit ing Google'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <TouchableOpacity 
              onPress={() => navigation.navigate('Register')} 
              style={styles.linkButton}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>
                {t('dont_have_account')}{' '}
                <Text style={styles.linkTextBold}>{t('create_account')}</Text>
              </Text>
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>

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
  topNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 12 : 36,
    paddingBottom: 10,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  langPillContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  langPillBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 30,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sealCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#050B14',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#F59E0B',
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  sealLogoImage: {
    width: 68,
    height: 68,
  },
  logoTitle: {
    fontSize: 34,
    fontFamily: 'Poppins_700Bold',
    color: '#0F172A',
    letterSpacing: 2,
  },
  logoE: {
    color: '#D1582D',
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 260,
  },
  formContainer: {
    marginBottom: 12,
  },
  inputWrapper: {
    marginBottom: 14,
  },
  inputLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#334155',
    marginBottom: 6,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  forgotPassText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#D1582D',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  inputBoxFocused: {
    borderColor: '#D1582D',
    shadowColor: '#D1582D',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    backgroundColor: '#FFFDFB',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInputField: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: '#0F172A',
  },
  buttonShadow: {
    borderRadius: 18,
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 0.5,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#CBD5E1',
  },
  dividerText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  googleBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  googleBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#334155',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 6,
  },
  linkText: {
    color: '#64748B',
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  linkTextBold: {
    color: '#D1582D',
    fontFamily: 'Poppins_700Bold',
  },
});
