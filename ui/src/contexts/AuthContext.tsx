import {
  createContext,
  useContext,
  useState,
  FC,
  PropsWithChildren,
} from 'react';
import { User, UserRole } from '@/types/auth';
import { BusinessType } from '@/types/routes';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  businessType: BusinessType | null;
  login: (user: User) => void;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUser: User = {
  id: '1',
  name: 'John Staff',
  email: 'staff@versatilepos.com',
  role: UserRole.STAFF,
  businessType: BusinessType.RESTAURANT,
};

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(mockUser);

  const login = (newUser: User) => {
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    businessType: user?.businessType || null,
    login,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
