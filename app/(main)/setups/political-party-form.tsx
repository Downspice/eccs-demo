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
              placeholder='e.g. National Democratic Congress'
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

      {/* Abbreviation */}
      <div className='flex flex-col gap-1.5'>
        <Label.Root htmlFor='abbreviation'>Abbreviation / Acronym</Label.Root>
        <Input.Root
          hasError={Boolean(touched.abbreviation && errors.abbreviation)}
        >
          <Input.Wrapper>
            <input
              id='abbreviation'
              name='abbreviation'
              type='text'
              disabled={disabled}
              placeholder='e.g. NDC, NPP'
              value={values.abbreviation || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className='w-full bg-transparent px-3 py-2 text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none disabled:opacity-50 uppercase'
            />
          </Input.Wrapper>
        </Input.Root>
        {touched.abbreviation && errors.abbreviation ? (
          <Hint.Root hasError>{errors.abbreviation}</Hint.Root>
        ) : (
          <p className='text-paragraph-xs text-text-soft-400'>
            Short party acronym displayed on ballots, manifests, and badges.
          </p>
        )}
      </div>
    </div>
  );
}

export default PoliticalPartyForm;
