'use client';

import * as React from 'react';
import { useGetElections, type ElectionItem } from '@/services/elections';
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
  defaultElectionId?: string;
  onClose: () => void;
  onSuccess?: (item: LevelItem) => void;
}

export const levelValidationSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .required('Level name is required (e.g. Constituency)'),
  levelRank: Yup.number()
    .typeError('Level rank must be a valid number')
    .min(0, 'Level rank cannot be negative')
    .required('Level rank is required'),
  electionId: Yup.string().trim().required('Associated election is required'),
  description: Yup.string().max(
    500,
    'Description cannot exceed 500 characters',
  ),
});

const INITIAL_FORM_DATA: SetupFormData = {
  name: '',
  description: '',
  levelRank: 1,
  electionId: '',
};

export function CreateSetupModal({
  open,
  defaultElectionId,
  onClose,
  onSuccess,
}: CreateSetupModalProps) {
  const createLevel = useCreateLevel();
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

  const formik = useFormik<SetupFormData>({
    initialValues: {
      ...INITIAL_FORM_DATA,
      electionId: initialElectionId,
    },
    enableReinitialize: true,
    validationSchema: levelValidationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: (values) => {
      createLevel.mutate(
        {
          name: values.name.trim(),
          description: values.description?.trim() || '',
          levelRank: Number(values.levelRank),
          electionId: values.electionId.trim(),
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
      <Modal.Content className='max-w-[540px]'>
        <form onSubmit={formik.handleSubmit}>
          <Modal.Header
            icon={RiAddLine}
            title='Create New Level'
            description='Add a new hierarchical administrative level to the electoral setup.'
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
export { CreatePoliticalPartyModal } from './create-political-party';
export { CreateCandidateModal } from './create-candidate';
export { CreateLevelMappingModal } from './create-level-mapping';
export { CreateBulkLevelMappingModal } from './create-bulk-level-mapping';
