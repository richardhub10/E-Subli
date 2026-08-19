import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { phrasebookData, PhraseCategory, Phrase } from '../data/phrasebookData';

type PhrasebookScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

export default function PhrasebookScreen({ navigation }: PhrasebookScreenProps) {
  const [activeCategory, setActiveCategory] = useState<PhraseCategory>('Greetings');
  const { t, language } = useLanguage();

  const categories: PhraseCategory[] = ['Greetings', 'Basics', 'Numbers', 'Family'];

  const filteredData = phrasebookData.filter(item => item.category === activeCategory);

  const renderItem = ({ item }: { item: Phrase }) => (
    <View style={styles.card}>
      <View style={styles.kulitanContainer}>
        {item.kulitan.split(' ').map((word, wordIdx) => (
          <View key={wordIdx} style={styles.verticalWordColumn}>
            {word.split('-').map((char, charIdx) => (
              <Text key={charIdx} style={styles.kulitanText}>{char}</Text>
            ))}
          </View>
        ))}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.kapampanganText}>{item.kapampangan}</Text>
        <Text style={styles.englishText}>{language === 'EN' ? item.english : item.kapampangan}</Text> 
        {/* We assume Tagalog translation could be added to phrasebookData in the future, for now fallback to english if EN, else keep kapampangan */}
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#FAF5EE', '#E8DAC9']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{language === 'EN' ? 'Phrasebook' : language === 'PH' ? 'Talasalitaan' : 'Talasalitan'}</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryButton, activeCategory === cat && styles.categoryButtonActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>
                {language === 'EN' ? cat : cat} {/* You can add translations for category names here */}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  categoryContainer: {
    height: 60,
  },
  categoryScroll: {
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#64748B',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 20,
    gap: 15,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  kulitanContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 15,
    marginRight: 20,
  },
  verticalWordColumn: {
    marginHorizontal: 5,
    alignItems: 'center',
  },
  kulitanText: {
    fontFamily: 'Kulitan',
    fontSize: 28,
    color: '#2563EB',
    lineHeight: 32,
    textAlign: 'center',
  },
  textContainer: {
    flex: 1,
  },
  kapampanganText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#0F172A',
    marginBottom: 4,
  },
  englishText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#64748B',
  },
});
