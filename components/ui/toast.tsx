'use client';

import * as React from 'react';
import type { AxiosError } from 'axios';
import { toast as sonnerToast, Toaster as SonnerToaster } from 'sonner';

import 'sonner/dist/styles.css';

type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

export function Toaster({ ...props }: ToasterProps) {
  return (
    <SonnerToaster
      position='top-right'
      closeButton
      theme='light'
      className='toaster group'
      toastOptions={{
        classNames: {
          toast:
            'group toast font-sans rounded-xl p-3.5 shadow-regular-md ring-1 ring-inset ring-stroke-soft-200 text-paragraph-sm bg-bg-white-0 text-text-strong-950',
          title: 'font-semibold text-text-strong-950 text-paragraph-sm',
          description:
            'text-text-sub-600 text-paragraph-xs mt-0.5 leading-normal',
          actionButton:
            'bg-primary-base text-white text-paragraph-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-primary-dark transition-colors',
          cancelButton:
            'bg-bg-weak-50 text-text-sub-600 text-paragraph-xs font-medium px-3 py-1.5 rounded-lg hover:bg-bg-weak-100 transition-colors',
          closeButton:
            '!bg-bg-white-0 !text-text-sub-600 hover:!text-text-strong-950 !border !border-stroke-soft-200 !shadow-regular-xs transition-colors',
          success:
            '!bg-bg-white-0 !text-text-strong-950 !ring-stroke-soft-200 [&_[data-icon]]:!text-success-base',
          error:
            '!bg-bg-white-0 !text-text-strong-950 !ring-stroke-soft-200 [&_[data-icon]]:!text-error-base',
          warning:
            '!bg-bg-white-0 !text-text-strong-950 !ring-stroke-soft-200 [&_[data-icon]]:!text-warning-base',
          info: '!bg-bg-white-0 !text-text-strong-950 !ring-stroke-soft-200 [&_[data-icon]]:!text-primary-base',
        },
      }}
      {...props}
    />
  );
}

/**
 * Extracts a human-readable error message from backend responses or Error instances.
 */
export function getErrorMessage(
  error: unknown,
  fallback = 'An unexpected error occurred',
): string {
  if (!error) return fallback;
  if (typeof error === 'string') return error;

  const axiosErr = error as AxiosError<{
    message?: string;
    error?: string;
    details?: string;
  }>;
  if (axiosErr.response?.data) {
    const data = axiosErr.response.data;
    if (typeof data === 'string') return data;
    if (data.message) return data.message;
    if (data.error) return data.error;
    if (data.details) return data.details;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export const toast = {
  ...sonnerToast,
  success: (
    title: string,
    options?: { description?: string; duration?: number },
  ) => {
    return sonnerToast.success(title, options);
  },
  error: (
    titleOrError: unknown,
    optionsOrFallback?:
      | string
      | { description?: string; duration?: number; fallback?: string },
  ) => {
    if (
      typeof titleOrError === 'string' &&
      typeof optionsOrFallback !== 'string'
    ) {
      return sonnerToast.error(titleOrError, optionsOrFallback);
    }

    const fallback =
      typeof optionsOrFallback === 'string'
        ? optionsOrFallback
        : optionsOrFallback?.fallback || 'Action failed';
    const description = getErrorMessage(titleOrError, fallback);
    const title =
      typeof optionsOrFallback === 'string' ? optionsOrFallback : 'Error';

    return sonnerToast.error(title, {
      description,
      ...(typeof optionsOrFallback === 'object' ? optionsOrFallback : {}),
    });
  },
  info: (
    title: string,
    options?: { description?: string; duration?: number },
  ) => {
    return sonnerToast.info(title, options);
  },
  warning: (
    title: string,
    options?: { description?: string; duration?: number },
  ) => {
    return sonnerToast.warning(title, options);
  },
};
