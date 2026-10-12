import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type HeritageCornerOrnamentProps = {
  position?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  size?: number;
  color?: string;
};

/**
 * Authentic traditional Kapampangan/Meander geometric corner ornament
 * matching the proposed E-Subli heritage design mockup.
 */
export default function HeritageCornerOrnament({
  position = 'topRight',
  size = 28,
  color = '#CDBFA8',
}: HeritageCornerOrnamentProps) {
  const getRotation = () => {
    switch (position) {
      case 'topLeft':
        return '180deg';
      case 'bottomLeft':
        return '90deg';
      case 'bottomRight':
        return '0deg';
      case 'topRight':
      default:
        return '270deg';
    }
  };

  return (
    <View 
      pointerEvents="none" 
      style={[
        styles.container, 
        styles[position],
        { transform: [{ rotate: getRotation() }] }
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Outer corner step */}
        <Path
          d="M2 22 L22 22 L22 2"
          stroke={color}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="miter"
        />
        {/* Middle corner step */}
        <Path
          d="M6 18 L18 18 L18 6"
          stroke={color}
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="miter"
        />
        {/* Inner concentric square accent */}
        <Path
          d="M10 14 L14 14 L14 10"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="miter"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 2,
    opacity: 0.65,
  },
  topLeft: {
    top: 6,
    left: 6,
  },
  topRight: {
    top: 6,
    right: 6,
  },
  bottomLeft: {
    bottom: 6,
    left: 6,
  },
  bottomRight: {
    bottom: 6,
    right: 6,
  },
});
