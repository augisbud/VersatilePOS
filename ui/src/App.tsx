import { BrowserRouter } from 'react-router';
import { AppRouter } from './router/AppRouter';
import { WithStore } from './hoc/WithStore';

export const App = () => {
  return (
    <WithStore>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </WithStore>
  );
};
