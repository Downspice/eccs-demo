'use client';

import * as React from 'react';
import { useGetElections, type ElectionItem } from '@/services/elections';
import {
  useCreateLevelMappingsBulk,
  useGetLevelMappings,
  type LevelMappingItem,
} from '@/services/level-mappings';
import { useGetLevels, type LevelItem } from '@/services/levels';
import {
  RiAddLine,
  RiCalendarEventLine,
  RiNodeTree,
  RiStackLine,
} from '@remixicon/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import * as Badge from '@/components/ui/badge';
import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';
import { toast } from '@/components/ui/toast';

import { BulkLevelMappingForm } from './bulk-level-mapping-form';
import { NoElectionsAlert } from './no-elections-alert';
import { NoLevelsAlert } from './no-levels-alert';
import type { BulkLevelMappingFormData } from './types';

interface CreateBulkLevelMappingModalProps {
  open: boolean;
  defaultElectionId?: string;
  parentItem?: LevelMappingItem | null;
  onClose: () => void;
  onSuccess?: (items: LevelMappingItem[]) => void;
  onSwitchToSingle?: () => void;
  onOpenCreateElection?: () => void;
  onOpenCreateLevel?: () => void;
  onOpenCreateBulkLevels?: () => void;
}

export const bulkLevelMappingValidationSchema = Yup.object().shape({
  electionId: Yup.string().trim().required('Associated election is required'),
  levelId: Yup.string().trim().required('Hierarchy level tier is required'),
  upper_level_id: Yup.string().nullable(),
  names: Yup.array()
    .of(Yup.string().trim())
    .test(
      'has-valid-names',
      'Please enter at least one valid unit name',
      (val) => {
        if (!val || !Array.isArray(val)) return false;
        return val.some((n) => typeof n === 'string' && n.trim().length > 0);
      },
    ),
});

const INITIAL_FORM_DATA: BulkLevelMappingFormData = {
  electionId: '',
  levelId: '',
  upper_level_id: '',
  names: [''],
};

