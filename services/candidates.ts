'use client';

import {
  useBaseMutation,
  useBasePaginatedQuery,
  useBaseQuery,
  type TId,
} from '@/services/_helpers';

import type { PaginationParams } from '@/types/api';

export interface CandidateItem {
  id: string;
  name: string;
  politicalPartyId: string;
  politicalPartyName?: string;
  electionId: string;
  electionName?: string;
  imagePath?: string;
}

export interface CreateCandidatePayload {
  name: string;
  politicalPartyId: string;
  electionId: string;
  imagePath?: string;
}

export interface UpdateCandidatePayload extends CreateCandidatePayload {
  id: string;
}

// --- Queries ---

export function useGetCandidates(electionId?: string) {
  return useBaseQuery<CandidateItem[]>(
    ['candidates', electionId || 'all'],
    () =>
      electionId
        ? `/candidate/electionid/${electionId}`
        : '/candidate/electionid/all',
    {
      enabled: Boolean(electionId),
    },
  );
}

export function useGetCandidate(candidateId?: string) {
  return useBaseQuery<CandidateItem>(
    ['candidate', candidateId],
    `/candidate/candidate/${candidateId}`,
    {
      enabled: Boolean(candidateId),
    },
  );
}

// --- Mutations ---

export function useCreateCandidate() {
  return useBaseMutation<CandidateItem, CreateCandidatePayload>(
    ['create-candidate'],
    '/candidate',
    'post',
    (payload) => [
      ['candidates'],
      ['candidates', payload.electionId],
      ['candidates', 'all'],
    ],
    {
      transformPayload: (payload) => [
        {
          name: payload.name.trim(),
          politicalPartyId: payload.politicalPartyId,
          electionId: payload.electionId,
          imagePath: payload.imagePath || '/images/candidate-default.png',
        },
      ],
    },
  );
}

export function useUpdateCandidate() {
  return useBaseMutation<CandidateItem, UpdateCandidatePayload>(
    ['update-candidate'],
    '/candidate',
    'post',
    (payload) => [
      ['candidates'],
      ['candidate', payload.id],
      ['candidates', payload.electionId],
      ['candidates', 'all'],
    ],
    {
      transformPayload: (payload) => [
        {
          id: payload.id,
          name: payload.name.trim(),
          politicalPartyId: payload.politicalPartyId,
          electionId: payload.electionId,
          imagePath: payload.imagePath || '/images/candidate-default.png',
        },
      ],
    },
  );
}
