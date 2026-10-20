'use client';

import * as React from 'react';
import { RiBarChartBoxLine, RiTrophyLine } from '@remixicon/react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { cn } from '@/utils/cn';
import * as Badge from '@/components/ui/badge';
import * as ProgressBar from '@/components/ui/progress-bar';
import { Skeleton } from '@/components/ui/skeleton';

export type LeaderboardChartResult = {
  candidateId: string;
  candidateName: string;
  total: number;
  percentage: number;
};

const LEADER_FILL = 'hsl(var(--primary-base))';
const BAR_FILL = 'hsl(var(--neutral-300))';

function truncateName(name: string, max = 13) {
  if (name.length <= max) return name;
  return `${name.slice(0, max - 1)}…`;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload?: {
      fullName: string;
      votes: number;
      percentage: number;
      isLeader: boolean;
    };
  }>;
}) {
  if (!active || !payload?.[0]?.payload) return null;
  const { fullName, votes, percentage, isLeader } = payload[0].payload;

  return (
    <div className='rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3.5 py-2.5 shadow-regular-md'>
      <div className='flex items-center gap-1.5'>
        <p className='text-label-xs font-bold text-text-strong-950'>
          {fullName}
        </p>
        {isLeader && (
          <Badge.Root variant='lighter' color='green' size='small'>
            Leader
          </Badge.Root>
        )}
      </div>
      <p className='mt-1 text-paragraph-xs font-medium text-text-sub-600'>
        <span className='font-bold text-primary-base'>
          {votes.toLocaleString()}
        </span>{' '}
        votes · {percentage}%
      </p>
    </div>
  );
}

export function CandidateLeaderboardBarChart({
  results,
  isLoading,
  className,
}: {
  results: LeaderboardChartResult[];
  isLoading?: boolean;
  className?: string;
}) {
  const chartData = React.useMemo(
    () =>
      results.slice(0, 8).map((row, idx) => ({
        name: truncateName(row.candidateName),
        fullName: row.candidateName,
        votes: row.total,
        percentage: row.percentage,
        isLeader: idx === 0 && row.total > 0,
      })),
    [results],
  );

  const totalVotesCounted = React.useMemo(() => {
    return results.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
  }, [results]);

  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-regular-xs',
        className,
      )}
    >
      {/* Header */}
      <div className='mb-4 flex items-center justify-between border-b border-stroke-soft-200 pb-3'>
        <div>
          <div className='flex items-center gap-2'>
            <div className='flex size-7 items-center justify-center rounded-lg bg-primary-base/10 text-primary-base'>
              <RiBarChartBoxLine className='size-4' />
            </div>
            <h3 className='text-label-md font-bold text-text-strong-950'>
              Candidate Leaderboard
            </h3>
          </div>
          <p className='mt-0.5 text-paragraph-xs text-text-sub-600'>
            Vertical vote share distribution
          </p>
        </div>

        {totalVotesCounted > 0 && (
          <Badge.Root variant='lighter' color='blue' size='small'>
            <span>{totalVotesCounted.toLocaleString()} counted</span>
          </Badge.Root>
        )}
      </div>

      {/* Main Vertical Bar Chart Area */}
      {isLoading ? (
        <div className='space-y-3 py-6'>
          <Skeleton className='h-64 w-full rounded-xl' />
          <Skeleton className='h-24 w-full rounded-xl' />
        </div>
      ) : chartData.length === 0 ? (
        <div className='flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-stroke-soft-200 px-4 py-16 text-center'>
          <div className='flex size-11 items-center justify-center rounded-xl bg-bg-weak-50 text-text-sub-600'>
            <RiBarChartBoxLine className='size-5' />
          </div>
          <p className='mt-3 text-label-xs font-semibold text-text-strong-950'>
            No votes recorded yet
          </p>
          <p className='mt-1 max-w-xs text-paragraph-xs text-text-sub-600'>
            Vertical chart updates dynamically as polling station sheets are
            collated.
          </p>
        </div>
      ) : (
        <div className='flex flex-col flex-1'>
          {/* Vertical Recharts Bar Chart */}
          <div className='h-[280px] w-full pt-2'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                data={chartData}
                margin={{ top: 16, right: 8, left: -16, bottom: 24 }}
              >
                <CartesianGrid
                  vertical={false}
                  horizontal={true}
                  stroke='hsl(var(--stroke-soft-200))'
                  strokeDasharray='3 3'
                />
                <XAxis
                  dataKey='name'
                  type='category'
                  tick={{ fontSize: 11, fill: 'hsl(var(--text-sub-600))' }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />
                <YAxis
                  type='number'
                  width={42}
                  tick={{ fontSize: 11, fill: 'hsl(var(--text-soft-400))' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toLocaleString()
                  }
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--primary-alpha-10))' }}
                  content={<ChartTooltip />}
                />
                <Bar dataKey='votes' radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.fullName}
                      fill={entry.isLeader ? LEADER_FILL : BAR_FILL}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Candidate Ranking List */}
          <div className='mt-4 border-t border-stroke-soft-200 pt-4'>
            <div className='mb-2 flex items-center justify-between text-paragraph-xs font-bold text-text-sub-600 uppercase tracking-wider'>
              <span>Candidate Slate</span>
              <span>Vote Share</span>
            </div>

            <div className='space-y-2.5'>
              {results.slice(0, 6).map((r, idx) => {
                const isLeader = idx === 0 && r.total > 0;
                return (
                  <div
                    key={r.candidateId}
                    className={cn(
                      'rounded-xl border p-2.5 transition-all',
                      isLeader
                        ? 'border-primary-base/30 bg-primary-base/[0.03] ring-1 ring-primary-base/15'
                        : 'border-stroke-soft-200 bg-bg-white-0',
                    )}
                  >
                    <div className='flex items-center justify-between gap-2'>
                      <div className='flex items-center gap-2 min-w-0'>
                        <span
                          className={cn(
                            'flex size-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold',
                            isLeader
                              ? 'bg-primary-base text-static-white'
                              : 'bg-bg-weak-50 text-text-sub-600',
                          )}
                        >
                          #{idx + 1}
                        </span>
                        <span
                          className='truncate text-paragraph-xs font-semibold text-text-strong-950'
                          title={r.candidateName}
                        >
                          {r.candidateName}
                        </span>
                      </div>

                      <div className='text-right shrink-0'>
                        <span className='text-paragraph-xs font-bold text-text-strong-950'>
                          {r.percentage}%
                        </span>
                        <span className='ml-1 text-[11px] text-text-soft-400'>
                          ({r.total.toLocaleString()})
                        </span>
                      </div>
                    </div>

                    <div className='mt-1.5'>
                      <ProgressBar.Root
                        value={r.percentage}
                        color={isLeader ? 'blue' : 'green'}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CandidateLeaderboardBarChart;
