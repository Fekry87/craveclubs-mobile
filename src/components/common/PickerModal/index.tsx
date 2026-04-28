import React from 'react';
import { View, Text, TouchableOpacity, Modal, Platform } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Icon, IconName } from '../Icon';
import { colors } from '../../../theme';
import { styles } from './styles';

interface PickerModalProps {
  visible: boolean;
  title: string;
  icon: IconName;
  accentColor: string;
  accentDim: string;
  mode: 'date' | 'time';
  value: Date;
  minimumDate?: Date;
  onChange: (event: DateTimePickerEvent, date?: Date) => void;
  onDone: () => void;
  onCancel: () => void;
}

export const PickerModal: React.FC<PickerModalProps> = ({
  visible,
  title,
  icon,
  accentColor,
  accentDim,
  mode,
  value,
  minimumDate,
  onChange,
  onDone,
  onCancel,
}) => {
  /* Only render on iOS — Android uses native dialog */
  if (Platform.OS !== 'ios') return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onCancel}
      >
        <TouchableOpacity
          style={styles.sheet}
          activeOpacity={1}
          onPress={() => {}}
        >
          {/* ── Colored accent stripe ── */}
          <View style={[styles.accentStripe, { backgroundColor: accentColor }]} />

          {/* ── Drag handle ── */}
          <View style={styles.handleRow}>
            <View style={styles.handle} />
          </View>

          {/* ── Header ── */}
          <View style={styles.header}>
            {/* Cancel */}
            <TouchableOpacity
              style={[styles.headerBtn, styles.cancelBtn]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Icon name="close-line" size={15} color={colors.textMuted} />
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            {/* Title */}
            <View style={styles.titleRow}>
              <View
                style={[
                  styles.titleIconCircle,
                  { backgroundColor: accentDim },
                ]}
              >
                <Icon name={icon} size={14} color={accentColor} />
              </View>
              <Text style={styles.title}>{title}</Text>
            </View>

            {/* Done */}
            <TouchableOpacity
              style={[styles.headerBtn, { backgroundColor: accentDim }]}
              onPress={onDone}
              activeOpacity={0.7}
            >
              <Icon name="check-line" size={15} color={accentColor} />
              <Text style={[styles.doneText, { color: accentColor }]}>
                Done
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Divider ── */}
          <View style={styles.divider} />

          {/* ── Picker ── */}
          <View style={styles.content}>
            <DateTimePicker
              value={value}
              mode={mode}
              display="spinner"
              onChange={onChange}
              style={styles.picker}
              accentColor={accentColor}
              themeVariant="light"
              {...(minimumDate ? { minimumDate } : {})}
            />
          </View>

          {/* ── Bottom safe area ── */}
          <View style={styles.bottomSafe} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
