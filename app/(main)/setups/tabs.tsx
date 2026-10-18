'use client';

import * as React from 'react';

import { cn } from '@/utils/cn';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface SetupTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function SetupTabs({ tabs, activeTab, onTabChange }: SetupTabsProps) {
  return (
    <div className='flex items-center gap-1 overflow-x-auto border-b border-stroke-soft-200 pb-px'>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type='button'
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'group relative flex items-center gap-2 whitespace-nowrap px-4 py-2.5 text-label-sm transition-all',
              isActive
                ? 'font-semibold text-primary-base'
                : 'text-text-sub-600 hover:text-text-strong-950',
            )}
          >
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-label-xs transition-colors',
                  isActive
                    ? 'bg-primary-lighter/40 text-primary-base font-semibold'
                    : 'bg-bg-soft-200 text-text-sub-600 group-hover:bg-bg-sub-300',
                )}
              >
                {tab.count}
              </span>
            )}

            {isActive && (
              <div className='absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary-base' />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default SetupTabs;
