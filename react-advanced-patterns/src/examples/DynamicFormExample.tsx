import React, { useState } from 'react';
import { DynamicForm, FieldConfig, FormData } from '../components/DynamicForm';

export function DynamicFormExample() {
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);

  const formFields: FieldConfig[] = [
    {
      type: 'text',
      name: 'firstName',
      label: 'First Name',
      placeholder: 'John',
      validation: {
        required: true,
        minLength: 2,
      },
    },
    {
      type: 'text',
      name: 'lastName',
      label: 'Last Name',
      placeholder: 'Doe',
      validation: {
        required: true,
        minLength: 2,
      },
    },
    {
      type: 'email',
      name: 'email',
      label: 'Email',
      placeholder: 'john.doe@example.com',
      validation: {
        required: true,
        pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
      },
    },
    {
      type: 'number',
      name: 'age',
      label: 'Age',
      defaultValue: 25,
      validation: {
        required: true,
        min: 18,
        max: 120,
      },
    },
    {
      type: 'select',
      name: 'country',
      label: 'Country',
      options: [
        { label: 'United States', value: 'us' },
        { label: 'United Kingdom', value: 'uk' },
        { label: 'Canada', value: 'ca' },
        { label: 'Australia', value: 'au' },
        { label: 'Germany', value: 'de' },
      ],
      validation: {
        required: true,
      },
    },
    {
      type: 'textarea',
      name: 'bio',
      label: 'Bio',
      placeholder: 'Tell us about yourself...',
      validation: {
        maxLength: 500,
      },
    },
    {
      type: 'checkbox',
      name: 'terms',
      label: 'I agree to the terms and conditions',
      validation: {
        custom: (value) => {
          if (!value) {
            return 'You must accept the terms and conditions';
          }
          return null;
        },
      },
    },
  ];

  const handleSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
    setSubmittedData(data);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Dynamic Form Engine Example</h2>
      <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
        This form is generated from JSON configuration with built-in validation.
      </p>

      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 1fr' }}>
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Form</h3>
          <DynamicForm fields={formFields} onSubmit={handleSubmit} />
        </div>

        <div>
          <h3 style={{ marginBottom: '1rem' }}>Configuration</h3>
          <pre
            style={{
              backgroundColor: '#f3f4f6',
              padding: '1rem',
              borderRadius: '0.375rem',
              overflow: 'auto',
              fontSize: '0.75rem',
              maxHeight: '400px',
            }}
          >
            {JSON.stringify(formFields, null, 2)}
          </pre>

          {submittedData && (
            <>
              <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Submitted Data</h3>
              <pre
                style={{
                  backgroundColor: '#d1fae5',
                  padding: '1rem',
                  borderRadius: '0.375rem',
                  overflow: 'auto',
                  fontSize: '0.875rem',
                }}
              >
                {JSON.stringify(submittedData, null, 2)}
              </pre>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
