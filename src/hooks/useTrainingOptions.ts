import { useCallback, useState } from 'react';
import {
  Branch,
  Coach,
  Group,
  SubscriptionPlan,
  getBranches,
  getClubGroups,
  getCoaches,
  getSubscriptionPlans,
} from '../api/services/registration.service';

interface TrainingOptions {
  branches: Branch[];
  plans: SubscriptionPlan[];
  coaches: Coach[];
  /** Every scheduled group: which types and coaches still have a spot. */
  groups: Group[];
}

/**
 * The club's branches, plans and coaches in one load — for the review screen's
 * Training edit sheet, which offers all three at once. Loaded on demand, since
 * most swimmers never open it.
 */
export const useTrainingOptions = (clubSlug: string | null) => {
  const [options, setOptions] = useState<TrainingOptions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [branches, plans, coaches, groups] = await Promise.all([
        getBranches(),
        getSubscriptionPlans(),
        getCoaches(),
        clubSlug ? getClubGroups(clubSlug) : Promise.resolve([] as Group[]),
      ]);
      setOptions({ branches, plans, coaches, groups });
    } catch {
      setError("Couldn't load the club's branches, plans and coaches.");
    } finally {
      setIsLoading(false);
    }
  }, [clubSlug]);

  return { options, isLoading, error, load };
};
