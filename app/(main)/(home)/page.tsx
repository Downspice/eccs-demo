'use client';

import Link from 'next/link';
import {
  RiApps2Line,
  RiArrowRightLine,
  RiArrowRightUpLine,
  RiCheckLine,
  RiCpuLine,
  RiDatabase2Line,
  RiExchangeLine,
  RiFlashlightLine,
  RiPulseLine,
  RiServerLine,
  RiShieldCheckLine,
} from '@remixicon/react';

import * as Button from '@/components/ui/button';
import Header from '@/components/header';

export default function PageHome() {
  const metrics = [
    {
      label: 'System Status',
      value: 'Operational',
      change: '99.99% uptime',
      icon: RiPulseLine,
      color: 'text-success-base',
      bgColor: 'bg-success-base/10',
    },
    {
      label: 'Core Services',
      value: '14 Active',
      change: 'All clusters synced',
      icon: RiServerLine,
      color: 'text-primary-base',
      bgColor: 'bg-primary-base/10',
    },
    {
      label: 'API Gateway',
      value: '18 ms',
      change: 'Sub-second response',
      icon: RiFlashlightLine,
      color: 'text-warning-base',
      bgColor: 'bg-warning-base/10',
    },
    {
      label: 'Security & Access',
      value: 'Enforced',
      change: 'ECCS Level 1 Certified',
      icon: RiShieldCheckLine,
      color: 'text-success-base',
      bgColor: 'bg-success-base/10',
    },
  ];

  const modules = [
    {
      title: 'Cargo & Freight Dispatch',
      desc: 'Real-time telemetry, load tracking, and automated route dispatching.',
      status: 'Ready',
      icon: RiExchangeLine,
      tags: ['Dispatch', 'Telemetry', 'Routing'],
    },
    {
      title: 'Commerce Transaction Engine',
      desc: 'High-throughput order processing, clearing, and multi-currency billing.',
      status: 'Ready',
      icon: RiDatabase2Line,
      tags: ['Billing', 'Transactions', 'Settlement'],
    },
    {
      title: 'Supply Chain & Inventory Hub',
      desc: 'Centralized manifest management and distributed warehouse synchronization.',
      status: 'Configured',
      icon: RiCpuLine,
      tags: ['Inventory', 'Warehouses', 'Manifest'],
    },
    {
      title: 'Stock Template Application',
      desc: 'Original marketing & sales dashboard, products list, analytics, and orders.',
      status: 'Available at /stock-app',
      icon: RiApps2Line,
      tags: ['Template', 'Demo', 'Marketing'],
      href: '/stock-app',
      highlight: true,
    },
  ];

  return (
    <>
      <Header
        icon={
          <div className='flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-base text-static-white shadow-regular-xs'>
            <RiCpuLine className='size-6' />
          </div>
        }
        title='ECCS Platform'
        description='Electronic Cargo & Commerce System — Operations & Service Console'
      >
        <Button.Root variant='neutral' mode='stroke' asChild>
          <Link href='/stock-app' className='flex items-center gap-1.5'>
            <Button.Icon as={RiApps2Line} />
            View Stock App (/stock-app)
          </Link>
        </Button.Root>
      </Header>

      <div className='flex flex-col gap-6 px-4 pb-8 lg:px-8'>
        {/* Banner notifying about the stock app separation */}
        <div className='relative overflow-hidden rounded-2xl border border-primary-base/20 bg-gradient-to-r from-primary-base/5 via-primary-base/10 to-transparent p-6 shadow-regular-xs'>
          <div className='relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center'>
            <div className='space-y-1.5'>
              <div className='inline-flex items-center gap-2 rounded-full bg-primary-base/10 px-3 py-1 text-label-xs font-semibold text-primary-base'>
                <RiCheckLine className='size-3.5' />
                Stock Template Relocated
              </div>
              <h2 className='text-label-lg text-text-strong-950'>
                All stock dashboard components are now hosted at{' '}
                <span className='font-mono font-semibold text-primary-base'>
                  /stock-app
                </span>
              </h2>
              <p className='max-w-2xl text-paragraph-sm text-text-sub-600'>
                The original template demo widgets, analytics graphs, product listings, and
                order management have been isolated to the <code className='rounded bg-bg-weak-50 px-1.5 py-0.5 text-text-strong-950'>/stock-app</code> route, leaving this root workspace clean and primed for ECCS development.
              </p>
            </div>
            <div className='flex shrink-0 items-center gap-3'>
              <Button.Root variant='primary' mode='filled' asChild>
                <Link href='/stock-app' className='flex items-center gap-2'>
                  Launch Stock App
                  <Button.Icon as={RiArrowRightLine} />
                </Link>
              </Button.Root>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {metrics.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className='flex flex-col justify-between rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-regular-xs'
              >
                <div className='flex items-center justify-between'>
                  <span className='text-label-sm text-text-soft-400'>
                    {item.label}
                  </span>
                  <div
                    className={`flex size-9 items-center justify-center rounded-xl ${item.bgColor} ${item.color}`}
                  >
                    <Icon className='size-5' />
                  </div>
                </div>
                <div className='mt-4 space-y-1'>
                  <div className='text-heading-sm font-semibold text-text-strong-950'>
                    {item.value}
                  </div>
                  <div className='text-paragraph-xs text-text-sub-600'>
                    {item.change}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Core Modules Grid */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-label-lg font-semibold text-text-strong-950'>
                ECCS Core Modules
              </h3>
              <p className='text-paragraph-sm text-text-sub-600'>
                Integrated components and application subsystems.
              </p>
            </div>
          </div>

          <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
            {modules.map((mod, i) => {
              const Icon = mod.icon;
              return (
                <div
                  key={i}
                  className={`flex flex-col justify-between rounded-2xl border p-6 shadow-regular-xs transition-all duration-200 ${
                    mod.highlight
                      ? 'border-primary-base/30 bg-primary-base/[0.02] hover:border-primary-base/50'
                      : 'border-stroke-soft-200 bg-bg-white-0 hover:border-stroke-sub-300'
                  }`}
                >
                  <div className='space-y-3'>
                    <div className='flex items-start justify-between'>
                      <div
                        className={`flex size-11 items-center justify-center rounded-xl ${
                          mod.highlight
                            ? 'bg-primary-base text-static-white'
                            : 'bg-bg-weak-50 text-text-strong-950 ring-1 ring-inset ring-stroke-soft-200'
                        }`}
                      >
                        <Icon className='size-5' />
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-label-xs font-medium ${
                          mod.highlight
                            ? 'bg-primary-base/10 text-primary-base'
                            : 'bg-bg-weak-50 text-text-sub-600'
                        }`}
                      >
                        {mod.status}
                      </span>
                    </div>

                    <div>
                      <h4 className='text-label-md font-semibold text-text-strong-950'>
                        {mod.title}
                      </h4>
                      <p className='mt-1 text-paragraph-sm text-text-sub-600'>
                        {mod.desc}
                      </p>
                    </div>

                    <div className='flex flex-wrap gap-1.5 pt-1'>
                      {mod.tags.map((t, ti) => (
                        <span
                          key={ti}
                          className='rounded-md border border-stroke-soft-200 bg-bg-weak-50 px-2 py-0.5 text-paragraph-xs text-text-soft-400'
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className='mt-6 border-t border-stroke-soft-200 pt-4'>
                    {mod.href ? (
                      <Link
                        href={mod.href}
                        className='inline-flex items-center gap-1.5 text-label-sm font-semibold text-primary-base hover:underline'
                      >
                        Open Subsystem
                        <RiArrowRightUpLine className='size-4' />
                      </Link>
                    ) : (
                      <span className='inline-flex items-center gap-1.5 text-label-xs text-text-soft-400'>
                        <span className='inline-block size-2 rounded-full bg-success-base' />
                        Connected to ECCS Backbone
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
