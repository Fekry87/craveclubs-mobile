import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Icon, IconName } from '../../../common/Icon';
import { Button } from '../../../common/Button';
import { colors } from '../../../../theme';
import { styles } from './styles';

type StepStatusProps =
  | { kind: 'loading'; message: string }
  | { kind: 'error'; message: string; onRetry: () => void }
  | { kind: 'empty'; icon: IconName; title: string; message: string };

/** Loading, error and empty states for the steps that fetch a list. */
export const StepStatus: React.FC<StepStatusProps> = (props) => {
  if (props.kind === 'loading') {
    return (
      <View style={styles.container} accessibilityRole="progressbar">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.message}>{props.message}</Text>
      </View>
    );
  }

  const icon: IconName = props.kind === 'error' ? 'wifi-off-line' : props.icon;
  return (
    <View style={styles.container}>
      <View style={styles.iconTile}>
        <Icon
          name={icon}
          size={26}
          color={props.kind === 'error' ? colors.error : colors.textMuted}
        />
      </View>
      <Text style={styles.title}>
        {props.kind === 'error' ? "Couldn't load this step" : props.title}
      </Text>
      <Text style={styles.message}>{props.message}</Text>
      {props.kind === 'error' && (
        <View style={styles.action}>
          <Button title="Try again" variant="secondary" onPress={props.onRetry} />
        </View>
      )}
    </View>
  );
};
