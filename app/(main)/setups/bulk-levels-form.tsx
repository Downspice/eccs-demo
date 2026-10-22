'use client';

import * as React from 'react';
import { useGetElections, type ElectionItem } from '@/services/elections';
import {
  getAvailableRanks,
  getNextAvailableRank,
  useGetLevels,
  type LevelItem,
} from '@/services/levels';
import {
  RiAddLine,
  RiDeleteBinLine,
  RiInformationLine,
  RiStackLine,
} from '@remixicon/react';
import type { FormikErrors, FormikTouched } from 'formik';

import * as CompactButton from '@/components/ui/compact-button';
import * as Hint from '@/components/ui/hint';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

import type { BulkLevelRow, BulkLevelsFormData } from './types';

interface BulkLevelsFormProps {
  values: BulkLevelsFormData;
  errors: FormikErrors<BulkLevelsFormData>;
  touched: FormikTouched<BulkLevelsFormData>;
  handleChange: (e: React.ChangeEvent<any>) => void;
  handleBlur: (e: React.FocusEvent<any>) => void;
  setFieldValue: (field: string, value: any) => void;
  disabled?: boolean;
  onSwitchToSingle?: () => void;
}

export function BulkLevelsForm({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
  disabled,
  onSwitchToSingle,
}: BulkLevelsFormProps) {
  const { data: rawElections, isLoading: isElectionsLoading } =
    useGetElections();
  const { data: rawLevels, isLoading: isLevelsLoading } = useGetLevels(
    values.electionId,
  );

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

  const lastElectionRef = React.useRef(values.electionId);

  // When target election changes, automatically re-populate the ranks to fill available gaps for that election
  React.useEffect(() => {
    if (!values.electionId) return;
    const electionChanged = lastElectionRef.current !== values.electionId;
    lastElectionRef.current = values.electionId;

    if (electionChanged) {
      const availableRanks = getAvailableRanks(
        existingRanks,
        values.levels.length,
      );
      setFieldValue(
        'levels',
        values.levels.map((lvl, idx) => ({
          ...lvl,
          levelRank: availableRanks[idx] ?? idx + 1,
        })),
      );
    }
  }, [values.electionId, existingRanks, values.levels, setFieldValue]);

  const handleAddRow = () => {
    // Find all occupied ranks: backend levels + currently assigned ranks in form
    const occupiedRanks = [
      ...existingRanks,
      ...values.levels
        .map((l) => Number(l.levelRank))
        .filter((r) => !isNaN(r) && r > 0),
    ];
    const nextRank = getNextAvailableRank(occupiedRanks);

    setFieldValue('levels', [
      ...values.levels,
      {
        levelRank: nextRank,
        name: '',
        description: '',
      },
    ]);
  };

  const handleRemoveRow = (indexToRemove: number) => {
    if (values.levels.length <= 1) return;
    const remaining = values.levels.filter((_, idx) => idx !== indexToRemove);
    // Re-assign available ranks filling remaining gaps
    const availableRanks = getAvailableRanks(existingRanks, remaining.length);
    const reindexed = remaining.map((item, idx) => ({
      ...item,
      levelRank: availableRanks[idx] ?? idx + 1,
    }));
    setFieldValue('levels', reindexed);
  };

  return (
    <div className='flex flex-col gap-5'>
      {/* Associated Election Selector */}
      <div className='flex flex-col gap-1.5'>
        <div className='flex items-center justify-between'>
          <Label.Root htmlFor='electionId'>
            Target Election <span className='text-red-500'>*</span>
          </Label.Root>
          <span className='text-paragraph-xs text-text-soft-400'>
            All levels will be attached to this election
          </span>
        </div>

        {isElectionsLoading ? (
          <Skeleton className='h-10 w-full rounded-lg' />
        ) : (
          <Select.Root
            value={values.electionId}
            onValueChange={(val) => setFieldValue('electionId', val)}
            disabled={disabled}
          >
            <Select.Trigger id='electionId' className='w-full'>
              <Select.Value placeholder='Select an election' />
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

        {/* Info on existing levels & gaps */}
        {existingLevels.length > 0 && (
          <div className='mt-1 flex items-center gap-2 rounded-lg bg-bg-weak-50 px-3 py-2 text-paragraph-xs ring-1 ring-inset ring-stroke-soft-200 text-text-sub-600'>
            <RiInformationLine className='size-4 text-primary-base shrink-0' />
            <span>
              Existing levels in this election:{' '}
              <strong className='font-semibold text-text-strong-950'>
                {existingLevels
                  .sort((a, b) => (a.levelRank ?? 0) - (b.levelRank ?? 0))
                  .map((l) => `Rank ${l.levelRank} (${l.name})`)
                  .join(', ')}
              </strong>
              . Ranks are pre-populated to fill any missing numbers.
            </span>
          </div>
        )}
      </div>

      {/* Levels Table / Row Builder */}
      <div className='flex flex-col gap-2.5'>
        <div className='flex items-center justify-between'>
          <Label.Root>
            Hierarchy Level Tiers ({values.levels.length}){' '}
            <span className='text-red-500'>*</span>
          </Label.Root>
          <span className='text-paragraph-xs text-text-soft-400'>
            Rank 1 is the highest top-level tier
          </span>
        </div>

        <div className='flex flex-col gap-2.5 max-h-[360px] overflow-y-auto pr-1'>
          {values.levels.map((level, index) => {
            const rowError = (errors.levels as FormikErrors<BulkLevelRow>[])?.[
              index
            ];
            const rowTouched = (
              touched.levels as FormikTouched<BulkLevelRow>[]
            )?.[index];

            return (
              <div
                key={`level-row-${index}`}
                className='flex items-start gap-2.5 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-xs transition-shadow hover:border-stroke-sub-300'
              >
                {/* Rank Input */}
                <div className='flex w-20 flex-col gap-1 shrink-0'>
                  <Label.Root className='text-[11px] text-text-soft-400'>
                    Rank #
                  </Label.Root>
                  <Input.Root size='small'>
                    <Input.Wrapper>
                      <Input.Input
                        type='number'
                        min={1}
                        value={level.levelRank}
                        onChange={(e) =>
                          setFieldValue(
                            `levels.${index}.levelRank`,
                            Number(e.target.value),
                          )
                        }
                        onBlur={handleBlur}
                        name={`levels.${index}.levelRank`}
                        disabled={disabled}
                        className='text-center font-semibold'
                      />
                    </Input.Wrapper>
                  </Input.Root>
                </div>

                {/* Level Name */}
                <div className='flex flex-1 flex-col gap-1'>
                  <Label.Root className='text-[11px] text-text-soft-400'>
                    Level Name <span className='text-red-500'>*</span>
                  </Label.Root>
                  <Input.Root size='small'>
                    <Input.Wrapper
                      hasError={Boolean(rowTouched?.name && rowError?.name)}
                    >
                      <Input.Input
                        type='text'
                        placeholder='e.g. Region, Constituency'
                        value={level.name}
                        onChange={(e) =>
                          setFieldValue(`levels.${index}.name`, e.target.value)
                        }
                        onBlur={handleBlur}
                        name={`levels.${index}.name`}
                        disabled={disabled}
                      />
                    </Input.Wrapper>
                  </Input.Root>
                  {rowTouched?.name && rowError?.name && (
                    <span className='text-[11px] text-red-500'>
                      {rowError.name}
                    </span>
                  )}
                </div>

                {/* Description */}
                <div className='flex flex-1 flex-col gap-1'>
                  <Label.Root className='text-[11px] text-text-soft-400'>
                    Description (Optional)
                  </Label.Root>
                  <Input.Root size='small'>
                    <Input.Wrapper>
                      <Input.Input
                        type='text'
                        placeholder='Scope / jurisdiction'
                        value={level.description || ''}
                        onChange={(e) =>
                          setFieldValue(
                            `levels.${index}.description`,
                            e.target.value,
                          )
                        }
                        onBlur={handleBlur}
                        name={`levels.${index}.description`}
                        disabled={disabled}
                      />
                    </Input.Wrapper>
                  </Input.Root>
                </div>

                {/* Remove Row Button */}
                <div className='pt-5 shrink-0'>
                  <CompactButton.Root
                    type='button'
                    variant='stroke'
                    onClick={() => handleRemoveRow(index)}
                    disabled={disabled || values.levels.length <= 1}
                    className='size-8 text-text-soft-400 hover:text-red-600 hover:border-red-200 disabled:opacity-30'
                    title='Remove level tier'
                  >
                    <CompactButton.Icon
                      as={RiDeleteBinLine}
                      className='size-4'
                    />
                  </CompactButton.Root>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Row Button */}
        <div className='flex justify-between items-center pt-1'>
          <button
            type='button'
            onClick={handleAddRow}
            disabled={disabled}
            className='inline-flex items-center gap-1.5 text-paragraph-xs font-semibold text-primary-base hover:text-primary-dark transition-colors'
          >
            <RiAddLine className='size-4' />
            <span>Add Level Tier</span>
          </button>

          <span className='text-paragraph-xs text-text-soft-400'>
            {values.levels.length}{' '}
            {values.levels.length === 1 ? 'tier' : 'tiers'} configured
          </span>
        </div>

        {typeof errors.levels === 'string' && (
          <Hint.Root hasError>
            <Hint.Icon as={RiInformationLine} />
            {errors.levels}
          </Hint.Root>
        )}
      </div>
    </div>
  );
}

export default BulkLevelsForm;
