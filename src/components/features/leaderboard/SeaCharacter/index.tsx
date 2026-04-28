import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon, IconName } from '../../../common/Icon';

interface SeaCharacterProps {
  swimmerId: number;
  size?: number;
  showBubbles?: boolean;
}

interface CharacterType {
  name: string;
  icon: IconName;
  gradient: readonly [string, string];
  bubbleColor: string;
}

/**
 * Sea creature characters — each swimmer gets a deterministic creature
 * based on their ID. Icons are creative mappings from Remix Icons
 * to sea creature personalities.
 */
const SEA_CHARACTERS: CharacterType[] = [
  {
    name: 'Shark',
    icon: 'skull-2-fill', // fierce predator
    gradient: ['#64748B', '#475569'] as const,
    bubbleColor: 'rgba(100, 116, 139, 0.3)',
  },
  {
    name: 'Dolphin',
    icon: 'emotion-happy-fill', // friendly & playful
    gradient: ['#1CB0F6', '#0D8ECF'] as const,
    bubbleColor: 'rgba(28, 176, 246, 0.3)',
  },
  {
    name: 'Octopus',
    icon: 'aliens-fill', // tentacled & alien-like
    gradient: ['#CE82FF', '#B066E3'] as const,
    bubbleColor: 'rgba(206, 130, 255, 0.3)',
  },
  {
    name: 'Turtle',
    icon: 'shield-star-fill', // shell = shield
    gradient: ['#58CC02', '#46A302'] as const,
    bubbleColor: 'rgba(88, 204, 2, 0.3)',
  },
  {
    name: 'Pufferfish',
    icon: 'emotion-laugh-fill', // round & puffy
    gradient: ['#FF9600', '#E08600'] as const,
    bubbleColor: 'rgba(255, 150, 0, 0.3)',
  },
  {
    name: 'Starfish',
    icon: 'star-smile-fill', // literal star shape
    gradient: ['#FFC800', '#E5B400'] as const,
    bubbleColor: 'rgba(255, 200, 0, 0.3)',
  },
  {
    name: 'Jellyfish',
    icon: 'ghost-2-fill', // floating, translucent
    gradient: ['#FF86D0', '#E06AB8'] as const,
    bubbleColor: 'rgba(255, 134, 208, 0.3)',
  },
  {
    name: 'Crab',
    icon: 'bear-smile-fill', // round body with eyes
    gradient: ['#FF4B4B', '#E53E3E'] as const,
    bubbleColor: 'rgba(255, 75, 75, 0.3)',
  },
  {
    name: 'Seahorse',
    icon: 'leaf-fill', // curled shape
    gradient: ['#2DD4BF', '#14B8A6'] as const,
    bubbleColor: 'rgba(45, 212, 191, 0.3)',
  },
  {
    name: 'Whale',
    icon: 'mickey-fill', // big & round
    gradient: ['#38BDF8', '#0EA5E9'] as const,
    bubbleColor: 'rgba(56, 189, 248, 0.3)',
  },
];

const getCharacter = (swimmerId: number): CharacterType => {
  return SEA_CHARACTERS[swimmerId % SEA_CHARACTERS.length];
};

export const getCharacterName = (swimmerId: number): string => {
  return getCharacter(swimmerId).name;
};

export const SeaCharacter: React.FC<SeaCharacterProps> = ({
  swimmerId,
  size = 44,
  showBubbles = false,
}) => {
  const character = getCharacter(swimmerId);
  const iconSize = Math.round(size * 0.5);

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      {showBubbles && (
        <>
          <View
            style={[
              styles.bubble,
              {
                backgroundColor: character.bubbleColor,
                width: size * 0.22,
                height: size * 0.22,
                borderRadius: size * 0.11,
                top: -size * 0.08,
                right: -size * 0.04,
              },
            ]}
          />
          <View
            style={[
              styles.bubble,
              {
                backgroundColor: character.bubbleColor,
                width: size * 0.14,
                height: size * 0.14,
                borderRadius: size * 0.07,
                top: -size * 0.15,
                right: size * 0.12,
              },
            ]}
          />
          <View
            style={[
              styles.bubble,
              {
                backgroundColor: character.bubbleColor,
                width: size * 0.1,
                height: size * 0.1,
                borderRadius: size * 0.05,
                bottom: -size * 0.06,
                left: -size * 0.04,
              },
            ]}
          />
        </>
      )}
      <LinearGradient
        colors={[...character.gradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        <Icon name={character.icon} size={iconSize} color="#FFFFFF" />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubble: {
    position: 'absolute',
    zIndex: 1,
  },
});
