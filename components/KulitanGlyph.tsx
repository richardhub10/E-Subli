import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { kulitanSvgPaths } from '../data/kulitanGlyphs';

type KulitanGlyphProps = {
  symbol: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export default function KulitanGlyph({
  symbol,
  size = 80,
  color = '#0B2046',
  strokeWidth = 4.5,
}: KulitanGlyphProps) {
  // Normalize symbol lookup
  const cleanKey = symbol.toLowerCase().trim();
  const pathData = kulitanSvgPaths[cleanKey] || kulitanSvgPaths[cleanKey.split(' ')[0]] || kulitanSvgPaths['a'];

  // ViewBox: 0 0 100 100 for normal syllables, 0 0 130 100 for ligatures with trailing -ng
  const isLigature = cleanKey.includes('ang') || cleanKey.includes('ank') || cleanKey.includes('gang');
  const viewBox = isLigature ? '0 0 130 100' : '0 0 100 100';
  const width = isLigature ? size * 1.3 : size;

  return (
    <View style={[styles.container, { width, height: size }]}>
      <Svg width={width} height={size} viewBox={viewBox}>
        <Path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
