import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../../common/Icon';
import { SwimmerMeasurementInterface } from '../../../../types/models.types';
import { formatDistance, formatSwimTime } from '../../../../utils/formatters';
import { colors } from '../../../../theme';
import { styles } from './styles';

interface MeasurementRowsProps {
  measurements: SwimmerMeasurementInterface[];
  /** Show the session each time was swum in (the by-day list; a day can hold two sessions). */
  showSession?: boolean;
}

/**
 * القياس — a swimmer's recorded times as rows: the event on the left
 * ("Freestyle · 50m"), the time on the right ("33.10s", "1:05.30"). Used on
 * the session page and inside a day card on the Measurements tab.
 */
export const MeasurementRows: React.FC<MeasurementRowsProps> = ({
  measurements,
  showSession = false,
}) => {
  const { t } = useTranslation('progress');
  return (
  <View>
    {measurements.map((m, index) => (
      <View
        key={m.id}
        style={[styles.row, index === measurements.length - 1 && styles.rowLast]}
      >
        <View style={[styles.iconTile, { backgroundColor: colors.primaryDim }]}>
          <Icon name="timer-line" size={18} color={colors.primary} />
        </View>
        <View style={styles.text}>
          <Text style={styles.event} numberOfLines={1}>
            {m.stroke_skill?.name ?? t('measurements.swimFallback')} · {formatDistance(m.distance_skill)}
          </Text>
          {showSession && m.session?.title ? (
            <Text style={styles.session} numberOfLines={1}>
              {m.session.title}
            </Text>
          ) : null}
        </View>
        <Text style={styles.time}>{formatSwimTime(m.time_seconds)}</Text>
      </View>
    ))}
  </View>
  );
};
