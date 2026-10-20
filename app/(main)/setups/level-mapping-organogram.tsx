'use client';

import * as React from 'react';
import type { LevelMappingItem } from '@/services/level-mappings';
import {
  RiAddLine,
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiDeleteBinLine,
  RiEditLine,
  RiEyeLine,
  RiFullscreenLine,
  RiGovernmentLine,
  RiNodeTree,
  RiSubtractLine,
  RiZoomInLine,
  RiZoomOutLine,
} from '@remixicon/react';
import { OrganizationChart } from 'primereact/organizationchart';
import type { TreeNode } from 'primereact/treenode';

import { cn } from '@/utils/cn';
import * as Badge from '@/components/ui/badge';
import * as CompactButton from '@/components/ui/compact-button';
import { Skeleton } from '@/components/ui/skeleton';

interface LevelMappingOrganogramProps {
  mappings: LevelMappingItem[];
  electionName?: string;
  isLoading?: boolean;
  onView: (item: LevelMappingItem) => void;
  onEdit: (item: LevelMappingItem) => void;
  onDelete: (item: LevelMappingItem) => void;
  onCreateSubordinate?: (parentItem: LevelMappingItem) => void;
  searchQuery?: string;
}

// Color palette mapping based on level tier name for quick visual distinction
function getLevelBadgeColor(
  levelName?: string,
): 'blue' | 'purple' | 'green' | 'orange' | 'gray' {
  if (!levelName) return 'gray';
  const lower = levelName.toLowerCase();
  if (
    lower.includes('region') ||
    lower.includes('national') ||
    lower.includes('state')
  )
    return 'purple';
  if (
    lower.includes('district') ||
    lower.includes('municipal') ||
    lower.includes('metro')
  )
    return 'blue';
  if (lower.includes('constituency') || lower.includes('zone')) return 'green';
  if (lower.includes('electoral') || lower.includes('ward')) return 'orange';
  return 'gray';
}

