import { Card, Col, Empty, Row, Typography, Button } from 'antd';
import { PlusOutlined, ShoppingOutlined } from '@ant-design/icons';
import { ModelsItemDto } from '@/api/types.gen';
import { formatCurrency } from '@/utils/formatters';

type Props = {
  items: ModelsItemDto[];
  loading: boolean;
  selectedBusinessId?: number | null;
  onAddItem: (itemId: number) => void;
};

export const OrderItemsGrid = ({
  items,
  loading,
  selectedBusinessId,
  onAddItem,
}: Props) => (
  <Row gutter={[12, 12]}>
    {items.map((item) => (
      <Col key={item.id} flex="240px">
        <Card
          hoverable
          cover={
            <div
              style={{
                height: 120,
                background: '#e8e8e8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#bfbfbf',
                fontSize: 32,
              }}
            >
              <ShoppingOutlined />
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Typography.Text strong>
              {item.name || `Item #${item.id}`}
            </Typography.Text>
            <Typography.Text type="secondary">
              {formatCurrency(item.price ?? 0)}
            </Typography.Text>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              block
              onClick={() => item.id && onAddItem(item.id)}
              disabled={!selectedBusinessId}
            >
              Add
            </Button>
          </div>
        </Card>
      </Col>
    ))}

    {!loading && items.length === 0 && (
      <Col span={24}>
        <Empty description="No items match your search." />
      </Col>
    )}
  </Row>
);


