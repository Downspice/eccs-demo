export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type TId = string | number;

/**
 * Standard single entity response from API
 */
export interface ApiResponse<T = unknown> {
  data: T;
  message: string;
  statusCode: number;
}

/**
 * Standard list response from API
 */
export interface ApiListResponse<T = unknown> {
  data: T[];
  message: string;
  statusCode: number;
  length?: number;
  total?: number;
}

/**
 * Spring Boot / Enterprise paginated response structure
 */
export interface PaginatedData<T = unknown> {
  content: T[];
  size: number;
  page: number;
  totalElements: number;
  totalPages: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  sort?: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
}

export interface PaginatedResponse<T = unknown> {
  data: PaginatedData<T>;
  message: string;
  statusCode: number;
  dateTime?: string;
}

/**
 * Standardized API Error structure
 */
export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
  timestamp?: string;
  path?: string;
}

/**
 * Universal query parameters for paginated and filterable endpoints
 */
export interface PaginationParams {
  page?: number;
  size?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  [key: string]: unknown;
}
