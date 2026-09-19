import React, { useState, useCallback, useContext, useLayoutEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  RefreshControl,
  Alert,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../../types/navigation.types';
import { Card } from '../../components/common/Card';
import { Loader } from '../../components/common/Loader';
import { ErrorView } from '../../components/common/ErrorView';
import { Icon } from '../../components/common/Icon';
import { InfoRow } from '../../components/common/InfoRow';
import { NotificationBell } from '../../components/common/NotificationBell';
import { ProfileHeader } from '../../components/features/profile/ProfileHeader';
import { DeleteAccountSheet } from '../../components/features/profile/DeleteAccountSheet';
import { LanguageSheet } from '../../components/features/profile/LanguageSheet';
import { StatCard } from '../../components/features/progress/StatCard';
import { useAnimatedEntry } from '../../hooks/useAnimatedEntry';
import { useAuthStore } from '../../store/auth.store';
import { useProfileStore } from '../../store/profile.store';
import { useBrandingStore } from '../../store/branding.store';
import { useLanguageStore } from '../../store/language.store';
import { SwimmerSubscriptionInterface } from '../../types/api.types';
import { trainingTypeLabel } from '../../utils/trainingTypes';
import { formatMediumDate, formatMoney, formatPercentage, formatRating, getInitials } from '../../utils/formatters';
import { pickProfilePhoto, showPhotoMenu } from '../../utils/photo';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { colors, spacing, fontFamily, borderRadius } from '../../theme';
import { GLASS_TABBAR_CONTENT_INSET } from '../../components/common/GlassTabBar/styles';

/* ─── Section title ─── */
const SectionTitle: React.FC<{ children: string }> = ({ children }) => (
  <Text style={s.sectionTitle}>{children}</Text>
);

/* ─── Subscription helpers ─── */
const subscriptionTone = (status: SwimmerSubscriptionInterface['status']) => {
  switch (status) {
    case 'expired':
      return { bg: colors.errorDim, fg: colors.error, label: 'Expired' };
    case 'expiring':
      return { bg: colors.warningDim, fg: colors.warningDark, label: 'Expiring soon' };
    default:
      return { bg: colors.swimmerDim, fg: colors.swimmerDark, label: 'Active' };
  }
};

const daysLeftLabel = (days: number): string => {
  if (days < 0) return `Expired ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`;
  if (days === 0) return 'Ends today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
};

const openUrl = (url: string) => {
  Linking.openURL(url).catch(() => {
    Alert.alert('Unavailable', 'This action is not supported on your device.');
  });
};

const titleCase = (v: string) =>
  v.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const ProfileScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  // Manager opens this as a tab (floating bar overlays it → needs clearance);
  // the swimmer opens it as a pushed screen with no bar (normal padding).
  const underTabBar = useContext(BottomTabBarHeightContext) != null;
  const bottomInset = underTabBar ? GLASS_TABBAR_CONTENT_INSET : spacing.xl;
  const { t } = useTranslation('profile');
  const { user, logout } = useAuthStore();
  const { data, isLoading, error, fetchProfile, setPhoto } = useProfileStore();
  const branding = useBrandingStore((st) => st.branding);
  const language = useLanguageStore((st) => st.language);
  const [refreshing, setRefreshing] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [deleteSheetVisible, setDeleteSheetVisible] = useState(false);
  const [languageSheetVisible, setLanguageSheetVisible] = useState(false);

  const subscriptionEntry = useAnimatedEntry(1);
  const statsEntry = useAnimatedEntry(2);
  const coachEntry = useAnimatedEntry(3);
  const trainingEntry = useAnimatedEntry(4);
  const personalEntry = useAnimatedEntry(5);
  const guardianEntry = useAnimatedEntry(6);
  const clubEntry = useAnimatedEntry(7);

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

  /* ─── Profile photo: shown everywhere the swimmer appears, so changing it here
     changes it for the coach and the club too ─── */
  const applyPhoto = useCallback(
    async (dataUrl: string | null) => {
      setPhotoBusy(true);
      try {
        await setPhoto(dataUrl);
      } catch {
        Alert.alert(
          dataUrl ? 'Photo not saved' : 'Photo not removed',
          "We couldn't update your photo. Check your connection and try again.",
        );
      } finally {
        setPhotoBusy(false);
      }
    },
    [setPhoto],
  );

  const handleChangePhoto = useCallback(() => {
    showPhotoMenu({
      canRemove: !!data?.profile.avatar_url,
      onPick: async (source) => {
        const picked = await pickProfilePhoto(source);
        if (picked) await applyPhoto(picked.dataUrl);
      },
      onRemove: () => {
        Alert.alert('Remove photo?', 'Your initials will be shown instead.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: () => applyPhoto(null) },
        ]);
      },
    });
  }, [data?.profile.avatar_url, applyPhoto]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={s.headerRightRow}>
          <NotificationBell />
          <TouchableOpacity
            onPress={() => setDeleteSheetVisible(true)}
            style={s.headerIconBtn}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Delete account"
          >
            <Icon name="delete-bin-6-line" size={22} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleLogout}
            style={s.headerIconBtn}
            activeOpacity={0.7}
            disabled={loggingOut}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
          >
            <Icon name="logout-box-r-line" size={22} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, handleLogout, loggingOut]);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      // eslint-disable-next-line react-hooks/exhaustive-deps -- store action is stable
    }, []),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  }, [fetchProfile]);

  if (isLoading && !data) return <Loader message="Loading profile..." />;
  if ((error && !data) || !user) {
    return <ErrorView message={error || 'User not found.'} onRetry={fetchProfile} />;
  }
  if (!data) return <ErrorView message="No profile data." onRetry={fetchProfile} />;

  const { profile, subscription, coach, groups, branch, signup, xp, stats } = data;
  const tone = subscription ? subscriptionTone(subscription.status) : null;
  const groupNames = groups.map((g) => g.name).join(', ');
  const scheduleParts = [signup?.preferred_time, signup?.weekly_frequency].filter(Boolean);

  return (
    <>
      <ScrollView
        style={s.container}
        contentContainerStyle={[s.content, { paddingBottom: bottomInset }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <ProfileHeader user={user} profile={profile} onChangePhoto={handleChangePhoto} photoBusy={photoBusy} />

        {/* ═══ Subscription ═══ */}
        {subscription && tone && (
          <Animated.View style={[s.section, subscriptionEntry]}>
            <Card>
              <View style={s.subHeader}>
                <View style={s.subTitleRow}>
                  <View style={[s.subIcon, { backgroundColor: colors.primaryDim }]}>
                    <Icon name="vip-crown-fill" size={18} color={colors.primary} />
                  </View>
                  <View style={s.flex1}>
                    <Text style={s.subPlan} numberOfLines={1}>
                      {subscription.plan_name}
                    </Text>
                    <Text style={s.subMeta}>
                      {[
                        trainingTypeLabel(subscription.training_type),
                        `${subscription.duration_months}-month plan`,
                        `ends ${formatMediumDate(subscription.ends_at)}`,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                    {/* amount_paid, not the plan's current price: this is what this member
                        was actually billed, so editing the plan later cannot rewrite it. */}
                    <Text style={s.subPaid}>
                      {formatMoney(subscription.amount_paid)}
                      {subscription.discount_percent > 0 && (
                        ` · ${subscription.discount_percent}% off`
                      )}
                    </Text>
                  </View>
                </View>
                <View style={[s.pill, { backgroundColor: tone.bg }]}>
                  <Text style={[s.pillText, { color: tone.fg }]}>{tone.label}</Text>
                </View>
              </View>

              <View style={s.progressTrack}>
                <View
                  style={[
                    s.progressFill,
                    {
                      width: `${Math.min(100, Math.max(0, subscription.progress))}%`,
                      backgroundColor: subscription.status === 'active' ? colors.primary : tone.fg,
                    },
                  ]}
                />
              </View>

              <View style={s.subFooter}>
                <Text style={[s.subDays, { color: tone.fg }]}>
                  {daysLeftLabel(subscription.days_left)}
                </Text>
                <Text style={s.subStarted}>
                  Since {formatMediumDate(subscription.started_at)}
                </Text>
              </View>

              {subscription.status !== 'active' && (
                <View style={[s.subNotice, { backgroundColor: tone.bg }]}>
                  <Icon name="information-line" size={16} color={tone.fg} />
                  <Text style={[s.subNoticeText, { color: tone.fg }]}>
                    {subscription.status === 'expired'
                      ? 'Your plan has ended — contact your club to renew and keep training.'
                      : 'Renew with your club before it ends to avoid a break in training.'}
                  </Text>
                </View>
              )}
            </Card>
          </Animated.View>
        )}

        {/* ═══ Progress snapshot ═══ */}
        <Animated.View style={[s.section, statsEntry]}>
          <SectionTitle>{t('sections.myProgress')}</SectionTitle>
          <View style={s.statsRow}>
            <StatCard
              icon="flashlight-fill"
              value={xp.total_xp.toLocaleString()}
              label={`XP · Rank #${xp.rank} of ${xp.total_swimmers}`}
              color="primary"
              index={0}
            />
            <StatCard
              icon="checkbox-circle-fill"
              value={formatPercentage(stats.attendance_rate)}
              label={`Attendance · ${stats.sessions_attended}/${stats.total_sessions}`}
              color="success"
              index={1}
            />
          </View>
          <View style={s.statsRow}>
            <StatCard
              icon="star-fill"
              value={formatRating(stats.average_rating)}
              label={`Avg rating · ${stats.evaluation_count} reviews`}
              color="warning"
              index={2}
            />
            <StatCard
              icon="fire-fill"
              value={xp.current_streak.toString()}
              label={xp.current_streak === 1 ? 'Session streak' : 'Sessions streak'}
              color="swimmer"
              index={3}
            />
          </View>
          <View style={s.levelRow}>
            <View style={[s.levelDot, { backgroundColor: xp.level.color }]} />
            <Text style={s.levelText}>
              Level {xp.level.level} · {xp.level.name}
              {xp.level.next_level_name
                ? ` · ${xp.level.xp_to_next} XP to ${xp.level.next_level_name}`
                : ' · Max level'}
            </Text>
          </View>
        </Animated.View>

        {/* ═══ My coach ═══ */}
        {coach && (
          <Animated.View style={[s.section, coachEntry]}>
            <SectionTitle>{t('sections.myCoach')}</SectionTitle>
            <Card>
              <View style={s.coachRow}>
                <View style={[s.coachAvatar, { backgroundColor: colors.primaryDim }]}>
                  <Text style={[s.coachInitials, { color: colors.primary }]}>
                    {getInitials(coach.name.split(' ')[0], coach.name.split(' ')[1] ?? 'C')}
                  </Text>
                </View>
                <View style={s.flex1}>
                  <Text style={s.coachName} numberOfLines={1}>{coach.name}</Text>
                  <Text style={s.coachMeta} numberOfLines={2}>
                    {[
                      coach.specialization,
                      coach.experience_years ? `${coach.experience_years} yrs experience` : null,
                      groupNames ? `Coaches ${groupNames}` : null,
                    ]
                      .filter(Boolean)
                      .join(' · ') || 'Your assigned coach'}
                  </Text>
                  {coach.rating !== null && (
                    <View style={s.coachRating}>
                      <Icon name="star-fill" size={13} color={colors.warning} />
                      <Text style={s.coachRatingText}>{coach.rating.toFixed(1)}</Text>
                    </View>
                  )}
                </View>
                {coach.phone && (
                  <TouchableOpacity
                    style={[s.callBtn, { backgroundColor: colors.primary }]}
                    onPress={() => openUrl(`tel:${coach.phone}`)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={`Call ${coach.name}`}
                  >
                    <Icon name="phone-fill" size={18} color={colors.white} />
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          </Animated.View>
        )}

        {/* ═══ Training ═══ */}
        <Animated.View style={[s.section, trainingEntry]}>
          <SectionTitle>{t('sections.training')}</SectionTitle>
          <Card>
            {groupNames ? (
              <InfoRow icon="group-fill" label={t('rows.group')} value={groupNames} />
            ) : null}
            {branch && (
              <InfoRow
                icon="map-pin-fill"
                label={t('rows.branch')}
                value={branch.name}
                hint={[branch.address, branch.city].filter(Boolean).join(', ')}
                onPress={() =>
                  openUrl(
                    `https://maps.apple.com/?q=${encodeURIComponent(`${branch.name}, ${branch.address}, ${branch.city}`)}`,
                  )
                }
              />
            )}
            {branch?.working_hours ? (
              <InfoRow icon="time-fill" label={t('rows.poolHours')} value={branch.working_hours} />
            ) : null}
            {profile.level && (
              <InfoRow icon="shield-user-fill" label={t('rows.level')} value={profile.level} />
            )}
            {scheduleParts.length > 0 && (
              <InfoRow icon="calendar-event-fill" label={t('rows.mySchedule')} value={scheduleParts.join(' · ')} />
            )}
            {signup?.primary_goal && (
              <InfoRow icon="flag-fill" label={t('rows.myGoal')} value={signup.primary_goal} />
            )}
            <InfoRow
              icon="medal-fill"
              label={t('rows.memberSince')}
              value={data.member_since ? formatMediumDate(data.member_since) : '—'}
              isLast
            />
          </Card>
        </Animated.View>

        {/* ═══ Personal ═══ */}
        <Animated.View style={[s.section, personalEntry]}>
          <SectionTitle>{t('sections.personal')}</SectionTitle>
          <Card>
            {profile.date_of_birth && (
              <InfoRow icon="cake-2-fill" label={t('rows.dateOfBirth')} value={formatMediumDate(profile.date_of_birth)} />
            )}
            {signup?.gender && (
              <InfoRow icon="user-fill" label={t('rows.gender')} value={titleCase(signup.gender)} />
            )}
            {(signup?.height_cm || signup?.weight_kg) && (
              <InfoRow
                icon="run-fill"
                label={t('rows.heightWeight')}
                value={[
                  signup?.height_cm ? `${signup.height_cm} cm` : null,
                  signup?.weight_kg ? `${signup.weight_kg} kg` : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              />
            )}
            <InfoRow
              icon="heart-pulse-fill"
              label={t('rows.medicalNotes')}
              value={profile.medical_notes || t('rows.noneOnFile')}
              isLast
            />
          </Card>
        </Animated.View>

        {/* ═══ Guardian ═══ */}
        {profile.guardian_name && (
          <Animated.View style={[s.section, guardianEntry]}>
            <SectionTitle>{t('sections.guardian')}</SectionTitle>
            <Card>
              <InfoRow icon="hand-heart-fill" label={t('rows.name')} value={profile.guardian_name} />
              {profile.guardian_phone && (
                <InfoRow
                  icon="phone-fill"
                  label={t('rows.phone')}
                  value={profile.guardian_phone}
                  onPress={() => openUrl(`tel:${profile.guardian_phone}`)}
                />
              )}
              {profile.guardian_email && (
                <InfoRow
                  icon="mail-fill"
                  label={t('rows.email')}
                  value={profile.guardian_email}
                  onPress={() => openUrl(`mailto:${profile.guardian_email}`)}
                  isLast
                />
              )}
            </Card>
          </Animated.View>
        )}

        {/* ═══ Club & support ═══ */}
        <Animated.View style={[s.section, clubEntry]}>
          <SectionTitle>{t('sections.club')}</SectionTitle>
          <Card>
            <InfoRow icon="building-2-fill" label={t('rows.club')} value={user.club?.name ?? '—'} />
            {branding?.supportPhone && (
              <InfoRow
                icon="phone-fill"
                label={t('rows.callClub')}
                value={branding.supportPhone}
                onPress={() => openUrl(`tel:${branding.supportPhone}`)}
              />
            )}
            {branding?.supportEmail && (
              <InfoRow
                icon="mail-fill"
                label={t('rows.emailClub')}
                value={branding.supportEmail}
                onPress={() => openUrl(`mailto:${branding.supportEmail}`)}
              />
            )}
            <InfoRow
              icon="user-3-fill"
              label={t('rows.accountEmail')}
              value={user.email}
            />
            <InfoRow
              icon="earth-line"
              label={t('rows.language')}
              value={language === 'ar' ? 'العربية' : 'English'}
              onPress={() => setLanguageSheetVisible(true)}
            />
            <InfoRow
              icon="lock-line"
              label={t('rows.password')}
              value={t('rows.changePassword')}
              onPress={() => navigation.navigate('ChangePassword')}
              isLast
            />
          </Card>
        </Animated.View>
      </ScrollView>

      <DeleteAccountSheet
        visible={deleteSheetVisible}
        onClose={() => setDeleteSheetVisible(false)}
      />

      <LanguageSheet
        visible={languageSheetVisible}
        onClose={() => setLanguageSheetVisible(false)}
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
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  flex1: {
    flex: 1,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
    letterSpacing: 0.4,
    marginBottom: spacing.sm + 2,
  },

  /* Header right row */
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    marginRight: spacing.sm,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Subscription */
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  subTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    flex: 1,
  },
  subIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subPlan: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },
  subPaid: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
    color: colors.primary,
  },
  subMeta: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
    marginTop: 1,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
  },
  pillText: {
    fontSize: 12,
    fontFamily: fontFamily.bodySemiBold,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceLight,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  subFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm + 2,
  },
  subDays: {
    fontSize: 15,
    fontFamily: fontFamily.headingBold,
  },
  subStarted: {
    fontSize: 12,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textDim,
  },
  subNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.sm + 4,
    borderRadius: borderRadius.sm,
  },
  subNoticeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fontFamily.bodyMedium,
  },

  /* Stats */
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm + 2,
    marginBottom: spacing.sm + 2,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  levelDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  levelText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textMuted,
  },

  /* Coach */
  coachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
  },
  coachAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coachInitials: {
    fontSize: 18,
    fontFamily: fontFamily.headingBold,
  },
  coachName: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },
  coachMeta: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
    marginTop: 1,
  },
  coachRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  coachRatingText: {
    fontSize: 13,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Info rows */
});
