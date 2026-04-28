import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { Icon } from '../../../common/Icon';
import { CoachSessionInterface } from '../../../../types/models.types';
import { colors, ANIMATION } from '../../../../theme';
import { styles } from './styles';

interface SessionDaySheetProps {
  visible: boolean;
  date: string; // YYYY-MM-DD
  sessions: CoachSessionInterface[];
  onClose: () => void;
  onRecordAttendance: (sessionId: number) => void;
  onViewAttendance: (sessionId: number) => void;
}

const STATUS_COLORS: Record<string, string> = {
  Scheduled: colors.primary,
  Live: colors.orange,
  Completed: colors.success,
  Cancelled: colors.error,
};

const formatTime = (time: string) => {
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
};

const formatSheetDate = (dateStr: string) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export const SessionDaySheet: React.FC<SessionDaySheetProps> = ({
  visible,
  date,
  sessions,
  onClose,
  onRecordAttendance,
  onViewAttendance,
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 1 : 0,
      duration: ANIMATION.duration.normal,
      easing: visible ? ANIMATION.easing.enter : ANIMATION.easing.exit,
      useNativeDriver: true,
    }).start();
  }, [visible, slideAnim]);

  if (!visible) return null;

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight * 0.8, 0],
  });

  const overlayOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1 }} />
      </TouchableWithoutFeedback>
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.headerDate}>{formatSheetDate(date)}</Text>
          <Text style={styles.headerCount}>
            {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
          </Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {sessions.map((session) => {
            const statusColor = STATUS_COLORS[session.status] ?? colors.primary;
            const attendanceCount = session.attendances?.filter((a) => a.present).length ?? 0;
            const totalSwimmers = session.effective_roster?.length ?? session.attendances?.length ?? 0;
            const attendancePct =
              totalSwimmers > 0 ? (attendanceCount / totalSwimmers) * 100 : 0;

            return (
              <View key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionTitleRow}>
                  <Text style={styles.sessionGroup} numberOfLines={1}>
                    {session.group.name}
                  </Text>
                  <View
                    style={[styles.statusBadge, { backgroundColor: statusColor }]}
                  >
                    <Text style={styles.statusText}>{session.status}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Icon name="time-line" size={14} color={colors.textMuted} />
                  <Text style={styles.detailText}>
                    {formatTime(session.start_time)} –{' '}
                    {formatTime(session.end_time)}
                  </Text>
                </View>

                {session.location ? (
                  <View style={styles.detailRow}>
                    <Icon
                      name="map-pin-line"
                      size={14}
                      color={colors.textMuted}
                    />
                    <Text style={styles.detailText}>{session.location}</Text>
                  </View>
                ) : null}

                {session.status === 'Completed' && totalSwimmers > 0 && (
                  <View style={styles.attendanceRow}>
                    <Icon name="group-line" size={14} color={colors.textMuted} />
                    <View style={styles.attendanceBar}>
                      <View
                        style={[
                          styles.attendanceFill,
                          { width: `${attendancePct}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.attendanceText}>
                      {attendanceCount}/{totalSwimmers}
                    </Text>
                  </View>
                )}

                {/* Actions */}
                <View style={styles.actionsRow}>
                  {session.status === 'Scheduled' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnPrimary]}
                      onPress={() => onRecordAttendance(session.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionTextPrimary}>
                        Record Attendance
                      </Text>
                    </TouchableOpacity>
                  )}
                  {session.status === 'Live' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnPrimary]}
                      onPress={() => onRecordAttendance(session.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionTextPrimary}>
                        Take Attendance
                      </Text>
                    </TouchableOpacity>
                  )}
                  {session.status === 'Completed' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnSecondary]}
                      onPress={() => onViewAttendance(session.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionTextSecondary}>
                        View Attendance
                      </Text>
                    </TouchableOpacity>
                  )}
                  {session.status === 'Cancelled' && (
                    <View style={[styles.actionBtn, styles.actionBtnDisabled]}>
                      <Text style={styles.actionTextSecondary}>Cancelled</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
};
