'use client';

import * as React from 'react';
import { RiCloseLine, RiFilterLine, RiSearchLine } from '@remixicon/react';

import * as Badge from '@/components/ui/badge';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';

export interface SetupFilterState {
  search: string;
  status: 'all' | 'active' | 'disabled';
}

interface SetupFiltersProps {
  filters: SetupFilterState;
  onChange: (filters: Partial<SetupFilterState>) => void;
  onReset: () => void;
}

export function SetupFilters({
  filters,
  onChange,
  onReset,
}: SetupFiltersProps) {
  const hasActiveFilters =
    Boolean(filters.search.trim()) || filters.status !== 'all';

  return (
    <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
      {/* Search Input */}
      <div className='w-full sm:max-w-xs'>
        <Input.Root>
          <Input.Wrapper>
            <Input.Icon as={RiSearchLine} />
            <input
              type='text'
              placeholder='Search setups or codes...'
              value={filters.search}
              onChange={(e) => onChange({ search: e.target.value })}
              className='w-full bg-transparent px-2.5 py-2 text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none'
            />
            {filters.search && (
              <button
                type='button'
                onClick={() => onChange({ search: '' })}
                className='px-2 text-text-soft-400 hover:text-text-sub-600'
              >
                <RiCloseLine className='size-4' />
              </button>
            )}
          </Input.Wrapper>
        </Input.Root>
      </div>

      {/* Status Segment & Reset */}
      <div className='flex items-center gap-2'>
        <div className='flex rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-0.5 shadow-xs'>
          {(['all', 'active', 'disabled'] as const).map((st) => {
            const isActive = filters.status === st;

            return (
              <button
                key={st}
                type='button'
                onClick={() => onChange({ status: st })}
                className={`rounded-md px-2.5 py-1 text-label-xs font-medium capitalize transition-all ${
                  isActive
                    ? 'bg-bg-weak-50 text-text-strong-950 shadow-xs'
                    : 'text-text-sub-600 hover:text-text-strong-950'
                }`}
              >
                {st}
              </button>
            );
          })}
        </div>

        {hasActiveFilters && (
          <Button.Root
            variant='neutral'
            mode='stroke'
            size='xsmall'
            onClick={onReset}
            className='gap-1'
          >
            <Button.Icon as={RiCloseLine} />
            Reset
          </Button.Root>
        )}
      </div>
    </div>
  );
}

export default SetupFilters;
