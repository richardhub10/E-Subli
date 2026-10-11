import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  Alert, 
  ScrollView, 
  Platform, 
  Animated, 
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useProfile } from '../context/ProfileContext';
import { useLanguage } from '../context/LanguageContext';
import { kulitanSyllables } from '../data/kulitanData';
import { normalizeKulitanSyllable } from '../data/kulitanDatasetExemplars';
import KulitanGlyph from '../components/KulitanGlyph';
import { cropViewfinderROI, ScanResult } from '../utils/kulitanClassifier';
import { callTestScannerApi } from '../services/kulitanScannerService';
import { BackgroundImages } from '../constants/backgrounds';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type CameraScannerScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

const PRIMARY_KULITAN_LIST = [
  { latin: 'A', name: 'A', symbol: 'a' },
  { latin: 'Ka', name: 'Ka', symbol: 'k' },
  { latin: 'Ga', name: 'Ga', symbol: 'g' },
  { latin: 'Nga', name: 'Nga', symbol: 'N' },
  { latin: 'Ta', name: 'Ta', symbol: 't' },
  { latin: 'Da', name: 'Da', symbol: 'd' },
  { latin: 'Na', name: 'Na', symbol: 'n' },
  { latin: 'La', name: 'La', symbol: 'l' },
  { latin: 'Sa', name: 'Sa', symbol: 's' },
  { latin: 'Ma', name: 'Ma', symbol: 'm' },
  { latin: 'Pa', name: 'Pa', symbol: 'p' },
  { latin: 'Ba', name: 'Ba', symbol: 'b' },
  { latin: 'I', name: 'I', symbol: 'i' },
  { latin: 'U', name: 'U', symbol: 'u' },
];

