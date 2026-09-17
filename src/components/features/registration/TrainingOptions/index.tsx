import React from 'react';
import { View, Text } from 'react-native';
import { SelectCard } from '../SelectCard';
import { Icon } from '../../../common/Icon';
import { Branch, Coach, Group, SubscriptionPlan } from '../../../../api/services/registration.service';
import { formatMoney, planPrice, formatTime, formatDuration } from '../../../../utils/formatters';
import { trainingTypeTab } from '../../../../utils/trainingTypes';
import { colors } from '../../../../theme';
import { styles } from './styles';

/*
 * The branch, plan, coach and group choices — drawn the same in their own
 * steps (5–7b) and in the review screen's Training edit sheet.
 */

interface OptionProps<T> {
  item: T;
  selected: boolean;
  onPress: () => void;
  index?: number;
}

export const BranchOption: React.FC<OptionProps<Branch>> = ({ item, selected, onPress, index }) => {
  const address = [item.address, item.city].filter(Boolean).join(', ');
  return (
    <SelectCard
      title={item.name}
      subtitle={address || null}
      selected={selected}
      onPress={onPress}
      index={index}
      leading={
        <View
          style={[styles.iconTile, { backgroundColor: selected ? colors.white : colors.surfaceLight }]}
        >
          <Icon
            name="building-2-line"
            size={22}
            color={selected ? colors.primary : colors.textMuted}
          />
        </View>
      }
    >
      {item.phone ? (
        <View style={styles.metaRow}>
          <Icon name="phone-line" size={14} color={colors.textMuted} />
          <Text style={styles.metaText}>{item.phone}</Text>
        </View>
      ) : null}
    </SelectCard>
  );
};

const months = (n: number) => `${n} ${n === 1 ? 'month' : 'months'}`;

export const PlanOption: React.FC<OptionProps<SubscriptionPlan> & { disabled?: boolean }> = ({
  item,
  selected,
  onPress,
  index,
  disabled,
}) => (
  <SelectCard
    title={item.name}
    subtitle={months(item.duration_months)}
    badge={item.is_popular ? 'Popular' : undefined}
    selected={selected}
    onPress={onPress}
    index={index}
    disabled={disabled}
  >
    {/* Price — the amount actually charged, not the list price. This used to
        render plan.price beside a "N% off" badge, so the app quoted 500 while
        the portal quoted 450 for the same plan and the registration was billed
        450. */}
    <View style={styles.priceRow}>
      <Text style={[styles.price, selected && { color: colors.primary }]}>
        {formatMoney(planPrice(item))}
      </Text>
      {item.discount_percent > 0 && (
        <>
          <Text style={styles.listPrice}>{formatMoney(item.price)}</Text>
          <View style={styles.savePill}>
            <Text style={styles.saveText}>Save {item.discount_percent}%</Text>
          </View>
        </>
      )}
    </View>
  </SelectCard>
);

const initialsOf = (name: string | null | undefined) =>
  (name || '?')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

export const CoachOption: React.FC<OptionProps<Coach>> = ({ item, selected, onPress, index }) => (
  <SelectCard
    title={item.name}
    subtitle={item.specialization}
    selected={selected}
    onPress={onPress}
    index={index}
    leading={
      <View style={[styles.avatar, { backgroundColor: selected ? colors.white : colors.surfaceLight }]}>
        <Text style={[styles.avatarText, selected && { color: colors.primary }]}>
          {initialsOf(item.name)}
        </Text>
      </View>
    }
  >
    {item.experience_years != null && (
      <View style={styles.metaRow}>
        <Icon name="award-line" size={14} color={colors.textMuted} />
        <Text style={styles.metaText}>
          {item.experience_years} {item.experience_years === 1 ? 'year' : 'years'} coaching
        </Text>
      </View>
    )}
    {item.bio ? (
      <Text style={styles.bio} numberOfLines={2}>
        {item.bio}
      </Text>
    ) : null}
  </SelectCard>
);

