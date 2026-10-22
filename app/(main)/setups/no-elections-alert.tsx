'use client';

import * as React from 'react';
import { RiAlertLine, RiCalendarEventLine } from '@remixicon/react';
import * as Button from '@/components/ui/button';

interface NoElectionsAlertProps {
  entityName: string;
  onOpenCreateElection?: () => void;
  onClose?: () => void;
}

export function NoElectionsAlert({
  entityName,
  onOpenCreateElection,
  onClose,
}: NoElectionsAlertProps) {
  const handleAction = () => {
    onClose?.();
    onOpenCreateElection?.();
  };

  return (
    <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-stroke-soft-200 bg-bg-weak-50/70 p-6 text-center sm:p-8'>
      <div className='flex size-12 items-center justify-center rounded-xl bg-primary-base/10 text-primary-base shadow-xs mb-3.5'>
        <RiCalendarEventLine className='size-6' />
      </div>

      <h3 className='text-label-sm font-semibold text-text-strong-950 sm:text-label-base'>
        No Elections Available
      </h3>

      <p className='mt-1 max-w-sm text-paragraph-xs text-text-sub-600 sm:text-paragraph-sm'>
        Creating {entityName} requires an existing election. Please create an election first before continuing.
      </p>

      {onOpenCreateElection && (
        <div className='mt-5 flex items-center gap-2'>
          <Button.Root
            type='button'
            variant='primary'
            mode='filled'
            size='small'
            onClick={handleAction}
          >
            <Button.Icon as={RiCalendarEventLine} />
            <span>Create Election First</span>
          </Button.Root>
        </div>
      )}
    </div>
  );
}

export function InlineNoElectionsBanner({
  onOpenCreateElection,
  onClose,
}: {
  onOpenCreateElection?: () => void;
  onClose?: () => void;
}) {
  const handleAction = () => {
    onClose?.();
    onOpenCreateElection?.();
  };

  return (
    <div className='flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-paragraph-xs text-amber-900'>
      <div className='flex items-center gap-2'>
        <RiAlertLine className='size-4 text-amber-600 shrink-0' />
        <span>No elections found in the system. Create an election first.</span>
      </div>
      {onOpenCreateElection && (
        <button
          type='button'
          onClick={handleAction}
          className='font-semibold text-primary-base hover:underline shrink-0 ml-2'
        >
          Create Election
        </button>
      )}
    </div>
  );
}

export default NoElectionsAlert;
