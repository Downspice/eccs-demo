'use client';

import * as React from 'react';
import { useGetElections, type ElectionItem } from '@/services/elections';
import {
  useGetLevelMappings,
  type LevelMappingItem,
} from '@/services/level-mappings';
import { useGetLevels, type LevelItem } from '@/services/levels';
import {
  RiArrowRightLine,
  RiCheckLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiErrorWarningLine,
  RiFileList3Line,
  RiInformationLine,
  RiNodeTree,
  RiStackLine,
} from '@remixicon/react';
import type { FormikErrors, FormikTouched } from 'formik';

import * as Badge from '@/components/ui/badge';
import * as CompactButton from '@/components/ui/compact-button';
import * as Hint from '@/components/ui/hint';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import * as Textarea from '@/components/ui/textarea';
import { LevelMappingSearchSelect } from '@/components/level-mapping-search-select';

import { InlineNoLevelsBanner } from './no-levels-alert';
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
  onOpenCreateLevel?: () => void;
}

export function parseUnitNames(text: string): string[] {
  if (!text) return [];
  return text
    .split(/[\n,]+/)
    .map((name) => name.trim())
    .filter((name) => name.length > 0);
}

export interface ParsedItemInfo {
  name: string;
  isDuplicate: boolean;
  firstIndex: number;
}

