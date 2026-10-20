'use client';

import {
  useBaseMutation,
  useBasePaginatedQuery,
  useBaseQuery,
  type TId,
} from '@/services/_helpers';

import type { PaginationParams } from '@/types/api';

export interface SetupItem {
  id: string;
  name: string; // e.g. 'Level 1'
  title: string; // e.g. 'Foundational Hygiene'
  code: string; // e.g. 'LVL-01'
  category: string; // 'levels'
  description?: string;
  isEnabled: boolean;
  controlsCount?: number;
  updatedAt?: string;
}

export interface CreateSetupPayload {
  name: string;
  title: string;
  code: string;
  category?: string;
  description?: string;
  isEnabled: boolean;
  controlsCount?: number;
}

export interface UpdateSetupPayload extends Partial<CreateSetupPayload> {
  id: TId;
}

// --- Queries ---

export function useGetSetups() {
  return useBaseQuery<SetupItem[]>(['setups', 'levels'], '/api/levels');
}

export function useGetSetupsPaginated(params?: PaginationParams) {
  return useBasePaginatedQuery<SetupItem>(
    ['setups-paginated', 'levels'],
    '/api/levels',
    params,
  );
}

export function useGetSetup(id?: TId) {
  return useBaseQuery<SetupItem>(
    ['setup', 'level', id],
    `/api/levels/${id}`,
    {
      enabled: Boolean(id),
    },
  );
}

// --- Mutations ---

export function useCreateSetup() {
  return useBaseMutation<SetupItem, CreateSetupPayload>(
    ['create-level-setup'],
    '/api/levels',  
    'post',
    () => [
      ['setups', 'levels'],
      ['setups-paginated', 'levels'],
    ],
  );
}

export function useUpdateSetup() {
  return useBaseMutation<SetupItem, UpdateSetupPayload>(
    ['update-level-setup'],
    (payload) => `/api/levels/${payload.id}`,
    'put',
    (payload) => [
      ['setups', 'levels'],
      ['setup', 'level', payload.id],
      ['setups-paginated', 'levels'],
    ],
  );
}

export function useDeleteSetup() {
  return useBaseMutation<void, { id: TId }>(
    ['delete-level-setup'],
    (payload) => `/api/levels/${payload.id}`,
    'delete',
    (payload) => [
      ['setups', 'levels'],
      ['setup', 'level', payload.id],
      ['setups-paginated', 'levels'],
    ],
  );
}
