'use client';

import * as React from 'react';
import type { ElectionItem } from '@/services/elections';
import {
  RiArrowDownSLine,
  RiCheckLine,
  RiCloseLine,
  RiFilter3Line,
  RiGovernmentLine,
  RiSearchLine,
} from '@remixicon/react';

import { cn } from '@/utils/cn';
import * as Badge from '@/components/ui/badge';
import * as Checkbox from '@/components/ui/checkbox';
import * as Popover from '@/components/ui/popover';

export interface ElectionMultiSelectProps {
  elections: ElectionItem[];
  selectedElectionIds: string[];
  onChange: (selectedIds: string[]) => void;
  className?: string;
  placeholder?: string;
}

export function ElectionMultiSelect({
  elections,
  selectedElectionIds,
  onChange,
  className,
  placeholder = 'All Elections',
}: ElectionMultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const filteredElections = React.useMemo(() => {
    if (!search.trim()) return elections;
    const q = search.toLowerCase();
    return elections.filter((e) => e.name?.toLowerCase().includes(q));
  }, [elections, search]);

  const allSelected =
    elections.length > 0 && selectedElectionIds.length === elections.length;
  const isFiltered =
    selectedElectionIds.length > 0 &&
    selectedElectionIds.length < elections.length;

  const handleToggle = (id: string) => {
    if (selectedElectionIds.includes(id)) {
      onChange(selectedElectionIds.filter((item) => item !== id));
    } else {
      onChange([...selectedElectionIds, id]);
    }
  };

  const handleSelectAll = () => {
    onChange(elections.map((e) => e.id));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  // Determine trigger label
  const triggerLabel = React.useMemo(() => {
    if (selectedElectionIds.length === 0 || allSelected) {
      return placeholder;
    }
    if (selectedElectionIds.length === 1) {
      const match = elections.find((e) => e.id === selectedElectionIds[0]);
      return match?.name || '1 Election';
    }
    return `${selectedElectionIds.length} Elections`;
  }, [selectedElectionIds, allSelected, placeholder, elections]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type='button'
          className={cn(
            'group/trigger inline-flex h-9 min-w-[200px] max-w-[280px] items-center gap-2 rounded-10 bg-bg-white-0 px-3 text-paragraph-sm text-text-strong-950 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 outline-none transition duration-200 ease-out',
            'hover:bg-bg-weak-50 hover:ring-stroke-sub-300',
            'focus:shadow-button-important-focus focus:outline-none focus:ring-stroke-strong-950',
            'data-[state=open]:ring-stroke-strong-950 data-[state=open]:bg-bg-weak-50',
            className,
          )}
          aria-label='Filter table by election'
        >
          <RiGovernmentLine className='size-4 shrink-0 text-text-sub-600 transition-colors group-hover/trigger:text-text-strong-950' />

          <span className='truncate text-left font-medium flex-1'>
            {triggerLabel}
          </span>

          {isFiltered && (
            <Badge.Root
              size='small'
              variant='light'
              color='blue'
              className='shrink-0 font-medium'
            >
              {selectedElectionIds.length}
            </Badge.Root>
          )}

          <RiArrowDownSLine
            className={cn(
              'size-4 shrink-0 text-text-soft-400 transition-transform duration-200',
              open && 'rotate-180 text-text-strong-950',
            )}
          />
        </button>
      </Popover.Trigger>

      <Popover.Content
        align='end'
        sideOffset={8}
        showArrow={false}
        className='z-50 w-72 p-0 rounded-2xl bg-bg-white-0 shadow-regular-md ring-1 ring-inset ring-stroke-soft-200 overflow-hidden'
      >
        {/* Header */}
        <div className='flex items-center justify-between border-b border-stroke-soft-200 px-3 py-2.5 bg-bg-weak-50/50'>
          <div className='flex items-center gap-1.5'>
            <RiFilter3Line className='size-3.5 text-text-sub-600' />
            <span className='text-subheading-xs uppercase font-medium text-text-sub-600 tracking-wider'>
              Filter Elections
            </span>
          </div>

          <div className='flex items-center gap-1'>
            {selectedElectionIds.length > 0 ? (
              <button
                type='button'
                onClick={handleClearAll}
                className='text-paragraph-xs font-medium text-text-sub-600 hover:text-text-strong-950 transition-colors px-1.5 py-0.5 rounded hover:bg-bg-weak-50'
              >
                Clear
              </button>
            ) : (
              <button
                type='button'
                onClick={handleSelectAll}
                className='text-paragraph-xs font-medium text-primary-base hover:text-primary-dark transition-colors px-1.5 py-0.5 rounded hover:bg-bg-weak-50'
              >
                Select all
              </button>
            )}
          </div>
        </div>

        {/* Search inside filter (if multiple elections) */}
        {elections.length > 4 && (
          <div className='p-2 border-b border-stroke-soft-200'>
            <div className='relative flex items-center rounded-lg bg-bg-weak-50 px-2.5 py-1.5 ring-1 ring-inset ring-stroke-soft-200'>
              <RiSearchLine className='size-3.5 text-text-soft-400 shrink-0' />
              <input
                type='text'
                placeholder='Search elections...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='w-full bg-transparent px-2 text-paragraph-xs text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none'
              />
              {search && (
                <button
                  type='button'
                  onClick={() => setSearch('')}
                  className='text-text-soft-400 hover:text-text-strong-950'
                >
                  <RiCloseLine className='size-3.5' />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Elections list */}
        <div className='max-h-60 overflow-y-auto p-1.5 flex flex-col gap-0.5'>
          {filteredElections.length === 0 ? (
            <div className='py-6 text-center text-paragraph-xs text-text-soft-400'>
              No elections found
            </div>
          ) : (
            filteredElections.map((elec) => {
              const checked = selectedElectionIds.includes(elec.id);

              return (
                <div
                  key={elec.id}
                  onClick={() => handleToggle(elec.id)}
                  className={cn(
                    'group flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2 text-paragraph-sm transition duration-150',
                    checked
                      ? 'bg-primary-lighter/40 text-text-strong-950 font-medium'
                      : 'text-text-strong-950 hover:bg-bg-weak-50',
                  )}
                >
                  <Checkbox.Root
                    checked={checked}
                    onCheckedChange={() => handleToggle(elec.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className='flex flex-1 flex-col min-w-0'>
                    <span className='truncate text-paragraph-sm'>
                      {elec.name}
                    </span>
                    {elec.electionDate && (
                      <span className='text-paragraph-2xs text-text-soft-400'>
                        {new Date(elec.electionDate).toLocaleDateString(
                          undefined,
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          },
                        )}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer status */}
        <div className='flex items-center justify-between border-t border-stroke-soft-200 px-3 py-2 text-paragraph-xs text-text-soft-400 bg-bg-weak-50/30'>
          <span>
            {selectedElectionIds.length === 0 || allSelected
              ? `Showing all (${elections.length})`
              : `${selectedElectionIds.length} of ${elections.length} selected`}
          </span>

          {selectedElectionIds.length > 0 && !allSelected && (
            <button
              type='button'
              onClick={handleClearAll}
              className='text-primary-base hover:text-primary-dark font-medium transition-colors'
            >
              Reset filter
            </button>
          )}
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}
