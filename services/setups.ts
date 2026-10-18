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
  name: string;
  code: string;
  category: string;
  description?: string;
  isEnabled: boolean;
  itemCount?: number;
  updatedAt?: string;
}

export interface CreateSetupPayload {
  name: string;
  code: string;
  category: string;
  description?: string;
  isEnabled: boolean;
}

export interface UpdateSetupPayload extends Partial<CreateSetupPayload> {
  id: TId;
}

// Default initial mock data for immediate UI rendering & offline development
export const INITIAL_SETUPS: SetupItem[] = [
  {
    id: '1',
    name: 'Hardware Components & Assets',
    code: 'HW-ASSETS',
    category: 'equipment',
    description:
      'Physical server racks, workstations, routers, and peripheral inventory classifications.',
    isEnabled: true,
    itemCount: 48,
    updatedAt: '2026-10-18',
  },
  {
    id: '2',
    name: 'Critical Security Safeguards',
    code: 'SEC-CRIT',
    category: 'security',
    description:
      'Tier-1 baseline controls, biometric access restrictions, and privileged credential vaults.',
    isEnabled: true,
    itemCount: 16,
    updatedAt: '2026-10-16',
  },
  {
    id: '3',
    name: 'Preventive Maintenance Schedules',
    code: 'PM-SCHED',
    category: 'maintenance',
    description:
      'Automated recurring maintenance cycles, telemetry threshold audits, and cooling diagnostic logs.',
    isEnabled: true,
    itemCount: 24,
    updatedAt: '2026-10-14',
  },
  {
    id: '4',
    name: 'Vendor & Service Provider Directory',
    code: 'VND-TIER',
    category: 'vendors',
    description:
      'External SLA contracts, hardware warranty providers, and emergency repair contacts.',
    isEnabled: false,
    itemCount: 9,
    updatedAt: '2026-10-10',
  },
  {
    id: '5',
    name: 'Facility Incident Severity Codes',
    code: 'INC-SEV',
    category: 'general',
    description:
      'Standardized classification codes for infrastructure alerts, power fluctuations, and environmental risks.',
    isEnabled: true,
    itemCount: 12,
    updatedAt: '2026-10-08',
  },
];

// --- Queries ---

export function useGetSetups() {
  return useBaseQuery<SetupItem[]>(['setups'], '/api/setups', {
    // Provide fallback mock data if local Next.js /api is empty
    placeholderData: {
      data: INITIAL_SETUPS,
      message: 'OK',
      statusCode: 200,
    },
  });
}

export function useGetSetupsPaginated(params?: PaginationParams) {
  return useBasePaginatedQuery<SetupItem>(
    ['setups-paginated'],
    '/api/setups',
    params,
  );
}

export function useGetSetup(id?: TId) {
  return useBaseQuery<SetupItem>(['setup', id], `/api/setups/${id}`, {
    enabled: Boolean(id),
  });
}

// --- Mutations ---

export function useCreateSetup() {
  return useBaseMutation<SetupItem, CreateSetupPayload>(
    ['create-setup'],
    '/api/setups',
    'post',
    () => [['setups'], ['setups-paginated']],
  );
}

export function useUpdateSetup() {
  return useBaseMutation<SetupItem, UpdateSetupPayload>(
    ['update-setup'],
    (payload) => `/api/setups/${payload.id}`,
    'put',
    (payload) => [['setups'], ['setup', payload.id], ['setups-paginated']],
  );
}

export function useDeleteSetup() {
  return useBaseMutation<void, { id: TId }>(
    ['delete-setup'],
    (payload) => `/api/setups/${payload.id}`,
    'delete',
    (payload) => [['setups'], ['setup', payload.id], ['setups-paginated']],
  );
}
