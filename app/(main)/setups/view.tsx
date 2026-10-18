'use client';

import * as React from 'react';
import type { SetupItem } from '@/services/setups';
import { RiEditLine, RiEyeLine, RiShieldCheckLine } from '@remixicon/react';

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
          title={`${item.name}: ${item.title}`}
          description={`Level Classification Code: ${item.code}`}
        />

        <Modal.Body className='py-5 space-y-4'>
          {/* Status Row */}
          <div className='flex items-center justify-between border-b border-stroke-soft-200 pb-3'>
            <span className='text-paragraph-xs font-medium uppercase tracking-wider text-text-soft-400'>
              Certification Status
            </span>
            <StatusBadge.Root
              status={item.isEnabled ? 'completed' : 'disabled'}
              variant='stroke'
            >
              <StatusBadge.Dot />
              {item.isEnabled ? 'Active & Enforced' : 'Inactive / Draft'}
            </StatusBadge.Root>
          </div>

          {/* Details Grid */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <span className='text-paragraph-xs text-text-sub-600'>
                Level Code
              </span>
              <p className='font-mono text-label-sm font-semibold text-text-strong-950'>
                {item.code}
              </p>
            </div>
            <div>
              <span className='text-paragraph-xs text-text-sub-600'>
                Control Threshold
              </span>
              <p className='text-label-sm font-semibold text-text-strong-950'>
                {item.controlsCount || 0} mandatory controls
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <span className='text-paragraph-xs text-text-sub-600'>
              Safeguarding & Scope
            </span>
            <div className='mt-1 rounded-xl bg-bg-weak-50 p-3 text-paragraph-sm text-text-strong-950'>
              {item.description || 'No description provided for this level.'}
            </div>
          </div>

          {item.updatedAt && (
            <div className='text-right text-[11px] text-text-soft-400'>
              Last updated: {item.updatedAt}
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
              Edit Level
            </Button.Root>
          )}
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

export default ViewSetupModal;
