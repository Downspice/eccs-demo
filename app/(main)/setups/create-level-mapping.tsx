'use client';

import * as React from 'react';
import { useGetElections, type ElectionItem } from '@/services/elections';
import {
  useCreateLevelMapping,
  useGetLevelMappings,
  type LevelMappingItem,
} from '@/services/level-mappings';
import { useGetLevels, type LevelItem } from '@/services/levels';
import { RiNodeTree, RiStackLine } from '@remixicon/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import * as Badge from '@/components/ui/badge';
import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';

import { LevelMappingForm } from './level-mapping-form';
import type { LevelMappingFormData } from './types';

interface CreateLevelMappingModalProps {
  open: boolean;
  defaultElectionId?: string;
  parentItem?: LevelMappingItem | null;
  onClose: () => void;
  onSuccess?: (item: LevelMappingItem) => void;
  onSwitchToBulk?: () => void;
}

export const levelMappingValidationSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .required('Unit / Jurisdiction name is required (e.g. Tegbi)'),
  electionId: Yup.string().trim().required('Associated election is required'),
  levelId: Yup.string().trim().required('Hierarchy level is required'),
  upper_level_id: Yup.string().nullable(),
});

const INITIAL_FORM_DATA: LevelMappingFormData = {
  name: '',
  electionId: '',
  levelId: '',
  upper_level_id: '',
};

export function CreateLevelMappingModal({
  open,
  defaultElectionId,
  parentItem,
  onClose,
  onSuccess,
  onSwitchToBulk,
}: CreateLevelMappingModalProps) {
  const createLevelMapping = useCreateLevelMapping();
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

  const targetElectionId =
    parentItem?.electionId || defaultElectionId || elections[0]?.id || '';

  const { data: rawLevels } = useGetLevels(targetElectionId);
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

  // Determine immediate subordinate tier to prefill levelId when parentItem is given
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
          if (directChild && (directChild.levelId || group.levelId)) {
            return directChild.levelId || group.levelId;
          }
        }
      }
    }

    // 2. Look up parent level in the ranked level hierarchy
    const sortedLevels = [...levels].sort(
      (a, b) => (a.levelRank ?? 0) - (b.levelRank ?? 0),
    );

    const parentIndex = sortedLevels.findIndex(
      (lvl) =>
        (parentItem.levelId && lvl.id === parentItem.levelId) ||
        (parentItem.levelName &&
          lvl.name.trim().toLowerCase() ===
            parentItem.levelName.trim().toLowerCase()),
    );

    if (parentIndex !== -1) {
      const parentRank = sortedLevels[parentIndex].levelRank ?? 0;
      // Look for the next level tier with a higher rank number (immediate sub-tier)
      const nextLevelByRank = sortedLevels.find(
        (lvl) => (lvl.levelRank ?? 0) > parentRank,
      );
      if (nextLevelByRank) {
        return nextLevelByRank.id;
      }
      // Or simply the next level in index if ranks aren't strictly greater
      if (parentIndex + 1 < sortedLevels.length) {
        return sortedLevels[parentIndex + 1].id;
      }
    }

    // 3. Fallback: if parent is top-level (no upper_level_id) and we have multiple levels, default to 2nd level
    if (!parentItem.upper_level_id && sortedLevels.length > 1) {
      return sortedLevels[1].id;
    }

    return '';
  }, [parentItem, levels, rawMappings]);

  const initialValues = React.useMemo<LevelMappingFormData>(() => {
    return {
      name: '',
      electionId: targetElectionId,
      levelId: suggestedLevelId || '',
      upper_level_id: parentItem?.id || '',
    };
  }, [targetElectionId, suggestedLevelId, parentItem]);

  const formik = useFormik<LevelMappingFormData>({
    initialValues,
    enableReinitialize: true,
    validationSchema: levelMappingValidationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: (values) => {
      createLevelMapping.mutate(
        {
          name: values.name.trim(),
          electionId: values.electionId.trim(),
          levelId: values.levelId.trim(),
          upper_level_id: values.upper_level_id?.trim() || null,
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

  return (
    <Modal.Root open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <Modal.Content className='max-w-[520px]'>
        <form onSubmit={formik.handleSubmit}>
          <Modal.Header
            icon={RiNodeTree}
            title={
              parentItem
                ? `Add Sub-unit under ${parentItem.name}`
                : 'Create Level Mapping'
            }
            description={
              parentItem
                ? `Define a subordinate administrative unit or jurisdiction directly under ${parentItem.name} (${parentItem.levelName || 'Jurisdiction'}).`
                : 'Define an administrative unit, jurisdiction, or polling center in the election hierarchy.'
            }
          />

          <Modal.Body className='py-5'>
            {onSwitchToBulk && (
              <div className='mb-4 flex items-center justify-between rounded-xl bg-bg-weak-50 px-3.5 py-2 text-paragraph-xs ring-1 ring-inset ring-stroke-soft-200'>
                <div className='flex items-center gap-2 text-text-sub-600'>
                  <RiStackLine className='size-4 text-primary-base shrink-0' />
                  <span>Have a list of multiple units to create?</span>
                </div>
                <button
                  type='button'
                  onClick={onSwitchToBulk}
                  className='font-semibold text-primary-base hover:underline'
                >
                  Switch to bulk mode
                </button>
              </div>
            )}

            {parentItem && (
              <div className='mb-4 flex items-center justify-between rounded-lg bg-bg-weak-50 p-2.5 ring-1 ring-inset ring-stroke-soft-200'>
                <div className='flex items-center gap-2 min-w-0'>
                  <RiNodeTree className='size-4 text-primary-base shrink-0' />
                  <div className='truncate text-paragraph-xs text-text-sub-600'>
                    <span>Parent jurisdiction: </span>
                    <strong className='font-semibold text-text-strong-950'>
                      {parentItem.name}
                    </strong>
                    {parentItem.levelName && (
                      <span className='text-text-soft-400'>
                        {' '}
                        ({parentItem.levelName})
                      </span>
                    )}
                  </div>
                </div>
                <Badge.Root variant='lighter' color='blue' size='small'>
                  Sub-unit
                </Badge.Root>
              </div>
            )}

            <LevelMappingForm
              values={formik.values}
              errors={formik.errors}
              touched={formik.touched}
              handleChange={formik.handleChange}
              handleBlur={formik.handleBlur}
              setFieldValue={formik.setFieldValue}
              disabled={createLevelMapping.isPending}
              parentItem={parentItem}
            />
          </Modal.Body>

          <Modal.Footer>
            <Button.Root
              type='button'
              variant='neutral'
              mode='stroke'
              size='small'
              onClick={handleClose}
              disabled={createLevelMapping.isPending}
            >
              Cancel
            </Button.Root>
            <Button.Root
              type='submit'
              variant='primary'
              mode='filled'
              size='small'
              disabled={createLevelMapping.isPending || !formik.isValid}
            >
              {createLevelMapping.isPending ? 'Creating...' : 'Create Mapping'}
            </Button.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
