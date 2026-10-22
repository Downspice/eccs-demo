// AlignUI DatePicker v0.0.0

'use client';

import * as React from 'react';
import { RiCalendarLine, RiCloseLine } from '@remixicon/react';
import { format, isValid } from 'date-fns';

import { cn } from '@/utils/cn';
import { Calendar } from '@/components/ui/calendar';
import * as Popover from '@/components/ui/popover';

export interface DatePickerProps {
  value?: string | Date;
  onChange?: (dateString: string, rawDate?: Date) => void;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
  id?: string;
  name?: string;
  className?: string;
  clearable?: boolean;
  modal?: boolean;
  formatDisplay?: (date: Date) => string;
}

function parseDateValue(val?: string | Date): Date | undefined {
  if (!val) return undefined;
  if (val instanceof Date) return isValid(val) ? val : undefined;
  if (typeof val === 'string') {
    const parts = val.trim().split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return isValid(d) ? d : undefined;
    }
    const d = new Date(val);
    return isValid(d) ? d : undefined;
  }
  return undefined;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Select date...',
  disabled = false,
  hasError = false,
  id,
  name,
  className,
  clearable = true,
  modal = true,
  formatDisplay = (d: Date) => format(d, 'MMM dd, yyyy'),
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const selectedDate = React.useMemo(() => parseDateValue(value), [value]);

  const handleSelect = (day?: Date) => {
    if (day) {
      const formatted = format(day, 'yyyy-MM-dd');
      onChange?.(formatted, day);
      setOpen(false);
    } else {
      onChange?.('', undefined);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.('', undefined);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen} modal={modal}>
      <Popover.Trigger asChild>
        <button
          type='button'
          id={id}
          name={name}
          disabled={disabled}
          aria-expanded={open}
          className={cn(
            // base trigger styling matching AlignUI input/select
            'group/trigger flex h-10 w-full min-w-0 items-center gap-2 rounded-10 bg-bg-white-0 px-3 text-left text-paragraph-sm shadow-regular-xs outline-none transition duration-200 ease-out',
            // ring & border
            'ring-1 ring-inset ring-stroke-soft-200',
            // hover
            'hover:bg-bg-weak-50 hover:ring-stroke-soft-200',
            // focus
            'focus:shadow-button-important-focus focus:outline-none focus:ring-stroke-strong-950',
            // open
            open && 'ring-stroke-strong-950 shadow-button-important-focus',
            // error state
            hasError && [
              'ring-error-base',
              'hover:ring-error-base',
              'focus:shadow-button-error-focus focus:ring-error-base',
              open && 'ring-error-base shadow-button-error-focus',
            ],
            // disabled
            disabled &&
              'pointer-events-none bg-bg-weak-50 text-text-disabled-300 shadow-none ring-transparent',
            className,
          )}
        >
          <RiCalendarLine
            className={cn(
              'size-5 shrink-0 text-text-sub-600 transition duration-200 ease-out',
              !selectedDate && 'text-text-soft-400',
              disabled && 'text-text-disabled-300',
            )}
          />

          <span
            className={cn(
              'flex-1 truncate',
              selectedDate
                ? 'text-text-strong-950'
                : 'text-text-soft-400 group-hover/trigger:text-text-sub-600',
              disabled && 'text-text-disabled-300',
            )}
          >
            {selectedDate ? formatDisplay(selectedDate) : placeholder}
          </span>

          {clearable && selectedDate && !disabled && (
            <span
              aria-label='Clear date'
              onClick={handleClear}
              className='size-5 rounded p-0.5 text-text-soft-400 hover:bg-bg-weak-100 hover:text-text-sub-600 transition-colors cursor-pointer'
            >
              <RiCloseLine className='size-4' />
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Content
        align='start'
        sideOffset={6}
        showArrow={false}
        className='z-[70] p-3 rounded-2xl bg-bg-white-0 shadow-regular-md ring-1 ring-inset ring-stroke-soft-200'
        onOpenAutoFocus={(e) => {
          // Prevent Safari from stealing focus or closing immediately when nested in Dialog
          e.preventDefault();
        }}
      >
        <Calendar
          mode='single'
          selected={selectedDate}
          onSelect={handleSelect}
        />
      </Popover.Content>
    </Popover.Root>
  );
}

DatePicker.displayName = 'DatePicker';

export default DatePicker;
