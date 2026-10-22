'use client';

import * as React from 'react';
import { useGetElections, type ElectionItem } from '@/services/elections';
import {
  getAvailableRanks,
  useGetLevels,
  useUpdateLevelsBulk,
  type LevelItem,
} from '@/services/levels';
import { RiAddLine, RiCalendarEventLine, RiStackLine } from '@remixicon/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';
import { toast } from '@/components/ui/toast';

import { BulkLevelsForm } from './bulk-levels-form';
import { NoElectionsAlert } from './no-elections-alert';
import type { BulkLevelRow, BulkLevelsFormData } from './types';

interface CreateBulkLevelsModalProps {
  open: boolean;
  defaultElectionId?: string;
  onClose: () => void;
  onSuccess?: (items: LevelItem[]) => void;
  onSwitchToSingle?: () => void;
  onOpenCreateElection?: () => void;
}

export const bulkLevelsValidationSchema = Yup.object().shape({
  electionId: Yup.string().trim().required('Associated election is required'),
  levels: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string()
          .trim()
          .required('Level name is required (e.g. Region, Constituency)'),
        levelRank: Yup.number()
          .typeError('Rank must be a valid number')
          .min(0, 'Rank cannot be negative')
          .required('Rank is required'),
        description: Yup.string().max(500, 'Max 500 characters'),
      }),
    )
    .min(1, 'Please configure at least one level tier'),
});

export function CreateBulkLevelsModal({
  open,
  defaultElectionId,
  onClose,
  onSuccess,
  onSwitchToSingle,
  onOpenCreateElection,
}: CreateBulkLevelsModalProps) {
  const updateLevelsBulk = useUpdateLevelsBulk();
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
  const { data: rawLevels } = useGetLevels(initialElectionId);

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

  const existingRanks = React.useMemo(() => {
    return existingLevels
      .map((l) => Number(l.levelRank))
      .filter((r) => !isNaN(r) && r > 0);
  }, [existingLevels]);

  const initialRows = React.useMemo<BulkLevelRow[]>(() => {
    const ranks = getAvailableRanks(existingRanks, 2);
    return [
      { levelRank: ranks[0] ?? 1, name: '', description: '' },
      { levelRank: ranks[1] ?? 2, name: '', description: '' },
    ];
  }, [existingRanks]);

  const formik = useFormik<BulkLevelsFormData>({
    initialValues: {
      electionId: initialElectionId,
      levels: initialRows,
    },
    enableReinitialize: true,
    validationSchema: bulkLevelsValidationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: (values) => {
      const validLevels = values.levels
        .filter((lvl) => lvl.name.trim().length > 0)
        .map((lvl) => ({
          name: lvl.name.trim(),
          description: lvl.description?.trim() || '',
          levelRank: Number(lvl.levelRank),
          electionId: values.electionId,
        }));

      if (validLevels.length === 0) return;

      updateLevelsBulk.mutate(
        {
          electionId: values.electionId,
          levels: validLevels,
        },
        {
          onSuccess: (newItems) => {
            const count = Array.isArray(newItems)
              ? newItems.length
              : validLevels.length;
            toast.success(
              `${count} ${count === 1 ? 'level' : 'levels'} created successfully`,
            );
            onSuccess?.(newItems);
            handleClose();
          },
          onError: (error) => {
            toast.error(error, 'Failed to create bulk levels');
          },
        },
      );
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  const validCount = formik.values.levels.filter(
    (lvl) => lvl.name.trim().length > 0,
  ).length;

  return (
    <Modal.Root open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <Modal.Content className='max-w-[720px]'>
        <form onSubmit={formik.handleSubmit}>
          <Modal.Header
            icon={RiStackLine}
            title='Bulk Create Administrative Levels'
            description='Configure and publish complete hierarchical levels for an election simultaneously.'
          />

          <Modal.Body className='py-5'>
            {hasNoElections ? (
              <NoElectionsAlert
                entityName='administrative levels'
                onOpenCreateElection={onOpenCreateElection}
                onClose={handleClose}
              />
            ) : (
              <BulkLevelsForm
                values={formik.values}
                errors={formik.errors}
                touched={formik.touched}
                handleChange={formik.handleChange}
                handleBlur={formik.handleBlur}
                setFieldValue={formik.setFieldValue}
                disabled={updateLevelsBulk.isPending}
                onSwitchToSingle={onSwitchToSingle}
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
                {onSwitchToSingle && (
                  <Button.Root
                    type='button'
                    variant='neutral'
                    mode='stroke'
                    size='small'
                    onClick={onSwitchToSingle}
                    disabled={updateLevelsBulk.isPending}
                  >
                    <Button.Icon as={RiAddLine} />
                    <span>Switch to Single</span>
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
                  disabled={updateLevelsBulk.isPending}
                >
                  Cancel
                </Button.Root>
                <Button.Root
                  type='submit'
                  variant='primary'
                  mode='filled'
                  size='small'
                  disabled={
                    updateLevelsBulk.isPending ||
                    validCount === 0 ||
                    !formik.values.electionId ||
                    !formik.isValid
                  }
                >
                  <Button.Icon as={RiStackLine} />
                  <span>
                    {updateLevelsBulk.isPending
                      ? 'Saving levels...'
                      : validCount > 0
                        ? `Create ${validCount} ${validCount === 1 ? 'Level' : 'Levels'}`
                        : 'Create Levels in Bulk'}
                  </span>
                </Button.Root>
              </div>
            </Modal.Footer>
          )}
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}

export default CreateBulkLevelsModal;
