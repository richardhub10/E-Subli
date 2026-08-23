import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, Dimensions, Modal, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

export type TabName = 'Home' | 'Learn' | 'Scanner' | 'Leaderboard' | 'Profile';

type FloatingBottomBarProps = {
  activeTab: TabName;
  navigation: any;
};

export default function FloatingBottomBar({ activeTab, navigation }: FloatingBottomBarProps) {
  const [showLearnModal, setShowLearnModal] = useState(false);
  const centerScaleAnim = useRef(new Animated.Value(1)).current;
  const { language } = useLanguage();

  const handleTabPress = (tab: TabName, routeName: string) => {
    if (tab === 'Learn') {
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setShowLearnModal(true);
      return;
    }

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

  const selectLearnRoute = (route: string) => {
    setShowLearnModal(false);
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    navigation.navigate(route);
  };

  const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

  return (
    <>
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

          {/* TAB 2: LEARN (Opens Learning Studio Modal) */}
          <TouchableOpacity 
            style={styles.tabItem} 
            onPress={() => handleTabPress('Learn', '')}
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

      {/* LEARNING STUDIO MODAL POPUP */}
      <Modal
        visible={showLearnModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLearnModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setShowLearnModal(false)}
        >
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            
            {/* Top Drag Handle */}
            <View style={styles.dragHandle} />

            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalSubHeader}>
                  {language === 'EN' ? 'LEARNING STUDIO' : 'ESTUDYO NG PAGKATUTO'}
                </Text>
                <Text style={styles.modalTitle}>
                  {language === 'EN' ? 'Choose Study Path' : 'Pumili ng Sanayin'}
                </Text>
              </View>

              <TouchableOpacity 
                style={styles.closeBtn} 
                onPress={() => setShowLearnModal(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* OPTION 1: READ HUB */}
            <TouchableOpacity 
              style={styles.choiceCard} 
              onPress={() => selectLearnRoute('ReadHub')}
              activeOpacity={0.9}
            >
              <LinearGradient 
                colors={['#E05326', '#B83814', '#942B0D']} 
                start={{ x: 0, y: 0 }} 
                end={{ x: 1, y: 1 }} 
                style={styles.choiceGradient}
              >
                <View style={styles.choiceLeft}>
                  <View style={styles.choiceBadgeRow}>
                    <View style={styles.choiceBadgePill}>
                      <Text style={styles.choiceBadgeText}>FOUNDATION</Text>
                    </View>
                    <View style={styles.choiceSubTag}>
                      <Ionicons name="sparkles" size={10} color="#FEF08A" />
                      <Text style={styles.choiceSubTagText}>SPACED REPETITION</Text>
                    </View>
                  </View>

                  <Text style={styles.choiceTitle}>Read Hub</Text>
                  <Text style={styles.choiceDesc}>
                    {language === 'EN' 
                      ? 'Master 24 root glyphs with 3D spaced repetition flashcards' 
                      : 'Kabisaduhin ang pagbasa ng mga titik at pantig'}
                  </Text>

                  <View style={styles.choiceActionChip}>
                    <Ionicons name="play-circle" size={13} color="#FFF" />
                    <Text style={styles.choiceActionText}>
                      {language === 'EN' ? 'Start Reading →' : 'Simulan →'}
                    </Text>
                  </View>
                </View>

                <View style={styles.choiceIconRing}>
                  <Ionicons name="book" size={32} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* OPTION 2: WRITE & TRACE */}
            <TouchableOpacity 
              style={styles.choiceCard} 
              onPress={() => selectLearnRoute('WriteTrace')}
              activeOpacity={0.9}
            >
              <LinearGradient 
                colors={['#1E293B', '#111827', '#0A0E17']} 
                start={{ x: 0, y: 0 }} 
                end={{ x: 1, y: 1 }} 
                style={styles.choiceGradient}
              >
                <View style={styles.choiceLeft}>
                  <View style={styles.choiceBadgeRow}>
                    <View style={[styles.choiceBadgePill, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                      <Text style={[styles.choiceBadgeText, { color: '#FBBF24' }]}>STUDIO CANVAS</Text>
                    </View>
                    <View style={[styles.choiceSubTag, { backgroundColor: 'rgba(255, 255, 255, 0.12)' }]}>
                      <Ionicons name="ribbon" size={10} color="#FBBF24" />
                      <Text style={[styles.choiceSubTagText, { color: '#FDE68A' }]}>3-STAR EVALUATOR</Text>
                    </View>
                  </View>

                  <Text style={styles.choiceTitle}>Write & Trace</Text>
                  <Text style={styles.choiceDesc}>
                    {language === 'EN' 
                      ? 'Interactive calligraphy canvas with stroke evaluation & blind mode' 
                      : 'Sanayin ang pagsulat sa gabay ng panulat'}
                  </Text>

                  <View style={styles.choiceActionChip}>
                    <Ionicons name="pencil" size={13} color="#FFF" />
                    <Text style={styles.choiceActionText}>
                      {language === 'EN' ? 'Practice Stroke →' : 'Gumuhit →'}
                    </Text>
                  </View>
                </View>

                <View style={[styles.choiceIconRing, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                  <MaterialCommunityIcons name="draw-pen" size={32} color="#FBBF24" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Quick Link: Historical Guide */}
            <TouchableOpacity 
              style={styles.guideQuickTile} 
              onPress={() => selectLearnRoute('KulitanGuide')}
              activeOpacity={0.8}
            >
              <View style={styles.guideQuickIconBox}>
                <Ionicons name="school" size={18} color="#D1582D" />
              </View>
              <View style={styles.guideQuickTextBox}>
                <Text style={styles.guideQuickTitle}>
                  {language === 'EN' ? 'Kulitan Writing Guide & History' : 'Gabay sa Kasaysayan at Pagsulat'}
                </Text>
                <Text style={styles.guideQuickSub}>
                  {language === 'EN' ? 'Indû, Anak, and Kudlit modifiers' : 'Panuntunan ng pagsulat'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </TouchableOpacity>

          </Pressable>
        </Pressable>
      </Modal>
    </>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFBF6',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalSubHeader: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    color: '#D1582D',
    letterSpacing: 1,
  },
  modalTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    color: '#1E1B18',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceCard: {
    borderRadius: 22,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  choiceGradient: {
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  choiceLeft: {
    flex: 1,
    paddingRight: 10,
  },
  choiceBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  choiceBadgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  choiceBadgeText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 8,
    letterSpacing: 0.5,
  },
  choiceSubTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  choiceSubTagText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 8,
    color: '#FFFFFF',
  },
  choiceTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  choiceDesc: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255, 255, 255, 0.88)',
    lineHeight: 15,
    marginBottom: 8,
  },
  choiceActionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  choiceActionText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  choiceIconRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  guideQuickTile: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EDE3D8',
    marginTop: 2,
    gap: 10,
  },
  guideQuickIconBox: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#FFF1EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideQuickTextBox: {
    flex: 1,
  },
  guideQuickTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#1E1B18',
  },
  guideQuickSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#8C7E72',
  },
});
