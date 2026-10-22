'use client';

import * as React from 'react';
import { useGetElections, type ElectionItem } from '@/services/elections';
import {
  useGetLevelMappings,
  type LevelMappingItem,
} from '@/services/level-mappings';
import { useGetLevels, type LevelItem } from '@/services/levels';
import {
  RiCheckLine,
  RiCloseLine,
  RiFileList3Line,
  RiInformationLine,
  RiStackLine,
} from '@remixicon/react';
import type { FormikErrors, FormikTouched } from 'formik';

import * as Badge from '@/components/ui/badge';
import * as Hint from '@/components/ui/hint';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import * as Textarea from '@/components/ui/textarea';
import { LevelMappingSearchSelect } from '@/components/level-mapping-search-select';

import type { BulkLevelMappingFormData } from './types';

interface BulkLevelMappingFormProps {
  values: BulkLevelMappingFormData;
  errors: FormikErrors<BulkLevelMappingFormData>;
  touched: FormikTouched<BulkLevelMappingFormData>;
  handleChange: (e: React.ChangeEvent<any>) => void;
  handleBlur: (e: React.FocusEvent<any>) => void;
  setFieldValue: (field: string, value: any) => void;
  disabled?: boolean;
  parentItem?: LevelMappingItem | null;
  onSwitchToSingle?: () => void;
}

export function parseUnitNames(text: string): string[] {
  if (!text) return [];
  return text
    .split(/[\n,]+/)
    .map((name) => name.trim())
    .filter((name) => name.length > 0);
}

