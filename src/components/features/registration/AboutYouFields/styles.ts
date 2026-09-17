import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontFamily, typography } from '../../../../theme';

// Brand-dependent colors (selected gender, guardian tile) are applied inline.
export const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.md,
  },
  fieldErrorBorder: {
    borderColor: colors.error,
  },

  // ── Gender ──────────────────────────────────────────────────
  genderRow: {
    flexDirection: 'row',
    gap: spacing.sm + 4,
  },
  genderCardWrapper: {
    flex: 1,
  },
  genderCard: {
    minHeight: 56,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  genderLabel: {
    fontSize: 15,
    fontFamily: fontFamily.bodyMedium,
    color: colors.text,
  },

  // ── Date of birth (matches Input) ───────────────────────────
  dobField: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  dobBody: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
  },
  dobLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textMuted,
    marginBottom: 2,
  },
  dobValue: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: fontFamily.bodyRegular,
    color: colors.text,
  },
  dobPlaceholder: {
    color: colors.textDim,
  },
  agePill: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
  },
  agePillText: {
    fontSize: 12,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textMuted,
  },

  // ── Parent or guardian ──────────────────────────────────────
  guardianHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  guardianIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guardianText: {
    flex: 1,
  },
  guardianTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: fontFamily.bodyMedium,
    color: colors.text,
  },
  guardianSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  minorBadge: {
    backgroundColor: colors.warningDim,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
  },
  minorBadgeText: {
    fontSize: 11,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.warningDark,
  },
  guardianFields: {
    marginTop: spacing.md,
  },
});
