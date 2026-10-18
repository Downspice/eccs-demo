import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

import type { ApiError } from '@/types/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: {
    // Automatically cleans undefined / null values from query parameters
    indexes: null,
  },
});

/**
 * Standardized error message extractor
 */
export function extractApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as Partial<ApiError> | undefined;

    if (data?.message) {
      if (Array.isArray(data.message)) {
        return (data.message as string[]).join(', ');
      }
      return String(data.message);
    }

    if (data?.errors && typeof data.errors === 'object') {
      const messages = Object.values(data.errors).flat();
      if (messages.length > 0) return messages.join(', ');
    }

    if (error.response?.statusText) {
      return `${error.response.status} ${error.response.statusText}`;
    }

    return error.message || 'An unexpected network error occurred';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

/**
 * Core API Client
 * Compatible with Downspice/maintenance-test-environment dummyApiClient while improving
 * error extraction, type safety, and params serialization.
 */
export async function apiClient<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  try {
    const response: AxiosResponse<T> = await axiosInstance({
      url,
      ...config,
      // Strip undefined params to keep URLs clean
      params: config?.params
        ? Object.fromEntries(
            Object.entries(config.params).filter(
              ([_, v]) => v !== undefined && v !== null && v !== '',
            ),
          )
        : undefined,
    });
    return response.data;
  } catch (error) {
    const normalizedMessage = extractApiErrorMessage(error);
    const customError = error as AxiosError<ApiError>;

    if (customError.response?.data) {
      customError.response.data.message = normalizedMessage;
    }

    throw customError;
  }
}

/**
 * Backwards compatibility alias for maintenance-test-environment
 */
export const dummyApiClient = apiClient;

export default apiClient;