export function BulkLevelMappingForm({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
  disabled,
  parentItem,
  onSwitchToSingle,
}: BulkLevelMappingFormProps) {
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

  const existingUnits = React.useMemo<LevelMappingItem[]>(() => {
    if (!rawMappings || !Array.isArray(rawMappings)) return [];
    return rawMappings.flatMap((group) => group.mappings || []);
  }, [rawMappings]);

  // Parse names for preview
  const parsedNames = React.useMemo(() => {
    return parseUnitNames(values.namesText);
  }, [values.namesText]);

  // Selected level tier details
  const selectedLevel = React.useMemo(() => {
    return levels.find((l) => l.id === values.levelId) || null;
  }, [levels, values.levelId]);

  // Remove a specific name from the text
  const handleRemoveName = (indexToRemove: number) => {
    const updated = parsedNames.filter((_, idx) => idx !== indexToRemove);
    setFieldValue('namesText', updated.join('\n'));
  };

  // Example insert helper
  const handleInsertSample = () => {
    const samplePrefix = selectedLevel?.name || 'Polling Station';
    const samples = [
      `01 - ${samplePrefix} A`,
      `02 - ${samplePrefix} B`,
      `03 - ${samplePrefix} C`,
      `04 - ${samplePrefix} D`,
    ];
    setFieldValue('namesText', samples.join('\n'));
  };

  return (
    <div className='flex flex-col gap-4'>
      {/* Switch Banner */}
      {onSwitchToSingle && (
        <div className='flex items-center justify-between rounded-xl bg-bg-weak-50 px-3.5 py-2 text-paragraph-xs ring-1 ring-inset ring-stroke-soft-200'>
          <div className='flex items-center gap-2 text-text-sub-600'>
            <RiStackLine className='size-4 text-primary-base shrink-0' />
            <span>Adding multiple jurisdictions at once.</span>
          </div>
          <button
            type='button'
            onClick={onSwitchToSingle}
            className='font-semibold text-primary-base hover:underline'
          >
            Switch to single mode
          </button>
        </div>
      )}

      {/* Grid: Election & Level Tier */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        {/* Election Selection */}
        <div className='flex flex-col gap-1.5'>
          <Label.Root htmlFor='electionId'>Associated Election</Label.Root>
          {isElectionsLoading ? (
            <Skeleton className='h-10 w-full rounded-lg' />
          ) : (
            <Select.Root
              value={values.electionId}
              onValueChange={(val) => {
                setFieldValue('electionId', val);
                setFieldValue('levelId', '');
                setFieldValue('upper_level_id', '');
              }}
              disabled={disabled || Boolean(parentItem)}
              hasError={Boolean(touched.electionId && errors.electionId)}
            >
              <Select.Trigger id='electionId'>
                <Select.Value placeholder='Select election...' />
              </Select.Trigger>
              <Select.Content>
                {elections.map((elec) => (
                  <Select.Item key={elec.id} value={elec.id}>
                    {elec.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          )}
          {touched.electionId && errors.electionId && (
            <Hint.Root hasError>{errors.electionId}</Hint.Root>
          )}
        </div>

        {/* Level Tier Selection */}
        <div className='flex flex-col gap-1.5'>
          <Label.Root htmlFor='levelId'>Target Level Tier</Label.Root>
          {isLevelsLoading ? (
            <Skeleton className='h-10 w-full rounded-lg' />
          ) : (
            <Select.Root
              value={values.levelId}
              onValueChange={(val) => setFieldValue('levelId', val)}
              disabled={disabled || !values.electionId || levels.length === 0}
              hasError={Boolean(touched.levelId && errors.levelId)}
            >
              <Select.Trigger id='levelId'>
                <Select.Value
                  placeholder={
                    !values.electionId
                      ? 'Select election first'
                      : levels.length === 0
                        ? 'No levels configured'
                        : 'Select level tier...'
                  }
                />
              </Select.Trigger>
              <Select.Content>
                {levels.map((lvl) => (
                  <Select.Item key={lvl.id} value={lvl.id}>
                    {lvl.name}{' '}
                    {lvl.levelRank !== undefined && `(Tier ${lvl.levelRank})`}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          )}
          {touched.levelId && errors.levelId ? (
            <Hint.Root hasError>{errors.levelId}</Hint.Root>
          ) : (
            <p className='text-paragraph-xs text-text-soft-400'>
              The hierarchy level assigned to all created units.
            </p>
          )}
        </div>
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
            items={existingUnits}
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
        <p className='text-paragraph-xs text-text-soft-400'>
          All batch units will be attached under this parent unit in the organogram.
        </p>
      </div>

      {/* Bulk Unit Names Textarea */}
      <div className='flex flex-col gap-1.5'>
        <div className='flex items-center justify-between'>
          <Label.Root htmlFor='namesText'>Unit Names List</Label.Root>
          <div className='flex items-center gap-2'>
            {parsedNames.length > 0 && (
              <Badge.Root
                variant='light'
                color='blue'
                size='small'
                className='font-semibold'
              >
                {parsedNames.length} {parsedNames.length === 1 ? 'unit' : 'units'} parsed
              </Badge.Root>
            )}
            <button
              type='button'
              onClick={handleInsertSample}
              disabled={disabled}
              className='text-[11px] font-medium text-primary-base hover:underline'
            >
              Insert sample
            </button>
          </div>
        </div>

        <Textarea.Root
          simple
          id='namesText'
          name='namesText'
          rows={5}
          value={values.namesText}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          hasError={Boolean(touched.namesText && errors.namesText)}
          placeholder={`Enter one unit name per line or comma-separated, e.g.:\n01 - Polling Station Central\n02 - Polling Station North\n03 - Polling Station South`}
          className='font-mono text-paragraph-xs'
        />

        {touched.namesText && errors.namesText ? (
          <Hint.Root hasError>{errors.namesText}</Hint.Root>
        ) : (
          <div className='flex items-start gap-1 text-[11px] text-text-soft-400'>
            <RiInformationLine className='size-3.5 shrink-0 mt-0.5 text-text-sub-600' />
            <span>
              Tip: Paste from Excel, CSV, or documents. Empty lines and duplicate whitespace are cleaned automatically.
            </span>
          </div>
        )}
      </div>

      {/* Live Preview Chips */}
      {parsedNames.length > 0 && (
        <div className='flex flex-col gap-2 rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-1.5 text-label-xs font-semibold text-text-strong-950'>
              <RiFileList3Line className='size-4 text-primary-base' />
              <span>Parsed Preview ({parsedNames.length})</span>
            </div>
            <span className='text-[11px] text-text-soft-400'>
              Click ✕ to omit any entry
            </span>
          </div>

          <div className='flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1'>
            {parsedNames.map((name, index) => (
              <span
                key={`${name}-${index}`}
                className='inline-flex items-center gap-1 rounded-lg bg-bg-white-0 px-2 py-1 text-paragraph-xs font-medium text-text-strong-950 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'
              >
                <span className='text-[10px] text-text-soft-400 font-mono'>
                  {index + 1}.
                </span>
                <span className='truncate max-w-[180px]'>{name}</span>
                {!disabled && (
                  <button
                    type='button'
                    onClick={() => handleRemoveName(index)}
                    className='rounded-sm p-0.5 text-text-soft-400 hover:bg-bg-weak-100 hover:text-text-sub-600 transition-colors'
                    title='Remove this unit'
                  >
                    <RiCloseLine className='size-3' />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BulkLevelMappingForm;