/** Chip labels in days_of_week order (0 = Sunday). */
const DAY_CHIPS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const minutesOf = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

/**
 * A coach's group as a small schedule card: the training type as a pill under
 * the name, the week as seven chips with the training days lit, and a strip
 * with when it starts and ends. Reading "Sun, Mon, Tue, Wed, Thu, Fri, Sat ·
 * 6:00 PM - 8:00 PM" as one line took a second look; the chips and the strip
 * don't. A full group is drawn but can't be chosen — hiding it would make the
 * coach look as if they had fewer groups than the club advertises.
 */
export const GroupOption: React.FC<OptionProps<Group>> = ({ item, selected, onPress, index }) => {
  const days = new Set(item.days_of_week ?? []);
  const hasTimes = !!(item.start_time && item.end_time);
  const duration = hasTimes
    ? formatDuration(minutesOf(item.end_time as string) - minutesOf(item.start_time as string))
    : '';
  const spots =
    item.capacity === null
      ? null
      : item.is_full
        ? 'Full'
        : `${item.remaining_spots} ${item.remaining_spots === 1 ? 'spot' : 'spots'} left`;
  // Plenty is calm green; the last few are a nudge; none is red.
  const spotsColor = item.is_full
    ? colors.error
    : (item.remaining_spots ?? 0) <= 3
      ? colors.warningDark
      : colors.swimmerDark;

  return (
    <SelectCard
      title={item.name}
      selected={selected}
      onPress={onPress}
      index={index}
      disabled={item.is_full}
      leading={
        <View
          style={[styles.iconTile, { backgroundColor: selected ? colors.white : colors.surfaceLight }]}
        >
          <Icon name="group-line" size={22} color={selected ? colors.primary : colors.textMuted} />
        </View>
      }
    >
      {/* Type (and Full) pills under the name */}
      <View style={styles.pillRow}>
        <View style={[styles.pill, { backgroundColor: selected ? colors.white : colors.primaryDim }]}>
          <Text style={[styles.pillText, { color: colors.primary }]}>{trainingTypeTab(item.group_type)}</Text>
        </View>
        {item.is_full ? (
          <View style={[styles.pill, { backgroundColor: colors.errorDim }]}>
            <Text style={[styles.pillText, { color: colors.errorDark }]}>Full</Text>
          </View>
        ) : null}
      </View>

      {/* The week, training days lit */}
      {days.size > 0 ? (
        <View style={styles.dayRow}>
          {DAY_CHIPS.map((label, day) => {
            const on = days.has(day);
            return (
              <View
                key={label}
                style={[
                  styles.dayChip,
                  on
                    ? { backgroundColor: selected ? colors.primary : colors.primaryDim }
                    : { backgroundColor: selected ? colors.white : colors.background },
                ]}
              >
                <Text
                  style={[
                    styles.dayChipText,
                    on ? { color: selected ? colors.white : colors.primary } : styles.dayChipOff,
                  ]}
                >
                  {label}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}

      {/* Starts / ends, on one line */}
      {hasTimes ? (
        <View style={[styles.timeStrip, { backgroundColor: selected ? colors.white : colors.background }]}>
          <Icon name="time-line" size={16} color={colors.textMuted} />
          <View>
            <Text style={styles.timeLabel}>Starts</Text>
            <Text style={styles.timeValue}>{formatTime(item.start_time as string)}</Text>
          </View>
          <View style={styles.timeDivider} />
          <View>
            <Text style={styles.timeLabel}>Ends</Text>
            <Text style={styles.timeValue}>{formatTime(item.end_time as string)}</Text>
          </View>
          {duration ? <Text style={styles.timeDuration}>{duration}</Text> : null}
        </View>
      ) : null}

      {spots ? (
        <View style={styles.metaRow}>
          <Icon name="user-line" size={14} color={spotsColor} />
          <Text style={[styles.metaText, { color: spotsColor }]}>{spots}</Text>
        </View>
      ) : null}
    </SelectCard>
  );
};
