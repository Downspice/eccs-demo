'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGetCandidates, type CandidateItem } from '@/services/candidates';
import {
  useGetElectionCandidateResults,
  useGetResultsByLevelMapping,
  useVerifyElectionCollation,
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
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiBarChartBoxLine,
  RiCalendarLine,
  RiCheckDoubleLine,
  RiCloseLine,
  RiEyeLine,
  RiGovernmentLine,
  RiGroupLine,
  RiInboxArchiveLine,
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
import * as Pagination from '@/components/ui/pagination';
import * as ProgressBar from '@/components/ui/progress-bar';
import * as Select from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import * as Switch from '@/components/ui/switch';
import * as Table from '@/components/ui/table';

import { CandidateLeaderboardBarChart } from '../candidate-leaderboard-chart';
import { RecordCollationModal } from '../record-collation-modal';
import { ViewStationCollationModal } from '../view-station-collation';

function getPaginationItems(
  current: number,
  total: number,
): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total];
  }
  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, '...', current - 1, current, current + 1, '...', total];
}

interface StationRegistryRowProps {
  station: LevelMappingItem;
  electionId: string;
  onInspect: (station: LevelMappingItem) => void;
  onRecord: (stationId: string) => void;
}

function StationRegistryRow({
  station,
  electionId,
  onInspect,
  onRecord,
}: StationRegistryRowProps) {
  const { data: collationData, isLoading } = useGetResultsByLevelMapping(
    station.id,
    false,
  );
  const verifyCollation = useVerifyElectionCollation();

  const collation = collationData?.collation;
  const isCollated = Boolean(collation);
  const isVerified = Boolean(collation?.status);

  const handleVerify = async () => {
    if (!collation?.id) return;
    try {
      await verifyCollation.mutateAsync({
        collationId: collation.id,
        electionId: collation.electionId || electionId,
        levelMappingId: station.id,
      });
    } catch (err) {
      console.error('Failed to verify collation:', err);
    }
  };

  return (
    <Table.Row className='hover:bg-bg-weak-50/50 transition-colors'>
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
        {isLoading ? (
          <Skeleton className='mx-auto h-5 w-24 rounded-full' />
        ) : isCollated && isVerified ? (
          <Badge.Root variant='lighter' color='green' size='small'>
            <RiCheckDoubleLine className='size-3 shrink-0' />
            <span>Verified</span>
          </Badge.Root>
        ) : isCollated && !isVerified ? (
          <Badge.Root variant='lighter' color='orange' size='small'>
            <RiTimeLine className='size-3 shrink-0' />
            <span>Provisional</span>
          </Badge.Root>
        ) : (
          <Badge.Root variant='lighter' color='gray' size='small'>
            <span>Ready</span>
          </Badge.Root>
        )}
      </Table.Cell>

      <Table.Cell className='text-right'>
        {isLoading ? (
          <Skeleton className='ml-auto h-7 w-20 rounded-lg' />
        ) : (
          <div className='inline-flex items-center justify-end gap-1.5'>
            {isCollated && isVerified ? (
              // Collated and verified: only show view button so user just sees results
              <CompactButton.Root
                type='button'
                variant='stroke'
                className='size-7 rounded-lg'
                onClick={() => onInspect(station)}
                title='View station results'
              >
                <CompactButton.Icon as={RiEyeLine} className='size-4' />
              </CompactButton.Root>
            ) : isCollated && !isVerified ? (
              // Collated but NOT verified: view button + verify button
              <>
                <CompactButton.Root
                  type='button'
                  variant='stroke'
                  className='size-7 rounded-lg'
                  onClick={() => onInspect(station)}
                  title='View provisional results'
                >
                  <CompactButton.Icon as={RiEyeLine} className='size-4' />
                </CompactButton.Root>

                <Button.Root
                  type='button'
                  variant='primary'
                  mode='filled'
                  size='xxsmall'
                  onClick={handleVerify}
                  disabled={verifyCollation.isPending || !collation?.id}
                  title='Verify and certify station results'
                >
                  <Button.Icon as={RiCheckDoubleLine} />
                  <span>
                    {verifyCollation.isPending ? 'Verifying...' : 'Verify'}
                  </span>
                </Button.Root>
              </>
            ) : (
              // Ready to collate: record results button
              <CompactButton.Root
                type='button'
                variant='stroke'
                className='size-7 rounded-lg hover:text-primary-base'
                onClick={() => onRecord(station.id)}
                title='Record station results'
              >
                <CompactButton.Icon as={RiAddLine} className='size-4' />
              </CompactButton.Root>
            )}
          </div>
        )}
      </Table.Cell>
    </Table.Row>
  );
}

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

  // All jurisdictions across all hierarchy levels in this election
  const pollingStations = React.useMemo<LevelMappingItem[]>(() => {
    if (!rawLevelMappings || !Array.isArray(rawLevelMappings)) return [];
    return rawLevelMappings.flatMap((group: LevelMappingGroup) =>
      (group.mappings || []).map((m: LevelMappingItem) => ({
        ...m,
        levelId: m.levelId || group.levelId,
        levelName: m.levelName || group.levelName,
        electionId: m.electionId || electionId,
        levelRank: m.levelRank ?? group.levelRank,
      })),
    );
  }, [rawLevelMappings, electionId]);

  // Available Level Tiers for Filtering
  const availableTiers = React.useMemo(() => {
    if (!rawLevelMappings || !Array.isArray(rawLevelMappings)) return [];
    return rawLevelMappings.map((g: LevelMappingGroup) => ({
      id: g.levelId,
      name: g.levelName,
      count: g.mappings?.length || 0,
    }));
  }, [rawLevelMappings]);

  const [selectedTierFilter, setSelectedTierFilter] =
    React.useState<string>('all');

  // Modals & Inspection State
  const [recordModalOpen, setRecordModalOpen] = React.useState(false);
  const [selectedStationForRecord, setSelectedStationForRecord] =
    React.useState<string | undefined>(undefined);
  const [inspectStation, setInspectStation] =
    React.useState<LevelMappingItem | null>(null);

  // Navigation tab within collation
  const [activeTab, setActiveTab] = React.useState<'standings' | 'stations'>(
    'standings',
  );
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

  // Filtered Polling Stations (by search & tier)
  const filteredStations = React.useMemo(() => {
    let list = pollingStations;
    if (selectedTierFilter !== 'all') {
      list = list.filter((s) => s.levelId === selectedTierFilter);
    }
    if (stationSearch.trim()) {
      const q = stationSearch.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.levelName?.toLowerCase().includes(q) ||
          s.upperLevelName?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [pollingStations, selectedTierFilter, stationSearch]);

  const [stationPage, setStationPage] = React.useState(1);
  const STATIONS_PER_PAGE = 10;

  const totalStationPages = Math.max(
    1,
    Math.ceil(filteredStations.length / STATIONS_PER_PAGE),
  );

  React.useEffect(() => {
    setStationPage(1);
  }, [stationSearch]);

  React.useEffect(() => {
    if (stationPage > totalStationPages) {
      setStationPage(1);
    }
  }, [stationPage, totalStationPages]);

  const paginatedStations = React.useMemo(() => {
    const startIndex = (stationPage - 1) * STATIONS_PER_PAGE;
    return filteredStations.slice(startIndex, startIndex + STATIONS_PER_PAGE);
  }, [filteredStations, stationPage]);

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
      <div className='flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start'>
          {/* Columns 1 & 2: Primary Collation Dashboard */}
          <div className='space-y-6 lg:col-span-2'>
            {/* Race leader · Collation scope */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-stretch'>
              {/* 1 — Current race leader */}
              <div className='relative flex h-full flex-col overflow-hidden rounded-2xl border border-primary-base/30 bg-gradient-to-br from-primary-base/[0.07] via-bg-white-0 to-primary-base/[0.04] p-5 shadow-regular-xs'>
                {isCollationLoading ? (
                  <Skeleton className='h-full min-h-[200px] w-full rounded-xl' />
                ) : leader && leader.total > 0 ? (
                  <>
                    <div className='flex items-start gap-3'>
                      <div className='flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-base text-static-white shadow-regular-xs ring-4 ring-primary-base/20'>
                        <RiTrophyLine className='size-6' />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <Badge.Root variant='lighter' color='blue' size='small'>
                          Current Race Leader
                        </Badge.Root>
                        {leadMargin > 0 && runnerUp && (
                          <p className='mt-1.5 text-[11px] font-semibold text-emerald-600'>
                            +{leadMargin.toLocaleString()} votes lead
                          </p>
                        )}
                        <h2 className='mt-2 text-title-h5 font-bold text-text-strong-950'>
                          {leader.candidateName}
                        </h2>
                        <p className='mt-1 text-paragraph-xs text-text-sub-600'>
                          {leader.percentage}% of valid votes across{' '}
                          {sheetsCounted} reporting station
                          {sheetsCounted === 1 ? '' : 's'}.
                        </p>
                      </div>
                    </div>
                    <div className='mt-auto pt-4'>
                      <div className='flex items-baseline gap-2'>
                        <span className='text-title-h3 font-extrabold text-primary-base'>
                          {leader.percentage}%
                        </span>
                        <span className='text-paragraph-sm font-semibold text-text-sub-600'>
                          ({leader.total.toLocaleString()} votes)
                        </span>
                      </div>
                      <div className='mt-2'>
                        <ProgressBar.Root
                          value={leader.percentage}
                          color='blue'
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className='flex flex-1 flex-col justify-center py-4'>
                    <div className='flex size-11 items-center justify-center rounded-xl bg-bg-weak-50 text-text-sub-600'>
                      <RiTrophyLine className='size-5' />
                    </div>
                    <p className='mt-3 text-label-sm font-semibold text-text-strong-950'>
                      No leader yet
                    </p>
                    <p className='mt-1 text-paragraph-xs text-text-sub-600'>
                      Record station results to surface the race leader.
                    </p>
                  </div>
                )}
              </div>

              {/* 2 — Collation scope & reporting stats */}
              <div className='flex h-full flex-col justify-between gap-4 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-regular-xs'>
                <div>
                  <span className='text-paragraph-xs font-semibold uppercase tracking-wider text-text-soft-400'>
                    Collation scope
                  </span>
                  <div className='mt-3 flex flex-col gap-3'>
                    <div className='flex items-center gap-2'>
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
                    </div>
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

                <div className='space-y-3 border-t border-stroke-soft-200 pt-4 text-paragraph-sm'>
                  <div className='flex items-center justify-between gap-2'>
                    <span className='text-text-sub-600'>Sheets counted</span>
                    <strong className='text-text-strong-950'>
                      {sheetsCounted.toLocaleString()}
                    </strong>
                  </div>
                  <div className='flex items-center justify-between gap-2'>
                    <span className='text-text-sub-600'>
                      Registered expected
                    </span>
                    <strong className='text-text-strong-950'>
                      {totalExpectedTurnout.toLocaleString()}
                    </strong>
                  </div>
                  <div className='flex items-center justify-between gap-2'>
                    <span className='text-text-sub-600'>Valid votes</span>
                    <strong className='text-text-strong-950'>
                      {totalValidVotes.toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Primary KPI Metrics Grid */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
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
              </div>

              {/* Search & Tier Filter Controls for stations */}
              {activeTab === 'stations' && (
                <div className='flex flex-wrap items-center gap-2'>
                  {availableTiers.length > 1 && (
                    <div className='w-48'>
                      <Select.Root
                        value={selectedTierFilter}
                        onValueChange={(val) => {
                          setSelectedTierFilter(val);
                          setStationPage(1);
                        }}
                      >
                        <Select.Trigger className='h-9 w-full'>
                          <Select.Value placeholder='All Level Tiers' />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value='all'>
                            All Tiers ({pollingStations.length})
                          </Select.Item>
                          {availableTiers.map((t) => (
                            <Select.Item key={t.id} value={t.id}>
                              {t.name} ({t.count})
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                    </div>
                  )}

                  <div className='w-full sm:w-60'>
                    <Input.Root>
                      <Input.Wrapper>
                        <Input.Icon as={RiSearchLine} />
                        <input
                          type='text'
                          placeholder='Search stations...'
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
              )}
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
                              <span>
                                {res.total.toLocaleString()} votes cast
                              </span>
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
                      <Table.Head className='w-[180px] text-right'>
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
                            <Skeleton className='mx-auto h-5 w-24 rounded-full' />
                          </Table.Cell>
                          <Table.Cell className='text-right'>
                            <Skeleton className='ml-auto h-7 w-20 rounded-lg' />
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
                      paginatedStations.map((station) => (
                        <StationRegistryRow
                          key={station.id}
                          station={station}
                          electionId={electionId}
                          onInspect={setInspectStation}
                          onRecord={handleOpenRecordModal}
                        />
                      ))
                    )}
                  </Table.Body>
                </Table.Root>

                {/* Pagination Footer */}
                {filteredStations.length > 0 && (
                  <div className='flex flex-col items-center justify-between gap-3 border-t border-stroke-soft-200 px-4 py-3 sm:flex-row'>
                    <span className='text-paragraph-xs text-text-sub-600'>
                      Showing{' '}
                      <strong className='font-semibold text-text-strong-950'>
                        {(stationPage - 1) * STATIONS_PER_PAGE + 1}
                      </strong>{' '}
                      to{' '}
                      <strong className='font-semibold text-text-strong-950'>
                        {Math.min(
                          filteredStations.length,
                          stationPage * STATIONS_PER_PAGE,
                        )}
                      </strong>{' '}
                      of{' '}
                      <strong className='font-semibold text-text-strong-950'>
                        {filteredStations.length}
                      </strong>{' '}
                      stations
                    </span>

                    {totalStationPages > 1 && (
                      <Pagination.Root variant='basic'>
                        <Pagination.NavButton
                          type='button'
                          onClick={() =>
                            setStationPage((p) => Math.max(1, p - 1))
                          }
                          disabled={stationPage === 1}
                          aria-label='Previous page'
                        >
                          <Pagination.NavIcon as={RiArrowLeftSLine} />
                        </Pagination.NavButton>

                        {getPaginationItems(stationPage, totalStationPages).map(
                          (item, index) =>
                            typeof item === 'number' ? (
                              <Pagination.Item
                                key={`station-page-${item}`}
                                type='button'
                                current={item === stationPage}
                                onClick={() => setStationPage(item)}
                              >
                                {item}
                              </Pagination.Item>
                            ) : (
                              <span
                                key={`ellipsis-${index}`}
                                className='flex h-8 min-w-8 items-center justify-center text-label-sm text-text-soft-400 select-none'
                              >
                                …
                              </span>
                            ),
                        )}

                        <Pagination.NavButton
                          type='button'
                          onClick={() =>
                            setStationPage((p) =>
                              Math.min(totalStationPages, p + 1),
                            )
                          }
                          disabled={stationPage === totalStationPages}
                          aria-label='Next page'
                        >
                          <Pagination.NavIcon as={RiArrowRightSLine} />
                        </Pagination.NavButton>
                      </Pagination.Root>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Column 3: Dedicated Full-Height Candidate Leaderboard Bar Chart */}
          <div className='lg:col-span-1 lg:sticky lg:top-0 flex flex-col'>
            <CandidateLeaderboardBarChart
              results={results}
              isLoading={isCollationLoading}
              className='w-full'
            />
          </div>
        </div>
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
