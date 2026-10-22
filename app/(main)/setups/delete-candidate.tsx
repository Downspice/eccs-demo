'use client';

import * as React from 'react';
import type { CandidateItem } from '@/services/candidates';
import { RiDeleteBinLine } from '@remixicon/react';

import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';
import { toast } from '@/components/ui/toast';

interface DeleteCandidateModalProps {
  item: CandidateItem | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: (id: string) => void;
}

export function DeleteCandidateModal({
  item,
  open,
  onClose,
  onSuccess,
}: DeleteCandidateModalProps) {
  if (!item) return null;

  const handleDelete = () => {
    toast.success('Candidate removed successfully', {
      description: `"${item.name}" has been removed.`,
    });
    onSuccess?.(item.id);
    onClose();
  };

  return (
    <Modal.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Modal.Content className='max-w-[420px]'>
        <Modal.Header
          icon={RiDeleteBinLine}
          title='Remove Candidate'
          description='Are you sure you want to remove this candidate?'
        />

        <Modal.Body className='py-4'>
          <div className='rounded-xl bg-error-lighter/20 border border-error-base/20 p-3.5 text-paragraph-sm text-text-strong-950'>
            <p className='font-semibold text-error-base'>{item.name}</p>
            <p className='mt-1 text-paragraph-xs text-text-sub-600'>
              Election: {item.electionName || 'General Election'}
            </p>
            <p className='mt-2 text-paragraph-xs text-text-sub-600'>
              Removing this candidate will unassign them from ballots and party
              nomination records.
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
            Cancel
          </Button.Root>
          <Button.Root
            type='button'
            variant='error'
            mode='filled'
            size='small'
            onClick={handleDelete}
          >
            Remove
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
