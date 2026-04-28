import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  FlatList,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RegistrationStackParamList } from '../../navigation/types';
import { RegistrationLayout } from '../../components/features/registration/RegistrationLayout';
import { Icon, IconName } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { useRegistrationStore } from '../../store/registration.store';
import { useAnimatedPress } from '../../hooks/useAnimatedPress';
import { useAnimatedEntry } from '../../hooks/useAnimatedEntry';
import { getClubSportModules, SportModule } from '../../api/services/registration.service';
import {
  colors,
  spacing,
  borderRadius,
  typography,
  fontFamily,
} from '../../theme';

type Props = NativeStackScreenProps<
  RegistrationStackParamList,
  'Step3_SportType'
>;

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH =
  (SCREEN_WIDTH - spacing.lg * 2 - spacing.xs * 2 - spacing.sm) / 2;

// ── Sport colors cycled by index ─────────────────────────────────
const SPORT_COLORS = [
  colors.primary,
  colors.swimmer,
  colors.orange,
  colors.secondary,
  colors.teal,
  colors.warning,
];

// ── Icons cycled by index (fallback) ─────────────────────────────
const SPORT_ICONS: IconName[] = [
  'drop-fill',
  'award-fill',
  'rocket-fill',
  'football-fill',
  'user-smile-fill',
  'heart-pulse-fill',
];

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

function getSportIcon(name: string, index: number): IconName {
  const lower = name.toLowerCase();
  for (const [keyword, icon] of Object.entries(SPORT_ICON_MAP)) {
    if (lower.includes(keyword)) return icon;
  }
  return SPORT_ICONS[index % SPORT_ICONS.length];
}

// ── SportCard (inline) ──────────────────────────────────────────
function SportCard({
  sport,
  isSelected,
  onPress,
  index,
}: {
  sport: SportModule;
  isSelected: boolean;
  onPress: () => void;
  index: number;
}) {
  const entry = useAnimatedEntry(index);
  const press = useAnimatedPress();
  const color = sport.color || SPORT_COLORS[index % SPORT_COLORS.length];
  const iconName = getSportIcon(sport.name, index);

  return (
    <Animated.View style={[{ margin: spacing.xs }, entry]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.card,
            {
              width: CARD_WIDTH,
              backgroundColor: isSelected
                ? `${color}15`
                : colors.surface,
              borderColor: isSelected ? color : colors.border,
            },
            press.animatedStyle,
          ]}
        >
          {/* Color accent bar at top */}
          <View
            style={[
              styles.accentBar,
              { backgroundColor: isSelected ? color : `${color}40` },
            ]}
          />

          {/* Checkmark overlay */}
          {isSelected && (
            <View style={styles.checkmark}>
              <Icon
                name="checkbox-circle-fill"
                size={20}
                color={color}
              />
            </View>
          )}

          {/* Icon circle */}
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: isSelected ? `${color}25` : `${color}12`,
              },
            ]}
          >
            <Icon
              name={iconName}
              size={28}
              color={isSelected ? color : `${color}90`}
            />
          </View>

          <Text
            style={[
              styles.cardLabel,
              {
                color: isSelected ? color : colors.text,
                fontFamily: isSelected
                  ? fontFamily.bodySemiBold
                  : fontFamily.bodyMedium,
              },
            ]}
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

  const renderItem = ({ item, index }: { item: SportModule; index: number }) => (
    <SportCard
      sport={item}
      isSelected={selected.includes(String(item.id))}
      onPress={() => toggleSport(String(item.id))}
      index={index}
    />
  );

  // ── Loading state ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <RegistrationLayout
        currentStep={3}
        title="Choose Your Sport"
        subtitle="You can select more than one"
        onBack={() => {
          setStep(2);
          navigation.goBack();
        }}
      >
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading sports...</Text>
        </View>
      </RegistrationLayout>
    );
  }

  // ── Error state ────────────────────────────────────────────────
  if (error) {
    return (
      <RegistrationLayout
        currentStep={3}
        title="Choose Your Sport"
        subtitle="You can select more than one"
        onBack={() => {
          setStep(2);
          navigation.goBack();
        }}
      >
        <View style={styles.centerContainer}>
          <Icon name="error-warning-fill" size={48} color={colors.error} />
          <Text style={styles.errorMessage}>{error}</Text>
          <Button title="Try Again" onPress={fetchSports} variant="blue" />
        </View>
      </RegistrationLayout>
    );
  }

  const subtitleText =
    selected.length > 0
      ? `${selected.length} sport${selected.length > 1 ? 's' : ''} selected`
      : 'You can select more than one';

  return (
    <RegistrationLayout
      currentStep={3}
      title="Choose Your Sport"
      subtitle={subtitleText}
      onBack={() => {
        setStep(2);
        navigation.goBack();
      }}
      ctaTitle="Continue"
      onCtaPress={handleContinue}
    >
      <FlatList
        data={sports}
        numColumns={2}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        columnWrapperStyle={styles.columnWrapper}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Icon name="drop-fill" size={48} color={colors.textDim} />
            <Text style={styles.emptyText}>No sports available</Text>
          </View>
        }
      />

      {/* Validation error */}
      {validationError && (
        <Text style={styles.validationError}>{validationError}</Text>
      )}

    </RegistrationLayout>
  );
};

const styles = StyleSheet.create({
  // ── Card ─────────────────────────────────────────────────────
  card: {
    height: 144,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs + 2,
    paddingTop: spacing.sm,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: borderRadius.md - 2,
    borderTopRightRadius: borderRadius.md - 2,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: 12.5,
    fontFamily: fontFamily.bodyMedium,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 16,
  },
  checkmark: {
    position: 'absolute',
    top: spacing.sm + 2,
    right: spacing.sm,
    zIndex: 1,
  },

  // ── Grid ─────────────────────────────────────────────────────
  columnWrapper: {
    justifyContent: 'space-between',
  },

  // ── States ───────────────────────────────────────────────────
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.textMuted,
  },
  errorMessage: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },

  // ── Validation ───────────────────────────────────────────────
  validationError: {
    ...typography.caption,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

});
