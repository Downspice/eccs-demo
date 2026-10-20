'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGetElections, type ElectionItem } from '@/services/elections';
import {
  RiArrowRightLine,
  RiBarChartBoxLine,
  RiCalendarLine,
  RiCloseLine,
  RiEqualizerLine,
  RiGovernmentLine,
  RiGroupLine,
  RiSearchLine,
  RiTimeLine,
} from '@remixicon/react';

import { cn } from '@/utils/cn';
import * as Badge from '@/components/ui/badge';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export default function ElectionCollationOverviewPage() {
  const router = useRouter();
  const { data: rawElections, isLoading } = useGetElections();

  const elections = React.useMemo<ElectionItem[]>(() => {
    if (Array.isArray(rawElections)) return rawElections;
    if (
      rawElections &&
      typeof rawElections === 'object' &&
      Array.isArray((rawElections as { data?: ElectionItem[] }).data)
    ) {
      return (rawElections as { data: ElectionItem[] }).data;
    }
    return [];
  }, [rawElections]);

  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredElections = React.useMemo(() => {
    if (!searchQuery.trim()) return elections;
    const q = searchQuery.toLowerCase();
    return elections.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        (e.electionDate && e.electionDate.toLowerCase().includes(q)),
    );
  }, [elections, searchQuery]);

  const totalRegisteredVoters = React.useMemo(() => {
    return elections.reduce(
      (acc, curr) => acc + (Number(curr.expectedTurnout) || 0),
      0,
    );
  }, [elections]);

  return (
    <div className='flex min-h-0 w-full flex-1 flex-col overflow-hidden'>
      {/* Page Heading Header */}
      <header className='w-full shrink-0 border-b border-stroke-soft-200 bg-bg-white-0 px-4 py-5 lg:px-8'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex flex-col gap-1'>
            <div className='flex items-center gap-2.5'>
              <div className='flex size-8 items-center justify-center rounded-lg bg-primary-base text-static-white shadow-xs'>
                <RiBarChartBoxLine className='size-4' />
              </div>
              <h1 className='text-title-h5 font-semibold text-text-strong-950 sm:text-title-h4'>
                Election Collation
              </h1>

              {/* Status Indicator */}
              <div className='ml-2 flex items-center gap-1.5 rounded-full border border-stroke-soft-200 bg-bg-weak-50 px-2.5 py-0.5 text-[11px] font-semibold text-text-sub-600'>
                <span className='relative flex size-2'>
                  <span className='absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75' />
                  <span className='relative inline-flex size-2 rounded-full bg-emerald-500' />
                </span>
                <span>Active Center</span>
              </div>
            </div>
            <p className='text-paragraph-sm text-text-sub-600'>
              Select an election cycle below to enter its live collation command
              center, view certified returns, and audit polling manifests.
            </p>
          </div>

          <div className='flex items-center gap-2.5'>
            <Link href='/setups?module=elections'>
              <Button.Root variant='neutral' mode='stroke' size='small'>
                <Button.Icon as={RiEqualizerLine} />
                <span>Manage Elections in Setups</span>
              </Button.Root>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className='flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 lg:px-8 space-y-6'>
        {/* Top Summary KPI Cards */}
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
          {/* Total Registered Elections */}
          <div className='rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-regular-xs'>
            <div className='flex items-center justify-between'>
              <span className='text-paragraph-xs font-semibold uppercase tracking-wider text-text-soft-400'>
                Elections in System
              </span>
              <div className='flex size-7 items-center justify-center rounded-lg bg-primary-base/10 text-primary-base'>
                <RiGovernmentLine className='size-4' />
              </div>
            </div>
            <div className='mt-2 flex items-baseline gap-2'>
              <span className='text-title-h4 font-bold text-text-strong-950'>
                {elections.length}
              </span>
              <span className='text-paragraph-xs text-text-soft-400'>
                cycles
              </span>
            </div>
          </div>

          {/* Total Expected Turnout across elections */}
          <div className='rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-regular-xs'>
            <div className='flex items-center justify-between'>
              <span className='text-paragraph-xs font-semibold uppercase tracking-wider text-text-soft-400'>
                Total Expected Voters
              </span>
              <div className='flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600'>
                <RiGroupLine className='size-4' />
              </div>
            </div>
            <div className='mt-2 flex items-baseline gap-2'>
              <span className='text-title-h4 font-bold text-text-strong-950'>
                {totalRegisteredVoters.toLocaleString()}
              </span>
              <span className='text-paragraph-xs text-text-soft-400'>
                voters
              </span>
            </div>
          </div>

          {/* Collation Readiness */}
          <div className='rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-regular-xs'>
            <div className='flex items-center justify-between'>
              <span className='text-paragraph-xs font-semibold uppercase tracking-wider text-text-soft-400'>
                Collation Readiness
              </span>
              <div className='flex size-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600'>
                <RiTimeLine className='size-4' />
              </div>
            </div>
            <div className='mt-2 flex items-baseline gap-2'>
              <span className='text-title-h4 font-bold text-text-strong-950'>
                100%
              </span>
              <span className='text-paragraph-xs text-text-soft-400'>
                active
              </span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-stroke-soft-200 pb-3'>
          <h2 className='text-label-md font-bold text-text-strong-950'>
            Available Election Cycles ({filteredElections.length})
          </h2>

          <div className='w-full sm:max-w-xs'>
            <Input.Root>
              <Input.Wrapper>
                <Input.Icon as={RiSearchLine} />
                <input
                  type='text'
                  placeholder='Search elections by name or date...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full bg-transparent px-2.5 py-1.5 text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none'
                />
                {searchQuery && (
                  <button
                    type='button'
                    onClick={() => setSearchQuery('')}
                    className='px-2 text-text-soft-400 hover:text-text-sub-600'
                  >
                    <RiCloseLine className='size-4' />
                  </button>
                )}
              </Input.Wrapper>
            </Input.Root>
          </div>
        </div>

        {/* Election Cards Grid */}
        {isLoading ? (
          <div className='grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton
                key={`elec-card-skel-${idx}`}
                className='h-52 w-full rounded-2xl'
              />
            ))}
          </div>
        ) : filteredElections.length === 0 ? (
          <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-stroke-soft-200 py-16 text-center'>
            <div className='flex size-14 items-center justify-center rounded-2xl bg-bg-weak-50 text-text-sub-600'>
              <RiGovernmentLine className='size-7' />
            </div>
            <h3 className='mt-3 text-label-md font-bold text-text-strong-950'>
              No elections found
            </h3>
            <p className='mt-1 max-w-sm text-paragraph-xs text-text-sub-600'>
              {searchQuery
                ? `No election cycles matching "${searchQuery}". Try a different keyword.`
                : 'No elections have been registered in the system yet.'}
            </p>
            <div className='mt-5'>
              <Link href='/setups?module=elections'>
                <Button.Root variant='primary' mode='filled' size='small'>
                  <span>Register Election</span>
                </Button.Root>
              </Link>
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3'>
            {filteredElections.map((election) => (
              <Link
                key={election.id}
                href={`/election-collation/${election.id}`}
                className='group relative flex flex-col justify-between rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-regular-xs hover:border-primary-base hover:shadow-regular-sm transition-all duration-200 cursor-pointer'
              >
                <div>
                  {/* Card Header: Icon & Badges */}
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-base/10 text-primary-base group-hover:bg-primary-base group-hover:text-static-white transition-colors duration-200'>
                      <RiGovernmentLine className='size-5.5' />
                    </div>

                    <Badge.Root variant='lighter' color='blue' size='small'>
                      <span>Collation Ready</span>
                    </Badge.Root>
                  </div>

                  {/* Title & Date */}
                  <div className='mt-4'>
                    <h3 className='text-label-md font-bold text-text-strong-950 group-hover:text-primary-base transition-colors line-clamp-1'>
                      {election.name}
                    </h3>
                    <div className='mt-1.5 flex items-center gap-1.5 text-paragraph-xs text-text-sub-600'>
                      <RiCalendarLine className='size-3.5 text-text-soft-400 shrink-0' />
                      <span>
                        {election.electionDate || 'Scheduled date unassigned'}
                      </span>
                    </div>
                  </div>

                  {/* Metrics Badge row */}
                  <div className='mt-4 flex flex-wrap items-center gap-2 border-t border-stroke-soft-200/60 pt-3'>
                    <div className='flex items-center gap-1.5 rounded-lg bg-bg-weak-50 px-2.5 py-1 text-[11px] font-semibold text-text-sub-600'>
                      <RiGroupLine className='size-3 text-text-soft-400' />
                      <span>
                        {election.expectedTurnout != null
                          ? `${Number(election.expectedTurnout).toLocaleString()} voters`
                          : 'Turnout pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className='mt-5 flex items-center justify-between border-t border-stroke-soft-200/60 pt-3 text-paragraph-xs font-semibold text-primary-base'>
                  <span>Enter Collation Center</span>
                  <RiArrowRightLine className='size-4 group-hover:translate-x-1 transition-transform duration-200' />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
