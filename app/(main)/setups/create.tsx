'use client';

import * as React from 'react';
import { useCreateLevel, type LevelItem } from '@/services/levels';
import { RiAddLine } from '@remixicon/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';

import { SetupForm } from './form';
import type { SetupFormData } from './types';

interface CreateSetupModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (item: LevelItem) => void;
}

export const levelValidationSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .required('Level identifier is required (e.g. Level 1)'),
  title: Yup.string().trim().required('Classification title is required'),
  code: Yup.string()
    .trim()
    .matches(
      /^[A-Z0-9_-]+$/,
      'Code must be uppercase alphanumeric (e.g. LVL-01)',
    )
    .required('Unique level code is required'),
  controlsCount: Yup.number()
    .typeError('Controls must be a valid number')
    .min(1, 'At least 1 control is required')
    .required('Control threshold is required'),
  description: Yup.string().max(
    500,
    'Description cannot exceed 500 characters',
  ),
  isEnabled: Yup.boolean().default(true),
});

const INITIAL_FORM_DATA: SetupFormData = {
  name: '',
  title: '',
  code: '',
  description: '',
  controlsCount: 15,
  isEnabled: true,
};

export function CreateSetupModal({
  open,
  onClose,
  onSuccess,
}: CreateSetupModalProps) {
  const createLevel = useCreateLevel();

  const formik = useFormik<SetupFormData>({
    initialValues: INITIAL_FORM_DATA,
    validationSchema: levelValidationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: (values) => {
      createLevel.mutate(values, {
        onSuccess: (newItem) => {
          onSuccess?.(newItem);
          handleClose();
        },
      });
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Modal.Root open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <Modal.Content className='max-w-[540px]'>
        <form onSubmit={formik.handleSubmit}>
          <Modal.Header
            icon={RiAddLine}
            title='Create New Level'
            description='Add a new security or compliance level threshold to the ECCS framework.'
          />

          <Modal.Body className='py-5'>
            <SetupForm
              values={formik.values}
              errors={formik.errors}
              touched={formik.touched}
              handleChange={formik.handleChange}
              handleBlur={formik.handleBlur}
              setFieldValue={formik.setFieldValue}
              disabled={createLevel.isPending}
            />
          </Modal.Body>

          <Modal.Footer>
            <Button.Root
              type='button'
              variant='neutral'
              mode='stroke'
              size='small'
              onClick={handleClose}
              disabled={createLevel.isPending}
            >
              Cancel
            </Button.Root>
            <Button.Root
              type='submit'
              variant='primary'
              mode='filled'
              size='small'
              disabled={createLevel.isPending || !formik.isValid}
            >
              {createLevel.isPending ? 'Saving...' : 'Create Level'}
            </Button.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}

export default CreateSetupModal;
export { CreateElectionModal } from './create-election';
