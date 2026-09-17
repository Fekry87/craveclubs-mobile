import { useCallback, useState } from 'react';
import {
  Branch,
  Coach,
  SubscriptionPlan,
  getBranches,
  getCoaches,
  getSubscriptionPlans,
} from '../api/services/registration.service';

interface TrainingOptions {
  branches: Branch[];
  plans: SubscriptionPlan[];
  coaches: Coach[];
}

/**
 * The club's branches, plans and coaches in one load — for the review screen's
 * Training edit sheet, which offers all three at once. Loaded on demand, since
 * most swimmers never open it.
 */
export const useTrainingOptions = () => {
  const [options, setOptions] = useState<TrainingOptions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [branches, plans, coaches] = await Promise.all([
        getBranches(),
        getSubscriptionPlans(),
        getCoaches(),
      ]);
      setOptions({ branches, plans, coaches });
    } catch {
      setError("Couldn't load the club's branches, plans and coaches.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { options, isLoading, error, load };
};
