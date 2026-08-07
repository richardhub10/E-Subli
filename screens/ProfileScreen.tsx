import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useProfile } from '../context/ProfileContext';
import { auth } from '../firebaseConfig';

type ProfileScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { profile } = useProfile();
  
  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'< Dashboard'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PROFILE</Text>
        <View style={{ width: 80 }} /> 
      </View>

      <View style={styles.content}>
        <LinearGradient
          colors={['#1a365d', '#0B2046']}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{auth.currentUser?.email?.charAt(0).toUpperCase() || 'U'}</Text>
          </View>
          <Text style={styles.emailText}>{auth.currentUser?.email}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>Lvl {profile.level}</Text>
              <Text style={styles.statLabel}>Current Level</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{profile.xp}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{profile.flashcardsRead}</Text>
              <Text style={styles.statLabel}>Flashcards</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{profile.writingPractices}</Text>
              <Text style={styles.statLabel}>Trace Practices</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B2046', 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: '#D9734E',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#FAF5EE',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D9734E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FAF5EE',
  },
  emailText: {
    fontSize: 18,
    color: '#FAF5EE',
    marginBottom: 30,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D9734E',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(250, 245, 238, 0.7)',
  },
  divider: {
    width: '80%',
    height: 1,
    backgroundColor: 'rgba(250, 245, 238, 0.1)',
    marginVertical: 20,
  },
  footer: {
    padding: 30,
    paddingBottom: 50,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logoutButtonText: {
    color: '#FAF5EE',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
