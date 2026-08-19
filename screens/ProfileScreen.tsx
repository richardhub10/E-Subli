import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert, ScrollView, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { useProfile } from '../context/ProfileContext';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';

type ProfileScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { profile, updateProfile } = useProfile();
  const { t, language } = useLanguage();
  
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editFirstName, setEditFirstName] = useState(profile.firstName || '');
  const [editLastName, setEditLastName] = useState(profile.lastName || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const saveProfile = async () => {
    if (!editFirstName.trim()) {
      Alert.alert('Error', language === 'EN' ? 'First name cannot be empty.' : 'Hindi maaaring maging blangko ang unang pangalan.');
      return;
    }
    
    setIsSaving(true);
    try {
      await updateProfile({ firstName: editFirstName.trim(), lastName: editLastName.trim() });
      setIsEditModalVisible(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
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
      
    } catch (error: any) {
      console.error("Upload error:", error);
      Alert.alert("Upload Failed", error.message || "Failed to upload avatar.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Elo logic
  const getRankData = (elo: number) => {
    if (elo < 1200) return { name: 'Bronze', color: '#CD7F32', icon: 'medal-outline' };
    if (elo < 1500) return { name: 'Silver', color: '#C0C0C0', icon: 'medal' };
    if (elo < 1800) return { name: 'Gold', color: '#FFD700', icon: 'trophy-outline' };
    if (elo < 2100) return { name: 'Platinum', color: '#E5E4E2', icon: 'trophy' };
    return { name: 'Diamond', color: '#B9F2FF', icon: 'diamond-stone' };
  };
  
  const rank = getRankData(profile.eloRating);

  // Progress logic
  const nextLevelXp = profile.level * 100;
  const currentLevelProgress = profile.xp % 100;
  const progressPercent = Math.min(100, Math.max(0, (currentLevelProgress / 100) * 100));

  return (
    <LinearGradient colors={['#FAF5EE', '#E8DAC9']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile')}</Text>
        <View style={{ width: 44 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Main Glassmorphism Profile Card */}
        <LinearGradient colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']} style={styles.card}>
          
          <View style={styles.avatarSection}>
            <TouchableOpacity style={styles.avatarContainer} onPress={pickImage} disabled={isUploadingAvatar}>
              {isUploadingAvatar ? (
                <ActivityIndicator color="#D1582D" size="large" />
              ) : profile.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{profile.firstName?.charAt(0).toUpperCase() || profile.email?.charAt(0).toUpperCase() || 'U'}</Text>
              )}
              
              {/* Edit Button overlay */}
              <TouchableOpacity style={styles.editAvatarButton} onPress={() => {
                setEditFirstName(profile.firstName || '');
                setEditLastName(profile.lastName || '');
                setIsEditModalVisible(true);
              }}>
                <Ionicons name="pencil" size={16} color="#FFF" />
              </TouchableOpacity>
            </TouchableOpacity>

            <View style={styles.nameContainer}>
              {profile.firstName || profile.lastName ? (
                <Text style={styles.nameText}>
                  {profile.firstName} {profile.lastName}
                </Text>
              ) : (
                <Text style={styles.nameText}>{language === 'EN' ? 'Anonymous Scholar' : 'Hindi Kilalang Iskolar'}</Text>
              )}
              <Text style={styles.emailText}>{profile.email}</Text>
            </View>
          </View>

          {/* Gamified Badges Row (Streak & Rank) */}
          <View style={styles.badgesRow}>
            <View style={styles.badgeContainer}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <MaterialCommunityIcons name="fire" size={28} color="#EF4444" />
              </View>
              <View>
                <Text style={styles.badgeValue}>{profile.streakCount} {language === 'EN' ? 'Days' : 'Araw'}</Text>
                <Text style={styles.badgeLabel}>Day Streak</Text>
              </View>
            </View>
            
            <View style={styles.badgeDivider} />
            
            <View style={styles.badgeContainer}>
              <View style={[styles.iconCircle, { backgroundColor: `rgba(0, 0, 0, 0.05)` }]}>
                <MaterialCommunityIcons name={rank.icon as any} size={24} color={rank.color} />
              </View>
              <View>
                <Text style={[styles.badgeValue, { color: rank.color }]}>{rank.name}</Text>
                <Text style={styles.badgeLabel}>{profile.eloRating} Elo</Text>
              </View>
            </View>
          </View>
          
          {/* Level Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>{language === 'EN' ? 'Lvl' : 'Antas'} {profile.level}</Text>
              <Text style={styles.progressDetail}>{currentLevelProgress} / 100 XP</Text>
            </View>
            <View style={styles.progressBarBackground}>
              <LinearGradient 
                colors={['#10B981', '#34D399']} 
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} 
                style={[styles.progressBarFill, { width: `${progressPercent}%` }]} 
              />
            </View>
            <Text style={styles.progressFooter}>
              {100 - currentLevelProgress} XP to Lvl {profile.level + 1}
            </Text>
          </View>

        </LinearGradient>

        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>{language === 'EN' ? 'Learning Stats' : 'Istatistika'}</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Ionicons name="flash" size={24} color="#F59E0B" style={styles.statIcon} />
            <Text style={styles.statValue}>{profile.xp}</Text>
            <Text style={styles.statLabel}>{language === 'EN' ? 'Total XP' : 'Kabuuan XP'}</Text>
          </View>
          
          <View style={styles.statBox}>
            <Ionicons name="book" size={24} color="#3B82F6" style={styles.statIcon} />
            <Text style={styles.statValue}>{profile.flashcardsRead}</Text>
            <Text style={styles.statLabel}>{t('flashcards_read')}</Text>
          </View>
          
          <View style={styles.statBox}>
            <Ionicons name="pencil" size={24} color="#8B5CF6" style={styles.statIcon} />
            <Text style={styles.statValue}>{profile.writingPractices}</Text>
            <Text style={styles.statLabel}>{t('writing_practices')}</Text>
          </View>

          <View style={styles.statBox}>
            <Ionicons name="game-controller" size={24} color="#EF4444" style={styles.statIcon} />
            <Text style={styles.statValue}>{profile.eloRating}</Text>
            <Text style={styles.statLabel}>Match Elo</Text>
          </View>
        </View>

        {/* Footer Logout */}
        <TouchableOpacity onPress={handleLogout} style={{ width: '100%', marginTop: 10 }}>
          <LinearGradient colors={['#D1582D', '#B04724']} style={styles.logoutButton}>
            <Text style={styles.logoutButtonText}>{t('log_out')}</Text>
          </LinearGradient>
        </TouchableOpacity>
        
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={isEditModalVisible} transparent animationType="slide" onRequestClose={() => setIsEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{language === 'EN' ? 'Edit Profile' : 'I-edit ang Profile'}</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <Ionicons name="close" size={28} color="#64748B" />
              </TouchableOpacity>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
  },
  content: {
    padding: 20,
    paddingBottom: 60,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FAF5EE',
    borderWidth: 3,
    borderColor: '#D1582D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
    overflow: 'visible',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  avatarText: {
    fontSize: 32,
    fontFamily: 'Poppins_700Bold',
    color: '#D1582D',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#3B82F6',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  nameContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: '#0F172A',
  },
  emailText: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Poppins_500Medium',
  },
  badgesRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  badgeValue: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#0F172A',
  },
  badgeLabel: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
  },
  badgeDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
  progressContainer: {
    width: '100%',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#10B981',
  },
  progressDetail: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#64748B',
  },
  progressBarBackground: {
    width: '100%',
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressFooter: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  sectionTitle: {
    width: '100%',
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#334155',
    marginBottom: 16,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  statBox: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    color: '#0F172A',
    fontFamily: 'Poppins_700Bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Poppins_500Medium',
    marginTop: 4,
    textAlign: 'center',
  },
  logoutButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#0F172A',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#334155',
    marginBottom: 8,
  },
  inputField: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#0F172A',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
  }
});
