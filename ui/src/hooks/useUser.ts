import { useAppSelector } from './useAppSelector';
import { useAppDispatch } from './useAppDispatch';
import {
  isAuthenticated,
  getUser,
  getUserRoles,
  getCanReadAccounts,
  getCanWriteAccounts,
  getCanReadBusinesses,
  getCanWriteBusinesses,
  getCanReadRoles,
  getCanWriteRoles,
  getCanReadServices,
  getCanWriteServices,
  getCanReadReservations,
  getCanWriteReservations,
  getCanReadPriceModifiers,
  getCanWritePriceModifiers,
  getCanReadItems,
  getCanWriteItems,
  getCanReadItemOptions,
  getCanWriteItemOptions,
  getCanReadOrders,
  getCanWriteOrders,
} from '@/selectors/user';
import {
  login as loginAction,
  createAccount as createAccountAction,
  logout as logoutAction,
  fetchMyAccount as fetchMyAccountAction,
} from '@/actions/user';
import {
  ModelsLoginRequest,
  ModelsCreateAccountRequest,
  ModelsAccountRoleLinkDto,
} from '@/api/types.gen';

export const useUser = () => {
  const dispatch = useAppDispatch();
  const authenticated = useAppSelector(isAuthenticated);
  const user = useAppSelector(getUser);
  const roles = useAppSelector(getUserRoles);

  const canReadAccounts = useAppSelector(getCanReadAccounts);
  const canWriteAccounts = useAppSelector(getCanWriteAccounts);
  const canReadBusinesses = useAppSelector(getCanReadBusinesses);
  const canWriteBusinesses = useAppSelector(getCanWriteBusinesses);
  const canReadRoles = useAppSelector(getCanReadRoles);
  const canWriteRoles = useAppSelector(getCanWriteRoles);
  const canReadServices = useAppSelector(getCanReadServices);
  const canWriteServices = useAppSelector(getCanWriteServices);
  const canReadReservations = useAppSelector(getCanReadReservations);
  const canWriteReservations = useAppSelector(getCanWriteReservations);
  const canReadPriceModifiers = useAppSelector(getCanReadPriceModifiers);
  const canWritePriceModifiers = useAppSelector(getCanWritePriceModifiers);
  const canReadItems = useAppSelector(getCanReadItems);
  const canWriteItems = useAppSelector(getCanWriteItems);
  const canReadItemOptions = useAppSelector(getCanReadItemOptions);
  const canWriteItemOptions = useAppSelector(getCanWriteItemOptions);
  const canReadOrders = useAppSelector(getCanReadOrders);
  const canWriteOrders = useAppSelector(getCanWriteOrders);

  const hasRoles = (roles: ModelsAccountRoleLinkDto[]) => !!roles.length;

  const login = (credentials: ModelsLoginRequest) =>
    dispatch(loginAction(credentials)).unwrap();

  const register = (accountData: ModelsCreateAccountRequest) =>
    dispatch(createAccountAction(accountData)).unwrap();

  const logout = () => dispatch(logoutAction());

  const refreshAccount = () => dispatch(fetchMyAccountAction()).unwrap();

  return {
    isAuthenticated: authenticated,
    user,
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
    roles,
    hasRoles,
    login,
    register,
    logout,
    refreshAccount,
  };
};
