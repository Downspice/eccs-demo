'use client';

import * as React from 'react';
import type { CandidateItem } from '@/services/candidates';
import {
  useCreateElectionCollation,
  type ElectionCollationSummaryData,
} from '@/services/election-collations';
import type { LevelMappingItem } from '@/services/level-mappings';
import { RiFileChartLine, RiInboxArchiveLine } from '@remixicon/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';

import { CollationForm, type CollationFormData } from './collation-form';

interface RecordCollationModalProps {
  open: boolean;
  electionId: string;
  defaultStationId?: string;
  stations: LevelMappingItem[];
  candidates: CandidateItem[];
  onClose: () => void;
  onSuccess?: (data: ElectionCollationSummaryData) => void;
}

export const collationValidationSchema = Yup.object().shape({
  levelMappingId: Yup.string()
    .trim()
    .required('Please select a reporting polling station'),
  electionId: Yup.string().trim().required('Associated election is required'),
  spoiltBallot: Yup.number()
    .min(0, 'Cannot be negative')
    .required('Spoilt ballots count is required'),
  status: Yup.boolean().default(true),
  results: Yup.array().of(
    Yup.object().shape({
      candidateId: Yup.string().required(),
      candidateName: Yup.string().required(),
      total: Yup.number().min(0, 'Votes cannot be negative').required(),
      percentage: Yup.number().min(0).max(100),
    }),
  ),
});

export function RecordCollationModal({
  open,
  electionId,
  defaultStationId,
  stations,
  candidates,
  onClose,
  onSuccess,
}: RecordCollationModalProps) {
  const createCollation = useCreateElectionCollation();

  const initialValues: CollationFormData = React.useMemo(() => {
    return {
      levelMappingId: defaultStationId || (stations[0]?.id ?? ''),
      electionId: electionId,
      spoiltBallot: 0,
      pathToResultsImage: '/',
      status: true,
      results: candidates.map((c) => ({
        candidateId: c.id,
        candidateName: c.name,
        partyName: c.politicalPartyName,
        total: 0,
        percentage: 0,
      })),
    };
  }, [defaultStationId, stations, electionId, candidates]);

  const formik = useFormik<CollationFormData>({
    enableReinitialize: true,
    initialValues,
    validationSchema: collationValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const totalVotes = values.results.reduce(
          (sum, r) => sum + (Number(r.total) || 0),
          0,
        );

        const normalizedResults = values.results.map((r) => ({
          candidateId: r.candidateId,
          candidateName: r.candidateName,
          total: Number(r.total) || 0,
          percentage:
            totalVotes > 0
              ? Number(((Number(r.total) / totalVotes) * 100).toFixed(2))
              : 0,
        }));

        const res = await createCollation.mutateAsync({
          id: crypto.randomUUID(),
          electionId: values.electionId,
          levelMappingId: values.levelMappingId,
          spoiltBallot: Number(values.spoiltBallot) || 0,
          pathToResultsImage: '/',
          status: values.status,
          results: normalizedResults,
        });

        resetForm();
        onClose();
        onSuccess?.(res);
      } catch (err) {
        console.error('Failed to submit station collation:', err);
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Modal.Root open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <Modal.Content className='max-w-2xl'>
        <form onSubmit={formik.handleSubmit}>
          <Modal.Header
            icon={RiFileChartLine}
            title='Record Station Results Sheet'
            description='Collate and certify ballot returns, candidate vote shares, and rejected ballots.'
          />

          <Modal.Body className='max-h-[70vh] overflow-y-auto py-5'>
            <CollationForm
              values={formik.values}
              errors={formik.errors}
              touched={formik.touched}
              handleChange={formik.handleChange}
              handleBlur={formik.handleBlur}
              setFieldValue={formik.setFieldValue}
              stations={stations}
              candidates={candidates}
              disabled={createCollation.isPending}
            />
          </Modal.Body>

          <Modal.Footer>
            <Button.Root
              type='button'
              variant='neutral'
              mode='stroke'
              size='small'
              onClick={handleClose}
              disabled={createCollation.isPending}
            >
              Cancel
            </Button.Root>
            <Button.Root
              type='submit'
              variant='primary'
              mode='filled'
              size='small'
              disabled={
                createCollation.isPending || !formik.values.levelMappingId
              }
            >
              <Button.Icon as={RiInboxArchiveLine} />
              <span>
                {createCollation.isPending
                  ? 'Certifying...'
                  : 'Submit Collation'}
              </span>
            </Button.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}

export default RecordCollationModal;
