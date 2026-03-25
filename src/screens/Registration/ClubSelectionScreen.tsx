import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Animated,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RegistrationStackParamList } from '../../navigation/types';
import { Icon } from '../../components/common/Icon';
import { useRegistrationStore } from '../../store/registration.store';
import { useAnimatedEntry } from '../../hooks/useAnimatedEntry';
import { useAnimatedPress } from '../../hooks/useAnimatedPress';
import { getClubs, Club } from '../../api/services/registration.service';
import {
  colors,
  spacing,
  borderRadius,
  typography,
  fontFamily,
  shadows,
} from '../../theme';

type Props = NativeStackScreenProps<
  RegistrationStackParamList,
  'ClubSelection'
>;

// ── Club Card ────────────────────────────────────────────────────
const ClubCard = React.memo(
  ({
    club,
    index,
    onSelect,
  }: {
    club: Club;
    index: number;
    onSelect: (club: Club) => void;
  }) => {
    const entry = useAnimatedEntry(Math.min(index, 10));
    const press = useAnimatedPress();
    const displayName = club.display_name || club.name;
    const initial = displayName.charAt(0).toUpperCase();
    const bgColor = club.primary_color
      ? (club.primary_color.startsWith('#') ? club.primary_color : `#${club.primary_color}`)
      : colors.primary;

    return (
      <TouchableOpacity
        onPress={() => onSelect(club)}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        activeOpacity={0.7}
      >
        <Animated.View style={[styles.clubCard, entry, press.animatedStyle]}>
          <View style={[styles.clubAvatar, { backgroundColor: bgColor }]}>
            <Text style={styles.clubAvatarText}>{initial}</Text>
          </View>
          <View style={styles.clubInfo}>
            <Text style={styles.clubName} numberOfLines={1}>
              {displayName}
            </Text>
          </View>
          <Icon name="arrow-right-s-line" size={22} color={colors.textDim} />
        </Animated.View>
      </TouchableOpacity>
    );
  },
);

// ── Main Screen ──────────────────────────────────────────────────
export const ClubSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const { setClub } = useRegistrationStore();

  const [clubs, setClubs] = useState<Club[]>([]);
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const backPress = useAnimatedPress();

  // ── Fetch clubs ────────────────────────────────────────────────
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getClubs();
        setClubs(data);
        setFilteredClubs(data);
      } catch {
        setError('Failed to load clubs. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchClubs();
  }, []);

  // ── Search filter ──────────────────────────────────────────────
  useEffect(() => {
    if (!search.trim()) {
      setFilteredClubs(clubs);
    } else {
      const q = search.toLowerCase();
      setFilteredClubs(clubs.filter((c) => (c.display_name || c.name).toLowerCase().includes(q)));
    }
  }, [search, clubs]);

  // ── Select club ────────────────────────────────────────────────
  const handleSelect = useCallback(
    (club: Club) => {
      setClub(club.slug, club.display_name || club.name);
      navigation.navigate('Step1_BasicProfile');
    },
    [navigation, setClub],
  );

  // ── Render item ────────────────────────────────────────────────
  const renderItem = useCallback(
    ({ item, index }: { item: Club; index: number }) => (
      <ClubCard club={item} index={index} onSelect={handleSelect} />
    ),
    [handleSelect],
  );

  const keyExtractor = useCallback((item: Club) => String(item.id), []);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.getParent()?.goBack()}
          onPressIn={backPress.onPressIn}
          onPressOut={backPress.onPressOut}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Animated.View style={[styles.backBtn, backPress.animatedStyle]}>
            <Icon name="arrow-left-s-line" size={24} color={colors.text} />
          </Animated.View>
        </TouchableOpacity>
        <View style={styles.headerTextCol}>
          <Text style={styles.headerTitle}>Select Your Club</Text>
          <Text style={styles.headerSubtitle}>
            Choose the club you want to register with
          </Text>
        </View>
      </View>

      {/* ── Search ──────────────────────────────────────────────── */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Icon name="search-line" size={20} color={colors.textDim} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search clubs..."
            placeholderTextColor={colors.textDim}
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Icon name="close-line" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Content ─────────────────────────────────────────────── */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading clubs...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Icon name="error-warning-fill" size={48} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => {
              setIsLoading(true);
              setError(null);
              getClubs()
                .then((data) => {
                  setClubs(data);
                  setFilteredClubs(data);
                })
                .catch(() => setError('Failed to load clubs. Please try again.'))
                .finally(() => setIsLoading(false));
            }}
          >
            <Icon name="refresh-line" size={18} color={colors.white} />
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredClubs.length === 0 ? (
        <View style={styles.centerContainer}>
          <Icon name="building-2-line" size={48} color={colors.textDim} />
          <Text style={styles.emptyText}>
            {search ? 'No clubs match your search' : 'No clubs available'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredClubs}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ── Header ────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    ...typography.heading,
    color: colors.text,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },

  // ── Search ────────────────────────────────────────────────────
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 48,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: fontFamily.bodyRegular,
    color: colors.text,
    paddingVertical: 0,
  },

  // ── Club Card ─────────────────────────────────────────────────
  clubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
    ...shadows.card,
  },
  clubAvatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clubAvatarText: {
    fontSize: 20,
    fontFamily: fontFamily.headingBold,
    color: colors.white,
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    ...typography.subheading,
    color: colors.text,
  },

  // ── List ──────────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
  },

  // ── States ────────────────────────────────────────────────────
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  loadingText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  errorText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  retryBtnText: {
    ...typography.bodyMedium,
    color: colors.white,
    fontFamily: fontFamily.bodySemiBold,
  },
});
