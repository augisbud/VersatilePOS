import { Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { routesConfig } from '@/config/routes.config';

export const TopNavigation = () => {
  const location = useLocation();

  const visibleRoutes = routesConfig.filter((route) => route.showInNav);

  const matchesRoute = (path: string) => {
    if (path === location.pathname) return true;
    if (!path.includes('/:')) return false;

    const [basePath] = path.split('/:');
    return location.pathname.startsWith(`${basePath}/`);
  };

  const currentRoute = routesConfig.find((route) => matchesRoute(route.path));

  const selectedKey =
    currentRoute?.parentPage ||
    visibleRoutes.find((route) => matchesRoute(route.path))?.id ||
    visibleRoutes[0]?.id;

  const menuItems = visibleRoutes.map((route) => ({
    key: route.id,
    icon: route.icon,
    label: <Link to={route.path}>{route.title}</Link>,
  }));

  return (
    <Menu
      theme="dark"
      mode="horizontal"
      selectedKeys={[selectedKey]}
      items={menuItems}
      style={{
        flex: 1,
        minWidth: 0,
        border: 'none',
      }}
    />
  );
};
