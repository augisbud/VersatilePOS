import { Col, Row } from 'antd';
import { ModelsItemDto } from '@/api/types.gen';
import { ItemCard } from './ItemCard';
import { EmptyState } from '@/components/shared';

type Props = {
  items: ModelsItemDto[];
  loading: boolean;
  canWriteItems: boolean;
  selectedBusinessId?: number | null;
  onEdit: (item: ModelsItemDto) => void;
  onDelete: (itemId: number) => void;
  onPreview: (item: ModelsItemDto) => void;
  onAddItem?: () => void;
};

export const ItemsGrid = ({
  items,
  loading,
  canWriteItems,
  selectedBusinessId,
  onEdit,
  onDelete,
  onPreview,
  onAddItem,
}: Props) => {
  if (!selectedBusinessId) {
    return (
      <EmptyState
        variant="items"
        title="No Business Selected"
        description="Select a business from the dropdown above to view and manage your menu items."
        showAction={false}
      />
    );
  }

  if (!loading && items.length === 0) {
    return (
      <EmptyState
        variant="items"
        title="No Items Yet"
        description="Your menu is empty. Add your first item to start building your offerings."
        actionLabel={canWriteItems ? 'Add First Item' : undefined}
        onAction={onAddItem}
        showAction={canWriteItems && !!onAddItem}
      />
    );
  }

  return (
    <Row gutter={[12, 12]}>
      {items.map((item) => (
        <Col key={item.id} flex="240px">
          <ItemCard
            item={item}
            loading={loading}
            canWriteItems={canWriteItems}
            onEdit={onEdit}
            onDelete={onDelete}
            onPreview={onPreview}
          />
        </Col>
      ))}
    </Row>
  );
};
