'use client';

import * as React from 'react';
import {
  useCreatePoliticalParty,
  type PoliticalPartyItem,
} from '@/services/political-parties';
import { RiAddLine, RiFlagLine } from '@remixicon/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';

import { PoliticalPartyForm } from './political-party-form';
import type { PoliticalPartyFormData } from './types';

interface CreatePoliticalPartyModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (item: PoliticalPartyItem) => void;
}

export const politicalPartyValidationSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .min(2, 'Political party name must be at least 2 characters')
    .max(120, 'Political party name cannot exceed 120 characters')
    .required('Political party name is required'),
  abbreviation: Yup.string()
    .trim()
    .max(20, 'Abbreviation cannot exceed 20 characters')
    .required('Abbreviation is required'),
});

const INITIAL_FORM_DATA: PoliticalPartyFormData = {
  name: '',
  abbreviation: '',
};

export function CreatePoliticalPartyModal({
  open,
  onClose,
  onSuccess,
}: CreatePoliticalPartyModalProps) {
  const createPoliticalParty = useCreatePoliticalParty();

  const formik = useFormik<PoliticalPartyFormData>({
    initialValues: INITIAL_FORM_DATA,
    validationSchema: politicalPartyValidationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: (values) => {
      createPoliticalParty.mutate(
        {
          name: values.name.trim(),
          abbreviation: values.abbreviation?.trim().toUpperCase() || '',
          imagePath: values.imagePath || '/',
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
      <Modal.Content className='max-w-[480px]'>
        <form onSubmit={formik.handleSubmit}>
          <Modal.Header
            icon={RiFlagLine}
            title='Create Political Party'
            description='Register a political party entity in the system directory.'
          />

          <Modal.Body className='py-5'>
            <PoliticalPartyForm
              values={formik.values}
              errors={formik.errors}
              touched={formik.touched}
              handleChange={formik.handleChange}
              handleBlur={formik.handleBlur}
              setFieldValue={formik.setFieldValue}
              disabled={createPoliticalParty.isPending}
            />
          </Modal.Body>

          <Modal.Footer>
            <Button.Root
              type='button'
              variant='neutral'
              mode='stroke'
              size='small'
              onClick={handleClose}
              disabled={createPoliticalParty.isPending}
            >
              Cancel
            </Button.Root>
            <Button.Root
              type='submit'
              variant='primary'
              mode='filled'
              size='small'
              disabled={createPoliticalParty.isPending || !formik.isValid}
            >
              {createPoliticalParty.isPending ? 'Saving...' : 'Create Party'}
            </Button.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}

export default CreatePoliticalPartyModal;
