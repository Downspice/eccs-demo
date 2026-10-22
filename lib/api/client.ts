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
 * Handles AxiosErrors, backend response objects { statuscode, message, data }, Errors, and strings.
 */
export function extractApiErrorMessage(error: unknown): string {
  if (!error) return 'An unexpected error occurred';
  if (typeof error === 'string') return error;

  // 1. AxiosError with response.data
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as Record<string, unknown> | undefined;

    if (data && typeof data === 'object') {
      if (typeof data.message === 'string' && data.message.trim()) {
        return data.message.trim();
      }
      if (Array.isArray(data.message) && data.message.length > 0) {
        return data.message.join(', ');
      }
      if (typeof data.error === 'string' && data.error.trim()) {
        return data.error.trim();
      }
      if (typeof data.detail === 'string' && data.detail.trim()) {
        return data.detail.trim();
      }
      if (typeof data.details === 'string' && data.details.trim()) {
        return data.details.trim();
      }

      if (data.errors && typeof data.errors === 'object') {
        const messages = Object.values(data.errors).flat();
        if (messages.length > 0) return messages.join(', ');
      }
    }

    if (error.response?.statusText) {
      return `${error.response.status} ${error.response.statusText}`;
    }

    return error.message || 'An unexpected network error occurred';
  }

  // 2. Direct object like { statuscode: 400, message: "...", data: null }
  if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, unknown>;
    if (typeof obj.message === 'string' && obj.message.trim()) {
      return obj.message.trim();
    }
    if (Array.isArray(obj.message) && obj.message.length > 0) {
      return obj.message.join(', ');
    }
    if (typeof obj.error === 'string' && obj.error.trim()) {
      return obj.error.trim();
    }
    if (typeof obj.detail === 'string' && obj.detail.trim()) {
      return obj.detail.trim();
    }
    if (typeof obj.details === 'string' && obj.details.trim()) {
      return obj.details.trim();
    }
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

    // Check if the server returned an error payload disguised inside an HTTP 2xx response
    const resData = response.data as Record<string, unknown> | undefined;
    if (resData && typeof resData === 'object' && !Array.isArray(resData)) {
      const code = (resData.statuscode ?? resData.statusCode) as
        | number
        | undefined;
      if (typeof code === 'number' && code >= 400) {
        const errorMessage = extractApiErrorMessage(resData);
        const apiError = new Error(errorMessage) as any;
        apiError.statuscode = code;
        apiError.statusCode = code;
        apiError.response = response;
        apiError.data = resData;
        throw apiError;
      }
    }

    return response.data;
  } catch (error) {
    const normalizedMessage = extractApiErrorMessage(error);
    const customError = error as any;

    if (
      customError.response?.data &&
      typeof customError.response.data === 'object'
    ) {
      customError.response.data.message = normalizedMessage;
    }
    if (typeof customError === 'object' && customError !== null) {
      customError.message = normalizedMessage;
    }

    throw customError;
  }
}

/**
 * Backwards compatibility alias for maintenance-test-environment
 */
export const dummyApiClient = apiClient;

export default apiClient;
