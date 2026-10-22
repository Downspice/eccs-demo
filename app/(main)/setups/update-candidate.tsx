'use client';

import * as React from 'react';
import { useUpdateCandidate, type CandidateItem } from '@/services/candidates';
import { RiEditLine } from '@remixicon/react';
import { useFormik } from 'formik';

import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';
import { toast } from '@/components/ui/toast';

import { CandidateForm } from './candidate-form';
import { candidateValidationSchema } from './create-candidate';
import type { CandidateFormData } from './types';

interface UpdateCandidateModalProps {
  item: CandidateItem | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: (item: CandidateItem) => void;
}

export function UpdateCandidateModal({
  item,
  open,
  onClose,
  onSuccess,
}: UpdateCandidateModalProps) {
  const updateCandidate = useUpdateCandidate();

  const formik = useFormik<CandidateFormData>({
    initialValues: {
      name: item?.name || '',
      electionId: item?.electionId || '',
      politicalPartyId: item?.politicalPartyId || '',
      imagePath: item?.imagePath || '',
    },
    validationSchema: candidateValidationSchema,
    enableReinitialize: true,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: (values) => {
      if (!item) return;

      updateCandidate.mutate(
        {
          id: item.id,
          name: values.name.trim(),
          electionId: values.electionId.trim(),
          politicalPartyId: values.politicalPartyId.trim(),
          imagePath:
            values.imagePath?.trim() || '/images/candidate-default.png',
        },
        {
          onSuccess: (updated) => {
            toast.success('Candidate updated successfully', {
              description: `"${values.name.trim()}" has been updated.`,
            });
            onSuccess?.(updated || { ...item, ...values });
            onClose();
          },
          onError: (error) => {
            toast.error(error, 'Failed to update candidate');
          },
        },
      );
    },
  });

  return (
    <Modal.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Modal.Content className='max-w-[500px]'>
        <form onSubmit={formik.handleSubmit}>
          <Modal.Header
            icon={RiEditLine}
            title='Update Candidate'
            description={`Editing nomination details for ${item?.name || 'candidate'}.`}
          />

          <Modal.Body className='py-5'>
            <CandidateForm
              values={formik.values}
              errors={formik.errors}
              touched={formik.touched}
              handleChange={formik.handleChange}
              handleBlur={formik.handleBlur}
              setFieldValue={formik.setFieldValue}
              disabled={updateCandidate.isPending}
            />
          </Modal.Body>

          <Modal.Footer>
            <Button.Root
              type='button'
              variant='neutral'
              mode='stroke'
              size='small'
              onClick={onClose}
              disabled={updateCandidate.isPending}
            >
              Cancel
            </Button.Root>
            <Button.Root
              type='submit'
              variant='primary'
              mode='filled'
              size='small'
              disabled={updateCandidate.isPending || !formik.isValid}
            >
              {updateCandidate.isPending ? 'Saving...' : 'Save Changes'}
            </Button.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
