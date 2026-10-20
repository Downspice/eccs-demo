'use client';

import {
  useBaseMutation,
  useBasePaginatedQuery,
  useBaseQuery,
  type TId,
} from '@/services/_helpers';

import type { PaginationParams } from '@/types/api';

export interface PoliticalPartyItem {
  id: string;
  name: string;
}

export interface CreatePoliticalPartyPayload {
  name: string;
}

export interface UpdatePoliticalPartyPayload {
  id: string;
  name: string;
}

// --- Queries ---

export function useGetPoliticalParties() {
  return useBaseQuery<PoliticalPartyItem[]>(
    ['political-parties'],
    '/political-party',
  );
}

export function useGetPoliticalPartiesPaginated(params?: PaginationParams) {
  return useBasePaginatedQuery<PoliticalPartyItem>(
    ['political-parties-paginated'],
    '/political-party',
    params,
  );
}

export function useGetPoliticalParty(id?: TId) {
  return useBaseQuery<PoliticalPartyItem>(
    ['political-party', id],
    `/political-party/${id}`,
    {
      enabled: Boolean(id),
    },
  );
}

// --- Mutations ---

export function useCreatePoliticalParty() {
  return useBaseMutation<PoliticalPartyItem, CreatePoliticalPartyPayload>(
    ['create-political-party'],
    '/political-party',
    'post',
    () => [['political-parties'], ['political-parties-paginated']],
  );
}

export function useUpdatePoliticalParty() {
  return useBaseMutation<PoliticalPartyItem, UpdatePoliticalPartyPayload>(
    ['update-political-party'],
    (payload) => `/political-party/${payload.id}`,
    'put',
    (payload) => [
      ['political-parties'],
      ['political-party', payload.id],
      ['political-parties-paginated'],
    ],
  );
}

export function useDeletePoliticalParty() {
  return useBaseMutation<void, { id: TId }>(
    ['delete-political-party'],
    '/political-party',
    'delete',
    () => [['political-parties'], ['political-parties-paginated']],
  );
}
