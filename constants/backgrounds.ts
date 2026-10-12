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
  scanner: require('../assets/background-image/scanner-botanical-v3.jpg') as ImageSourcePropType,
  scannerLeafTL: require('../assets/background-image/leaf-card-tl.png') as ImageSourcePropType,
  scannerLeafBR: require('../assets/background-image/leaf-card-br-clean.png') as ImageSourcePropType,
  heritageUnified: require('../assets/background-image/heritage-unified.jpg') as ImageSourcePropType,
  kulitanGuide: require('../assets/background-image/heritage-unified.jpg') as ImageSourcePropType,
  phrasebook: require('../assets/background-image/heritage-unified.jpg') as ImageSourcePropType,
  translator: require('../assets/background-image/heritage-unified.jpg') as ImageSourcePropType,
  soloPractice: require('../assets/background-image/heritage-unified.jpg') as ImageSourcePropType,
  mountArayat: require('../assets/background-image/mount-arayat.png') as ImageSourcePropType,
  quitTrophy: require('../assets/background-image/quiz-quit-trophy.png') as ImageSourcePropType,
  quitChurch: require('../assets/background-image/quiz-quit-church.png') as ImageSourcePropType,
  quitMountains: require('../assets/background-image/quiz-quit-mountains.png') as ImageSourcePropType,
  quitOrnament: require('../assets/background-image/quiz-quit-ornament.png') as ImageSourcePropType,
} as const;

export type BackgroundKey = keyof typeof BackgroundImages;
