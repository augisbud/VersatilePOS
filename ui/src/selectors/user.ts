import { State } from '@/types/redux';
import { User, UserRole } from '@/types/auth';
import { BusinessType } from '@/types/routes';

export const getUserToken = (state: State) => state.user.token;

export const isAuthenticated = (state: State) => !!state.user.token;

export const getUser = (state: State): User => ({
  identAccount: state.user.identAccount,
  name: state.user.name,
  username: state.user.username,
  role: UserRole.ADMIN,
  businessType: BusinessType.RESTAURANT,
});

export const getBusinessType = (state: State): BusinessType =>
  getUser(state)?.businessType || BusinessType.RESTAURANT;
