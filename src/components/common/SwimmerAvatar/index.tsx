import React, { useEffect, useState } from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';
import { SeaCharacter } from '../../features/leaderboard/SeaCharacter';
import { fixAssetUrl } from '../../../services/branding.service';
import { getInitials } from '../../../utils/formatters';
import { colors, fontFamily } from '../../../theme';

interface SwimmerAvatarProps {
  /** The API's `avatar_url`; null when the swimmer has no photo. */
  avatarUrl: string | null | undefined;
  size: number;
  /**
   * What to draw without a photo: the swimmer's sea character (leaderboard,
   * awards) or their initials on a tinted circle (rosters, profile).
   */
  fallback: 'character' | 'initials';
  /** For the character fallback. */
  swimmerId?: number;
  /** For the initials fallback. */
  firstName?: string;
  lastName?: string;
  /** Initials fallback colours; default is the brand tint. */
  initialsBackground?: string;
  initialsColor?: string;
  /** Sea character bubbles (leaderboard only). */
  showBubbles?: boolean;
}

/**
 * A swimmer's face everywhere the app shows one: the uploaded photo when
 * there is one, otherwise whatever that screen drew before photos existed.
 * A photo that fails to load falls back too, so a stale URL never leaves an
 * empty circle. Local API `localhost` URLs are rewritten to the reachable host.
 */
export const SwimmerAvatar: React.FC<SwimmerAvatarProps> = ({
  avatarUrl,
  size,
  fallback,
  swimmerId = 0,
  firstName = '',
  lastName = '',
  initialsBackground,
  initialsColor,
  showBubbles = false,
}) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [avatarUrl]);

  const uri = fixAssetUrl(avatarUrl);
  const round = { width: size, height: size, borderRadius: size / 2 };

  if (uri && !failed) {
    return (
      <Image
        source={{ uri }}
        onError={() => setFailed(true)}
        style={[styles.photo, round]}
        accessibilityIgnoresInvertColors
      />
    );
  }

  if (fallback === 'character') {
    return (
      <View style={{ width: size, height: size }}>
        <SeaCharacter swimmerId={swimmerId} size={size} showBubbles={showBubbles} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.initials,
        round,
        { backgroundColor: initialsBackground ?? colors.primaryDim },
      ]}
    >
      <Text
        style={[
          styles.initialsText,
          { fontSize: Math.round(size * 0.36), color: initialsColor ?? colors.primary },
        ]}
      >
        {getInitials(firstName, lastName)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  photo: {
    resizeMode: 'cover',
    backgroundColor: colors.surfaceLight,
  },
  initials: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontFamily: fontFamily.headingBold,
  },
});
