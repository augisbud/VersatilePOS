import { ConstantsAction } from '@/api/types.gen';

export const FUNCTION_ACTIONS: ConstantsAction[] = [
  'accounts',
  'businesses',
  'roles',
];

export const FUNCTION_ACTION_DESCRIPTIONS: Record<ConstantsAction, string> = {
  accounts: 'Manage user accounts and authentication',
  businesses: 'Manage business profiles and settings',
  roles: 'Manage roles and permissions',
};

export const getFunctionActionDescription = (action: ConstantsAction): string =>
  FUNCTION_ACTION_DESCRIPTIONS[action];
