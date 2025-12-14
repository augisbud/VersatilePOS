import { Menu } from 'antd';
import { Link, useLocation } from 'react-router';
import { routesConfig } from '@/config/routes.config';

export const TopNavigation = () => {
  const location = useLocation();

  const visibleRoutes = routesConfig.filter((route) => route.showInNav);

  const currentRoute = routesConfig.find(
    (route) => route.path === location.pathname
  );

  const selectedKey =
    currentRoute?.parentPage ||
    visibleRoutes.find((route) => route.path === location.pathname)?.id ||
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
