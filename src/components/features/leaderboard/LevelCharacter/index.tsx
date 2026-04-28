import React from 'react';
import { View, Image, StyleSheet, ImageSourcePropType } from 'react-native';

interface LevelCharacterProps {
  levelName: string;
  size?: number;
}

/**
 * Maps level tier names to their character images.
 * Falls back to bronze-fish for unknown level names.
 */
const LEVEL_IMAGES: Record<string, ImageSourcePropType> = {
  'Bronze Fish': require('../../../../../assets/images/levels/bronze-fish.png'),
  'Silver Dolphin': require('../../../../../assets/images/levels/silver-dolphin.png'),
  'Gold Shark': require('../../../../../assets/images/levels/gold-shark.png'),
  'Platinum Whale': require('../../../../../assets/images/levels/platinum-whale.png'),
  'Diamond Kraken': require('../../../../../assets/images/levels/diamond-kraken.png'),
};

const DEFAULT_IMAGE = require('../../../../../assets/images/levels/bronze-fish.png');

export const getLevelImage = (levelName: string): ImageSourcePropType => {
  return LEVEL_IMAGES[levelName] ?? DEFAULT_IMAGE;
};

export const LevelCharacter: React.FC<LevelCharacterProps> = ({
  levelName,
  size = 56,
}) => {
  const source = getLevelImage(levelName);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={source}
        style={[styles.image, { width: size, height: size }]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    borderRadius: 0,
  },
});
