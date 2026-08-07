import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { DrawingCanvas, DrawingCanvasRef } from '../components/DrawingCanvas';
import { useProfile } from '../context/ProfileContext';
import { kulitanSyllables } from '../data/kulitanData';
import { kulitanPoints } from '../data/kulitanPoints';

type WriteTraceScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

export default function WriteTraceScreen({ navigation }: WriteTraceScreenProps) {
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const { addXP, incrementWriting } = useProfile();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentSyllable = kulitanSyllables[currentIndex];
  
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
    setCurrentColor('#FAF5EE'); 
  };

  const handlePen = () => {
    setIsEraser(false);
    setCurrentColor('#0B2046'); 
  };

  const handleCheck = () => {
    setModalVisible(true);
    setIsAnalyzing(true);
    setScore(null);
    
    setTimeout(() => {
      setIsAnalyzing(false);
      
      const strokes = canvasRef.current?.getStrokes() || [];
      const validStrokes = strokes.filter(s => s.color !== '#FAF5EE');

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

        if (userPoints.length < 10) {
          calculatedScore = 10; // Dot or tiny scribble
        } else {
          const referenceData = kulitanPoints[currentSyllable.latin];
          
          if (!referenceData || referenceData.points.length === 0) {
            calculatedScore = 80;
          } else {
            // The reference points from kulitanPoints are ALREADY centered exactly at (0,0)!
            // Because the visual SVG is also centered at (0,0) relative to the canvas center,
            // they match perfectly. Do NOT add the offset again.
            const absoluteRefPoints = referenceData.points;

            // 1. COVERAGE CHECK
            // A point is covered if the pen passes within 24 pixels (half stroke width + margin).
            // Tightening this strictly kills zigzag and partial trace exploits.
            let coveredPoints = 0;
            absoluteRefPoints.forEach(rp => {
              let minDistance = Infinity;
              userPoints.forEach(up => {
                const dist = Math.hypot(rp.x - up.x, rp.y - up.y);
                if (dist < minDistance) minDistance = dist;
              });
              if (minDistance <= 24) {
                coveredPoints++;
              }
            });
            const coverage = coveredPoints / absoluteRefPoints.length;

            // 2. STROKE LENGTH CHECK
            // Correctly sum lengths per-stroke to avoid massive jumps between strokes.
            let userStrokeLength = 0;
            validStrokes.forEach(stroke => {
              for (let i = 1; i < stroke.points.length; i++) {
                // We use the raw stroke points, but scaled mathematically it's the same distance
                userStrokeLength += Math.hypot(stroke.points[i].x - stroke.points[i - 1].x, stroke.points[i].y - stroke.points[i - 1].y);
              }
            });

            let refPerimeterLength = 0;
            for (let i = 1; i < absoluteRefPoints.length; i++) {
              refPerimeterLength += Math.hypot(absoluteRefPoints[i].x - absoluteRefPoints[i - 1].x, absoluteRefPoints[i].y - absoluteRefPoints[i - 1].y);
            }

            // The ideal trace down the skeleton is exactly 50% of the thick perimeter.
            const idealLength = refPerimeterLength * 0.5;
            const lengthRatio = idealLength > 0 ? userStrokeLength / idealLength : 1;

            // 3. PRECISION CHECK (Out of bounds)
            // If a user point is > 25px away from the reference outline, it is OUTSIDE the lines.
            let outOfBoundsCount = 0;
            userPoints.forEach(up => {
              let minDistance = Infinity;
              absoluteRefPoints.forEach(rp => {
                const dist = Math.hypot(up.x - rp.x, up.y - rp.y);
                if (dist < minDistance) minDistance = dist;
              });
              if (minDistance > 25) {
                outOfBoundsCount++;
              }
            });
            const outOfBoundsRatio = userPoints.length > 0 ? outOfBoundsCount / userPoints.length : 1;

            // SCORING LOGIC
            if (coverage < 0.82) {
              // Failed coverage (missed parts, or drew zigzags leaving large outline gaps)
              calculatedScore = Math.floor(coverage * 70); 
            } else if (lengthRatio > 2.2) {
              // Scribbled way too much ink (coloring in the shape)
              calculatedScore = 45;
            } else if (lengthRatio < 0.4) {
              // Barely drew anything (dots)
              calculatedScore = 45;
            } else if (outOfBoundsRatio > 0.15) {
              // More than 15% of their ink is strictly outside the lines (sloppy)
              calculatedScore = 55;
            } else {
              // Valid Trace! Grade from 75 to 100 based on perfection.
              let baseScore = coverage * 100; 
              
              // Penalty for drawing too much/little ink (wobbly lines)
              let lengthPenalty = Math.abs(1.0 - lengthRatio) * 15;
              
              // Penalty for points slightly out of bounds
              let outOfBoundsPenalty = outOfBoundsRatio * 100;

              calculatedScore = Math.floor(baseScore - lengthPenalty - outOfBoundsPenalty);
              
              // Clamp score to reward a genuinely good trace
              if (calculatedScore > 100) calculatedScore = 100;
              if (calculatedScore < 75) calculatedScore = 75;
            }
          }
        }
      }

      setScore(calculatedScore);
      
      if (calculatedScore >= 70) {
        addXP(10);
        incrementWriting();
      }
    }, 1500);
  };

  const handleNext = () => {
    if (currentIndex < kulitanSyllables.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // loop back
    }
    setModalVisible(false);
    canvasRef.current?.clear();
  };

  const handleRetry = () => {
    setModalVisible(false);
    canvasRef.current?.clear();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TRACE: {currentSyllable.latin.toUpperCase()}</Text>
        <View style={{ width: 50 }} />
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
          canvasWidth={canvasSize.width}
          canvasHeight={canvasSize.height}
        />
      </View>

      <View style={styles.toolbar}>
        <TouchableOpacity 
          style={[styles.toolButton, !isEraser && styles.toolButtonActive]} 
          onPress={handlePen}
        >
          <Text style={[styles.toolButtonText, !isEraser && styles.toolButtonTextActive]}>Pen</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.toolButton, isEraser && styles.toolButtonActive]} 
          onPress={handleEraser}
        >
          <Text style={[styles.toolButtonText, isEraser && styles.toolButtonTextActive]}>Eraser</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolButtonClear} onPress={handleClear}>
          <Text style={styles.toolButtonTextClear}>Clear</Text>
        </TouchableOpacity>

        {/* New Check Button */}
        <TouchableOpacity style={styles.toolButtonCheck} onPress={handleCheck}>
          <Text style={styles.toolButtonTextCheck}>Check</Text>
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
                <Text style={styles.modalText}>Analyzing strokes...</Text>
              </>
            ) : (
              <>
                <Text style={styles.scoreText}>{score}%</Text>
                <Text style={styles.modalText}>
                  {score && score >= 70 ? 'Excellent tracing!' : 'Keep practicing!'}
                </Text>
                
                <View style={styles.modalButtons}>
                  {score && score >= 70 ? (
                    <TouchableOpacity style={styles.modalButtonNext} onPress={handleNext}>
                      <Text style={styles.modalButtonText}>Next</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.modalButtonRetry} onPress={handleRetry}>
                      <Text style={styles.modalButtonText}>Retry</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  canvasContainer: {
    flex: 1,
    backgroundColor: '#FAF5EE', 
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },

  toolbar: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 40,
    gap: 10,
  },
  toolButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(250, 245, 238, 0.3)',
  },
  toolButtonActive: {
    backgroundColor: '#FAF5EE',
    borderColor: '#FAF5EE',
  },
  toolButtonText: {
    color: '#FAF5EE',
    fontSize: 14,
    fontWeight: 'bold',
  },
  toolButtonTextActive: {
    color: '#0B2046',
  },
  toolButtonClear: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  toolButtonTextClear: {
    color: '#FAF5EE',
    fontSize: 14,
    fontWeight: 'bold',
  },
  toolButtonCheck: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#10B981', // Green for action
  },
  toolButtonTextCheck: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 32, 70, 0.9)', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FAF5EE',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalText: {
    fontSize: 18,
    color: '#0B2046',
    marginTop: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
  scoreText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#D9734E',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 15,
  },
  modalButtonNext: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  modalButtonRetry: {
    backgroundColor: '#D9734E',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
