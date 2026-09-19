import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../../common/Icon';
import { useLanguageStore } from '../../../../store/language.store';
import { Language } from '../../../../i18n';
import { colors, spacing, fontFamily, borderRadius, typography } from '../../../../theme';

interface LanguageSheetProps {
  visible: boolean;
  onClose: () => void;
}

const OPTIONS: { code: Language; native: string }[] = [
  { code: 'en', native: 'English' },
  { code: 'ar', native: 'العربية' },
];

/**
 * Language picker. Tapping a different language persists the choice, flips
 * RTL, and reloads the app (handled by the store) — so there is no Save button
 * and the sheet simply closes when the current language is re-tapped.
 */
export const LanguageSheet: React.FC<LanguageSheetProps> = ({
  visible,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('common');
  const language = useLanguageStore((st) => st.language);
  const isSwitching = useLanguageStore((st) => st.isSwitching);
  const setLanguage = useLanguageStore((st) => st.setLanguage);

  const pick = (code: Language) => {
    if (code === language || isSwitching) {
      onClose();
      return;
    }
    setLanguage(code); // persists + reloads
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={s.root}>
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={[s.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
          <View style={s.handle} />
          <Text style={s.title} accessibilityRole="header">
            {t('language.sheetTitle')}
          </Text>
          {OPTIONS.map((opt) => {
            const active = opt.code === language;
            return (
              <TouchableOpacity
                key={opt.code}
                style={[s.row, active && { borderColor: colors.primary, backgroundColor: colors.primaryDim }]}
                onPress={() => pick(opt.code)}
                activeOpacity={0.7}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
              >
                <Text style={[s.rowText, active && { color: colors.primary }]}>
                  {opt.native}
                </Text>
                <Icon
                  name={active ? 'checkbox-circle-fill' : 'checkbox-blank-circle-line'}
                  size={22}
                  color={active ? colors.primary : colors.textDim}
                />
              </TouchableOpacity>
            );
          })}
          <Text style={s.note}>{t('language.restartNote')}</Text>
        </View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(27, 27, 47, 0.45)',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.modal,
    borderTopRightRadius: borderRadius.modal,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 18,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  rowText: {
    fontSize: 16,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },
  note: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
