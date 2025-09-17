import { useState, useCallback } from 'react';
import { validateFormInput, generateCSRFToken } from '@/lib/security';

interface FormField {
  value: string;
  error: string | null;
  touched: boolean;
}

interface FormConfig {
  [key: string]: {
    required?: boolean;
    validator?: (value: string) => string | null;
  };
}

export const useSecureForm = <T extends Record<string, any>>(
  initialValues: T,
  config: FormConfig = {}
) => {
  const [fields, setFields] = useState<Record<keyof T, FormField>>(
    Object.keys(initialValues).reduce((acc, key) => {
      acc[key as keyof T] = {
        value: initialValues[key] || '',
        error: null,
        touched: false
      };
      return acc;
    }, {} as Record<keyof T, FormField>)
  );

  const [csrfToken] = useState(() => generateCSRFToken());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((name: keyof T, value: string) => {
    const fieldConfig = config[name as string];
    const required = fieldConfig?.required ?? false;
    
    // Use custom validator if provided, otherwise use default validation
    if (fieldConfig?.validator) {
      return fieldConfig.validator(value);
    }
    
    return validateFormInput(name as string, value, required);
  }, [config]);

  const setFieldValue = useCallback((name: keyof T, value: string) => {
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        value,
        error: prev[name].touched ? validateField(name, value) : null
      }
    }));
  }, [validateField]);

  const setFieldTouched = useCallback((name: keyof T, touched: boolean = true) => {
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        touched,
        error: touched ? validateField(name, prev[name].value) : null
      }
    }));
  }, [validateField]);

  const validateAllFields = useCallback(() => {
    const newFields = { ...fields };
    let isValid = true;

    Object.keys(fields).forEach(key => {
      const typedKey = key as keyof T;
      const error = validateField(typedKey, fields[typedKey].value);
      newFields[typedKey] = {
        ...newFields[typedKey],
        touched: true,
        error
      };
      if (error) isValid = false;
    });

    setFields(newFields);
    return isValid;
  }, [fields, validateField]);

  const getFieldProps = useCallback((name: keyof T) => ({
    value: fields[name].value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
      setFieldValue(name, e.target.value),
    onBlur: () => setFieldTouched(name),
    error: fields[name].error,
    'data-field': name
  }), [fields, setFieldValue, setFieldTouched]);

  const getValues = useCallback(() => {
    return Object.keys(fields).reduce((acc, key) => {
      acc[key as keyof T] = fields[key as keyof T].value as T[keyof T];
      return acc;
    }, {} as T);
  }, [fields]);

  const reset = useCallback(() => {
    setFields(Object.keys(initialValues).reduce((acc, key) => {
      acc[key as keyof T] = {
        value: initialValues[key] || '',
        error: null,
        touched: false
      };
      return acc;
    }, {} as Record<keyof T, FormField>));
    setIsSubmitting(false);
  }, [initialValues]);

  const hasErrors = Object.values(fields).some(field => field.error !== null);
  const isValid = !hasErrors && Object.values(fields).every(field => field.touched);

  return {
    fields,
    setFieldValue,
    setFieldTouched,
    getFieldProps,
    getValues,
    validateAllFields,
    reset,
    isValid: isValid && !hasErrors,
    hasErrors,
    csrfToken,
    isSubmitting,
    setIsSubmitting
  };
};