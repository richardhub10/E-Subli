import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView, Platform, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { GoogleGenAI } from '@google/genai';
import * as Clipboard from 'expo-clipboard';
import { useProfile } from '../context/ProfileContext';

type TranslatorScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

export default function TranslatorScreen({ navigation }: TranslatorScreenProps) {
  const [sourceLanguage, setSourceLanguage] = useState<'Tagalog' | 'English' | 'Kapampangan'>('Tagalog');
  const [targetLanguage, setTargetLanguage] = useState<'Tagalog' | 'English' | 'Kapampangan'>('Kapampangan');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showKulitan, setShowKulitan] = useState(true);
  const { addXP } = useProfile();

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      Alert.alert(
        "API Key Missing",
        "Add EXPO_PUBLIC_GEMINI_API_KEY to your environment variables to enable the AI translator.",
        [{ text: "OK" }]
      );
      return;
    }

    setIsTranslating(true);
    setTranslatedText('');

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          `You are an expert translator specializing in the Kapampangan (Pampanga) language, Tagalog, and English. Translate the following text from ${sourceLanguage} to conversational ${targetLanguage}. Output ONLY the translated ${targetLanguage} text, nothing else. Do not use quotes or explanations. Text to translate: "${sourceText.trim()}"`
        ],
      });
      
      const text = response.text?.trim() || '';
      setTranslatedText(text);
      // Reward user for using the translator
      addXP(5);
    } catch (err) {
      console.error("Gemini API Error:", err);
      Alert.alert("Translation Failed", "Could not translate the text. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const copyToClipboard = async () => {
    if (translatedText) {
      await Clipboard.setStringAsync(translatedText);
      if (Platform.OS === 'web') {
        window.alert('Copied to clipboard!');
      }
    }
  };

  return (
    <LinearGradient colors={['#FAF5EE', '#E8DAC9']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Translator</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.inputCard}>
          <Text style={styles.cardHeader}>FROM</Text>
          <View style={styles.languageSelector}>
            {['Tagalog', 'English', 'Kapampangan'].map((lang) => (
              <TouchableOpacity 
                key={lang}
                style={[styles.langTab, sourceLanguage === lang && styles.langTabActive]}
                onPress={() => setSourceLanguage(lang as any)}
              >
                <Text style={[styles.langTabText, sourceLanguage === lang && styles.langTabTextActive]}>{lang}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={[styles.cardHeader, { marginTop: 16 }]}>TO</Text>
          <View style={styles.languageSelector}>
            {['Tagalog', 'English', 'Kapampangan'].map((lang) => (
              <TouchableOpacity 
                key={lang}
                style={[styles.langTab, targetLanguage === lang && styles.langTabActive]}
                onPress={() => setTargetLanguage(lang as any)}
              >
                <Text style={[styles.langTabText, targetLanguage === lang && styles.langTabTextActive]}>{lang}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.divider} />

          <TextInput
            style={styles.textInput}
            multiline
            placeholder={`Type ${sourceLanguage} here...`}
            placeholderTextColor="#94A3B8"
            value={sourceText}
            onChangeText={setSourceText}
          />

          <View style={styles.toggleRow}>
            <Text style={styles.toggleText}>Show in Kulitan Script</Text>
            <Switch
              value={showKulitan}
              onValueChange={setShowKulitan}
              trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
              thumbColor={showKulitan ? '#3B82F6' : '#F1F5F9'}
            />
          </View>

          <TouchableOpacity 
            style={[styles.translateButton, (!sourceText.trim() || isTranslating) && styles.translateButtonDisabled]}
            onPress={handleTranslate}
            disabled={!sourceText.trim() || isTranslating}
          >
            {isTranslating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.translateButtonText}>Translate</Text>
            )}
          </TouchableOpacity>
        </View>

        {translatedText ? (
          <View style={styles.resultCard}>
            <Text style={styles.cardHeader}>{targetLanguage.toUpperCase()} (LATIN)</Text>
            <Text style={styles.latinResultText}>{translatedText}</Text>
            
            {showKulitan && (
              <>
                <View style={styles.divider} />
                <Text style={styles.cardHeader}>KULITAN SCRIPT</Text>
                <View style={styles.kulitanContainer}>
                  <Text style={styles.kulitanResultText}>
                    {translatedText.toLowerCase()}
                  </Text>
                </View>
              </>
            )}

            <View style={styles.actionButtonsRow}>
              <TouchableOpacity style={styles.actionButton} onPress={copyToClipboard}>
                <Ionicons name="copy-outline" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Copy</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
        
        {/* Spacer for bottom padding */}
        <View style={{ height: 40 }} />
      </ScrollView>
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
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0F172A',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  cardHeader: {
    fontSize: 12,
    fontFamily: 'Poppins_700Bold',
    color: '#D9734E',
    marginBottom: 12,
    letterSpacing: 1,
  },
  textInput: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#0F172A',
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  languageSelector: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    width: '100%',
  },
  langTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  langTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  langTabText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#64748B',
  },
  langTabTextActive: {
    color: '#3B82F6',
    fontFamily: 'Poppins_600SemiBold',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  toggleText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#475569',
  },
  translateButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  translateButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  translateButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  latinResultText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 18,
    color: '#0F172A',
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 20,
  },
  kulitanContainer: {
    backgroundColor: '#FAF5EE',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    marginBottom: 20,
  },
  kulitanResultText: {
    fontFamily: 'Kulitan',
    fontSize: 64,
    color: '#0B2046',
    textAlign: 'center',
    lineHeight: 80,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D9734E',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  actionButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  }
});
