'use client';

import * as React from 'react';
import type { FormikErrors, FormikTouched } from 'formik';

import * as Hint from '@/components/ui/hint';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';

import type { ElectionFormData } from './types';

interface ElectionFormProps {
  values: ElectionFormData;
  errors: FormikErrors<ElectionFormData>;
  touched: FormikTouched<ElectionFormData>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleBlur: (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  setFieldValue: (field: string, value: unknown) => void;
  disabled?: boolean;
  electionId?: string;
}

export function ElectionForm({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  disabled,
  electionId,
}: ElectionFormProps) {
  return (
    <div className='flex flex-col gap-4'>
      {/* If updating, display the immutable System UUID */}
      {electionId && (
        <div className='flex flex-col gap-1.5'>
          <Label.Root>Election Identifier (UUID)</Label.Root>
          <div className='rounded-lg bg-bg-weak-50 px-3 py-2 font-mono text-label-xs text-text-sub-600'>
            {electionId}
          </div>
        </div>
      )}

      {/* Election Name */}
      <div className='flex flex-col gap-1.5'>
        <Label.Root htmlFor='name'>Election Name</Label.Root>
        <Input.Root hasError={Boolean(touched.name && errors.name)}>
          <Input.Wrapper>
            <input
              id='name'
              name='name'
              type='text'
              disabled={disabled}
              placeholder='e.g. 2026 Presidential General Election'
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className='w-full bg-transparent px-3 py-2 text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none disabled:opacity-50'
            />
          </Input.Wrapper>
        </Input.Root>
        {touched.name && errors.name ? (
          <Hint.Root hasError>{errors.name}</Hint.Root>
        ) : (
          <p className='text-paragraph-xs text-text-soft-400'>
            Provide the formal title used across ballot manifests and reporting
            systems.
          </p>
        )}
      </div>
    </div>
  );
}

export default ElectionForm;
