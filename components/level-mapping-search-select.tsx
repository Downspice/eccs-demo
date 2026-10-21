'use client';

import * as React from 'react';
import type { LevelMappingItem } from '@/services/level-mappings';
import {
  RiArrowDownSLine,
  RiCheckLine,
  RiCloseLine,
  RiSearchLine,
} from '@remixicon/react';

import { cn } from '@/utils/cn';
import * as Badge from '@/components/ui/badge';
import * as Popover from '@/components/ui/popover';

export interface LevelMappingSearchSelectProps {
  id?: string;
  value?: string | null;
  onChange: (value: string) => void;
  items: LevelMappingItem[];
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
  allowClear?: boolean;
  clearLabel?: string;
  className?: string;
  searchPlaceholder?: string;
  onBlur?: () => void;
}

export function LevelMappingSearchSelect({
  id,
  value,
  onChange,
  items,
  placeholder = 'Select unit...',
  disabled = false,
  hasError = false,
  allowClear = false,
  clearLabel = 'None',
  className,
  searchPlaceholder = 'Search by name or jurisdiction...',
  onBlur,
}: LevelMappingSearchSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const onBlurRef = React.useRef(onBlur);
  onBlurRef.current = onBlur;
  const wasOpenRef = React.useRef(false);

  // Manage focus and blur on open state changes
  React.useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearch('');
      if (wasOpenRef.current) {
        wasOpenRef.current = false;
        onBlurRef.current?.();
      }
    }
  }, [open]);

  const selectedItem = React.useMemo(() => {
    if (!value) return null;
    return items.find((i) => i.id === value) || null;
  }, [items, value]);

  const filteredItems = React.useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((item) => {
      const matchName = item.name?.toLowerCase().includes(q);
      const matchUpper = item.upperLevelName?.toLowerCase().includes(q);
      const matchTier = item.levelName?.toLowerCase().includes(q);
      return matchName || matchUpper || matchTier;
    });
  }, [items, search]);

  const handleSelect = (itemId: string) => {
    onChange(itemId);
    setOpen(false);
  };

  const displayLabel = React.useMemo(() => {
    if (!selectedItem) {
      return null;
    }
    const parentPart = selectedItem.upperLevelName
      ? ` (${selectedItem.upperLevelName})`
      : '';
    return `${selectedItem.name}${parentPart}`;
  }, [selectedItem]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen} modal={false}>
      <Popover.Trigger asChild>
        <button
          id={id}
          type='button'
          disabled={disabled}
          className={cn(
            'group/trigger flex h-10 w-full items-center justify-between gap-2 rounded-10 bg-bg-white-0 px-3 text-paragraph-sm text-text-strong-950 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 outline-none transition duration-200 ease-out',
            'hover:bg-bg-weak-50 hover:ring-stroke-sub-300',
            'focus:shadow-button-important-focus focus:outline-none focus:ring-stroke-strong-950',
            'data-[state=open]:ring-stroke-strong-950 data-[state=open]:bg-bg-weak-50',
            'disabled:pointer-events-none disabled:bg-bg-weak-50 disabled:text-text-disabled-300 disabled:shadow-none disabled:ring-transparent',
            hasError && 'ring-error-base focus:ring-error-base',
            className,
          )}
          aria-expanded={open}
        >
          <span
            className={cn(
              'truncate text-left flex-1',
              !selectedItem && 'text-text-sub-600',
            )}
          >
            {displayLabel || placeholder}
          </span>

          <div className='flex items-center gap-1.5 shrink-0'>
            {selectedItem?.levelName && (
              <Badge.Root
                variant='lighter'
                color='gray'
                size='small'
                className='hidden sm:inline-flex'
              >
                {selectedItem.levelName}
              </Badge.Root>
            )}
            <RiArrowDownSLine
              className={cn(
                'size-5 text-text-soft-400 transition-transform duration-200 ease-out',
                'group-hover/trigger:text-text-sub-600',
                'group-data-[state=open]/trigger:rotate-180 group-data-[state=open]/trigger:text-text-strong-950',
              )}
            />
          </div>
        </button>
      </Popover.Trigger>

      <Popover.Content
        showArrow={false}
        align='start'
        sideOffset={6}
        className='z-[70] w-[--radix-popover-trigger-width] min-w-[300px] max-w-[500px] overflow-hidden p-0'
      >
        {/* Search header */}
        <div className='flex items-center gap-2 border-b border-stroke-soft-200 bg-bg-weak-50/50 px-3 py-2'>
          <RiSearchLine className='size-4 shrink-0 text-text-soft-400' />
          <input
            ref={searchInputRef}
            type='text'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className='w-full bg-transparent text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none'
          />
          {search && (
            <button
              type='button'
              onClick={() => setSearch('')}
              className='text-text-soft-400 hover:text-text-sub-600'
              title='Clear search'
            >
              <RiCloseLine className='size-4' />
            </button>
          )}
        </div>

        {/* Units list */}
        <div className='max-h-64 overflow-y-auto p-1.5 space-y-0.5'>
          {allowClear && (
            <button
              type='button'
              onClick={() => handleSelect('')}
              className={cn(
                'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-paragraph-sm transition-colors',
                !value
                  ? 'bg-bg-weak-50 font-medium text-text-strong-950'
                  : 'text-text-sub-600 hover:bg-bg-weak-50/70 hover:text-text-strong-950',
              )}
            >
              <span className='italic text-text-soft-400'>{clearLabel}</span>
              {!value && (
                <RiCheckLine className='size-4 text-primary-base shrink-0' />
              )}
            </button>
          )}

          {filteredItems.length === 0 ? (
            <div className='py-6 px-4 text-center text-paragraph-xs text-text-soft-400'>
              No matching units found
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = item.id === value;
              return (
                <button
                  key={item.id}
                  type='button'
                  onClick={() => handleSelect(item.id)}
                  className={cn(
                    'group/item flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-paragraph-sm transition-colors',
                    isSelected
                      ? 'bg-primary-base/10 font-medium text-primary-base'
                      : 'text-text-strong-950 hover:bg-bg-weak-50',
                  )}
                >
                  <div className='flex flex-col min-w-0 pr-2'>
                    <span className='truncate font-medium text-paragraph-sm'>
                      {item.name}
                    </span>
                    {(item.upperLevelName || item.levelName) && (
                      <span className='truncate text-[11px] text-text-soft-400'>
                        {item.levelName ? `${item.levelName}` : ''}
                        {item.levelName && item.upperLevelName ? ' • ' : ''}
                        {item.upperLevelName
                          ? `Parent: ${item.upperLevelName}`
                          : ''}
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <RiCheckLine className='size-4 text-primary-base shrink-0' />
                  )}
                </button>
              );
            })
          )}
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}
