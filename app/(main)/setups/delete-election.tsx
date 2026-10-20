'use client';

import * as React from 'react';
import { useDeleteElection, type ElectionItem } from '@/services/elections';
import { RiDeleteBinLine } from '@remixicon/react';

import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';

interface DeleteElectionModalProps {
  item: ElectionItem | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: (id: string) => void;
}

export function DeleteElectionModal({
  item,
  open,
  onClose,
  onSuccess,
}: DeleteElectionModalProps) {
  const deleteElection = useDeleteElection();

  if (!item) return null;

  const handleDelete = () => {
    deleteElection.mutate(
      { id: item.id },
      {
        onSuccess: () => {
          onSuccess?.(item.id);
          onClose();
        },
      },
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Modal.Content className='max-w-[420px]'>
        <Modal.Header
          icon={RiDeleteBinLine}
          title='Delete Election'
          description='Are you sure you want to remove this election setup?'
        />

        <Modal.Body className='py-4'>
          <div className='rounded-xl bg-error-lighter/20 border border-error-base/20 p-3.5 text-paragraph-sm text-text-strong-950'>
            <p className='font-semibold text-error-base'>{item.name}</p>
            <p className='mt-1 text-paragraph-xs text-text-sub-600 truncate'>
              ID: <span className='font-mono font-medium'>{item.id}</span>
            </p>
            <p className='mt-2 text-paragraph-xs text-text-sub-600'>
              Deleting this election will remove associated ballots and voting
              configurations. This action cannot be undone.
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
            disabled={deleteElection.isPending}
          >
            Cancel
          </Button.Root>
          <Button.Root
            type='button'
            variant='error'
            mode='filled'
            size='small'
            onClick={handleDelete}
            disabled={deleteElection.isPending}
          >
            {deleteElection.isPending ? 'Deleting...' : 'Confirm Delete'}
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

export default DeleteElectionModal;
