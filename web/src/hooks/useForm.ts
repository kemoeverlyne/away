import { useState, useCallback } from 'react';

type ValidationRule<T> = {
  validate: (value: T) => boolean;
  message: string;
};

type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

type FormErrors<T> = {
  [K in keyof T]?: string;
};

export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  validationRules?: ValidationRules<T>,
  onSubmit?: (values: T) => void | Promise<void>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    (name: keyof T, value: T[keyof T]) => {
      if (!validationRules?.[name]) return true;

      const rules = validationRules[name] as ValidationRule<T[keyof T]>[];
      const error = rules.find((rule) => !rule.validate(value))?.message;

      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));

      return !error;
    },
    [validationRules]
  );

  const handleChange = useCallback(
    (name: keyof T, value: T[keyof T]) => {
      setValues((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (validationRules) {
        validateField(name, value);
      }
    },
    [validateField, validationRules]
  );

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      if (!validationRules) {
        onSubmit?.(values);
        return;
      }

      let isValid = true;
      const newErrors: FormErrors<T> = {};

      Object.keys(values).forEach((key) => {
        const fieldName = key as keyof T;
        const fieldValue = values[fieldName];
        const fieldRules = validationRules[fieldName];

        if (fieldRules) {
          const error = fieldRules.find((rule) => !rule.validate(fieldValue))?.message;
          if (error) {
            isValid = false;
            newErrors[fieldName] = error;
          }
        }
      });

      setErrors(newErrors);

      if (isValid && onSubmit) {
        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [values, validationRules, onSubmit]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset,
    setValues,
  };
}; 