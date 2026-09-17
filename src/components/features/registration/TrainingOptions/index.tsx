import React from 'react';
import { View, Text } from 'react-native';
import { SelectCard } from '../SelectCard';
import { Icon } from '../../../common/Icon';
import { Branch, Coach, Group, SubscriptionPlan } from '../../../../api/services/registration.service';
import { formatMoney, planPrice, groupSchedule } from '../../../../utils/formatters';
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

export const PlanOption: React.FC<OptionProps<SubscriptionPlan>> = ({ item, selected, onPress, index }) => (
  <SelectCard
    title={item.name}
    subtitle={months(item.duration_months)}
    badge={item.is_popular ? 'Popular' : undefined}
    selected={selected}
    onPress={onPress}
    index={index}
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

/**
 * A coach's group: its schedule as the subtitle and the spots left underneath.
 * A full group is drawn but can't be chosen — hiding it would make the coach
 * look as if they had fewer groups than the club advertises.
 */
export const GroupOption: React.FC<OptionProps<Group>> = ({ item, selected, onPress, index }) => {
  const spots =
    item.capacity === null
      ? null
      : item.is_full
        ? 'Full'
        : `${item.remaining_spots} ${item.remaining_spots === 1 ? 'spot' : 'spots'} left`;

  return (
    <SelectCard
      title={item.name}
      subtitle={groupSchedule(item) || null}
      badge={item.is_full ? 'Full' : undefined}
      selected={selected}
      onPress={item.is_full ? () => undefined : onPress}
      index={index}
      leading={
        <View
          style={[styles.iconTile, { backgroundColor: selected ? colors.white : colors.surfaceLight }]}
        >
          <Icon name="group-line" size={22} color={selected ? colors.primary : colors.textMuted} />
        </View>
      }
    >
      {spots ? (
        <View style={styles.metaRow}>
          <Icon name="user-line" size={14} color={item.is_full ? colors.error : colors.textMuted} />
          <Text style={[styles.metaText, item.is_full && { color: colors.error }]}>{spots}</Text>
        </View>
      ) : null}
    </SelectCard>
  );
};
