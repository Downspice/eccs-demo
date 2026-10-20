'use client';

import * as React from 'react';
import type { LevelMappingItem } from '@/services/level-mappings';
import { RiEditLine, RiEyeLine, RiNodeTree } from '@remixicon/react';

import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';

interface ViewLevelMappingModalProps {
  item: LevelMappingItem | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (item: LevelMappingItem) => void;
}

export function ViewLevelMappingModal({
  item,
  open,
  onClose,
  onEdit,
}: ViewLevelMappingModalProps) {
  if (!item) return null;

  return (
    <Modal.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Modal.Content className='max-w-[480px]'>
        <Modal.Header
          icon={RiEyeLine}
          title={item.name}
          description='Administrative Level Mapping Unit'
        />

        <Modal.Body className='py-5 space-y-4'>
          {/* Header Banner */}
          <div className='flex items-center gap-3 rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-3.5'>
            <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-alpha-10 text-primary-base'>
              <RiNodeTree className='size-5' />
            </div>
            <div className='flex flex-col min-w-0'>
              <span className='text-label-sm font-semibold text-text-strong-950 truncate'>
                {item.name}
              </span>
              <span className='text-paragraph-xs text-text-sub-600'>
                {item.levelName} • {item.electionName}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <span className='text-paragraph-xs text-text-sub-600'>
                Hierarchy Level
              </span>
              <p className='text-label-sm font-semibold text-text-strong-950 mt-0.5'>
                {item.levelName}
              </p>
            </div>
            <div>
              <span className='text-paragraph-xs text-text-sub-600'>
                Parent / Upper Unit
              </span>
              <p className='text-label-sm font-semibold text-text-strong-950 mt-0.5'>
                {item.upperLevelName || 'None (Top Level)'}
              </p>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button.Root
            type='button'
            variant='neutral'
            mode='stroke'
            size='small'
            onClick={onClose}
          >
            Close
          </Button.Root>
          {onEdit && (
            <Button.Root
              type='button'
              variant='primary'
              mode='filled'
              size='small'
              onClick={() => {
                onClose();
                onEdit(item);
              }}
            >
              <Button.Icon as={RiEditLine} />
              <span>Edit Mapping</span>
            </Button.Root>
          )}
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
