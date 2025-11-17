import React, { useState, useCallback, useMemo } from 'react';

// Field configuration types
export type FieldType = 'text' | 'number' | 'email' | 'password' | 'select' | 'textarea' | 'checkbox';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface FieldConfig {
  type: FieldType;
  name: string;
  label?: string;
  placeholder?: string;
  defaultValue?: unknown;
  options?: SelectOption[]; // For select fields
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    custom?: (value: unknown) => string | null; // Custom validation, returns error message or null
  };
}

export interface FormData {
  [key: string]: unknown;
}

export interface FormErrors {
  [key: string]: string;
}

interface DynamicFormProps {
  fields: FieldConfig[];
  onSubmit: (data: FormData) => void;
  onChange?: (data: FormData) => void;
  className?: string;
}

/**
 * DynamicForm component that renders form fields from JSON configuration
 *
 * Features:
 * - Schema-based rendering from JSON config
 * - Controlled components with internal state management
 * - Built-in validation (required, min, max, pattern, custom)
 * - Support for multiple field types
 * - Type-safe with TypeScript
 *
 * @param fields - Array of field configurations
 * @param onSubmit - Callback when form is submitted with valid data
 * @param onChange - Optional callback when any field changes
 */
export function DynamicForm({ fields, onSubmit, onChange, className = '' }: DynamicFormProps) {
  // Initialize form data with default values
  const initialData = useMemo(() => {
    const data: FormData = {};
    fields.forEach((field) => {
      data[field.name] = field.defaultValue ?? (field.type === 'checkbox' ? false : '');
    });
    return data;
  }, [fields]);

  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // Validate a single field
  const validateField = useCallback((field: FieldConfig, value: unknown): string | null => {
    const validation = field.validation;
    if (!validation) return null;

    // Required validation
    if (validation.required) {
      if (value === '' || value === null || value === undefined) {
        return `${field.label || field.name} is required`;
      }
    }

    // Type-specific validations
    if (field.type === 'number' && typeof value === 'number') {
      if (validation.min !== undefined && value < validation.min) {
        return `Must be at least ${validation.min}`;
      }
      if (validation.max !== undefined && value > validation.max) {
        return `Must be at most ${validation.max}`;
      }
    }

    // String validations
    if (typeof value === 'string') {
      if (validation.minLength !== undefined && value.length < validation.minLength) {
        return `Must be at least ${validation.minLength} characters`;
      }
      if (validation.maxLength !== undefined && value.length > validation.maxLength) {
        return `Must be at most ${validation.maxLength} characters`;
      }
      if (validation.pattern) {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(value)) {
          return 'Invalid format';
        }
      }
    }

    // Custom validation
    if (validation.custom) {
      return validation.custom(value);
    }

    return null;
  }, []);

  // Validate all fields
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    fields.forEach((field) => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [fields, formData, validateField]);

  // Handle field change
  const handleChange = useCallback(
    (fieldName: string, value: unknown) => {
      const newData = { ...formData, [fieldName]: value };
      setFormData(newData);

      // Validate field if it's been touched
      if (touched[fieldName]) {
        const field = fields.find((f) => f.name === fieldName);
        if (field) {
          const error = validateField(field, value);
          setErrors((prev) => ({
            ...prev,
            [fieldName]: error || '',
          }));
        }
      }

      // Call onChange callback
      if (onChange) {
        onChange(newData);
      }
    },
    [formData, touched, fields, validateField, onChange]
  );

  // Handle field blur
  const handleBlur = useCallback((fieldName: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));

    // Validate on blur
    const field = fields.find((f) => f.name === fieldName);
    if (field) {
      const error = validateField(field, formData[fieldName]);
      setErrors((prev) => ({
        ...prev,
        [fieldName]: error || '',
      }));
    }
  }, [fields, formData, validateField]);

  // Handle form submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      // Mark all fields as touched
      const allTouched: { [key: string]: boolean } = {};
      fields.forEach((field) => {
        allTouched[field.name] = true;
      });
      setTouched(allTouched);

      // Validate and submit
      if (validateForm()) {
        onSubmit(formData);
      }
    },
    [fields, formData, onSubmit, validateForm]
  );

  // Render field based on type
  const renderField = useCallback(
    (field: FieldConfig) => {
      const value = formData[field.name];
      const error = touched[field.name] ? errors[field.name] : '';
      const commonProps = {
        id: field.name,
        name: field.name,
        onBlur: () => handleBlur(field.name),
      };

      const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.5rem',
        border: `1px solid ${error ? '#ef4444' : '#d1d5db'}`,
        borderRadius: '0.375rem',
        fontSize: '1rem',
        outline: 'none',
      };

      switch (field.type) {
        case 'select':
          return (
            <select
              {...commonProps}
              value={value as string}
              onChange={(e) => handleChange(field.name, e.target.value)}
              style={inputStyle}
            >
              <option value="">Select...</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );

        case 'textarea':
          return (
            <textarea
              {...commonProps}
              value={value as string}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              style={inputStyle}
            />
          );

        case 'checkbox':
          return (
            <input
              {...commonProps}
              type="checkbox"
              checked={value as boolean}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              style={{ width: 'auto', marginRight: '0.5rem' }}
            />
          );

        case 'number':
          return (
            <input
              {...commonProps}
              type="number"
              value={value as number}
              onChange={(e) => handleChange(field.name, parseFloat(e.target.value) || 0)}
              placeholder={field.placeholder}
              style={inputStyle}
            />
          );

        default:
          return (
            <input
              {...commonProps}
              type={field.type}
              value={value as string}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              style={inputStyle}
            />
          );
      }
    },
    [formData, errors, touched, handleChange, handleBlur]
  );

  return (
    <form onSubmit={handleSubmit} className={className}>
      {fields.map((field) => (
        <div key={field.name} style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor={field.name}
            style={{
              display: field.type === 'checkbox' ? 'inline-flex' : 'block',
              alignItems: 'center',
              marginBottom: field.type === 'checkbox' ? 0 : '0.5rem',
              fontWeight: 500,
            }}
          >
            {field.type === 'checkbox' && renderField(field)}
            {field.label || field.name}
            {field.validation?.required && <span style={{ color: '#ef4444' }}> *</span>}
          </label>
          {field.type !== 'checkbox' && renderField(field)}
          {touched[field.name] && errors[field.name] && (
            <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {errors[field.name]}
            </div>
          )}
        </div>
      ))}
      <button
        type="submit"
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: 'pointer',
          fontWeight: 500,
          fontSize: '1rem',
        }}
      >
        Submit
      </button>
    </form>
  );
}
