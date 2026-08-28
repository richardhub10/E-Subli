import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Linking, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLanguage } from '../context/LanguageContext';
import { VersionCheckResult, DEFAULT_GITHUB_RELEASE_URL } from '../services/versionService';

type UpdateModalProps = {
  visible: boolean;
  versionInfo?: VersionCheckResult | null;
  onClose?: () => void;
  isForceUpdate?: boolean;
};

const { width } = Dimensions.get('window');

export default function UpdateModal({
  visible,
  versionInfo,
  onClose,
  isForceUpdate = false,
}: UpdateModalProps) {
  const { language } = useLanguage();

  if (!visible) return null;

  const downloadUrl = versionInfo?.downloadUrl || DEFAULT_GITHUB_RELEASE_URL;
  const currentVer = versionInfo?.currentVersion || '1.0.0';
  const latestVer = versionInfo?.latestVersion || '1.0.1';
  const releaseNotes = versionInfo?.releaseNotes || 'Includes new multiplayer synchronization, updated questions, and bug fixes.';

  const handleDownload = async () => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      const supported = await Linking.canOpenURL(downloadUrl);
      if (supported) {
        await Linking.openURL(downloadUrl);
      } else {
        await Linking.openURL('https://github.com/richardhub10/E-Subli/releases/latest');
      }
    } catch (err) {
      console.error('Failed to open download URL:', err);
      Linking.openURL('https://github.com/richardhub10/E-Subli/releases/latest').catch(console.error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!isForceUpdate && onClose) onClose();
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          
          {/* Header Glow Icon */}
          <View style={styles.iconCircleOuter}>
            <LinearGradient
              colors={['#E05326', '#D1582D', '#B83814']}
              style={styles.iconCircleGradient}
            >
              <Ionicons name="cloud-download" size={32} color="#FFFFFF" />
            </LinearGradient>
          </View>

          {/* Title & Badge */}
          <View style={styles.badgeRow}>
            <Ionicons name="sparkles" size={12} color="#D97706" />
            <Text style={styles.badgeText}>
              {language === 'EN' ? 'NEW VERSION AVAILABLE' : 'MAY BAGONG BERSYON'}
            </Text>
          </View>

          <Text style={styles.title}>
            {isForceUpdate 
              ? (language === 'EN' ? 'Multiplayer Update Required' : 'Kailangang Mag-update sa Arena')
              : (language === 'EN' ? 'Update E-Subli' : 'I-update ang E-Subli')}
          </Text>

          <Text style={styles.subtitle}>
            {language === 'EN'
              ? 'A newer version of E-Subli is required to ensure smooth multiplayer room syncing and fair battles.'
              : 'Kinakailangan ang pinakabagong bersyon upang maging maayos ang laban at koneksyon sa Multiplayer.'}
          </Text>

          {/* Version Comparison Pill */}
          <View style={styles.versionPillContainer}>
            <View style={styles.verBox}>
              <Text style={styles.verLabel}>{language === 'EN' ? 'CURRENT' : 'KASALUKUYAN'}</Text>
              <Text style={styles.verValCurrent}>v{currentVer}</Text>
            </View>

            <Ionicons name="arrow-forward" size={16} color="#94A3B8" />

            <View style={styles.verBox}>
              <Text style={styles.verLabel}>{language === 'EN' ? 'LATEST' : 'PINAKABAGO'}</Text>
              <Text style={styles.verValLatest}>v{latestVer}</Text>
            </View>
          </View>

          {/* Release Highlights */}
          <View style={styles.notesCard}>
            <View style={styles.notesHeader}>
              <Ionicons name="checkmark-circle" size={14} color="#059669" />
              <Text style={styles.notesTitle}>{language === 'EN' ? 'What\'s New' : 'Mga Pagbabago'}</Text>
            </View>
            <Text style={styles.notesText}>{releaseNotes}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionColumn}>
            <TouchableOpacity 
              style={styles.downloadBtn} 
              onPress={handleDownload}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={['#E05326', '#D1582D', '#B83814']}
                style={styles.downloadGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="logo-github" size={18} color="#FFFFFF" />
                <Text style={styles.downloadBtnText}>
                  {language === 'EN' ? 'Download APK from GitHub' : 'I-download ang APK sa GitHub'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {!isForceUpdate && onClose && (
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>
                  {language === 'EN' ? 'Remind Me Later' : 'Ipaalala Mamaya'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 99999,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFBF6',
    borderRadius: 26,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EDE3D8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 20,
  },
  iconCircleOuter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFEFE6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#FED7AA',
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  iconCircleGradient: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 8,
  },
  badgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    color: '#B45309',
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#1E1B18',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  versionPillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: 14,
  },
  verBox: {
    alignItems: 'center',
  },
  verLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 8.5,
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  verValCurrent: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#64748B',
  },
  verValLatest: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#D1582D',
  },
  notesCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  notesTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10.5,
    color: '#334155',
  },
  notesText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },
  actionColumn: {
    width: '100%',
    gap: 8,
  },
  downloadBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  downloadGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    gap: 8,
  },
  downloadBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  cancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#64748B',
  },
});
