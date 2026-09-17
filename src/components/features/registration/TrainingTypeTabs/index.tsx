import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { trainingTypeTab } from '../../../../utils/trainingTypes';
import { colors } from '../../../../theme';
import { styles } from './styles';

interface TrainingTypeTabsProps {
  /** In tab order — from trainingTypesIn(). */
  types: string[];
  active: string | null;
  onChange: (type: string) => void;
}

/**
 * One pill per training type (Daily, 2 days a week…), used above the plans on
 * the plan step and above the groups on the group step, so the two lists are
 * cut the same way. A single type shows no tabs at all.
 */
export const TrainingTypeTabs: React.FC<TrainingTypeTabsProps> = ({ types, active, onChange }) => {
  if (types.length < 2) return <View />;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.tabsScroll}
      contentContainerStyle={styles.tabs}
    >
      {types.map((type) => {
        const selected = type === active;
        return (
          <TouchableOpacity
            key={type}
            onPress={() => onChange(type)}
            activeOpacity={0.8}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={[
              styles.tab,
              selected && [
                styles.tabActive,
                { borderColor: colors.primary, backgroundColor: colors.primaryDim },
              ],
            ]}
          >
            <Text style={[styles.tabText, selected && { color: colors.primary }]}>
              {trainingTypeTab(type)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};
