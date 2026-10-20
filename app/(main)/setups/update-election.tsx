'use client';

import * as React from 'react';
import { useUpdateElection, type ElectionItem } from '@/services/elections';
import { RiEditLine } from '@remixicon/react';
import { useFormik } from 'formik';

import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';

import { electionValidationSchema } from './create-election';
import { ElectionForm } from './election-form';
import type { ElectionFormData } from './types';

interface UpdateElectionModalProps {
  item: ElectionItem | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: (item: ElectionItem) => void;
}

export function UpdateElectionModal({
  item,
  open,
  onClose,
  onSuccess,
}: UpdateElectionModalProps) {
  const updateElection = useUpdateElection();

  const formik = useFormik<ElectionFormData>({
    initialValues: {
      name: item?.name || '',
    },
    validationSchema: electionValidationSchema,
    enableReinitialize: true,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: (values) => {
      if (!item) return;

      updateElection.mutate(
        {
          id: item.id,
          name: values.name,
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
      <Modal.Content className='max-w-[480px]'>
        <form onSubmit={formik.handleSubmit}>
          <Modal.Header
            icon={RiEditLine}
            title='Update Election'
            description={`Editing configuration and details for ${item?.name || 'election'}.`}
          />

          <Modal.Body className='py-5'>
            <ElectionForm
              values={formik.values}
              errors={formik.errors}
              touched={formik.touched}
              handleChange={formik.handleChange}
              handleBlur={formik.handleBlur}
              setFieldValue={formik.setFieldValue}
              disabled={updateElection.isPending}
              electionId={item?.id}
            />
          </Modal.Body>

          <Modal.Footer>
            <Button.Root
              type='button'
              variant='neutral'
              mode='stroke'
              size='small'
              onClick={onClose}
              disabled={updateElection.isPending}
            >
              Cancel
            </Button.Root>
            <Button.Root
              type='submit'
              variant='primary'
              mode='filled'
              size='small'
              disabled={updateElection.isPending || !formik.isValid}
            >
              {updateElection.isPending ? 'Saving...' : 'Save Changes'}
            </Button.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}

export default UpdateElectionModal;
