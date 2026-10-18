'use client';

import * as React from 'react';
import { useUpdateSetup, type SetupItem } from '@/services/setups';
import { RiEditLine } from '@remixicon/react';

import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';

import { SetupForm } from './form';
import type { SetupFormData } from './types';

interface UpdateSetupModalProps {
  item: SetupItem | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: (item: SetupItem) => void;
}

export function UpdateSetupModal({
  item,
  open,
  onClose,
  onSuccess,
}: UpdateSetupModalProps) {
  const [formData, setFormData] = React.useState<SetupFormData>({
    name: '',
    code: '',
    category: 'equipment',
    description: '',
    isEnabled: true,
  });

  const updateSetup = useUpdateSetup();

  // Hydrate form when item is selected
  React.useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        code: item.code,
        category: item.category,
        description: item.description || '',
        isEnabled: item.isEnabled,
      });
    }
  }, [item]);

  const handleFieldChange = (fields: Partial<SetupFormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !formData.name.trim() || !formData.code.trim()) return;

    updateSetup.mutate(
      {
        id: item.id,
        ...formData,
      },
      {
        onSuccess: (updated) => {
          onSuccess?.(updated || { ...item, ...formData });
          onClose();
        },
      },
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Modal.Content className='max-w-[540px]'>
        <form onSubmit={handleSubmit}>
          <Modal.Header
            icon={RiEditLine}
            title='Update Setup'
            description={`Editing configuration details for ${item?.name || 'classification'}.`}
          />

          <Modal.Body className='py-5'>
            <SetupForm
              formData={formData}
              onChange={handleFieldChange}
              disabled={updateSetup.isPending}
            />
          </Modal.Body>

          <Modal.Footer>
            <Button.Root
              type='button'
              variant='neutral'
              mode='stroke'
              size='small'
              onClick={onClose}
              disabled={updateSetup.isPending}
            >
              Cancel
            </Button.Root>
            <Button.Root
              type='submit'
              variant='primary'
              mode='filled'
              size='small'
              disabled={
                updateSetup.isPending ||
                !formData.name.trim() ||
                !formData.code.trim()
              }
            >
              {updateSetup.isPending ? 'Saving...' : 'Save Changes'}
            </Button.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}

export default UpdateSetupModal;
