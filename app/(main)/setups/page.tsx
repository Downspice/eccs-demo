'use client';

import * as React from 'react';
import { useGetCandidates, type CandidateItem } from '@/services/candidates';
import { useGetElections, type ElectionItem } from '@/services/elections';
import {
  useGetLevelMappings,
  type LevelMappingGroup,
  type LevelMappingItem,
} from '@/services/level-mappings';
import { useGetLevels, type LevelItem } from '@/services/levels';
import {
  useGetPoliticalParties,
  type PoliticalPartyItem,
} from '@/services/political-parties';
import {
  RiAddLine,
  RiCalendarLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiEditLine,
  RiEqualizerLine,
  RiEyeLine,
  RiGroupLine,
  RiSearchLine,
} from '@remixicon/react';

import * as Badge from '@/components/ui/badge';
import * as Button from '@/components/ui/button';
import * as CompactButton from '@/components/ui/compact-button';
import * as Input from '@/components/ui/input';
import * as Select from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import * as Table from '@/components/ui/table';

import {
  CreateCandidateModal,
  CreateElectionModal,
  CreateLevelMappingModal,
  CreatePoliticalPartyModal,
  CreateSetupModal,
} from './create';
import {
  DeleteCandidateModal,
  DeleteElectionModal,
  DeleteLevelMappingModal,
  DeletePoliticalPartyModal,
  DeleteSetupModal,
} from './delete';
import { SetupFilters, type SetupFilterState } from './filters';
import { SetupTablePanel } from './setup-table-panel';
import { SetupTabs, type SetupModuleItem } from './tabs';
import type {
  CandidateModalState,
  ElectionModalState,
  LevelMappingModalState,
  ModalState,
  PoliticalPartyModalState,
} from './types';
import {
  UpdateCandidateModal,
  UpdateElectionModal,
  UpdateLevelMappingModal,
  UpdatePoliticalPartyModal,
  UpdateSetupModal,
} from './update';
import {
  ViewCandidateModal,
  ViewElectionModal,
  ViewLevelMappingModal,
  ViewPoliticalPartyModal,
  ViewSetupModal,
} from './view';

const SETUP_MODULES: SetupModuleItem[] = [
  {
    id: 'levels',
    label: 'Levels',
    description:
      'Configure administrative hierarchy tiers, rank levels, and jurisdictional definitions.',
  },
  {
    id: 'level-mapping',
    label: 'Level Mapping',
    description:
      'Map territorial hierarchies, administrative boundaries, and parent reporting jurisdictions.',
  },
  {
    id: 'candidates',
    label: 'Candidates',
    description:
      'Manage contested candidates, political affiliations, ballot allocations, and candidate profiles.',
  },
  {
    id: 'elections',
    label: 'Elections',
    description:
      'Manage election cycles, ballot specifications, and jurisdictional electoral configurations.',
  },
  {
    id: 'political-party',
    label: 'Political Parties',
    description:
      'Manage registered political party entities, ballot affiliations, and accredited party rosters.',
  },
];

