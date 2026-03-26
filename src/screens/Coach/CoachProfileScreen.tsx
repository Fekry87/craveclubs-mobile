import React, { useState, useCallback, useEffect, useRef, useLayoutEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  RefreshControl,
  Alert,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { ErrorView } from '../../components/common/ErrorView';
import { Icon, IconName } from '../../components/common/Icon';
import { useAnimatedEntry } from '../../hooks/useAnimatedEntry';
import { useCoachProfileStore } from '../../store/coachProfile.store';
import { useCoachStore } from '../../store/coach.store';
import { useAuthStore } from '../../store/auth.store';
import {
  colors,
  spacing,
  fontFamily,
  borderRadius,
  shadows,
  gradients,
} from '../../theme';

/* ─── Info row with icon (same pattern as swimmer ProfileScreen) ─── */
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

export const CoachProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();
  const { profile, isLoading, error, isUpdating, fetchProfile, updateProfile } =
    useCoachProfileStore();
  const { dashboard, fetchDashboard } = useCoachStore();

  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editPhone, setEditPhone] = useState('');
  const [editSpecialization, setEditSpecialization] = useState('');
  const [editBio, setEditBio] = useState('');

  // Animated entries for sections (same pattern as swimmer ProfileScreen)
  const coachInfoEntry = useAnimatedEntry(1);
  const statsEntry = useAnimatedEntry(2);
  const groupsEntry = useAnimatedEntry(3);
  const clubEntry = useAnimatedEntry(4);

  // Spring animation for avatar (same as swimmer ProfileHeader)
  const avatarScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(avatarScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [avatarScale]);

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

  // Sign-out icon in the top-right header (same pattern as swimmer ProfileScreen)
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={handleLogout}
          style={s.headerLogout}
          activeOpacity={0.7}
          disabled={loggingOut}
        >
          <Icon
            name="logout-box-r-line"
            size={22}
            color={colors.textMuted}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, handleLogout, loggingOut]);

  // Fetch profile & dashboard when tab is focused
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      fetchDashboard();
      // eslint-disable-next-line -- run on focus only
    }, []),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchProfile(), fetchDashboard()]);
    setRefreshing(false);
  }, [fetchProfile, fetchDashboard]);

  const handleEditPress = useCallback(() => {
    setEditPhone(profile?.profile?.phone ?? '');
    setEditSpecialization(profile?.profile?.specialization ?? '');
    setEditBio(profile?.profile?.bio ?? '');
    setIsEditing(true);
  }, [profile]);

  const handleSave = useCallback(async () => {
    await updateProfile({
      phone: editPhone || null,
      specialization: editSpecialization || null,
      bio: editBio || null,
    });
    setIsEditing(false);
  }, [editPhone, editSpecialization, editBio, updateProfile]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  if (!user)
    return <ErrorView message="User not found." onRetry={fetchProfile} />;
  if (error && !profile)
    return (
      <ErrorView
        message={error || 'Failed to load profile.'}
        onRetry={fetchProfile}
      />
    );
  if (!profile) return <Loader message="Loading profile..." />;

  const firstName = user.name.split(' ')[0] || 'Coach';
  const lastName = user.name.split(' ').slice(1).join(' ') || '';
  const initials = `${firstName.charAt(0)}${(lastName || 'C').charAt(0)}`.toUpperCase();

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {/* ═══ Profile Header Card (same layout as swimmer ProfileHeader) ═══ */}
      <Card>
        <View style={s.headerContent}>
          <Animated.View style={[s.avatarWrapper, { transform: [{ scale: avatarScale }] }]}>
            <LinearGradient
              colors={[...gradients.avatar]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.avatar}
            >
              <Text style={s.avatarText}>{initials}</Text>
            </LinearGradient>
          </Animated.View>
          <View style={s.headerInfo}>
            <View style={s.nameRow}>
              <Text style={s.userName} numberOfLines={1}>
                {firstName} {lastName}
              </Text>
              <View style={s.roleBadge}>
                <Text style={s.roleBadgeText}>Coach</Text>
              </View>
            </View>
            <Text style={s.userEmail} numberOfLines={1}>{user.email}</Text>
          </View>
        </View>
      </Card>

      {/* ═══ Coach Info Section ═══ */}
      <Animated.View style={coachInfoEntry}>
        <View style={s.sectionHeader}>
          <Icon name="user-settings-fill" size={16} color={colors.primary} />
          <Text style={s.sectionTitle}>Coach Info</Text>
          <View style={s.sectionHeaderSpacer} />
          {isEditing ? (
            <TouchableOpacity
              onPress={handleCancelEdit}
              style={s.editButton}
              activeOpacity={0.7}
            >
              <Icon name="close-line" size={16} color={colors.error} />
              <Text style={s.editButtonTextCancel}>Cancel</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleEditPress}
              style={s.editButton}
              activeOpacity={0.7}
            >
              <Icon name="edit-line" size={16} color={colors.primary} />
              <Text style={s.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {isEditing ? (
          <Card>
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>Phone</Text>
              <TextInput
                style={s.textInput}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="Enter phone number"
                placeholderTextColor={colors.textDim}
                keyboardType="phone-pad"
              />
            </View>
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>Specialization</Text>
              <TextInput
                style={s.textInput}
                value={editSpecialization}
                onChangeText={setEditSpecialization}
                placeholder="Enter specialization"
                placeholderTextColor={colors.textDim}
              />
            </View>
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>Bio</Text>
              <TextInput
                style={[s.textInput, s.textInputMultiline]}
                value={editBio}
                onChangeText={setEditBio}
                placeholder="Write a short bio"
                placeholderTextColor={colors.textDim}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            <Button
              title="Save Changes"
              variant="primary"
              onPress={handleSave}
              loading={isUpdating}
              disabled={isUpdating}
              style={s.saveButton}
            />
          </Card>
        ) : (
          <Card>
            <InfoRow
              icon="phone-fill"
              iconColor={colors.swimmer}
              iconBg={colors.swimmerDim}
              label="Phone"
              value={profile?.profile?.phone || 'Not set'}
            />
            <InfoRow
              icon="award-fill"
              iconColor={colors.orange}
              iconBg={colors.orangeDim}
              label="Specialization"
              value={profile?.profile?.specialization || 'Not set'}
            />
            <InfoRow
              icon="file-list-fill"
              iconColor={colors.secondary}
              iconBg={colors.secondaryDim}
              label="Bio"
              value={profile?.profile?.bio || 'Not set'}
              isLast
            />
          </Card>
        )}
      </Animated.View>

      {/* ═══ Quick Stats Section ═══ */}
      <Animated.View style={statsEntry}>
        <View style={s.sectionHeader}>
          <Icon name="bar-chart-box-fill" size={16} color={colors.orange} />
          <Text style={s.sectionTitle}>Quick Stats</Text>
        </View>
        <Card>
          <InfoRow
            icon="calendar-event-fill"
            iconColor={colors.primary}
            iconBg={colors.primaryDim}
            label="Today's Sessions"
            value={String(dashboard?.stats?.today_count ?? 0)}
          />
          <InfoRow
            icon="fire-fill"
            iconColor={colors.error}
            iconBg={colors.errorDim}
            label="Live Now"
            value={String(dashboard?.stats?.live_count ?? 0)}
          />
          <InfoRow
            icon="time-fill"
            iconColor={colors.secondary}
            iconBg={colors.secondaryDim}
            label="Upcoming"
            value={String(dashboard?.stats?.upcoming_count ?? 0)}
            isLast
          />
        </Card>
      </Animated.View>

      {/* ═══ My Groups Section ═══ */}
      <Animated.View style={groupsEntry}>
        <View style={s.sectionHeader}>
          <Icon name="team-fill" size={16} color={colors.swimmer} />
          <Text style={s.sectionTitle}>My Groups</Text>
        </View>
        <Card>
          {dashboard?.groups && dashboard.groups.length > 0 ? (
            dashboard.groups.map((group, idx) => (
              <InfoRow
                key={group.id}
                icon="group-fill"
                iconColor={colors.teal}
                iconBg={colors.tealDim}
                label={`${group.swimmers_count} swimmer${group.swimmers_count !== 1 ? 's' : ''}`}
                value={group.name}
                isLast={idx === dashboard.groups.length - 1}
              />
            ))
          ) : (
            <InfoRow
              icon="group-fill"
              iconColor={colors.textDim}
              iconBg={colors.surfaceLight}
              label="Groups"
              value="No groups assigned"
              isLast
            />
          )}
        </Card>
      </Animated.View>

      {/* ═══ Club Section ═══ */}
      <Animated.View style={clubEntry}>
        <View style={s.sectionHeader}>
          <Icon name="building-2-fill" size={16} color={colors.teal} />
          <Text style={s.sectionTitle}>Club</Text>
        </View>
        <Card>
          <InfoRow
            icon="building-2-fill"
            iconColor={colors.teal}
            iconBg={colors.tealDim}
            label="Club Name"
            value={user.club?.name ?? 'Unknown'}
            isLast
          />
        </Card>
      </Animated.View>
    </ScrollView>
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

  /* Header logout icon */
  headerLogout: {
    padding: spacing.sm,
    marginRight: spacing.xs,
  },

  /* ── Profile Header Card (matches swimmer ProfileHeader) ── */
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarWrapper: {
    ...shadows.sm,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontFamily: fontFamily.headingBold,
    color: colors.white,
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.swimmer,
  },
  roleBadgeText: {
    fontSize: 11,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.white,
  },
  userEmail: {
    fontSize: 13,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
  },

  /* ── Section headers (matches swimmer ProfileScreen pattern) ── */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },
  sectionHeaderSpacer: {
    flex: 1,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.primary,
  },
  editButtonTextCancel: {
    fontSize: 14,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.error,
  },

  /* ── Info row ── */
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

  /* ── Edit form inputs ── */
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  textInput: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
    fontFamily: fontFamily.bodyRegular,
    color: colors.text,
  },
  textInputMultiline: {
    minHeight: 100,
    paddingTop: spacing.sm + 2,
  },
  saveButton: {
    marginTop: spacing.sm,
  },
});
