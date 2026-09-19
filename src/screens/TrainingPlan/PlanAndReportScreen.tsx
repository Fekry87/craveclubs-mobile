import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTrainingPlanStore } from '../../store/trainingPlan.store';
import { MyPlanScreen } from './MyPlanScreen';
import { WeeklyReportScreen } from '../WeeklyReport/WeeklyReportScreen';
import { SegmentedTabs, SegmentItem } from '../../components/common/SegmentedTabs';
import { colors } from '../../theme';

type Segment = 'plan' | 'report';

export const PlanAndReportScreen: React.FC = () => {
  const { t } = useTranslation('plan');
  const [activeSegment, setActiveSegment] = useState<Segment>('plan');

  const markPlanViewed = useTrainingPlanStore((s) => s.markPlanViewed);

  const segments = useMemo<SegmentItem[]>(
    () => [
      { key: 'plan', label: t('tabs.plan') },
      { key: 'report', label: t('tabs.report') },
    ],
    [t],
  );

  useFocusEffect(
    useCallback(() => {
      markPlanViewed();
      // eslint-disable-next-line -- run on focus only
    }, []),
  );

  return (
    <View style={s.container}>
      <SegmentedTabs
        segments={segments}
        activeKey={activeSegment}
        onChange={(key) => setActiveSegment(key as Segment)}
      />

      {/* Content — all mounted, toggle visibility to preserve state */}
      <View style={[s.content, activeSegment !== 'plan' && s.hidden]}>
        <MyPlanScreen />
      </View>
      <View style={[s.content, activeSegment !== 'report' && s.hidden]}>
        <WeeklyReportScreen />
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
