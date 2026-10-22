'use client';

import * as React from 'react';
import { useUpdateElection, type ElectionItem } from '@/services/elections';
import { RiEditLine } from '@remixicon/react';
import { useFormik } from 'formik';

import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';
import { toast } from '@/components/ui/toast';

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
      electionDate: item?.electionDate || '',
      expectedTurnout: item?.expectedTurnout ?? '',
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
          name: values.name.trim(),
          electionDate: values.electionDate || undefined,
          expectedTurnout:
            values.expectedTurnout !== '' &&
            values.expectedTurnout !== undefined
              ? Number(values.expectedTurnout)
              : undefined,
        },
        {
          onSuccess: (updated) => {
            toast.success('Election updated successfully', {
              description: `"${values.name.trim()}" has been updated.`,
            });
            onSuccess?.(updated || { ...item, ...values });
            onClose();
          },
          onError: (error) => {
            toast.error(error, 'Failed to update election');
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
