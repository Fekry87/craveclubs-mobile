import React from 'react';
import { FlatList, RefreshControl, ViewStyle } from 'react-native';
import { TrainingSessionInterface } from '../../../../types/models.types';
import { SessionCard } from '../SessionCard';
import { EmptyState } from '../../../common/EmptyState';
import { Loader } from '../../../common/Loader';
import { colors, spacing } from '../../../../theme';

interface SessionListProps {
  sessions: TrainingSessionInterface[];
  isLoading: boolean;
  onRefresh: () => void;
  onEndReached?: () => void;
  onSessionPress?: (session: TrainingSessionInterface) => void;
  style?: ViewStyle;
}

export const SessionList: React.FC<SessionListProps> = ({
  sessions,
  isLoading,
  onRefresh,
  onEndReached,
  onSessionPress,
  style,
}) => {
  if (isLoading && sessions.length === 0) {
    return <Loader message="Loading sessions..." />;
  }

  return (
    <FlatList
      data={sessions}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item, index }) => (
        <SessionCard
          session={item}
          onPress={() => onSessionPress?.(item)}
          index={index}
        />
      )}
      contentContainerStyle={[
        { padding: spacing.md },
        sessions.length === 0 && { flex: 1 },
        style,
      ]}
      refreshControl={
        <RefreshControl
          refreshing={isLoading && sessions.length > 0}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={
        <EmptyState
          icon="drop-line"
          title="No Sessions"
          message="No training sessions found."
        />
      }
    />
  );
};
