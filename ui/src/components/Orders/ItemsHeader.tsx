import { Button, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

type Props = {
  onNewItem: () => void;
  canWriteItems: boolean;
  selectedBusinessId?: number | null;
};

const { Title, Text } = Typography;

export const ItemsHeader = ({
  onNewItem,
  canWriteItems,
  selectedBusinessId,
}: Props) => (
  <div
    style={{
      marginBottom: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}
  >
    <div>
      <Title level={2} style={{ margin: 0 }}>
        Items
      </Title>
      <Text type="secondary">Manage items for any of your businesses.</Text>
    </div>

    {canWriteItems && (
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={onNewItem}
        disabled={!selectedBusinessId}
      >
        New Item
      </Button>
    )}
  </div>
);
