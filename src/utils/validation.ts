/**
 * RFC 5322 simplified email validation pattern
 * Validates email addresses according to a simplified version of RFC 5322 specification
 */
export const validateEmailFormat = (emailAddress: string): boolean => {
  const pattern =
    /^[^\s@]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return pattern.test(emailAddress);
};

/**
 * Validates that a string is not empty after trimming whitespace
 */
export const validateRequiredString = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Validates that an array meets a minimum length requirement
 */
export const validateMinArrayLength = (
  arr: unknown[],
  minLength: number
): boolean => {
  return arr.length >= minLength;
};

/**
 * Standard validation error messages
 */
export const validationMessages = {
  required: (fieldName: string) => `${fieldName} is required`,
  invalidEmail: 'Please provide a valid email address',
  minEcosystems: 'Select at least one ecosystem type',
} as const;
