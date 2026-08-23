import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export type TabName = 'Home' | 'Learn' | 'Scanner' | 'Leaderboard' | 'Profile';

type FloatingBottomBarProps = {
  activeTab: TabName;
  navigation: any;
};

export default function FloatingBottomBar({ activeTab, navigation }: FloatingBottomBarProps) {
  const centerScaleAnim = useRef(new Animated.Value(1)).current;

  const handleTabPress = (tab: TabName, routeName: string) => {
    if (activeTab === tab) return;
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    navigation.navigate(routeName);
  };

  const handleScannerPress = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(centerScaleAnim, { toValue: 0.88, duration: 100, useNativeDriver: true }),
      Animated.spring(centerScaleAnim, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate('CameraScanner');
    });
  };

  const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

  return (
    <View style={styles.dockWrapper} pointerEvents="box-none">
      <View style={styles.dockBar}>
        
        {/* TAB 1: HOME */}
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => handleTabPress('Home', 'Home')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={activeTab === 'Home' ? "home" : "home-outline"} 
            size={22} 
            color={activeTab === 'Home' ? "#D1582D" : "#8C7E72"} 
          />
          <Text style={[styles.tabLabel, activeTab === 'Home' && styles.tabLabelActive]}>
            Home
          </Text>
          {activeTab === 'Home' && <View style={styles.activeDot} />}
        </TouchableOpacity>

        {/* TAB 2: LEARN */}
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => handleTabPress('Learn', 'ReadHub')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={activeTab === 'Learn' ? "book" : "book-outline"} 
            size={22} 
            color={activeTab === 'Learn' ? "#D1582D" : "#8C7E72"} 
          />
          <Text style={[styles.tabLabel, activeTab === 'Learn' && styles.tabLabelActive]}>
            Learn
          </Text>
          {activeTab === 'Learn' && <View style={styles.activeDot} />}
        </TouchableOpacity>

        {/* TAB 3: CENTER ELEVATED AI CAMERA SCANNER FAB */}
        <View style={styles.centerFabSlot} pointerEvents="box-none">
          <AnimatedTouchable
            style={[
              styles.centerFabBtn,
              { transform: [{ scale: centerScaleAnim }] }
            ]}
            onPress={handleScannerPress}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#E05326', '#D1582D', '#B83814']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.centerFabGradient}
            >
              <View style={styles.lensOuterRing}>
                <Ionicons name="scan" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.centerFabLabel}>SCAN</Text>
            </LinearGradient>
          </AnimatedTouchable>
        </View>

        {/* TAB 4: LEADERBOARD */}
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => handleTabPress('Leaderboard', 'Leaderboard')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={activeTab === 'Leaderboard' ? "trophy" : "trophy-outline"} 
            size={22} 
            color={activeTab === 'Leaderboard' ? "#D1582D" : "#8C7E72"} 
          />
          <Text style={[styles.tabLabel, activeTab === 'Leaderboard' && styles.tabLabelActive]}>
            Ranks
          </Text>
          {activeTab === 'Leaderboard' && <View style={styles.activeDot} />}
        </TouchableOpacity>

        {/* TAB 5: PROFILE */}
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => handleTabPress('Profile', 'Profile')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={activeTab === 'Profile' ? "person" : "person-outline"} 
            size={22} 
            color={activeTab === 'Profile' ? "#D1582D" : "#8C7E72"} 
          />
          <Text style={[styles.tabLabel, activeTab === 'Profile' && styles.tabLabelActive]}>
            Profile
          </Text>
          {activeTab === 'Profile' && <View style={styles.activeDot} />}
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dockWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
    paddingHorizontal: 16,
  },
  dockBar: {
    width: '100%',
    maxWidth: 420,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  tabLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: '#8C7E72',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#D1582D',
    fontFamily: 'Poppins_700Bold',
  },
  activeDot: {
    position: 'absolute',
    bottom: 0,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1582D',
  },
  centerFabSlot: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerFabBtn: {
    position: 'absolute',
    top: -34,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#D1582D',
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 12,
    borderWidth: 3.5,
    borderColor: '#FFFBF6',
  },
  centerFabGradient: {
    flex: 1,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lensOuterRing: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerFabLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 8.5,
    color: '#FFFFFF',
    letterSpacing: 0.8,
    marginTop: 1,
  },
});