export default function CameraScannerScreen({ navigation }: CameraScannerScreenProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [targetSyllable, setTargetSyllable] = useState<string | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const { addXP } = useProfile();
  const { language } = useLanguage();
  const cameraRef = useRef<CameraView>(null);
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // Animated laser scan effect
  useEffect(() => {
    if (!photoUri) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 240,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [photoUri]);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ 
          base64: true, 
          quality: 0.85,
          skipProcessing: false 
        });
        if (photo) {
          setPhotoUri(photo.uri);
          setScanResult(null);
          // Auto-crop Region of Interest (ROI) matching the central reticle frame
          const croppedB64 = await cropViewfinderROI(photo.base64 || '', 0.75);
          setBase64Data(croppedB64);
          analyzeImage(croppedB64);
        }
      } catch (e) {
        console.error("Failed to take picture", e);
        Alert.alert("Camera Error", "Could not capture image. Please try picking from gallery instead.");
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.85,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setPhotoUri(asset.uri);
        setScanResult(null);
        // Gallery images are already framed, preserve full strokes
        const imgB64 = asset.base64 || '';
        setBase64Data(imgB64);
        analyzeImage(imgB64);
      }
    } catch (err) {
      console.error("Failed to pick image", err);
      Alert.alert("Gallery Error", "Could not open image library.");
    }
  };

  const analyzeImage = async (base64: string | null) => {
    setIsAnalyzing(true);
    setAnalysisStep(language === 'EN' ? 'Processing handwriting image...' : 'Pinoproseso ang larawan...');

    // 1. Sanity Check
    if (!base64 || base64.length < 500) {
      setScanResult({
        recognized: false,
        character: 'Unknown',
        kulitanSymbol: '?',
        confidence: 10,
        type: 'Unrecognized',
        transliteration: 'None',
        feedback: language === 'EN'
          ? 'No clear handwriting strokes detected in frame. Please write with bold, dark ink on plain paper.'
          : 'Walang malinaw na sulat-kamay na nakita. Mangyaring sumulat gamit ang maitim na tinta sa malinis na papel.',
        strokeAccuracy: 'Needs Practice',
        engine: 'calibrated_cv',
      });
      setIsAnalyzing(false);
      return;
    }

    const cleanB64 = base64.includes(',') ? base64.split(',')[1] : base64;

    // Detect MIME type accurately for Vision models
    let mimeType = 'image/jpeg';
    if (base64.startsWith('data:image/png')) {
      mimeType = 'image/png';
    } else if (base64.startsWith('data:image/webp')) {
      mimeType = 'image/webp';
    } else {
      try {
        const preview = cleanB64.slice(0, 16);
        if (preview.startsWith('iVBORw0KGgo')) {
          mimeType = 'image/png';
        } else if (preview.startsWith('UklGR')) {
          mimeType = 'image/webp';
        }
      } catch {}
    }

    // Primary Engine: High-Accuracy Testscanner ResNet-18 Model (Render Cloud API)
    setAnalysisStep(
      language === 'EN'
        ? 'Scanning with Testscanner ResNet-18 AI Model...'
        : 'Sinusuri gamit ang Testscanner AI Model...'
    );

    try {
      const result = await callTestScannerApi(cleanB64, language as any, {
        timeoutMs: 45000,
        onStatusUpdate: (step) => setAnalysisStep(step),
      });

      setScanResult(result);
      if (result.recognized) {
        addXP(50);
      }
    } catch (scannerErr: any) {
      console.error('Testscanner API error:', scannerErr);
      const isTimeout = scannerErr?.message?.includes('timed out');
      setScanResult({
        recognized: false,
        character: 'Unknown',
        kulitanSymbol: '?',
        confidence: 0,
        type: isTimeout ? 'Server Warming Up' : 'Connection Error',
        transliteration: 'None',
        feedback: language === 'EN'
          ? isTimeout
            ? 'The AI Scanner server on Render was asleep and is now waking up. Please tap "Scan Another" to rescan.'
            : `Could not connect to AI Scanner server (${scannerErr?.message || 'Check connection/CORS'}). Tap "Scan Another" to retry.`
          : isTimeout
            ? 'Kasalukuyang nagigising ang AI Scanner sa Render. Pindutin ang "Scan Another" upang subukan muli.'
            : `Hindi makakonekta sa AI Scanner server (${scannerErr?.message || 'Suriin ang koneksyon'}). Pindutin ang "Scan Another" upang subukan muli.`,
        strokeAccuracy: 'Needs Practice',
        engine: 'testscanner',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const retakePhoto = () => {
    setPhotoUri(null);
    setBase64Data(null);
    setScanResult(null);
    setIsAnalyzing(false);
  };

  return (
    <View style={styles.container}>
      {/* Authentic Watercolor Botanical Manuscript Background */}
      <Image 
        source={BackgroundImages.scanner} 
        style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} 
        resizeMode="cover" 
      />

      {/* Header Bar matching Proposed Design */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.headerBackBtn} 
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        
        <View style={styles.headerPill}>
          <Ionicons name="sparkles" size={13} color="#CC6C46" style={{ marginRight: 6 }} />
          <Text style={styles.headerPillText}>AI KULITAN SCANNER</Text>
        </View>

        <TouchableOpacity 
          style={styles.headerFlipBtn} 
          onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
          activeOpacity={0.7}
        >
          <Ionicons name="camera-reverse-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Main Viewport Card */}
      <View style={styles.content}>
        {/* Botanical corner flourish accents matching proposed design */}
        <View pointerEvents="none" style={styles.cardLeafTL}>
          <Image 
            source={BackgroundImages.scannerLeafTL} 
            style={styles.leafImage} 
            resizeMode="contain" 
          />
        </View>
        <View pointerEvents="none" style={styles.cardLeafBR}>
          <Image 
            source={BackgroundImages.scannerLeafBR} 
            style={styles.leafImage} 
            resizeMode="contain" 
          />
        </View>

        {photoUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: photoUri }} style={styles.previewImage} />

            {/* Analyzing Indicator */}
            {isAnalyzing && (
              <View style={styles.analyzingOverlay}>
                <ActivityIndicator size="large" color="#F59E0B" />
                <Text style={styles.analyzingTitle}>
                  {language === 'EN' ? 'Analyzing Handwriting' : 'Sinusuri ang Sulat-Kamay'}
                </Text>
                <Text style={styles.analyzingSubtitle}>{analysisStep}</Text>
              </View>
            )}

            {/* Scan Result Card */}
            {scanResult && !isAnalyzing && (
              <View style={styles.resultSheet}>
                <ScrollView contentContainerStyle={styles.resultScroll} showsVerticalScrollIndicator={false}>
                  {/* Top Status Pill */}
                  <View style={styles.statusRow}>
                    <View style={[
                      styles.statusPill, 
                      scanResult.recognized ? styles.statusSuccess : styles.statusWarning
                    ]}>
                      <Ionicons 
                        name={scanResult.recognized ? "checkmark-circle" : "alert-circle"} 
                        size={16} 
                        color={scanResult.recognized ? "#10B981" : "#F59E0B"} 
                      />
                      <Text style={[
                        styles.statusPillText, 
                        { color: scanResult.recognized ? "#10B981" : "#F59E0B" }
                      ]}>
                        {scanResult.recognized 
                          ? `${scanResult.confidence}% Accuracy   ${scanResult.strokeAccuracy}` 
                          : 'Unclear Character   Needs Practice'}
                      </Text>
                    </View>

                    {/* Recognition Engine Badge */}
                    <View style={[styles.engineBadgePill, styles.engineBadgeTestScanner]}>
                      <Ionicons 
                        name="shield-checkmark" 
                        size={12} 
                        color="#4338CA" 
                      />
                      <Text style={[styles.engineBadgeText, { color: '#4338CA' }]}>
                        TESTSCANNER AI (RESNET-18)
                      </Text>
                    </View>
                  </View>

                  {/* Character Comparison Box */}
                  {scanResult.recognized ? (
                    <>
                      <View style={styles.charComparisonRow}>
                        <View style={styles.charBox}>
                          <Text style={styles.charLabel}>Recognized Kulitan</Text>
                          <KulitanGlyph symbol={scanResult.transliteration || scanResult.character} size={58} color="#D1582D" strokeWidth={4} />
                        </View>

                        <View style={styles.charDivider}>
                          <Ionicons name="swap-horizontal" size={22} color="#94A3B8" />
                        </View>

                        <View style={styles.charBox}>
                          <Text style={styles.charLabel}>Transliteration</Text>
                          <Text style={styles.latinDisplay}>{scanResult.character}</Text>
                        </View>
                      </View>

                      {/* AI Extracted & Cleaned Glyph Preview */}
                      {scanResult.extractedImageUrl && (
                        <View style={styles.extractedCard}>
                          <View style={styles.extractedHeader}>
                            <Ionicons name="sparkles" size={13} color="#4338CA" />
                            <Text style={styles.extractedHeaderTitle}>
                              {language === 'EN' ? 'AI Isolated Glyph (Background Cleaned)' : 'Nahiwalay na Titik mula sa AI'}
                            </Text>
                          </View>
                          <View style={styles.extractedImageContainer}>
                            <Image
                              source={{ uri: scanResult.extractedImageUrl }}
                              style={styles.extractedImage}
                              resizeMode="contain"
                            />
                          </View>
                        </View>
                      )}

                      {/* Top Model Predictions */}
                      {scanResult.topK && scanResult.topK.length > 1 && (
                        <View style={styles.topKContainer}>
                          <Text style={styles.topKTitle}>
                            {language === 'EN' ? 'Top Predictions:' : 'Mga Nangungunang Hula:'}
                          </Text>
                          <View style={styles.topKPillsRow}>
                            {scanResult.topK.slice(0, 3).map((item, idx) => (
                              <View key={idx} style={[styles.topKPill, idx === 0 && styles.topKPillActive]}>
                                <Text style={[styles.topKPillText, idx === 0 && styles.topKPillTextActive]}>
                                  {item.label.toUpperCase()}: {Math.round(item.confidence <= 1 ? item.confidence * 100 : item.confidence)}%
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </>
                  ) : (
                    <View style={styles.unrecognizedCard}>
                      <Ionicons name="help-circle-outline" size={44} color="#D97706" />
                      <Text style={styles.unrecognizedTitle}>
                        {language === 'EN' ? 'No Clear Glyphs Detected' : 'Walang Malinaw na Titik'}
                      </Text>
                      <Text style={styles.unrecognizedSubtitle}>
                        {language === 'EN'
                          ? 'Make sure the character is written boldly with dark ink on plain paper and centered inside the reticle.'
                          : 'Siguraduhing malinaw ang pagkakasulat sa malinis na papel at nakatapat sa loob ng gabay.'}
                      </Text>
                    </View>
                  )}

                  {/* Classification */}
                  {scanResult.recognized && (
                    <View style={styles.detailsRow}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Classification</Text>
                        <Text style={styles.detailValue}>{scanResult.type}</Text>
                      </View>
                    </View>
                  )}

                  {/* Kapampangan Meaning & Cultural Usage Card */}
                  {scanResult.recognized && (() => {
                    const rawTrans = (scanResult.transliteration || '').toLowerCase().trim();
                    const rawChar = (scanResult.character || '').toLowerCase().trim();
                    const canonicalLatin = normalizeKulitanSyllable(scanResult.transliteration || scanResult.character);
                    const matched = kulitanSyllables.find(s => 
                      s.latin.toLowerCase() === rawTrans ||
                      s.latin.toLowerCase() === rawChar ||
                      s.latin.toLowerCase().startsWith(rawTrans + ' ') ||
                      s.latin.toLowerCase() === canonicalLatin || 
                      s.id.toLowerCase() === canonicalLatin
                    );
                    if (!matched) return null;
                    return (
                      <View style={styles.meaningCard}>
                        <View style={styles.meaningHeader}>
                          <Ionicons name="book" size={16} color="#D1582D" />
                          <Text style={styles.meaningHeaderTitle}>
                            {language === 'EN' ? 'Meaning & Cultural Usage' : 'Kahulugan at Gamit'}
                          </Text>
                        </View>
                        
                        <View style={styles.meaningRow}>
                          <Text style={styles.meaningLabel}>{language === 'EN' ? 'Pronunciation' : 'Pagbigkas'}:</Text>
                          <Text style={styles.meaningPronunciation}>{matched.pronunciation}</Text>
                        </View>

                        <Text style={styles.meaningDefinition}>{matched.definition}</Text>

                        {matched.exampleWord && (
                          <View style={styles.exampleWordBox}>
                            <View style={styles.exampleWordHeader}>
                              <Ionicons name="chatbubbles-outline" size={13} color="#9A3A17" />
                              <Text style={styles.exampleWordLabel}>
                                {language === 'EN' ? 'Example Vocabulary' : 'Halimbawang Salita'}
                              </Text>
                            </View>
                            <Text style={styles.exampleWordText}>
                              <Text style={styles.exampleWordBold}>{matched.exampleWord}</Text>
                              {'  —  '}
                              <Text style={styles.exampleWordMeaning}>{matched.exampleMeaning}</Text>
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })()}

                  {/* AI Stroke Feedback */}
                  <View style={styles.feedbackCard}>
                    <View style={styles.feedbackHeader}>
                      <Ionicons name="sparkles" size={16} color="#D1582D" />
                      <Text style={styles.feedbackTitle}>AI Stroke Feedback</Text>
                    </View>
                    <Text style={styles.feedbackText}>{scanResult.feedback}</Text>
                  </View>


                  {/* Action Buttons */}
                  <View style={styles.resultBtnRow}>
                    <TouchableOpacity 
                      style={styles.retakeBtn} 
                      onPress={retakePhoto}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="refresh" size={18} color="#0F172A" />
                      <Text style={styles.retakeBtnText}>Scan Another</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.practiceBtn}
                      activeOpacity={0.8}
                      onPress={() => navigation.navigate('WriteTrace', { 
                        selectedSyllable: scanResult.transliteration || scanResult.character 
                      })}
                    >
                      <LinearGradient colors={['#D1582D', '#9A3A17']} style={styles.practiceGradient}>
                        <Ionicons name="pencil" size={18} color="#FFF" />
                        <Text style={styles.practiceBtnText}>Practice Trace</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.cameraWrapper}>
            {permission?.granted ? (
              <CameraView 
                style={styles.camera} 
                facing={facing}
                enableTorch={flash === 'on'}
                ref={cameraRef}
              >
                {/* Center Camera Reticle Watermark matching Proposed Mockup */}
                {!targetSyllable && (
                  <View style={styles.centerCameraWatermark} pointerEvents="none">
                    <Ionicons name="camera-outline" size={48} color="rgba(255, 255, 255, 0.75)" />
                  </View>
                )}

                {/* Laser Scanning Reticle with Optional Target Watermark */}
                <View style={styles.reticleOverlay}>
                  <View style={styles.scanBox}>
                    <Animated.View 
                      style={[
                        styles.laserLine, 
                        { transform: [{ translateY: scanLineAnim }] }
                      ]} 
                    />
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />

                    {/* Target Watermark Glyph Guide */}
                    {targetSyllable && (
                      <View style={styles.watermarkContainer}>
                        <KulitanGlyph symbol={targetSyllable} size={130} color="rgba(255, 255, 255, 0.22)" />
                        <Text style={styles.watermarkLabel}>Target: {targetSyllable.toUpperCase()}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.reticleText}>
                    {targetSyllable 
                      ? `Align handwritten "${targetSyllable.toUpperCase()}" inside frame` 
                      : 'Align handwritten Kulitan inside frame'}
                  </Text>
                </View>

                {/* Terracotta Action Pill inside Card matching Mockup */}
                <TouchableOpacity 
                  style={styles.cardActionButton} 
                  onPress={pickImage} 
                  activeOpacity={0.85}
                >
                  <Ionicons name="images" size={16} color="#FFFFFF" />
                  <Text style={styles.cardActionText}>
                    {language === 'EN' ? 'Upload from Gallery' : 'Pumili sa Galeriya'}
                  </Text>
                </TouchableOpacity>
              </CameraView>
            ) : (
              <View style={styles.noCameraFallback}>
                <Ionicons name="camera-outline" size={64} color="#94A3B8" />
                <Text style={styles.noCameraTitle}>Camera Access Required</Text>
                <Text style={styles.noCameraSubtitle}>
                  Enable camera permissions or pick an image of Kulitan handwriting directly from your gallery.
                </Text>
                <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission} activeOpacity={0.8}>
                  <Text style={styles.permissionBtnText}>Grant Camera Permission</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Botanical Footer Controls matching Proposed Mockup */}
      <View style={styles.footer}>
        {!photoUri ? (
          <View style={styles.footerRow}>
            {/* Flash / Torch Toggle */}
            <TouchableOpacity 
              style={styles.sideFooterBtn} 
              onPress={() => setFlash(flash === 'off' ? 'on' : 'off')}
              activeOpacity={0.7}
            >
              <View style={[styles.sideIconCircle, flash === 'on' && styles.sideIconCircleActive]}>
                <Ionicons 
                  name={flash === 'on' ? "flash" : "flash-off"} 
                  size={22} 
                  color={flash === 'on' ? "#D97706" : "#475569"} 
                />
              </View>
              <Text style={styles.sideFooterText}>{flash === 'on' ? 'Flash On' : 'Flash'}</Text>
            </TouchableOpacity>

            {/* Concentric Triple-Ring Shutter Button */}
            <TouchableOpacity style={styles.shutterHalo} onPress={takePicture} activeOpacity={0.8}>
              <View style={styles.shutterWhiteRing}>
                <View style={styles.shutterCore} />
              </View>
            </TouchableOpacity>

            {/* Syllabary / Guide Button */}
            <TouchableOpacity 
              style={styles.sideFooterBtn} 
              onPress={() => navigation.navigate('KulitanGuide')}
              activeOpacity={0.7}
            >
              <View style={styles.sideIconCircle}>
                <Ionicons name="book" size={24} color="#475569" />
              </View>
              <Text style={styles.sideFooterText}>
                {language === 'EN' ? 'Guide' : 'Gabay'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.previewFooterRow}>
            <TouchableOpacity style={styles.footerRetakeBtn} onPress={retakePhoto} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={20} color="#64748B" />
              <Text style={styles.footerRetakeText}>Back to Camera</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5EE',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingHorizontal: 20,
    paddingBottom: 10,
    zIndex: 10,
  },
  headerBackBtn: {
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
    elevation: 3,
  },
  headerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  headerPillText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12.5,
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  headerFlipBtn: {
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
    elevation: 3,
  },
  cardLeafTL: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 100,
    height: 80,
    zIndex: 15,
  },
  cardLeafBR: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 95,
    height: 100,
    zIndex: 15,
  },
  leafImage: {
    width: '100%',
    height: '100%',
  },
  centerCameraWatermark: {
    position: 'absolute',
    top: '38%',
    alignSelf: 'center',
    zIndex: 4,
  },
  cardActionButton: {
    position: 'absolute',
    bottom: 22,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#CC6C46',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 14,
  },
  cardActionText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    marginLeft: 7,
  },
  content: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  cameraWrapper: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    zIndex: 10,
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reticleOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 30,
  },
  scanBox: {
    width: 250,
    height: 250,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  laserLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 2.5,
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 5,
  },
  corner: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderColor: '#F59E0B',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 6,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 6,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 6,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 6,
  },
  watermarkContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  watermarkLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 4,
    letterSpacing: 1,
  },
  reticleText: {
    color: '#F8FAFC',
    marginTop: 22,
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    overflow: 'hidden',
  },
  noCameraFallback: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  noCameraTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 16,
  },
  noCameraSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  permissionBtn: {
    backgroundColor: '#D1582D',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 20,
  },
  permissionBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
  },
  previewContainer: {
    flex: 1,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  analyzingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  analyzingTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    marginTop: 16,
  },
  analyzingSubtitle: {
    color: '#CBD5E1',
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    marginTop: 6,
    textAlign: 'center',
  },
  resultSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '82%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  resultScroll: {
    padding: 20,
    paddingBottom: 28,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusSuccess: {
    backgroundColor: '#ECFDF5',
  },
  statusWarning: {
    backgroundColor: '#FFFBEB',
  },
  statusPillText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
  },
  engineBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  engineBadgeTestScanner: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  extractedCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  extractedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  extractedHeaderTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#4338CA',
  },
  extractedImageContainer: {
    width: 104,
    height: 104,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  extractedImage: {
    width: 96,
    height: 96,
  },
  topKContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  topKTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: '#64748B',
    marginBottom: 6,
  },
  topKPillsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  topKPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  topKPillActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#818CF8',
  },
  topKPillText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    color: '#475569',
  },
  topKPillTextActive: {
    color: '#4338CA',
    fontFamily: 'Poppins_600SemiBold',
  },
  engineBadgeText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: '#B45309',
  },
  charComparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  charBox: {
    alignItems: 'center',
    flex: 1,
  },
  charLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: '#64748B',
    marginBottom: 6,
  },
  charDivider: {
    paddingHorizontal: 8,
  },
  latinDisplay: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 42,
    color: '#0F172A',
    lineHeight: 56,
  },
  unrecognizedCard: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFBEB',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 14,
  },
  unrecognizedTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#92400E',
    marginTop: 8,
  },
  unrecognizedSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#B45309',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  detailsRow: {
    marginBottom: 14,
  },
  detailItem: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: '#64748B',
  },
  detailValue: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#0F172A',
    marginTop: 2,
  },
  meaningCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginBottom: 14,
  },
  meaningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  meaningHeaderTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#9A3A17',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  meaningRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 6,
  },
  meaningLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: '#7C2D12',
  },
  meaningPronunciation: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#C2410C',
  },
  meaningDefinition: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#431407',
    lineHeight: 18,
    marginBottom: 10,
  },
  exampleWordBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  exampleWordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  exampleWordLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    color: '#9A3A17',
    textTransform: 'uppercase',
  },
  exampleWordText: {
    fontSize: 12,
  },
  exampleWordBold: {
    fontFamily: 'Poppins_700Bold',
    color: '#9A3A17',
  },
  exampleWordMeaning: {
    fontFamily: 'Poppins_400Regular',
    color: '#475569',
  },
  metricsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  feedbackCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    marginBottom: 18,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  feedbackTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#D1582D',
  },
  feedbackText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12.5,
    color: '#7C2D12',
    lineHeight: 18,
  },
  resultBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  retakeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 18,
  },
  retakeBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#0F172A',
  },
  practiceBtn: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  practiceGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  practiceBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  footer: {
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  sideFooterBtn: {
    alignItems: 'center',
    gap: 4,
    width: 60,
  },
  sideFooterText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: '#64748B',
  },
  sideIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  sideIconCircleActive: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  shutterHalo: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: 'rgba(229, 188, 168, 0.55)',
    borderWidth: 3.5,
    borderColor: '#E5BCA8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#CC6C46',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  shutterWhiteRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterCore: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#CC6C46',
  },
  previewFooterRow: {
    alignItems: 'center',
  },
  footerRetakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  footerRetakeText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#64748B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#0F172A',
  },
  modalDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 14,
  },
  engineStatusBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    gap: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  engineStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  engineStatusText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#334155',
  },
  inputLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#334155',
    marginBottom: 6,
  },
  keyInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#0F172A',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  modalCancelBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#64748B',
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#D1582D',
    alignItems: 'center',
  },
  modalSaveBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
});
