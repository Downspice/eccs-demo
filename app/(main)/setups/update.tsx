'use client';

import * as React from 'react';
import { useGetElections, type ElectionItem } from '@/services/elections';
import { useUpdateLevel, type LevelItem } from '@/services/levels';
import { RiEditLine } from '@remixicon/react';
import { useFormik } from 'formik';

import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';
import { toast } from '@/components/ui/toast';

import { levelValidationSchema } from './create';
import { SetupForm } from './form';
import type { SetupFormData } from './types';

interface UpdateSetupModalProps {
  item: LevelItem | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: (item: LevelItem) => void;
}

export function UpdateSetupModal({
  item,
  open,
  onClose,
  onSuccess,
}: UpdateSetupModalProps) {
  const updateLevel = useUpdateLevel();
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

  const initialElectionId = React.useMemo(() => {
    if (item?.electionId) return item.electionId;
    if (item?.electionName && elections.length > 0) {
      const match = elections.find((e) => e.name === item.electionName);
      if (match) return match.id;
    }
    return elections[0]?.id || '';
  }, [item?.electionId, item?.electionName, elections]);

  const formik = useFormik<SetupFormData>({
    initialValues: {
      name: item?.name || '',
      description: item?.description || '',
      levelRank: item?.levelRank ?? 1,
      electionId: initialElectionId,
    },
    validationSchema: levelValidationSchema,
    enableReinitialize: true,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: (values) => {
      if (!item) return;

      updateLevel.mutate(
        {
          id: item.id,
          name: values.name.trim(),
          description: values.description?.trim() || '',
          levelRank: Number(values.levelRank),
          electionId: values.electionId.trim(),
        },
        {
          onSuccess: (updated) => {
            toast.success('Level updated successfully', {
              description: `"${values.name.trim()}" has been updated.`,
            });
            onSuccess?.(updated || { ...item, ...values });
            onClose();
          },
          onError: (error) => {
            toast.error(error, 'Failed to update level');
          },
        },
      );
    },
  });

  return (
    <Modal.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Modal.Content className='max-w-[540px]'>
        <form onSubmit={formik.handleSubmit}>
          <Modal.Header
            icon={RiEditLine}
            title='Update Level Setup'
            description={`Editing parameters for ${item?.name || 'level'}.`}
          />

          <Modal.Body className='py-5'>
            <SetupForm
              values={formik.values}
              errors={formik.errors}
              touched={formik.touched}
              handleChange={formik.handleChange}
              handleBlur={formik.handleBlur}
              setFieldValue={formik.setFieldValue}
              disabled={updateLevel.isPending}
            />
          </Modal.Body>

          <Modal.Footer>
            <Button.Root
              type='button'
              variant='neutral'
              mode='stroke'
              size='small'
              onClick={onClose}
              disabled={updateLevel.isPending}
            >
              Cancel
            </Button.Root>
            <Button.Root
              type='submit'
              variant='primary'
              mode='filled'
              size='small'
              disabled={updateLevel.isPending || !formik.isValid}
            >
              {updateLevel.isPending ? 'Saving...' : 'Save Changes'}
            </Button.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}

export default UpdateSetupModal;
export { UpdateElectionModal } from './update-election';
export { UpdatePoliticalPartyModal } from './update-political-party';
export { UpdateCandidateModal } from './update-candidate';
export { UpdateLevelMappingModal } from './update-level-mapping';
