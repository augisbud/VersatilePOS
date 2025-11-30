import { useAppSelector } from './useAppSelector';
import { useAppDispatch } from './useAppDispatch';
import {
  isAuthenticated,
  getUser,
  getBusinessType,
  isBusinessOwner as isBusinessOwnerSelector,
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
  const businessType = useAppSelector(getBusinessType);
  const isBusinessOwner = useAppSelector(isBusinessOwnerSelector);

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
    businessType,
    isBusinessOwner,
    hasRoles,
    login,
    register,
    logout,
    refreshAccount,
  };
};
