'use client';

import * as React from 'react';
import { RiCloseLine, RiSearchLine } from '@remixicon/react';

import * as Input from '@/components/ui/input';

export interface SetupFilterState {
  search: string;
}

interface SetupFiltersProps {
  filters: SetupFilterState;
  onChange: (filters: Partial<SetupFilterState>) => void;
  onReset?: () => void;
}

export function SetupFilters({
  filters,
  onChange,
}: SetupFiltersProps) {
  return (
    <div className='w-full sm:max-w-xs'>
      <Input.Root>
        <Input.Wrapper>
          <Input.Icon as={RiSearchLine} />
          <input
            type='text'
            placeholder='Search levels...'
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className='w-full bg-transparent px-2.5 py-2 text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none'
          />
          {filters.search && (
            <button
              type='button'
              onClick={() => onChange({ search: '' })}
              className='px-2 text-text-soft-400 hover:text-text-sub-600'
              title='Clear search'
            >
              <RiCloseLine className='size-4' />
            </button>
          )}
        </Input.Wrapper>
      </Input.Root>
    </div>
  );
}

export default SetupFilters;
