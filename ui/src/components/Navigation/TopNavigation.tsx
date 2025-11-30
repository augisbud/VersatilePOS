import { Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { routesConfig } from '@/config/routes.config';
import { useUser } from '@/hooks/useUser';
import { getRoutesForBusinessType } from '@/utils/routes';

export const TopNavigation = () => {
  const location = useLocation();
  const { hasRole, businessType } = useUser();

  const availableRoutes = getRoutesForBusinessType(routesConfig, businessType);
  const visibleRoutes = availableRoutes.filter(
    (route) => route.showInNav && hasRole(route.roles)
  );

  const selectedKey =
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
