'use client';

import * as React from 'react';
import { useUpdateLevel, type LevelItem } from '@/services/levels';
import { RiEditLine } from '@remixicon/react';
import { useFormik } from 'formik';

import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';

import { levelValidationSchema } from './create';
import { SetupForm } from './form';
import type { SetupFormData } from './types';

interface UpdateSetupModalProps {
  item: LevelItem | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: (item: LevelItem) => void;
}

export function UpdateSetupModal({
  item,
  open,
  onClose,
  onSuccess,
}: UpdateSetupModalProps) {
  const updateLevel = useUpdateLevel();

  const formik = useFormik<SetupFormData>({
    initialValues: {
      name: item?.name || '',
      title: item?.title || '',
      code: item?.code || '',
      description: item?.description || '',
      controlsCount: item?.controlsCount || 15,
      isEnabled: item?.isEnabled ?? true,
    },
    validationSchema: levelValidationSchema,
    enableReinitialize: true,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: (values) => {
      if (!item) return;

      updateLevel.mutate(
        {
          id: item.id,
          ...values,
        },
        {
          onSuccess: (updated) => {
            onSuccess?.(updated || { ...item, ...values });
            onClose();
          },
        },
      );
    },
  });

  return (
    <Modal.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Modal.Content className='max-w-[540px]'>
        <form onSubmit={formik.handleSubmit}>
          <Modal.Header
            icon={RiEditLine}
            title='Update Level Setup'
            description={`Editing parameters and control requirements for ${item?.name || 'level'}.`}
          />

          <Modal.Body className='py-5'>
            <SetupForm
              values={formik.values}
              errors={formik.errors}
              touched={formik.touched}
              handleChange={formik.handleChange}
              handleBlur={formik.handleBlur}
              setFieldValue={formik.setFieldValue}
              disabled={updateLevel.isPending}
            />
          </Modal.Body>

          <Modal.Footer>
            <Button.Root
              type='button'
              variant='neutral'
              mode='stroke'
              size='small'
              onClick={onClose}
              disabled={updateLevel.isPending}
            >
              Cancel
            </Button.Root>
            <Button.Root
              type='submit'
              variant='primary'
              mode='filled'
              size='small'
              disabled={updateLevel.isPending || !formik.isValid}
            >
              {updateLevel.isPending ? 'Saving...' : 'Save Changes'}
            </Button.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}

export default UpdateSetupModal;
export { UpdateElectionModal } from './update-election';
export { UpdatePoliticalPartyModal } from './update-political-party';
