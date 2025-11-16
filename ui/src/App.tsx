import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { AppRouter } from './router/AppRouter';

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MainLayout>
          <AppRouter />
        </MainLayout>
      </AuthProvider>
    </BrowserRouter>
  );
};
