import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { ActivityIndicator, View, Platform } from 'react-native';
import { NavigationBar } from 'expo-navigation-bar';

import { AuthProvider, useAuth } from './context/AuthContext';
import WelcomeScreen from './screens/WelcomeScreen';
import KulitanGuideScreen from './screens/KulitanGuideScreen';
import { LanguageProvider } from './context/LanguageContext';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import ReadHubScreen from './screens/ReadHubScreen';
import WriteTraceScreen from './screens/WriteTraceScreen';
import CameraScannerScreen from './screens/CameraScannerScreen';
import TranslatorScreen from './screens/TranslatorScreen';
import PhrasebookScreen from './screens/PhrasebookScreen';
import ProfileScreen from './screens/ProfileScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import FriendsScreen from './screens/FriendsScreen';
import MultiplayerLobbyScreen from './screens/MultiplayerLobbyScreen';
import QuizBattleScreen from './screens/QuizBattleScreen';
import OfflineQuizScreen from './screens/OfflineQuizScreen';
import { ProfileProvider } from './context/ProfileContext';

const Stack = createStackNavigator();

export const navigationRef = createNavigationContainerRef<any>();

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF5EE' }}>
        <ActivityIndicator size="large" color="#D9734E" />
      </View>
    );
  }

  return (
    <LanguageProvider>
      <NavigationContainer ref={navigationRef}>
        {user ? (
          <ProfileProvider>
          <Stack.Navigator screenOptions={{ 
            headerShown: false, 
            cardStyle: { flex: 1 },
            ...TransitionPresets.SlideFromRightIOS
          }}>
            {/* The routes are defined in the Auth listener above, but normally we'd structure it better. Let's just conditionally render here. */}
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="ReadHub" component={ReadHubScreen} />
            <Stack.Screen name="WriteTrace" component={WriteTraceScreen} />
            <Stack.Screen name="CameraScanner" component={CameraScannerScreen} />
            <Stack.Screen name="Translator" component={TranslatorScreen} />
            <Stack.Screen name="Phrasebook" component={PhrasebookScreen} />
            <Stack.Screen name="KulitanGuide" component={KulitanGuideScreen} />
            <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
            <Stack.Screen name="Friends" component={FriendsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="MultiplayerLobby" component={MultiplayerLobbyScreen} />
            <Stack.Screen name="QuizBattle" component={QuizBattleScreen} />
            <Stack.Screen name="OfflineQuiz" component={OfflineQuizScreen} />
          </Stack.Navigator>
        </ProfileProvider>
      ) : (
        <Stack.Navigator initialRouteName="Welcome" screenOptions={{ 
          headerShown: false, 
          cardStyle: { flex: 1 },
          ...TransitionPresets.SlideFromRightIOS
        }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="KulitanGuide" component={KulitanGuideScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      )}
      </NavigationContainer>
    </LanguageProvider>
  );
}

export default function App() {
  const [customFontsLoaded, setCustomFontsLoaded] = useState(false);
  const [googleFontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'Kulitan': require('./assets/fonts/Bay_K_Pamagkulit.ttf'),
        'Bay_K_Pamagkulit': require('./assets/fonts/Bay_K_Pamagkulit.ttf'),
      });
      setCustomFontsLoaded(true);
    }
    loadFonts();

    // Auto-hide Android 3-button navigation bar (Sticky Immersive Mode)
    if (Platform.OS === 'android') {
      try {
        NavigationBar.setHidden(true);
      } catch (e) {
        console.log('NavigationBar setup error:', e);
      }
    }
  }, []);

  if (!customFontsLoaded || !googleFontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B2046' }}>
        <ActivityIndicator size="large" color="#D9734E" />
      </View>
    );
  }

  return (
    <AuthProvider>
      {Platform.OS === 'android' && <NavigationBar hidden={true} />}
      <AppNavigator />
    </AuthProvider>
  );
}
