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
  abbreviation?: string;
  imagePath?: string;
}

export interface CreatePoliticalPartyPayload {
  id?: string;
  name: string;
  abbreviation?: string;
  imagePath?: string;
}

export interface UpdatePoliticalPartyPayload {
  id: string;
  name: string;
  abbreviation?: string;
  imagePath?: string;
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
    {
      transformPayload: (payload) => {
        const item = {
          id: payload.id || crypto.randomUUID(),
          name: payload.name.trim(),
          abbreviation:
            payload.abbreviation?.trim() ||
            payload.name
              .trim()
              .split(' ')
              .map((w) => w[0])
              .join('')
              .toUpperCase() ||
            'PP',
          imagePath: payload.imagePath || '/',
        };
        return [item];
      },
    },
  );
}

export function useUpdatePoliticalParty() {
  return useBaseMutation<PoliticalPartyItem, UpdatePoliticalPartyPayload>(
    ['update-political-party'],
    '/political-party',
    'post',
    (payload) => [
      ['political-parties'],
      ['political-party', payload.id],
      ['political-parties-paginated'],
    ],
    {
      transformPayload: (payload) => {
        const item = {
          id: payload.id,
          name: payload.name.trim(),
          abbreviation:
            payload.abbreviation?.trim() ||
            payload.name
              .trim()
              .split(' ')
              .map((w) => w[0])
              .join('')
              .toUpperCase() ||
            'PP',
          imagePath: payload.imagePath || '/',
        };
        return [item];
      },
    },
  );
}

export function useDeletePoliticalParty() {
  return useBaseMutation<void, { id: TId }>(
    ['delete-political-party'],
    (payload) => `/political-party/${payload.id}`,
    'delete',
    () => [['political-parties'], ['political-parties-paginated']],
  );
}
