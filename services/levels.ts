'use client';

import {
  useBaseMutation,
  useBasePaginatedQuery,
  useBaseQuery,
  type TId,
} from '@/services/_helpers';

import type { PaginationParams } from '@/types/api';

export interface LevelItem {
  id: number;
  name: string;
  code: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'upcoming' | 'locked';
  progress: number;
  totalControls: number;
  passedControls: number;
  badgeText?: string;
  requirements?: { text: string; done: boolean }[];
}

export interface CreateLevelPayload {
  name: string;
  code: string;
  title: string;
  description: string;
  status?: string;
}

export interface UpdateLevelPayload extends Partial<CreateLevelPayload> {
  id: TId;
  progress?: number;
}

// --- Queries ---

export function useGetLevels() {
  return useBaseQuery<LevelItem[]>(['levels'], '/api/levels');
}

export function useGetLevelsPaginated(params?: PaginationParams) {
  return useBasePaginatedQuery<LevelItem>(
    ['levels-paginated'],
    '/api/levels',
    params,
  );
}

export function useGetLevel(id: TId) {
  return useBaseQuery<LevelItem>(['levels', id], `/api/levels/${id}`, {
    enabled: Boolean(id),
  });
}

// --- Mutations ---

export function useCreateLevel() {
  return useBaseMutation<LevelItem, CreateLevelPayload>(
    ['create-level'],
    '/api/levels',
    'post',
    () => [['levels'], ['levels-paginated']],
  );
}

export function useUpdateLevel() {
  return useBaseMutation<LevelItem, UpdateLevelPayload>(
    ['update-level'],
    (payload) => `/api/levels/${payload.id}`,
    'put',
    (payload) => [['levels'], ['levels', payload.id], ['levels-paginated']],
  );
}

export function useDeleteLevel() {
  return useBaseMutation<void, { id: TId }>(
    ['delete-level'],
    (payload) => `/api/levels/${payload.id}`,
    'delete',
    (payload) => [['levels'], ['levels', payload.id], ['levels-paginated']],
  );
}
