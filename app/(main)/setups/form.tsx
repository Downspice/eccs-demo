'use client';

import * as React from 'react';
import { useGetElections, type ElectionItem } from '@/services/elections';
import { useGetLevels, type LevelItem } from '@/services/levels';
import type { FormikErrors, FormikTouched } from 'formik';

import * as Hint from '@/components/ui/hint';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
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
  const { data: rawElections, isLoading: isElectionsLoading } =
    useGetElections();
  const { data: rawLevels } = useGetLevels(values.electionId);

  const elections = React.useMemo<ElectionItem[]>(() => {
    if (Array.isArray(rawElections)) return rawElections;
    if (
      rawElections &&
      typeof rawElections === 'object' &&
      Array.isArray((rawElections as { data?: ElectionItem[] }).data)
    ) {
      return (rawElections as { data: ElectionItem[] }).data;
    }
    return [];
  }, [rawElections]);

  const existingLevels = React.useMemo<LevelItem[]>(() => {
    if (Array.isArray(rawLevels)) return rawLevels;
    if (
      rawLevels &&
      typeof rawLevels === 'object' &&
      Array.isArray((rawLevels as { data?: LevelItem[] }).data)
    ) {
      return (rawLevels as { data: LevelItem[] }).data;
    }
    return [];
  }, [rawLevels]);

  const existingRanks = React.useMemo(() => {
    return existingLevels
      .map((l) => Number(l.levelRank))
      .filter((r) => !isNaN(r) && r > 0);
  }, [existingLevels]);

  return (
    <div className='flex flex-col gap-4'>
      {/* Level Name & Level Rank Grid */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        {/* Level Name (takes 2 columns) */}
        <div className='flex flex-col gap-1.5 sm:col-span-2'>
          <Label.Root htmlFor='name'>Level Name</Label.Root>
          <Input.Root hasError={Boolean(touched.name && errors.name)}>
            <Input.Wrapper>
              <input
                id='name'
                name='name'
                type='text'
                disabled={disabled}
                placeholder='e.g. Constituency, Electoral Area, Polling Station'
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

        {/* Level Rank (takes 1 column) */}
        <div className='flex flex-col gap-1.5'>
          <Label.Root htmlFor='levelRank'>Level Rank</Label.Root>
          <Input.Root hasError={Boolean(touched.levelRank && errors.levelRank)}>
            <Input.Wrapper>
              <input
                id='levelRank'
                name='levelRank'
                type='number'
                min='0'
                disabled={disabled}
                placeholder='e.g. 1'
                value={values.levelRank ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setFieldValue('levelRank', val === '' ? '' : Number(val));
                }}
                onBlur={handleBlur}
                className='w-full bg-transparent px-3 py-2 text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none disabled:opacity-50'
              />
            </Input.Wrapper>
          </Input.Root>
          {touched.levelRank && errors.levelRank ? (
            <Hint.Root hasError>{errors.levelRank}</Hint.Root>
          ) : existingRanks.length > 0 ? (
            <span className='text-[11px] text-text-soft-400'>
              Existing ranks: {existingRanks.sort((a, b) => a - b).join(', ')}
            </span>
          ) : null}
        </div>
      </div>

      {/* Associated Election Dropdown */}
      <div className='flex flex-col gap-1.5'>
        <Label.Root htmlFor='electionId'>Associated Election</Label.Root>
        {isElectionsLoading ? (
          <Skeleton className='h-10 w-full rounded-lg' />
        ) : elections.length > 0 ? (
          <Select.Root
            value={values.electionId}
            onValueChange={(val) => setFieldValue('electionId', val)}
            disabled={disabled || isElectionsLoading}
            hasError={Boolean(touched.electionId && errors.electionId)}
          >
            <Select.Trigger id='electionId' className='w-full'>
              <Select.Value placeholder='Select an election...' />
            </Select.Trigger>
            <Select.Content position='popper'>
              {elections.map((elec) => (
                <Select.Item key={elec.id} value={elec.id}>
                  {elec.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        ) : (
          <Input.Root
            hasError={Boolean(touched.electionId && errors.electionId)}
          >
            <Input.Wrapper>
              <input
                id='electionId'
                name='electionId'
                type='text'
                disabled={disabled}
                placeholder='Enter associated election name or identifier'
                value={values.electionId}
                onChange={handleChange}
                onBlur={handleBlur}
                className='w-full bg-transparent px-3 py-2 text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none disabled:opacity-50'
              />
            </Input.Wrapper>
          </Input.Root>
        )}
        {touched.electionId && errors.electionId && (
          <Hint.Root hasError>{errors.electionId}</Hint.Root>
        )}
      </div>

      {/* Description Field */}
      <div className='flex flex-col gap-1.5'>
        <Label.Root htmlFor='description'>Description</Label.Root>
        <Textarea.Root
          id='description'
          name='description'
          simple
          hasError={Boolean(touched.description && errors.description)}
          disabled={disabled}
          placeholder='Describe the administrative hierarchy, role, or scope of this level...'
          value={values.description || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          rows={3}
        />
        {touched.description && errors.description && (
          <Hint.Root hasError>{errors.description}</Hint.Root>
        )}
      </div>
    </div>
  );
}

export default SetupForm;
