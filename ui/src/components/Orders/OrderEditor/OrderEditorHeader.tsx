import { Button, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

type Props = {
  onBack: () => void;
};

const { Title } = Typography;

export const OrderEditorHeader = ({ onBack }: Props) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 24px',
      background: '#fff',
      borderBottom: '1px solid #e8e8e8',
    }}
  >
    <Title level={4} style={{ margin: 0 }}>
      Order editing page
    </Title>
    <Button type="link" icon={<ArrowLeftOutlined />} onClick={onBack}>
      Back to main page
    </Button>
  </div>
);
