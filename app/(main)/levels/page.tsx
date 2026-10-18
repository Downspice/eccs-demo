'use client';

import * as React from 'react';
import {
  RiArrowRightLine,
  RiCheckboxCircleFill,
  RiCheckLine,
  RiFileCheckLine,
  RiInformationLine,
  RiLockLine,
  RiShieldCheckLine,
  RiShieldFlashLine,
  RiSparklingFill,
  RiTimeLine,
} from '@remixicon/react';

import * as Badge from '@/components/ui/badge';
import * as Button from '@/components/ui/button';
import * as ProgressBar from '@/components/ui/progress-bar';

interface LevelItem {
  id: number;
  name: string;
  code: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'upcoming' | 'locked';
  progress: number;
  totalControls: number;
  passedControls: number;
  badgeText: string;
  badgeColor: 'green' | 'blue' | 'gray' | 'purple';
  requirements: { text: string; done: boolean }[];
}

const levelsData: LevelItem[] = [
  {
    id: 1,
    name: 'Level 1',
    code: 'LVL-01',
    title: 'Foundational Hygiene',
    description:
      'Basic safeguarding of organizational assets, access control, identity hygiene, and core endpoint protection.',
    status: 'completed',
    progress: 100,
    totalControls: 18,
    passedControls: 18,
    badgeText: 'Achieved & Certified',
    badgeColor: 'green',
    requirements: [
      {
        text: 'Multi-factor authentication (MFA) on all admin accounts',
        done: true,
      },
      {
        text: 'Role-based access control (RBAC) baseline established',
        done: true,
      },
      {
        text: 'Automated vulnerability scanning on external perimeter',
        done: true,
      },
      { text: 'Quarterly compliance log retention and archival', done: true },
    ],
  },
  {
    id: 2,
    name: 'Level 2',
    code: 'LVL-02',
    title: 'Controlled & Documented',
    description:
      'Standardized operational processes, encrypted communication protocols, incident response readiness, and supply chain review.',
    status: 'in-progress',
    progress: 82,
    totalControls: 34,
    passedControls: 28,
    badgeText: 'Active Assessment (82%)',
    badgeColor: 'blue',
    requirements: [
      {
        text: 'End-to-end data encryption in transit (TLS 1.3) and at rest (AES-256)',
        done: true,
      },
      {
        text: 'Automated CI/CD pipeline dependency scanning & SBOM export',
        done: true,
      },
      {
        text: 'Documented Disaster Recovery (DR) drills with RTO < 4h',
        done: true,
      },
      { text: 'Third-party vendor security posture verification', done: false },
      {
        text: 'Zero Trust network segmentation across production clusters',
        done: false,
      },
    ],
  },
  {
    id: 3,
    name: 'Level 3',
    code: 'LVL-03',
    title: 'Standardized & Automated',
    description:
      'Institutionalized security policies, continuous automated compliance verification, threat modeling, and unified telemetry.',
    status: 'upcoming',
    progress: 35,
    totalControls: 46,
    passedControls: 16,
    badgeText: 'In Progress (35%)',
    badgeColor: 'purple',
    requirements: [
      {
        text: 'Real-time telemetry and SIEM integration with automatic alert triage',
        done: true,
      },
      {
        text: 'Infrastructure as Code (IaC) drift detection & policy-as-code enforcement',
        done: true,
      },
      {
        text: 'Automated continuous credential rotation within 30-day windows',
        done: false,
      },
      {
        text: 'Red Team annual adversarial emulation exercise and remediation plan',
        done: false,
      },
      {
        text: 'Cryptographic key lifecycle management using certified HSMs',
        done: false,
      },
    ],
  },
  {
    id: 4,
    name: 'Level 4',
    code: 'LVL-04',
    title: 'Optimized & Continuous Assurance',
    description:
      'Proactive security posture, machine-learning assisted threat anticipation, autonomous incident containment, and executive governance.',
    status: 'locked',
    progress: 0,
    totalControls: 60,
    passedControls: 0,
    badgeText: 'Target Horizon',
    badgeColor: 'gray',
    requirements: [
      {
        text: 'Autonomous containment and sandboxing of anomalous behavioral anomalies',
        done: false,
      },
      {
        text: 'Continuous compliance audit attestation via immutable cryptographic ledgers',
        done: false,
      },
      {
        text: 'Zero Trust architectural verification with dynamic risk scoring per session',
        done: false,
      },
      {
        text: 'Board-level quarterly security governance and sovereign cloud resilience',
        done: false,
      },
    ],
  },
];

