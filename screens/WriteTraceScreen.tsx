import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { DrawingCanvas, DrawingCanvasRef } from '../components/DrawingCanvas';
import { useProfile } from '../context/ProfileContext';
import { kulitanSyllables } from '../data/kulitanData';
import { kulitanPoints } from '../data/kulitanPoints';
import { useLanguage } from '../context/LanguageContext';
import { useQuest } from '../context/QuestContext';

type WriteTraceScreenProps = {
  navigation: StackNavigationProp<any, any>;
  route?: RouteProp<any, any>;
};

const PEN_COLORS = [
  { id: 'black', color: '#0F172A', label: 'Ink' },
  { id: 'amber', color: '#D1582D', label: 'Ochre' },
  { id: 'blue', color: '#2563EB', label: 'Cobalt' },
  { id: 'green', color: '#059669', label: 'Jade' },
  { id: 'red', color: '#DC2626', label: 'Crimson' },
  { id: 'purple', color: '#7C3AED', label: 'Violet' },
];

const PEN_SIZES = [
  { id: 'fine', size: 4, label: 'Fine', dotSize: 5 },
  { id: 'medium', size: 8, label: 'Med', dotSize: 9 },
  { id: 'thick', size: 14, label: 'Thick', dotSize: 14 },
];

export default function WriteTraceScreen({ navigation, route }: WriteTraceScreenProps) {
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const { addXP, incrementWriting } = useProfile();
  const { recordQuestAction } = useQuest();
  
  const getInitialIndex = () => {
    const target = route?.params?.selectedSyllable || route?.params?.initialSyllable;
    if (target) {
      const cleanTarget = String(target).toLowerCase().trim();
      const foundIdx = kulitanSyllables.findIndex(s => s.latin.toLowerCase() === cleanTarget || s.latin.toLowerCase().startsWith(cleanTarget));
      if (foundIdx !== -1) return foundIdx;
    }
    if (route?.params?.syllableId) {
      const foundIdx = kulitanSyllables.findIndex(s => s.id === route?.params?.syllableId);
      if (foundIdx !== -1) return foundIdx;
    }
    return 0;
  };

  const [currentIndex, setCurrentIndex] = useState(getInitialIndex);

  // Sync if route params change on new navigation
  useEffect(() => {
    const target = route?.params?.selectedSyllable || route?.params?.initialSyllable;
    if (target) {
      const cleanTarget = String(target).toLowerCase().trim();
      const foundIdx = kulitanSyllables.findIndex(s => s.latin.toLowerCase() === cleanTarget || s.latin.toLowerCase().startsWith(cleanTarget));
      if (foundIdx !== -1) {
        setCurrentIndex(foundIdx);
        canvasRef.current?.clear();
      }
    }
  }, [route?.params?.selectedSyllable, route?.params?.initialSyllable, route?.params?.syllableId]);

  const currentSyllable = kulitanSyllables[currentIndex] || kulitanSyllables[0];
  const { t, language } = useLanguage();
  
  const [isEraser, setIsEraser] = useState(false);
  const [isBlindMode, setIsBlindMode] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#0F172A');
  const [selectedSize, setSelectedSize] = useState(8);
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [earnedXp, setEarnedXp] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const handleClear = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    canvasRef.current?.clear();
  };

  const handleUndo = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    canvasRef.current?.undo();
  };

  const handleEraser = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsEraser(true);
  };

  const handlePen = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsEraser(false);
  };

  const toggleBlindMode = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setIsBlindMode(!isBlindMode);
    canvasRef.current?.clear();
  };

  const handleSelectColor = (color: string) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setSelectedColor(color);
    setIsEraser(false);
  };

  const handleSelectSize = (size: number) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setSelectedSize(size);
  };

  const handleCheck = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
        // Collect all user points shifted relative to canvas center
        let userPoints: { x: number; y: number }[] = [];
        
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
              calculatedScore = Math.floor(coverage * 60);
            } else if (outOfBoundsRatio > 0.28 || lengthRatio > 2.3) {
              calculatedScore = Math.max(15, Math.floor(40 - (outOfBoundsRatio * 25)));
            } else if (lengthRatio < 0.45) {
              calculatedScore = 45;
            } else {
              const coverageScore = coverage * 65;
              const precisionScore = (1.0 - outOfBoundsRatio) * 35;
              const lengthPenalty = Math.abs(1.0 - Math.min(1.5, lengthRatio)) * 12;

              calculatedScore = Math.round(coverageScore + precisionScore - lengthPenalty);
              
              if (calculatedScore > 100) calculatedScore = 100;
              if (calculatedScore < 60) calculatedScore = 60;
            }
          }
        }
      }

      setScore(calculatedScore);

      let xp = 0;
      if (calculatedScore >= 70) {
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        xp = isBlindMode ? 50 : 25; // 2x XP for blind memory mode!
        addXP(xp);
        incrementWriting();
        recordQuestAction('writing');
      } else {
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      setEarnedXp(xp);
    }, 900);
  };

  const handleNext = () => {
    setModalVisible(false);
    if (currentIndex < kulitanSyllables.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
    canvasRef.current?.clear();
  };

  const handleRetry = () => {
    setModalVisible(false);
    canvasRef.current?.clear();
  };

  const renderStars = (scr: number | null) => {
    if (!scr || scr < 70) {
      return (
        <View style={styles.starsRow}>
          <Ionicons name="star" size={28} color="#F59E0B" />
          <Ionicons name="star-outline" size={28} color="#CBD5E1" />
          <Ionicons name="star-outline" size={28} color="#CBD5E1" />
        </View>
      );
    }
    if (scr < 90) {
      return (
        <View style={styles.starsRow}>
          <Ionicons name="star" size={28} color="#F59E0B" />
          <Ionicons name="star" size={28} color="#F59E0B" />
          <Ionicons name="star-outline" size={28} color="#CBD5E1" />
        </View>
      );
    }
    return (
      <View style={styles.starsRow}>
        <Ionicons name="star" size={28} color="#F59E0B" />
        <Ionicons name="star" size={28} color="#F59E0B" />
        <Ionicons name="star" size={28} color="#F59E0B" />
      </View>
    );
  };

  return (
    <LinearGradient colors={['#FAF5EE', '#E8DAC9']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerSub}>{language === 'EN' ? 'TRACING STUDIO' : 'PAGSASANAY SA PAGSULAT'}</Text>
          <Text style={styles.headerTitle}>{currentSyllable.latin.toUpperCase()}</Text>
        </View>

        {/* Guided vs Blind Memory Mode Toggle Button */}
        <TouchableOpacity 
          style={[styles.blindModeBtn, isBlindMode && styles.blindModeBtnActive]}
          onPress={toggleBlindMode}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={isBlindMode ? "eye-off" : "eye"} 
            size={16} 
            color={isBlindMode ? "#FFF" : "#D1582D"} 
          />
          <Text style={[styles.blindModeText, isBlindMode && styles.blindModeTextActive]}>
            {isBlindMode ? '2x XP' : 'Guide'}
          </Text>
        </TouchableOpacity>

        {/* Previous & Next Glyph Buttons */}
        <TouchableOpacity 
          style={styles.headerNavBtn} 
          onPress={() => {
            if (currentIndex > 0) {
              setCurrentIndex(currentIndex - 1);
              canvasRef.current?.clear();
            }
          }}
          disabled={currentIndex === 0}
        >
          <Ionicons name="chevron-back" size={18} color={currentIndex === 0 ? "#CBD5E1" : "#0F172A"} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.headerNavBtn} 
          onPress={() => {
            if (currentIndex < kulitanSyllables.length - 1) {
              setCurrentIndex(currentIndex + 1);
              canvasRef.current?.clear();
            }
          }}
        >
          <Ionicons name="chevron-forward" size={18} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Tip Banner / Blind Mode Notification */}
      <View style={styles.guideContainer}>
        <Ionicons 
          name={isBlindMode ? "flash" : "information-circle"} 
          size={14} 
          color={isBlindMode ? "#F59E0B" : "#D1582D"} 
        />
        <Text style={[styles.guideText, isBlindMode && { color: '#B45309', fontFamily: 'Poppins_700Bold' }]}>
          {isBlindMode 
            ? (language === 'EN' ? 'Blind Memory Mode: Draw from memory for Double (+50 XP)!' : 'Memory Mode: Gumuhit mula sa memorya para sa Double (+50 XP)!')
            : (language === 'EN' ? 'Trace strokes from top to bottom, right to left.' : 'Sundan ang mga guhit mula itaas pababa, kanan pakaliwa.')}
        </Text>
      </View>

      {/* Interactive Drawing Canvas */}
      <View 
        style={styles.canvasContainer}
        onLayout={(e) => setCanvasSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
      >
        <DrawingCanvas 
          ref={canvasRef} 
          strokeColor={isEraser ? '#FFFFFF' : selectedColor} 
          strokeWidth={isEraser ? 24 : selectedSize}
          guidePath={isBlindMode ? undefined : kulitanPoints[currentSyllable.latin]?.path}
          guideOffsetX={kulitanPoints[currentSyllable.latin]?.offsetX}
          guideOffsetY={kulitanPoints[currentSyllable.latin]?.offsetY}
          guideStartPoint={kulitanPoints[currentSyllable.latin]?.points?.[0]}
          canvasWidth={canvasSize.width}
          canvasHeight={canvasSize.height}
        />
      </View>

      {/* Studio Tool Palette: Color Swatches & Stroke Width */}
      <View style={styles.customizerCard}>
        {/* Colors Row */}
        <View style={styles.colorPaletteRow}>
          <Text style={styles.paletteLabel}>{language === 'EN' ? 'Color' : 'Kulay'}</Text>
          <View style={styles.colorSwatches}>
            {PEN_COLORS.map(c => {
              const isColorActive = !isEraser && selectedColor === c.color;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: c.color },
                    isColorActive && styles.colorSwatchActive
                  ]}
                  onPress={() => handleSelectColor(c.color)}
                  activeOpacity={0.7}
                >
                  {isColorActive && (
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Pen Sizes Row */}
        <View style={styles.sizePaletteRow}>
          <Text style={styles.paletteLabel}>{language === 'EN' ? 'Size' : 'Laki'}</Text>
          <View style={styles.sizePillGroup}>
            {PEN_SIZES.map(s => {
              const isSizeActive = selectedSize === s.size;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.sizePill,
                    isSizeActive && styles.sizePillActive
                  ]}
                  onPress={() => handleSelectSize(s.size)}
                  activeOpacity={0.7}
                >
                  <View 
                    style={[
                      styles.sizeDot, 
                      { width: s.dotSize, height: s.dotSize, borderRadius: s.dotSize / 2 },
                      isSizeActive ? { backgroundColor: '#FFFFFF' } : { backgroundColor: selectedColor }
                    ]} 
                  />
                  <Text style={[styles.sizePillText, isSizeActive && styles.sizePillTextActive]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* Bottom Actions Bar with Undo, Eraser, Clear, and Check */}
      <View style={styles.toolbar}>
        <TouchableOpacity 
          style={[styles.toolButton, !isEraser && styles.toolButtonActive]} 
          onPress={handlePen}
          activeOpacity={0.7}
        >
          <Ionicons name="pencil" size={16} color={!isEraser ? "#FFFFFF" : "#64748B"} style={{ marginRight: 5 }} />
          <Text style={[styles.toolButtonText, !isEraser && styles.toolButtonTextActive]}>
            {language === 'EN' ? 'Pen' : 'Panulat'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.toolButton, isEraser && styles.toolButtonActive]} 
          onPress={handleEraser}
          activeOpacity={0.7}
        >
          <Ionicons name="bandage-outline" size={16} color={isEraser ? "#FFFFFF" : "#64748B"} style={{ marginRight: 5 }} />
          <Text style={[styles.toolButtonText, isEraser && styles.toolButtonTextActive]}>
            {language === 'EN' ? 'Eraser' : 'Pambura'}
          </Text>
        </TouchableOpacity>

        {/* Undo Last Stroke Button */}
        <TouchableOpacity style={styles.toolIconBtn} onPress={handleUndo} activeOpacity={0.7}>
          <Ionicons name="arrow-undo" size={18} color="#0F172A" />
        </TouchableOpacity>

        {/* Clear Canvas Button */}
        <TouchableOpacity style={styles.toolIconBtn} onPress={handleClear} activeOpacity={0.7}>
          <Ionicons name="trash-outline" size={18} color="#D1582D" />
        </TouchableOpacity>

        {/* Check & Rate Tracing Button */}
        <TouchableOpacity style={styles.toolButtonCheck} onPress={handleCheck} activeOpacity={0.85}>
          <LinearGradient colors={['#E87954', '#D1582D']} style={styles.checkBtnGradient}>
            <Ionicons name="checkmark-circle" size={18} color="#FFF" style={{ marginRight: 5 }} />
            <Text style={styles.toolButtonTextCheck}>{language === 'EN' ? 'Check' : 'Suriin'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Accuracy & 3-Star Result Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {isAnalyzing ? (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <ActivityIndicator size="large" color="#D1582D" />
                <Text style={styles.modalText}>{language === 'EN' ? 'Analyzing stroke precision...' : 'Sinusuri ang pagsunod...'}</Text>
              </View>
            ) : (
              <>
                {/* 3-Star Rating Header */}
                {renderStars(score)}

                <View style={[
                  styles.scoreBadge,
                  score && score >= 70 ? styles.scoreBadgeHigh : styles.scoreBadgeLow
                ]}>
                  <Text style={styles.scoreText}>{score}%</Text>
                </View>

                <Text style={styles.modalTitle}>
                  {score && score >= 90 
                    ? (language === 'EN' ? 'Master Scribe! 🏆' : 'Dalubhasang Manunulat! 🏆')
                    : score && score >= 70
                    ? (language === 'EN' ? 'Great Accuracy! 🌟' : 'Magandang Pagsulat! 🌟')
                    : (language === 'EN' ? 'Keep Practicing! 💪' : 'Ipagpatuloy ang Pagsasanay! 💪')}
                </Text>

                <Text style={styles.modalSubtitle}>
                  {score && score >= 70 
                    ? (language === 'EN' 
                        ? `+${earnedXp} XP Earned! ${isBlindMode ? '🔥 2x Blind Memory Bonus Applied!' : 'Your stroke form closely matches ancient Kulitan.'}`
                        : `+${earnedXp} XP Nakuha! ${isBlindMode ? '🔥 2x Memory Bonus!' : 'Tumpak at mahusay ang iyong pagsulat.'}`)
                    : (language === 'EN' ? 'Try staying within the guided track lines from top to bottom.' : 'Subukang manatili sa loob ng gabay mula itaas pababa.')}
                </Text>
                
                <View style={styles.modalButtons}>
                  {score && score >= 70 ? (
                    <TouchableOpacity style={styles.modalButtonNext} onPress={handleNext} activeOpacity={0.8}>
                      <Text style={styles.modalButtonText}>{language === 'EN' ? 'Next Character' : 'Susunod na Titik'}</Text>
                      <Ionicons name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.modalButtonRetry} onPress={handleRetry} activeOpacity={0.8}>
                      <Ionicons name="refresh" size={18} color="#FFF" style={{ marginRight: 6 }} />
                      <Text style={styles.modalButtonText}>{language === 'EN' ? 'Try Again' : 'Ulitin'}</Text>
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
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingHorizontal: 18,
    paddingBottom: 8,
    gap: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerSub: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 9,
    color: '#D1582D',
    letterSpacing: 1,
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontFamily: 'Poppins_700Bold',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  blindModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FED7AA',
    gap: 4,
  },
  blindModeBtnActive: {
    backgroundColor: '#D97706',
    borderColor: '#B45309',
  },
  blindModeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    color: '#D97706',
  },
  blindModeTextActive: {
    color: '#FFFFFF',
  },
  headerNavBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  guideContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 6,
    gap: 6,
  },
  guideText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: '#D1582D',
  },
  canvasContainer: {
    flex: 1,
    marginHorizontal: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  customizerCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 18,
    marginTop: 8,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  colorPaletteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sizePaletteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paletteLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#64748B',
    width: 40,
  },
  colorSwatches: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorSwatch: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  colorSwatchActive: {
    borderColor: '#D1582D',
    transform: [{ scale: 1.15 }],
  },
  sizePillGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  sizePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    gap: 5,
  },
  sizePillActive: {
    backgroundColor: '#0F172A',
  },
  sizeDot: {
    backgroundColor: '#0F172A',
  },
  sizePillText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: '#64748B',
  },
  sizePillTextActive: {
    color: '#FFFFFF',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    gap: 6,
  },
  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toolButtonActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  toolButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#64748B',
  },
  toolButtonTextActive: {
    color: '#FFFFFF',
  },
  toolIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toolButtonCheck: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#D1582D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  checkBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  toolButtonTextCheck: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  scoreBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreBadgeHigh: {
    backgroundColor: '#ECFDF5',
    borderWidth: 3,
    borderColor: '#10B981',
  },
  scoreBadgeLow: {
    backgroundColor: '#FFF1F2',
    borderWidth: 3,
    borderColor: '#F43F5E',
  },
  scoreText: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: '#0F172A',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 17,
  },
  modalText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
    marginTop: 12,
  },
  modalButtons: {
    width: '100%',
  },
  modalButtonNext: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonRetry: {
    flexDirection: 'row',
    backgroundColor: '#D1582D',
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
  },
});
