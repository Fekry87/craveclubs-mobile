import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RegistrationStackParamList } from '../../navigation/types';
import { RegistrationLayout } from '../../components/features/registration/RegistrationLayout';
import { StepStatus } from '../../components/features/registration/StepStatus';
import { FieldError } from '../../components/features/registration/SectionLabel';
import { Icon, IconName } from '../../components/common/Icon';
import { useRegistrationStore } from '../../store/registration.store';
import { useAnimatedPress } from '../../hooks/useAnimatedPress';
import { useAnimatedEntry } from '../../hooks/useAnimatedEntry';
import { getClubSportModules, SportModule } from '../../api/services/registration.service';
import { colors, spacing, borderRadius, fontFamily } from '../../theme';

type Props = NativeStackScreenProps<
  RegistrationStackParamList,
  'Step3_SportType'
>;

const GRID_GAP = spacing.sm + 4;

// ── Keyword → icon mapping for common sport names ────────────────
const SPORT_ICON_MAP: Record<string, IconName> = {
  swim: 'drop-fill',
  free: 'drop-fill',
  compet: 'award-fill',
  div: 'rocket-fill',
  polo: 'football-fill',
  kid: 'user-smile-fill',
  aqua: 'heart-pulse-fill',
  fitness: 'heart-pulse-fill',
  water: 'water-flash-fill',
};

const FALLBACK_ICONS: IconName[] = [
  'drop-fill',
  'award-fill',
  'rocket-fill',
  'football-fill',
  'user-smile-fill',
  'heart-pulse-fill',
];

function getSportIcon(name: string, index: number): IconName {
  const lower = name.toLowerCase();
  for (const [keyword, icon] of Object.entries(SPORT_ICON_MAP)) {
    if (lower.includes(keyword)) return icon;
  }
  return FALLBACK_ICONS[index % FALLBACK_ICONS.length];
}

// ── SportCard (inline) ──────────────────────────────────────────
// One accent for selection — the club's — instead of a rainbow of per-card
// colors with accent bars, so the grid reads as a single choice.
function SportCard({
  sport,
  isSelected,
  onPress,
  index,
  width,
}: {
  sport: SportModule;
  isSelected: boolean;
  onPress: () => void;
  index: number;
  width: number;
}) {
  const entry = useAnimatedEntry(Math.min(index, 10));
  const press = useAnimatedPress();

  return (
    <Animated.View style={[{ width }, entry]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        activeOpacity={0.85}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected }}
        accessibilityLabel={sport.name}
      >
        <Animated.View
          style={[
            styles.card,
            isSelected && [
              styles.cardSelected,
              { borderColor: colors.primary, backgroundColor: colors.primaryDim },
            ],
            press.animatedStyle,
          ]}
        >
          <View style={styles.check}>
            <Icon
              name={isSelected ? 'checkbox-circle-fill' : 'checkbox-blank-circle-line'}
              size={20}
              color={isSelected ? colors.primary : colors.textDim}
            />
          </View>
          <View
            style={[
              styles.iconTile,
              { backgroundColor: isSelected ? colors.white : colors.surfaceLight },
            ]}
          >
            <Icon
              name={getSportIcon(sport.name, index)}
              size={26}
              color={isSelected ? colors.primary : colors.textMuted}
            />
          </View>
          <Text
            style={[styles.cardLabel, isSelected && { color: colors.primary }]}
            numberOfLines={2}
          >
            {sport.name}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Main Screen ─────────────────────────────────────────────────
export const Step3_SportType: React.FC<Props> = ({ navigation }) => {
  const { sportIds, setSportIds, setStep } = useRegistrationStore();
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = (screenWidth - spacing.lg * 2 - GRID_GAP) / 2;

  // ── State ──────────────────────────────────────────────────────
  const [sports, setSports] = useState<SportModule[]>([]);
  const [selected, setSelected] = useState<string[]>(sportIds);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // ── Fetch sport modules ────────────────────────────────────────
  const fetchSports = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getClubSportModules();
      setSports(data);
    } catch {
      setError('Failed to load sports. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSports();
  }, [fetchSports]);

  // ── Toggle logic ─────────────────────────────────────────────
  const toggleSport = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : [...prev, id],
    );
    if (validationError) setValidationError(null);
  };

  // ── Submit ───────────────────────────────────────────────────
  const handleContinue = () => {
    if (selected.length === 0) {
      setValidationError('Please select at least one sport');
      return;
    }
    setSportIds(selected);
    setStep(4);
    navigation.navigate('Step4_ExperienceLevel');
  };

  const onBack = () => {
    setStep(2);
    navigation.goBack();
  };

  const subtitleText =
    selected.length > 0
      ? `${selected.length} selected`
      : 'You can choose more than one';

  return (
    <RegistrationLayout
      currentStep={3}
      title="Choose your sport"
      subtitle={subtitleText}
      onBack={onBack}
      ctaTitle={isLoading || error ? undefined : 'Continue'}
      onCtaPress={handleContinue}
    >
      {isLoading ? (
        <StepStatus kind="loading" message="Loading sports…" />
      ) : error ? (
        <StepStatus kind="error" message={error} onRetry={fetchSports} />
      ) : sports.length === 0 ? (
        <StepStatus
          kind="empty"
          icon="drop-line"
          title="No sports yet"
          message="This club hasn't added any sports. Please check with the club."
        />
      ) : (
        <View style={styles.grid}>
          {sports.map((item, index) => (
            <SportCard
              key={item.id}
              sport={item}
              width={cardWidth}
              isSelected={selected.includes(String(item.id))}
              onPress={() => toggleSport(String(item.id))}
              index={index}
            />
          ))}
        </View>
      )}

      <FieldError message={validationError} />
    </RegistrationLayout>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  card: {
    minHeight: 132,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  cardSelected: {
    borderWidth: 1.5,
    padding: spacing.md - 0.5,
  },
  check: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  iconTile: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: 14,
    lineHeight: 19,
    fontFamily: fontFamily.bodyMedium,
    color: colors.text,
    marginTop: spacing.sm + 2,
    textAlign: 'center',
  },
});
