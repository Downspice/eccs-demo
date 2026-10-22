'use client';

import * as React from 'react';
import { useCreateCandidate, type CandidateItem } from '@/services/candidates';
import { useGetElections, type ElectionItem } from '@/services/elections';
import { RiUserAddLine } from '@remixicon/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';

import { CandidateForm } from './candidate-form';
import type { CandidateFormData } from './types';

interface CreateCandidateModalProps {
  open: boolean;
  defaultElectionId?: string;
  onClose: () => void;
  onSuccess?: (item: CandidateItem) => void;
}

export const candidateValidationSchema = Yup.object().shape({
  name: Yup.string().trim().required('Candidate full name is required'),
  electionId: Yup.string().trim().required('Associated election is required'),
  politicalPartyId: Yup.string().trim().required('Political party is required'),
  imagePath: Yup.string().trim(),
});

const INITIAL_FORM_DATA: CandidateFormData = {
  name: '',
  electionId: '',
  politicalPartyId: '',
  imagePath: '',
};

export function CreateCandidateModal({
  open,
  defaultElectionId,
  onClose,
  onSuccess,
}: CreateCandidateModalProps) {
  const createCandidate = useCreateCandidate();
  const { data: rawElections } = useGetElections();

  const elections = React.useMemo<ElectionItem[]>(() => {
    if (Array.isArray(rawElections)) return rawElections;
    if (
      rawElections &&
      typeof rawElections === 'object' &&
      Array.isArray((rawElections as { data?: ElectionItem[] }).data)
    ) {
      return (rawElections as { data: ElectionItem[] }).data;
    }
    return [];
  }, [rawElections]);

  const initialElectionId = defaultElectionId || elections[0]?.id || '';

  const formik = useFormik<CandidateFormData>({
    initialValues: {
      ...INITIAL_FORM_DATA,
      electionId: initialElectionId,
    },
    enableReinitialize: true,
    validationSchema: candidateValidationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: (values) => {
      createCandidate.mutate(
        {
          name: values.name.trim(),
          electionId: values.electionId.trim(),
          politicalPartyId: values.politicalPartyId.trim(),
          imagePath:
            values.imagePath?.trim() || '/images/candidate-default.png',
        },
        {
          onSuccess: (newItem) => {
            onSuccess?.(newItem);
            handleClose();
          },
        },
      );
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Modal.Root open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <Modal.Content className='max-w-[500px]'>
        <form onSubmit={formik.handleSubmit}>
          <Modal.Header
            icon={RiUserAddLine}
            title='Register Candidate'
            description='Add a nominated candidate running for an active election cycle.'
          />

          <Modal.Body className='py-5'>
            <CandidateForm
              values={formik.values}
              errors={formik.errors}
              touched={formik.touched}
              handleChange={formik.handleChange}
              handleBlur={formik.handleBlur}
              setFieldValue={formik.setFieldValue}
              disabled={createCandidate.isPending}
            />
          </Modal.Body>

          <Modal.Footer>
            <Button.Root
              type='button'
              variant='neutral'
              mode='stroke'
              size='small'
              onClick={handleClose}
              disabled={createCandidate.isPending}
            >
              Cancel
            </Button.Root>
            <Button.Root
              type='submit'
              variant='primary'
              mode='filled'
              size='small'
              disabled={createCandidate.isPending || !formik.isValid}
            >
              {createCandidate.isPending ? 'Registering...' : 'Add Candidate'}
            </Button.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
