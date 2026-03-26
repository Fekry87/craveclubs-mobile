import React, { useState, useCallback, useLayoutEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  RefreshControl,
  Alert,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Card } from '../../components/common/Card';
import { Loader } from '../../components/common/Loader';
import { ErrorView } from '../../components/common/ErrorView';
import { Icon, IconName } from '../../components/common/Icon';
import { NotificationBell } from '../../components/common/NotificationBell';
import { ProfileHeader } from '../../components/features/profile/ProfileHeader';
import { DeleteAccountSheet } from '../../components/features/profile/DeleteAccountSheet';
import { useAnimatedEntry } from '../../hooks/useAnimatedEntry';
import { useAuthStore } from '../../store/auth.store';
import { progressService } from '../../api/services/progress.service';
import { DashboardResponseType } from '../../types/api.types';
import { formatDate } from '../../utils/formatters';
import { colors, spacing, fontFamily, borderRadius, shadows } from '../../theme';

/* ─── Info row with icon ─── */
interface InfoRowProps {
  icon: IconName;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  isLast?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({
  icon,
  iconColor,
  iconBg,
  label,
  value,
  isLast = false,
}) => (
  <View style={[s.infoRow, isLast && s.infoRowLast]}>
    <View style={[s.infoIcon, { backgroundColor: iconBg }]}>
      <Icon name={icon} size={16} color={iconColor} />
    </View>
    <View style={s.infoContent}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  </View>
);

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();
  const [dashboard, setDashboard] = useState<DashboardResponseType | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [deleteSheetVisible, setDeleteSheetVisible] = useState(false);

  const personalEntry = useAnimatedEntry(1);
  const guardianEntry = useAnimatedEntry(2);
  const clubEntry = useAnimatedEntry(3);

  const handleLogout = useCallback(() => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          await logout();
        },
      },
    ]);
  }, [logout]);

  // Header right: bell + delete + logout
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={s.headerRightRow}>
          <NotificationBell />
          <TouchableOpacity
            onPress={() => setDeleteSheetVisible(true)}
            style={s.headerIconBtn}
            activeOpacity={0.7}
          >
            <Icon name="delete-bin-6-line" size={22} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleLogout}
            style={s.headerIconBtn}
            activeOpacity={0.7}
            disabled={loggingOut}
          >
            <Icon
              name="logout-box-r-line"
              size={22}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, handleLogout, loggingOut]);

  const fetchProfile = useCallback(async () => {
    try {
      setError(null);
      const data = await progressService.getDashboard();
      setDashboard(data);
    } catch {
      setError('Failed to load profile.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      // eslint-disable-next-line -- run on focus only
    }, []),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfile();
  }, [fetchProfile]);

  if (isLoading) return <Loader message="Loading profile..." />;
  if (error || !user)
    return (
      <ErrorView
        message={error || 'User not found.'}
        onRetry={fetchProfile}
      />
    );

  const profile = dashboard?.profile;

  return (
  <>
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <ProfileHeader user={user} profile={profile} />

      {/* ═══ Personal Info ═══ */}
      {profile && (
        <Animated.View style={personalEntry}>
          <View style={s.sectionHeader}>
            <Icon name="user-fill" size={16} color={colors.primary} />
            <Text style={s.sectionTitle}>Personal Info</Text>
          </View>
          <Card style={s.infoCard}>
            {profile.date_of_birth && (
              <InfoRow
                icon="cake-2-fill"
                iconColor={colors.orange}
                iconBg={colors.orangeDim}
                label="Date of Birth"
                value={formatDate(profile.date_of_birth)}
              />
            )}
            {profile.level && (
              <InfoRow
                icon="shield-user-fill"
                iconColor={colors.swimmer}
                iconBg={colors.swimmerDim}
                label="Level"
                value={profile.level}
                isLast={!profile.date_of_birth}
              />
            )}
            {/* Mark the actual last item */}
            {profile.level && profile.date_of_birth && (
              <View />
            )}
          </Card>
        </Animated.View>
      )}

      {/* ═══ Guardian Info ═══ */}
      {profile?.guardian_name && (
        <Animated.View style={guardianEntry}>
          <View style={s.sectionHeader}>
            <Icon name="hand-heart-fill" size={16} color={colors.secondary} />
            <Text style={s.sectionTitle}>Guardian Info</Text>
          </View>
          <Card style={s.infoCard}>
            <InfoRow
              icon="user-fill"
              iconColor={colors.secondary}
              iconBg={colors.secondaryDim}
              label="Name"
              value={profile.guardian_name}
            />
            {profile.guardian_phone && (
              <InfoRow
                icon="phone-fill"
                iconColor={colors.swimmer}
                iconBg={colors.swimmerDim}
                label="Phone"
                value={profile.guardian_phone}
              />
            )}
            {profile.guardian_email && (
              <InfoRow
                icon="mail-fill"
                iconColor={colors.primary}
                iconBg={colors.primaryDim}
                label="Email"
                value={profile.guardian_email}
                isLast
              />
            )}
          </Card>
        </Animated.View>
      )}

      {/* ═══ Club Info ═══ */}
      <Animated.View style={clubEntry}>
        <View style={s.sectionHeader}>
          <Icon name="building-2-fill" size={16} color={colors.teal} />
          <Text style={s.sectionTitle}>Club</Text>
        </View>
        <Card style={s.infoCard}>
          <InfoRow
            icon="building-2-fill"
            iconColor={colors.teal}
            iconBg={colors.tealDim}
            label="Club Name"
            value={user.club.name}
            isLast
          />
        </Card>
      </Animated.View>
    </ScrollView>

    <DeleteAccountSheet
      visible={deleteSheetVisible}
      onClose={() => setDeleteSheetVisible(false)}
    />
  </>
  );
};

/* ─── Styles ─── */
const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },

  /* Header right row — bell + delete + logout */
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  /* Header icon button — matches NotificationBell sizing */
  headerIconBtn: {
    marginRight: spacing.sm,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Section headers */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },

  /* Info cards */
  infoCard: {},

  /* Info row with icon */
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },
});
