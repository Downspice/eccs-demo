import type { CreateElectionPayload, ElectionItem } from '@/services/elections';
import type { CreateSetupPayload, SetupItem } from '@/services/setups';

export type SetupFormData = CreateSetupPayload;
export type ElectionFormData = CreateElectionPayload;

export interface SetupCategoryTab {
  id: string;
  label: string;
  count?: number;
}

export type ModalState =
  | { type: null }
  | { type: 'create' }
  | { type: 'update'; item: SetupItem }
  | { type: 'view'; item: SetupItem }
  | { type: 'delete'; item: SetupItem };

export type ElectionModalState =
  | { type: null }
  | { type: 'create' }
  | { type: 'update'; item: ElectionItem }
  | { type: 'view'; item: ElectionItem }
  | { type: 'delete'; item: ElectionItem };
