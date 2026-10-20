'use client';

import * as React from 'react';

import { cn } from '@/utils/cn';

export interface SetupModuleItem {
  id: string;
  label: string;
  count?: number;
  badge?: string;
  description?: string;
  disabled?: boolean;
  loading?: boolean;
}

interface SetupTabsProps {
  tabs: SetupModuleItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function SetupTabs({ tabs, activeTab, onTabChange }: SetupTabsProps) {
  return (
    <nav
      className='flex flex-col border-b border-stroke-soft-200'
      aria-label='Setup Modules'
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type='button'
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'group relative flex w-full items-center justify-between border-b border-stroke-soft-200 px-6 py-4 text-left transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-inset',
              isActive
                ? 'bg-bg-weak-50 text-text-strong-950 font-semibold'
                : 'bg-bg-white-0 text-text-sub-600 hover:bg-bg-weak-50/70 hover:text-text-strong-950 font-medium',
            )}
          >
            <div className='flex items-center gap-3'>
              {isActive && (
                <div className='absolute left-0 top-0 bottom-0 w-1 bg-primary-base' />
              )}
              <span className='text-label-sm'>{tab.label}</span>
            </div>

            {tab.loading ? (
              <span className='h-4 w-6 animate-pulse rounded-full bg-bg-soft-200' />
            ) : typeof tab.count === 'number' ? (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-label-xs transition-colors',
                  isActive
                    ? 'bg-bg-soft-200 font-semibold text-text-strong-950'
                    : 'bg-bg-weak-50 text-text-sub-600 group-hover:bg-bg-soft-200',
                )}
              >
                {tab.count}
              </span>
            ) : null}

            {tab.badge && typeof tab.count !== 'number' && (
              <span className='rounded bg-bg-weak-50 px-2 py-0.5 text-label-xs font-normal text-text-soft-400'>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

export default SetupTabs;
