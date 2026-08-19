import React, { useState, useRef } from 'react';
import { View, StyleSheet, PanResponder, GestureResponderEvent, Animated } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';

export type Point = { x: number; y: number };
export type Stroke = { points: Point[]; color: string; width: number };

type DrawingCanvasProps = {
  strokeColor?: string;
  strokeWidth?: number;
  onDrawEnd?: () => void;
  guidePath?: string;
  guideOffsetX?: number;
  guideOffsetY?: number;
  canvasWidth?: number;
  canvasHeight?: number;
  guideStartPoint?: Point;
};

// Forward ref so the parent can call "clear"
export type DrawingCanvasRef = {
  clear: () => void;
  getStrokes: () => Stroke[];
};

export const DrawingCanvas = React.forwardRef<DrawingCanvasRef, DrawingCanvasProps>(
  ({ strokeColor = '#0B2046', strokeWidth = 5, onDrawEnd, guidePath, guideOffsetX = 0, guideOffsetY = 0, canvasWidth = 0, canvasHeight = 0, guideStartPoint }, ref) => {
    const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const pulseAnim = useRef(new Animated.Value(0.4)).current;
    
    // Use refs to avoid stale closures in the PanResponder
    const colorRef = useRef(strokeColor);
    const widthRef = useRef(strokeWidth);

    React.useEffect(() => {
      colorRef.current = strokeColor;
      widthRef.current = strokeWidth;
    }, [strokeColor, strokeWidth]);
    
    React.useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, useNativeDriver: true })
        ])
      ).start();
    }, []);
    
    // Support clearing the canvas from parent
    React.useImperativeHandle(ref, () => ({
      clear: () => {
        setStrokes([]);
        setCurrentStroke(null);
      },
      getStrokes: () => strokes
    }));

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt: GestureResponderEvent) => {
          const { locationX, locationY } = evt.nativeEvent;
          setCurrentStroke({
            points: [{ x: locationX, y: locationY }],
            color: colorRef.current,
            width: widthRef.current
          });
        },
        onPanResponderMove: (evt: GestureResponderEvent) => {
          const { locationX, locationY } = evt.nativeEvent;
          setCurrentStroke((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              points: [...prev.points, { x: locationX, y: locationY }]
            };
          });
        },
        onPanResponderRelease: () => {
          setCurrentStroke((prev) => {
            if (prev) {
              setStrokes((prevStrokes) => [...prevStrokes, prev]);
            }
            return null;
          });
          if (onDrawEnd) onDrawEnd();
        }
      })
    ).current;

    const createSvgPath = (points: Point[]) => {
      if (points.length === 0) return '';
      const path = points.map((p, i) => {
        return `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
      }).join(' ');
      return path;
    };

    return (
      <View style={styles.container} {...panResponder.panHandlers}>
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
          {/* Reference Guide Path centered on canvas */}
          {guidePath && canvasWidth > 0 && canvasHeight > 0 && (
            <G x={canvasWidth / 2} y={canvasHeight / 2}>
              <G x={guideOffsetX} y={guideOffsetY}>
                <Path d={guidePath} fill="rgba(217, 115, 78, 0.2)" />
              </G>
            </G>
          )}

          {strokes.map((stroke, index) => (
            <Path
              key={`stroke-${index}`}
              d={createSvgPath(stroke.points)}
              stroke={stroke.color}
              strokeWidth={stroke.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ))}
          {currentStroke && (
            <Path
              d={createSvgPath(currentStroke.points)}
              stroke={currentStroke.color}
              strokeWidth={currentStroke.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          )}
        </Svg>
        
        {/* Pulsing Guide Point Indicator */}
        {strokes.length === 0 && !currentStroke && guideStartPoint && canvasWidth > 0 && canvasHeight > 0 && (
          <Animated.View
            style={[
              styles.startPointIndicator,
              {
                left: (canvasWidth / 2) + guideOffsetX + guideStartPoint.x - 12, // 12 is half width/height
                top: (canvasHeight / 2) + guideOffsetY + guideStartPoint.y - 12,
                opacity: pulseAnim,
                transform: [{ scale: pulseAnim }]
              }
            ]}
          >
            <View style={styles.startPointCore} />
          </Animated.View>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
    // @ts-ignore - Required for Web to prevent scrolling when drawing
    touchAction: 'none',
  },
  startPointIndicator: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.4)', // Green glow
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  startPointCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981', // Solid Green core
  }
});
