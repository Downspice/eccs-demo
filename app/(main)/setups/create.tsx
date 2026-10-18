'use client';

import * as React from 'react';
import { useCreateSetup, type SetupItem } from '@/services/setups';
import { RiAddLine } from '@remixicon/react';

import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';

import { SetupForm } from './form';
import type { SetupFormData } from './types';

interface CreateSetupModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (item: SetupItem) => void;
}

const INITIAL_FORM_DATA: SetupFormData = {
  name: '',
  code: '',
  category: 'equipment',
  description: '',
  isEnabled: true,
};

export function CreateSetupModal({
  open,
  onClose,
  onSuccess,
}: CreateSetupModalProps) {
  const [formData, setFormData] =
    React.useState<SetupFormData>(INITIAL_FORM_DATA);
  const createSetup = useCreateSetup();

  const handleFieldChange = (fields: Partial<SetupFormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const handleClose = () => {
    setFormData(INITIAL_FORM_DATA);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    createSetup.mutate(formData, {
      onSuccess: (newItem) => {
        onSuccess?.(newItem);
        handleClose();
      },
    });
  };

  return (
    <Modal.Root open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <Modal.Content className='max-w-[540px]'>
        <form onSubmit={handleSubmit}>
          <Modal.Header
            icon={RiAddLine}
            title='Create New Setup'
            description='Add a new category, lookup, or classification item to the ECCS system.'
          />

          <Modal.Body className='py-5'>
            <SetupForm
              formData={formData}
              onChange={handleFieldChange}
              disabled={createSetup.isPending}
            />
          </Modal.Body>

          <Modal.Footer>
            <Button.Root
              type='button'
              variant='neutral'
              mode='stroke'
              size='small'
              onClick={handleClose}
              disabled={createSetup.isPending}
            >
              Cancel
            </Button.Root>
            <Button.Root
              type='submit'
              variant='primary'
              mode='filled'
              size='small'
              disabled={
                createSetup.isPending ||
                !formData.name.trim() ||
                !formData.code.trim()
              }
            >
              {createSetup.isPending ? 'Saving...' : 'Create Setup'}
            </Button.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}

export default CreateSetupModal;
