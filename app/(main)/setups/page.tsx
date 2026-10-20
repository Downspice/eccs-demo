'use client';

import * as React from 'react';
import { useGetElections, type ElectionItem } from '@/services/elections';
import { useGetLevels, type LevelItem } from '@/services/levels';
import {
  useGetPoliticalParties,
  type PoliticalPartyItem,
} from '@/services/political-parties';
import {
  RiAddLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiEditLine,
  RiEqualizerLine,
  RiEyeLine,
  RiFlagLine,
  RiGovernmentLine,
  RiSearchLine,
} from '@remixicon/react';

import * as Badge from '@/components/ui/badge';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as StatusBadge from '@/components/ui/status-badge';
import * as Table from '@/components/ui/table';

import {
  CreateElectionModal,
  CreatePoliticalPartyModal,
  CreateSetupModal,
} from './create';
import {
  DeleteElectionModal,
  DeletePoliticalPartyModal,
  DeleteSetupModal,
} from './delete';
import { SetupFilters, type SetupFilterState } from './filters';
import { SetupTabs, type SetupModuleItem } from './tabs';
import type {
  ElectionModalState,
  ModalState,
  PoliticalPartyModalState,
} from './types';
import {
  UpdateElectionModal,
  UpdatePoliticalPartyModal,
  UpdateSetupModal,
} from './update';
import {
  ViewElectionModal,
  ViewPoliticalPartyModal,
  ViewSetupModal,
} from './view';

