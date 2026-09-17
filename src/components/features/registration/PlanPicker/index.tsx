import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { PlanOption } from '../TrainingOptions';
import { TrainingTypeTabs } from '../TrainingTypeTabs';
import { SubscriptionPlan } from '../../../../api/services/registration.service';
import { InlineNotice } from '../InlineNotice';
import { trainingTypeLabel, trainingTypesIn } from '../../../../utils/trainingTypes';

interface PlanPickerProps {
  plans: SubscriptionPlan[];
  selectedId: number | null;
  onSelect: (plan: SubscriptionPlan) => void;
  /**
   * Types whose groups are all full right now. Their plans are shown but
   * can't be chosen, with a note saying why — better learnt here than two
   * steps later, when no coach turns up.
   */
  unavailableTypes?: ReadonlySet<string>;
}

/**
 * The club's plans, one tab per training type (daily, two days a week…) with
 * that type's plans underneath. Used by the plan step and the review screen's
 * Training sheet. A single type shows no tabs.
 *
 * The tab opens on the type of the plan already chosen, so an edit lands the
 * swimmer where they left off.
 */
export const PlanPicker: React.FC<PlanPickerProps> = ({ plans, selectedId, onSelect, unavailableTypes }) => {
  const types = useMemo(() => trainingTypesIn(plans), [plans]);
  const selectedType = plans.find((p) => p.id === selectedId)?.training_type ?? null;
  const [activeType, setActiveType] = useState<string | null>(selectedType ?? types[0] ?? null);

  // Follow the selection when it changes from outside (e.g. the sheet reopens).
  useEffect(() => {
    if (selectedType) setActiveType(selectedType);
  }, [selectedType]);

  // If the plans reload and the active type is gone, fall back to the first.
  useEffect(() => {
    if (activeType && !types.includes(activeType)) setActiveType(types[0] ?? null);
  }, [types, activeType]);

  const visible = plans.filter((p) => p.training_type === activeType);

  return (
    <View>
      <TrainingTypeTabs types={types} active={activeType} onChange={setActiveType} />

      {activeType && unavailableTypes?.has(activeType) ? (
        <InlineNotice
          icon="group-line"
          title={`All ${trainingTypeLabel(activeType).toLowerCase()} groups are full`}
          message="No coach has a spot left in this type right now. Pick another type, or check with the club."
        />
      ) : null}

      {visible.map((item, index) => (
        <PlanOption
          key={item.id}
          item={item}
          selected={selectedId === item.id}
          onPress={() => onSelect(item)}
          index={index}
          disabled={unavailableTypes?.has(item.training_type)}
        />
      ))}
    </View>
  );
};
