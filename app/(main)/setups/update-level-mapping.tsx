'use client';

import * as React from 'react';
import {
  useUpdateLevelMapping,
  type LevelMappingItem,
} from '@/services/level-mappings';
import { RiEditLine } from '@remixicon/react';
import { useFormik } from 'formik';

import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';

import { levelMappingValidationSchema } from './create-level-mapping';
import { LevelMappingForm } from './level-mapping-form';
import type { LevelMappingFormData } from './types';

interface UpdateLevelMappingModalProps {
  item: LevelMappingItem | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: (item: LevelMappingItem) => void;
}

export function UpdateLevelMappingModal({
  item,
  open,
  onClose,
  onSuccess,
}: UpdateLevelMappingModalProps) {
  const updateLevelMapping = useUpdateLevelMapping();

  const formik = useFormik<LevelMappingFormData>({
    initialValues: {
      name: item?.name || '',
      electionId: item?.electionId || '',
      levelId: item?.levelId || '',
      upper_level_id: item?.upper_level_id || '',
    },
    validationSchema: levelMappingValidationSchema,
    enableReinitialize: true,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: (values) => {
      if (!item) return;

      updateLevelMapping.mutate(
        {
          id: item.id,
          name: values.name.trim(),
          electionId: values.electionId.trim(),
          levelId: values.levelId.trim(),
          upper_level_id: values.upper_level_id?.trim() || null,
        },
        {
          onSuccess: (updated) => {
            onSuccess?.(updated || { ...item, ...values });
            onClose();
          },
        },
      );
    },
  });

  return (
    <Modal.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Modal.Content className='max-w-[520px]'>
        <form onSubmit={formik.handleSubmit}>
          <Modal.Header
            icon={RiEditLine}
            title='Update Level Mapping'
            description={`Editing administrative mapping unit ${item?.name || ''}.`}
          />

          <Modal.Body className='py-5'>
            <LevelMappingForm
              values={formik.values}
              errors={formik.errors}
              touched={formik.touched}
              handleChange={formik.handleChange}
              handleBlur={formik.handleBlur}
              setFieldValue={formik.setFieldValue}
              disabled={updateLevelMapping.isPending}
              mappingId={item?.id}
            />
          </Modal.Body>

          <Modal.Footer>
            <Button.Root
              type='button'
              variant='neutral'
              mode='stroke'
              size='small'
              onClick={onClose}
              disabled={updateLevelMapping.isPending}
            >
              Cancel
            </Button.Root>
            <Button.Root
              type='submit'
              variant='primary'
              mode='filled'
              size='small'
              disabled={updateLevelMapping.isPending || !formik.isValid}
            >
              {updateLevelMapping.isPending ? 'Saving...' : 'Save Changes'}
            </Button.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
