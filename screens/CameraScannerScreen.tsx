import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useProfile } from '../context/ProfileContext';

type CameraScannerScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

export default function CameraScannerScreen({ navigation }: CameraScannerScreenProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<'success' | 'fail' | null>(null);
  const { addXP } = useProfile();
  
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    // Camera permissions are still loading.
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <LinearGradient colors={['#FAF5EE', '#E8DAC9']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
        </View>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>We need your permission to use the camera</Text>
          <TouchableOpacity style={styles.actionButton} onPress={requestPermission}>
            <Text style={styles.actionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
        if (photo) {
          setPhotoUri(photo.uri);
          if (photo.base64) {
            setBase64Data(photo.base64);
          }
          setAnalysisResult(null); // reset
        }
      } catch (e) {
        console.error("Failed to take picture", e);
      }
    }
  };

  const analyzePhoto = async () => {
    setIsAnalyzing(true);
    
    // --- AI INTEGRATION STRATEGY ---
    // 1. Send `base64Data` to a backend server or a direct API (like Google Cloud Vision or Gemini API).
    // 2. The AI model checks if the handwriting matches the selected Kulitan symbol.
    // 3. Return a confidence score.
    
    /* Example Implementation for future:
    try {
      const response = await fetch('YOUR_AI_ENDPOINT', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Data })
      });
      const data = await response.json();
      const passed = data.confidence > 0.7;
    } catch(err) { ... }
    */

    // Mock AI validation: wait 2 seconds, then randomly pass or fail
    setTimeout(() => {
      setIsAnalyzing(false);
      const passed = Math.random() > 0.3; // 70% chance to pass for testing
      setAnalysisResult(passed ? 'success' : 'fail');
      if (passed) {
        addXP(50); // Big reward for scanning physical handwriting!
      }
    }, 2000);
  };

  const retakePhoto = () => {
    setPhotoUri(null);
    setBase64Data(null);
    setAnalysisResult(null);
  };

  return (
    <LinearGradient colors={['#FAF5EE', '#E8DAC9']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Scanner</Text>
        <View style={{ width: 44 }} /> 
      </View>

      <View style={styles.content}>
        {photoUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: photoUri }} style={styles.previewImage} />
            
            {isAnalyzing && (
              <View style={styles.overlay}>
                <ActivityIndicator size="large" color="#FAF5EE" />
                <Text style={styles.overlayText}>Analyzing Handwriting...</Text>
              </View>
            )}

            {analysisResult && (
              <View style={[styles.overlay, analysisResult === 'success' ? styles.successOverlay : styles.failOverlay]}>
                <Text style={styles.resultTitle}>
                  {analysisResult === 'success' ? 'EXCELLENT!' : 'KEEP PRACTICING!'}
                </Text>
                <Text style={styles.resultText}>
                  {analysisResult === 'success' 
                    ? 'Your Kulitan handwriting is highly accurate.' 
                    : 'The AI could not clearly read this symbol. Try writing it larger and clearer.'}
                </Text>
              </View>
            )}

          </View>
        ) : (
          <View style={styles.cameraContainer}>
            <CameraView 
              style={styles.camera} 
              facing="back"
              ref={cameraRef}
            >
              <View style={styles.overlayGuide}>
                <View style={styles.scanTarget} />
                <Text style={styles.scanTargetText}>Place symbol inside the box</Text>
              </View>
            </CameraView>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        {!photoUri ? (
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureInner} />
          </TouchableOpacity>
        ) : (
          <View style={styles.resultActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]} 
              onPress={retakePhoto}
              disabled={isAnalyzing}
            >
              <Text style={styles.actionButtonText}>Retake</Text>
            </TouchableOpacity>

            {!analysisResult && !isAnalyzing && (
              <TouchableOpacity style={styles.actionButton} onPress={analyzePhoto}>
                <Text style={styles.actionButtonText}>Analyze</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
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
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    color: '#0F172A',
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    marginBottom: 20,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlayGuide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  scanTarget: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#D1582D',
    borderStyle: 'dashed',
    borderRadius: 24,
    backgroundColor: 'transparent',
  },
  scanTargetText: {
    color: '#FFFFFF',
    marginTop: 20,
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  previewContainer: {
    flex: 1,
    position: 'relative',
  },
  previewImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.8)', 
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successOverlay: {
    backgroundColor: 'rgba(16, 185, 129, 0.9)', 
  },
  failOverlay: {
    backgroundColor: 'rgba(209, 88, 45, 0.9)', 
  },
  overlayText: {
    color: '#FFFFFF',
    marginTop: 20,
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
  },
  resultTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontFamily: 'Poppins_700Bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  resultText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(209, 88, 45, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D1582D',
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    backgroundColor: '#D1582D',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
  }
});
