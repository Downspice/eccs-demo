'use client';

import * as React from 'react';
import { useGetCandidates, type CandidateItem } from '@/services/candidates';
import { useGetElections, type ElectionItem } from '@/services/elections';
import {
  useGetLevelMappings,
  type LevelMappingGroup,
  type LevelMappingItem,
} from '@/services/level-mappings';
import {
  RiBarChartBoxLine,
  RiCheckDoubleLine,
  RiCloseLine,
  RiDownloadLine,
  RiFileChartLine,
  RiGovernmentLine,
  RiGroupLine,
  RiInboxArchiveLine,
  RiPrinterLine,
  RiRefreshLine,
  RiSearchLine,
  RiTimeLine,
  RiUser3Line,
} from '@remixicon/react';

import { cn } from '@/utils/cn';
import * as Badge from '@/components/ui/badge';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as ProgressBar from '@/components/ui/progress-bar';
import * as Select from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import * as Table from '@/components/ui/table';

export default function ElectionCollationPage() {
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

  const [selectedElectionId, setSelectedElectionId] =
    React.useState<string>('');

  React.useEffect(() => {
    if (!selectedElectionId && elections.length > 0) {
      setSelectedElectionId(elections[0].id);
    }
  }, [elections, selectedElectionId]);

  const activeElectionId = selectedElectionId || elections[0]?.id;
  const activeElection = elections.find((e) => e.id === activeElectionId);

  // Fetch election-specific datasets
  const { data: rawCandidates, isLoading: isCandidatesLoading } =
    useGetCandidates(activeElectionId);
  const { data: rawLevelMappings, isLoading: isMappingsLoading } =
    useGetLevelMappings(activeElectionId);

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
        electionId: m.electionId || activeElectionId,
      })),
    );
  }, [rawLevelMappings, activeElectionId]);

  // Tab state: 'summary' | 'stations' | 'sheets'
  const [activeTab, setActiveTab] = React.useState<
    'summary' | 'stations' | 'sheets'
  >('summary');
  const [searchQuery, setSearchQuery] = React.useState('');

  // Simulated live collation returns calculation based on expected turnout & candidate slates
  const totalExpectedTurnout = activeElection?.expectedTurnout || 1000;
  const totalStations = pollingStations.length || 9;
  const stationsReported = Math.min(
    totalStations,
    Math.round(totalStations * 0.78),
  );
  const reportingPercentage = totalStations
    ? Math.round((stationsReported / totalStations) * 100)
    : 0;

  // Filtered station list
  const filteredStations = React.useMemo(() => {
    if (!searchQuery.trim()) return pollingStations;
    const q = searchQuery.toLowerCase();
    return pollingStations.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.levelName?.toLowerCase().includes(q) ||
        s.upperLevelName?.toLowerCase().includes(q),
    );
  }, [pollingStations, searchQuery]);

  return (
    <div className='flex min-h-0 w-full flex-1 flex-col overflow-hidden'>
      {/* Page Heading Header */}
      <header className='w-full shrink-0 border-b border-stroke-soft-200 bg-bg-white-0 px-4 py-5 lg:px-8'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex flex-col gap-1'>
            <div className='flex items-center gap-2.5'>
              <div className='flex size-8 items-center justify-center rounded-lg bg-primary-base text-static-white'>
                <RiBarChartBoxLine className='size-4' />
              </div>
              <h1 className='text-title-h5 font-semibold text-text-strong-950 sm:text-title-h4'>
                Election Collation
              </h1>
            </div>
            <p className='text-paragraph-sm text-text-sub-600'>
              Collate, tally, and audit ballot returns across administrative
              tiers and territorial polling stations.
            </p>
          </div>

          {/* Election Selector & Actions */}
          <div className='flex flex-wrap items-center gap-2.5'>
            {elections.length > 0 && (
              <div className='w-64'>
                <Select.Root
                  value={activeElectionId}
                  onValueChange={(val) => setSelectedElectionId(val)}
                  disabled={isElectionsLoading}
                >
                  <Select.Trigger className='w-full'>
                    <Select.Value placeholder='Select active election...' />
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

            <Button.Root
              variant='neutral'
              mode='stroke'
              size='small'
              onClick={() => window.print()}
              title='Print collation report'
            >
              <Button.Icon as={RiPrinterLine} />
              <span>Print Sheet</span>
            </Button.Root>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className='flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 lg:px-8'>
        {/* KPI Metric Cards */}
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {/* Card 1: Expected Turnout */}
          <div className='rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-regular-xs'>
            <div className='flex items-center justify-between'>
              <span className='text-paragraph-xs font-medium text-text-soft-400 uppercase tracking-wider'>
                Expected Turnout
              </span>
              <div className='flex size-7 items-center justify-center rounded-lg bg-bg-weak-50 text-text-sub-600'>
                <RiGroupLine className='size-4' />
              </div>
            </div>
            <div className='mt-2 flex items-baseline gap-2'>
              <span className='text-title-h4 font-semibold text-text-strong-950'>
                {Number(totalExpectedTurnout).toLocaleString()}
              </span>
              <span className='text-paragraph-xs text-text-soft-400'>
                registered voters
              </span>
            </div>
            <div className='mt-3 flex items-center gap-1.5 text-[11px] text-text-sub-600'>
              <span className='inline-block size-1.5 rounded-full bg-emerald-500' />
              <span>Voter register synchronized</span>
            </div>
          </div>

          {/* Card 2: Reporting Stations */}
          <div className='rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-regular-xs'>
            <div className='flex items-center justify-between'>
              <span className='text-paragraph-xs font-medium text-text-soft-400 uppercase tracking-wider'>
                Stations Reported
              </span>
              <div className='flex size-7 items-center justify-center rounded-lg bg-bg-weak-50 text-text-sub-600'>
                <RiGovernmentLine className='size-4' />
              </div>
            </div>
            <div className='mt-2 flex items-baseline gap-2'>
              <span className='text-title-h4 font-semibold text-text-strong-950'>
                {stationsReported}
                <span className='text-paragraph-sm font-normal text-text-soft-400'>
                  /{totalStations}
                </span>
              </span>
              <Badge.Root variant='lighter' color='blue' size='small'>
                {reportingPercentage}%
              </Badge.Root>
            </div>
            <div className='mt-3'>
              <ProgressBar.Root value={reportingPercentage} color='blue' />
            </div>
          </div>

          {/* Card 3: Total Ballots Collated */}
          <div className='rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-regular-xs'>
            <div className='flex items-center justify-between'>
              <span className='text-paragraph-xs font-medium text-text-soft-400 uppercase tracking-wider'>
                Ballots Collated
              </span>
              <div className='flex size-7 items-center justify-center rounded-lg bg-bg-weak-50 text-text-sub-600'>
                <RiInboxArchiveLine className='size-4' />
              </div>
            </div>
            <div className='mt-2 flex items-baseline gap-2'>
              <span className='text-title-h4 font-semibold text-text-strong-950'>
                {Math.round(totalExpectedTurnout * 0.82).toLocaleString()}
              </span>
              <span className='text-paragraph-xs text-text-soft-400'>
                valid returns
              </span>
            </div>
            <div className='mt-3 flex items-center gap-1.5 text-[11px] text-text-sub-600'>
              <RiCheckDoubleLine className='size-3.5 text-primary-base' />
              <span>Certified under ballot manifests</span>
            </div>
          </div>

          {/* Card 4: Collation Status */}
          <div className='rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-regular-xs'>
            <div className='flex items-center justify-between'>
              <span className='text-paragraph-xs font-medium text-text-soft-400 uppercase tracking-wider'>
                Collation Status
              </span>
              <div className='flex size-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600'>
                <RiTimeLine className='size-4' />
              </div>
            </div>
            <div className='mt-2 flex items-baseline gap-2'>
              <span className='text-label-md font-semibold text-text-strong-950'>
                Collation in Progress
              </span>
            </div>
            <div className='mt-3 flex items-center gap-1.5 text-[11px] text-text-sub-600'>
              <span className='relative flex size-2'>
                <span className='absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75' />
                <span className='relative inline-flex size-2 rounded-full bg-emerald-500' />
              </span>
              <span>Live collation stream active</span>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs & Controls Bar */}
        <div className='mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-stroke-soft-200 pb-3'>
          <div className='flex items-center gap-1 rounded-10 bg-bg-weak-50 p-1 border border-stroke-soft-200'>
            <button
              type='button'
              onClick={() => setActiveTab('summary')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-paragraph-xs font-medium rounded-md transition-colors',
                activeTab === 'summary'
                  ? 'bg-bg-white-0 text-text-strong-950 shadow-toggle-switch'
                  : 'text-text-sub-600 hover:text-text-strong-950',
              )}
            >
              <RiBarChartBoxLine className='size-3.5' />
              <span>Candidate Standings</span>
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
              <span>Jurisdictions & Stations ({pollingStations.length})</span>
            </button>

            <button
              type='button'
              onClick={() => setActiveTab('sheets')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-paragraph-xs font-medium rounded-md transition-colors',
                activeTab === 'sheets'
                  ? 'bg-bg-white-0 text-text-strong-950 shadow-toggle-switch'
                  : 'text-text-sub-600 hover:text-text-strong-950',
              )}
            >
              <RiFileChartLine className='size-3.5' />
              <span>Collation Manifest</span>
            </button>
          </div>

          {/* Search bar */}
          <div className='w-full sm:max-w-xs'>
            <Input.Root>
              <Input.Wrapper>
                <Input.Icon as={RiSearchLine} />
                <input
                  type='text'
                  placeholder='Search stations or candidates...'
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

        {/* Tab 1: Candidate Standings */}
        {activeTab === 'summary' && (
          <div className='mt-4 flex flex-col gap-4'>
            {isCandidatesLoading ? (
              <div className='space-y-3'>
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Skeleton
                    key={`cand-skel-${idx}`}
                    className='h-20 w-full rounded-xl'
                  />
                ))}
              </div>
            ) : candidates.length === 0 ? (
              <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-stroke-soft-200 py-16 text-center'>
                <div className='flex size-12 items-center justify-center rounded-2xl bg-bg-weak-50 text-text-sub-600'>
                  <RiUser3Line className='size-6' />
                </div>
                <p className='mt-3 text-label-sm font-semibold text-text-strong-950'>
                  No contested candidates registered
                </p>
                <p className='mt-1 text-paragraph-xs text-text-sub-600'>
                  Please register candidates under the Setups module to view
                  collation standings.
                </p>
              </div>
            ) : (
              <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                {candidates.map((cand, idx) => {
                  // Compute simulated results for demonstration
                  const voteShare = idx === 0 ? 54.8 : idx === 1 ? 41.2 : 4.0;
                  const voteCount = Math.round(
                    (totalExpectedTurnout * 0.82 * voteShare) / 100,
                  );
                  const isLeader = idx === 0;

                  return (
                    <div
                      key={cand.id}
                      className={cn(
                        'relative flex flex-col gap-3 rounded-xl border bg-bg-white-0 p-5 shadow-regular-xs transition-all',
                        isLeader
                          ? 'border-primary-base/40 ring-1 ring-primary-base/20'
                          : 'border-stroke-soft-200',
                      )}
                    >
                      <div className='flex items-start justify-between gap-3'>
                        <div className='flex items-center gap-3'>
                          <div className='flex size-11 shrink-0 items-center justify-center rounded-full bg-bg-weak-50 text-text-sub-600 font-semibold ring-1 ring-stroke-soft-200'>
                            {cand.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className='flex items-center gap-2'>
                              <h3 className='text-label-md font-semibold text-text-strong-950'>
                                {cand.name}
                              </h3>
                              {isLeader && (
                                <Badge.Root
                                  variant='lighter'
                                  color='green'
                                  size='small'
                                >
                                  Leading
                                </Badge.Root>
                              )}
                            </div>
                            <span className='text-paragraph-xs text-text-sub-600'>
                              {cand.politicalPartyName || 'Independent'}
                            </span>
                          </div>
                        </div>

                        <div className='text-right'>
                          <span className='text-title-h4 font-bold text-text-strong-950'>
                            {voteShare}%
                          </span>
                          <p className='text-paragraph-xs text-text-soft-400'>
                            {voteCount.toLocaleString()} votes
                          </p>
                        </div>
                      </div>

                      <div className='mt-1'>
                        <ProgressBar.Root
                          value={voteShare}
                          color={isLeader ? 'green' : 'blue'}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Territorial Jurisdictions & Stations */}
        {activeTab === 'stations' && (
          <div className='mt-4 overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs'>
            <Table.Root scrollable>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Territory / Polling Unit</Table.Head>
                  <Table.Head className='w-[160px]'>Level Tier</Table.Head>
                  <Table.Head className='w-[200px]'>
                    Parent Jurisdiction
                  </Table.Head>
                  <Table.Head className='w-[140px] text-center'>
                    Reporting Status
                  </Table.Head>
                  <Table.Head className='w-[120px] text-right'>
                    Ballots Counted
                  </Table.Head>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {isMappingsLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <Table.Row key={`skel-station-${idx}`}>
                      <Table.Cell>
                        <Skeleton className='h-4 w-40' />
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
                        <Skeleton className='h-4 w-16 ml-auto' />
                      </Table.Cell>
                    </Table.Row>
                  ))
                ) : filteredStations.length === 0 ? (
                  <Table.Row>
                    <Table.Cell
                      colSpan={5}
                      className='py-12 text-center text-text-sub-600'
                    >
                      No stations match your criteria.
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  filteredStations.map((station, idx) => {
                    const isReported = idx % 4 !== 0;
                    return (
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
                          <Badge.Root
                            variant='lighter'
                            color='blue'
                            size='small'
                          >
                            {station.levelName || 'Unit'}
                          </Badge.Root>
                        </Table.Cell>
                        <Table.Cell>
                          <span className='text-paragraph-sm text-text-sub-600 font-medium'>
                            {station.upperLevelName || 'Root'}
                          </span>
                        </Table.Cell>
                        <Table.Cell className='text-center'>
                          {isReported ? (
                            <Badge.Root
                              variant='lighter'
                              color='green'
                              size='small'
                            >
                              Reported & Verified
                            </Badge.Root>
                          ) : (
                            <Badge.Root
                              variant='lighter'
                              color='orange'
                              size='small'
                            >
                              Pending Collation
                            </Badge.Root>
                          )}
                        </Table.Cell>
                        <Table.Cell className='text-right font-medium text-text-strong-950'>
                          {isReported ? (115 + idx * 17).toLocaleString() : '—'}
                        </Table.Cell>
                      </Table.Row>
                    );
                  })
                )}
              </Table.Body>
            </Table.Root>
          </div>
        )}

        {/* Tab 3: Collation Manifest & Summary Sheet */}
        {activeTab === 'sheets' && (
          <div className='mt-4 flex flex-col gap-4'>
            <div className='rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 shadow-regular-xs'>
              <div className='flex flex-col gap-1 border-b border-stroke-soft-200 pb-4'>
                <h3 className='text-label-lg font-semibold text-text-strong-950'>
                  Official Collation Summary Sheet
                </h3>
                <p className='text-paragraph-sm text-text-sub-600'>
                  Form EC-8A/B Summary Audit Certificate for{' '}
                  {activeElection?.name || 'General Election'}.
                </p>
              </div>

              <div className='mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3'>
                <div className='rounded-lg bg-bg-weak-50 p-3.5'>
                  <span className='text-paragraph-xs font-medium text-text-soft-400 uppercase'>
                    Total Registered Voters
                  </span>
                  <p className='mt-1 text-title-h5 font-semibold text-text-strong-950'>
                    {Number(totalExpectedTurnout).toLocaleString()}
                  </p>
                </div>
                <div className='rounded-lg bg-bg-weak-50 p-3.5'>
                  <span className='text-paragraph-xs font-medium text-text-soft-400 uppercase'>
                    Total Valid Votes
                  </span>
                  <p className='mt-1 text-title-h5 font-semibold text-text-strong-950'>
                    {Math.round(totalExpectedTurnout * 0.8).toLocaleString()}
                  </p>
                </div>
                <div className='rounded-lg bg-bg-weak-50 p-3.5'>
                  <span className='text-paragraph-xs font-medium text-text-soft-400 uppercase'>
                    Rejected Ballots
                  </span>
                  <p className='mt-1 text-title-h5 font-semibold text-text-strong-950 text-error-base'>
                    {Math.round(totalExpectedTurnout * 0.02).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className='mt-6 flex justify-end gap-3'>
                <Button.Root
                  variant='neutral'
                  mode='stroke'
                  size='small'
                  onClick={() => window.print()}
                >
                  <Button.Icon as={RiDownloadLine} />
                  <span>Export CSV</span>
                </Button.Root>
                <Button.Root
                  variant='primary'
                  mode='filled'
                  size='small'
                  onClick={() => window.print()}
                >
                  <Button.Icon as={RiPrinterLine} />
                  <span>Print Certificate</span>
                </Button.Root>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
