import React from 'react';
import { View, Text, ScrollView, StyleSheet, Animated } from 'react-native';
import { Card } from '../../components/common/Card';
import { Typography } from '../../components/common/Typography';
import { useAnimatedEntry } from '../../hooks/useAnimatedEntry';
import { formatDate, formatTimeRange } from '../../utils/formatters';
import { colors, spacing, fontFamily, borderRadius } from '../../theme';
import { TrainingSessionInterface } from '../../types/models.types';

interface SessionDetailScreenProps {
  session: TrainingSessionInterface;
}

export const SessionDetailScreen: React.FC<SessionDetailScreenProps> = ({
  session,
}) => {
  const attended = session.attendances?.some((a) => a.present);

  const entry0 = useAnimatedEntry(0);
  const entry1 = useAnimatedEntry(1);
  const entry2 = useAnimatedEntry(2);

  return (
    <ScrollView
      style={screenStyles.container}
      contentContainerStyle={screenStyles.content}
    >
      <Animated.View style={entry0}>
        <Card style={screenStyles.headerCard}>
          <Typography variant="heading">
            {session.title || session.type}
          </Typography>
          <View style={screenStyles.statusRow}>
            <View
              style={[
                screenStyles.statusBadge,
                {
                  backgroundColor:
                    session.status === 'Completed'
                      ? colors.swimmer
                      : session.status === 'Live'
                        ? colors.warning
                        : session.status === 'Cancelled'
                          ? colors.error
                          : colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  screenStyles.statusText,
                  {
                    color:
                      session.status === 'Live'
                        ? colors.text
                        : colors.white,
                  },
                ]}
              >
                {session.status}
              </Text>
            </View>
            <Text style={screenStyles.typeBadge}>{session.type}</Text>
          </View>
        </Card>
      </Animated.View>

      <Animated.View style={entry1}>
        <Card style={screenStyles.detailCard}>
          <Text style={screenStyles.sectionTitle}>Details</Text>
          <View style={screenStyles.detailRow}>
            <Text style={screenStyles.detailLabel}>Date</Text>
            <Text style={screenStyles.detailValue}>
              {formatDate(session.date)}
            </Text>
          </View>
          <View style={screenStyles.detailRow}>
            <Text style={screenStyles.detailLabel}>Time</Text>
            <Text style={screenStyles.detailValue}>
              {formatTimeRange(session.start_time, session.end_time)}
            </Text>
          </View>
          <View style={screenStyles.detailRow}>
            <Text style={screenStyles.detailLabel}>Group</Text>
            <Text style={screenStyles.detailValue}>{session.group.name}</Text>
          </View>
          {session.location && (
            <View style={screenStyles.detailRow}>
              <Text style={screenStyles.detailLabel}>Location</Text>
              <Text style={screenStyles.detailValue}>{session.location}</Text>
            </View>
          )}
          {session.plan && (
            <View style={screenStyles.detailRow}>
              <Text style={screenStyles.detailLabel}>Plan</Text>
              <Text style={screenStyles.detailValue}>
                {session.plan.title}
              </Text>
            </View>
          )}
          {attended !== undefined && (
            <View style={[screenStyles.detailRow, { borderBottomWidth: 0 }]}>
              <Text style={screenStyles.detailLabel}>Attendance</Text>
              <Text
                style={[
                  screenStyles.detailValue,
                  { color: attended ? colors.success : colors.error },
                ]}
              >
                {attended ? 'Present' : 'Absent'}
              </Text>
            </View>
          )}
        </Card>
      </Animated.View>

      {session.notes && (
        <Animated.View style={entry2}>
          <Card style={screenStyles.detailCard}>
            <Text style={screenStyles.sectionTitle}>Notes</Text>
            <Text style={screenStyles.notes}>{session.notes}</Text>
          </Card>
        </Animated.View>
      )}
    </ScrollView>
  );
};

const screenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  headerCard: {
    marginBottom: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
  },
  statusText: {
    fontSize: 12,
    fontFamily: fontFamily.bodySemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  typeBadge: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
  },
  detailCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: fontFamily.bodyMedium,
    color: colors.text,
  },
  notes: {
    fontSize: 14,
    fontFamily: fontFamily.bodyRegular,
    color: colors.text,
    lineHeight: 22,
  },
});
