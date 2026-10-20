'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGetCandidates, type CandidateItem } from '@/services/candidates';
import {
  useGetElectionCandidateResults,
  type ElectionCollationSummaryData,
} from '@/services/election-collations';
import { useGetElections, type ElectionItem } from '@/services/elections';
import {
  useGetLevelMappings,
  type LevelMappingGroup,
  type LevelMappingItem,
} from '@/services/level-mappings';
import {
  RiAddLine,
  RiArrowLeftLine,
  RiBarChartBoxLine,
  RiCalendarLine,
  RiCheckDoubleLine,
  RiCloseLine,
  RiEyeLine,
  RiFileChartLine,
  RiGovernmentLine,
  RiGroupLine,
  RiInboxArchiveLine,
  RiPrinterLine,
  RiRefreshLine,
  RiSearchLine,
  RiTimeLine,
  RiTrophyLine,
  RiUser3Line,
} from '@remixicon/react';

import { cn } from '@/utils/cn';
import * as Badge from '@/components/ui/badge';
import * as Button from '@/components/ui/button';
import * as CompactButton from '@/components/ui/compact-button';
import * as Input from '@/components/ui/input';
import * as ProgressBar from '@/components/ui/progress-bar';
import * as Select from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import * as Switch from '@/components/ui/switch';
import * as Table from '@/components/ui/table';

import { RecordCollationModal } from '../record-collation-modal';
import { ViewStationCollationModal } from '../view-station-collation';

interface ElectionCollationDetailPageProps {
  params: {
    electionId: string;
  };
}

