'use client';

import * as React from 'react';
import type { CandidateItem } from '@/services/candidates';
import type { LevelMappingItem } from '@/services/level-mappings';
import {
  RiAlertLine,
  RiCheckLine,
  RiInformationLine,
  RiUser3Line,
} from '@remixicon/react';
import type { FormikErrors, FormikTouched } from 'formik';

import * as Badge from '@/components/ui/badge';
import * as Hint from '@/components/ui/hint';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import * as Switch from '@/components/ui/switch';

export interface CollationFormCandidateVote {
  candidateId: string;
  candidateName: string;
  partyName?: string;
  total: number;
  percentage?: number;
}

export interface CollationFormData {
  levelMappingId: string;
  electionId: string;
  spoiltBallot: number;
  pathToResultsImage?: string;
  status: boolean;
  results: CollationFormCandidateVote[];
}

interface CollationFormProps {
  values: CollationFormData;
  errors: FormikErrors<CollationFormData>;
  touched: FormikTouched<CollationFormData>;
  handleChange: (e: React.ChangeEvent<any>) => void;
  handleBlur: (e: React.FocusEvent<any>) => void;
  setFieldValue: (field: string, value: any) => void;
  stations: LevelMappingItem[];
  candidates: CandidateItem[];
  disabled?: boolean;
}

