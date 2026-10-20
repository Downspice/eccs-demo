'use client';

import {
  useBaseMutation,
  useBasePaginatedQuery,
  useBaseQuery,
  type TId,
} from '@/services/_helpers';

import type { PaginationParams } from '@/types/api';

export interface LevelItem {
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

export interface CreateLevelPayload {
  name: string;
  title: string;
  code: string;
  category?: string;
  description?: string;
  isEnabled: boolean;
  controlsCount?: number;
}

export interface UpdateLevelPayload extends Partial<CreateLevelPayload> {
  id: TId;
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

export function useGetLevel(id?: TId) {
  return useBaseQuery<LevelItem>(['level', id], `/api/levels/${id}`, {
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
    (payload) => [['levels'], ['level', payload.id], ['levels-paginated']],
  );
}

export function useDeleteLevel() {
  return useBaseMutation<void, { id: TId }>(
    ['delete-level'],
    (payload) => `/api/levels/${payload.id}`,
    'delete',
    (payload) => [['levels'], ['level', payload.id], ['levels-paginated']],
  );
}

// Aliases for backwards compatibility
export type SetupItem = LevelItem;
export type CreateSetupPayload = CreateLevelPayload;
export type UpdateSetupPayload = UpdateLevelPayload;

export const useGetSetups = useGetLevels;
export const useGetSetupsPaginated = useGetLevelsPaginated;
export const useGetSetup = useGetLevel;
export const useCreateSetup = useCreateLevel;
export const useUpdateSetup = useUpdateLevel;
export const useDeleteSetup = useDeleteLevel;
