'use client';

import * as React from 'react';
import {
  RiAddLine,
  RiAlertLine,
  RiGitCommitLine,
  RiStackLine,
} from '@remixicon/react';

import * as Button from '@/components/ui/button';

interface NoLevelsAlertProps {
  electionName?: string;
  onOpenCreateLevel?: () => void;
  onOpenCreateBulkLevels?: () => void;
  onClose?: () => void;
}

export function NoLevelsAlert({
  electionName,
  onOpenCreateLevel,
  onOpenCreateBulkLevels,
  onClose,
}: NoLevelsAlertProps) {
  const handleSingle = () => {
    onClose?.();
    onOpenCreateLevel?.();
  };

  const handleBulk = () => {
    onClose?.();
    onOpenCreateBulkLevels?.();
  };

  return (
    <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-stroke-soft-200 bg-bg-weak-50/70 p-6 text-center sm:p-8'>
      <div className='flex size-12 items-center justify-center rounded-xl bg-primary-base/10 text-primary-base shadow-xs mb-3.5'>
        <RiGitCommitLine className='size-6' />
      </div>

      <h3 className='text-label-sm font-semibold text-text-strong-950 sm:text-label-base'>
        No Hierarchy Levels Found
      </h3>

      <p className='mt-1 max-w-sm text-paragraph-xs text-text-sub-600 sm:text-paragraph-sm'>
        Creating jurisdiction mappings requires an existing administrative level
        (e.g. Region, District, Polling Station)
        {electionName ? ` for ${electionName}` : ''}. Please add a level first
        before continuing.
      </p>

      {(onOpenCreateLevel || onOpenCreateBulkLevels) && (
        <div className='mt-5 flex flex-wrap items-center justify-center gap-2'>
          {onOpenCreateLevel && (
            <Button.Root
              type='button'
              variant='primary'
              mode='filled'
              size='small'
              onClick={handleSingle}
            >
              <Button.Icon as={RiAddLine} />
              <span>Add Level First</span>
            </Button.Root>
          )}
          {onOpenCreateBulkLevels && (
            <Button.Root
              type='button'
              variant='neutral'
              mode='stroke'
              size='small'
              onClick={handleBulk}
            >
              <Button.Icon as={RiStackLine} />
              <span>Bulk Add Levels</span>
            </Button.Root>
          )}
        </div>
      )}
    </div>
  );
}

export function InlineNoLevelsBanner({
  electionName,
  onOpenCreateLevel,
  onClose,
}: {
  electionName?: string;
  onOpenCreateLevel?: () => void;
  onClose?: () => void;
}) {
  const handleAction = () => {
    onClose?.();
    onOpenCreateLevel?.();
  };

  return (
    <div className='flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-paragraph-xs text-amber-900'>
      <div className='flex items-center gap-2'>
        <RiAlertLine className='size-4 text-amber-600 shrink-0' />
        <span>
          No hierarchy levels found{electionName ? ` for ${electionName}` : ''}.
          Add an administrative level first.
        </span>
      </div>
      {onOpenCreateLevel && (
        <button
          type='button'
          onClick={handleAction}
          className='font-semibold text-primary-base hover:underline shrink-0 ml-2'
        >
          Add Level
        </button>
      )}
    </div>
  );
}

export default NoLevelsAlert;
