'use client';

import * as React from 'react';
import { useGetElections, type ElectionItem } from '@/services/elections';
import {
  getNextAvailableRank,
  useCreateLevel,
  useGetLevels,
  type LevelItem,
} from '@/services/levels';
import { RiAddLine, RiCalendarEventLine, RiStackLine } from '@remixicon/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';
import { toast } from '@/components/ui/toast';

import { SetupForm } from './form';
import { NoElectionsAlert } from './no-elections-alert';
import type { SetupFormData } from './types';

interface CreateSetupModalProps {
  open: boolean;
  defaultElectionId?: string;
  onClose: () => void;
  onSuccess?: (item: LevelItem) => void;
  onSwitchToBulk?: () => void;
  onOpenCreateElection?: () => void;
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
  onSwitchToBulk,
  onOpenCreateElection,
}: CreateSetupModalProps) {
  const createLevel = useCreateLevel();
  const { data: rawElections, isLoading: isElectionsLoading } =
    useGetElections();

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

  const hasNoElections = !isElectionsLoading && elections.length === 0;

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
            toast.success('Level created successfully', {
              description: `"${newItem.name || values.name.trim()}" has been added.`,
            });
            onSuccess?.(newItem);
            handleClose();
          },
          onError: (error) => {
            toast.error(error, 'Failed to create level');
          },
        },
      );
    },
  });

  const selectedElectionId = formik.values.electionId || initialElectionId;
  const { data: rawLevels } = useGetLevels(selectedElectionId);

  const existingLevels = React.useMemo<LevelItem[]>(() => {
    if (Array.isArray(rawLevels)) return rawLevels;
    if (
      rawLevels &&
      typeof rawLevels === 'object' &&
      Array.isArray((rawLevels as { data?: LevelItem[] }).data)
    ) {
      return (rawLevels as { data: LevelItem[] }).data;
    }
    return [];
  }, [rawLevels]);

  const nextAvailableRank = React.useMemo(() => {
    return getNextAvailableRank(existingLevels.map((l) => l.levelRank));
  }, [existingLevels]);

  const lastElectionRef = React.useRef(selectedElectionId);

  // Automatically pre-populate levelRank with gap-filling rank on modal open or when election changes
  React.useEffect(() => {
    if (open) {
      const electionChanged = lastElectionRef.current !== selectedElectionId;
      lastElectionRef.current = selectedElectionId;

      if (!formik.touched.levelRank || electionChanged) {
        formik.setFieldValue('levelRank', nextAvailableRank);
      }
    }
  }, [
    open,
    selectedElectionId,
    nextAvailableRank,
    formik.touched.levelRank,
    formik.setFieldValue,
  ]);

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
            {hasNoElections ? (
              <NoElectionsAlert
                entityName='administrative levels'
                onOpenCreateElection={onOpenCreateElection}
                onClose={handleClose}
              />
            ) : (
              <SetupForm
                values={formik.values}
                errors={formik.errors}
                touched={formik.touched}
                handleChange={formik.handleChange}
                handleBlur={formik.handleBlur}
                setFieldValue={formik.setFieldValue}
                disabled={createLevel.isPending}
              />
            )}
          </Modal.Body>

          {hasNoElections ? (
            <Modal.Footer>
              <Button.Root
                type='button'
                variant='neutral'
                mode='stroke'
                size='small'
                onClick={handleClose}
              >
                Cancel
              </Button.Root>
              {onOpenCreateElection && (
                <Button.Root
                  type='button'
                  variant='primary'
                  mode='filled'
                  size='small'
                  onClick={() => {
                    handleClose();
                    onOpenCreateElection();
                  }}
                >
                  <Button.Icon as={RiCalendarEventLine} />
                  <span>Create Election First</span>
                </Button.Root>
              )}
            </Modal.Footer>
          ) : (
            <Modal.Footer className='justify-between'>
              <div>
                {onSwitchToBulk && (
                  <Button.Root
                    type='button'
                    variant='neutral'
                    mode='stroke'
                    size='small'
                    onClick={onSwitchToBulk}
                    disabled={createLevel.isPending}
                  >
                    <Button.Icon as={RiStackLine} />
                    <span>Switch to Bulk</span>
                  </Button.Root>
                )}
              </div>

              <div className='flex items-center gap-2'>
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
              </div>
            </Modal.Footer>
          )}
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
export { CreateBulkLevelsModal } from './create-bulk-levels';
