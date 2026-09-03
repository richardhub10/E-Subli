import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert, ScrollView, Image, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { decode } from 'base64-arraybuffer';
import { useProfile } from '../context/ProfileContext';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Language } from '../utils/translations';
import { CURRENT_APP_VERSION } from '../services/versionService';

type ProfileScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { profile, updateProfile } = useProfile();
  const { t, language, setLanguage } = useLanguage();
  const { signOut } = useAuth();
  
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editFirstName, setEditFirstName] = useState(profile.firstName || '');
  const [editLastName, setEditLastName] = useState(profile.lastName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowLogoutModal(true);
  };

  const saveProfile = async () => {
    if (!editFirstName.trim()) {
      Alert.alert('Error', language === 'EN' ? 'First name cannot be empty.' : 'Hindi maaaring maging blangko ang unang pangalan.');
      return;
    }
    
    setIsSaving(true);
    try {
      await updateProfile({ firstName: editFirstName.trim(), lastName: editLastName.trim() });
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsEditModalVisible(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.base64) {
          await uploadAvatar(asset.base64);
        }
      }
    } catch (error) {
      console.error("Image pick error", error);
      Alert.alert("Error", "Could not pick image.");
    }
  };

  const uploadAvatar = async (base64Str: string) => {
    setIsUploadingAvatar(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const filePath = `${user.id}/${new Date().getTime()}.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, decode(base64Str), {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      await updateProfile({ avatarUrl: data.publicUrl });
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
    } catch (error: any) {
      console.error("Upload error:", error);
      Alert.alert("Upload Failed", error.message || "Failed to upload avatar.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const getRankData = (elo: number) => {
    if (elo < 1200) return { name: 'Bronze Scholar', badgeBg: '#FEF3C7', color: '#D97706', icon: 'medal-outline', tier: 'III' };
    if (elo < 1500) return { name: 'Silver Scribe', badgeBg: '#F1F5F9', color: '#64748B', icon: 'medal', tier: 'II' };
    if (elo < 1800) return { name: 'Gold Master', badgeBg: '#FEF3C7', color: '#F59E0B', icon: 'trophy', tier: 'I' };
    if (elo < 2100) return { name: 'Platinum Elite', badgeBg: '#EDE9FE', color: '#7C3AED', icon: 'shield-checkmark', tier: 'ELITE' };
    return { name: 'Diamond Luminary', badgeBg: '#E0F2FE', color: '#0284C7', icon: 'diamond', tier: 'LUMINARY' };
  };
  
  const rank = getRankData(profile.eloRating || 1000);
  const currentLevelProgress = profile.xp % 100;
  const progressPercent = Math.min(100, Math.max(0, currentLevelProgress));

  return (
    <LinearGradient colors={['#FAF6F0', '#F3EAE0', '#EAE0D3']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#1E1B18" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile')}</Text>
        <TouchableOpacity 
          style={styles.editHeaderBtn}
          onPress={() => {
            setEditFirstName(profile.firstName || '');
            setEditLastName(profile.lastName || '');
            setIsEditModalVisible(true);
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={20} color="#D1582D" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* HERO PROFILE MASTERY CARD */}
        <View style={styles.heroCard}>
          <LinearGradient 
            colors={['#FFFFFF', '#FCF9F5']} 
            style={styles.heroCardInner}
          >
            {/* Top Avatar & Name Section */}
            <View style={styles.avatarSection}>
              <TouchableOpacity 
                style={styles.avatarContainer} 
                onPress={() => {
                  setEditFirstName(profile.firstName || '');
                  setEditLastName(profile.lastName || '');
                  setIsEditModalVisible(true);
                }}
                activeOpacity={0.85}
              >
                {profile.avatarUrl ? (
                  <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>
                    {profile.firstName?.charAt(0).toUpperCase() || profile.email?.charAt(0).toUpperCase() || 'S'}
                  </Text>
                )}
                
                <View style={styles.editAvatarBadge}>
                  <Ionicons name="camera" size={13} color="#FFF" />
                </View>
              </TouchableOpacity>

              <View style={styles.nameContainer}>
                <Text style={styles.nameText} numberOfLines={1}>
                  {profile.firstName || profile.lastName 
                    ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
                    : 'Scholar Scribe'}
                </Text>
                <Text style={styles.emailText} numberOfLines={1}>{profile.email}</Text>
                
                {/* Rank Emblem Pill */}
                <View style={[styles.rankEmblemPill, { backgroundColor: rank.badgeBg, borderColor: rank.color }]}>
                  <Ionicons name={rank.icon as any} size={13} color={rank.color} />
                  <Text style={[styles.rankEmblemText, { color: rank.color }]}>
                    {rank.name}
                  </Text>
                </View>
              </View>
            </View>

            {/* Level Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>
                  {language === 'EN' ? 'Level' : 'Antas'} {profile.level}
                </Text>
                <Text style={styles.progressDetail}>{currentLevelProgress} / 100 XP</Text>
              </View>
              <View style={styles.progressBarBackground}>
                <LinearGradient 
                  colors={['#F59E0B', '#E87954', '#D1582D']} 
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} 
                  style={[styles.progressBarFill, { width: `${progressPercent}%` }]} 
                />
              </View>
              <Text style={styles.progressFooter}>
                {100 - currentLevelProgress} XP {language === 'EN' ? 'to Level' : 'para sa Antas'} {profile.level + 1}
              </Text>
            </View>

          </LinearGradient>
        </View>

        {/* 4-CARD STATISTICS BENTO GRID */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            {language === 'EN' ? 'Scholar Achievements' : 'Mga Istatistika at Tagumpay'}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          {/* Total XP */}
          <View style={styles.statBox}>
            <View style={[styles.statIconBox, { backgroundColor: '#FFFBEB' }]}>
              <Ionicons name="flash" size={20} color="#D97706" />
            </View>
            <Text style={styles.statValue}>{profile.xp}</Text>
            <Text style={styles.statLabel}>{language === 'EN' ? 'Total XP' : 'Kabuuan XP'}</Text>
          </View>
          
          {/* Day Streak */}
          <View style={styles.statBox}>
            <View style={[styles.statIconBox, { backgroundColor: '#FFF7ED' }]}>
              <Text style={{ fontSize: 18 }}>🔥</Text>
            </View>
            <Text style={styles.statValue}>{profile.streakCount || 0}</Text>
            <Text style={styles.statLabel}>{language === 'EN' ? 'Day Streak' : 'Sunod-sunod'}</Text>
          </View>
          
          {/* Flashcards Read */}
          <View style={styles.statBox}>
            <View style={[styles.statIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="book" size={18} color="#2563EB" />
            </View>
            <Text style={styles.statValue}>{profile.flashcardsRead || 0}</Text>
            <Text style={styles.statLabel}>{t('flashcards_read')}</Text>
          </View>

          {/* Writing Practices */}
          <View style={styles.statBox}>
            <View style={[styles.statIconBox, { backgroundColor: '#F5F3FF' }]}>
              <Ionicons name="pencil" size={18} color="#7C3AED" />
            </View>
            <Text style={styles.statValue}>{profile.writingPractices || 0}</Text>
            <Text style={styles.statLabel}>{t('writing_practices')}</Text>
          </View>
        </View>

        {/* LANGUAGE SELECTION SETTING */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{language === 'EN' ? 'Language Setting' : 'Wika / Salita'}</Text>
        </View>

        <View style={styles.langSettingCard}>
          {[
            { code: 'EN', name: 'English', subtitle: 'US English' },
            { code: 'PH', name: 'Filipino', subtitle: 'Wikang Pambansa' },
            { code: 'KPM', name: 'Kapampangan', subtitle: 'Amanung Sisuan' },
          ].map((item) => {
            const isSelected = language === item.code;
            return (
              <TouchableOpacity
                key={item.code}
                style={[styles.langOptionRow, isSelected && styles.langOptionRowActive]}
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.selectionAsync();
                  setLanguage(item.code as Language);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.langOptionTextGroup}>
                  <Text style={[styles.langOptionName, isSelected && styles.langOptionNameActive]}>
                    {item.name}
                  </Text>
                  <Text style={styles.langOptionSubtitle}>{item.subtitle}</Text>
                </View>
                <View style={[styles.langRadioCircle, isSelected && styles.langRadioCircleActive]}>
                  {isSelected && <Ionicons name="checkmark" size={14} color="#FFF" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity 
          onPress={handleLogout} 
          style={styles.logoutButtonWrap}
          activeOpacity={0.85}
        >
          <View style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={20} color="#DC2626" style={{ marginRight: 6 }} />
            <Text style={styles.logoutButtonText}>{t('log_out')}</Text>
          </View>
        </TouchableOpacity>

        {/* VERSION INFO FOOTER */}
        <View style={styles.versionFooterWrap}>
          <View style={styles.versionBadgePill}>
            <Ionicons name="shield-checkmark" size={11} color="#64748B" />
            <Text style={styles.versionBadgeText}>Version {CURRENT_APP_VERSION}</Text>
          </View>
          <Text style={styles.versionSubText}>E-Subli • Kapampangan Heritage Studio</Text>
        </View>
        
      </ScrollView>

      {/* EDIT PROFILE MODAL */}
      <Modal 
        visible={isEditModalVisible} 
        transparent 
        animationType="slide" 
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{language === 'EN' ? 'Edit Profile' : 'I-edit ang Profile'}</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalAvatarSection}>
              <TouchableOpacity style={styles.modalAvatarContainer} onPress={pickImage} disabled={isUploadingAvatar} activeOpacity={0.8}>
                {isUploadingAvatar ? (
                  <ActivityIndicator color="#D1582D" size="large" />
                ) : profile.avatarUrl ? (
                  <Image source={{ uri: profile.avatarUrl }} style={styles.modalAvatarImage} />
                ) : (
                  <Text style={styles.modalAvatarText}>
                    {profile.firstName?.charAt(0).toUpperCase() || profile.email?.charAt(0).toUpperCase() || 'S'}
                  </Text>
                )}
                <View style={styles.modalAvatarEditOverlay}>
                  <Ionicons name="camera" size={16} color="#FFF" />
                </View>
              </TouchableOpacity>
              <Text style={styles.modalAvatarHint}>{language === 'EN' ? 'Tap to change photo' : 'Pindutin para palitan'}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{language === 'EN' ? 'First Name' : 'Unang Pangalan'}</Text>
              <TextInput
                style={styles.inputField}
                value={editFirstName}
                onChangeText={setEditFirstName}
                placeholder="e.g. Juan"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{language === 'EN' ? 'Last Name' : 'Apelyido'}</Text>
              <TextInput
                style={styles.inputField}
                value={editLastName}
                onChangeText={setEditLastName}
                placeholder="e.g. Dela Cruz"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={saveProfile}
              disabled={isSaving}
              activeOpacity={0.85}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveButtonText}>{language === 'EN' ? 'Save Changes' : 'I-save'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* CUSTOM IN-APP SIGN OUT CONFIRMATION MODAL */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.logoutModalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            onPress={() => setShowLogoutModal(false)}
            activeOpacity={1}
          />
          
          <View style={styles.logoutModalCard}>
            <View style={styles.logoutIconCircle}>
              <Ionicons name="log-out" size={28} color="#DC2626" />
            </View>
            
            <Text style={styles.logoutModalTitle}>
              {language === 'EN' ? 'Sign Out of E-Subli?' : 'Mag-sign Out sa E-Subli?'}
            </Text>
            
            <Text style={styles.logoutModalDesc}>
              {language === 'EN' 
                ? 'Are you sure you want to sign out? Your scholar XP, streaks, and progress are securely saved.'
                : 'Sigurado ka bang nais mong mag-sign out? Ligtas na naka-save ang iyong antas at XP.'}
            </Text>

            <View style={styles.logoutModalActions}>
              <TouchableOpacity 
                style={styles.confirmLogoutBtn}
                onPress={async () => {
                  setShowLogoutModal(false);
                  try {
                    await signOut();
                  } catch (error) {
                    console.error('Logout error:', error);
                  }
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="log-out-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.confirmLogoutText}>
                  {language === 'EN' ? 'Sign Out' : 'Mag-sign Out'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.cancelLogoutBtn}
                onPress={() => setShowLogoutModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelLogoutText}>
                  {language === 'EN' ? 'Cancel' : 'Kanselahin'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingTop: Platform.OS === 'ios' ? 56 : 38,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#1E1B18',
  },
  editHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    paddingTop: 6,
  },
  heroCard: {
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  heroCardInner: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#EDE3D8',
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 14,
  },
  avatarContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#F59E0B',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 34,
  },
  avatarText: {
    fontSize: 26,
    fontFamily: 'Poppins_700Bold',
    color: '#F59E0B',
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#D1582D',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  nameContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#1E1B18',
  },
  emailText: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: '#8C7E72',
    marginBottom: 6,
  },
  rankEmblemPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
    borderWidth: 1,
  },
  rankEmblemText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
  },
  progressContainer: {
    paddingTop: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#1E1B18',
  },
  progressDetail: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#D1582D',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#EAE0D3',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressFooter: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: '#8C7E72',
    textAlign: 'right',
  },
  sectionHeaderRow: {
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
    color: '#1E1B18',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#EDE3D8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#1E1B18',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: '#8C7E72',
  },
  langSettingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 8,
    borderWidth: 1.5,
    borderColor: '#EDE3D8',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  langOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
  },
  langOptionRowActive: {
    backgroundColor: '#FFF7ED',
  },
  langOptionTextGroup: {
    flex: 1,
  },
  langOptionName: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#1E1B18',
  },
  langOptionNameActive: {
    color: '#D1582D',
    fontFamily: 'Poppins_700Bold',
  },
  langOptionSubtitle: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: '#8C7E72',
  },
  langRadioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  langRadioCircleActive: {
    backgroundColor: '#D1582D',
    borderColor: '#D1582D',
  },
  logoutButtonWrap: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF1F2',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FECDD3',
  },
  logoutButtonText: {
    color: '#DC2626',
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
  },
  versionFooterWrap: {
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 40,
    gap: 4,
  },
  versionBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(241, 245, 249, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  versionBadgeText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#64748B',
    letterSpacing: 0.3,
  },
  versionSubText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 9.5,
    color: '#94A3B8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#1E1B18',
  },
  modalAvatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 6,
  },
  modalAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  modalAvatarText: {
    color: '#F59E0B',
    fontFamily: 'Poppins_700Bold',
    fontSize: 32,
  },
  modalAvatarEditOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#D1582D',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  modalAvatarHint: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: '#8C7E72',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#1E1B18',
    marginBottom: 4,
  },
  inputField: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: '#1E1B18',
  },
  saveButton: {
    backgroundColor: '#D1582D',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
  },
  logoutModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoutModalCard: {
    backgroundColor: '#FFFBF6',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EDE3D8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  logoutIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#FECDD3',
  },
  logoutModalTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#1E1B18',
    marginBottom: 6,
    textAlign: 'center',
  },
  logoutModalDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#8C7E72',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  logoutModalActions: {
    width: '100%',
    gap: 8,
  },
  confirmLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 13,
    borderRadius: 14,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmLogoutText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
  },
  cancelLogoutBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 11,
    borderRadius: 14,
  },
  cancelLogoutText: {
    color: '#64748B',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
  },
});
