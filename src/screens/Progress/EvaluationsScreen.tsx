import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Card } from '../../components/common/Card';
import { Icon } from '../../components/common/Icon';
import { Loader } from '../../components/common/Loader';
import { ErrorView } from '../../components/common/ErrorView';
import { EmptyState } from '../../components/common/EmptyState';
import { useAnimatedEntry } from '../../hooks/useAnimatedEntry';
import { progressService } from '../../api/services/progress.service';
import { EvaluationInterface } from '../../types/models.types';
import { formatDate } from '../../utils/formatters';
import { colors, spacing, fontFamily, borderRadius } from '../../theme';

interface EvalCardProps {
  evaluation: EvaluationInterface;
  index: number;
}

const EvalCard: React.FC<EvalCardProps> = React.memo(({ evaluation, index }) => {
  const entryStyle = useAnimatedEntry(index);
  const emptyStars = 5 - evaluation.rating;
  const date = new Date(evaluation.session.date);
  const dateLabel = date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Animated.View style={entryStyle}>
      <Card style={screenStyles.evalCard} accentColor={colors.warning}>
        <View style={screenStyles.evalRow}>
          <View style={screenStyles.evalStarCircle}>
            <Icon name="star-fill" size={20} color={colors.warning} />
          </View>
          <View style={screenStyles.evalContent}>
            <View style={screenStyles.evalStarsRow}>
              {Array.from({ length: evaluation.rating }).map((_, i) => (
                <Icon
                  key={`f-${i}`}
                  name="star-fill"
                  size={14}
                  color={colors.warning}
                />
              ))}
              {Array.from({ length: emptyStars }).map((_, i) => (
                <Icon
                  key={`e-${i}`}
                  name="star-line"
                  size={14}
                  color={colors.borderLight}
                />
              ))}
              <Text style={screenStyles.evalRatingText}>
                {evaluation.rating}.0
              </Text>
            </View>
            <Text style={screenStyles.evalGroupName}>
              {evaluation.session.group.name}
            </Text>
            {evaluation.notes && (
              <Text style={screenStyles.evalNotes} numberOfLines={2}>
                {evaluation.notes}
              </Text>
            )}
          </View>
          <Text style={screenStyles.evalDate}>{dateLabel}</Text>
        </View>
      </Card>
    </Animated.View>
  );
});

export const EvaluationsScreen: React.FC = () => {
  const [evaluations, setEvaluations] = useState<EvaluationInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvaluations = useCallback(async () => {
    try {
      setError(null);
      const data = await progressService.getEvaluations(1, 100);
      // Sort newest first by session date
      const sorted = [...data.data].sort(
        (a, b) => new Date(b.session.date).getTime() - new Date(a.session.date).getTime(),
      );
      setEvaluations(sorted);
    } catch {
      setError('Failed to load evaluations.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchEvaluations();
      // eslint-disable-next-line -- run on focus only
    }, []),
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvaluations();
  }, [fetchEvaluations]);

  if (isLoading && evaluations.length === 0) {
    return <Loader message="Loading evaluations..." />;
  }

  if (error && evaluations.length === 0) {
    return <ErrorView message={error} onRetry={fetchEvaluations} />;
  }

  return (
    <View style={screenStyles.container}>
      <FlatList
        data={evaluations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <EvalCard evaluation={item} index={index} />
        )}
        contentContainerStyle={[
          screenStyles.listContent,
          evaluations.length === 0 && screenStyles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="star-line"
            title="No Evaluations Yet"
            message="Your coach evaluations will appear here after sessions."
          />
        }
      />
    </View>
  );
};

const screenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  listContentEmpty: {
    flex: 1,
  },

  // Evaluation card
  evalCard: {
    marginBottom: spacing.sm,
  },
  evalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  evalStarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.warningDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  evalContent: {
    flex: 1,
  },
  evalStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 2,
  },
  evalRatingText: {
    fontSize: 13,
    fontFamily: fontFamily.headingBold,
    color: colors.warning,
    marginLeft: 4,
  },
  evalGroupName: {
    fontSize: 13,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },
  evalNotes: {
    fontSize: 12,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
    lineHeight: 16,
    marginTop: 2,
  },
  evalDate: {
    fontSize: 11,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.primary,
  },
});
