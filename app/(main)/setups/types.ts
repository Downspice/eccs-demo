import type { CreateElectionPayload, ElectionItem } from '@/services/elections';
import type { CreateLevelPayload, LevelItem } from '@/services/levels';
import type {
  CreatePoliticalPartyPayload,
  PoliticalPartyItem,
} from '@/services/political-parties';

export type LevelFormData = CreateLevelPayload;
export type SetupFormData = LevelFormData;
export type ElectionFormData = CreateElectionPayload;
export type PoliticalPartyFormData = CreatePoliticalPartyPayload;

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
