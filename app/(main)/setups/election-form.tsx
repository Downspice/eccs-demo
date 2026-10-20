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

      {/* Grid for Election Date & Expected Turnout */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        {/* Election Date */}
        <div className='flex flex-col gap-1.5'>
          <Label.Root htmlFor='electionDate'>Election Date</Label.Root>
          <Input.Root
            hasError={Boolean(touched.electionDate && errors.electionDate)}
          >
            <Input.Wrapper>
              <input
                id='electionDate'
                name='electionDate'
                type='date'
                disabled={disabled}
                value={values.electionDate || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                className='w-full bg-transparent px-3 py-2 text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none disabled:opacity-50'
              />
            </Input.Wrapper>
          </Input.Root>
          {touched.electionDate && errors.electionDate ? (
            <Hint.Root hasError>{errors.electionDate}</Hint.Root>
          ) : (
            <p className='text-paragraph-xs text-text-soft-400'>
              Scheduled date of polling.
            </p>
          )}
        </div>

        {/* Expected Turnout */}
        <div className='flex flex-col gap-1.5'>
          <Label.Root htmlFor='expectedTurnout'>Expected Turnout</Label.Root>
          <Input.Root
            hasError={Boolean(
              touched.expectedTurnout && errors.expectedTurnout,
            )}
          >
            <Input.Wrapper>
              <input
                id='expectedTurnout'
                name='expectedTurnout'
                type='number'
                min='0'
                disabled={disabled}
                placeholder='e.g. 100'
                value={values.expectedTurnout ?? ''}
                onChange={handleChange}
                onBlur={handleBlur}
                className='w-full bg-transparent px-3 py-2 text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none disabled:opacity-50'
              />
            </Input.Wrapper>
          </Input.Root>
          {touched.expectedTurnout && errors.expectedTurnout ? (
            <Hint.Root hasError>{errors.expectedTurnout}</Hint.Root>
          ) : (
            <p className='text-paragraph-xs text-text-soft-400'>
              Estimated number of voters.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ElectionForm;