export function analyzeUnitNames(text: string): {
  items: ParsedItemInfo[];
  uniqueCount: number;
  duplicateCount: number;
  duplicateNames: string[];
} {
  const rawList = parseUnitNames(text);
  const seenMap = new Map<string, number>();
  const duplicatesSet = new Set<string>();

  rawList.forEach((name, idx) => {
    const key = name.toLowerCase();
    if (seenMap.has(key)) {
      duplicatesSet.add(name);
    } else {
      seenMap.set(key, idx);
    }
  });

  const items: ParsedItemInfo[] = rawList.map((name, idx) => {
    const key = name.toLowerCase();
    const firstIdx = seenMap.get(key) ?? idx;
    return {
      name,
      isDuplicate: firstIdx !== idx,
      firstIndex: firstIdx,
    };
  });

  return {
    items,
    uniqueCount: seenMap.size,
    duplicateCount: rawList.length - seenMap.size,
    duplicateNames: Array.from(duplicatesSet),
  };
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
  onOpenCreateLevel,
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

  // Selected level tier details
  const selectedLevel = React.useMemo(() => {
    return levels.find((l) => l.id === values.levelId) || null;
  }, [levels, values.levelId]);

  // Selected election details
  const selectedElection = React.useMemo(() => {
    return elections.find((e) => e.id === values.electionId) || null;
  }, [elections, values.electionId]);

  // Selected parent unit details
  const selectedParent = React.useMemo(() => {
    if (parentItem) return parentItem;
    if (!values.upper_level_id) return null;
    return existingUnits.find((u) => u.id === values.upper_level_id) || null;
  }, [parentItem, values.upper_level_id, existingUnits]);

  // Detailed analysis of names (counts, duplicates)
  const analysis = React.useMemo(() => {
    return analyzeUnitNames(values.namesText);
  }, [values.namesText]);


  // Remove a specific name by index
  const handleRemoveName = (indexToRemove: number) => {
    const rawList = parseUnitNames(values.namesText);
    const updated = rawList.filter((_, idx) => idx !== indexToRemove);
    setFieldValue('namesText', updated.join('\n'));
  };

  // Remove duplicates automatically
  const handleDeduplicate = () => {
    const rawList = parseUnitNames(values.namesText);
    const seen = new Set<string>();
    const uniqueList: string[] = [];
    rawList.forEach((name) => {
      const key = name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueList.push(name);
      }
    });
    setFieldValue('namesText', uniqueList.join('\n'));
  };

  // Clear all parsed names
  const handleClearAll = () => {
    setFieldValue('namesText', '');
  };


  return (
    <div className='flex flex-col gap-5'>
      {/* Target Hierarchy & Location Card */}
      <div className='rounded-xl border border-stroke-soft-200 bg-bg-weak-50/40 p-3.5'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          {/* Election Selection */}
          <div className='flex flex-col gap-1.5'>
            <Label.Root htmlFor='electionId'>
              Associated Election <span className='text-red-500'>*</span>
            </Label.Root>
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
              >
                <Select.Trigger id='electionId' className='w-full'>
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
              <Hint.Root hasError>
                <Hint.Icon as={RiInformationLine} />
                {errors.electionId as string}
              </Hint.Root>
            )}
          </div>

          {/* Level Tier Selection */}
          <div className='flex flex-col gap-1.5'>
            <div className='flex items-center justify-between'>
              <Label.Root htmlFor='levelId'>
                Target Level Tier <span className='text-red-500'>*</span>
              </Label.Root>
              {selectedLevel?.levelRank !== undefined && (
                <Badge.Root variant='lighter' color='blue' size='small'>
                  Tier {selectedLevel.levelRank}
                </Badge.Root>
              )}
            </div>
            {isLevelsLoading ? (
              <Skeleton className='h-10 w-full rounded-lg' />
            ) : values.electionId && levels.length === 0 ? (
              <InlineNoLevelsBanner
                electionName={selectedElection?.name}
                onOpenCreateLevel={onOpenCreateLevel}
              />
            ) : (
              <Select.Root
                value={values.levelId}
                onValueChange={(val) => setFieldValue('levelId', val)}
                disabled={disabled || !values.electionId || levels.length === 0}
              >
                <Select.Trigger id='levelId' className='w-full'>
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
            {touched.levelId && errors.levelId && (
              <Hint.Root hasError>
                <Hint.Icon as={RiInformationLine} />
                {errors.levelId as string}
              </Hint.Root>
            )}
          </div>
        </div>

        {/* Parent / Upper Level Unit Selector */}
        <div className='mt-3.5 flex flex-col gap-1.5 border-t border-stroke-soft-200/70 pt-3'>
          <div className='flex items-center justify-between'>
            <Label.Root htmlFor='upper_level_id'>
              Parent Jurisdiction (Optional)
            </Label.Root>
            <span className='text-[11px] text-text-soft-400'>
              Leaves empty for top-level jurisdictional root
            </span>
          </div>

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
              disabled={disabled || Boolean(parentItem)}
              allowClear
              clearLabel='None (Top-Level Jurisdiction)'
              searchPlaceholder='Search parent unit by name or tier...'
            />
          )}

          {/* Real-time Hierarchy Breadcrumb Path */}
          <div className='mt-2 flex flex-wrap items-center gap-1.5 rounded-lg bg-bg-white-0 px-2.5 py-1.5 text-[11px] ring-1 ring-inset ring-stroke-soft-200'>
            <span className='text-text-soft-400 font-medium'>Placement:</span>
            <span className='font-medium text-text-strong-950'>
              {selectedElection?.name || 'Election'}
            </span>
            <RiArrowRightLine className='size-3 text-text-soft-400 shrink-0' />
            <span className='font-medium text-text-sub-600'>
              {selectedParent ? selectedParent.name : 'Top-Level Root'}
            </span>
            <RiArrowRightLine className='size-3 text-text-soft-400 shrink-0' />
            <Badge.Root variant='lighter' color='blue' size='small'>
              {selectedLevel ? selectedLevel.name : 'Selecting tier...'}
            </Badge.Root>
          </div>
        </div>
      </div>



      {/* Bulk Unit Names Textarea with Toolbar */}
      <div className='flex flex-col gap-2'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Label.Root htmlFor='namesText'>
              Unit Names List <span className='text-red-500'>*</span>
            </Label.Root>

            {analysis.items.length > 0 && (
              <Badge.Root
                variant='light'
                color={analysis.duplicateCount > 0 ? 'orange' : 'blue'}
                size='small'
                className='font-semibold'
              >
                {analysis.items.length}{' '}
                {analysis.items.length === 1 ? 'unit' : 'units'} parsed
              </Badge.Root>
            )}
          </div>

          <div className='flex items-center gap-2'>
            {analysis.duplicateCount > 0 && (
              <button
                type='button'
                onClick={handleDeduplicate}
                disabled={disabled}
                className='inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-800 underline'
                title='Remove duplicate names'
              >
                <RiErrorWarningLine className='size-3.5' />
                <span>Remove {analysis.duplicateCount} Duplicates</span>
              </button>
            )}

            {analysis.items.length > 0 && (
              <button
                type='button'
                onClick={handleClearAll}
                disabled={disabled}
                className='text-[11px] font-medium text-text-soft-400 hover:text-red-600 transition-colors'
              >
                Clear all
              </button>
            )}
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
          placeholder={`Enter one unit name per line or separated by commas:\n01 - Polling Station Central\n02 - Polling Station North\n03 - Polling Station South`}
          className='font-mono text-paragraph-xs leading-relaxed'
        />

        {touched.namesText && errors.namesText ? (
          <Hint.Root hasError>
            <Hint.Icon as={RiInformationLine} />
            {errors.namesText as string}
          </Hint.Root>
        ) : (
          <div className='flex items-center justify-between text-[11px] text-text-soft-400'>
            <span>
              Tip: Paste from spreadsheets, CSVs, or text documents. Empty lines
              are cleaned automatically.
            </span>
            <span>
              {analysis.uniqueCount} unique{' '}
              {analysis.uniqueCount === 1 ? 'entry' : 'entries'}
            </span>
          </div>
        )}
      </div>

      {/* Live Parsed Units Cards & Preview */}
      {analysis.items.length > 0 && (
        <div className='flex flex-col gap-2 rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-3.5'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-1.5 text-label-xs font-semibold text-text-strong-950'>
              <RiFileList3Line className='size-4 text-primary-base' />
              <span>Parsed Preview ({analysis.items.length})</span>
            </div>

            <div className='flex items-center gap-2'>
              {analysis.duplicateCount > 0 && (
                <span className='inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-inset ring-amber-200'>
                  <RiErrorWarningLine className='size-3 text-amber-600' />
                  {analysis.duplicateCount} duplicate{' '}
                  {analysis.duplicateCount === 1 ? 'item' : 'items'}
                </span>
              )}
              <span className='text-[11px] text-text-soft-400'>
                Click ✕ to remove any entry
              </span>
            </div>
          </div>

          <div className='flex flex-wrap gap-1.5 max-h-44 overflow-y-auto pr-1'>
            {analysis.items.map((item, index) => (
              <span
                key={`${item.name}-${index}`}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-paragraph-xs font-medium shadow-2xs ring-1 ring-inset transition-colors ${
                  item.isDuplicate
                    ? 'bg-amber-50/80 text-amber-900 ring-amber-200'
                    : 'bg-bg-white-0 text-text-strong-950 ring-stroke-soft-200 hover:border-stroke-sub-300'
                }`}
              >
                <span className='text-[10px] text-text-soft-400 font-mono'>
                  #{index + 1}
                </span>
                <span className='truncate max-w-[200px]'>{item.name}</span>
                {item.isDuplicate && (
                  <span
                    className='text-[10px] font-bold text-amber-600'
                    title='Duplicate name'
                  >
                    (dup)
                  </span>
                )}
                {!disabled && (
                  <button
                    type='button'
                    onClick={() => handleRemoveName(index)}
                    className='rounded-sm p-0.5 text-text-soft-400 hover:bg-bg-weak-100 hover:text-red-600 transition-colors'
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
