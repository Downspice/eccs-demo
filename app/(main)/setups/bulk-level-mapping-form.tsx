'use client';

import * as React from 'react';
import { useGetElections, type ElectionItem } from '@/services/elections';
import {
  useGetLevelMappings,
  type LevelMappingItem,
} from '@/services/level-mappings';
import { useGetLevels, type LevelItem } from '@/services/levels';
import {
  RiAddLine,
  RiArrowRightLine,
  RiDeleteBinLine,
  RiInformationLine,
  RiNodeTree,
} from '@remixicon/react';
import type { FormikErrors, FormikTouched } from 'formik';

import * as Badge from '@/components/ui/badge';
import * as Button from '@/components/ui/button';
import * as CompactButton from '@/components/ui/compact-button';
import * as Hint from '@/components/ui/hint';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
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

export function BulkLevelMappingForm({
  values,
  errors,
  touched,
  handleBlur,
  setFieldValue,
  disabled,
  parentItem,
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

  // Row manipulation helpers
  const handleAddRow = () => {
    setFieldValue('names', [...(values.names || []), '']);
  };

  const handleAddRowAfter = (index: number) => {
    const current = [...(values.names || [''])];
    current.splice(index + 1, 0, '');
    setFieldValue('names', current);
  };

  const handleRemoveRow = (indexToRemove: number) => {
    if (!values.names || values.names.length <= 1) {
      setFieldValue('names', ['']);
      return;
    }
    const updated = values.names.filter((_, idx) => idx !== indexToRemove);
    setFieldValue('names', updated);
  };

  const handleNameChange = (index: number, val: string) => {
    const updated = [...(values.names || [''])];
    updated[index] = val;
    setFieldValue('names', updated);
  };

  const handlePaste = (
    index: number,
    e: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    const text = e.clipboardData.getData('text');
    if (text && (text.includes('\n') || text.includes(','))) {
      e.preventDefault();
      const pasted = text
        .split(/[\n,]+/)
        .map((n) => n.trim())
        .filter((n) => n.length > 0);

      if (pasted.length > 0) {
        const current = [...(values.names || [''])];
        current.splice(index, 1, ...pasted);
        setFieldValue('names', current);
      }
    }
  };

  const handleClearAll = () => {
    setFieldValue('names', ['']);
  };

  const filledCount =
    values.names?.filter((n) => typeof n === 'string' && n.trim().length > 0)
      .length || 0;

  return (
    <div className='flex flex-col gap-5'>
      {/* Target Hierarchy & Location Card */}
      <div className='rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-3.5'>
        <div className='flex items-center gap-1.5 text-label-xs font-semibold text-text-strong-950 mb-3'>
          <RiNodeTree className='size-4 text-primary-base' />
          <span>Hierarchy Placement</span>
        </div>

        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          {/* Associated Election */}
          <div className='flex flex-col gap-1.5'>
            <div className='flex items-center justify-between'>
              <Label.Root htmlFor='electionId'>
                Associated Election <span className='text-red-500'>*</span>
              </Label.Root>
            </div>
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
                  <Select.Value placeholder='Select an election...' />
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

          {/* Level Tier Selector */}
          <div className='flex flex-col gap-1.5'>
            <div className='flex items-center justify-between'>
              <Label.Root htmlFor='levelId'>
                Target Level Tier <span className='text-red-500'>*</span>
              </Label.Root>
              {selectedLevel && (
                <Badge.Root variant='lighter' color='blue' size='small'>
                  Rank {selectedLevel.levelRank ?? 1}
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
              disabled={disabled || Boolean(parentItem)}
              placeholder='None (Top-Level Jurisdiction)'
            />
          )}

          {/* Hierarchy Path Preview */}
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

      {/* Dynamic Unit Names List with + buttons */}
      <div className='flex flex-col gap-2.5'>
        <div className='flex items-center justify-between'>
          <Label.Root>
            Unit Names List ({filledCount}){' '}
            <span className='text-red-500'>*</span>
          </Label.Root>
          <span className='text-paragraph-xs text-text-soft-400'>
            Click + or press Enter to add another input field
          </span>
        </div>

        <div className='flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1'>
          {(values.names || ['']).map((name, index) => {
            const hasError =
              touched.names &&
              errors.names &&
              !name.trim() &&
              index === 0 &&
              (values.names || []).every((n) => !n.trim());

            return (
              <div
                key={`unit-input-${index}`}
                className='flex items-center gap-2 group'
              >
                <div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-bg-weak-50 text-[11px] font-semibold text-text-sub-600 ring-1 ring-inset ring-stroke-soft-200'>
                  {index + 1}
                </div>

                <div className='flex-1'>
                  <Input.Root size='small'>
                    <Input.Wrapper hasError={Boolean(hasError)}>
                      <Input.Input
                        type='text'
                        placeholder={
                          selectedLevel?.name
                            ? `e.g. ${selectedLevel.name} ${index + 1}`
                            : `e.g. Unit Name ${index + 1}`
                        }
                        value={name}
                        onChange={(e) =>
                          handleNameChange(index, e.target.value)
                        }
                        onBlur={handleBlur}
                        name={`names.${index}`}
                        disabled={disabled}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddRowAfter(index);
                          }
                        }}
                        onPaste={(e) => handlePaste(index, e)}
                        autoFocus={
                          index > 0 && index === (values.names?.length || 1) - 1
                        }
                      />
                    </Input.Wrapper>
                  </Input.Root>
                </div>

                <div className='flex items-center gap-1 shrink-0'>
                  <CompactButton.Root
                    type='button'
                    variant='stroke'
                    onClick={() => handleAddRowAfter(index)}
                    disabled={disabled}
                    className='size-8 text-primary-base hover:bg-primary-base/10 hover:border-primary-base/40'
                    title='Add input field below (+)'
                  >
                    <CompactButton.Icon as={RiAddLine} className='size-4' />
                  </CompactButton.Root>

                  {(values.names?.length || 0) > 1 && (
                    <CompactButton.Root
                      type='button'
                      variant='stroke'
                      onClick={() => handleRemoveRow(index)}
                      disabled={disabled}
                      className='size-8 text-text-soft-400 hover:text-red-600 hover:border-red-200'
                      title='Remove this unit'
                    >
                      <CompactButton.Icon
                        as={RiDeleteBinLine}
                        className='size-4'
                      />
                    </CompactButton.Root>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {touched.names && errors.names && typeof errors.names === 'string' && (
          <Hint.Root hasError>
            <Hint.Icon as={RiInformationLine} />
            {errors.names}
          </Hint.Root>
        )}

        <div className='flex items-center justify-between pt-1'>
          <Button.Root
            type='button'
            variant='neutral'
            mode='stroke'
            size='small'
            onClick={handleAddRow}
            disabled={disabled}
          >
            <Button.Icon as={RiAddLine} />
            <span>Add Another Unit Field</span>
          </Button.Root>

          {(values.names?.length || 0) > 1 && (
            <button
              type='button'
              onClick={handleClearAll}
              disabled={disabled}
              className='text-[11px] font-medium text-text-sub-600 hover:text-red-600 transition-colors'
            >
              Clear all
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BulkLevelMappingForm;
