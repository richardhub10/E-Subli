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
  // Normalize symbol lookup safely
  const cleanKey = (symbol ? String(symbol) : 'a').toLowerCase().trim();

  // Check if this is a compound character (e.g. "lu/u", "bi/i", "lu_u")
  const isCompound = cleanKey.includes('/') || cleanKey.includes('_');
  if (isCompound) {
    const parts = cleanKey.split(/[/_]/);
    const baseKey = parts[0]?.trim();
    const vowelKey = parts[1]?.trim();

    const basePath = kulitanSvgPaths[baseKey] || kulitanSvgPaths[baseKey?.[0] || ''] || '';
    const vowelPath = kulitanSvgPaths[vowelKey] || kulitanSvgPaths[vowelKey?.[0] || ''] || '';

    if (basePath && vowelPath) {
      const baseWidth = size * 0.74;
      const baseHeight = size * 0.90;
      const vowelWidth = size * 0.58;
      const vowelHeight = size * 0.76;
      const totalWidth = size * 1.26;

      return (
        <View style={[styles.container, styles.compoundContainer, { width: totalWidth, height: size }]}>
          <View style={{ width: baseWidth, height: size, justifyContent: 'center', alignItems: 'center' }}>
            <Svg width={baseWidth} height={baseHeight} viewBox="0 0 100 100">
              <Path d={basePath} fill={color} />
            </Svg>
          </View>
          <View style={{ width: vowelWidth, height: size, justifyContent: 'center', alignItems: 'center', marginLeft: -size * 0.06 }}>
            <Svg width={vowelWidth} height={vowelHeight} viewBox="0 0 100 100">
              <Path d={vowelPath} fill={color} />
            </Svg>
          </View>
        </View>
      );
    }
  }

  const pathData = kulitanSvgPaths[cleanKey] || kulitanSvgPaths[cleanKey.split(' ')[0]] || kulitanSvgPaths['a'] || '';

  // ViewBox: 0 0 100 100 for normal syllables, 0 0 130 100 for ligatures with trailing -ng
  const isLigature = cleanKey.includes('ang') || cleanKey.includes('ank') || cleanKey.includes('gang');
  const viewBox = isLigature ? '0 0 130 100' : '0 0 100 100';
  const width = isLigature ? size * 1.3 : size;

  return (
    <View style={[styles.container, { width, height: size }]}>
      <Svg width={width} height={size} viewBox={viewBox}>
        <Path
          d={pathData}
          fill={color}
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
  compoundContainer: {
    flexDirection: 'row',
  },
});
