'use client';

import * as React from 'react';
import type { ElectionItem } from '@/services/elections';
import {
  RiCalendarLine,
  RiEditLine,
  RiEyeLine,
  RiGovernmentLine,
  RiGroupLine,
} from '@remixicon/react';

import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';

interface ViewElectionModalProps {
  item: ElectionItem | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (item: ElectionItem) => void;
}

export function ViewElectionModal({
  item,
  open,
  onClose,
  onEdit,
}: ViewElectionModalProps) {
  if (!item) return null;

  return (
    <Modal.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Modal.Content className='max-w-[480px]'>
        <Modal.Header
          icon={RiEyeLine}
          title={item.name}
          description='Election Setup Record'
        />

        <Modal.Body className='py-5 space-y-4'>
          {/* Election Overview Box */}
          <div className='flex items-center gap-3 rounded-xl bg-bg-weak-50 p-3.5'>
            <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-base text-static-white'>
              <RiGovernmentLine className='size-5' />
            </div>
            <div className='flex flex-col truncate'>
              <span className='text-paragraph-xs font-medium text-text-sub-600'>
                Registered Title
              </span>
              <span className='text-label-sm font-semibold text-text-strong-950 truncate'>
                {item.name}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className='grid grid-cols-2 gap-3'>
            <div className='flex flex-col gap-1 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3.5'>
              <div className='flex items-center gap-1.5 text-text-sub-600'>
                <RiCalendarLine className='size-4 text-primary-base' />
                <span className='text-paragraph-xs font-medium'>
                  Election Date
                </span>
              </div>
              <p className='text-label-sm font-semibold text-text-strong-950 mt-0.5'>
                {item.electionDate || '—'}
              </p>
            </div>

            <div className='flex flex-col gap-1 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3.5'>
              <div className='flex items-center gap-1.5 text-text-sub-600'>
                <RiGroupLine className='size-4 text-primary-base' />
                <span className='text-paragraph-xs font-medium'>
                  Expected Turnout
                </span>
              </div>
              <p className='text-label-sm font-semibold text-text-strong-950 mt-0.5'>
                {item.expectedTurnout != null
                  ? `${Number(item.expectedTurnout).toLocaleString()} voters`
                  : '—'}
              </p>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button.Root
            type='button'
            variant='neutral'
            mode='stroke'
            size='small'
            onClick={onClose}
          >
            Close
          </Button.Root>
          {onEdit && (
            <Button.Root
              type='button'
              variant='primary'
              mode='filled'
              size='small'
              onClick={() => {
                onClose();
                onEdit(item);
              }}
            >
              <Button.Icon as={RiEditLine} />
              Edit Election
            </Button.Root>
          )}
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

export default ViewElectionModal;
