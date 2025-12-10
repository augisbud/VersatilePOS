import { Card, Col, Empty, Row } from 'antd';
import { ModelsItemDto } from '@/api/types.gen';
import { ItemCard } from './ItemCard';

type Props = {
  items: ModelsItemDto[];
  loading: boolean;
  canWriteItems: boolean;
  selectedBusinessId?: number | null;
  onEdit: (item: ModelsItemDto) => void;
  onDelete: (itemId: number) => void;
};

export const ItemsGrid = ({
  items,
  loading,
  canWriteItems,
  selectedBusinessId,
  onEdit,
  onDelete,
}: Props) => {
  if (!selectedBusinessId) {
    return (
      <Card>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Select a business to view items."
        />
      </Card>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <Card>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No items found for this business."
        />
      </Card>
    );
  }

  return (
    <Row gutter={[12, 12]}>
      {items.map((item) => (
        <Col key={item.id} flex="200px">
          <ItemCard
            item={item}
            loading={loading}
            canWriteItems={canWriteItems}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </Col>
      ))}
    </Row>
  );
};
