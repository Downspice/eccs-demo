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
 * Extracts a human-readable error message from backend responses,
 * error payloads { statuscode, message, data }, AxiosErrors, or Error instances.
 */
export function getErrorMessage(
  error: unknown,
  fallback = 'An unexpected error occurred',
): string {
  if (!error) return fallback;
  if (typeof error === 'string' && error.trim()) return error.trim();

  // 1. AxiosError with response.data
  const axiosErr = error as AxiosError<any>;
  if (axiosErr.response?.data) {
    const data = axiosErr.response.data;
    if (typeof data === 'string' && data.trim()) return data.trim();
    if (typeof data === 'object' && data !== null) {
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
        const msgs = Object.values(data.errors).flat();
        if (msgs.length > 0) return msgs.join(', ');
      }
    }
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
    if (obj.errors && typeof obj.errors === 'object') {
      const msgs = Object.values(obj.errors).flat();
      if (msgs.length > 0) return msgs.join(', ');
    }
  }

  if (error instanceof Error && error.message && error.message.trim()) {
    return error.message.trim();
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
    const message = getErrorMessage(titleOrError, fallback);
    const title =
      typeof optionsOrFallback === 'string'
        ? optionsOrFallback
        : optionsOrFallback?.fallback || 'Action failed';

    // Show message as description if it provides additional context beyond the title
    const description =
      message && message.toLowerCase() !== title.toLowerCase()
        ? message
        : undefined;

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
