import React from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { Icon } from '../../../common/Icon';
import { StarRating } from '../StarRating';
import { colors } from '../../../../theme';
import { styles } from './styles';

/** Longest comment the field accepts. */
export const SWIMMER_NOTE_MAX_LENGTH = 500;

interface SwimmerRosterItemProps {
  swimmerId: number;
  name: string;
  level: string | null;
  isPresent: boolean;
  rating: number;
  /** The coach's comment for this swimmer (saved with the rating). */
  note: string;
  /** Whether the comment field is open under the row. */
  isExpanded: boolean;
  onToggleAttendance: (swimmerId: number) => void;
  onRate: (swimmerId: number, rating: number) => void;
  onToggleExpand: (swimmerId: number) => void;
  onChangeNote: (swimmerId: number, note: string) => void;
  /** القياس: opens the time sheet. Omitted when the club has no Skills feature. */
  onMeasure?: (swimmerId: number) => void;
  /** Times already recorded for this swimmer in this session. */
  measurementCount?: number;
}

export const SwimmerRosterItem: React.FC<SwimmerRosterItemProps> = React.memo(({
  swimmerId,
  name,
  level,
  isPresent,
  rating,
  note,
  isExpanded,
  onToggleAttendance,
  onRate,
  onToggleExpand,
  onChangeNote,
  onMeasure,
  measurementCount = 0,
}) => {
  const handleToggle = () => {
    onToggleAttendance(swimmerId);
  };

  const handleRate = (newRating: number) => {
    onRate(swimmerId, newRating);
  };

  const hasNote = note.trim().length > 0;
  // Like the portal: only a swimmer who is here gets a comment.
  const showNote = isExpanded && isPresent;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Left: Name + Level — tap to write a comment */}
        <Pressable
          style={styles.nameSection}
          onPress={() => onToggleExpand(swimmerId)}
          disabled={!isPresent}
          accessibilityRole="button"
          accessibilityLabel={`${hasNote ? 'Edit' : 'Add'} comment for ${name}`}
        >
          <View style={styles.nameLine}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            {isPresent && (
              <Icon
                name={hasNote ? 'message-2-fill' : 'message-2-line'}
                size={14}
                color={hasNote ? colors.primary : colors.textDim}
              />
            )}
          </View>
          {level && (
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{level}</Text>
            </View>
          )}
        </Pressable>

        {/* القياس: record a time (present swimmers only) */}
        {onMeasure && isPresent && (
          <Pressable
            style={[styles.measureBtn, { backgroundColor: colors.primaryDim }]}
            onPress={() => onMeasure(swimmerId)}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`Record a time for ${name}`}
          >
            <Icon
              name={measurementCount > 0 ? 'timer-fill' : 'timer-line'}
              size={18}
              color={colors.primary}
            />
            {measurementCount > 0 && (
              <View style={[styles.measureCount, { backgroundColor: colors.primary }]}>
                <Text style={styles.measureCountText}>{measurementCount}</Text>
              </View>
            )}
          </Pressable>
        )}

        {/* Center: Attendance toggle */}
        <Pressable
          style={[
            styles.toggleBtn,
            {
              backgroundColor: isPresent ? colors.swimmer : colors.error,
            },
          ]}
          onPress={handleToggle}
        >
          <Icon
            name={isPresent ? 'checkbox-circle-fill' : 'close-circle-fill'}
            size={20}
            color={colors.white}
          />
        </Pressable>

        {/* Right: Star rating */}
        <View style={styles.ratingSection}>
          <StarRating size={16} rating={rating} onRate={handleRate} />
        </View>
      </View>

      {showNote && (
        <View style={styles.noteBox}>
          <TextInput
            style={styles.noteInput}
            multiline
            autoFocus
            maxLength={SWIMMER_NOTE_MAX_LENGTH}
            textAlignVertical="top"
            placeholder={`Add a comment for ${name.split(' ')[0]}…`}
            placeholderTextColor={colors.textDim}
            value={note}
            onChangeText={(text) => onChangeNote(swimmerId, text)}
          />
          <Text
            style={[
              styles.noteHint,
              hasNote && rating === 0 && { color: colors.warningDark },
            ]}
          >
            {hasNote && rating === 0
              ? 'Add a star rating too — a comment is saved with the rating.'
              : 'The swimmer sees this with their rating.'}
          </Text>
        </View>
      )}
    </View>
  );
});
