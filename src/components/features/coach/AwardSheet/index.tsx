import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { FormSheet } from '../../../common/FormSheet';
import { Icon } from '../../../common/Icon';
import { Button } from '../../../common/Button';
import { SelectCard } from '../../registration/SelectCard';
import { coachService } from '../../../../api/services/coach.service';
import {
  AwardTypeOptionInterface,
  SwimmerAwardInterface,
} from '../../../../types/models.types';
import { AWARD_ICON } from '../../../../utils/awards';
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
 * Bottom sheet the coach opens from a roster row: pick one of the club's own
 * award titles (fetched from `GET /coach/award-types`), then "Give award".
 * Reuses `FormSheet` (close discards, the pinned button commits) and
 * `SelectCard` (the same single-choice card the registration steps use).
 */
export const AwardSheet: React.FC<AwardSheetProps> = ({
  visible,
  swimmerId,
  swimmerName,
  onClose,
  onAwarded,
}) => {
  const [types, setTypes] = useState<AwardTypeOptionInterface[] | null>(null);
  const [typesError, setTypesError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTypes = useCallback(async () => {
    setTypesError(null);
    try {
      const list = await coachService.getAwardTypes();
      setTypes(list);
    } catch {
      setTypes([]);
      setTypesError("We couldn't load the club's awards.");
    }
  }, []);

  // A fresh sheet for every swimmer; load the titles once per open.
  useEffect(() => {
    if (visible) {
      setSelectedId(null);
      setError(null);
      setSaving(false);
      if (types === null) loadTypes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reacts to opening only
  }, [visible, swimmerId]);

  const handleGive = useCallback(async () => {
    if (selectedId === null || swimmerId === null) return;
    setSaving(true);
    setError(null);
    try {
      const award = await coachService.giveAward(swimmerId, selectedId);
      onAwarded(award);
    } catch (err: unknown) {
      setError(describeAwardError(err));
    } finally {
      setSaving(false);
    }
  }, [selectedId, swimmerId, onAwarded]);

  const hasTypes = (types?.length ?? 0) > 0;

  return (
    <FormSheet
      visible={visible}
      title="Give an award"
      onClose={saving ? () => undefined : onClose}
      onSave={handleGive}
      saveTitle="Give award"
      saveDisabled={selectedId === null}
      saving={saving}
    >
      <Text style={styles.intro}>
        Name <Text style={styles.introName}>{swimmerName}</Text> the standout
        swimmer. The XP is added to their total right away.
      </Text>

      {types === null && (
        <View style={styles.status}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}

      {types !== null && typesError && (
        <View style={styles.status}>
          <Text style={styles.statusText}>{typesError}</Text>
          <Button title="Try again" variant="secondary" onPress={loadTypes} />
        </View>
      )}

      {types !== null && !typesError && !hasTypes && (
        <View style={styles.status}>
          <Icon name={AWARD_ICON} size={28} color={colors.textDim} />
          <Text style={styles.statusTitle}>No awards yet</Text>
          <Text style={styles.statusText}>
            Your club manager adds award titles in the portal, under Leaderboard.
          </Text>
        </View>
      )}

      {hasTypes &&
        types?.map((option, index) => (
          <SelectCard
            key={option.id}
            title={option.name}
            subtitle={`${option.xp_value} XP`}
            selected={selectedId === option.id}
            onPress={() => setSelectedId(option.id)}
            index={index}
            leading={
              <View style={styles.iconTile}>
                <Icon name={AWARD_ICON} size={22} color={colors.warningDark} />
              </View>
            }
          />
        ))}

      {error && <Text style={styles.error}>{error}</Text>}
    </FormSheet>
  );
};
