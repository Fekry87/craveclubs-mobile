import { StyleSheet, Platform } from 'react-native';
import { colors, fontFamily, spacing } from '../../../theme';

/** Floating-bar geometry — shared by the bar and the content-inset constant. */
export const GLASS_BAR_HEIGHT = 72;
export const GLASS_BAR_SIDE = spacing.md;
export const GLASS_BAR_GAP = 12;

/**
 * Bottom padding a scroll screen should add so its last item can scroll clear
 * of the floating bar (which now overlays content). Sized for the largest
 * home-indicator inset; on shorter devices it just leaves a little extra room.
 */
export const GLASS_TABBAR_CONTENT_INSET = 132;

export const s = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: GLASS_BAR_SIDE,
    right: GLASS_BAR_SIDE,
    // The frosted pill floats; the shadow lives here (the bar clips its own).
    shadowColor: '#3D3A6B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
  },
  bar: {
    height: GLASS_BAR_HEIGHT,
    flexDirection: 'row',
    // Fully rounded pill.
    borderRadius: GLASS_BAR_HEIGHT / 2,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.5)',
    // No fill on iOS — the blur alone shows the content behind it. Android's
    // blur is weak, so keep a light veil there just for label legibility.
    backgroundColor: Platform.select({
      ios: 'transparent',
      default: 'rgba(255,255,255,0.6)',
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontFamily: fontFamily.bodyMedium,
  },
  badge: {
    position: 'absolute',
    top: -1,
    right: -2,
    minWidth: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
});
