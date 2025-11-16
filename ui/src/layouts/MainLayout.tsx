import { Layout, Typography } from 'antd';
import { FC, PropsWithChildren } from 'react';
import { TopNavigation } from '@/components/Navigation/TopNavigation';
import './MainLayout.css';

const { Header, Content } = Layout;
const { Text } = Typography;

export const MainLayout: FC<PropsWithChildren> = ({ children }) => (
  <Layout className="main-layout">
    <Header className="main-layout-header">
      <Text strong className="main-layout-logo">
        VersatilePOS
      </Text>

      <TopNavigation />
    </Header>

    <Content className="main-layout-content">
      <div className="main-layout-content-wrapper">{children}</div>
    </Content>
  </Layout>
);
