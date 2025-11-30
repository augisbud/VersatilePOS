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
    roles,
    hasRoles,
    login,
    register,
    logout,
    refreshAccount,
  };
};
