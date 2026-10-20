// AlignUI Calendar v0.0.0

'use client';

import * as React from 'react';
import { RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react';
import { DayPicker } from 'react-day-picker';

import { cn } from '@/utils/cn';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-1', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-3 sm:space-x-4 sm:space-y-0',
        month: 'space-y-3',
        caption: 'flex justify-between items-center px-1 pt-1 relative',
        caption_label: 'text-label-sm font-semibold text-text-strong-950',
        nav: 'flex items-center gap-1',
        nav_button:
          'flex size-7 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 shadow-regular-xs transition-colors',
        nav_button_previous: '',
        nav_button_next: '',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell:
          'text-text-soft-400 rounded-md w-8 font-medium text-[11px] text-center uppercase tracking-wider',
        row: 'flex w-full mt-1.5',
        cell: 'relative p-0 text-center text-paragraph-sm focus-within:relative focus-within:z-20',
        day: 'size-8 p-0 font-medium rounded-lg text-paragraph-sm text-text-strong-950 hover:bg-bg-weak-50 hover:text-text-strong-950 flex items-center justify-center transition-colors aria-selected:opacity-100',
        day_range_end: 'day-range-end',
        day_selected:
          '!bg-primary-base !text-static-white font-semibold hover:!bg-primary-base hover:!text-static-white shadow-xs',
        day_today: 'font-bold text-primary-base',
        day_outside:
          'day-outside text-text-disabled-300 opacity-50 aria-selected:bg-bg-weak-50/50 aria-selected:text-text-soft-400 aria-selected:opacity-30',
        day_disabled: 'text-text-disabled-300 opacity-40 pointer-events-none',
        day_range_middle:
          'aria-selected:bg-bg-weak-50 aria-selected:text-text-strong-950',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: () => <RiArrowLeftSLine className='size-4' />,
        IconRight: () => <RiArrowRightSLine className='size-4' />,
      }}
      {...props}
    />
  );
}

Calendar.displayName = 'Calendar';

export default Calendar;
