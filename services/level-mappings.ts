'use client';

import {
  useBaseMutation,
  useBasePaginatedQuery,
  useBaseQuery,
  type TId,
} from '@/services/_helpers';

import type { PaginationParams } from '@/types/api';

export interface LevelMappingItem {
  id: string;
  name: string;
  levelName: string;
  electionName: string;
  upperLevelName?: string | null;
  levelId?: string;
  electionId?: string;
  upper_level_id?: string | null;
  levelRank?: number;
}

export interface LevelMappingGroup {
  levelId: string;
  levelName: string;
  levelRank: number;
  mappings: LevelMappingItem[];
}

export interface CreateLevelMappingPayload {
  name: string;
  levelId: string;
  electionId: string;
  upper_level_id?: string | null;
}

export interface UpdateLevelMappingPayload extends CreateLevelMappingPayload {
  id: string;
}

// --- Queries ---

export function useGetLevelMappings(electionId?: string) {
  return useBaseQuery<LevelMappingGroup[]>(
    ['level-mappings', electionId || 'all'],
    () => `/level-mapping/election/${electionId}`,
    {
      enabled: Boolean(electionId),
    },
  );
}

// --- Mutations ---

export function useCreateLevelMapping() {
  return useBaseMutation<LevelMappingItem, CreateLevelMappingPayload>(
    ['create-level-mapping'],
    (payload) => `/level-mapping/election/${payload.electionId}`,
    'post',
    (payload) => [
      ['level-mappings'],
      ['level-mappings', payload.electionId],
      ['level-mappings', 'all'],
    ],
    {
      transformPayload: (payload) => ({
        name: payload.name.trim(),
        levelId: payload.levelId,
        electionId: payload.electionId,
        upper_level_id: payload.upper_level_id || null,
      }),
    },
  );
}

export interface CreateBulkLevelMappingsPayload {
  electionId: string;
  items: Array<{
    name: string;
    levelId: string;
    upper_level_id?: string | null;
    electionId?: string;
  }>;
}

export type BulkLevelMappingInput =
  | CreateBulkLevelMappingsPayload
  | CreateLevelMappingPayload[];

export function useCreateLevelMappingsBulk() {
  return useBaseMutation<LevelMappingItem[], BulkLevelMappingInput>(
    ['create-level-mappings-bulk'],
    (payload) => {
      const electionId = Array.isArray(payload)
        ? payload[0]?.electionId
        : payload.electionId;
      return `/level-mapping/election/${electionId}/bulk`;
    },
    'post',
    (payload) => {
      const electionId = Array.isArray(payload)
        ? payload[0]?.electionId
        : payload.electionId;
      return [
        ['level-mappings'],
        ['level-mappings', electionId],
        ['level-mappings', 'all'],
      ];
    },
    {
      transformPayload: (payload) => {
        const rawItems = Array.isArray(payload) ? payload : payload.items;
        const electionId = Array.isArray(payload)
          ? payload[0]?.electionId
          : payload.electionId;
        return rawItems.map((item) => ({
          name: item.name.trim(),
          levelId: item.levelId,
          electionId: item.electionId || electionId,
          upper_level_id: item.upper_level_id || null,
        }));
      },
    },
  );
}

export function useUpdateLevelMapping() {
  return useBaseMutation<LevelMappingItem, UpdateLevelMappingPayload>(
    ['update-level-mapping'],
    (payload) => `/level-mapping/election/${payload.electionId}`,
    'post',
    (payload) => [
      ['level-mappings'],
      ['level-mappings', payload.electionId],
      ['level-mappings', 'all'],
    ],
    {
      transformPayload: (payload) => ({
        id: payload.id,
        name: payload.name.trim(),
        levelId: payload.levelId,
        electionId: payload.electionId,
        upper_level_id: payload.upper_level_id || null,
      }),
    },
  );
}
