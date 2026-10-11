import { ImageSourcePropType } from 'react-native';

/**
 * Centralized registry of authentic manuscript and heritage background images for E-Subli.
 * Designed with TypeScript strict typing and optimized for Expo asset pipeline.
 */
export const BackgroundImages = {
  homepage: require('../assets/background-image/homepage.jpg') as ImageSourcePropType,
  readHub: require('../assets/background-image/read hub.jpg') as ImageSourcePropType,
  learnHub: require('../assets/background-image/learn Hub.jpg') as ImageSourcePropType,
  ranksAndProfile: require('../assets/background-image/ranks and profile.jpg') as ImageSourcePropType,
  writeTrace: require('../assets/background-image/Write-Trace.jpg') as ImageSourcePropType,
  scanner: require('../assets/background-image/scanner-botanical-clean.jpg') as ImageSourcePropType,
  scannerLeafTL: require('../assets/background-image/leaf-card-tl.png') as ImageSourcePropType,
  scannerLeafBR: require('../assets/background-image/leaf-card-br-clean.png') as ImageSourcePropType,
  phrasebook: require('../assets/background-image/phrasebook.jpg') as ImageSourcePropType,
  translator: require('../assets/background-image/translator-v2.jpg') as ImageSourcePropType,
} as const;

export type BackgroundKey = keyof typeof BackgroundImages;
