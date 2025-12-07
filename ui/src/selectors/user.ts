import { State } from '@/types/redux';
import {
  canReadAccounts,
  canWriteAccounts,
  canReadBusinesses,
  canWriteBusinesses,
  canReadRoles,
  canWriteRoles,
  canReadServices,
  canWriteServices,
  canReadReservations,
  canWriteReservations,
  canReadPriceModifiers,
  canWritePriceModifiers,
  canReadItems,
  canWriteItems,
  canReadItemOptions,
  canWriteItemOptions,
  canReadOrders,
  canWriteOrders,
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

export const getCanReadServices = (state: State) =>
  canReadServices(getUserRoles(state));

export const getCanWriteServices = (state: State) =>
  canWriteServices(getUserRoles(state));

export const getCanReadReservations = (state: State) =>
  canReadReservations(getUserRoles(state));

export const getCanWriteReservations = (state: State) =>
  canWriteReservations(getUserRoles(state));

export const getCanReadPriceModifiers = (state: State) =>
  canReadPriceModifiers(getUserRoles(state));

export const getCanWritePriceModifiers = (state: State) =>
  canWritePriceModifiers(getUserRoles(state));

export const getCanReadItems = (state: State) =>
  canReadItems(getUserRoles(state));

export const getCanWriteItems = (state: State) =>
  canWriteItems(getUserRoles(state));

export const getCanReadItemOptions = (state: State) =>
  canReadItemOptions(getUserRoles(state));

export const getCanWriteItemOptions = (state: State) =>
  canWriteItemOptions(getUserRoles(state));

export const getCanReadOrders = (state: State) =>
  canReadOrders(getUserRoles(state));

export const getCanWriteOrders = (state: State) =>
  canWriteOrders(getUserRoles(state));
