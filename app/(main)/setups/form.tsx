'use client';

import * as React from 'react';

import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Switch from '@/components/ui/switch';
import * as Textarea from '@/components/ui/textarea';

import type { SetupFormData } from './types';

interface SetupFormProps {
  formData: SetupFormData;
  onChange: (fields: Partial<SetupFormData>) => void;
  disabled?: boolean;
}

const CATEGORY_OPTIONS = [
  { value: 'equipment', label: 'Equipment & Assets' },
  { value: 'security', label: 'Security & Access' },
  { value: 'maintenance', label: 'Maintenance & Inspections' },
  { value: 'vendors', label: 'Vendors & Contracts' },
  { value: 'general', label: 'General & Codes' },
];

export function SetupForm({ formData, onChange, disabled }: SetupFormProps) {
  return (
    <div className='flex flex-col gap-4'>
      {/* Title / Name Field */}
      <div className='flex flex-col gap-1.5'>
        <Label.Root htmlFor='setup-name'>Setup Name</Label.Root>
        <Input.Root>
          <Input.Wrapper>
            <input
              id='setup-name'
              type='text'
              disabled={disabled}
              placeholder='e.g. Server Hardware Tier'
              value={formData.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className='w-full bg-transparent px-3 py-2 text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none disabled:opacity-50'
              required
            />
          </Input.Wrapper>
        </Input.Root>
      </div>

      {/* Code and Category Grid */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <div className='flex flex-col gap-1.5'>
          <Label.Root htmlFor='setup-code'>Unique Code</Label.Root>
          <Input.Root>
            <Input.Wrapper>
              <input
                id='setup-code'
                type='text'
                disabled={disabled}
                placeholder='e.g. HW-SRV'
                value={formData.code}
                onChange={(e) =>
                  onChange({ code: e.target.value.toUpperCase() })
                }
                className='w-full bg-transparent px-3 py-2 font-mono text-paragraph-sm uppercase text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none disabled:opacity-50'
                required
              />
            </Input.Wrapper>
          </Input.Root>
        </div>

        <div className='flex flex-col gap-1.5'>
          <Label.Root htmlFor='setup-category'>Category Group</Label.Root>
          <div className='relative'>
            <select
              id='setup-category'
              disabled={disabled}
              value={formData.category}
              onChange={(e) => onChange({ category: e.target.value })}
              className='h-10 w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 text-paragraph-sm text-text-strong-950 shadow-xs focus:border-stroke-strong-950 focus:outline-none disabled:opacity-50'
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Description Field */}
      <div className='flex flex-col gap-1.5'>
        <Label.Root htmlFor='setup-desc'>Description</Label.Root>
        <Textarea.Root
          id='setup-desc'
          simple
          disabled={disabled}
          placeholder='Detailed purpose, classification criteria, or auditing notes...'
          value={formData.description || ''}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={3}
        />
      </div>

      {/* Active Status Switch */}
      <div className='mt-1 flex items-center justify-between rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-3'>
        <div className='flex flex-col'>
          <span className='text-label-sm font-medium text-text-strong-950'>
            Enable Setup Classification
          </span>
          <span className='text-paragraph-xs text-text-sub-600'>
            When active, this classification is available across all forms and
            reporting.
          </span>
        </div>
        <Switch.Root
          checked={formData.isEnabled}
          onCheckedChange={(checked) => onChange({ isEnabled: checked })}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
