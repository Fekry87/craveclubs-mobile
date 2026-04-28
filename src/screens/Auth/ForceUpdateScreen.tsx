import React from 'react';
import { View, StyleSheet, Linking, Platform } from 'react-native';
import { Typography } from '../../components/common/Typography';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { colors, spacing, borderRadius } from '../../theme';

interface ForceUpdateScreenProps {
  updateUrl: { ios: string; android: string };
}

export const ForceUpdateScreen: React.FC<ForceUpdateScreenProps> = ({ updateUrl }) => {
  const handleUpdate = async () => {
    const url = Platform.OS === 'ios' ? updateUrl.ios : updateUrl.android;
    if (url) {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        Linking.openURL(url);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Icon name="download-2-line" size={48} color={colors.primary} />
        </View>

        <Typography variant="hero" style={styles.title}>
          تحديث مطلوب
        </Typography>

        <Typography variant="body" style={styles.subtitle}>
          يرجى تحديث التطبيق للاستمرار
        </Typography>

        <View style={styles.buttonWrapper}>
          <Button
            title="تحديث الآن"
            onPress={handleUpdate}
            variant="blue"
          />
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.primaryDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  buttonWrapper: {
    width: '100%',
  },
});
