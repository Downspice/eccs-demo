'use client';

import * as React from 'react';
import { useGetElections, type ElectionItem } from '@/services/elections';
import {
  useCreateLevelMapping,
  type LevelMappingItem,
} from '@/services/level-mappings';
import { RiNodeTree } from '@remixicon/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';

import { LevelMappingForm } from './level-mapping-form';
import type { LevelMappingFormData } from './types';

interface CreateLevelMappingModalProps {
  open: boolean;
  defaultElectionId?: string;
  onClose: () => void;
  onSuccess?: (item: LevelMappingItem) => void;
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
  onClose,
  onSuccess,
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

  const initialElectionId = defaultElectionId || elections[0]?.id || '';

  const formik = useFormik<LevelMappingFormData>({
    initialValues: {
      ...INITIAL_FORM_DATA,
      electionId: initialElectionId,
    },
    enableReinitialize: true,
    validationSchema: levelMappingValidationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: (values) => {
      createLevelMapping.mutate(
        {
          id: crypto.randomUUID(),
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
            title='Create Level Mapping'
            description='Define an administrative unit, jurisdiction, or polling center in the election hierarchy.'
          />

          <Modal.Body className='py-5'>
            <LevelMappingForm
              values={formik.values}
              errors={formik.errors}
              touched={formik.touched}
              handleChange={formik.handleChange}
              handleBlur={formik.handleBlur}
              setFieldValue={formik.setFieldValue}
              disabled={createLevelMapping.isPending}
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