export function LevelMappingOrganogram({
  mappings,
  electionName,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
  onCreateSubordinate,
  searchQuery = '',
}: LevelMappingOrganogramProps) {
  const [zoom, setZoom] = React.useState<number>(1);
  const [expandedAll, setExpandedAll] = React.useState<boolean>(true);

  const handleZoomIn = () =>
    setZoom((prev) => Math.min(1.5, Math.round((prev + 0.15) * 100) / 100));
  const handleZoomOut = () =>
    setZoom((prev) => Math.max(0.6, Math.round((prev - 0.15) * 100) / 100));
  const handleResetZoom = () => setZoom(1);

  // Build the hierarchical tree data structure from flat mappings
  const chartData = React.useMemo<TreeNode[]>(() => {
    if (!mappings || mappings.length === 0) return [];

    const itemMap = new Map<string, LevelMappingItem>();
    const childrenMap = new Map<string, LevelMappingItem[]>();

    mappings.forEach((item) => {
      itemMap.set(item.id, item);
    });

    mappings.forEach((item) => {
      if (item.upper_level_id && itemMap.has(item.upper_level_id)) {
        const list = childrenMap.get(item.upper_level_id) || [];
        list.push(item);
        childrenMap.set(item.upper_level_id, list);
      }
    });

    // Recursively build tree nodes
    const buildTreeNode = (item: LevelMappingItem): TreeNode => {
      const childItems = childrenMap.get(item.id) || [];
      return {
        key: item.id,
        label: item.name,
        expanded: expandedAll,
        data: {
          item,
          childCount: childItems.length,
          isElectionRoot: false,
        },
        children: childItems.map(buildTreeNode),
      };
    };

    // Root nodes: mappings without an upper_level_id, or whose upper_level_id is not in the set
    const rootItems = mappings.filter(
      (m) => !m.upper_level_id || !itemMap.has(m.upper_level_id),
    );

    const rootNodes = rootItems.map(buildTreeNode);

    // If electionName exists, create an apex root node for the election
    if (electionName) {
      return [
        {
          key: 'election-apex-root',
          label: electionName,
          expanded: expandedAll,
          data: {
            isElectionRoot: true,
            electionName,
            totalUnits: mappings.length,
          },
          children: rootNodes,
        },
      ];
    }

    return rootNodes;
  }, [mappings, electionName, expandedAll]);

  // Custom node template rendering
  const nodeTemplate = (node: TreeNode) => {
    if (!node.data) return null;

    // Apex Election Node
    if (node.data.isElectionRoot) {
      return (
        <div className='flex flex-col items-center gap-2 rounded-2xl bg-bg-white-0 p-4 shadow-regular-sm ring-1 ring-inset ring-stroke-soft-200 transition-all hover:shadow-regular-md'>
          <div className='flex items-center gap-2'>
            <div className='flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary-base/10 text-primary-base'>
              <RiGovernmentLine className='size-4' />
            </div>
            <div className='text-left'>
              <span className='block text-paragraph-xs font-medium uppercase tracking-wider text-text-soft-400'>
                Election Territory Root
              </span>
              <span className='block text-label-sm font-semibold text-text-strong-950'>
                {node.data.electionName}
              </span>
            </div>
          </div>
          <div className='flex items-center gap-2 border-t border-stroke-soft-200/60 pt-2 text-paragraph-xs text-text-sub-600'>
            <Badge.Root variant='lighter' color='blue' size='small'>
              <RiNodeTree className='size-3 shrink-0' />
              <span>
                {node.data.totalUnits} mapped{' '}
                {node.data.totalUnits === 1 ? 'unit' : 'units'}
              </span>
            </Badge.Root>
          </div>
        </div>
      );
    }

    const item: LevelMappingItem = node.data.item;
    const childCount: number = node.data.childCount || 0;
    const isMatchingSearch =
      searchQuery.trim() &&
      item.name.toLowerCase().includes(searchQuery.toLowerCase());

    const badgeColor = getLevelBadgeColor(item.levelName);

    return (
      <div
        className={cn(
          'group relative w-60 rounded-xl bg-bg-white-0 p-3.5 text-left shadow-regular-xs ring-1 ring-inset transition-all duration-200',
          'hover:shadow-regular-md hover:ring-stroke-sub-300',
          isMatchingSearch
            ? 'ring-2 ring-primary-base bg-primary-base/[0.03]'
            : 'ring-stroke-soft-200',
        )}
      >
        {/* Top meta row: Level badge + child count */}
        <div className='flex items-center justify-between gap-1.5'>
          <Badge.Root variant='lighter' color={badgeColor} size='small'>
            {item.levelName || 'Unit'}
          </Badge.Root>

          {childCount > 0 ? (
            <span className='inline-flex items-center gap-1 text-[11px] font-medium text-text-soft-400 group-hover:text-text-sub-600 transition-colors'>
              <RiNodeTree className='size-3' />
              <span>{childCount}</span>
            </span>
          ) : (
            <span className='text-[10px] text-text-disabled-300 font-medium'>
              Leaf
            </span>
          )}
        </div>

        {/* Unit title */}
        <div className='mt-2.5'>
          <h4
            className={cn(
              'truncate text-label-sm font-semibold text-text-strong-950',
              isMatchingSearch && 'text-primary-base font-bold',
            )}
            title={item.name}
          >
            {item.name}
          </h4>
          {item.upperLevelName ? (
            <p
              className='mt-0.5 truncate text-paragraph-xs text-text-sub-600'
              title={`Parent: ${item.upperLevelName}`}
            >
              <span className='text-text-soft-400'>under </span>
              {item.upperLevelName}
            </p>
          ) : (
            <p className='mt-0.5 text-paragraph-xs text-text-soft-400'>
              Root Jurisdiction
            </p>
          )}
        </div>

        {/* Action Toolbar */}
        <div className='mt-3 flex items-center justify-between border-t border-stroke-soft-200/60 pt-2'>
          <div className='flex items-center gap-1'>
            <CompactButton.Root
              type='button'
              variant='stroke'
              className='size-6 rounded-md'
              onClick={(e) => {
                e.stopPropagation();
                onView(item);
              }}
              title='View unit details'
            >
              <CompactButton.Icon as={RiEyeLine} className='size-3.5' />
            </CompactButton.Root>

            <CompactButton.Root
              type='button'
              variant='stroke'
              className='size-6 rounded-md hover:text-primary-base'
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              title='Edit unit'
            >
              <CompactButton.Icon as={RiEditLine} className='size-3.5' />
            </CompactButton.Root>

            <CompactButton.Root
              type='button'
              variant='stroke'
              className='size-6 rounded-md hover:text-error-base'
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item);
              }}
              title='Delete unit'
            >
              <CompactButton.Icon as={RiDeleteBinLine} className='size-3.5' />
            </CompactButton.Root>
          </div>

          {onCreateSubordinate && (
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                onCreateSubordinate(item);
              }}
              className='inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-text-sub-600 hover:bg-bg-weak-50 hover:text-primary-base transition-colors'
              title='Add subordinate unit under this'
            >
              <RiAddLine className='size-3' />
              <span>Sub-unit</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center p-12'>
        <div className='flex flex-col items-center gap-3'>
          <Skeleton className='h-20 w-56 rounded-2xl' />
          <div className='h-8 w-0.5 bg-stroke-soft-200' />
          <div className='grid grid-cols-3 gap-6'>
            <Skeleton className='h-28 w-52 rounded-xl' />
            <Skeleton className='h-28 w-52 rounded-xl' />
            <Skeleton className='h-28 w-52 rounded-xl' />
          </div>
        </div>
      </div>
    );
  }

  if (mappings.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center'>
        <div className='flex size-12 items-center justify-center rounded-2xl bg-bg-weak-50 text-text-sub-600 ring-1 ring-inset ring-stroke-soft-200'>
          <RiNodeTree className='size-6' />
        </div>
        <p className='mt-3 text-label-sm font-semibold text-text-strong-950'>
          No hierarchy mappings found
        </p>
        <p className='mt-1 max-w-sm text-paragraph-xs text-text-sub-600'>
          Register territorial units and connect them into a parent-child
          jurisdictional hierarchy to view the organogram.
        </p>
      </div>
    );
  }

  return (
    <div className='relative flex flex-col w-full'>
      {/* Top Controls Bar */}
      <div className='flex items-center justify-between border-b border-stroke-soft-200 px-4 py-2.5 bg-bg-weak-50/50'>
        <div className='flex items-center gap-2'>
          <span className='text-paragraph-xs font-medium text-text-sub-600'>
            Hierarchical Organogram ({mappings.length}{' '}
            {mappings.length === 1 ? 'unit' : 'units'})
          </span>
          {searchQuery && (
            <Badge.Root variant='lighter' color='blue' size='small'>
              Filtering by &quot;{searchQuery}&quot;
            </Badge.Root>
          )}
        </div>

        {/* Zoom & Expansion controls */}
        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={() => setExpandedAll((prev) => !prev)}
            className='inline-flex items-center gap-1 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-2 py-1 text-paragraph-xs font-medium text-text-sub-600 shadow-regular-xs hover:bg-bg-weak-50 hover:text-text-strong-950 transition-colors'
          >
            {expandedAll ? (
              <>
                <RiSubtractLine className='size-3.5' />
                <span>Collapse All</span>
              </>
            ) : (
              <>
                <RiAddLine className='size-3.5' />
                <span>Expand All</span>
              </>
            )}
          </button>

          <div className='h-4 w-px bg-stroke-soft-200' />

          {/* Zoom Controls */}
          <div className='inline-flex items-center gap-1 rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-0.5 shadow-regular-xs'>
            <button
              type='button'
              onClick={handleZoomOut}
              disabled={zoom <= 0.6}
              className='flex size-6 items-center justify-center rounded text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 disabled:opacity-40 transition-colors'
              title='Zoom Out'
            >
              <RiZoomOutLine className='size-3.5' />
            </button>
            <button
              type='button'
              onClick={handleResetZoom}
              className='px-1.5 py-0.5 text-[11px] font-semibold text-text-sub-600 hover:text-text-strong-950 transition-colors'
              title='Reset Zoom'
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type='button'
              onClick={handleZoomIn}
              disabled={zoom >= 1.5}
              className='flex size-6 items-center justify-center rounded text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 disabled:opacity-40 transition-colors'
              title='Zoom In'
            >
              <RiZoomInLine className='size-3.5' />
            </button>
          </div>
        </div>
      </div>

      {/* Organogram Chart Canvas Area */}
      <div className='relative min-h-[500px] max-h-[750px] w-full overflow-auto p-8 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]'>
        <div
          className='align-ui-orgchart flex justify-center transition-transform duration-200 ease-out origin-top'
          style={{ transform: `scale(${zoom})` }}
        >
          <OrganizationChart
            value={chartData}
            nodeTemplate={nodeTemplate}
            className='w-full'
          />
        </div>
      </div>
    </div>
  );
}

export default LevelMappingOrganogram;
