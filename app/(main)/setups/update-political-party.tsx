'use client';

import * as React from 'react';
import {
  useUpdatePoliticalParty,
  type PoliticalPartyItem,
} from '@/services/political-parties';
import { RiEditLine } from '@remixicon/react';
import { useFormik } from 'formik';

import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';
import { toast } from '@/components/ui/toast';

import { politicalPartyValidationSchema } from './create-political-party';
import { PoliticalPartyForm } from './political-party-form';
import type { PoliticalPartyFormData } from './types';

interface UpdatePoliticalPartyModalProps {
  item: PoliticalPartyItem | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: (item: PoliticalPartyItem) => void;
}

export function UpdatePoliticalPartyModal({
  item,
  open,
  onClose,
  onSuccess,
}: UpdatePoliticalPartyModalProps) {
  const updatePoliticalParty = useUpdatePoliticalParty();

  const formik = useFormik<PoliticalPartyFormData>({
    initialValues: {
      name: item?.name || '',
      abbreviation: item?.abbreviation || '',
    },
    validationSchema: politicalPartyValidationSchema,
    enableReinitialize: true,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: (values) => {
      if (!item) return;

      updatePoliticalParty.mutate(
        {
          id: item.id,
          name: values.name.trim(),
          abbreviation: values.abbreviation?.trim().toUpperCase() || '',
          imagePath: item.imagePath || '/',
        },
        {
          onSuccess: (updated) => {
            toast.success('Political party updated', {
              description: `"${values.name.trim()}" has been updated.`,
            });
            onSuccess?.(updated || { ...item, ...values });
            onClose();
          },
          onError: (error) => {
            toast.error(error, 'Failed to update political party');
          },
        },
      );
    },
  });

  return (
    <Modal.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Modal.Content className='max-w-[480px]'>
        <form onSubmit={formik.handleSubmit}>
          <Modal.Header
            icon={RiEditLine}
            title='Update Political Party'
            description={`Editing parameters for ${item?.name || 'political party'}.`}
          />

          <Modal.Body className='py-5'>
            <PoliticalPartyForm
              values={formik.values}
              errors={formik.errors}
              touched={formik.touched}
              handleChange={formik.handleChange}
              handleBlur={formik.handleBlur}
              setFieldValue={formik.setFieldValue}
              disabled={updatePoliticalParty.isPending}
              partyId={item?.id}
            />
          </Modal.Body>

          <Modal.Footer>
            <Button.Root
              type='button'
              variant='neutral'
              mode='stroke'
              size='small'
              onClick={onClose}
              disabled={updatePoliticalParty.isPending}
            >
              Cancel
            </Button.Root>
            <Button.Root
              type='submit'
              variant='primary'
              mode='filled'
              size='small'
              disabled={updatePoliticalParty.isPending || !formik.isValid}
            >
              {updatePoliticalParty.isPending ? 'Saving...' : 'Save Changes'}
            </Button.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}

export default UpdatePoliticalPartyModal;
