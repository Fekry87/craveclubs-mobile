import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Image,
  ImageSourcePropType,
  View,
  useWindowDimensions,
} from 'react-native';
import { styles } from './styles';

/** How long each photo is held, fade included. */
const HOLD_MS = 3000;
const FADE_MS = 800;

interface PhotoSlideshowProps {
  /** Remote photos to cycle through, in order. */
  photos: string[];
  /**
   * Shown while the photos load, if every one of them fails, and when there
   * are none — so the screen is never an empty colour.
   */
  fallback: ImageSourcePropType;
  /** Share of the screen height the photos are lifted by. */
  lift: number;
}

/**
 * Full-screen background that cross-fades through `photos`.
 *
 * Only photos that have finished loading join the rotation, so a slow network
 * never fades to a blank frame. The incoming photo is raised above the outgoing
 * one and faded in over it while the outgoing one stays fully opaque; fading
 * both at once would let the fallback show through mid-transition.
 */
export const PhotoSlideshow: React.FC<PhotoSlideshowProps> = ({ photos, fallback, lift }) => {
  const { width, height } = useWindowDimensions();
  const [loaded, setLoaded] = useState<boolean[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [previous, setPrevious] = useState<number | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const opacities = useRef<Animated.Value[]>([]);

  const photosKey = photos.join('|');

  // A new set of photos starts over.
  useEffect(() => {
    opacities.current = photos.map(() => new Animated.Value(0));
    setLoaded(photos.map(() => false));
    setActive(null);
    setPrevious(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photosKey]);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => sub.remove();
  }, []);

  // Fade the active photo in over the previous one, then drop the previous.
  useEffect(() => {
    if (active === null) return;
    const incoming = opacities.current[active];
    if (!incoming) return;
    const outgoing = previous !== null ? opacities.current[previous] : undefined;
    const animation = Animated.timing(incoming, {
      toValue: 1,
      duration: reduceMotion ? 0 : FADE_MS,
      useNativeDriver: true,
    });
    animation.start(({ finished }) => {
      if (finished && outgoing && previous !== active) outgoing.setValue(0);
    });
    return () => animation.stop();
  }, [active, previous, reduceMotion]);

  // Advance through the loaded photos. Reduce Motion holds the first one.
  useEffect(() => {
    if (active === null || reduceMotion) return;
    const ready = loaded.map((ok, i) => (ok ? i : -1)).filter((i) => i >= 0);
    if (ready.length < 2) return;
    const timer = setTimeout(() => {
      const next = ready.find((i) => i > active) ?? ready[0];
      setPrevious(active);
      setActive(next);
    }, HOLD_MS);
    return () => clearTimeout(timer);
  }, [active, loaded, reduceMotion]);

  const handleLoad = (index: number) => {
    setLoaded((prev) => {
      if (prev[index]) return prev;
      const next = [...prev];
      next[index] = true;
      return next;
    });
    // The first photo to arrive opens the show.
    setActive((current) => (current === null ? index : current));
  };

  const frame = { width, height, top: -height * lift };

  // The wrapper scopes the zIndex juggling below: without it the raised photo
  // would outrank the screen's scrim and form, which are siblings of this.
  return (
    <View style={styles.container} pointerEvents="none">
      {/* Explicit width: an absolutely positioned image otherwise keeps its
          intrinsic size and `cover` zooms into a corner of it. */}
      <Image source={fallback} resizeMode="cover" style={[styles.layer, frame]} />
      {photos.map((uri, i) => (
        <Animated.Image
          key={uri}
          source={{ uri }}
          resizeMode="cover"
          onLoad={() => handleLoad(i)}
          style={[
            styles.layer,
            frame,
            {
              opacity: opacities.current[i] ?? 0,
              zIndex: i === active ? 2 : i === previous ? 1 : 0,
            },
          ]}
        />
      ))}
    </View>
  );
};
