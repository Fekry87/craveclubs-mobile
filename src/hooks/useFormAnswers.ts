import { useCallback, useState } from 'react';
import type { FieldErrors } from '../utils/registrationValidation';

/**
 * Local answers for a form section plus their errors. Changing a field clears
 * that field's error; `validate` runs the section's rules and keeps the errors
 * to show. `reset` reloads the answers (e.g. when an edit sheet reopens).
 */
export function useFormAnswers<T extends object>(initial: T) {
  const [answers, setAnswers] = useState<T>(initial);
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleChange = useCallback((patch: Partial<T>) => {
    setAnswers((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(patch).forEach((key) => delete next[key]);
      return next;
    });
  }, []);

  const validate = useCallback(
    (rules: (values: T) => FieldErrors): boolean => {
      const errs = rules(answers);
      setErrors(errs);
      return Object.keys(errs).length === 0;
    },
    [answers],
  );

  /** Show an error the rules couldn't know about — e.g. the server's answer. */
  const setFieldError = useCallback((key: keyof T & string, message: string) => {
    setErrors((prev) => ({ ...prev, [key]: message }));
  }, []);

  const reset = useCallback((values: T) => {
    setAnswers(values);
    setErrors({});
  }, []);

  return { answers, errors, handleChange, validate, setFieldError, reset };
}
