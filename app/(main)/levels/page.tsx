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
      nothing yet
    </div>
  );
}
