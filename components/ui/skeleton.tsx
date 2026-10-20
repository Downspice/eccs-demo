import * as React from 'react';

import { cn } from '@/utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden='true'
      className={cn('animate-pulse rounded-md bg-bg-soft-200/80', className)}
      {...props}
    />
  );
}
