'use client';

import * as React from 'react';
import type { LevelMappingItem } from '@/services/level-mappings';
import type { LevelItem } from '@/services/levels';
import {
  RiAddLine,
  RiDeleteBinLine,
  RiEditLine,
  RiEyeLine,
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
  levels?: LevelItem[];
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
  levels,
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

  // Identify the lowest level tier in this election hierarchy
  const lowestLevelInfo = React.useMemo(() => {
    let maxRank = -Infinity;
    let lowestId: string | null = null;
    let lowestName: string | null = null;

    if (levels && levels.length > 0) {
      const sorted = [...levels].sort(
        (a, b) => (a.levelRank ?? 0) - (b.levelRank ?? 0),
      );
      const lowest = sorted[sorted.length - 1];
      if (lowest) {
        maxRank = lowest.levelRank ?? 0;
        lowestId = lowest.id;
        lowestName = lowest.name ? lowest.name.trim().toLowerCase() : null;
      }
    } else if (mappings && mappings.length > 0) {
      for (const m of mappings) {
        if (typeof m.levelRank === 'number' && m.levelRank > maxRank) {
          maxRank = m.levelRank;
          lowestId = m.levelId || null;
          lowestName = m.levelName ? m.levelName.trim().toLowerCase() : null;
        }
      }
    }

    return {
      maxRank: maxRank === -Infinity ? null : maxRank,
      lowestId,
      lowestName,
    };
  }, [levels, mappings]);

  const checkIfLowestLevel = React.useCallback(
    (item: LevelMappingItem): boolean => {
      // If we have lowest level ID
      if (
        lowestLevelInfo.lowestId &&
        item.levelId &&
        item.levelId === lowestLevelInfo.lowestId
      ) {
        return true;
      }
      // If we have lowest level Name
      if (
        lowestLevelInfo.lowestName &&
        item.levelName &&
        item.levelName.trim().toLowerCase() === lowestLevelInfo.lowestName
      ) {
        return true;
      }
      // If rank matches or exceeds the maximum level rank
      if (
        lowestLevelInfo.maxRank !== null &&
        typeof item.levelRank === 'number' &&
        item.levelRank >= lowestLevelInfo.maxRank
      ) {
        return true;
      }
      return false;
    },
    [lowestLevelInfo],
  );

  const handleZoomIn = () =>
    setZoom((prev) => Math.min(1.5, Math.round((prev + 0.15) * 100) / 100));
  const handleZoomOut = () =>
    setZoom((prev) => Math.max(0.6, Math.round((prev - 0.15) * 100) / 100));
  const handleResetZoom = () => setZoom(1);

  // Build the hierarchical tree data structure ensuring all subordinates connect directly to their parent jurisdiction
  const chartData = React.useMemo<TreeNode[]>(() => {
    if (!mappings || mappings.length === 0) return [];

    const itemByIdMap = new Map<string, LevelMappingItem>();
    const itemByNameMap = new Map<string, LevelMappingItem>();
    const childrenMap = new Map<string, LevelMappingItem[]>();

    // Index all items by ID and normalized Name
    mappings.forEach((item) => {
      itemByIdMap.set(item.id, item);
      if (item.name) {
        itemByNameMap.set(item.name.trim().toLowerCase(), item);
      }
    });

    // Helper to find the parent item by upper_level_id OR upperLevelName
    const getParentItem = (
      item: LevelMappingItem,
    ): LevelMappingItem | undefined => {
      // 1. Try matching by upper_level_id
      if (item.upper_level_id && itemByIdMap.has(item.upper_level_id)) {
        const parent = itemByIdMap.get(item.upper_level_id);
        if (parent && parent.id !== item.id) return parent;
      }
      // 2. Try matching by upperLevelName (backend often provides the name of the parent)
      if (
        item.upperLevelName &&
        itemByNameMap.has(item.upperLevelName.trim().toLowerCase())
      ) {
        const parent = itemByNameMap.get(
          item.upperLevelName.trim().toLowerCase(),
        );
        if (parent && parent.id !== item.id) return parent;
      }
      return undefined;
    };

    // Attach each child jurisdiction directly to its parent jurisdiction's bucket
    mappings.forEach((item) => {
      const parent = getParentItem(item);
      if (parent && parent.id !== item.id) {
        const list = childrenMap.get(parent.id) || [];
        list.push(item);
        childrenMap.set(parent.id, list);
      }
    });

    // Recursively build tree nodes from parent down to leaf units
    const buildTreeNode = (item: LevelMappingItem): TreeNode => {
      const childItems = childrenMap.get(item.id) || [];
      return {
        key: item.id,
        label: item.name,
        expanded: expandedAll,
        data: {
          item,
          childCount: childItems.length,
          parent: getParentItem(item),
        },
        children: childItems.map(buildTreeNode),
      };
    };

    // Root nodes: mappings that have NO parent jurisdiction in the hierarchy
    const rootItems = mappings.filter((m) => !getParentItem(m));

    // Sort roots alphabetically by name for consistent layout
    rootItems.sort((a, b) => a.name.localeCompare(b.name));

    return rootItems.map(buildTreeNode);
  }, [mappings, expandedAll]);

  // Custom node template rendering for each jurisdiction card
  const nodeTemplate = (node: TreeNode) => {
    if (!node.data || !node.data.item) return null;

    const item: LevelMappingItem = node.data.item;
    const parent: LevelMappingItem | undefined = node.data.parent;
    const childCount: number = node.data.childCount || 0;
    const isLowestLevel = checkIfLowestLevel(item);
    const isMatchingSearch =
      Boolean(searchQuery.trim()) &&
      item.name.toLowerCase().includes(searchQuery.toLowerCase());

    const badgeColor = getLevelBadgeColor(item.levelName);

    return (
      <div
        className={cn(
          'group relative w-60 rounded-xl bg-bg-white-0 p-3.5 text-left shadow-regular-xs ring-1 ring-inset transition-all duration-200',
          'hover:shadow-regular-md hover:ring-stroke-sub-300',
          isMatchingSearch
            ? 'ring-2 ring-primary-base bg-primary-base/[0.04]'
            : 'ring-stroke-soft-200',
        )}
      >
        {/* Top meta row: Level badge + child count */}
        <div className='flex items-center justify-between gap-1.5'>
          <Badge.Root variant='lighter' color={badgeColor} size='small'>
            {item.levelName || 'Jurisdiction'}
          </Badge.Root>

          {childCount > 0 ? (
            <span
              className='inline-flex items-center gap-1 text-[11px] font-medium text-text-sub-600 transition-colors'
              title={`${childCount} sub-jurisdictions connected`}
            >
              <RiNodeTree className='size-3 text-primary-base' />
              <span>{childCount}</span>
            </span>
          ) : isLowestLevel ? (
            <span
              className='text-[10px] text-text-soft-400 font-medium'
              title='Lowest level tier in the election hierarchy'
            >
              Lowest Tier
            </span>
          ) : (
            <span className='text-[10px] text-text-disabled-300 font-medium'>
              No sub-units
            </span>
          )}
        </div>

        {/* Unit title & Parent indicator */}
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
          {parent || item.upperLevelName ? (
            <p
              className='mt-0.5 truncate text-paragraph-xs text-text-sub-600'
              title={`Parent Jurisdiction: ${parent?.name || item.upperLevelName}`}
            >
              <span className='text-text-soft-400'>under </span>
              <span className='font-medium text-text-sub-600'>
                {parent?.name || item.upperLevelName}
              </span>
            </p>
          ) : (
            <p className='mt-0.5 text-paragraph-xs font-medium text-primary-base'>
              Top-Level Jurisdiction
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

          {onCreateSubordinate && !isLowestLevel && (
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                onCreateSubordinate(item);
              }}
              className='inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-text-sub-600 hover:bg-bg-weak-50 hover:text-primary-base transition-colors'
              title={`Add subordinate unit under ${item.name}`}
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
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-stroke-soft-200 px-4 py-2.5 bg-bg-weak-50/50'>
        <div className='flex items-center gap-2'>
          {electionName && (
            <div className='flex items-center gap-1.5 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-2.5 py-1 shadow-regular-xs'>
              <RiGovernmentLine className='size-3.5 text-primary-base' />
              <span className='text-paragraph-xs font-semibold text-text-strong-950'>
                {electionName}
              </span>
            </div>
          )}
          <span className='text-paragraph-xs font-medium text-text-sub-600'>
            {mappings.length} {mappings.length === 1 ? 'unit' : 'jurisdictions'}{' '}
            mapped
          </span>
          {searchQuery && (
            <Badge.Root variant='lighter' color='blue' size='small'>
              Highlighting &quot;{searchQuery}&quot;
            </Badge.Root>
          )}
        </div>

        {/* Zoom & Expansion controls */}
        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={() => setExpandedAll((prev) => !prev)}
            className='inline-flex items-center gap-1 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-2.5 py-1 text-paragraph-xs font-medium text-text-sub-600 shadow-regular-xs hover:bg-bg-weak-50 hover:text-text-strong-950 transition-colors'
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
