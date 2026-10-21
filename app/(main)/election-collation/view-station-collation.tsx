'use client';

import * as React from 'react';
import {
  useGetResultsByLevelMapping,
  useVerifyElectionCollation,
} from '@/services/election-collations';
import type { LevelMappingItem } from '@/services/level-mappings';
import {
  RiCheckDoubleLine,
  RiFileChartLine,
  RiGovernmentLine,
  RiTimeLine,
  RiUser3Line,
} from '@remixicon/react';

import * as Badge from '@/components/ui/badge';
import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';
import * as ProgressBar from '@/components/ui/progress-bar';
import { Skeleton } from '@/components/ui/skeleton';

interface ViewStationCollationModalProps {
  open: boolean;
  station: LevelMappingItem | null;
  onClose: () => void;
  onRecordNew?: (station: LevelMappingItem) => void;
}

export function ViewStationCollationModal({
  open,
  station,
  onClose,
  onRecordNew,
}: ViewStationCollationModalProps) {
  const { data: collationData, isLoading } = useGetResultsByLevelMapping(
    station?.id,
    false,
  );
  const verifyCollation = useVerifyElectionCollation();

  const hasCollation = Boolean(collationData?.collation);
  const collation = collationData?.collation;

  const handleVerify = async () => {
    if (!collation?.id || !station) return;
    try {
      await verifyCollation.mutateAsync({
        collationId: collation.id,
        electionId: collation.electionId || station.electionId || '',
        levelMappingId: station.id,
      });
      onClose();
    } catch (err) {
      console.error('Failed to verify collation:', err);
    }
  };

  return (
    <Modal.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Modal.Content className='max-w-xl'>
        <Modal.Header
          icon={RiFileChartLine}
          title={station?.name || 'Polling Station Return'}
          description={`Territorial Collation Return for ${station?.levelName || 'Unit'}${station?.upperLevelName ? ` • ${station.upperLevelName}` : ''}`}
        />

        <Modal.Body className='py-5'>
          {isLoading ? (
            <div className='flex flex-col gap-3'>
              <Skeleton className='h-20 w-full rounded-xl' />
              <Skeleton className='h-32 w-full rounded-xl' />
            </div>
          ) : !hasCollation ? (
            <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-stroke-soft-200 py-12 text-center'>
              <div className='flex size-12 items-center justify-center rounded-2xl bg-bg-weak-50 text-text-sub-600'>
                <RiTimeLine className='size-6' />
              </div>
              <h4 className='mt-3 text-label-sm font-semibold text-text-strong-950'>
                No collation sheet submitted yet
              </h4>
              <p className='mt-1 max-w-xs text-paragraph-xs text-text-sub-600'>
                Results for this polling station have not been transmitted or
                verified yet.
              </p>
              {station && onRecordNew && (
                <div className='mt-4'>
                  <Button.Root
                    variant='primary'
                    mode='filled'
                    size='small'
                    onClick={() => {
                      onClose();
                      onRecordNew(station);
                    }}
                  >
                    <span>Record Results Sheet</span>
                  </Button.Root>
                </div>
              )}
            </div>
          ) : (
            <div className='flex flex-col gap-4'>
              {/* Status & Manifest Summary Card */}
              <div className='flex items-center justify-between rounded-xl bg-bg-weak-50 p-4 border border-stroke-soft-200'>
                <div>
                  <span className='text-paragraph-xs font-medium text-text-soft-400 uppercase tracking-wider'>
                    Collation Certification
                  </span>
                  <div className='mt-1 flex items-center gap-2'>
                    {collation?.status ? (
                      <Badge.Root variant='lighter' color='green' size='small'>
                        <RiCheckDoubleLine className='size-3 shrink-0' />
                        <span>Certified & Verified</span>
                      </Badge.Root>
                    ) : (
                      <Badge.Root variant='lighter' color='orange' size='small'>
                        <RiTimeLine className='size-3 shrink-0' />
                        <span>Provisional Return</span>
                      </Badge.Root>
                    )}
                    <span className='text-paragraph-xs text-text-sub-600 font-mono'>
                      ID: {collation?.id?.slice(0, 8)}
                    </span>
                  </div>
                </div>

                <div className='text-right'>
                  <span className='text-paragraph-xs text-text-soft-400'>
                    Spoilt Ballots
                  </span>
                  <p className='text-title-h5 font-bold text-text-strong-950'>
                    {collation?.spoiltBallot ?? 0}
                  </p>
                </div>
              </div>

              {/* Candidate Votes Breakdown */}
              <div className='flex flex-col gap-2'>
                <h4 className='text-label-xs font-semibold uppercase tracking-wider text-text-sub-600'>
                  Candidate Vote Returns
                </h4>

                <div className='divide-y divide-stroke-soft-200 rounded-xl border border-stroke-soft-200 bg-bg-white-0'>
                  {(collation?.results || []).map((res) => (
                    <div key={res.candidateId} className='p-3.5'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2.5'>
                          <div className='flex size-8 shrink-0 items-center justify-center rounded-full bg-bg-weak-50 text-text-sub-600 font-semibold text-caption'>
                            {res.candidateName?.slice(0, 2).toUpperCase()}
                          </div>
                          <span className='text-label-sm font-semibold text-text-strong-950'>
                            {res.candidateName}
                          </span>
                        </div>
                        <div className='text-right'>
                          <span className='text-label-md font-bold text-text-strong-950'>
                            {Number(res.total).toLocaleString()} votes
                          </span>
                          <span className='ml-2 text-paragraph-xs font-medium text-text-sub-600'>
                            ({res.percentage}%)
                          </span>
                        </div>
                      </div>
                      <div className='mt-2'>
                        <ProgressBar.Root value={res.percentage} color='blue' />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button.Root
            variant='neutral'
            mode='stroke'
            size='small'
            onClick={onClose}
          >
            Close
          </Button.Root>
          {hasCollation && !collation?.status && (
            <Button.Root
              variant='primary'
              mode='filled'
              size='small'
              onClick={handleVerify}
              disabled={verifyCollation.isPending || !collation?.id}
            >
              <Button.Icon as={RiCheckDoubleLine} />
              <span>
                {verifyCollation.isPending
                  ? 'Verifying...'
                  : 'Verify Collation'}
              </span>
            </Button.Root>
          )}
          {!hasCollation && station && onRecordNew && (
            <Button.Root
              variant='primary'
              mode='filled'
              size='small'
              onClick={() => {
                onClose();
                onRecordNew(station);
              }}
            >
              <span>Record Results</span>
            </Button.Root>
          )}
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

export default ViewStationCollationModal;