const SETUP_MODULES: SetupModuleItem[] = [
  {
    id: 'levels',
    label: 'Levels',
    description:
      'Configure security maturity levels, classification codes, and mandatory control thresholds.',
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
  const { data: levels = [], isLoading: isLevelsLoading } = useGetLevels();
  const { data: elections = [], isLoading: isElectionsLoading } =
    useGetElections();
  const { data: politicalParties = [], isLoading: isPoliticalPartiesLoading } =
    useGetPoliticalParties();

  const [activeModule, setActiveModule] = React.useState('levels');
  const [filters, setFilters] = React.useState<SetupFilterState>({
    search: '',
    status: 'all',
  });
  const [electionSearch, setElectionSearch] = React.useState('');
  const [politicalPartySearch, setPoliticalPartySearch] = React.useState('');

  const [modalState, setModalState] = React.useState<ModalState>({
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
      if (filters.status === 'active' && !item.isEnabled) return false;
      if (filters.status === 'disabled' && item.isEnabled) return false;

      // Search filter
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesCode = item.code.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesTitle && !matchesCode && !matchesDesc)
          return false;
      }

      return true;
    });
  }, [levels, filters]);

  // Filtered dataset for Elections
  const filteredElections = React.useMemo(() => {
    if (!electionSearch.trim()) return elections;
    const query = electionSearch.toLowerCase();
    return elections.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query),
    );
  }, [elections, electionSearch]);

  // Filtered dataset for Political Parties
  const filteredPoliticalParties = React.useMemo(() => {
    if (!politicalPartySearch.trim()) return politicalParties;
    const query = politicalPartySearch.toLowerCase();
    return politicalParties.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query),
    );
  }, [politicalParties, politicalPartySearch]);

  // Modules with dynamic counts
  const modulesWithCounts = React.useMemo(() => {
    return SETUP_MODULES.map((mod) => ({
      ...mod,
      count:
        mod.id === 'levels'
          ? levels.length
          : mod.id === 'elections'
            ? elections.length
            : mod.id === 'political-party'
              ? politicalParties.length
              : undefined,
    }));
  }, [levels.length, elections.length, politicalParties.length]);

  return (
    <div className='flex w-full flex-col'>
      {/* Page Heading - Extends from sidebar border to the other end */}
      <header className='w-full border-b border-stroke-soft-200 bg-bg-white-0 px-4 py-5 lg:px-8'>
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
            Configure security maturity levels, elections, political party
            directories, and mandatory control thresholds.
          </p>
        </div>
      </header>

      {/* Main Two-Column Layout */}
      <div className='flex w-full flex-1 flex-col md:flex-row'>
        {/* Left Column: Setups Vertical Navigation */}
        <aside className='w-full border-b border-stroke-soft-200 bg-bg-white-0 md:w-64 md:shrink-0 md:border-b-0 md:border-r'>
          <SetupTabs
            tabs={modulesWithCounts}
            activeTab={activeModule}
            onTabChange={setActiveModule}
          />
        </aside>

        {/* Right Column: Selected Setup Module Content */}
        <main className='flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 bg-bg-weak-50/30 min-h-[calc(100vh-140px)]'>
          {/* Header of selected setup module */}
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
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

          {/* Search and Filters */}
          {activeModule === 'levels' ? (
            <SetupFilters
              filters={filters}
              onChange={(updated) =>
                setFilters((prev) => ({ ...prev, ...updated }))
              }
              onReset={() => setFilters({ search: '', status: 'all' })}
            />
          ) : activeModule === 'elections' ? (
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <div className='w-full sm:max-w-xs'>
                <Input.Root>
                  <Input.Wrapper>
                    <Input.Icon as={RiSearchLine} />
                    <input
                      type='text'
                      placeholder='Search elections or UUID...'
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
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <div className='w-full sm:max-w-xs'>
                <Input.Root>
                  <Input.Wrapper>
                    <Input.Icon as={RiSearchLine} />
                    <input
                      type='text'
                      placeholder='Search political parties or UUID...'
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
          <div className='overflow-hidden rounded-2xl bg-bg-white-0 shadow-xs'>
            {activeModule === 'levels' ? (
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.Head className='w-[120px]'>Code</Table.Head>
                    <Table.Head>Level & Classification</Table.Head>
                    <Table.Head className='w-[140px]'>Controls</Table.Head>
                    <Table.Head className='w-[160px]'>
                      Certification Status
                    </Table.Head>
                    <Table.Head className='w-[120px] text-right'>
                      Actions
                    </Table.Head>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {isLevelsLoading ? (
                    <Table.Row>
                      <Table.Cell
                        colSpan={5}
                        className='py-12 text-center text-text-sub-600'
                      >
                        Loading levels...
                      </Table.Cell>
                    </Table.Row>
                  ) : filteredLevels.length === 0 ? (
                    <Table.Row>
                      <Table.Cell colSpan={5} className='py-12 text-center'>
                        <p className='text-label-sm font-semibold text-text-strong-950'>
                          No levels found
                        </p>
                        <p className='text-paragraph-xs text-text-sub-600 mt-1'>
                          Try adjusting your search criteria or status filter.
                        </p>
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    filteredLevels.map((item) => (
                      <Table.Row
                        key={item.id}
                        className='transition-colors hover:bg-bg-weak-50/50'
                      >
                        {/* Level Code */}
                        <Table.Cell className='font-mono text-label-xs font-semibold text-text-strong-950'>
                          {item.code}
                        </Table.Cell>

                        {/* Level Name & Title & Description */}
                        <Table.Cell>
                          <div className='flex flex-col'>
                            <div className='flex items-center gap-2'>
                              <span className='text-label-sm font-semibold text-text-strong-950'>
                                {item.name}
                              </span>
                              <span className='text-text-soft-400'>•</span>
                              <span className='text-paragraph-sm font-medium text-text-sub-600'>
                                {item.title}
                              </span>
                            </div>
                            {item.description && (
                              <span className='text-paragraph-xs text-text-soft-400 line-clamp-1 mt-0.5'>
                                {item.description}
                              </span>
                            )}
                          </div>
                        </Table.Cell>

                        {/* Controls Required */}
                        <Table.Cell>
                          <Badge.Root
                            variant='lighter'
                            color='gray'
                            size='small'
                          >
                            {item.controlsCount || 0} Controls
                          </Badge.Root>
                        </Table.Cell>

                        {/* Status */}
                        <Table.Cell>
                          <StatusBadge.Root
                            status={item.isEnabled ? 'completed' : 'disabled'}
                            variant='stroke'
                          >
                            <StatusBadge.Dot />
                            {item.isEnabled
                              ? 'Active & Enforced'
                              : 'Inactive / Draft'}
                          </StatusBadge.Root>
                        </Table.Cell>

                        {/* Actions */}
                        <Table.Cell className='text-right'>
                          <div className='inline-flex items-center gap-1'>
                            <button
                              type='button'
                              onClick={() =>
                                setModalState({ type: 'view', item })
                              }
                              className='rounded-md p-1.5 text-text-soft-400 hover:bg-bg-weak-50 hover:text-text-strong-950 transition-colors'
                              title='View details'
                            >
                              <RiEyeLine className='size-4' />
                            </button>
                            <button
                              type='button'
                              onClick={() =>
                                setModalState({ type: 'update', item })
                              }
                              className='rounded-md p-1.5 text-text-soft-400 hover:bg-bg-weak-50 hover:text-primary-base transition-colors'
                              title='Edit level'
                            >
                              <RiEditLine className='size-4' />
                            </button>
                            <button
                              type='button'
                              onClick={() =>
                                setModalState({ type: 'delete', item })
                              }
                              className='rounded-md p-1.5 text-text-soft-400 hover:bg-bg-weak-50 hover:text-error-base transition-colors'
                              title='Delete level'
                            >
                              <RiDeleteBinLine className='size-4' />
                            </button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  )}
                </Table.Body>
              </Table.Root>
            ) : activeModule === 'elections' ? (
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.Head className='w-[320px]'>
                      Identifier (UUID)
                    </Table.Head>
                    <Table.Head>Election Name</Table.Head>
                    <Table.Head className='w-[120px] text-right'>
                      Actions
                    </Table.Head>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {isElectionsLoading ? (
                    <Table.Row>
                      <Table.Cell
                        colSpan={3}
                        className='py-12 text-center text-text-sub-600'
                      >
                        Loading elections...
                      </Table.Cell>
                    </Table.Row>
                  ) : filteredElections.length === 0 ? (
                    <Table.Row>
                      <Table.Cell colSpan={3} className='py-12 text-center'>
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
                        {/* System Identifier */}
                        <Table.Cell className='font-mono text-label-xs font-semibold text-text-strong-950'>
                          <span className='truncate'>{item.id}</span>
                        </Table.Cell>

                        {/* Election Name */}
                        <Table.Cell>
                          <div className='flex items-center gap-2.5'>
                            <div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-base/10 text-primary-base'>
                              <RiGovernmentLine className='size-4' />
                            </div>
                            <span className='text-label-sm font-semibold text-text-strong-950'>
                              {item.name}
                            </span>
                          </div>
                        </Table.Cell>

                        {/* Actions */}
                        <Table.Cell className='text-right'>
                          <div className='inline-flex items-center gap-1'>
                            <button
                              type='button'
                              onClick={() =>
                                setElectionModalState({ type: 'view', item })
                              }
                              className='rounded-md p-1.5 text-text-soft-400 hover:bg-bg-weak-50 hover:text-text-strong-950 transition-colors'
                              title='View details'
                            >
                              <RiEyeLine className='size-4' />
                            </button>
                            <button
                              type='button'
                              onClick={() =>
                                setElectionModalState({ type: 'update', item })
                              }
                              className='rounded-md p-1.5 text-text-soft-400 hover:bg-bg-weak-50 hover:text-primary-base transition-colors'
                              title='Edit election'
                            >
                              <RiEditLine className='size-4' />
                            </button>
                            <button
                              type='button'
                              onClick={() =>
                                setElectionModalState({ type: 'delete', item })
                              }
                              className='rounded-md p-1.5 text-text-soft-400 hover:bg-bg-weak-50 hover:text-error-base transition-colors'
                              title='Delete election'
                            >
                              <RiDeleteBinLine className='size-4' />
                            </button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  )}
                </Table.Body>
              </Table.Root>
            ) : (
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.Head className='w-[320px]'>
                      Identifier (UUID)
                    </Table.Head>
                    <Table.Head>Party Name</Table.Head>
                    <Table.Head className='w-[120px] text-right'>
                      Actions
                    </Table.Head>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {isPoliticalPartiesLoading ? (
                    <Table.Row>
                      <Table.Cell
                        colSpan={3}
                        className='py-12 text-center text-text-sub-600'
                      >
                        Loading political parties...
                      </Table.Cell>
                    </Table.Row>
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
                        {/* System Identifier */}
                        <Table.Cell className='font-mono text-label-xs font-semibold text-text-strong-950'>
                          <span className='truncate'>{item.id}</span>
                        </Table.Cell>

                        {/* Party Name */}
                        <Table.Cell>
                          <div className='flex items-center gap-2.5'>
                            <div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-base/10 text-primary-base'>
                              <RiFlagLine className='size-4' />
                            </div>
                            <span className='text-label-sm font-semibold text-text-strong-950'>
                              {item.name}
                            </span>
                          </div>
                        </Table.Cell>

                        {/* Actions */}
                        <Table.Cell className='text-right'>
                          <div className='inline-flex items-center gap-1'>
                            <button
                              type='button'
                              onClick={() =>
                                setPoliticalPartyModalState({
                                  type: 'view',
                                  item,
                                })
                              }
                              className='rounded-md p-1.5 text-text-soft-400 hover:bg-bg-weak-50 hover:text-text-strong-950 transition-colors'
                              title='View details'
                            >
                              <RiEyeLine className='size-4' />
                            </button>
                            <button
                              type='button'
                              onClick={() =>
                                setPoliticalPartyModalState({
                                  type: 'update',
                                  item,
                                })
                              }
                              className='rounded-md p-1.5 text-text-soft-400 hover:bg-bg-weak-50 hover:text-primary-base transition-colors'
                              title='Edit party'
                            >
                              <RiEditLine className='size-4' />
                            </button>
                            <button
                              type='button'
                              onClick={() =>
                                setPoliticalPartyModalState({
                                  type: 'delete',
                                  item,
                                })
                              }
                              className='rounded-md p-1.5 text-text-soft-400 hover:bg-bg-weak-50 hover:text-error-base transition-colors'
                              title='Delete party'
                            >
                              <RiDeleteBinLine className='size-4' />
                            </button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  )}
                </Table.Body>
              </Table.Root>
            )}
          </div>
        </main>
      </div>

      {/* Sibling Action Modals - Levels */}
      <CreateSetupModal
        open={modalState.type === 'create'}
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