export function CollationForm({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
  stations,
  candidates,
  disabled = false,
}: CollationFormProps) {
  // Sync candidates if values.results is empty
  React.useEffect(() => {
    if (
      (!values.results || values.results.length === 0) &&
      candidates.length > 0
    ) {
      setFieldValue(
        'results',
        candidates.map((c) => ({
          candidateId: c.id,
          candidateName: c.name,
          partyName: c.politicalPartyName,
          total: 0,
          percentage: 0,
        })),
      );
    }
  }, [candidates, values.results, setFieldValue]);

  // Compute live totals
  const totalCandidateVotes = React.useMemo(() => {
    return (values.results || []).reduce(
      (acc, curr) => acc + (Number(curr.total) || 0),
      0,
    );
  }, [values.results]);

  const spoiltCount = Number(values.spoiltBallot) || 0;
  const totalVotesCast = totalCandidateVotes + spoiltCount;

  // Handle vote change for a specific candidate
  const handleCandidateVoteChange = (index: number, voteStr: string) => {
    const rawVal = voteStr.replace(/\D/g, '');
    const num = rawVal === '' ? 0 : parseInt(rawVal, 10);
    const updated = [...(values.results || [])];
    if (updated[index]) {
      updated[index] = {
        ...updated[index],
        total: num,
      };

      // Recalculate percentages
      const newTotal = updated.reduce(
        (sum, item) => sum + (Number(item.total) || 0),
        0,
      );
      const withPercentages = updated.map((item) => ({
        ...item,
        percentage:
          newTotal > 0 ? Number(((item.total / newTotal) * 100).toFixed(2)) : 0,
      }));

      setFieldValue('results', withPercentages);
    }
  };

  return (
    <div className='flex flex-col gap-5'>
      {/* Polling Station Selection */}
      <div className='flex flex-col gap-1.5'>
        <Label.Root htmlFor='levelMappingId'>
          Polling Station / Jurisdiction
        </Label.Root>
        <Select.Root
          value={values.levelMappingId}
          onValueChange={(val) => setFieldValue('levelMappingId', val)}
          disabled={disabled}
          hasError={Boolean(touched.levelMappingId && errors.levelMappingId)}
        >
          <Select.Trigger id='levelMappingId' className='w-full'>
            <Select.Value placeholder='Select polling station...' />
          </Select.Trigger>
          <Select.Content position='popper'>
            {stations.map((st) => (
              <Select.Item key={st.id} value={st.id}>
                {st.name} {st.upperLevelName ? `(${st.upperLevelName})` : ''}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        {touched.levelMappingId && errors.levelMappingId ? (
          <Hint.Root hasError>{errors.levelMappingId as string}</Hint.Root>
        ) : (
          <p className='text-paragraph-xs text-text-soft-400'>
            Select the reporting unit or polling booth for this collation
            manifest.
          </p>
        )}
      </div>

      {/* Candidate Ballot Allocation Table */}
      <div className='flex flex-col gap-2'>
        <div className='flex items-center justify-between'>
          <Label.Root>Candidate Ballots Return</Label.Root>
          <span className='text-paragraph-xs font-medium text-text-sub-600'>
            Total Valid Votes:{' '}
            <span className='font-bold text-text-strong-950'>
              {totalCandidateVotes.toLocaleString()}
            </span>
          </span>
        </div>

        <div className='overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0'>
          <div className='grid grid-cols-[1fr,130px,90px] border-b border-stroke-soft-200 bg-bg-weak-50 px-3.5 py-2 text-paragraph-xs font-semibold text-text-sub-600'>
            <span>Candidate & Affiliation</span>
            <span className='text-right'>Votes Counted</span>
            <span className='text-right'>Vote %</span>
          </div>

          <div className='divide-y divide-stroke-soft-200'>
            {(values.results || []).map((res, idx) => {
              const pct =
                totalCandidateVotes > 0
                  ? (
                      (Number(res.total || 0) / totalCandidateVotes) *
                      100
                    ).toFixed(1)
                  : '0.0';

              return (
                <div
                  key={res.candidateId || idx}
                  className='grid grid-cols-[1fr,130px,90px] items-center px-3.5 py-2.5 hover:bg-bg-weak-50/50 transition-colors'
                >
                  <div className='flex items-center gap-2.5'>
                    <div className='flex size-7 shrink-0 items-center justify-center rounded-full bg-bg-weak-50 text-text-sub-600 text-caption font-semibold ring-1 ring-stroke-soft-200'>
                      {res.candidateName?.slice(0, 2).toUpperCase() || 'CA'}
                    </div>
                    <div className='truncate'>
                      <p className='truncate text-label-sm font-semibold text-text-strong-950'>
                        {res.candidateName}
                      </p>
                      {res.partyName && (
                        <p className='truncate text-[11px] text-text-sub-600'>
                          {res.partyName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className='flex justify-end'>
                    <div className='w-28'>
                      <Input.Root>
                        <Input.Wrapper>
                          <input
                            type='number'
                            min='0'
                            disabled={disabled}
                            value={res.total === 0 ? '' : res.total}
                            placeholder='0'
                            onChange={(e) =>
                              handleCandidateVoteChange(idx, e.target.value)
                            }
                            className='w-full bg-transparent px-2 py-1 text-right text-paragraph-sm font-semibold text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none'
                          />
                        </Input.Wrapper>
                      </Input.Root>
                    </div>
                  </div>

                  <div className='text-right font-semibold text-paragraph-sm text-text-strong-950'>
                    {pct}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Spoilt Ballots & Total Votes Cast Summary Grid */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        {/* Spoilt Ballots Input */}
        <div className='flex flex-col gap-1.5'>
          <Label.Root htmlFor='spoiltBallot'>
            Spoilt / Rejected Ballots
          </Label.Root>
          <Input.Root
            hasError={Boolean(touched.spoiltBallot && errors.spoiltBallot)}
          >
            <Input.Wrapper>
              <input
                id='spoiltBallot'
                name='spoiltBallot'
                type='number'
                min='0'
                disabled={disabled}
                placeholder='0'
                value={values.spoiltBallot === 0 ? '' : values.spoiltBallot}
                onChange={handleChange}
                onBlur={handleBlur}
                className='w-full bg-transparent px-3 py-2 text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none disabled:opacity-50'
              />
            </Input.Wrapper>
          </Input.Root>
          {touched.spoiltBallot && errors.spoiltBallot ? (
            <Hint.Root hasError>{errors.spoiltBallot as string}</Hint.Root>
          ) : (
            <p className='text-paragraph-xs text-text-soft-400'>
              Ballots deemed invalid, spoiled, or unmarked during count.
            </p>
          )}
        </div>

        {/* Calculated Total Votes Cast Banner */}
        <div className='flex flex-col justify-between rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-3.5'>
          <div>
            <span className='text-paragraph-xs font-medium text-text-soft-400 uppercase tracking-wider'>
              Total Votes Cast
            </span>
            <div className='mt-1 flex items-baseline gap-1.5'>
              <span className='text-title-h4 font-bold text-text-strong-950'>
                {totalVotesCast.toLocaleString()}
              </span>
              <span className='text-paragraph-xs text-text-sub-600'>
                ballots
              </span>
            </div>
          </div>
          <p className='text-[11px] text-text-soft-400'>
            {totalCandidateVotes.toLocaleString()} valid +{' '}
            {spoiltCount.toLocaleString()} rejected
          </p>
        </div>
      </div>

      {/* Verification Status Switch */}
      <div className='flex items-center justify-between rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4'>
        <div className='flex flex-col gap-0.5'>
          <div className='flex items-center gap-2'>
            <span className='text-label-sm font-semibold text-text-strong-950'>
              Verified & Certified Result
            </span>
            {values.status ? (
              <Badge.Root variant='lighter' color='green' size='small'>
                Certified
              </Badge.Root>
            ) : (
              <Badge.Root variant='lighter' color='orange' size='small'>
                Provisional
              </Badge.Root>
            )}
          </div>
          <p className='text-paragraph-xs text-text-sub-600'>
            Check to immediately certify this result into official election
            aggregates.
          </p>
        </div>

        <Switch.Root
          checked={values.status}
          onCheckedChange={(checked) => setFieldValue('status', checked)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

export default CollationForm;
