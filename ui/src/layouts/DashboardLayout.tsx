import { Layout, Typography, Button, Space, Dropdown } from 'antd';
import { FC, PropsWithChildren } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { TopNavigation } from '@/components/Navigation/TopNavigation';
import { useAuth } from '@/hooks/useAuth';
import './DashboardLayout.css';
import { RouteId } from '@/types/routes';

const { Header, Content } = Layout;
const { Text } = Typography;

export const DashboardLayout: FC<PropsWithChildren> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    void navigate(`/${RouteId.LOGIN}`);
  };

  const items = [
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="main-layout">
      <Header className="main-layout-header">
        <Text strong className="main-layout-logo">
          VersatilePOS
        </Text>

        <TopNavigation />

        <Space>
          <Dropdown menu={{ items }} placement="bottomRight">
            <Button type="text" icon={<UserOutlined />} className="user">
              <Text className="user">{user.name}</Text>
            </Button>
          </Dropdown>
        </Space>
      </Header>

      <Content className="main-layout-content">
        <div className="main-layout-content-wrapper">{children}</div>
      </Content>
    </Layout>
  );
};
