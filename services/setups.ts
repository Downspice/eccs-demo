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

// Initial Level setups
export const INITIAL_SETUPS: SetupItem[] = [
  {
    id: '1',
    name: 'Level 1',
    title: 'Foundational Hygiene',
    code: 'LVL-01',
    category: 'levels',
    description:
      'Basic safeguarding of organizational assets, access control, identity hygiene, and core endpoint protection.',
    isEnabled: true,
    controlsCount: 18,
    updatedAt: '2026-10-18',
  },
  {
    id: '2',
    name: 'Level 2',
    title: 'Controlled & Documented',
    code: 'LVL-02',
    category: 'levels',
    description:
      'Standardized operational processes, encrypted communication protocols, incident response readiness, and supply chain review.',
    isEnabled: true,
    controlsCount: 34,
    updatedAt: '2026-10-16',
  },
  {
    id: '3',
    name: 'Level 3',
    title: 'Standardized & Automated',
    code: 'LVL-03',
    category: 'levels',
    description:
      'Institutionalized security policies, continuous automated compliance verification, threat modeling, and unified telemetry.',
    isEnabled: true,
    controlsCount: 46,
    updatedAt: '2026-10-14',
  },
  {
    id: '4',
    name: 'Level 4',
    title: 'Optimized & Continuous Assurance',
    code: 'LVL-04',
    category: 'levels',
    description:
      'Proactive security posture, machine-learning assisted threat anticipation, autonomous incident containment, and executive governance.',
    isEnabled: false,
    controlsCount: 60,
    updatedAt: '2026-10-10',
  },
];

// --- Queries ---

export function useGetSetups() {
  return useBaseQuery<SetupItem[]>(['setups', 'levels'], '/api/setups/levels', {
    placeholderData: {
      data: INITIAL_SETUPS,
      message: 'OK',
      statusCode: 200,
    },
  });
}

export function useGetSetupsPaginated(params?: PaginationParams) {
  return useBasePaginatedQuery<SetupItem>(
    ['setups-paginated', 'levels'],
    '/api/setups/levels',
    params,
  );
}

export function useGetSetup(id?: TId) {
  return useBaseQuery<SetupItem>(
    ['setup', 'level', id],
    `/api/setups/levels/${id}`,
    {
      enabled: Boolean(id),
    },
  );
}

// --- Mutations ---

export function useCreateSetup() {
  return useBaseMutation<SetupItem, CreateSetupPayload>(
    ['create-level-setup'],
    '/api/setups/levels',
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
    (payload) => `/api/setups/levels/${payload.id}`,
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
    (payload) => `/api/setups/levels/${payload.id}`,
    'delete',
    (payload) => [
      ['setups', 'levels'],
      ['setup', 'level', payload.id],
      ['setups-paginated', 'levels'],
    ],
  );
}
