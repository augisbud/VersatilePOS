import { Routes, Route } from 'react-router';
import { routesConfig } from '@/config/routes.config';
import { AuthGateway } from '@/layouts/AuthGateway';
import { RouteId } from '@/types/routes';
import { NotFound } from '@/pages/NotFound';
import { Register } from '@/pages/Register';
import { Login } from '@/pages/Login';

export const AppRouter = () => (
  <Routes>
    <Route path={RouteId.LOGIN} element={<Login />} />
    <Route path={RouteId.REGISTER} element={<Register />} />
    <Route element={<AuthGateway />}>
      {routesConfig.map(({ id, path, component: Component }) => (
        <Route key={id} path={path} element={<Component />} />
      ))}
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
);
