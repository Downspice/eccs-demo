'use client';

import * as React from 'react';
import type { FormikErrors, FormikTouched } from 'formik';

import * as Hint from '@/components/ui/hint';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Switch from '@/components/ui/switch';
import * as Textarea from '@/components/ui/textarea';

import type { SetupFormData } from './types';

interface SetupFormProps {
  values: SetupFormData;
  errors: FormikErrors<SetupFormData>;
  touched: FormikTouched<SetupFormData>;
  handleChange: (e: React.ChangeEvent<any>) => void;
  handleBlur: (e: React.FocusEvent<any>) => void;
  setFieldValue: (field: string, value: any) => void;
  disabled?: boolean;
}

export function SetupForm({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
  disabled,
}: SetupFormProps) {
  return (
    <div className='flex flex-col gap-4'>
      {/* Level Name & Code Grid */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <div className='flex flex-col gap-1.5'>
          <Label.Root htmlFor='name'>Level Identifier</Label.Root>
          <Input.Root hasError={Boolean(touched.name && errors.name)}>
            <Input.Wrapper>
              <input
                id='name'
                name='name'
                type='text'
                disabled={disabled}
                placeholder='e.g. Level 1'
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className='w-full bg-transparent px-3 py-2 text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none disabled:opacity-50'
              />
            </Input.Wrapper>
          </Input.Root>
          {touched.name && errors.name && (
            <Hint.Root hasError>{errors.name}</Hint.Root>
          )}
        </div>

        <div className='flex flex-col gap-1.5'>
          <Label.Root htmlFor='code'>Level Code</Label.Root>
          <Input.Root hasError={Boolean(touched.code && errors.code)}>
            <Input.Wrapper>
              <input
                id='code'
                name='code'
                type='text'
                disabled={disabled}
                placeholder='e.g. LVL-01'
                value={values.code}
                onChange={(e) =>
                  setFieldValue('code', e.target.value.toUpperCase())
                }
                onBlur={handleBlur}
                className='w-full bg-transparent px-3 py-2 font-mono text-paragraph-sm uppercase text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none disabled:opacity-50'
              />
            </Input.Wrapper>
          </Input.Root>
          {touched.code && errors.code && (
            <Hint.Root hasError>{errors.code}</Hint.Root>
          )}
        </div>
      </div>

      {/* Level Title */}
      <div className='flex flex-col gap-1.5'>
        <Label.Root htmlFor='title'>Classification Title</Label.Root>
        <Input.Root hasError={Boolean(touched.title && errors.title)}>
          <Input.Wrapper>
            <input
              id='title'
              name='title'
              type='text'
              disabled={disabled}
              placeholder='e.g. Foundational Hygiene'
              value={values.title}
              onChange={handleChange}
              onBlur={handleBlur}
              className='w-full bg-transparent px-3 py-2 text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none disabled:opacity-50'
            />
          </Input.Wrapper>
        </Input.Root>
        {touched.title && errors.title && (
          <Hint.Root hasError>{errors.title}</Hint.Root>
        )}
      </div>

      {/* Minimum Controls Required */}
      <div className='flex flex-col gap-1.5'>
        <Label.Root htmlFor='controlsCount'>Controls Required</Label.Root>
        <Input.Root
          hasError={Boolean(touched.controlsCount && errors.controlsCount)}
        >
          <Input.Wrapper>
            <input
              id='controlsCount'
              name='controlsCount'
              type='number'
              min='1'
              disabled={disabled}
              placeholder='e.g. 18'
              value={values.controlsCount || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className='w-full bg-transparent px-3 py-2 text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none disabled:opacity-50'
            />
          </Input.Wrapper>
        </Input.Root>
        {touched.controlsCount && errors.controlsCount && (
          <Hint.Root hasError>{errors.controlsCount}</Hint.Root>
        )}
      </div>

      {/* Description Field */}
      <div className='flex flex-col gap-1.5'>
        <Label.Root htmlFor='description'>Description & Scope</Label.Root>
        <Textarea.Root
          id='description'
          name='description'
          simple
          hasError={Boolean(touched.description && errors.description)}
          disabled={disabled}
          placeholder='Safeguarding criteria, control objectives, and auditing guidance for this level...'
          value={values.description || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          rows={3}
        />
        {touched.description && errors.description && (
          <Hint.Root hasError>{errors.description}</Hint.Root>
        )}
      </div>

      {/* Active Status Switch */}
      <div className='mt-1 flex items-center justify-between rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-3'>
        <div className='flex flex-col'>
          <span className='text-label-sm font-medium text-text-strong-950'>
            Activate Level Certification
          </span>
          <span className='text-paragraph-xs text-text-sub-600'>
            When active, this level is enforced in compliance audits and
            certification scoring.
          </span>
        </div>
        <Switch.Root
          checked={values.isEnabled}
          onCheckedChange={(checked) => setFieldValue('isEnabled', checked)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

export default SetupForm;
