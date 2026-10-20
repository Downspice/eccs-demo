'use client';

import * as React from 'react';
import { useCreateElection, type ElectionItem } from '@/services/elections';
import { RiAddLine, RiGovernmentLine } from '@remixicon/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';

import { ElectionForm } from './election-form';
import type { ElectionFormData } from './types';

interface CreateElectionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (item: ElectionItem) => void;
}

export const electionValidationSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .min(3, 'Election name must be at least 3 characters')
    .max(120, 'Election name cannot exceed 120 characters')
    .required('Election name is required'),
});

const INITIAL_FORM_DATA: ElectionFormData = {
  name: '',
};

export function CreateElectionModal({
  open,
  onClose,
  onSuccess,
}: CreateElectionModalProps) {
  const createElection = useCreateElection();

  const formik = useFormik<ElectionFormData>({
    initialValues: INITIAL_FORM_DATA,
    validationSchema: electionValidationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: (values) => {
      createElection.mutate(values, {
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
      <Modal.Content className='max-w-[480px]'>
        <form onSubmit={formik.handleSubmit}>
          <Modal.Header
            icon={RiGovernmentLine}
            title='Create New Election'
            description='Register a new election event and voting schedule in the system.'
          />

          <Modal.Body className='py-5'>
            <ElectionForm
              values={formik.values}
              errors={formik.errors}
              touched={formik.touched}
              handleChange={formik.handleChange}
              handleBlur={formik.handleBlur}
              setFieldValue={formik.setFieldValue}
              disabled={createElection.isPending}
            />
          </Modal.Body>

          <Modal.Footer>
            <Button.Root
              type='button'
              variant='neutral'
              mode='stroke'
              size='small'
              onClick={handleClose}
              disabled={createElection.isPending}
            >
              Cancel
            </Button.Root>
            <Button.Root
              type='submit'
              variant='primary'
              mode='filled'
              size='small'
              disabled={createElection.isPending || !formik.isValid}
            >
              {createElection.isPending ? 'Saving...' : 'Create Election'}
            </Button.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}

export default CreateElectionModal;
