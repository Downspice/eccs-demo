import type { CreateSetupPayload, SetupItem } from '@/services/setups';

export type SetupFormData = CreateSetupPayload;

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
