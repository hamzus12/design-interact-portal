
/**
 * Form validation utility functions
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates a field against common validation rules
 * @param name Field name
 * @param value Field value
 * @param rules Validation rules
 * @returns Error message or empty string if valid
 */
export const validateField = (
  name: string, 
  value: string, 
  rules: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => string | null;
  }
): string => {
  if (rules.required && !value.trim()) {
    return `${name} is required`;
  }
  
  if (rules.minLength && value.trim().length < rules.minLength) {
    return `${name} must be at least ${rules.minLength} characters`;
  }
  
  if (rules.maxLength && value.trim().length > rules.maxLength) {
    return `${name} must be at most ${rules.maxLength} characters`;
  }
  
  if (rules.pattern && !rules.pattern.test(value)) {
    return `${name} has an invalid format`;
  }
  
  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) return customError;
  }
  
  return '';
};

/**
 * Validates an entire form based on provided validation schema
 * @param values Form values
 * @param schema Validation schema
 * @returns Validation result
 */
export const validateForm = <T extends Record<string, any>>(
  values: T,
  schema: Record<keyof T, Parameters<typeof validateField>[2]>
): ValidationResult => {
  const errors: Record<string, string> = {};
  
  for (const field in schema) {
    if (Object.prototype.hasOwnProperty.call(schema, field)) {
      const error = validateField(
        field as string,
        values[field] as string,
        schema[field]
      );
      
      if (error) {
        errors[field] = error;
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
