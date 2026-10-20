import type {
  CandidateItem,
  CreateCandidatePayload,
} from '@/services/candidates';
import type { CreateElectionPayload, ElectionItem } from '@/services/elections';
import type {
  CreateLevelMappingPayload,
  LevelMappingItem,
} from '@/services/level-mappings';
import type { CreateLevelPayload, LevelItem } from '@/services/levels';
import type {
  CreatePoliticalPartyPayload,
  PoliticalPartyItem,
} from '@/services/political-parties';

export type LevelFormData = CreateLevelPayload;
export type SetupFormData = LevelFormData;
export type ElectionFormData = CreateElectionPayload;
export type PoliticalPartyFormData = CreatePoliticalPartyPayload;
export type CandidateFormData = CreateCandidatePayload;
export type LevelMappingFormData = CreateLevelMappingPayload;

export interface SetupCategoryTab {
  id: string;
  label: string;
  count?: number;
}

export type ModalState =
  | { type: null }
  | { type: 'create' }
  | { type: 'update'; item: LevelItem }
  | { type: 'view'; item: LevelItem }
  | { type: 'delete'; item: LevelItem };

export type ElectionModalState =
  | { type: null }
  | { type: 'create' }
  | { type: 'update'; item: ElectionItem }
  | { type: 'view'; item: ElectionItem }
  | { type: 'delete'; item: ElectionItem };

export type PoliticalPartyModalState =
  | { type: null }
  | { type: 'create' }
  | { type: 'update'; item: PoliticalPartyItem }
  | { type: 'view'; item: PoliticalPartyItem }
  | { type: 'delete'; item: PoliticalPartyItem };

export type CandidateModalState =
  | { type: null }
  | { type: 'create' }
  | { type: 'update'; item: CandidateItem }
  | { type: 'view'; item: CandidateItem }
  | { type: 'delete'; item: CandidateItem };

export type LevelMappingModalState =
  | { type: null }
  | { type: 'create' }
  | { type: 'update'; item: LevelMappingItem }
  | { type: 'view'; item: LevelMappingItem }
  | { type: 'delete'; item: LevelMappingItem };
