'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type {
  ApiError,
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  TId,
} from '@/types/api';
import { apiClient } from '@/lib/api/client';

export type { TId };
export type TEntity = unknown;
export type TParams = Record<string, unknown>;

export const buildUrl = (path: string): string => path;

/**
 * Base Mutation Hook
 * Encapsulates mutationFn, HTTP method, payload mapping, and automatic query cache invalidation.
 */
export const useBaseMutation = <
  TResponse = unknown,
  TPayload = unknown,
  TContext = unknown,
>(
  mutationKey: QueryKey,
  endpoint: string | ((payload: TPayload) => string),
  method: 'post' | 'put' | 'delete' | 'patch',
  invalidateKeys?:
    | ((payload: TPayload, data: TResponse) => QueryKey[])
    | QueryKey[],
  options?: UseMutationOptions<
    TResponse,
    AxiosError<ApiError>,
    TPayload,
    TContext
  > & {
    transformPayload?: (payload: TPayload) => unknown;
  },
) => {
  const queryClient = useQueryClient();

  const mutationFn = async (payload: TPayload): Promise<TResponse> => {
    const url = typeof endpoint === 'function' ? endpoint(payload) : endpoint;
    const isBodyMethod =
      method === 'post' || method === 'put' || method === 'patch';
    const requestData = options?.transformPayload
      ? options.transformPayload(payload)
      : payload;

    const response = await apiClient<ApiResponse<TResponse> | TResponse>(url, {
      method,
      data: isBodyMethod
        ? requestData
        : method === 'delete'
          ? requestData
          : undefined,
      params:
        method === 'delete' &&
        payload &&
        typeof payload === 'object' &&
        'id' in payload
          ? { id: (payload as Record<string, unknown>).id }
          : undefined,
    });

    // Automatically unwraps ApiResponse.data if nested, or returns direct response
    if (
      response &&
      typeof response === 'object' &&
      !Array.isArray(response) &&
      'data' in response
    ) {
      return (response as { data: TResponse }).data;
    }

    return response as TResponse;
  };

  return useMutation<TResponse, AxiosError<ApiError>, TPayload, TContext>({
    mutationKey,
    mutationFn,
    onSuccess: async (...args) => {
      if (invalidateKeys) {
        const [data, variables] = args;
        const keys =
          typeof invalidateKeys === 'function'
            ? invalidateKeys(variables, data)
            : invalidateKeys;

        keys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
      return options?.onSuccess?.(...args);
    },
    ...options,
  });
};

/**
 * Base Query Hook
 * Eliminates repetitive queryFn boilerplate for standard fetch requests.
 */
export const useBaseQuery = <TData = unknown, TSelect = TData>(
  queryKey: QueryKey,
  endpoint: string | (() => string),
  options?: Omit<
    UseQueryOptions<ApiResponse<TData>, AxiosError<ApiError>, TSelect>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery<ApiResponse<TData>, AxiosError<ApiError>, TSelect>({
    queryKey,
    queryFn: async () => {
      const url = typeof endpoint === 'function' ? endpoint() : endpoint;
      return await apiClient<ApiResponse<TData>>(url);
    },
    // Default select unwraps `data` from ApiResponse if present, else returns raw response
    select: (response) =>
      response &&
      typeof response === 'object' &&
      !Array.isArray(response) &&
      'data' in response
        ? ((response as { data: TData }).data as unknown as TSelect)
        : (response as unknown as TSelect),
    ...options,
  });
};

/**
 * Base Paginated Query Hook
 * Automatically handles pagination parameters serialization without manual string concatenation.
 */
export const useBasePaginatedQuery = <
  TData = unknown,
  TSelect = PaginatedResponse<TData>,
>(
  queryKey: QueryKey,
  endpoint: string,
  params: PaginationParams = {},
  options?: Omit<
    UseQueryOptions<PaginatedResponse<TData>, AxiosError<ApiError>, TSelect>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery<PaginatedResponse<TData>, AxiosError<ApiError>, TSelect>({
    queryKey: [...queryKey, params],
    queryFn: async () => {
      return await apiClient<PaginatedResponse<TData>>(endpoint, {
        params,
      });
    },
    staleTime: 30 * 1000,
    ...options,
  });
};
