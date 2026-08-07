import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useProfile } from '../context/ProfileContext';

type CameraScannerScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

export default function CameraScannerScreen({ navigation }: CameraScannerScreenProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
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
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>{'< Back'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>We need your permission to use the camera</Text>
          <TouchableOpacity style={styles.actionButton} onPress={requestPermission}>
            <Text style={styles.actionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          setPhotoUri(photo.uri);
          setAnalysisResult(null); // reset
        }
      } catch (e) {
        console.error("Failed to take picture", e);
      }
    }
  };

  const analyzePhoto = () => {
    setIsAnalyzing(true);
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
    setAnalysisResult(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI SCANNER</Text>
        <View style={{ width: 50 }} /> 
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
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    color: '#FAF5EE',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
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
    borderColor: '#D9734E',
    borderStyle: 'dashed',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  scanTargetText: {
    color: '#fff',
    marginTop: 20,
    fontSize: 16,
    fontWeight: 'bold',
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
    backgroundColor: 'rgba(11, 32, 70, 0.8)', // Semi-transparent brand blue
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successOverlay: {
    backgroundColor: 'rgba(46, 139, 87, 0.9)', // SeaGreen
  },
  failOverlay: {
    backgroundColor: 'rgba(217, 115, 78, 0.9)', // Brand Coral
  },
  overlayText: {
    color: '#FAF5EE',
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  resultText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
  },
  resultActions: {
    flexDirection: 'row',
    gap: 20,
  },
  actionButton: {
    backgroundColor: '#D9734E',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FAF5EE',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
