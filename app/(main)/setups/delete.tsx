'use client';

import * as React from 'react';
import { useDeleteSetup, type SetupItem } from '@/services/setups';
import { RiDeleteBinLine } from '@remixicon/react';

import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';

interface DeleteSetupModalProps {
  item: SetupItem | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: (id: string) => void;
}

export function DeleteSetupModal({
  item,
  open,
  onClose,
  onSuccess,
}: DeleteSetupModalProps) {
  const deleteSetup = useDeleteSetup();

  if (!item) return null;

  const handleDelete = () => {
    deleteSetup.mutate(
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
          title='Delete Level Setup'
          description='Are you sure you want to remove this compliance level?'
        />

        <Modal.Body className='py-4'>
          <div className='rounded-xl bg-error-lighter/20 border border-error-base/20 p-3.5 text-paragraph-sm text-text-strong-950'>
            <p className='font-semibold text-error-base'>
              {item.name}: {item.title}
            </p>
            <p className='mt-1 text-paragraph-xs text-text-sub-600'>
              Code: <span className='font-mono font-medium'>{item.code}</span>
            </p>
            <p className='mt-2 text-paragraph-xs text-text-sub-600'>
              Deleting this level will unassign any mapped controls or audit
              checkpoints. This action cannot be undone.
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
            disabled={deleteSetup.isPending}
          >
            Cancel
          </Button.Root>
          <Button.Root
            type='button'
            variant='error'
            mode='filled'
            size='small'
            onClick={handleDelete}
            disabled={deleteSetup.isPending}
          >
            {deleteSetup.isPending ? 'Deleting...' : 'Confirm Delete'}
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

export default DeleteSetupModal;
export { DeleteElectionModal } from './delete-election';
