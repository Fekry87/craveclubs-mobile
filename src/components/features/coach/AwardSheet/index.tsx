import React, { useCallback, useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { FormSheet } from '../../../common/FormSheet';
import { Icon } from '../../../common/Icon';
import { SelectCard } from '../../registration/SelectCard';
import { coachService } from '../../../../api/services/coach.service';
import { AwardType, SwimmerAwardInterface } from '../../../../types/models.types';
import {
  AWARD_HINTS,
  AWARD_ICONS,
  AWARD_LABELS,
  AWARD_TYPES,
} from '../../../../utils/awards';
import { colors } from '../../../../theme';
import { styles } from './styles';

interface AwardSheetProps {
  visible: boolean;
  swimmerId: number | null;
  swimmerName: string;
  onClose: () => void;
  /** The server accepted the award; the parent decides how to confirm it. */
  onAwarded: (award: SwimmerAwardInterface) => void;
}

interface ValidationErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * The server's own message for a refused award (a 422 names the swimmer as
 * outside the coach's groups); anything else gets a generic line — raw
 * server errors never reach the screen.
 */
const describeAwardError = (err: unknown): string => {
  const response = (err as { response?: { status?: number; data?: ValidationErrorBody } })
    .response;
  if (response?.status === 422) {
    const first = Object.values(response.data?.errors ?? {})[0]?.[0];
    if (first) return first;
    if (response.data?.message) return response.data.message;
  }
  if (response?.status === 403) {
    return 'Awards are not enabled for this club.';
  }
  return "We couldn't give this award. Please try again.";
};

/**
 * Bottom sheet the coach opens from a roster row: pick Man of the Day, Week
 * or Month, then "Give award". Reuses `FormSheet` (close discards, the pinned
 * button commits) and `SelectCard` (the same single-choice card the
 * registration steps use), so it looks like the rest of the app.
 */
export const AwardSheet: React.FC<AwardSheetProps> = ({
  visible,
  swimmerId,
  swimmerName,
  onClose,
  onAwarded,
}) => {
  const [type, setType] = useState<AwardType | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A fresh sheet for every swimmer.
  useEffect(() => {
    if (visible) {
      setType(null);
      setError(null);
      setSaving(false);
    }
  }, [visible, swimmerId]);

  const handleGive = useCallback(async () => {
    if (!type || swimmerId === null) return;
    setSaving(true);
    setError(null);
    try {
      const award = await coachService.giveAward(swimmerId, type);
      onAwarded(award);
    } catch (err: unknown) {
      setError(describeAwardError(err));
    } finally {
      setSaving(false);
    }
  }, [type, swimmerId, onAwarded]);

  return (
    <FormSheet
      visible={visible}
      title="Give an award"
      onClose={saving ? () => undefined : onClose}
      onSave={handleGive}
      saveTitle="Give award"
      saveDisabled={!type}
      saving={saving}
    >
      <Text style={styles.intro}>
        Name <Text style={styles.introName}>{swimmerName}</Text> the standout
        swimmer. The XP is added to their total right away.
      </Text>

      {AWARD_TYPES.map((value, index) => (
        <SelectCard
          key={value}
          title={AWARD_LABELS[value]}
          subtitle={AWARD_HINTS[value]}
          selected={type === value}
          onPress={() => setType(value)}
          index={index}
          leading={
            <View style={styles.iconTile}>
              <Icon name={AWARD_ICONS[value]} size={22} color={colors.warningDark} />
            </View>
          }
        />
      ))}

      {error && <Text style={styles.error}>{error}</Text>}
    </FormSheet>
  );
};