export default function SetupsPage() {
  const { data: rawElections, isLoading: isElectionsLoading } =
    useGetElections();
  const { data: rawPoliticalParties, isLoading: isPoliticalPartiesLoading } =
    useGetPoliticalParties();

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

  // Active election datasets
  const { data: rawLevels, isLoading: isLevelsLoading } =
    useGetLevels(activeElectionId);
  const { data: rawLevelMappings, isLoading: isLevelMappingsLoading } =
    useGetLevelMappings(activeElectionId);
  const { data: rawCandidates, isLoading: isCandidatesLoading } =
    useGetCandidates(activeElectionId);

  // Normalized arrays
  const levels = React.useMemo<LevelItem[]>(() => {
    if (Array.isArray(rawLevels)) return rawLevels;
    if (
      rawLevels &&
      typeof rawLevels === 'object' &&
      Array.isArray((rawLevels as { data?: LevelItem[] }).data)
    ) {
      return (rawLevels as { data: LevelItem[] }).data;
    }
    return [];
  }, [rawLevels]);

  const levelMappings = React.useMemo<LevelMappingItem[]>(() => {
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

  const politicalParties = React.useMemo<PoliticalPartyItem[]>(() => {
    if (Array.isArray(rawPoliticalParties)) return rawPoliticalParties;
    if (
      rawPoliticalParties &&
      typeof rawPoliticalParties === 'object' &&
      Array.isArray(
        (rawPoliticalParties as { data?: PoliticalPartyItem[] }).data,
      )
    ) {
      return (rawPoliticalParties as { data: PoliticalPartyItem[] }).data;
    }
    return [];
  }, [rawPoliticalParties]);

  // Tab & search states
  const [activeModule, setActiveModule] = React.useState('levels');
  const [filters, setFilters] = React.useState<SetupFilterState>({
    search: '',
    status: 'all',
  });
  const [levelMappingSearch, setLevelMappingSearch] = React.useState('');
  const [candidateSearch, setCandidateSearch] = React.useState('');
  const [electionSearch, setElectionSearch] = React.useState('');
  const [politicalPartySearch, setPoliticalPartySearch] = React.useState('');

  // Modal states
  const [modalState, setModalState] = React.useState<ModalState>({
    type: null,
  });
  const [levelMappingModalState, setLevelMappingModalState] =
    React.useState<LevelMappingModalState>({
      type: null,
    });
  const [candidateModalState, setCandidateModalState] =
    React.useState<CandidateModalState>({
      type: null,
    });
  const [electionModalState, setElectionModalState] =
    React.useState<ElectionModalState>({
      type: null,
    });
  const [politicalPartyModalState, setPoliticalPartyModalState] =
    React.useState<PoliticalPartyModalState>({
      type: null,
    });

  // URL query parameter synchronization (hydration-safe)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mod = params.get('module');
      if (mod && SETUP_MODULES.some((m) => m.id === mod)) {
        setActiveModule(mod);
      }
    }
  }, []);

  const currentModule =
    SETUP_MODULES.find((m) => m.id === activeModule) || SETUP_MODULES[0];

  // Filtered dataset for Levels
  const filteredLevels = React.useMemo(() => {
    return levels.filter((item) => {
      // Status pill filter
      if (filters.status === 'active' && item.isEnabled === false) return false;
      if (filters.status === 'disabled' && item.isEnabled !== false)
        return false;

      // Search filter
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const matchesName = item.name?.toLowerCase().includes(query);
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesCode = item.code?.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        const matchesElection = item.electionName
          ?.toLowerCase()
          .includes(query);
        if (
          !matchesName &&
          !matchesTitle &&
          !matchesCode &&
          !matchesDesc &&
          !matchesElection
        )
          return false;
      }

      return true;
    });
  }, [levels, filters]);

  // Filtered dataset for Level Mappings
  const filteredLevelMappings = React.useMemo(() => {
    if (!levelMappingSearch.trim()) return levelMappings;
    const query = levelMappingSearch.toLowerCase();
    return levelMappings.filter(
      (item) =>
        item.name?.toLowerCase().includes(query) ||
        item.levelName?.toLowerCase().includes(query) ||
        item.upperLevelName?.toLowerCase().includes(query) ||
        item.id?.toLowerCase().includes(query),
    );
  }, [levelMappings, levelMappingSearch]);

  // Filtered dataset for Candidates
  const filteredCandidates = React.useMemo(() => {
    if (!candidateSearch.trim()) return candidates;
    const query = candidateSearch.toLowerCase();
    return candidates.filter(
      (item) =>
        item.name?.toLowerCase().includes(query) ||
        item.politicalPartyName?.toLowerCase().includes(query) ||
        item.electionName?.toLowerCase().includes(query) ||
        item.id?.toLowerCase().includes(query),
    );
  }, [candidates, candidateSearch]);

  // Filtered dataset for Elections
  const filteredElections = React.useMemo(() => {
    if (!electionSearch.trim()) return elections;
    const query = electionSearch.toLowerCase();
    return elections.filter(
      (item) =>
        item.name?.toLowerCase().includes(query) ||
        item.electionDate?.toLowerCase().includes(query) ||
        item.id?.toLowerCase().includes(query),
    );
  }, [elections, electionSearch]);

  // Filtered dataset for Political Parties
  const filteredPoliticalParties = React.useMemo(() => {
    if (!politicalPartySearch.trim()) return politicalParties;
    const query = politicalPartySearch.toLowerCase();
    return politicalParties.filter(
      (item) =>
        item.name?.toLowerCase().includes(query) ||
        item.abbreviation?.toLowerCase().includes(query) ||
        item.id?.toLowerCase().includes(query),
    );
  }, [politicalParties, politicalPartySearch]);

  // Modules with dynamic counts
  const modulesWithCounts = React.useMemo(() => {
    return SETUP_MODULES.map((mod) => ({
      ...mod,
      count:
        mod.id === 'levels'
          ? levels.length
          : mod.id === 'level-mapping'
            ? levelMappings.length
            : mod.id === 'candidates'
              ? candidates.length
              : mod.id === 'elections'
                ? elections.length
                : mod.id === 'political-party'
                  ? politicalParties.length
                  : undefined,
      loading:
        mod.id === 'levels'
          ? isLevelsLoading
          : mod.id === 'level-mapping'
            ? isLevelMappingsLoading
            : mod.id === 'candidates'
              ? isCandidatesLoading
              : mod.id === 'elections'
                ? isElectionsLoading
                : mod.id === 'political-party'
                  ? isPoliticalPartiesLoading
                  : false,
    }));
  }, [
    levels.length,
    levelMappings.length,
    candidates.length,
    elections.length,
    politicalParties.length,
    isLevelsLoading,
    isLevelMappingsLoading,
    isCandidatesLoading,
    isElectionsLoading,
    isPoliticalPartiesLoading,
  ]);

  return (
    <div className='flex min-h-0 w-full flex-1 flex-col overflow-hidden'>
      {/* Page Heading */}
      <header className='w-full shrink-0 border-b border-stroke-soft-200 bg-bg-white-0 px-4 py-5 lg:px-8'>
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2.5'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-primary-base text-static-white'>
              <RiEqualizerLine className='size-4' />
            </div>
            <h1 className='text-title-h5 font-semibold text-text-strong-950 sm:text-title-h4'>
              System Setups
            </h1>
          </div>
          <p className='text-paragraph-sm text-text-sub-600'>
            Configure administrative tiers, geographic mappings, candidate
            slates, election cycles, and political parties.
          </p>
        </div>
      </header>

      {/* Main Two-Column Layout */}
      <div className='flex max-h-[calc(100svh-8.75rem)] min-h-0 w-full flex-1 flex-col overflow-hidden md:flex-row'>
        {/* Left Column: Setups Vertical Navigation */}
        <aside className='w-full border-b border-stroke-soft-200 bg-bg-white-0 md:w-64 md:shrink-0 md:border-b-0 md:border-r'>
          <SetupTabs
            tabs={modulesWithCounts}
            activeTab={activeModule}
            onTabChange={setActiveModule}
          />
        </aside>

        {/* Right Column: Selected Setup Module Content */}
        <main className='flex min-h-0 flex-1 flex-col gap-6 overflow-hidden p-4 sm:p-6 lg:p-8 bg-bg-weak-50/30'>
          {/* Header of selected setup module */}
          <div className='flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex flex-col gap-0.5'>
              <div className='flex items-center gap-2.5'>
                <h2 className='text-title-h5 font-semibold text-text-strong-950 capitalize'>
                  {currentModule?.label}
                </h2>
              </div>
              <p className='text-paragraph-sm text-text-sub-600'>
                {currentModule?.description}
              </p>
            </div>

            <div>
              {activeModule === 'levels' ? (
                <Button.Root
                  variant='primary'
                  mode='filled'
                  size='small'
                  onClick={() => setModalState({ type: 'create' })}
                >
                  <Button.Icon as={RiAddLine} />
                  <span>New Level</span>
                </Button.Root>
              ) : activeModule === 'level-mapping' ? (
                <Button.Root
                  variant='primary'
                  mode='filled'
                  size='small'
                  onClick={() => setLevelMappingModalState({ type: 'create' })}
                >
                  <Button.Icon as={RiAddLine} />
                  <span>New Mapping</span>
                </Button.Root>
              ) : activeModule === 'candidates' ? (
                <Button.Root
                  variant='primary'
                  mode='filled'
                  size='small'
                  onClick={() => setCandidateModalState({ type: 'create' })}
                >
                  <Button.Icon as={RiAddLine} />
                  <span>New Candidate</span>
                </Button.Root>
              ) : activeModule === 'elections' ? (
                <Button.Root
                  variant='primary'
                  mode='filled'
                  size='small'
                  onClick={() => setElectionModalState({ type: 'create' })}
                >
                  <Button.Icon as={RiAddLine} />
                  <span>New Election</span>
                </Button.Root>
              ) : (
                <Button.Root
                  variant='primary'
                  mode='filled'
                  size='small'
                  onClick={() =>
                    setPoliticalPartyModalState({ type: 'create' })
                  }
                >
                  <Button.Icon as={RiAddLine} />
                  <span>New Political Party</span>
                </Button.Root>
              )}
            </div>
          </div>

          <div className='flex min-h-0 flex-1 flex-col gap-6 overflow-hidden'>
          {/* Search and Filters */}
          {activeModule === 'levels' ? (
            <div className='flex shrink-0 flex-col gap-3'>
              <SetupFilters
                filters={filters}
                onChange={(updated) =>
                  setFilters((prev) => ({ ...prev, ...updated }))
                }
                onReset={() => setFilters({ search: '', status: 'all' })}
              />
              {elections.length > 1 && (
                <div className='flex items-center gap-2 pt-1'>
                  <span className='text-label-xs font-medium text-text-sub-600'>
                    Active Election:
                  </span>
                  <div className='w-64'>
                    <Select.Root
                      value={activeElectionId}
                      onValueChange={(val) => setSelectedElectionId(val)}
                    >
                      <Select.Trigger className='w-full'>
                        <Select.Value placeholder='Select election...' />
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
                </div>
              )}
            </div>
          ) : activeModule === 'level-mapping' ? (
            <div className='flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <div className='w-full sm:max-w-xs'>
                <Input.Root>
                  <Input.Wrapper>
                    <Input.Icon as={RiSearchLine} />
                    <input
                      type='text'
                      placeholder='Search mappings...'
                      value={levelMappingSearch}
                      onChange={(e) => setLevelMappingSearch(e.target.value)}
                      className='w-full bg-transparent px-2.5 py-2 text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none'
                    />
                    {levelMappingSearch && (
                      <button
                        type='button'
                        onClick={() => setLevelMappingSearch('')}
                        className='px-2 text-text-soft-400 hover:text-text-sub-600'
                        title='Clear search'
                      >
                        <RiCloseLine className='size-4' />
                      </button>
                    )}
                  </Input.Wrapper>
                </Input.Root>
              </div>

              {elections.length > 1 && (
                <div className='flex items-center gap-2'>
                  <span className='text-label-xs font-medium text-text-sub-600'>
                    Election:
                  </span>
                  <div className='w-56'>
                    <Select.Root
                      value={activeElectionId}
                      onValueChange={(val) => setSelectedElectionId(val)}
                    >
                      <Select.Trigger className='w-full'>
                        <Select.Value placeholder='Select election...' />
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
                </div>
              )}
            </div>
          ) : activeModule === 'candidates' ? (
            <div className='flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <div className='w-full sm:max-w-xs'>
                <Input.Root>
                  <Input.Wrapper>
                    <Input.Icon as={RiSearchLine} />
                    <input
                      type='text'
                      placeholder='Search candidates...'
                      value={candidateSearch}
                      onChange={(e) => setCandidateSearch(e.target.value)}
                      className='w-full bg-transparent px-2.5 py-2 text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none'
                    />
                    {candidateSearch && (
                      <button
                        type='button'
                        onClick={() => setCandidateSearch('')}
                        className='px-2 text-text-soft-400 hover:text-text-sub-600'
                        title='Clear search'
                      >
                        <RiCloseLine className='size-4' />
                      </button>
                    )}
                  </Input.Wrapper>
                </Input.Root>
              </div>

              {elections.length > 1 && (
                <div className='flex items-center gap-2'>
                  <span className='text-label-xs font-medium text-text-sub-600'>
                    Election:
                  </span>
                  <div className='w-56'>
                    <Select.Root
                      value={activeElectionId}
                      onValueChange={(val) => setSelectedElectionId(val)}
                    >
                      <Select.Trigger className='w-full'>
                        <Select.Value placeholder='Select election...' />
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
                </div>
              )}
            </div>
          ) : activeModule === 'elections' ? (
            <div className='flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <div className='w-full sm:max-w-xs'>
                <Input.Root>
                  <Input.Wrapper>
                    <Input.Icon as={RiSearchLine} />
                    <input
                      type='text'
                      placeholder='Search elections...'
                      value={electionSearch}
                      onChange={(e) => setElectionSearch(e.target.value)}
                      className='w-full bg-transparent px-2.5 py-2 text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none'
                    />
                    {electionSearch && (
                      <button
                        type='button'
                        onClick={() => setElectionSearch('')}
                        className='px-2 text-text-soft-400 hover:text-text-sub-600'
                        title='Clear search'
                      >
                        <RiCloseLine className='size-4' />
                      </button>
                    )}
                  </Input.Wrapper>
                </Input.Root>
              </div>
            </div>
          ) : (
            <div className='flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <div className='w-full sm:max-w-xs'>
                <Input.Root>
                  <Input.Wrapper>
                    <Input.Icon as={RiSearchLine} />
                    <input
                      type='text'
                      placeholder='Search political parties...'
                      value={politicalPartySearch}
                      onChange={(e) => setPoliticalPartySearch(e.target.value)}
                      className='w-full bg-transparent px-2.5 py-2 text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none'
                    />
                    {politicalPartySearch && (
                      <button
                        type='button'
                        onClick={() => setPoliticalPartySearch('')}
                        className='px-2 text-text-soft-400 hover:text-text-sub-600'
                        title='Clear search'
                      >
                        <RiCloseLine className='size-4' />
                      </button>
                    )}
                  </Input.Wrapper>
                </Input.Root>
              </div>
            </div>
          )}

          {/* Main Table Content */}
          <SetupTablePanel>
            {activeModule === 'levels' ? (
              <Table.Root scrollable>
                <Table.Header>
                  <Table.Row>
                    <Table.Head className='w-[100px]'>Rank</Table.Head>
                    <Table.Head>Level Name & Description</Table.Head>
                    <Table.Head>Associated Election</Table.Head>
                    <Table.Head className='w-[120px] text-right'>
                      Actions
                    </Table.Head>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {isLevelsLoading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <Table.Row key={`skeleton-level-${idx}`}>
                        <Table.Cell>
                          <Skeleton className='h-5 w-16 rounded-full' />
                        </Table.Cell>
                        <Table.Cell>
                          <div className='flex flex-col gap-1.5'>
                            <Skeleton className='h-4 w-36' />
                            <Skeleton className='h-3 w-56' />
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <Skeleton className='h-4 w-28' />
                        </Table.Cell>
                        <Table.Cell className='text-right'>
                          <div className='inline-flex items-center justify-end gap-1.5'>
                            <Skeleton className='size-7 rounded-lg' />
                            <Skeleton className='size-7 rounded-lg' />
                            <Skeleton className='size-7 rounded-lg' />
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  ) : filteredLevels.length === 0 ? (
                    <Table.Row>
                      <Table.Cell colSpan={4} className='py-12 text-center'>
                        <p className='text-label-sm font-semibold text-text-strong-950'>
                          No levels found
                        </p>
                        <p className='text-paragraph-xs text-text-sub-600 mt-1'>
                          Try adjusting your search criteria or register a new
                          level.
                        </p>
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    filteredLevels.map((item) => (
                      <Table.Row
                        key={item.id}
                        className='transition-colors hover:bg-bg-weak-50/50'
                      >
                        {/* Level Rank */}
                        <Table.Cell>
                          <Badge.Root
                            variant='lighter'
                            color='gray'
                            size='small'
                          >
                            Rank {item.levelRank ?? 1}
                          </Badge.Root>
                        </Table.Cell>

                        {/* Level Name & Description */}
                        <Table.Cell>
                          <div className='flex flex-col'>
                            <span className='text-label-sm font-semibold text-text-strong-950'>
                              {item.name}
                            </span>
                            {item.description && (
                              <span className='text-paragraph-xs text-text-soft-400 line-clamp-1 mt-0.5'>
                                {item.description}
                              </span>
                            )}
                          </div>
                        </Table.Cell>

                        {/* Associated Election */}
                        <Table.Cell>
                          <span className='text-paragraph-xs text-text-sub-600'>
                            {item.electionName || 'National Level'}
                          </span>
                        </Table.Cell>

                        {/* Actions */}
                        <Table.Cell className='text-right'>
                          <div className='inline-flex items-center gap-1.5'>
                            <CompactButton.Root
                              type='button'
                              variant='stroke'
                              className='size-7 rounded-lg'
                              onClick={() =>
                                setModalState({ type: 'view', item })
                              }
                              title='View details'
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
                              onClick={() =>
                                setModalState({ type: 'update', item })
                              }
                              title='Edit level'
                            >
                              <CompactButton.Icon
                                as={RiEditLine}
                                className='size-4'
                              />
                            </CompactButton.Root>
                            <CompactButton.Root
                              type='button'
                              variant='stroke'
                              className='size-7 rounded-lg hover:text-error-base'
                              onClick={() =>
                                setModalState({ type: 'delete', item })
                              }
                              title='Delete level'
                            >
                              <CompactButton.Icon
                                as={RiDeleteBinLine}
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
            ) : activeModule === 'level-mapping' ? (
              <Table.Root scrollable>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Territory / Unit Name</Table.Head>
                    <Table.Head className='w-[160px]'>Level Tier</Table.Head>
                    <Table.Head className='w-[220px]'>
                      Parent Jurisdiction
                    </Table.Head>
                    <Table.Head>Election</Table.Head>
                    <Table.Head className='w-[120px] text-right'>
                      Actions
                    </Table.Head>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {isLevelMappingsLoading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <Table.Row key={`skeleton-mapping-${idx}`}>
                        <Table.Cell>
                          <Skeleton className='h-4 w-40' />
                        </Table.Cell>
                        <Table.Cell>
                          <Skeleton className='h-5 w-20 rounded-full' />
                        </Table.Cell>
                        <Table.Cell>
                          <Skeleton className='h-4 w-32' />
                        </Table.Cell>
                        <Table.Cell>
                          <Skeleton className='h-4 w-28' />
                        </Table.Cell>
                        <Table.Cell className='text-right'>
                          <div className='inline-flex items-center justify-end gap-1.5'>
                            <Skeleton className='size-7 rounded-lg' />
                            <Skeleton className='size-7 rounded-lg' />
                            <Skeleton className='size-7 rounded-lg' />
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  ) : filteredLevelMappings.length === 0 ? (
                    <Table.Row>
                      <Table.Cell colSpan={5} className='py-12 text-center'>
                        <p className='text-label-sm font-semibold text-text-strong-950'>
                          No level mappings found
                        </p>
                        <p className='text-paragraph-xs text-text-sub-600 mt-1'>
                          Try adjusting your search criteria or register a new
                          territorial mapping.
                        </p>
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    filteredLevelMappings.map((item) => (
                      <Table.Row
                        key={item.id}
                        className='transition-colors hover:bg-bg-weak-50/50'
                      >
                        {/* Unit Name */}
                        <Table.Cell>
                          <span className='text-label-sm font-semibold text-text-strong-950'>
                            {item.name}
                          </span>
                        </Table.Cell>

                        {/* Tier */}
                        <Table.Cell>
                          <Badge.Root
                            variant='lighter'
                            color='gray'
                            size='small'
                          >
                            {item.levelName || 'Level'}
                          </Badge.Root>
                        </Table.Cell>

                        {/* Parent Jurisdiction */}
                        <Table.Cell>
                          {item.upperLevelName ? (
                            <span className='text-paragraph-sm text-text-strong-950 font-medium'>
                              {item.upperLevelName}
                            </span>
                          ) : (
                            <Badge.Root
                              variant='lighter'
                              color='blue'
                              size='small'
                            >
                              Root Level
                            </Badge.Root>
                          )}
                        </Table.Cell>

                        {/* Election */}
                        <Table.Cell>
                          <span className='text-paragraph-xs text-text-sub-600'>
                            {item.electionName || 'Election'}
                          </span>
                        </Table.Cell>

                        {/* Actions */}
                        <Table.Cell className='text-right'>
                          <div className='inline-flex items-center gap-1.5'>
                            <CompactButton.Root
                              type='button'
                              variant='stroke'
                              className='size-7 rounded-lg'
                              onClick={() =>
                                setLevelMappingModalState({
                                  type: 'view',
                                  item,
                                })
                              }
                              title='View details'
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
                              onClick={() =>
                                setLevelMappingModalState({
                                  type: 'update',
                                  item,
                                })
                              }
                              title='Edit mapping'
                            >
                              <CompactButton.Icon
                                as={RiEditLine}
                                className='size-4'
                              />
                            </CompactButton.Root>
                            <CompactButton.Root
                              type='button'
                              variant='stroke'
                              className='size-7 rounded-lg hover:text-error-base'
                              onClick={() =>
                                setLevelMappingModalState({
                                  type: 'delete',
                                  item,
                                })
                              }
                              title='Delete mapping'
                            >
                              <CompactButton.Icon
                                as={RiDeleteBinLine}
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
            ) : activeModule === 'candidates' ? (
              <Table.Root scrollable>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Candidate Name</Table.Head>
                    <Table.Head>Political Party</Table.Head>
                    <Table.Head>Election</Table.Head>
                    <Table.Head className='w-[120px] text-right'>
                      Actions
                    </Table.Head>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {isCandidatesLoading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <Table.Row key={`skeleton-candidate-${idx}`}>
                        <Table.Cell>
                          <Skeleton className='h-4 w-44' />
                        </Table.Cell>
                        <Table.Cell>
                          <Skeleton className='h-4 w-32' />
                        </Table.Cell>
                        <Table.Cell>
                          <Skeleton className='h-4 w-28' />
                        </Table.Cell>
                        <Table.Cell className='text-right'>
                          <div className='inline-flex items-center justify-end gap-1.5'>
                            <Skeleton className='size-7 rounded-lg' />
                            <Skeleton className='size-7 rounded-lg' />
                            <Skeleton className='size-7 rounded-lg' />
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  ) : filteredCandidates.length === 0 ? (
                    <Table.Row>
                      <Table.Cell colSpan={4} className='py-12 text-center'>
                        <p className='text-label-sm font-semibold text-text-strong-950'>
                          No candidates found
                        </p>
                        <p className='text-paragraph-xs text-text-sub-600 mt-1'>
                          Try adjusting your search criteria or register a new
                          candidate.
                        </p>
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    filteredCandidates.map((item) => (
                      <Table.Row
                        key={item.id}
                        className='transition-colors hover:bg-bg-weak-50/50'
                      >
                        {/* Candidate Name */}
                        <Table.Cell>
                          <span className='text-label-sm font-semibold text-text-strong-950'>
                            {item.name}
                          </span>
                        </Table.Cell>

                        {/* Political Party */}
                        <Table.Cell>
                          <span className='text-paragraph-sm text-text-strong-950 font-medium'>
                            {item.politicalPartyName || item.politicalPartyId}
                          </span>
                        </Table.Cell>

                        {/* Election */}
                        <Table.Cell>
                          <span className='text-paragraph-xs text-text-sub-600'>
                            {item.electionName || 'Election'}
                          </span>
                        </Table.Cell>

                        {/* Actions */}
                        <Table.Cell className='text-right'>
                          <div className='inline-flex items-center gap-1.5'>
                            <CompactButton.Root
                              type='button'
                              variant='stroke'
                              className='size-7 rounded-lg'
                              onClick={() =>
                                setCandidateModalState({ type: 'view', item })
                              }
                              title='View details'
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
                              onClick={() =>
                                setCandidateModalState({ type: 'update', item })
                              }
                              title='Edit candidate'
                            >
                              <CompactButton.Icon
                                as={RiEditLine}
                                className='size-4'
                              />
                            </CompactButton.Root>
                            <CompactButton.Root
                              type='button'
                              variant='stroke'
                              className='size-7 rounded-lg hover:text-error-base'
                              onClick={() =>
                                setCandidateModalState({ type: 'delete', item })
                              }
                              title='Delete candidate'
                            >
                              <CompactButton.Icon
                                as={RiDeleteBinLine}
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
            ) : activeModule === 'elections' ? (
              <Table.Root scrollable>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Election Name</Table.Head>
                    <Table.Head className='w-[180px]'>Election Date</Table.Head>
                    <Table.Head className='w-[180px]'>
                      Expected Turnout
                    </Table.Head>
                    <Table.Head className='w-[120px] text-right'>
                      Actions
                    </Table.Head>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {isElectionsLoading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <Table.Row key={`skeleton-election-${idx}`}>
                        <Table.Cell>
                          <Skeleton className='h-4 w-48' />
                        </Table.Cell>
                        <Table.Cell>
                          <Skeleton className='h-4 w-28' />
                        </Table.Cell>
                        <Table.Cell>
                          <Skeleton className='h-5 w-24 rounded-full' />
                        </Table.Cell>
                        <Table.Cell className='text-right'>
                          <div className='inline-flex items-center justify-end gap-1.5'>
                            <Skeleton className='size-7 rounded-lg' />
                            <Skeleton className='size-7 rounded-lg' />
                            <Skeleton className='size-7 rounded-lg' />
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  ) : filteredElections.length === 0 ? (
                    <Table.Row>
                      <Table.Cell colSpan={4} className='py-12 text-center'>
                        <p className='text-label-sm font-semibold text-text-strong-950'>
                          No elections found
                        </p>
                        <p className='text-paragraph-xs text-text-sub-600 mt-1'>
                          Try adjusting your search criteria or register a new
                          election.
                        </p>
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    filteredElections.map((item) => (
                      <Table.Row
                        key={item.id}
                        className='transition-colors hover:bg-bg-weak-50/50'
                      >
                        {/* Election Name */}
                        <Table.Cell>
                          <span className='text-label-sm font-semibold text-text-strong-950'>
                            {item.name}
                          </span>
                        </Table.Cell>

                        {/* Election Date */}
                        <Table.Cell>
                          <div className='flex items-center gap-1.5 text-text-sub-600'>
                            <RiCalendarLine className='size-3.5 text-text-soft-400 shrink-0' />
                            <span className='text-paragraph-sm'>
                              {item.electionDate || '—'}
                            </span>
                          </div>
                        </Table.Cell>

                        {/* Expected Turnout */}
                        <Table.Cell>
                          {item.expectedTurnout != null ? (
                            <Badge.Root
                              variant='lighter'
                              color='blue'
                              size='small'
                            >
                              <RiGroupLine className='size-3 shrink-0' />
                              <span>
                                {Number(item.expectedTurnout).toLocaleString()}{' '}
                                voters
                              </span>
                            </Badge.Root>
                          ) : (
                            <span className='text-paragraph-sm text-text-soft-400'>
                              —
                            </span>
                          )}
                        </Table.Cell>

                        {/* Actions */}
                        <Table.Cell className='text-right'>
                          <div className='inline-flex items-center gap-1.5'>
                            <CompactButton.Root
                              type='button'
                              variant='stroke'
                              className='size-7 rounded-lg'
                              onClick={() =>
                                setElectionModalState({ type: 'view', item })
                              }
                              title='View details'
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
                              onClick={() =>
                                setElectionModalState({ type: 'update', item })
                              }
                              title='Edit election'
                            >
                              <CompactButton.Icon
                                as={RiEditLine}
                                className='size-4'
                              />
                            </CompactButton.Root>
                            <CompactButton.Root
                              type='button'
                              variant='stroke'
                              className='size-7 rounded-lg hover:text-error-base'
                              onClick={() =>
                                setElectionModalState({ type: 'delete', item })
                              }
                              title='Delete election'
                            >
                              <CompactButton.Icon
                                as={RiDeleteBinLine}
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
            ) : (
              <Table.Root scrollable>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Party Name</Table.Head>
                    <Table.Head className='w-[160px]'>Abbreviation</Table.Head>
                    <Table.Head className='w-[120px] text-right'>
                      Actions
                    </Table.Head>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {isPoliticalPartiesLoading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <Table.Row key={`skeleton-party-${idx}`}>
                        <Table.Cell>
                          <Skeleton className='h-4 w-48' />
                        </Table.Cell>
                        <Table.Cell>
                          <Skeleton className='h-5 w-16 rounded-full' />
                        </Table.Cell>
                        <Table.Cell className='text-right'>
                          <div className='inline-flex items-center justify-end gap-1.5'>
                            <Skeleton className='size-7 rounded-lg' />
                            <Skeleton className='size-7 rounded-lg' />
                            <Skeleton className='size-7 rounded-lg' />
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  ) : filteredPoliticalParties.length === 0 ? (
                    <Table.Row>
                      <Table.Cell colSpan={3} className='py-12 text-center'>
                        <p className='text-label-sm font-semibold text-text-strong-950'>
                          No political parties found
                        </p>
                        <p className='text-paragraph-xs text-text-sub-600 mt-1'>
                          Try adjusting your search criteria or register a new
                          political party.
                        </p>
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    filteredPoliticalParties.map((item) => (
                      <Table.Row
                        key={item.id}
                        className='transition-colors hover:bg-bg-weak-50/50'
                      >
                        {/* Party Name */}
                        <Table.Cell>
                          <span className='text-label-sm font-semibold text-text-strong-950'>
                            {item.name}
                          </span>
                        </Table.Cell>

                        {/* Abbreviation */}
                        <Table.Cell>
                          {item.abbreviation ? (
                            <Badge.Root
                              variant='lighter'
                              color='gray'
                              size='small'
                            >
                              {item.abbreviation}
                            </Badge.Root>
                          ) : (
                            <span className='text-paragraph-sm text-text-soft-400'>
                              —
                            </span>
                          )}
                        </Table.Cell>

                        {/* Actions */}
                        <Table.Cell className='text-right'>
                          <div className='inline-flex items-center gap-1.5'>
                            <CompactButton.Root
                              type='button'
                              variant='stroke'
                              className='size-7 rounded-lg'
                              onClick={() =>
                                setPoliticalPartyModalState({
                                  type: 'view',
                                  item,
                                })
                              }
                              title='View details'
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
                              onClick={() =>
                                setPoliticalPartyModalState({
                                  type: 'update',
                                  item,
                                })
                              }
                              title='Edit party'
                            >
                              <CompactButton.Icon
                                as={RiEditLine}
                                className='size-4'
                              />
                            </CompactButton.Root>
                            <CompactButton.Root
                              type='button'
                              variant='stroke'
                              className='size-7 rounded-lg hover:text-error-base'
                              onClick={() =>
                                setPoliticalPartyModalState({
                                  type: 'delete',
                                  item,
                                })
                              }
                              title='Delete party'
                            >
                              <CompactButton.Icon
                                as={RiDeleteBinLine}
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
            )}
          </SetupTablePanel>
          </div>
        </main>
      </div>

      {/* Sibling Action Modals - Levels */}
      <CreateSetupModal
        open={modalState.type === 'create'}
        defaultElectionId={activeElectionId}
        onClose={() => setModalState({ type: null })}
      />

      <UpdateSetupModal
        open={modalState.type === 'update'}
        item={modalState.type === 'update' ? modalState.item : null}
        onClose={() => setModalState({ type: null })}
      />

      <ViewSetupModal
        open={modalState.type === 'view'}
        item={modalState.type === 'view' ? modalState.item : null}
        onClose={() => setModalState({ type: null })}
        onEdit={(item) => setModalState({ type: 'update', item })}
      />

      <DeleteSetupModal
        open={modalState.type === 'delete'}
        item={modalState.type === 'delete' ? modalState.item : null}
        onClose={() => setModalState({ type: null })}
      />

      {/* Sibling Action Modals - Level Mappings */}
      <CreateLevelMappingModal
        open={levelMappingModalState.type === 'create'}
        defaultElectionId={activeElectionId}
        onClose={() => setLevelMappingModalState({ type: null })}
      />

      <UpdateLevelMappingModal
        open={levelMappingModalState.type === 'update'}
        item={
          levelMappingModalState.type === 'update'
            ? levelMappingModalState.item
            : null
        }
        onClose={() => setLevelMappingModalState({ type: null })}
      />

      <ViewLevelMappingModal
        open={levelMappingModalState.type === 'view'}
        item={
          levelMappingModalState.type === 'view'
            ? levelMappingModalState.item
            : null
        }
        onClose={() => setLevelMappingModalState({ type: null })}
        onEdit={(item) => setLevelMappingModalState({ type: 'update', item })}
      />

      <DeleteLevelMappingModal
        open={levelMappingModalState.type === 'delete'}
        item={
          levelMappingModalState.type === 'delete'
            ? levelMappingModalState.item
            : null
        }
        onClose={() => setLevelMappingModalState({ type: null })}
      />

      {/* Sibling Action Modals - Candidates */}
      <CreateCandidateModal
        open={candidateModalState.type === 'create'}
        defaultElectionId={activeElectionId}
        onClose={() => setCandidateModalState({ type: null })}
      />

      <UpdateCandidateModal
        open={candidateModalState.type === 'update'}
        item={
          candidateModalState.type === 'update'
            ? candidateModalState.item
            : null
        }
        onClose={() => setCandidateModalState({ type: null })}
      />

      <ViewCandidateModal
        open={candidateModalState.type === 'view'}
        item={
          candidateModalState.type === 'view' ? candidateModalState.item : null
        }
        onClose={() => setCandidateModalState({ type: null })}
        onEdit={(item) => setCandidateModalState({ type: 'update', item })}
      />

      <DeleteCandidateModal
        open={candidateModalState.type === 'delete'}
        item={
          candidateModalState.type === 'delete'
            ? candidateModalState.item
            : null
        }
        onClose={() => setCandidateModalState({ type: null })}
      />

      {/* Sibling Action Modals - Elections */}
      <CreateElectionModal
        open={electionModalState.type === 'create'}
        onClose={() => setElectionModalState({ type: null })}
      />

      <UpdateElectionModal
        open={electionModalState.type === 'update'}
        item={
          electionModalState.type === 'update' ? electionModalState.item : null
        }
        onClose={() => setElectionModalState({ type: null })}
      />

      <ViewElectionModal
        open={electionModalState.type === 'view'}
        item={
          electionModalState.type === 'view' ? electionModalState.item : null
        }
        onClose={() => setElectionModalState({ type: null })}
        onEdit={(item) => setElectionModalState({ type: 'update', item })}
      />

      <DeleteElectionModal
        open={electionModalState.type === 'delete'}
        item={
          electionModalState.type === 'delete' ? electionModalState.item : null
        }
        onClose={() => setElectionModalState({ type: null })}
      />

      {/* Sibling Action Modals - Political Parties */}
      <CreatePoliticalPartyModal
        open={politicalPartyModalState.type === 'create'}
        onClose={() => setPoliticalPartyModalState({ type: null })}
      />

      <UpdatePoliticalPartyModal
        open={politicalPartyModalState.type === 'update'}
        item={
          politicalPartyModalState.type === 'update'
            ? politicalPartyModalState.item
            : null
        }
        onClose={() => setPoliticalPartyModalState({ type: null })}
      />

      <ViewPoliticalPartyModal
        open={politicalPartyModalState.type === 'view'}
        item={
          politicalPartyModalState.type === 'view'
            ? politicalPartyModalState.item
            : null
        }
        onClose={() => setPoliticalPartyModalState({ type: null })}
        onEdit={(item) => setPoliticalPartyModalState({ type: 'update', item })}
      />

      <DeletePoliticalPartyModal
        open={politicalPartyModalState.type === 'delete'}
        item={
          politicalPartyModalState.type === 'delete'
            ? politicalPartyModalState.item
            : null
        }
        onClose={() => setPoliticalPartyModalState({ type: null })}
      />
    </div>
  );
}