export default function ElectionCollationDetailPage({
  params,
}: ElectionCollationDetailPageProps) {
  const router = useRouter();
  const electionId = params.electionId;

  // 1. Elections data
  const { data: rawElections, isLoading: isElectionsLoading } =
    useGetElections();

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

  const activeElection = elections.find((e) => e.id === electionId);

  // 2. Collation Mode: Verified Only vs Full Stream
  const [verifiedOnly, setVerifiedOnly] = React.useState<boolean>(false);

  // 3. Live Collation API Data for Candidates & Summary
  const {
    data: collationSummary,
    isLoading: isCollationLoading,
    refetch: refetchCollation,
    isFetching: isCollationFetching,
  } = useGetElectionCandidateResults(electionId, verifiedOnly);

  // 4. Auxiliary Data (Candidates & Level Mappings)
  const { data: rawCandidates, isLoading: isCandidatesLoading } =
    useGetCandidates(electionId);
  const { data: rawLevelMappings, isLoading: isMappingsLoading } =
    useGetLevelMappings(electionId);

  const candidates = React.useMemo<CandidateItem[]>(() => {
    if (Array.isArray(rawCandidates)) return rawCandidates;
    if (
      rawCandidates &&
      typeof rawCandidates === 'object' &&
      Array.isArray((rawCandidates as { data?: CandidateItem[] }).data)
    ) {
      return (rawCandidates as { data: CandidateItem[] }).data;
    }
    return [];
  }, [rawCandidates]);

  const pollingStations = React.useMemo<LevelMappingItem[]>(() => {
    if (!rawLevelMappings || !Array.isArray(rawLevelMappings)) return [];
    return rawLevelMappings.flatMap((group: LevelMappingGroup) =>
      (group.mappings || []).map((m: LevelMappingItem) => ({
        ...m,
        levelId: m.levelId || group.levelId,
        levelName: m.levelName || group.levelName,
        electionId: m.electionId || electionId,
      })),
    );
  }, [rawLevelMappings, electionId]);

  // Modals & Inspection State
  const [recordModalOpen, setRecordModalOpen] = React.useState(false);
  const [selectedStationForRecord, setSelectedStationForRecord] =
    React.useState<string | undefined>(undefined);
  const [inspectStation, setInspectStation] =
    React.useState<LevelMappingItem | null>(null);

  // Navigation tab within collation
  const [activeTab, setActiveTab] = React.useState<
    'standings' | 'stations' | 'audit'
  >('standings');
  const [stationSearch, setStationSearch] = React.useState('');

  // Key Aggregates from Collation Controller API
  const totalValidVotes = collationSummary?.totalValidVotes ?? 0;
  const totalSpoiltBallots = collationSummary?.totalSpoiltBallots ?? 0;
  const totalVotesCast = collationSummary?.totalVotesCast ?? 0;
  const sheetsCounted = collationSummary?.sheetsCounted ?? 0;
  const totalExpectedTurnout = activeElection?.expectedTurnout || 100;

  // Turnout Percentage
  const turnoutPercentage =
    totalExpectedTurnout > 0
      ? Math.min(100, Math.round((totalVotesCast / totalExpectedTurnout) * 100))
      : 0;

  // Candidate Results from Controller (or fallbacks)
  const results = React.useMemo(() => {
    if (collationSummary?.results && collationSummary.results.length > 0) {
      return [...collationSummary.results].sort((a, b) => b.total - a.total);
    }
    return candidates.map((c) => ({
      candidateId: c.id,
      candidateName: c.name,
      total: 0,
      percentage: 0,
    }));
  }, [collationSummary?.results, candidates]);

  const leader = results[0];
  const runnerUp = results[1];
  const leadMargin =
    leader && runnerUp && leader.total > 0
      ? leader.total - runnerUp.total
      : (leader?.total ?? 0);

  // Filtered Polling Stations
  const filteredStations = React.useMemo(() => {
    if (!stationSearch.trim()) return pollingStations;
    const q = stationSearch.toLowerCase();
    return pollingStations.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.levelName?.toLowerCase().includes(q) ||
        s.upperLevelName?.toLowerCase().includes(q),
    );
  }, [pollingStations, stationSearch]);

  const handleOpenRecordModal = (stationId?: string) => {
    setSelectedStationForRecord(stationId);
    setRecordModalOpen(true);
  };

  return (
    <div className='flex min-h-0 w-full flex-1 flex-col overflow-hidden'>
      {/* Page Header with Back Link & Title */}
      <header className='w-full shrink-0 border-b border-stroke-soft-200 bg-bg-white-0 px-4 py-5 lg:px-8'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex flex-col gap-1'>
            {/* Back to all elections button */}
            <div className='flex items-center gap-2'>
              <Link
                href='/election-collation'
                className='inline-flex items-center gap-1.5 text-paragraph-xs font-semibold text-text-sub-600 hover:text-text-strong-950 transition-colors'
              >
                <RiArrowLeftLine className='size-3.5' />
                <span>All Elections</span>
              </Link>
              <span className='text-text-disabled-300'>/</span>
              <span className='text-paragraph-xs font-medium text-text-soft-400'>
                Collation Center
              </span>
            </div>

            <div className='mt-1 flex items-center gap-2.5'>
              <div className='flex size-8 items-center justify-center rounded-lg bg-primary-base text-static-white shadow-xs'>
                <RiBarChartBoxLine className='size-4' />
              </div>
              <h1 className='text-title-h5 font-semibold text-text-strong-950 sm:text-title-h4'>
                {activeElection?.name || 'Election Collation'}
              </h1>

              {/* Live Streaming Badge */}
              <div className='ml-2 flex items-center gap-1.5 rounded-full border border-stroke-soft-200 bg-bg-weak-50 px-2.5 py-0.5 text-[11px] font-semibold text-text-sub-600'>
                <span className='relative flex size-2'>
                  <span className='absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75' />
                  <span className='relative inline-flex size-2 rounded-full bg-emerald-500' />
                </span>
                <span>Live Feed</span>
              </div>
            </div>

            <p className='text-paragraph-sm text-text-sub-600'>
              Real-time aggregation, certified manifest verification, and
              territorial result audits.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className='flex flex-wrap items-center gap-3'>
            {/* Quick Switch Election Dropdown */}
            {elections.length > 1 && (
              <div className='w-56'>
                <Select.Root
                  value={electionId}
                  onValueChange={(val) =>
                    router.push(`/election-collation/${val}`)
                  }
                  disabled={isElectionsLoading}
                >
                  <Select.Trigger className='w-full'>
                    <Select.Value placeholder='Switch election...' />
                  </Select.Trigger>
                  <Select.Content position='popper'>
                    {elections.map((elec) => (
                      <Select.Item key={elec.id} value={elec.id}>
                        {elec.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </div>
            )}

            {/* Refresh live stream */}
            <CompactButton.Root
              type='button'
              variant='stroke'
              className='size-9 rounded-10'
              onClick={() => refetchCollation()}
              title='Refresh live collation'
            >
              <CompactButton.Icon
                as={RiRefreshLine}
                className={cn('size-4', isCollationFetching && 'animate-spin')}
              />
            </CompactButton.Root>

            {/* Record New Station Result Button */}
            <Button.Root
              variant='primary'
              mode='filled'
              size='small'
              onClick={() => handleOpenRecordModal()}
            >
              <Button.Icon as={RiAddLine} />
              <span>Record Results Sheet</span>
            </Button.Root>
          </div>
        </div>
      </header>

      {/* Main Collation View Canvas */}
      <div className='flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 lg:px-8 space-y-6'>
        {/* Race Leader Spotlight Banner */}
        {leader && leader.total > 0 && (
          <div className='relative overflow-hidden rounded-2xl border border-primary-base/30 bg-gradient-to-r from-primary-base/[0.07] via-bg-white-0 to-primary-base/[0.04] p-5 shadow-regular-xs'>
            <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
              <div className='flex items-center gap-4'>
                <div className='flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary-base text-static-white shadow-regular-xs ring-4 ring-primary-base/20'>
                  <RiTrophyLine className='size-7' />
                </div>
                <div>
                  <div className='flex items-center gap-2'>
                    <Badge.Root variant='lighter' color='blue' size='small'>
                      Current Race Leader
                    </Badge.Root>
                    {leadMargin > 0 && runnerUp && (
                      <span className='text-[11px] font-semibold text-emerald-600'>
                        +{leadMargin.toLocaleString()} votes lead
                      </span>
                    )}
                  </div>
                  <h2 className='mt-1 text-title-h4 font-bold text-text-strong-950'>
                    {leader.candidateName}
                  </h2>
                  <p className='text-paragraph-xs text-text-sub-600'>
                    Holding {leader.percentage}% of the total valid votes
                    counted across {sheetsCounted} reporting station
                    {sheetsCounted === 1 ? '' : 's'}.
                  </p>
                </div>
              </div>

              {/* Progress and Vote Margin */}
              <div className='flex flex-col items-end gap-1.5 min-w-[200px]'>
                <div className='flex items-baseline gap-2'>
                  <span className='text-title-h3 font-extrabold text-primary-base'>
                    {leader.percentage}%
                  </span>
                  <span className='text-paragraph-sm font-semibold text-text-sub-600'>
                    ({leader.total.toLocaleString()} votes)
                  </span>
                </div>
                <div className='w-full'>
                  <ProgressBar.Root value={leader.percentage} color='blue' />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live Collation Control Strip & Verified Only Toggle */}
        <div className='flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-4 py-3 shadow-regular-xs'>
          <div className='flex items-center gap-3'>
            <span className='text-paragraph-xs font-semibold text-text-strong-950 uppercase tracking-wider'>
              Collation Scope
            </span>
            <div className='flex items-center gap-2 border-l border-stroke-soft-200 pl-3'>
              <Switch.Root
                checked={verifiedOnly}
                onCheckedChange={setVerifiedOnly}
                id='verifiedOnlySwitch'
              />
              <label
                htmlFor='verifiedOnlySwitch'
                className='cursor-pointer text-paragraph-sm font-medium text-text-strong-950 select-none'
              >
                Verified Results Only
              </label>
              {verifiedOnly ? (
                <Badge.Root variant='lighter' color='green' size='small'>
                  <RiCheckDoubleLine className='size-3 shrink-0' />
                  <span>Audit Certified</span>
                </Badge.Root>
              ) : (
                <Badge.Root variant='lighter' color='gray' size='small'>
                  <span>All Transmissions</span>
                </Badge.Root>
              )}
            </div>
          </div>

          <div className='flex items-center gap-4 text-paragraph-xs text-text-sub-600'>
            <span>
              Sheets Counted:{' '}
              <strong className='text-text-strong-950'>{sheetsCounted}</strong>
            </span>
            <span>•</span>
            <span>
              Registered Expected:{' '}
              <strong className='text-text-strong-950'>
                {totalExpectedTurnout.toLocaleString()}
              </strong>
            </span>
          </div>
        </div>

        {/* Primary KPI Metrics Grid */}
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {/* 1: Total Valid Votes */}
          <div className='rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-regular-xs'>
            <div className='flex items-center justify-between'>
              <span className='text-paragraph-xs font-semibold uppercase tracking-wider text-text-soft-400'>
                Total Valid Votes
              </span>
              <div className='flex size-7 items-center justify-center rounded-lg bg-primary-base/10 text-primary-base'>
                <RiCheckDoubleLine className='size-4' />
              </div>
            </div>
            <div className='mt-2 flex items-baseline gap-2'>
              <span className='text-title-h4 font-bold text-text-strong-950'>
                {totalValidVotes.toLocaleString()}
              </span>
              <span className='text-paragraph-xs text-text-soft-400'>
                ballots
              </span>
            </div>
            <div className='mt-3 flex items-center gap-1.5 text-[11px] text-text-sub-600'>
              <span className='inline-block size-1.5 rounded-full bg-emerald-500' />
              <span>Certified under manifest standards</span>
            </div>
          </div>

          {/* 2: Spoilt Ballots */}
          <div className='rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-regular-xs'>
            <div className='flex items-center justify-between'>
              <span className='text-paragraph-xs font-semibold uppercase tracking-wider text-text-soft-400'>
                Rejected / Spoilt
              </span>
              <div className='flex size-7 items-center justify-center rounded-lg bg-error-base/10 text-error-base'>
                <RiInboxArchiveLine className='size-4' />
              </div>
            </div>
            <div className='mt-2 flex items-baseline gap-2'>
              <span className='text-title-h4 font-bold text-text-strong-950'>
                {totalSpoiltBallots.toLocaleString()}
              </span>
              <span className='text-paragraph-xs text-text-soft-400'>
                spoilt
              </span>
            </div>
            <div className='mt-3 flex items-center gap-1.5 text-[11px] text-text-sub-600'>
              <span>
                {totalVotesCast > 0
                  ? ((totalSpoiltBallots / totalVotesCast) * 100).toFixed(1)
                  : 0}
                % rejection rate
              </span>
            </div>
          </div>

          {/* 3: Total Votes Cast */}
          <div className='rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-regular-xs'>
            <div className='flex items-center justify-between'>
              <span className='text-paragraph-xs font-semibold uppercase tracking-wider text-text-soft-400'>
                Total Ballots Cast
              </span>
              <div className='flex size-7 items-center justify-center rounded-lg bg-bg-weak-50 text-text-sub-600'>
                <RiBarChartBoxLine className='size-4' />
              </div>
            </div>
            <div className='mt-2 flex items-baseline gap-2'>
              <span className='text-title-h4 font-bold text-text-strong-950'>
                {totalVotesCast.toLocaleString()}
              </span>
              <span className='text-paragraph-xs text-text-soft-400'>
                cast in total
              </span>
            </div>
            <div className='mt-3'>
              <ProgressBar.Root value={turnoutPercentage} color='blue' />
            </div>
          </div>

          {/* 4: Turnout Percentage */}
          <div className='rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-regular-xs'>
            <div className='flex items-center justify-between'>
              <span className='text-paragraph-xs font-semibold uppercase tracking-wider text-text-soft-400'>
                Voter Turnout Rate
              </span>
              <div className='flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600'>
                <RiGroupLine className='size-4' />
              </div>
            </div>
            <div className='mt-2 flex items-baseline gap-2'>
              <span className='text-title-h4 font-bold text-text-strong-950'>
                {turnoutPercentage}%
              </span>
              <span className='text-paragraph-xs text-text-soft-400'>
                of expected {totalExpectedTurnout.toLocaleString()}
              </span>
            </div>
            <div className='mt-3 flex items-center gap-1.5 text-[11px] text-text-sub-600'>
              <span>Calculated against electoral register</span>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs & Controls Bar */}
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-stroke-soft-200 pb-3'>
          <div className='flex items-center gap-1 rounded-10 bg-bg-weak-50 p-1 border border-stroke-soft-200'>
            <button
              type='button'
              onClick={() => setActiveTab('standings')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-paragraph-xs font-medium rounded-md transition-colors',
                activeTab === 'standings'
                  ? 'bg-bg-white-0 text-text-strong-950 shadow-toggle-switch'
                  : 'text-text-sub-600 hover:text-text-strong-950',
              )}
            >
              <RiBarChartBoxLine className='size-3.5' />
              <span>Candidate Leaderboard</span>
            </button>

            <button
              type='button'
              onClick={() => setActiveTab('stations')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-paragraph-xs font-medium rounded-md transition-colors',
                activeTab === 'stations'
                  ? 'bg-bg-white-0 text-text-strong-950 shadow-toggle-switch'
                  : 'text-text-sub-600 hover:text-text-strong-950',
              )}
            >
              <RiGovernmentLine className='size-3.5' />
              <span>
                Stations Collation Registry ({pollingStations.length})
              </span>
            </button>

            <button
              type='button'
              onClick={() => setActiveTab('audit')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-paragraph-xs font-medium rounded-md transition-colors',
                activeTab === 'audit'
                  ? 'bg-bg-white-0 text-text-strong-950 shadow-toggle-switch'
                  : 'text-text-sub-600 hover:text-text-strong-950',
              )}
            >
              <RiFileChartLine className='size-3.5' />
              <span>Audit Certificate</span>
            </button>
          </div>

          {/* Search bar for stations */}
          <div className='w-full sm:max-w-xs'>
            <Input.Root>
              <Input.Wrapper>
                <Input.Icon as={RiSearchLine} />
                <input
                  type='text'
                  placeholder='Search polling stations...'
                  value={stationSearch}
                  onChange={(e) => setStationSearch(e.target.value)}
                  className='w-full bg-transparent px-2.5 py-1.5 text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none'
                />
                {stationSearch && (
                  <button
                    type='button'
                    onClick={() => setStationSearch('')}
                    className='px-2 text-text-soft-400 hover:text-text-sub-600'
                  >
                    <RiCloseLine className='size-4' />
                  </button>
                )}
              </Input.Wrapper>
            </Input.Root>
          </div>
        </div>

        {/* Tab 1: Candidate Leaderboard Standings */}
        {activeTab === 'standings' && (
          <div className='flex flex-col gap-4'>
            {isCollationLoading ? (
              <div className='space-y-3'>
                {Array.from({ length: 2 }).map((_, idx) => (
                  <Skeleton
                    key={`cand-skel-${idx}`}
                    className='h-24 w-full rounded-2xl'
                  />
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-stroke-soft-200 py-16 text-center'>
                <div className='flex size-12 items-center justify-center rounded-2xl bg-bg-weak-50 text-text-sub-600'>
                  <RiUser3Line className='size-6' />
                </div>
                <h4 className='mt-3 text-label-sm font-semibold text-text-strong-950'>
                  No candidate collation returns yet
                </h4>
                <p className='mt-1 text-paragraph-xs text-text-sub-600'>
                  Record the first station result to generate the collation
                  leaderboard.
                </p>
                <div className='mt-4'>
                  <Button.Root
                    variant='primary'
                    mode='filled'
                    size='small'
                    onClick={() => handleOpenRecordModal()}
                  >
                    <Button.Icon as={RiAddLine} />
                    <span>Record Station Result</span>
                  </Button.Root>
                </div>
              </div>
            ) : (
              <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                {results.map((res, idx) => {
                  const isLeader = idx === 0 && res.total > 0;
                  return (
                    <div
                      key={res.candidateId}
                      className={cn(
                        'group relative flex flex-col justify-between gap-4 rounded-2xl border bg-bg-white-0 p-5 shadow-regular-xs transition-all duration-200 hover:shadow-regular-sm',
                        isLeader
                          ? 'border-primary-base/40 ring-1 ring-primary-base/20'
                          : 'border-stroke-soft-200',
                      )}
                    >
                      <div className='flex items-start justify-between gap-3'>
                        <div className='flex items-center gap-3.5'>
                          <div
                            className={cn(
                              'flex size-12 shrink-0 items-center justify-center rounded-full font-bold text-label-md ring-1',
                              isLeader
                                ? 'bg-primary-base text-static-white ring-primary-base/30 shadow-xs'
                                : 'bg-bg-weak-50 text-text-sub-600 ring-stroke-soft-200',
                            )}
                          >
                            {res.candidateName.slice(0, 2).toUpperCase()}
                          </div>

                          <div>
                            <div className='flex items-center gap-2'>
                              <h3 className='text-label-md font-bold text-text-strong-950'>
                                {res.candidateName}
                              </h3>
                              {isLeader && (
                                <Badge.Root
                                  variant='lighter'
                                  color='green'
                                  size='small'
                                >
                                  Race Leader
                                </Badge.Root>
                              )}
                            </div>
                            <span className='text-paragraph-xs font-medium text-text-sub-600'>
                              Rank #{idx + 1} • {res.total.toLocaleString()}{' '}
                              total votes
                            </span>
                          </div>
                        </div>

                        <div className='text-right'>
                          <span
                            className={cn(
                              'text-title-h3 font-extrabold',
                              isLeader
                                ? 'text-primary-base'
                                : 'text-text-strong-950',
                            )}
                          >
                            {res.percentage}%
                          </span>
                        </div>
                      </div>

                      {/* Vote share bar */}
                      <div className='flex flex-col gap-1.5'>
                        <ProgressBar.Root
                          value={res.percentage}
                          color={isLeader ? 'blue' : 'green'}
                        />
                        <div className='flex justify-between text-[11px] font-medium text-text-soft-400'>
                          <span>{res.total.toLocaleString()} votes cast</span>
                          <span>{res.percentage}% of valid returns</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Stations Collation Registry */}
        {activeTab === 'stations' && (
          <div className='overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs'>
            <Table.Root scrollable>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Polling Unit / Jurisdiction</Table.Head>
                  <Table.Head className='w-[160px]'>Level Tier</Table.Head>
                  <Table.Head className='w-[200px]'>
                    Parent Jurisdiction
                  </Table.Head>
                  <Table.Head className='w-[140px] text-center'>
                    Collation Status
                  </Table.Head>
                  <Table.Head className='w-[160px] text-right'>
                    Action
                  </Table.Head>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {isMappingsLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <Table.Row key={`skel-registry-${idx}`}>
                      <Table.Cell>
                        <Skeleton className='h-4 w-44' />
                      </Table.Cell>
                      <Table.Cell>
                        <Skeleton className='h-5 w-20 rounded-full' />
                      </Table.Cell>
                      <Table.Cell>
                        <Skeleton className='h-4 w-32' />
                      </Table.Cell>
                      <Table.Cell className='text-center'>
                        <Skeleton className='h-5 w-24 mx-auto rounded-full' />
                      </Table.Cell>
                      <Table.Cell className='text-right'>
                        <Skeleton className='h-7 w-20 ml-auto rounded-lg' />
                      </Table.Cell>
                    </Table.Row>
                  ))
                ) : filteredStations.length === 0 ? (
                  <Table.Row>
                    <Table.Cell
                      colSpan={5}
                      className='py-12 text-center text-text-sub-600'
                    >
                      No polling stations found.
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  filteredStations.map((station) => (
                    <Table.Row
                      key={station.id}
                      className='hover:bg-bg-weak-50/50 transition-colors'
                    >
                      <Table.Cell>
                        <span className='text-label-sm font-semibold text-text-strong-950'>
                          {station.name}
                        </span>
                      </Table.Cell>

                      <Table.Cell>
                        <Badge.Root variant='lighter' color='blue' size='small'>
                          {station.levelName || 'Station'}
                        </Badge.Root>
                      </Table.Cell>

                      <Table.Cell>
                        <span className='text-paragraph-sm font-medium text-text-sub-600'>
                          {station.upperLevelName || 'Root'}
                        </span>
                      </Table.Cell>

                      <Table.Cell className='text-center'>
                        <Badge.Root variant='lighter' color='gray' size='small'>
                          Ready to Collate
                        </Badge.Root>
                      </Table.Cell>

                      <Table.Cell className='text-right'>
                        <div className='inline-flex items-center gap-1.5'>
                          <CompactButton.Root
                            type='button'
                            variant='stroke'
                            className='size-7 rounded-lg'
                            onClick={() => setInspectStation(station)}
                            title='View station pink sheet'
                          >
                            <CompactButton.Icon
                              as={RiEyeLine}
                              className='size-4'
                            />
                          </CompactButton.Root>

                          <CompactButton.Root
                            type='button'
                            variant='stroke'
                            className='size-7 rounded-lg hover:text-primary-base'
                            onClick={() => handleOpenRecordModal(station.id)}
                            title='Record station results'
                          >
                            <CompactButton.Icon
                              as={RiAddLine}
                              className='size-4'
                            />
                          </CompactButton.Root>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table.Root>
          </div>
        )}

        {/* Tab 3: Official Collation Certificate Audit */}
        {activeTab === 'audit' && (
          <div className='rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-6 shadow-regular-xs'>
            <div className='flex flex-col gap-1 border-b border-stroke-soft-200 pb-4 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <h3 className='text-label-lg font-bold text-text-strong-950'>
                  Form EC-8B Collation Certificate
                </h3>
                <p className='text-paragraph-sm text-text-sub-600'>
                  Constituency / Jurisdictional Collation Declaration
                  Certificate for {activeElection?.name || 'Election'}.
                </p>
              </div>

              <Badge.Root variant='lighter' color='blue' size='small'>
                Official Form EC-8B
              </Badge.Root>
            </div>

            <div className='mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3'>
              <div className='rounded-xl bg-bg-weak-50 p-4 border border-stroke-soft-200'>
                <span className='text-paragraph-xs font-semibold text-text-soft-400 uppercase'>
                  Total Registered Voters
                </span>
                <p className='mt-1 text-title-h4 font-bold text-text-strong-950'>
                  {Number(totalExpectedTurnout).toLocaleString()}
                </p>
              </div>

              <div className='rounded-xl bg-bg-weak-50 p-4 border border-stroke-soft-200'>
                <span className='text-paragraph-xs font-semibold text-text-soft-400 uppercase'>
                  Total Valid Votes Counted
                </span>
                <p className='mt-1 text-title-h4 font-bold text-emerald-600'>
                  {totalValidVotes.toLocaleString()}
                </p>
              </div>

              <div className='rounded-xl bg-bg-weak-50 p-4 border border-stroke-soft-200'>
                <span className='text-paragraph-xs font-semibold text-text-soft-400 uppercase'>
                  Total Rejected Ballots
                </span>
                <p className='mt-1 text-title-h4 font-bold text-error-base'>
                  {totalSpoiltBallots.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Candidate Breakdown in Audit */}
            <div className='mt-6 overflow-hidden rounded-xl border border-stroke-soft-200'>
              <div className='grid grid-cols-[1fr,150px,120px] bg-bg-weak-50 px-4 py-2.5 text-paragraph-xs font-bold text-text-sub-600 uppercase tracking-wider'>
                <span>Candidate</span>
                <span className='text-right'>Total Valid Votes</span>
                <span className='text-right'>Percentage</span>
              </div>
              <div className='divide-y divide-stroke-soft-200'>
                {results.map((r) => (
                  <div
                    key={r.candidateId}
                    className='grid grid-cols-[1fr,150px,120px] items-center px-4 py-3'
                  >
                    <span className='font-semibold text-text-strong-950'>
                      {r.candidateName}
                    </span>
                    <span className='text-right font-semibold text-text-strong-950'>
                      {r.total.toLocaleString()}
                    </span>
                    <span className='text-right font-bold text-primary-base'>
                      {r.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className='mt-6 flex justify-end gap-3'>
              <Button.Root
                variant='primary'
                mode='filled'
                size='small'
                onClick={() => window.print()}
              >
                <Button.Icon as={RiPrinterLine} />
                <span>Print Form EC-8B Certificate</span>
              </Button.Root>
            </div>
          </div>
        )}
      </div>

      {/* Sibling Action Modals */}
      <RecordCollationModal
        open={recordModalOpen}
        electionId={electionId}
        defaultStationId={selectedStationForRecord}
        stations={pollingStations}
        candidates={candidates}
        onClose={() => {
          setRecordModalOpen(false);
          setSelectedStationForRecord(undefined);
        }}
        onSuccess={() => {
          refetchCollation();
        }}
      />

      <ViewStationCollationModal
        open={Boolean(inspectStation)}
        station={inspectStation}
        onClose={() => setInspectStation(null)}
        onRecordNew={(station) => handleOpenRecordModal(station.id)}
      />
    </div>
  );
}
