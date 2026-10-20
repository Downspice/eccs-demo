'use client';

import * as React from 'react';
import {
  useDeletePoliticalParty,
  type PoliticalPartyItem,
} from '@/services/political-parties';
import { RiDeleteBinLine } from '@remixicon/react';

import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';

interface DeletePoliticalPartyModalProps {
  item: PoliticalPartyItem | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: (id: string) => void;
}

export function DeletePoliticalPartyModal({
  item,
  open,
  onClose,
  onSuccess,
}: DeletePoliticalPartyModalProps) {
  const deletePoliticalParty = useDeletePoliticalParty();

  if (!item) return null;

  const handleDelete = () => {
    deletePoliticalParty.mutate(
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
          title='Delete Political Party'
          description='Are you sure you want to remove this political party?'
        />

        <Modal.Body className='py-4'>
          <div className='rounded-xl bg-error-lighter/20 border border-error-base/20 p-3.5 text-paragraph-sm text-text-strong-950'>
            <p className='font-semibold text-error-base'>{item.name}</p>
            <p className='mt-1 text-paragraph-xs text-text-sub-600 truncate'>
              ID: <span className='font-mono font-medium'>{item.id}</span>
            </p>
            <p className='mt-2 text-paragraph-xs text-text-sub-600'>
              Deleting this political party will unassign it from candidate
              rosters and electoral configurations. This action cannot be
              undone.
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
            disabled={deletePoliticalParty.isPending}
          >
            Cancel
          </Button.Root>
          <Button.Root
            type='button'
            variant='error'
            mode='filled'
            size='small'
            onClick={handleDelete}
            disabled={deletePoliticalParty.isPending}
          >
            {deletePoliticalParty.isPending ? 'Deleting...' : 'Confirm Delete'}
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

export default DeletePoliticalPartyModal;
