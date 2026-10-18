'use client';

import * as React from 'react';
import { useGetSetups, type SetupItem } from '@/services/setups';
import {
  RiAddLine,
  RiDeleteBinLine,
  RiEditLine,
  RiEqualizerLine,
  RiEyeLine,
} from '@remixicon/react';

import * as Badge from '@/components/ui/badge';
import * as Button from '@/components/ui/button';
import * as StatusBadge from '@/components/ui/status-badge';
import * as Table from '@/components/ui/table';

import { CreateSetupModal } from './create';
import { DeleteSetupModal } from './delete';
import { SetupFilters, type SetupFilterState } from './filters';
import { SetupTabs, type TabItem } from './tabs';
import type { ModalState } from './types';
import { UpdateSetupModal } from './update';
import { ViewSetupModal } from './view';

const LEVEL_TABS: TabItem[] = [
  { id: 'all', label: 'All Levels' },
  { id: 'active', label: 'Active & Enforced' },
  { id: 'disabled', label: 'Draft / Target' },
];

export default function SetupsPage() {
  const { data: setups = [], isLoading } = useGetSetups();

  const [activeTab, setActiveTab] = React.useState('all');
  const [filters, setFilters] = React.useState<SetupFilterState>({
    search: '',
    status: 'all',
  });
  const [modalState, setModalState] = React.useState<ModalState>({
    type: null,
  });

  // Filtered dataset
  const filteredSetups = React.useMemo(() => {
    return setups.filter((item) => {
      // Tab filter
      if (activeTab === 'active' && !item.isEnabled) return false;
      if (activeTab === 'disabled' && item.isEnabled) return false;

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
  }, [setups, activeTab, filters]);

  // Tab counts
  const tabsWithCounts = React.useMemo(() => {
    return LEVEL_TABS.map((tab) => ({
      ...tab,
      count:
        tab.id === 'all'
          ? setups.length
          : tab.id === 'active'
            ? setups.filter((s) => s.isEnabled).length
            : setups.filter((s) => !s.isEnabled).length,
    }));
  }, [setups]);

  return (
    <div className='flex w-full flex-col'>
      {/* Page Heading - Extends from sidebar border to the other end */}
      <header className='w-full border-b border-stroke-soft-200 bg-bg-white-0 px-4 py-5 lg:px-8'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex flex-col gap-1'>
            <div className='flex items-center gap-2.5'>
              <div className='flex size-8 items-center justify-center rounded-lg bg-primary-base text-static-white'>
                <RiEqualizerLine className='size-4' />
              </div>
              <h1 className='text-title-h5 font-semibold text-text-strong-950 sm:text-title-h4'>
                System Setups
              </h1>
              <Badge.Root variant='lighter' color='blue' size='small'>
                Levels
              </Badge.Root>
            </div>
            <p className='text-paragraph-sm text-text-sub-600'>
              Configure security maturity levels, classification codes, and
              mandatory control thresholds.
            </p>
          </div>

          <div>
            <Button.Root
              variant='primary'
              mode='filled'
              size='small'
              onClick={() => setModalState({ type: 'create' })}
            >
              <Button.Icon as={RiAddLine} />
              <span>New Level</span>
            </Button.Root>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <div className='flex w-full flex-1 flex-col gap-6 px-4 py-6 pb-12 lg:px-8'>
        {/* Tabs navigation */}
        <SetupTabs
          tabs={tabsWithCounts}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Search and Filters */}
        <SetupFilters
          filters={filters}
          onChange={(updated) =>
            setFilters((prev) => ({ ...prev, ...updated }))
          }
          onReset={() => setFilters({ search: '', status: 'all' })}
        />

        {/* Main Table Content */}
        <div className='overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-xs'>
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
              {isLoading ? (
                <Table.Row>
                  <Table.Cell
                    colSpan={5}
                    className='py-12 text-center text-text-sub-600'
                  >
                    Loading levels...
                  </Table.Cell>
                </Table.Row>
              ) : filteredSetups.length === 0 ? (
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
                filteredSetups.map((item) => (
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
                      <Badge.Root variant='lighter' color='gray' size='small'>
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
                          onClick={() => setModalState({ type: 'view', item })}
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
        </div>

        {/* Sibling Action Modals */}
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
      </div>
    </div>
  );
}
