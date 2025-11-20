import { useAppSelector } from './useAppSelector';
import { useAppDispatch } from './useAppDispatch';
import { isAuthenticated, getUser, getBusinessType } from '@/selectors/user';
import {
  login as loginAction,
  createAccount as createAccountAction,
  logout as logoutAction,
} from '@/actions/user';
import { UserRole } from '@/types/auth';
import {
  ModelsLoginRequest,
  ModelsCreateAccountRequest,
} from '@/api/types.gen';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const authenticated = useAppSelector(isAuthenticated);
  const user = useAppSelector(getUser);
  const businessType = useAppSelector(getBusinessType);

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user.username) {
      return false;
    }

    return roles.includes(user.role);
  };

  const login = (credentials: ModelsLoginRequest) =>
    dispatch(loginAction(credentials)).unwrap();

  const register = (accountData: ModelsCreateAccountRequest) =>
    dispatch(createAccountAction(accountData)).unwrap();

  const logout = () => dispatch(logoutAction());
  return {
    isAuthenticated: authenticated,
    user,
    businessType,
    hasRole,
    login,
    register,
    logout,
  };
};
