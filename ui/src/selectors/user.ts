import { State } from '@/types/redux';
import {
  canReadAccounts,
  canWriteAccounts,
  canReadBusinesses,
  canWriteBusinesses,
  canReadRoles,
  canWriteRoles,
} from '@/utils/permissions';

export const getUserToken = (state: State) => state.user.token;

export const isAuthenticated = (state: State) => !!state.user.token;

export const getUser = (state: State) => state.user;

export const getUserBusinessId = (state: State): number | undefined =>
  state.user.businessId;

export const getUserRoles = (state: State) => state.user.roles;

export const getCanReadAccounts = (state: State) =>
  canReadAccounts(getUserRoles(state));

export const getCanWriteAccounts = (state: State) =>
  canWriteAccounts(getUserRoles(state));

export const getCanReadBusinesses = (state: State) =>
  canReadBusinesses(getUserRoles(state));

export const getCanWriteBusinesses = (state: State) =>
  canWriteBusinesses(getUserRoles(state));

export const getCanReadRoles = (state: State) =>
  canReadRoles(getUserRoles(state));

export const getCanWriteRoles = (state: State) =>
  canWriteRoles(getUserRoles(state));