export default function LevelsPage() {
  const [selectedLevel, setSelectedLevel] = React.useState<number>(2);

  const activeLevelData =
    levelsData.find((lvl) => lvl.id === selectedLevel) || levelsData[1];

  return (
    <div className='flex flex-col gap-8 pb-12'>
      {/* Header section */}
      <div className='flex flex-col gap-4 border-b border-stroke-soft-200 pb-6 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2.5'>
            <h1 className='text-title-h5 font-semibold text-text-strong-950 sm:text-title-h4'>
              Security & Compliance Levels
            </h1>
            <Badge.Root variant='lighter' color='blue' size='small'>
              <Badge.Icon as={RiSparklingFill} />
              ECCS Framework
            </Badge.Root>
          </div>
          <p className='text-paragraph-sm text-text-sub-600'>
            Track certification milestones, control implementations, and audit
            readiness across framework tiers.
          </p>
        </div>

        <div className='flex items-center gap-3'>
          <Button.Root variant='neutral' mode='stroke' size='small'>
            <Button.Icon as={RiFileCheckLine} />
            Export Audit Report
          </Button.Root>
          <Button.Root variant='primary' mode='filled' size='small'>
            <Button.Icon as={RiShieldFlashLine} />
            Run Assessment
          </Button.Root>
        </div>
      </div>

      {/* Top metrics summary */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <div className='flex flex-col gap-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-xs'>
          <span className='text-paragraph-xs font-medium text-text-soft-400 uppercase tracking-wider'>
            Current Level
          </span>
          <div className='flex items-baseline justify-between'>
            <span className='text-title-h4 font-bold text-text-strong-950'>
              Level 2
            </span>
            <Badge.Root variant='lighter' color='blue' size='small'>
              Active
            </Badge.Root>
          </div>
          <span className='text-paragraph-xs text-text-sub-600'>
            Controlled & Documented
          </span>
        </div>

        <div className='flex flex-col gap-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-xs'>
          <span className='text-paragraph-xs font-medium text-text-soft-400 uppercase tracking-wider'>
            Target Level
          </span>
          <div className='flex items-baseline justify-between'>
            <span className='text-title-h4 font-bold text-text-strong-950'>
              Level 3
            </span>
            <Badge.Root variant='lighter' color='purple' size='small'>
              Q4 Target
            </Badge.Root>
          </div>
          <span className='text-paragraph-xs text-text-sub-600'>
            Standardized & Automated
          </span>
        </div>

        <div className='flex flex-col gap-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-xs'>
          <span className='text-paragraph-xs font-medium text-text-soft-400 uppercase tracking-wider'>
            Controls Implemented
          </span>
          <div className='flex items-baseline justify-between'>
            <span className='text-title-h4 font-bold text-text-strong-950'>
              62 / 98
            </span>
            <span className='text-label-xs font-semibold text-success-base'>
              63.2% Total
            </span>
          </div>
          <ProgressBar.Root value={63} color='green' className='mt-1' />
        </div>

        <div className='flex flex-col gap-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-xs'>
          <span className='text-paragraph-xs font-medium text-text-soft-400 uppercase tracking-wider'>
            Audit Verification
          </span>
          <div className='flex items-baseline justify-between'>
            <span className='text-title-h4 font-bold text-text-strong-950'>
              Verified
            </span>
            <Badge.Root variant='lighter' color='green' size='small'>
              <Badge.Icon as={RiCheckboxCircleFill} />
              Passed
            </Badge.Root>
          </div>
          <span className='text-paragraph-xs text-text-sub-600'>
            Next review in 42 days
          </span>
        </div>
      </div>

      {/* Levels Tier Roadmap */}
      <div className='flex flex-col gap-4'>
        <h2 className='text-title-h6 font-semibold text-text-strong-950'>
          Tier Progression Roadmap
        </h2>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
          {levelsData.map((level) => {
            const isSelected = selectedLevel === level.id;

            return (
              <div
                key={level.id}
                onClick={() => setSelectedLevel(level.id)}
                className={`group flex cursor-pointer flex-col justify-between rounded-2xl border p-5 transition-all duration-200 ${
                  isSelected
                    ? 'border-primary-base bg-bg-weak-50/50 shadow-md ring-2 ring-primary-base/20'
                    : 'border-stroke-soft-200 bg-bg-white-0 hover:border-stroke-sub-300 hover:shadow-xs'
                }`}
              >
                <div className='flex flex-col gap-3'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <span className='flex size-7 items-center justify-center rounded-lg bg-bg-soft-200 text-label-xs font-bold text-text-strong-950'>
                        {level.id}
                      </span>
                      <span className='text-label-sm font-semibold text-text-strong-950'>
                        {level.name}
                      </span>
                    </div>

                    <Badge.Root
                      variant='lighter'
                      color={level.badgeColor}
                      size='small'
                    >
                      {level.status === 'completed' && (
                        <Badge.Icon as={RiCheckLine} />
                      )}
                      {level.status === 'locked' && (
                        <Badge.Icon as={RiLockLine} />
                      )}
                      {level.badgeText}
                    </Badge.Root>
                  </div>

                  <div>
                    <h3 className='text-label-md font-semibold text-text-strong-950'>
                      {level.title}
                    </h3>
                    <p className='mt-1 text-paragraph-xs text-text-sub-600 line-clamp-2'>
                      {level.description}
                    </p>
                  </div>
                </div>

                <div className='mt-6 flex flex-col gap-2'>
                  <div className='flex items-center justify-between text-paragraph-xs'>
                    <span className='text-text-sub-600'>
                      Compliance Progress
                    </span>
                    <span className='font-semibold text-text-strong-950'>
                      {level.progress}%
                    </span>
                  </div>
                  <ProgressBar.Root
                    value={level.progress}
                    color={
                      level.status === 'completed'
                        ? 'green'
                        : level.status === 'in-progress'
                          ? 'blue'
                          : 'orange'
                    }
                  />
                  <div className='mt-1 flex items-center justify-between text-[11px] text-text-soft-400'>
                    <span>
                      {level.passedControls} of {level.totalControls} controls
                      passed
                    </span>
                    <span className='font-medium group-hover:text-primary-base'>
                      View details →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Level Deep Dive */}
      <div className='flex flex-col gap-6 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-6 shadow-xs'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-stroke-soft-200 pb-5'>
          <div className='flex items-center gap-3'>
            <div className='flex size-11 items-center justify-center rounded-xl bg-primary-base text-static-white shadow-xs'>
              <RiShieldCheckLine className='size-6' />
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <span className='text-subheading-xs uppercase tracking-wider text-text-soft-400 font-semibold'>
                  {activeLevelData.code}
                </span>
                <span className='text-text-soft-400'>•</span>
                <span className='text-label-sm font-semibold text-text-strong-950'>
                  {activeLevelData.name}: {activeLevelData.title}
                </span>
              </div>
              <p className='text-paragraph-sm text-text-sub-600 mt-0.5'>
                {activeLevelData.description}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Badge.Root
              variant='lighter'
              color={activeLevelData.badgeColor}
              size='medium'
            >
              {activeLevelData.badgeText}
            </Badge.Root>
          </div>
        </div>

        {/* Requirements Checklist */}
        <div className='flex flex-col gap-3'>
          <div className='flex items-center justify-between'>
            <h4 className='text-label-md font-semibold text-text-strong-950'>
              Mandatory Security Controls & Requirements
            </h4>
            <span className='text-paragraph-xs text-text-sub-600'>
              {activeLevelData.requirements.filter((r) => r.done).length} of{' '}
              {activeLevelData.requirements.length} requirements met
            </span>
          </div>

          <div className='divide-y divide-stroke-soft-200 rounded-xl border border-stroke-soft-200'>
            {activeLevelData.requirements.map((req, idx) => (
              <div
                key={idx}
                className='flex items-center justify-between gap-4 p-4 transition-colors hover:bg-bg-weak-50/50'
              >
                <div className='flex items-center gap-3'>
                  <div
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
                      req.done
                        ? 'bg-success-base text-static-white'
                        : 'border border-stroke-sub-300 text-text-soft-400'
                    }`}
                  >
                    {req.done ? (
                      <RiCheckLine className='size-4' />
                    ) : (
                      <RiTimeLine className='size-3.5' />
                    )}
                  </div>
                  <span
                    className={`text-paragraph-sm ${
                      req.done
                        ? 'text-text-strong-950 font-medium'
                        : 'text-text-sub-600'
                    }`}
                  >
                    {req.text}
                  </span>
                </div>

                <Badge.Root
                  variant='stroke'
                  color={req.done ? 'green' : 'gray'}
                  size='small'
                >
                  {req.done ? 'Compliant' : 'Pending Action'}
                </Badge.Root>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions banner */}
        <div className='flex flex-col gap-3 rounded-xl bg-bg-weak-50 p-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-2.5 text-paragraph-xs text-text-sub-600'>
            <RiInformationLine className='size-4 text-text-soft-400 shrink-0' />
            <span>
              Certifying this level qualifies your deployment for ECCS Tier{' '}
              {activeLevelData.id} assurance certification.
            </span>
          </div>
          <Button.Root variant='primary' mode='filled' size='small'>
            <span>Manage Controls</span>
            <Button.Icon as={RiArrowRightLine} />
          </Button.Root>
        </div>
      </div>
    </div>
  );
}
