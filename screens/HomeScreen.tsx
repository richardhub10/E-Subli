import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { auth } from '../firebaseConfig';
import { useProfile } from '../context/ProfileContext';

type HomeScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { profile } = useProfile();

  // Simple scale animation wrapper
  const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

  const Card = ({ title, subtitle, icon, gradient, onPress }: any) => {
    const scale = new Animated.Value(1);

    const onPressIn = () => {
      Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
    };
    const onPressOut = () => {
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    };

    return (
      <AnimatedTouchable
        activeOpacity={1}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        style={[styles.cardContainer, { transform: [{ scale }] }]}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>{title}</Text>
              <Text style={styles.cardSubtitle}>{subtitle}</Text>
            </View>
            <View style={styles.iconContainer}>
              {icon}
            </View>
          </View>
        </LinearGradient>
      </AnimatedTouchable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Profile Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.emailText}>{auth.currentUser?.email?.split('@')[0] || 'Student'}</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileAvatar} 
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.avatarText}>
            {auth.currentUser?.email?.charAt(0).toUpperCase() || 'U'}
          </Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{profile.level}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 50 }}>
        <Text style={styles.sectionTitle}>Your Journey</Text>

        <Card 
          title="Read Hub" 
          subtitle="Master the Kulitan Syllables"
          icon={<Ionicons name="book" size={40} color="rgba(255,255,255,0.8)" />}
          gradient={['#D9734E', '#B85331']}
          onPress={() => navigation.navigate('ReadHub')}
        />

        <Card 
          title="Write & Trace" 
          subtitle="Practice physical strokes"
          icon={<MaterialCommunityIcons name="draw-pen" size={40} color="rgba(255,255,255,0.8)" />}
          gradient={['#3B82F6', '#2563EB']}
          onPress={() => navigation.navigate('WriteTrace')}
        />

        <Card 
          title="AI Scanner" 
          subtitle="Verify your handwriting"
          icon={<Ionicons name="scan-circle" size={40} color="rgba(255,255,255,0.8)" />}
          gradient={['#10B981', '#059669']}
          onPress={() => navigation.navigate('CameraScanner')}
        />

      </ScrollView>
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
    paddingTop: 60,
    paddingHorizontal: 25,
    paddingBottom: 20,
  },
  welcomeText: {
    color: 'rgba(250, 245, 238, 0.7)',
    fontSize: 16,
  },
  emailText: {
    color: '#FAF5EE',
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#D9734E',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#FAF5EE',
  },
  avatarText: {
    color: '#FAF5EE',
    fontSize: 20,
    fontWeight: 'bold',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#10B981',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0B2046',
  },
  levelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 25,
  },
  sectionTitle: {
    color: '#FAF5EE',
    fontSize: 22,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 20,
  },
  cardContainer: {
    width: '100%',
    height: 140,
    marginBottom: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
