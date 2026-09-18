import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SegmentedTabs, SegmentItem } from '../../components/common/SegmentedTabs';
import { ProgressScreen } from './ProgressScreen';
import { MyMeasurementsScreen } from '../Measurements/MyMeasurementsScreen';
import { useAuthStore } from '../../store/auth.store';
import { colors } from '../../theme';

type Segment = 'progress' | 'measurements';

/**
 * The Progress tab. Splits into "My Progress" (stats + ratings + evaluations)
 * and "My Measurements" (recorded swim times + trend chart) when the club has
 * the Skills feature; without it there is nothing to measure, so it shows the
 * progress screen alone with no sub-tabs.
 */
export const ProgressAndMeasurementsScreen: React.FC = () => {
  const [active, setActive] = useState<Segment>('progress');

  // القياس lives on the club's Skills feature; without it there is nothing to list.
  const measurementsEnabled = useAuthStore(
    (st) => st.user?.features?.skills_enabled === true,
  );

  const segments = useMemo<SegmentItem[]>(
    () => [
      { key: 'progress', label: 'My Progress' },
      { key: 'measurements', label: 'My Measurements' },
    ],
    [],
  );

  if (!measurementsEnabled) {
    return <ProgressScreen />;
  }

  return (
    <View style={s.container}>
      <SegmentedTabs
        segments={segments}
        activeKey={active}
        onChange={(key) => setActive(key as Segment)}
      />

      {/* Both mounted, toggle visibility to preserve scroll + state */}
      <View style={[s.content, active !== 'progress' && s.hidden]}>
        <ProgressScreen />
      </View>
      <View style={[s.content, active !== 'measurements' && s.hidden]}>
        <MyMeasurementsScreen />
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  hidden: {
    display: 'none',
  },
});