export function CreateBulkLevelMappingModal({
  open,
  defaultElectionId,
  parentItem,
  onClose,
  onSuccess,
  onSwitchToSingle,
  onOpenCreateElection,
  onOpenCreateLevel,
  onOpenCreateBulkLevels,
}: CreateBulkLevelMappingModalProps) {
  const createLevelMappingsBulk = useCreateLevelMappingsBulk();
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

  const targetElectionId =
    parentItem?.electionId || defaultElectionId || elections[0]?.id || '';

  const targetElection = React.useMemo(() => {
    return elections.find((e) => e.id === targetElectionId);
  }, [elections, targetElectionId]);

  const { data: rawLevels, isLoading: isLevelsLoading } =
    useGetLevels(targetElectionId);
  const { data: rawMappings } = useGetLevelMappings(targetElectionId);

  const levels = React.useMemo<LevelItem[]>(() => {
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

  const hasNoLevels =
    !isElectionsLoading &&
    !isLevelsLoading &&
    !hasNoElections &&
    Boolean(targetElectionId) &&
    levels.length === 0;

  // Determine immediate subordinate tier when parentItem is given
  const suggestedLevelId = React.useMemo(() => {
    if (!parentItem || levels.length === 0) return '';

    // 1. If any sibling sub-unit exists under this parent, adopt its levelId
    if (rawMappings && Array.isArray(rawMappings)) {
      for (const group of rawMappings) {
        if (Array.isArray(group.mappings)) {
          const directChild = group.mappings.find(
            (m) =>
              m.upper_level_id === parentItem.id ||
              (m.upperLevelName &&
                m.upperLevelName.trim().toLowerCase() ===
                  parentItem.name.trim().toLowerCase()),
          );
          if (directChild?.levelId) {
            return directChild.levelId;
          }
        }
      }
    }

    // 2. Sort tiers by levelRank ascending
    const sortedLevels = [...levels].sort(
      (a, b) => (a.levelRank ?? 0) - (b.levelRank ?? 0),
    );
    const parentIndex = sortedLevels.findIndex(
      (l) =>
        l.id === parentItem.levelId ||
        (parentItem.levelName &&
          l.name.toLowerCase() === parentItem.levelName.toLowerCase()),
    );

    if (parentIndex !== -1) {
      const parentRank = sortedLevels[parentIndex].levelRank ?? 0;
      const nextLevelByRank = sortedLevels.find(
        (lvl) => (lvl.levelRank ?? 0) > parentRank,
      );
      if (nextLevelByRank) {
        return nextLevelByRank.id;
      }
      if (parentIndex + 1 < sortedLevels.length) {
        return sortedLevels[parentIndex + 1].id;
      }
    }

    if (!parentItem.upper_level_id && sortedLevels.length > 1) {
      return sortedLevels[1].id;
    }

    return '';
  }, [parentItem, levels, rawMappings]);

  const initialValues = React.useMemo<BulkLevelMappingFormData>(() => {
    return {
      electionId: targetElectionId,
      levelId: suggestedLevelId || '',
      upper_level_id: parentItem?.id || '',
      names: [''],
    };
  }, [targetElectionId, suggestedLevelId, parentItem]);

  const formik = useFormik<BulkLevelMappingFormData>({
    initialValues,
    enableReinitialize: true,
    validationSchema: bulkLevelMappingValidationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: (values) => {
      const validNames = values.names
        .map((n) => n.trim())
        .filter((n) => n.length > 0);
      if (validNames.length === 0) return;

      const items = validNames.map((name) => ({
        name,
        levelId: values.levelId,
        electionId: values.electionId,
        upper_level_id: values.upper_level_id || null,
      }));

      createLevelMappingsBulk.mutate(
        {
          electionId: values.electionId,
          items,
        },
        {
          onSuccess: (newItems) => {
            const count = Array.isArray(newItems)
              ? newItems.length
              : items.length;
            toast.success(
              `${count} ${count === 1 ? 'jurisdiction unit' : 'jurisdiction units'} created successfully`,
            );
            onSuccess?.(newItems);
            handleClose();
          },
          onError: (error) => {
            toast.error(error, 'Failed to create bulk jurisdiction mappings');
          },
        },
      );
    },
  });

  // Ensure fields are synchronized if levels/mappings finish loading after opening
  React.useEffect(() => {
    if (open && parentItem) {
      if (suggestedLevelId && !formik.values.levelId) {
        formik.setFieldValue('levelId', suggestedLevelId);
      }
      if (parentItem.id && !formik.values.upper_level_id) {
        formik.setFieldValue('upper_level_id', parentItem.id);
      }
      if (targetElectionId && !formik.values.electionId) {
        formik.setFieldValue('electionId', targetElectionId);
      }
    }
  }, [open, parentItem, suggestedLevelId, targetElectionId]);

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  const validNamesCount = formik.values.names.filter(
    (n) => typeof n === 'string' && n.trim().length > 0,
  ).length;

  return (
    <Modal.Root open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <Modal.Content className='max-w-[720px]'>
        <form onSubmit={formik.handleSubmit}>
          <Modal.Header
            icon={RiStackLine}
            title={
              parentItem
                ? `Bulk Add Sub-units under ${parentItem.name}`
                : 'Bulk Create Level Mappings'
            }
            description={
              parentItem
                ? `Quickly batch-create multiple sub-jurisdictions or polling stations directly under ${parentItem.name}.`
                : 'Register multiple administrative units or polling stations simultaneously for this election.'
            }
          />

          <Modal.Body className='py-5'>
            {hasNoElections ? (
              <NoElectionsAlert
                entityName='jurisdiction mappings'
                onOpenCreateElection={onOpenCreateElection}
                onClose={handleClose}
              />
            ) : hasNoLevels ? (
              <NoLevelsAlert
                electionName={targetElection?.name}
                onOpenCreateLevel={onOpenCreateLevel}
                onOpenCreateBulkLevels={onOpenCreateBulkLevels}
                onClose={handleClose}
              />
            ) : (
              <>
                {parentItem && (
                  <div className='mb-4 flex items-center justify-between rounded-xl bg-primary-base/5 p-3 ring-1 ring-inset ring-primary-base/20'>
                    <div className='flex items-center gap-2.5 min-w-0'>
                      <div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-base/10 text-primary-base'>
                        <RiNodeTree className='size-4' />
                      </div>
                      <div className='truncate text-paragraph-xs text-text-sub-600'>
                        <span>Parent jurisdiction: </span>
                        <strong className='font-semibold text-text-strong-950 text-paragraph-sm'>
                          {parentItem.name}
                        </strong>
                        {parentItem.levelName && (
                          <span className='ml-1 text-text-soft-400'>
                            ({parentItem.levelName})
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge.Root variant='lighter' color='blue' size='small'>
                      Parent Attached
                    </Badge.Root>
                  </div>
                )}

                <BulkLevelMappingForm
                  values={formik.values}
                  errors={formik.errors}
                  touched={formik.touched}
                  handleChange={formik.handleChange}
                  handleBlur={formik.handleBlur}
                  setFieldValue={formik.setFieldValue}
                  disabled={createLevelMappingsBulk.isPending}
                  parentItem={parentItem}
                  onSwitchToSingle={onSwitchToSingle}
                  onOpenCreateLevel={onOpenCreateLevel}
                />
              </>
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
          ) : hasNoLevels ? (
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
              {onOpenCreateBulkLevels ? (
                <Button.Root
                  type='button'
                  variant='primary'
                  mode='filled'
                  size='small'
                  onClick={() => {
                    handleClose();
                    onOpenCreateBulkLevels();
                  }}
                >
                  <Button.Icon as={RiStackLine} />
                  <span>Bulk Add Levels First</span>
                </Button.Root>
              ) : onOpenCreateLevel ? (
                <Button.Root
                  type='button'
                  variant='primary'
                  mode='filled'
                  size='small'
                  onClick={() => {
                    handleClose();
                    onOpenCreateLevel();
                  }}
                >
                  <Button.Icon as={RiAddLine} />
                  <span>Add Level First</span>
                </Button.Root>
              ) : null}
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
                    disabled={createLevelMappingsBulk.isPending}
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
                  disabled={createLevelMappingsBulk.isPending}
                >
                  Cancel
                </Button.Root>
                <Button.Root
                  type='submit'
                  variant='primary'
                  mode='filled'
                  size='small'
                  disabled={
                    createLevelMappingsBulk.isPending ||
                    validNamesCount === 0 ||
                    !formik.values.levelId ||
                    !formik.values.electionId
                  }
                >
                  <Button.Icon as={RiStackLine} />
                  <span>
                    {createLevelMappingsBulk.isPending
                      ? 'Creating units...'
                      : validNamesCount > 0
                        ? `Create ${validNamesCount} ${validNamesCount === 1 ? 'Unit' : 'Units'}`
                        : 'Create Units in Bulk'}
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

export default CreateBulkLevelMappingModal;
