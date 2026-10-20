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

export const INITIAL_ELECTIONS: ElectionItem[] = [
  {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    name: '2026 Presidential General Election',
  },
  {
    id: '7b89d412-1a45-4c91-9231-1f9e8a71b2d0',
    name: '2026 Congressional Primary Election',
  },
  {
    id: 'e42c98a1-8d23-4e67-b509-3c7f12e4569a',
    name: '2025 Municipal & School Board Election',
  },
  {
    id: 'c91a34e8-5b12-4f89-8d67-2a1e94b578cd',
    name: '2024 General Election (Archived)',
  },
];

// --- Queries ---

export function useGetElections() {
  return useBaseQuery<ElectionItem[]>(['elections'], '/elections', {
    placeholderData: {
      data: INITIAL_ELECTIONS,
      message: 'OK',
      statusCode: 200,
    },
  });
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
