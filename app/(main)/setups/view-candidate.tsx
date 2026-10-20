'use client';

import * as React from 'react';
import type { CandidateItem } from '@/services/candidates';
import { RiEditLine, RiEyeLine, RiUserLine } from '@remixicon/react';

import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';

interface ViewCandidateModalProps {
  item: CandidateItem | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (item: CandidateItem) => void;
}

export function ViewCandidateModal({
  item,
  open,
  onClose,
  onEdit,
}: ViewCandidateModalProps) {
  if (!item) return null;

  return (
    <Modal.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Modal.Content className='max-w-[480px]'>
        <Modal.Header
          icon={RiEyeLine}
          title={item.name}
          description='Candidate Details & Nomination Record'
        />

        <Modal.Body className='py-5 space-y-4'>
          {/* Candidate Banner */}
          <div className='flex items-center gap-4 rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-4'>
            <div className='flex size-14 shrink-0 items-center justify-center rounded-full bg-primary-alpha-10 text-primary-base font-semibold text-label-md border border-primary-alpha-20'>
              <RiUserLine className='size-7' />
            </div>
            <div className='flex flex-col min-w-0'>
              <span className='text-label-md font-semibold text-text-strong-950 truncate'>
                {item.name}
              </span>
              <span className='text-paragraph-xs text-text-sub-600 mt-0.5'>
                {item.politicalPartyName || item.politicalPartyId}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <span className='text-paragraph-xs text-text-sub-600'>
                Associated Election
              </span>
              <p className='text-label-sm font-semibold text-text-strong-950 mt-0.5'>
                {item.electionName || item.electionId}
              </p>
            </div>
            <div>
              <span className='text-paragraph-xs text-text-sub-600'>
                Party ID
              </span>
              <p
                className='font-mono text-label-xs font-semibold text-text-sub-600 mt-0.5 truncate'
                title={item.politicalPartyId}
              >
                {item.politicalPartyId}
              </p>
            </div>
          </div>

          {/* Candidate UUID */}
          <div>
            <span className='text-paragraph-xs text-text-sub-600'>
              Candidate UUID
            </span>
            <p className='font-mono text-label-xs font-semibold text-text-sub-600 mt-0.5 break-all'>
              {item.id}
            </p>
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
              <span>Edit Candidate</span>
            </Button.Root>
          )}
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
