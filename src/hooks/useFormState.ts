
import { useState, useCallback } from 'react';
import { validateForm, validateField, ValidationResult } from '@/utils/formValidation';

interface FormOptions<T> {
  initialValues: T;
  validationSchema?: Record<keyof T, Parameters<typeof validateField>[2]>;
  onSubmit?: (values: T) => void | Promise<void>;
}

/**
 * Custom hook for form state management with validation
 */
export function useFormState<T extends Record<string, any>>({
  initialValues,
  validationSchema = {} as Record<keyof T, Parameters<typeof validateField>[2]>,
  onSubmit
}: FormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle input change
  const handleChange = useCallback((
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when edited
    if (errors[name as keyof T]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof T];
        return newErrors;
      });
    }
  }, [errors]);
  
  // Handle custom value change (for components without standard events)
  const setValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);
  
  // Validate single field
  const validateSingleField = useCallback((name: keyof T) => {
    if (!validationSchema[name]) return '';
    
    const error = validateField(
      name as string,
      values[name] as string, 
      validationSchema[name]
    );
    
    setErrors(prev => ({
      ...prev,
      [name]: error || undefined
    }));
    
    return error;
  }, [values, validationSchema]);
  
  // Validate all form fields
  const validateAllFields = useCallback((): ValidationResult => {
    if (Object.keys(validationSchema).length === 0) {
      return { isValid: true, errors: {} };
    }
    
    const result = validateForm(values, validationSchema);
    setErrors(result.errors);
    return result;
  }, [values, validationSchema]);
  
  // Handle form submission
  const handleSubmit = useCallback(async (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    
    const validationResult = validateAllFields();
    
    if (validationResult.isValid && onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, validateAllFields, onSubmit]);
  
  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    setValue,
    validateField: validateSingleField,
    validateForm: validateAllFields,
    handleSubmit,
    setValues,
    reset: () => setValues(initialValues)
  };
}
