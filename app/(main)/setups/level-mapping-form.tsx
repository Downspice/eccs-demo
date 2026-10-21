'use client';

import * as React from 'react';
import { useGetElections, type ElectionItem } from '@/services/elections';
import {
  useGetLevelMappings,
  type LevelMappingGroup,
  type LevelMappingItem,
} from '@/services/level-mappings';
import { useGetLevels, type LevelItem } from '@/services/levels';
import { RiCheckLine } from '@remixicon/react';
import type { FormikErrors, FormikTouched } from 'formik';

import * as Hint from '@/components/ui/hint';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { LevelMappingSearchSelect } from '@/components/level-mapping-search-select';

import type { LevelMappingFormData } from './types';

interface LevelMappingFormProps {
  values: LevelMappingFormData;
  errors: FormikErrors<LevelMappingFormData>;
  touched: FormikTouched<LevelMappingFormData>;
  handleChange: (e: React.ChangeEvent<any>) => void;
  handleBlur: (e: React.FocusEvent<any>) => void;
  setFieldValue: (field: string, value: any) => void;
  disabled?: boolean;
  parentItem?: LevelMappingItem | null;
}

export function LevelMappingForm({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
  disabled,
  parentItem,
}: LevelMappingFormProps) {
  const { data: rawElections, isLoading: isElectionsLoading } =
    useGetElections();
  const { data: rawLevels, isLoading: isLevelsLoading } = useGetLevels(
    values.electionId,
  );
  const { data: rawMappings, isLoading: isMappingsLoading } =
    useGetLevelMappings(values.electionId);

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

  const levels = React.useMemo<LevelItem[]>(() => {
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

  // Flatten all existing mappings from groups for upper-level selection
  const existingUnits = React.useMemo<LevelMappingItem[]>(() => {
    const flattened: LevelMappingItem[] = [];
    if (Array.isArray(rawMappings)) {
      rawMappings.forEach((group: LevelMappingGroup) => {
        if (Array.isArray(group.mappings)) {
          group.mappings.forEach((m) => {
            flattened.push({
              ...m,
              levelName: m.levelName || group.levelName,
            });
          });
        }
      });
    }
    // Guarantee parentItem is in existing units so Select label resolves correctly
    if (parentItem && !flattened.some((u) => u.id === parentItem.id)) {
      flattened.push({
        ...parentItem,
        levelName: parentItem.levelName || 'Parent Jurisdiction',
      });
    }
    return flattened;
  }, [rawMappings, parentItem]);

  return (
    <div className='flex flex-col gap-4'>
      {/* Unit Name */}
      <div className='flex flex-col gap-1.5'>
        <Label.Root htmlFor='name'>Unit / Jurisdiction Name</Label.Root>
        <Input.Root hasError={Boolean(touched.name && errors.name)}>
          <Input.Wrapper>
            <input
              id='name'
              name='name'
              type='text'
              autoFocus={Boolean(parentItem)}
              disabled={disabled}
              placeholder='e.g. Anlo Constituency, Tegbi Electoral Area, Whuti EP Church'
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
            onValueChange={(val) => {
              setFieldValue('electionId', val);
              // Reset level and upper level when election changes
              setFieldValue('levelId', '');
              setFieldValue('upper_level_id', '');
            }}
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

      {/* Hierarchy Level Tier */}
      <div className='flex flex-col gap-1.5'>
        <Label.Root htmlFor='levelId'>Hierarchy Level Tier</Label.Root>
        {isLevelsLoading ? (
          <Skeleton className='h-10 w-full rounded-lg' />
        ) : levels.length > 0 ? (
          <Select.Root
            value={values.levelId}
            onValueChange={(val) => setFieldValue('levelId', val)}
            disabled={disabled || isLevelsLoading}
            hasError={Boolean(touched.levelId && errors.levelId)}
          >
            <Select.Trigger id='levelId' className='w-full'>
              <Select.Value placeholder='Select hierarchy tier...' />
            </Select.Trigger>
            <Select.Content position='popper'>
              {levels.map((lvl) => (
                <Select.Item key={lvl.id} value={lvl.id}>
                  {lvl.name} (Rank {lvl.levelRank ?? 1})
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        ) : (
          <Input.Root hasError={Boolean(touched.levelId && errors.levelId)}>
            <Input.Wrapper>
              <input
                id='levelId'
                name='levelId'
                type='text'
                disabled={disabled}
                placeholder='Enter Level Tier'
                value={values.levelId}
                onChange={handleChange}
                onBlur={handleBlur}
                className='w-full bg-transparent px-3 py-2 text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none disabled:opacity-50'
              />
            </Input.Wrapper>
          </Input.Root>
        )}
        {touched.levelId && errors.levelId && (
          <Hint.Root hasError>{errors.levelId}</Hint.Root>
        )}
        {parentItem && values.levelId && !errors.levelId && (
          <span className='inline-flex items-center gap-1 text-[11px] font-medium text-primary-base'>
            <RiCheckLine className='size-3.5' />
            Suggested immediate subordinate tier
          </span>
        )}
      </div>

      {/* Parent / Upper Level Unit (Optional) */}
      <div className='flex flex-col gap-1.5'>
        <Label.Root htmlFor='upper_level_id'>
          Parent / Upper Level Unit (Optional)
        </Label.Root>
        {isMappingsLoading ? (
          <Skeleton className='h-10 w-full rounded-lg' />
        ) : (
          <LevelMappingSearchSelect
            id='upper_level_id'
            value={values.upper_level_id || ''}
            onChange={(val) => setFieldValue('upper_level_id', val)}
            onBlur={() =>
              handleBlur({ target: { name: 'upper_level_id' } } as any)
            }
            items={existingUnits.filter((u) => u.id !== values.id)}
            placeholder='None (Top-Level Jurisdiction)'
            disabled={disabled}
            hasError={Boolean(touched.upper_level_id && errors.upper_level_id)}
            allowClear
            clearLabel='None (Top-Level Jurisdiction)'
            searchPlaceholder='Search parent unit by name or tier...'
          />
        )}
        {parentItem && values.upper_level_id === parentItem.id && (
          <span className='inline-flex items-center gap-1 text-[11px] font-medium text-primary-base'>
            <RiCheckLine className='size-3.5' />
            Prefilled direct parent jurisdiction
          </span>
        )}
        <span className='text-[11px] text-text-soft-400'>
          Leave blank for top-level units (e.g. Constituencies). Select a parent
          for lower tiers (e.g. Electoral Areas belong to a Constituency).
        </span>
      </div>
    </div>
  );
}
