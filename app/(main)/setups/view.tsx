'use client';

import * as React from 'react';
import type { SetupItem } from '@/services/setups';
import { RiEditLine, RiEyeLine } from '@remixicon/react';

import * as Badge from '@/components/ui/badge';
import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';
import * as StatusBadge from '@/components/ui/status-badge';

interface ViewSetupModalProps {
  item: SetupItem | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (item: SetupItem) => void;
}

export function ViewSetupModal({
  item,
  open,
  onClose,
  onEdit,
}: ViewSetupModalProps) {
  if (!item) return null;

  return (
    <Modal.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Modal.Content className='max-w-[500px]'>
        <Modal.Header
          icon={RiEyeLine}
          title={item.name}
          description={`Configuration code: ${item.code}`}
        />

        <Modal.Body className='py-5 space-y-4'>
          {/* Section 1: Overview and Badges */}
          <div className='flex items-center justify-between border-b border-stroke-soft-200 pb-3'>
            <span className='text-paragraph-xs font-medium uppercase tracking-wider text-text-soft-400'>
              Status & Category
            </span>
            <div className='flex items-center gap-2'>
              <Badge.Root variant='lighter' color='blue' size='small'>
                {item.category}
              </Badge.Root>
              <StatusBadge.Root
                status={item.isEnabled ? 'completed' : 'disabled'}
                variant='stroke'
              >
                <StatusBadge.Dot />
                {item.isEnabled ? 'Active' : 'Disabled'}
              </StatusBadge.Root>
            </div>
          </div>

          {/* Section 2: Code and Name */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <span className='text-paragraph-xs text-text-sub-600'>Code</span>
              <p className='font-mono text-label-sm font-semibold text-text-strong-950'>
                {item.code}
              </p>
            </div>
            <div>
              <span className='text-paragraph-xs text-text-sub-600'>
                Linked Records
              </span>
              <p className='text-label-sm font-semibold text-text-strong-950'>
                {item.itemCount || 0} active assets
              </p>
            </div>
          </div>

          {/* Section 3: Description */}
          <div>
            <span className='text-paragraph-xs text-text-sub-600'>
              Description
            </span>
            <div className='mt-1 rounded-xl bg-bg-weak-50 p-3 text-paragraph-sm text-text-strong-950'>
              {item.description ||
                'No description provided for this setup item.'}
            </div>
          </div>

          {item.updatedAt && (
            <div className='text-right text-[11px] text-text-soft-400'>
              Last modified: {item.updatedAt}
            </div>
          )}
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
              Edit Setup
            </Button.Root>
          )}
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

export default ViewSetupModal;
