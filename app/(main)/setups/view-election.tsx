'use client';

import * as React from 'react';
import type { ElectionItem } from '@/services/elections';
import {
  RiCheckLine,
  RiEditLine,
  RiEyeLine,
  RiFileCopyLine,
  RiGovernmentLine,
} from '@remixicon/react';

import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';

interface ViewElectionModalProps {
  item: ElectionItem | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (item: ElectionItem) => void;
}

export function ViewElectionModal({
  item,
  open,
  onClose,
  onEdit,
}: ViewElectionModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!item) return null;

  const handleCopyId = () => {
    if (!item.id) return;
    navigator.clipboard.writeText(item.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Modal.Content className='max-w-[480px]'>
        <Modal.Header
          icon={RiEyeLine}
          title={item.name}
          description='Election Setup Record'
        />

        <Modal.Body className='py-5 space-y-4'>
          {/* Election Overview Box */}
          <div className='flex items-center gap-3 rounded-xl bg-bg-weak-50 p-3.5'>
            <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-base text-static-white'>
              <RiGovernmentLine className='size-5' />
            </div>
            <div className='flex flex-col truncate'>
              <span className='text-paragraph-xs font-medium text-text-sub-600'>
                Registered Title
              </span>
              <span className='text-label-sm font-semibold text-text-strong-950 truncate'>
                {item.name}
              </span>
            </div>
          </div>

          {/* Identifier Field */}
          <div className='flex flex-col gap-1.5'>
            <span className='text-paragraph-xs font-medium text-text-sub-600'>
              System Identifier (UUID)
            </span>
            <div className='flex items-center justify-between rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2'>
              <span className='font-mono text-label-xs text-text-strong-950 truncate select-all'>
                {item.id}
              </span>
              <button
                type='button'
                onClick={handleCopyId}
                className='ml-2 inline-flex items-center gap-1 text-label-xs text-text-sub-600 hover:text-primary-base transition-colors'
                title='Copy UUID'
              >
                {copied ? (
                  <>
                    <RiCheckLine className='size-3.5 text-success-base' />
                    <span className='text-success-base'>Copied</span>
                  </>
                ) : (
                  <>
                    <RiFileCopyLine className='size-3.5' />
                    <span>Copy</span>
                  </>
                )}
              </button>
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
              Edit Election
            </Button.Root>
          )}
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

export default ViewElectionModal;
