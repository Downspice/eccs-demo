'use client';

import * as React from 'react';
import type { FormikErrors, FormikTouched } from 'formik';

import * as Hint from '@/components/ui/hint';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';

import type { PoliticalPartyFormData } from './types';

interface PoliticalPartyFormProps {
  values: PoliticalPartyFormData;
  errors: FormikErrors<PoliticalPartyFormData>;
  touched: FormikTouched<PoliticalPartyFormData>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleBlur: (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  setFieldValue: (field: string, value: unknown) => void;
  disabled?: boolean;
  partyId?: string;
}

export function PoliticalPartyForm({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  disabled,
  partyId,
}: PoliticalPartyFormProps) {
  return (
    <div className='flex flex-col gap-4'>
      {/* If updating, display the immutable System UUID */}
      {partyId && (
        <div className='flex flex-col gap-1.5'>
          <Label.Root>Party Identifier (UUID)</Label.Root>
          <div className='rounded-lg bg-bg-weak-50 px-3 py-2 font-mono text-label-xs text-text-sub-600'>
            {partyId}
          </div>
        </div>
      )}

      {/* Party Name */}
      <div className='flex flex-col gap-1.5'>
        <Label.Root htmlFor='name'>Party Name</Label.Root>
        <Input.Root hasError={Boolean(touched.name && errors.name)}>
          <Input.Wrapper>
            <input
              id='name'
              name='name'
              type='text'
              disabled={disabled}
              placeholder='e.g. Democratic Alliance, Green Progress Party'
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
            Enter the registered legal name of the political organization or
            party.
          </p>
        )}
      </div>
    </div>
  );
}

export default PoliticalPartyForm;
