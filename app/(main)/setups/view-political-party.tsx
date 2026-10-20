'use client';

import * as React from 'react';
import type { PoliticalPartyItem } from '@/services/political-parties';
import { RiEditLine, RiEyeLine, RiFlagLine } from '@remixicon/react';

import * as Badge from '@/components/ui/badge';
import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';

interface ViewPoliticalPartyModalProps {
  item: PoliticalPartyItem | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (item: PoliticalPartyItem) => void;
}

export function ViewPoliticalPartyModal({
  item,
  open,
  onClose,
  onEdit,
}: ViewPoliticalPartyModalProps) {
  if (!item) return null;

  return (
    <Modal.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Modal.Content className='max-w-[480px]'>
        <Modal.Header
          icon={RiEyeLine}
          title={item.name}
          description='Political Party Record Details'
        />

        <Modal.Body className='py-5 space-y-4'>
          {/* Party Overview Box */}
          <div className='flex items-center gap-3 rounded-xl bg-bg-weak-50 p-3.5'>
            <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-base text-static-white'>
              <RiFlagLine className='size-5' />
            </div>
            <div className='flex flex-col truncate'>
              <span className='text-paragraph-xs font-medium text-text-sub-600'>
                Party Name
              </span>
              <span className='text-label-sm font-semibold text-text-strong-950 truncate'>
                {item.name}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className='grid grid-cols-1 gap-3'>
            <span className='text-paragraph-xs font-medium text-text-sub-600'>
              Abbreviation
            </span>
            <div className='mt-0.5'>
              {item.abbreviation ? (
                <Badge.Root variant='lighter' color='gray' size='small'>
                  {item.abbreviation}
                </Badge.Root>
              ) : (
                <span className='text-label-sm font-semibold text-text-strong-950'>
                  —
                </span>
              )}
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
              Edit Party
            </Button.Root>
          )}
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

export default ViewPoliticalPartyModal;
