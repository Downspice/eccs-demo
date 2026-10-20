'use client';

import {
  useBaseMutation,
  useBasePaginatedQuery,
  useBaseQuery,
  type TId,
} from '@/services/_helpers';

import type { PaginationParams } from '@/types/api';

export interface ElectionItem {
  id: string;
  name: string;
}

export interface CreateElectionPayload {
  name: string;
}

export interface UpdateElectionPayload {
  id: string;
  name: string;
}

// --- Queries ---

export function useGetElections() {
  return useBaseQuery<ElectionItem[]>(['elections'], '/elections');
}

export function useGetElectionsPaginated(params?: PaginationParams) {
  return useBasePaginatedQuery<ElectionItem>(
    ['elections-paginated'],
    '/elections',
    params,
  );
}

export function useGetElection(id?: TId) {
  return useBaseQuery<ElectionItem>(['election', id], `/elections/${id}`, {
    enabled: Boolean(id),
  });
}

// --- Mutations ---

export function useCreateElection() {
  return useBaseMutation<ElectionItem, CreateElectionPayload>(
    ['create-election'],
    '/elections',
    'post',
    () => [['elections'], ['elections-paginated']],
  );
}

export function useUpdateElection() {
  return useBaseMutation<ElectionItem, UpdateElectionPayload>(
    ['update-election'],
    (payload) => `/elections/${payload.id}`,
    'put',
    (payload) => [
      ['elections'],
      ['election', payload.id],
      ['elections-paginated'],
    ],
  );
}

export function useDeleteElection() {
  return useBaseMutation<void, { id: TId }>(
    ['delete-election'],
    (payload) => `/elections/${payload.id}`,
    'delete',
    (payload) => [
      ['elections'],
      ['election', payload.id],
      ['elections-paginated'],
    ],
  );
}
