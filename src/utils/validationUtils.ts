import { VALIDATION_RULES, EXCHANGE_RULES } from '../constants';
import { ProductType } from '../types/Common';

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation (US format)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  return phoneRegex.test(phone);
};

// SSN validation (basic format check)
export const isValidSSN = (ssn: string): boolean => {
  const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;
  return ssnRegex.test(ssn);
};

// ZIP code validation
export const isValidZipCode = (zipCode: string): boolean => {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zipCode);
};

// Password validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < VALIDATION_RULES.MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${VALIDATION_RULES.MIN_PASSWORD_LENGTH} characters long`);
  }

  if (VALIDATION_RULES.PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (VALIDATION_RULES.PASSWORD_REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (VALIDATION_RULES.PASSWORD_REQUIRE_NUMBERS && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (VALIDATION_RULES.PASSWORD_REQUIRE_SYMBOLS && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Exchange value validation
export const isValidExchangeValue = (value: number): boolean => {
  return value >= VALIDATION_RULES.MIN_EXCHANGE_VALUE && 
         value <= VALIDATION_RULES.MAX_EXCHANGE_VALUE;
};

// 1035 Exchange eligibility validation
export const isEligibleFor1035Exchange = (
  sourceType: ProductType, 
  targetType: ProductType
): boolean => {
  const eligibleTargets = EXCHANGE_RULES.ELIGIBLE_EXCHANGES[sourceType];
  return eligibleTargets.includes(targetType);
};

// Outstanding loan validation
export const isValidOutstandingLoan = (
  outstandingLoan: number, 
  surrenderValue: number
): boolean => {
  if (surrenderValue === 0) return outstandingLoan === 0;
  const loanRatio = outstandingLoan / surrenderValue;
  return loanRatio <= VALIDATION_RULES.VALIDATION_REQUIREMENTS.OUTSTANDING_LOAN_THRESHOLD;
};

// File validation
export const isValidFileType = (mimeType: string): boolean => {
  return VALIDATION_RULES.ALLOWED_DOCUMENT_TYPES.includes(mimeType);
};

export const isValidFileSize = (sizeInBytes: number): boolean => {
  const maxSizeInBytes = VALIDATION_RULES.MAX_DOCUMENT_SIZE_MB * 1024 * 1024;
  return sizeInBytes <= maxSizeInBytes;
};

// Age validation (for date of birth)
export const isValidAge = (dateOfBirth: Date, minAge: number = 0, maxAge: number = 120): boolean => {
  const today = new Date();
  const age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  
  const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate()) 
    ? age - 1 
    : age;

  return actualAge >= minAge && actualAge <= maxAge;
};

// Required field validation
export const isRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

// Form validation helper
export const validateForm = (
  data: Record<string, any>, 
  rules: Record<string, (value: any) => boolean | { isValid: boolean; error: string }>
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  Object.entries(rules).forEach(([field, validator]) => {
    const value = data[field];
    const result = validator(value);

    if (typeof result === 'boolean') {
      if (!result) {
        errors[field] = `${field} is invalid`;
      }
    } else {
      if (!result.isValid) {
        errors[field] = result.error;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Sanitization utilities
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, '');
};

export const sanitizeNumber = (value: any): number | null => {
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
};

export const sanitizeDate = (value: any): Date | null => {
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
};