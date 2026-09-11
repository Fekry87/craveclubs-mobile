export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};

/** Login accepts either an email or a phone number (>= 7 digits). */
export const isValidLoginIdentifier = (value: string): boolean => {
  const v = value.trim();
  if (isValidEmail(v)) return true;
  return v.replace(/\D/g, '').length >= 7;
};

export const validateLoginForm = (
  email: string,
  password: string,
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!isNotEmpty(email)) {
    errors.email = 'Email or phone is required';
  } else if (!isValidLoginIdentifier(email)) {
    errors.email = 'Enter a valid email or phone number';
  }

  if (!isNotEmpty(password)) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
