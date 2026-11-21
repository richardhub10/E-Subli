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

type RegisterScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { t, language, setLanguage } = useLanguage();

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password || !confirmPassword) {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          }
        }
      });
      if (error) throw error;
      
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Registration Successful', 'You can now log in.');
      navigation.replace('Login');
    } catch (error: any) {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Registration Failed', error.message);
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
            if (Platform.OS === 'ios') {
              try {
                WebBrowser.dismissAuthSession();
              } catch {}
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Google Sign-Up Error:', error);
      if (error?.message?.includes('dismissBrowser')) {
        return;
      }
      Alert.alert('Google Sign-Up', error.message || 'Could not complete Google registration.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Button Animation
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
            
            {/* Header Brand */}
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
                  ? 'Create your account to start learning' 
                  : language === 'PH' 
                  ? 'Lumikha ng account upang magsimula' 
                  : 'Gawa kang account bang mag-umpisa'}
              </Text>
            </View>
            
            {/* Google / Gmail Sign-Up Option Button */}
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
                    {language === 'EN' ? 'Sign up with Google / Gmail' : language === 'PH' ? 'Mag-sign up gamit ang Google' : 'Mag-sign up gamit ing Google'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Divider OR */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>
                {language === 'EN' ? 'OR USE EMAIL' : language === 'PH' ? 'O GAMIT ANG EMAIL' : 'O GAMIT ING EMAIL'}
              </Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Input Form */}
            <View style={styles.formContainer}>
              
              {/* Name Row */}
              <View style={styles.nameRow}>
                <View style={[styles.inputWrapper, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>{t('first_name')}</Text>
                  <View style={[styles.inputBox, focusedField === 'first' && styles.inputBoxFocused]}>
                    <Ionicons name="person-outline" size={18} color={focusedField === 'first' ? '#D1582D' : '#94A3B8'} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInputField}
                      placeholder="Juan"
                      placeholderTextColor="#94A3B8"
                      value={firstName}
                      onChangeText={setFirstName}
                      onFocus={() => setFocusedField('first')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>

                <View style={[styles.inputWrapper, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>{t('last_name')}</Text>
                  <View style={[styles.inputBox, focusedField === 'last' && styles.inputBoxFocused]}>
                    <TextInput
                      style={styles.textInputField}
                      placeholder="Dela Cruz"
                      placeholderTextColor="#94A3B8"
                      value={lastName}
                      onChangeText={setLastName}
                      onFocus={() => setFocusedField('last')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>{t('email')}</Text>
                <View style={[styles.inputBox, focusedField === 'email' && styles.inputBoxFocused]}>
                  <Ionicons name="mail-outline" size={18} color={focusedField === 'email' ? '#D1582D' : '#94A3B8'} style={styles.inputIcon} />
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
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>{t('password')}</Text>
                <View style={[styles.inputBox, focusedField === 'password' && styles.inputBoxFocused]}>
                  <Ionicons name="lock-closed-outline" size={18} color={focusedField === 'password' ? '#D1582D' : '#94A3B8'} style={styles.inputIcon} />
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
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>
                  {language === 'EN' ? 'Confirm Password' : 'Kumpirmahin ang Password'}
                </Text>
                <View style={[styles.inputBox, focusedField === 'confirm' && styles.inputBoxFocused]}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={focusedField === 'confirm' ? '#D1582D' : '#94A3B8'} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInputField}
                    placeholder="••••••••••••"
                    placeholderTextColor="#94A3B8"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    onFocus={() => setFocusedField('confirm')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              </View>

            </View>

            {/* Create Account Button */}
            <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%', marginTop: 6 }}>
              <TouchableOpacity 
                activeOpacity={0.85}
                onPress={handleRegister} 
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
                      <Text style={styles.buttonText}>{t('create_account')}</Text>
                      <Ionicons name="checkmark-circle" size={18} color="#FFF" />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Link back to Login */}
            <TouchableOpacity 
              onPress={() => navigation.navigate('Login')} 
              style={styles.linkButton}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>
                {t('already_have_account')}{' '}
                <Text style={styles.linkTextBold}>{t('login')}</Text>
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
    marginBottom: 20,
  },
  sealCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#050B14',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#F59E0B',
    overflow: 'hidden',
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  sealLogoImage: {
    width: 64,
    height: 64,
  },
  logoTitle: {
    fontSize: 30,
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
    marginTop: 2,
    maxWidth: 280,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    paddingVertical: 14,
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
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
  formContainer: {
    marginBottom: 10,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputWrapper: {
    marginBottom: 10,
  },
  inputLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#334155',
    marginBottom: 4,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  inputBoxFocused: {
    borderColor: '#D1582D',
    backgroundColor: '#FFFDFB',
  },
  inputIcon: {
    marginRight: 8,
  },
  textInputField: {
    flex: 1,
    fontSize: 14,
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
    paddingVertical: 15,
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
    fontSize: 15,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 0.5,
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 6,
  },
  linkText: {
    color: '#64748B',
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
  },
  linkTextBold: {
    color: '#D1582D',
    fontFamily: 'Poppins_700Bold',
  },
});
