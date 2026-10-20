'use client';

import * as React from 'react';
import type { LevelItem } from '@/services/levels';
import { RiEditLine, RiEyeLine, RiShieldCheckLine } from '@remixicon/react';

import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';
import * as StatusBadge from '@/components/ui/status-badge';

interface ViewSetupModalProps {
  item: LevelItem | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (item: LevelItem) => void;
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
          description={`Level Rank: ${item.levelRank ?? 1}`}
        />

        <Modal.Body className='py-5 space-y-4'>
          {/* Details Grid */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <span className='text-paragraph-xs text-text-sub-600'>
                Level Rank
              </span>
              <p className='text-label-sm font-semibold text-text-strong-950 mt-0.5'>
                Level {item.levelRank ?? 1}
              </p>
            </div>
            <div>
              <span className='text-paragraph-xs text-text-sub-600'>
                Associated Election
              </span>
              <p className='text-label-sm font-semibold text-text-strong-950 mt-0.5'>
                {item.electionName || item.electionId || 'Not specified'}
              </p>
            </div>
          </div>

          {/* Unique Identifier */}
          <div>
            <span className='text-paragraph-xs text-text-sub-600'>
              Level UUID
            </span>
            <p className='font-mono text-label-xs font-semibold text-text-sub-600 mt-0.5 break-all'>
              {item.id}
            </p>
          </div>

          {/* Description */}
          <div>
            <span className='text-paragraph-xs text-text-sub-600'>
              Description
            </span>
            <div className='mt-1 rounded-xl bg-bg-weak-50 p-3 text-paragraph-sm text-text-strong-950'>
              {item.description || 'No description provided for this level.'}
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
              Edit Level
            </Button.Root>
          )}
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

export default ViewSetupModal;
export { ViewElectionModal } from './view-election';
export { ViewPoliticalPartyModal } from './view-political-party';
