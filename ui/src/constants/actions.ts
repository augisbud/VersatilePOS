import { ConstantsAction } from '@/api/types.gen';

export const FUNCTION_ACTIONS: ConstantsAction[] = [
  'accounts',
  'businesses',
  'roles',
  'services',
  'reservations',
  'priceModifiers',
  'items',
  'itemOptions',
  'orders',
  'tags',
];

export const FUNCTION_ACTION_DESCRIPTIONS: Record<ConstantsAction, string> = {
  accounts: 'Manage user accounts and authentication',
  businesses: 'Manage business profiles and settings',
  roles: 'Manage roles and permissions',
  services: 'Manage services and pricing',
  reservations: 'Manage reservations and bookings',
  priceModifiers: 'Manage price modifiers and discounts',
  items: 'Manage items and inventory',
  itemOptions: 'Manage item options and variations',
  orders: 'Manage orders and payments',
  tags: 'Manage tags and categories',
};

export const getFunctionActionDescription = (action: ConstantsAction): string =>
  FUNCTION_ACTION_DESCRIPTIONS[action];
