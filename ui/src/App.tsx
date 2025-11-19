import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppRouter } from './router/AppRouter';
import { WithStore } from './hoc/WithStore';

export const App = () => {
  return (
    <WithStore>
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </BrowserRouter>
    </WithStore>
  );
};
