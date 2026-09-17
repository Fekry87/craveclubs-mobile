import React, { useState } from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { SeaCharacter } from '../SeaCharacter';
import { isRenderableAvatar } from '../../../../utils/awards';

interface AwardAvatarProps {
  swimmerId: number;
  avatarUrl: string | null;
  size: number;
}

/**
 * The winner's face: their uploaded photo when there is one, otherwise the
 * same sea character the leaderboard already gives that swimmer. A photo that
 * fails to load falls back too, so the card never shows an empty circle.
 */
export const AwardAvatar: React.FC<AwardAvatarProps> = ({
  swimmerId,
  avatarUrl,
  size,
}) => {
  const [failed, setFailed] = useState(false);

  if (isRenderableAvatar(avatarUrl) && !failed) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        onError={() => setFailed(true)}
        style={[styles.photo, { width: size, height: size, borderRadius: size / 2 }]}
        accessibilityIgnoresInvertColors
      />
    );
  }

  return (
    <View style={{ width: size, height: size }}>
      <SeaCharacter swimmerId={swimmerId} size={size} />
    </View>
  );
};

const styles = StyleSheet.create({
  photo: {
    resizeMode: 'cover',
  },
});
