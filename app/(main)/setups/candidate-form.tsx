'use client';

import * as React from 'react';
import { useGetElections, type ElectionItem } from '@/services/elections';
import {
  useGetPoliticalParties,
  type PoliticalPartyItem,
} from '@/services/political-parties';
import type { FormikErrors, FormikTouched } from 'formik';

import * as Hint from '@/components/ui/hint';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

import type { CandidateFormData } from './types';

interface CandidateFormProps {
  values: CandidateFormData;
  errors: FormikErrors<CandidateFormData>;
  touched: FormikTouched<CandidateFormData>;
  handleChange: (e: React.ChangeEvent<any>) => void;
  handleBlur: (e: React.FocusEvent<any>) => void;
  setFieldValue: (field: string, value: any) => void;
  disabled?: boolean;
}

export function CandidateForm({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
  disabled,
}: CandidateFormProps) {
  const { data: rawElections, isLoading: isElectionsLoading } =
    useGetElections();
  const { data: rawParties, isLoading: isPartiesLoading } =
    useGetPoliticalParties();

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

  const politicalParties = React.useMemo<PoliticalPartyItem[]>(() => {
    if (Array.isArray(rawParties)) return rawParties;
    if (
      rawParties &&
      typeof rawParties === 'object' &&
      Array.isArray((rawParties as { data?: PoliticalPartyItem[] }).data)
    ) {
      return (rawParties as { data: PoliticalPartyItem[] }).data;
    }
    return [];
  }, [rawParties]);

  return (
    <div className='flex flex-col gap-4'>
      {/* Candidate Name */}
      <div className='flex flex-col gap-1.5'>
        <Label.Root htmlFor='name'>Candidate Full Name</Label.Root>
        <Input.Root hasError={Boolean(touched.name && errors.name)}>
          <Input.Wrapper>
            <input
              id='name'
              name='name'
              type='text'
              disabled={disabled}
              placeholder='e.g. Kwame Mensah, John Doe'
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

      {/* Associated Election */}
      <div className='flex flex-col gap-1.5'>
        <Label.Root htmlFor='electionId'>Election</Label.Root>
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
                placeholder='Enter Election'
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

      {/* Political Party Selection */}
      <div className='flex flex-col gap-1.5'>
        <Label.Root htmlFor='politicalPartyId'>Political Party</Label.Root>
        {isPartiesLoading ? (
          <Skeleton className='h-10 w-full rounded-lg' />
        ) : politicalParties.length > 0 ? (
          <Select.Root
            value={values.politicalPartyId}
            onValueChange={(val) => setFieldValue('politicalPartyId', val)}
            disabled={disabled || isPartiesLoading}
            hasError={Boolean(
              touched.politicalPartyId && errors.politicalPartyId,
            )}
          >
            <Select.Trigger id='politicalPartyId' className='w-full'>
              <Select.Value placeholder='Select political party...' />
            </Select.Trigger>
            <Select.Content position='popper'>
              {politicalParties.map((party) => (
                <Select.Item key={party.id} value={party.id}>
                  {party.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        ) : (
          <div className='flex flex-col gap-1'>
            <Input.Root
              hasError={Boolean(
                touched.politicalPartyId && errors.politicalPartyId,
              )}
            >
              <Input.Wrapper>
                <input
                  id='politicalPartyId'
                  name='politicalPartyId'
                  type='text'
                  disabled={disabled}
                  placeholder='Enter Political Party'
                  value={values.politicalPartyId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className='w-full bg-transparent px-3 py-2 text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none disabled:opacity-50'
                />
              </Input.Wrapper>
            </Input.Root>
            <span className='text-[11px] text-text-soft-400'>
              Note: You can register political parties in the Political Parties
              tab first.
            </span>
          </div>
        )}
        {touched.politicalPartyId && errors.politicalPartyId && (
          <Hint.Root hasError>{errors.politicalPartyId}</Hint.Root>
        )}
      </div>

      {/* Photo URL */}
      <div className='flex flex-col gap-1.5'>
        <Label.Root htmlFor='imagePath'>
          Candidate Image / Photo URL (Optional)
        </Label.Root>
        <Input.Root hasError={Boolean(touched.imagePath && errors.imagePath)}>
          <Input.Wrapper>
            <input
              id='imagePath'
              name='imagePath'
              type='text'
              disabled={disabled}
              placeholder='/images/candidate.png'
              value={values.imagePath || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className='w-full bg-transparent px-3 py-2 text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none disabled:opacity-50'
            />
          </Input.Wrapper>
        </Input.Root>
        {touched.imagePath && errors.imagePath && (
          <Hint.Root hasError>{errors.imagePath}</Hint.Root>
        )}
      </div>
    </div>
  );
}
