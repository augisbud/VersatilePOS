import { Alert } from 'antd';
import { StopOutlined } from '@ant-design/icons';

type Props = {
  resource: string;
};

export const AccessDenied = ({ resource }: Props) => (
  <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
    <Alert
      message="Access Denied"
      description={`You don't have permission to view ${resource}.`}
      type="error"
      showIcon
      icon={<StopOutlined />}
    />
  </div>
);
