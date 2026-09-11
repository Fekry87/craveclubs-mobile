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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/common/Icon';
import { useBrandingStore } from '../../store/branding.store';
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

/* ── Club Card ── */
const ClubCard = React.memo(
  ({
    club,
    index,
    onSelect,
    busy,
  }: {
    club: Club;
    index: number;
    onSelect: (club: Club) => void;
    busy: boolean;
  }) => {
    const entry = useAnimatedEntry(Math.min(index, 10));
    const press = useAnimatedPress();
    const displayName = club.display_name || club.name;
    const initial = displayName.charAt(0).toUpperCase();
    const bgColor = club.primary_color
      ? club.primary_color.startsWith('#')
        ? club.primary_color
        : `#${club.primary_color}`
      : colors.primary;
    const logo = (club as Club & { logo_url?: string | null }).logo_url;

    return (
      <TouchableOpacity
        onPress={() => onSelect(club)}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        activeOpacity={0.7}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel={displayName}
      >
        <Animated.View style={[styles.clubCard, entry, press.animatedStyle]}>
          <View style={[styles.clubAvatar, { backgroundColor: bgColor }]}>
            {logo ? (
              <Image source={{ uri: logo }} style={styles.clubAvatarImg} resizeMode="cover" />
            ) : (
              <Text style={styles.clubAvatarText}>{initial}</Text>
            )}
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

/**
 * ClubListScreen — the first screen of the shared build. The swimmer picks
 * their club here; selecting one sets the branding slug (so login/register
 * become club-branded) and RootNavigator advances to the login screen.
 */
export const ClubListScreen: React.FC = () => {
  const setSlug = useBrandingStore((s) => s.setSlug);
  const setClub = useRegistrationStore((s) => s.setClub);

  const [clubs, setClubs] = useState<Club[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectingId, setSelectingId] = useState<number | null>(null);

  const fetchClubs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getClubs();
      setClubs(data);
    } catch {
      setError('Failed to load clubs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClubs();
  }, [fetchClubs]);

  const filtered = search.trim()
    ? clubs.filter((c) =>
        (c.display_name || c.name).toLowerCase().includes(search.toLowerCase()),
      )
    : clubs;

  const handleSelect = useCallback(
    async (club: Club) => {
      setSelectingId(club.id);
      setClub(club.slug, club.display_name || club.name);
      try {
        // Awaits branding fetch too, so login shows the club's name/logo/colors.
        await setSlug(club.slug);
        // No navigation call needed — RootNavigator switches to the login
        // screen once branding is resolved.
      } catch {
        setError('Could not select that club. Please try again.');
        setSelectingId(null);
      }
    },
    [setClub, setSlug],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Club; index: number }) => (
      <ClubCard
        club={item}
        index={index}
        onSelect={handleSelect}
        busy={selectingId !== null}
      />
    ),
    [handleSelect, selectingId],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={[styles.mark, { backgroundColor: colors.primary }]}>
          <Text style={styles.markText}>CC</Text>
        </View>
        <Text style={styles.title}>Choose your club</Text>
        <Text style={styles.subtitle}>
          Select your club to sign in or create an account
        </Text>
      </View>

      {/* ── Search ── */}
      {clubs.length > 4 && (
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
              autoCapitalize="none"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Icon name="close-line" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* ── Content ── */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading clubs...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Icon name="error-warning-fill" size={48} color={colors.error} />
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchClubs}>
            <Icon name="refresh-line" size={18} color={colors.white} />
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centerContainer}>
          <Icon name="building-2-line" size={48} color={colors.textDim} />
          <Text style={styles.stateText}>
            {search ? 'No clubs match your search' : 'No clubs available'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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

  header: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  mark: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  markText: {
    fontSize: 22,
    fontFamily: fontFamily.headingHeavy,
    color: colors.white,
    letterSpacing: 1,
  },
  title: {
    ...typography.heading,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    paddingTop: spacing.sm,
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
    overflow: 'hidden',
  },
  clubAvatarImg: {
    width: '100%',
    height: '100%',
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

  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
  },

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
  stateText: {
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
