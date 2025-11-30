import { State } from '@/types/redux';
import { User, UserRole } from '@/types/auth';
import { BusinessType } from '@/types/routes';

export const getUserToken = (state: State) => state.user.token;

export const isAuthenticated = (state: State) => !!state.user.token;

export const getUser = (state: State): User => ({
  name: state.user.name,
  username: state.user.username,
  role: UserRole.ADMIN,
  businessType: BusinessType.RESTAURANT,
});

export const getBusinessType = (state: State): BusinessType =>
  getUser(state)?.businessType || BusinessType.RESTAURANT;

export const getUserBusinessId = (state: State): number | undefined =>
  state.user.businessId;

export const isBusinessOwner = (state: State) =>
  !!state.user.roles?.some((role) => role.role?.name === 'Business Owner');
