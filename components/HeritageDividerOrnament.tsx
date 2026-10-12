import React from 'react';
import { View, StyleSheet } from 'react-native';

type HeritageDividerOrnamentProps = {
  width?: number | string;
  color?: string;
  diamondColor?: string;
  style?: any;
};

/**
 * Authentic top/bottom ornamental accent line with center diamond (— ❖ —)
 * matching the proposed E-Subli heritage design mockup.
 */
export default function HeritageDividerOrnament({
  width = '55%',
  color = 'rgba(209, 88, 45, 0.35)',
  diamondColor = '#CC6C46',
  style,
}: HeritageDividerOrnamentProps) {
  return (
    <View style={[styles.container, { width: width as any }, style]}>
      <View style={[styles.line, { backgroundColor: color }]} />
      <View style={[styles.diamondWrapper, { borderColor: color }]}>
        <View style={[styles.diamond, { backgroundColor: diamondColor }]} />
      </View>
      <View style={[styles.line, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 4,
  },
  line: {
    flex: 1,
    height: 1,
  },
  diamondWrapper: {
    marginHorizontal: 8,
    width: 9,
    height: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  diamond: {
    width: 6,
    height: 6,
    transform: [{ rotate: '45deg' }],
    borderRadius: 1,
  },
});
