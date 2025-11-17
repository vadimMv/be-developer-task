import React, { forwardRef, useEffect, useRef, useState, useCallback } from 'react';

interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  // Controlled mode
  value?: string;
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;

  // Uncontrolled mode
  defaultValue?: string;

  // Debounce settings
  debounceMs?: number;
  onDebouncedChange?: (value: string) => void;

  // Styling
  label?: string;
  error?: string;
}

/**
 * TextField component that supports both controlled and uncontrolled modes
 * Features:
 * - Controlled mode: pass `value` and `onChange`
 * - Uncontrolled mode: pass `defaultValue` and use `ref` to access input
 * - Debounced onChange: use `onDebouncedChange` for debounced updates
 * - forwardRef support for direct DOM access
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      value,
      onChange,
      defaultValue,
      debounceMs = 300,
      onDebouncedChange,
      label,
      error,
      className = '',
      ...inputProps
    },
    ref
  ) => {
    // Determine if component is controlled or uncontrolled
    const isControlled = value !== undefined;

    // Internal state for uncontrolled mode
    const [internalValue, setInternalValue] = useState(defaultValue || '');

    // Debounce timer ref
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Get current value based on controlled/uncontrolled mode
    const currentValue = isControlled ? value : internalValue;

    // Handle input change
    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;

        // Update internal state in uncontrolled mode
        if (!isControlled) {
          setInternalValue(newValue);
        }

        // Call immediate onChange if provided
        if (onChange) {
          onChange(newValue, event);
        }

        // Handle debounced change
        if (onDebouncedChange) {
          // Clear previous timer
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }

          // Set new timer
          debounceTimerRef.current = setTimeout(() => {
            onDebouncedChange(newValue);
          }, debounceMs);
        }
      },
      [isControlled, onChange, onDebouncedChange, debounceMs]
    );

    // Cleanup debounce timer on unmount
    useEffect(() => {
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }, []);

    return (
      <div className={`text-field ${className}`} style={{ marginBottom: '1rem' }}>
        {label && (
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          value={currentValue}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: `1px solid ${error ? '#ef4444' : '#d1d5db'}`,
            borderRadius: '0.375rem',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          {...inputProps}
        />
        {error && (
          <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {error}
          </div>
        )}
      </div>
    );
  }
);

TextField.displayName = 'TextField';
