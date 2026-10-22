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
  name: string;
  description?: string;
  levelRank?: number;
  electionId?: string;
  electionName?: string;
  title?: string;
  code?: string;
  category?: string;
  isEnabled?: boolean;
  controlsCount?: number;
  updatedAt?: string;
}

export interface CreateLevelPayload {
  name: string;
  description?: string;
  levelRank: number;
  electionId: string;
}

export interface UpdateLevelPayload {
  id: TId;
  name: string;
  description?: string;
  levelRank: number;
  electionId: string;
}

// --- Queries ---

export function useGetLevels(electionId?: string) {
  return useBaseQuery<LevelItem[]>(
    ['levels', electionId || 'all'],
    () => (electionId ? `/levels/electionid/${electionId}` : '/levels'),
    {
      enabled: electionId !== undefined ? Boolean(electionId) : true,
    },
  );
}

export function useGetLevelsByElection(electionId?: string) {
  return useBaseQuery<LevelItem[]>(
    ['levels', 'election', electionId],
    () => `/levels/electionid/${electionId}`,
    {
      enabled: Boolean(electionId),
    },
  );
}

export function useGetLevelsPaginated(params?: PaginationParams) {
  return useBasePaginatedQuery<LevelItem>(
    ['levels-paginated'],
    '/levels',
    params,
  );
}

export function useGetLevel(id?: TId) {
  return useBaseQuery<LevelItem>(['level', id], `/levels/${id}`, {
    enabled: Boolean(id),
  });
}

export interface BulkLevelItemPayload {
  id?: TId;
  name: string;
  description?: string;
  levelRank: number;
  electionId?: string;
}

export interface BulkLevelsPayload {
  electionId: string;
  levels: BulkLevelItemPayload[];
}

// --- Mutations ---

export function useCreateLevel() {
  return useBaseMutation<LevelItem, CreateLevelPayload>(
    ['create-level'],
    '/levels',
    'post',
    (payload) => [
      ['levels'],
      ['levels', payload.electionId],
      ['levels', 'election', payload.electionId],
      ['levels-paginated'],
    ],
    {
      transformPayload: (payload) => ({
        name: payload.name.trim(),
        description: payload.description?.trim() || '',
        levelRank: Number(payload.levelRank),
        electionId: payload.electionId,
      }),
    },
  );
}

export function useUpdateLevelsBulk() {
  return useBaseMutation<LevelItem[], BulkLevelsPayload>(
    ['update-levels-bulk'],
    (payload) => `/levels/election/${payload.electionId}`,
    'post',
    (payload) => [
      ['levels'],
      ['levels', payload.electionId],
      ['levels', 'election', payload.electionId],
      ['levels-paginated'],
    ],
    {
      transformPayload: (payload) =>
        payload.levels.map((lvl) => ({
          ...(lvl.id ? { id: lvl.id } : {}),
          name: lvl.name.trim(),
          description: lvl.description?.trim() || '',
          levelRank: Number(lvl.levelRank),
          electionId: lvl.electionId || payload.electionId,
        })),
    },
  );
}

export const useCreateLevelsBulk = useUpdateLevelsBulk;
export const useSaveLevelsForElection = useUpdateLevelsBulk;

export function useUpdateLevel() {
  return useBaseMutation<LevelItem, UpdateLevelPayload>(
    ['update-level'],
    (payload) => `/levels/election/${payload.electionId}`,
    'post',
    (payload) => [
      ['levels'],
      ['level', payload.id],
      ['levels', payload.electionId],
      ['levels', 'election', payload.electionId],
      ['levels-paginated'],
    ],
    {
      transformPayload: (payload) => [
        {
          id: payload.id,
          name: payload.name.trim(),
          description: payload.description?.trim() || '',
          levelRank: Number(payload.levelRank),
          electionId: payload.electionId,
        },
      ],
    },
  );
}

export function useDeleteLevel() {
  return useBaseMutation<void, { id: TId; electionId?: string }>(
    ['delete-level'],
    (payload) => `/levels/${payload.id}`,
    'delete',
    (payload) => [
      ['levels'],
      ['level', payload.id],
      ['levels', payload.electionId],
      ['levels', 'election', payload.electionId],
      ['levels-paginated'],
    ],
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
export const useCreateSetupsBulk = useCreateLevelsBulk;
export const useUpdateSetupsBulk = useUpdateLevelsBulk;
export const useDeleteSetup = useDeleteLevel;
