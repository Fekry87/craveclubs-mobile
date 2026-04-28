import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/common/Icon';
import { useAnimatedEntry } from '../../hooks/useAnimatedEntry';
import { useAnimatedPress } from '../../hooks/useAnimatedPress';
import { useBrandingStore } from '../../store/branding.store';
import { useSportModuleStore } from '../../store/sportModule.store';
import { SportModule } from '../../api/services/registration.service';
import { colors, spacing, fontFamily, borderRadius, shadows } from '../../theme';

/* ── Accent colors cycled per card ── */
const ACCENT_COLORS = [
  colors.primary,
  colors.swimmer,
  colors.secondary,
  colors.orange,
  colors.teal,
  colors.error,
];

/* ── Sport Card ── */
const SportCard: React.FC<{
  sport: SportModule;
  index: number;
  onPress: (sport: SportModule) => void;
}> = ({ sport, index, onPress }) => {
  const entryAnim = useAnimatedEntry(index);
  const { animatedStyle, onPressIn, onPressOut } = useAnimatedPress();
  const accent = sport.color || ACCENT_COLORS[index % ACCENT_COLORS.length];

  const handlePress = useCallback(() => {
    onPress(sport);
  }, [sport, onPress]);

  return (
    <Animated.View style={[entryAnim, animatedStyle]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={0.9}
        style={[
          styles.card,
          {
            backgroundColor: accent + '0D',
            borderColor: accent + '30',
          },
        ]}
      >
        {/* Left color strip */}
        <View style={[styles.colorStrip, { backgroundColor: accent }]} />

        {/* Icon */}
        <View style={[styles.iconCircle, { backgroundColor: accent + '18' }]}>
          <Icon name="drop-fill" size={28} color={accent} />
        </View>

        {/* Text */}
        <View style={styles.cardTextWrap}>
          <Text style={styles.cardTitle}>{sport.name}</Text>
          <Text style={[styles.cardSubtitle, { color: accent }]}>
            اضغط للدخول
          </Text>
        </View>

        {/* Chevron */}
        <Icon name="arrow-right-s-line" size={24} color={accent} />
      </TouchableOpacity>
    </Animated.View>
  );
};

/* ── Main Screen ── */
export const SportSelectScreen: React.FC = () => {
  const { appName } = useBrandingStore();
  const { availableModules, setCurrentModule } = useSportModuleStore();
  const headerEntry = useAnimatedEntry(0);

  const handleSelect = useCallback(
    async (sport: SportModule) => {
      await setCurrentModule(sport);
    },
    [setCurrentModule],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerEntry]}>
          <View style={styles.logoCircle}>
            <Icon name="drop-fill" size={32} color={colors.primary} />
          </View>
          <Text style={styles.clubName}>{appName}</Text>
          <Text style={styles.subtitle}>اختر نشاطك الرياضي</Text>
        </Animated.View>

        {/* Sport Cards */}
        <View style={styles.cardList}>
          {availableModules.map((sport, index) => (
            <SportCard
              key={sport.id}
              sport={sport}
              index={index + 1}
              onPress={handleSelect}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },

  /* Header */
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  clubName: {
    fontSize: 28,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
  },

  /* Card List */
  cardList: {
    gap: spacing.md,
  },

  /* Card */
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.card,
    borderWidth: 1,
    paddingVertical: spacing.lg,
    paddingRight: spacing.md,
    paddingLeft: 0,
    overflow: 'hidden',
    ...shadows.sm,
  },
  colorStrip: {
    width: 6,
    alignSelf: 'stretch',
    borderTopLeftRadius: borderRadius.card,
    borderBottomLeftRadius: borderRadius.card,
    marginRight: spacing.md,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cardTextWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: fontFamily.bodySemiBold,
  },
});
