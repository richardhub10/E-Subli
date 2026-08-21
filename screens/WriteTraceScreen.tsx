import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StackNavigationProp } from '@react-navigation/stack';
import { DrawingCanvas, DrawingCanvasRef } from '../components/DrawingCanvas';
import { useProfile } from '../context/ProfileContext';
import { kulitanSyllables } from '../data/kulitanData';
import { kulitanPoints } from '../data/kulitanPoints';
import { useLanguage } from '../context/LanguageContext';

type WriteTraceScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

export default function WriteTraceScreen({ navigation }: WriteTraceScreenProps) {
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const { addXP, incrementWriting } = useProfile();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentSyllable = kulitanSyllables[currentIndex];
  const { t, language } = useLanguage();
  
  const [isEraser, setIsEraser] = useState(false);
  const [currentColor, setCurrentColor] = useState('#0B2046'); 
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [canvasSize, setCanvasSize] = useState({width: 0, height: 0});

  const handleClear = () => {
    canvasRef.current?.clear();
  };

  const handleEraser = () => {
    setIsEraser(true);
    setCurrentColor('#FFFFFF'); 
  };

  const handlePen = () => {
    setIsEraser(false);
    setCurrentColor('#0F172A'); 
  };

  const handleCheck = () => {
    setModalVisible(true);
    setIsAnalyzing(true);
    setScore(null);
    
    setTimeout(() => {
      setIsAnalyzing(false);
      
      const strokes = canvasRef.current?.getStrokes() || [];
      const validStrokes = strokes.filter(s => s.color !== '#FFFFFF' && s.color !== '#FAF5EE');

      let calculatedScore = 0;

      if (validStrokes.length === 0) {
        calculatedScore = 0;
      } else {
        // Collect all user points and shift them to be relative to the center of the canvas!
        let userPoints: {x: number, y: number}[] = [];
        
        validStrokes.forEach(stroke => {
          stroke.points.forEach(p => {
            userPoints.push({
              x: p.x - (canvasSize.width / 2),
              y: p.y - (canvasSize.height / 2)
            });
          });
        });

        // 1. Calculate total user stroke length
        let userStrokeLength = 0;
        validStrokes.forEach(stroke => {
          for (let i = 1; i < stroke.points.length; i++) {
            userStrokeLength += Math.hypot(
              stroke.points[i].x - stroke.points[i - 1].x,
              stroke.points[i].y - stroke.points[i - 1].y
            );
          }
        });

        // Anti-cheat Check 1: Empty or tiny tap/dot
        if (userPoints.length < 15 || userStrokeLength < 70) {
          calculatedScore = 0;
        } else {
          const referenceData = kulitanPoints[currentSyllable.latin];
          
          if (!referenceData || referenceData.points.length === 0) {
            calculatedScore = 80;
          } else {
            const absoluteRefPoints = referenceData.points;

            // 2. COVERAGE CHECK (Recall)
            // A point is covered if the pen passes within 26 pixels (track tolerance)
            let coveredPoints = 0;
            absoluteRefPoints.forEach(rp => {
              let minDistance = Infinity;
              userPoints.forEach(up => {
                const dist = Math.hypot(rp.x - up.x, rp.y - up.y);
                if (dist < minDistance) minDistance = dist;
              });
              if (minDistance <= 26) {
                coveredPoints++;
              }
            });
            const coverage = coveredPoints / absoluteRefPoints.length;

            // 3. STROKE LENGTH RATIO
            let refPerimeterLength = 0;
            for (let i = 1; i < absoluteRefPoints.length; i++) {
              refPerimeterLength += Math.hypot(
                absoluteRefPoints[i].x - absoluteRefPoints[i - 1].x,
                absoluteRefPoints[i].y - absoluteRefPoints[i - 1].y
              );
            }
            const idealLength = refPerimeterLength * 0.5;
            const lengthRatio = idealLength > 0 ? userStrokeLength / idealLength : 1;

            // 4. PRECISION CHECK (Anti-Cheat for Scribbling Outside Track)
            let outOfBoundsCount = 0;
            userPoints.forEach(up => {
              let minDistance = Infinity;
              absoluteRefPoints.forEach(rp => {
                const dist = Math.hypot(up.x - rp.x, up.y - rp.y);
                if (dist < minDistance) minDistance = dist;
              });
              if (minDistance > 28) {
                outOfBoundsCount++;
              }
            });
            const outOfBoundsRatio = userPoints.length > 0 ? outOfBoundsCount / userPoints.length : 1;

            // 5. ANTI-CHEAT & ACCURACY SCORING
            if (coverage < 0.70) {
              // Incomplete trace (missed significant portion of the character)
              calculatedScore = Math.floor(coverage * 60);
            } else if (outOfBoundsRatio > 0.28 || lengthRatio > 2.3) {
              // Anti-cheat triggered: Scribbled wildly all over canvas or colored in the screen
              calculatedScore = Math.max(15, Math.floor(40 - (outOfBoundsRatio * 25)));
            } else if (lengthRatio < 0.45) {
              // Trace too short / skipped strokes
              calculatedScore = 45;
            } else {
              // Valid, authentic trace: rate precision and coverage
              const coverageScore = coverage * 65;
              const precisionScore = (1.0 - outOfBoundsRatio) * 35;
              const lengthPenalty = Math.abs(1.0 - Math.min(1.5, lengthRatio)) * 12;

              calculatedScore = Math.round(coverageScore + precisionScore - lengthPenalty);
              
              // Ensure genuine quality traces reach rewarding scores
              if (calculatedScore > 100) calculatedScore = 100;
              if (calculatedScore < 60) calculatedScore = 60;
            }
          }
        }
      }

      setScore(calculatedScore);
      
      if (calculatedScore >= 70) {
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        addXP(10);
        incrementWriting();
      } else {
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }, 1500);
  };

  const handleNext = () => {
    const randomIndex = Math.floor(Math.random() * kulitanSyllables.length);
    setCurrentIndex(randomIndex);
    setModalVisible(false);
    canvasRef.current?.clear();
  };

  const handleRetry = () => {
    setModalVisible(false);
    canvasRef.current?.clear();
  };

  return (
    <LinearGradient colors={['#FAF5EE', '#E8DAC9']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{language === 'EN' ? 'Trace' : language === 'PH' ? 'Sundan' : 'Tuntunan'}: {currentSyllable.latin.toUpperCase()}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.guideContainer}>
        <Ionicons name="information-circle" size={16} color="#D9734E" />
        <Text style={styles.guideText}>{language === 'EN' ? 'Tip: Trace strokes from top to bottom, right to left.' : language === 'PH' ? 'Tip: Sundan ang mga guhit mula itaas pababa, kanan pakaliwa.' : 'Tip: Tuntunan la ring guhit manibat babo pababa, wanang papunta kaili.'}</Text>
      </View>

      <View 
        style={styles.canvasContainer}
        onLayout={(e) => setCanvasSize({width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height})}
      >
        {/* The Interactive Canvas handles the guide too */}
        <DrawingCanvas 
          ref={canvasRef} 
          strokeColor={currentColor} 
          strokeWidth={isEraser ? 20 : 8}
          guidePath={kulitanPoints[currentSyllable.latin]?.path}
          guideOffsetX={kulitanPoints[currentSyllable.latin]?.offsetX}
          guideOffsetY={kulitanPoints[currentSyllable.latin]?.offsetY}
          guideStartPoint={kulitanPoints[currentSyllable.latin]?.points?.[0]}
          canvasWidth={canvasSize.width}
          canvasHeight={canvasSize.height}
        />
      </View>

      <View style={styles.toolbar}>
        <TouchableOpacity 
          style={[styles.toolButton, !isEraser && styles.toolButtonActive]} 
          onPress={handlePen}
        >
          <Ionicons name="pencil" size={20} color={!isEraser ? "#FFFFFF" : "#64748B"} style={{marginRight: 8}} />
          <Text style={[styles.toolButtonText, !isEraser && styles.toolButtonTextActive]}>{language === 'EN' ? 'Pen' : 'Panulat'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.toolButton, isEraser && styles.toolButtonActive]} 
          onPress={handleEraser}
        >
          <Ionicons name="bandage" size={20} color={isEraser ? "#FFFFFF" : "#64748B"} style={{marginRight: 8}} />
          <Text style={[styles.toolButtonText, isEraser && styles.toolButtonTextActive]}>{language === 'EN' ? 'Eraser' : 'Pambura'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolButtonClear} onPress={handleClear}>
          <Ionicons name="trash-outline" size={20} color="#D1582D" />
        </TouchableOpacity>

        {/* New Check Button */}
        <TouchableOpacity style={styles.toolButtonCheck} onPress={handleCheck}>
          <Text style={styles.toolButtonTextCheck}>{language === 'EN' ? 'Check' : 'Suriin'}</Text>
        </TouchableOpacity>
      </View>

      {/* Accuracy Result Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {isAnalyzing ? (
              <>
                <ActivityIndicator size="large" color="#D9734E" />
                <Text style={styles.modalText}>{language === 'EN' ? 'Analyzing strokes...' : 'Sinusuri...'}</Text>
              </>
            ) : (
              <>
                <Text style={styles.scoreText}>{score}%</Text>
                <Text style={styles.modalText}>
                  {score && score >= 70 ? (language === 'EN' ? 'Excellent tracing!' : language === 'PH' ? 'Mahusay na pagsunod!' : 'Mayap a pamangawil!') : (language === 'EN' ? 'Keep practicing!' : language === 'PH' ? 'Ipagpatuloy ang pagsasanay!' : 'Ipagpatuluy ing pagsane!')}
                </Text>
                
                <View style={styles.modalButtons}>
                  {score && score >= 70 ? (
                    <TouchableOpacity style={styles.modalButtonNext} onPress={handleNext}>
                      <Text style={styles.modalButtonText}>{language === 'EN' ? 'Next' : 'Susunod'}</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.modalButtonRetry} onPress={handleRetry}>
                      <Text style={styles.modalButtonText}>{language === 'EN' ? 'Retry' : 'Ulitin'}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
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
    paddingBottom: 20,
  },
  guideContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 6,
  },
  guideText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#D9734E',
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
  canvasContainer: {
    flex: 1,
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toolButtonActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  toolButtonText: {
    color: '#64748B',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
  },
  toolButtonTextActive: {
    color: '#FFFFFF',
  },
  toolButtonClear: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolButtonCheck: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  toolButtonTextCheck: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  scoreText: {
    fontSize: 64,
    fontFamily: 'Poppins_700Bold',
    color: '#D1582D',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 18,
    fontFamily: 'Poppins_400Regular',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 30,
  },
  modalButtons: {
    width: '100%',
  },
  modalButtonNext: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalButtonRetry: {
    backgroundColor: '#D1582D',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
  }
});
