import { useEffect, useState } from 'react';
import { Button, Card, Table, Typography, Alert } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useItems } from '@/hooks/useItems';
import { useUser } from '@/hooks/useUser';
import {
  ItemFormModal,
  ItemFormValues,
  ItemWithInventory,
} from './ItemFormModal';
import { getItemColumns } from './ItemTableColumns';

const { Title } = Typography;

interface BusinessItemsProps {
  businessId: number;
}

export const BusinessItems = ({ businessId }: BusinessItemsProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemWithInventory | null>(
    null
  );

  const {
    items,
    loading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    selectBusiness,
  } = useItems();
  const { canWriteItems } = useUser();

  useEffect(() => {
    selectBusiness(businessId);
    void fetchItems(businessId);
  }, [businessId]);

  const handleOpenModal = (item?: ItemWithInventory) => {
    setEditingItem(item ?? null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsSubmitting(false);
    setEditingItem(null);
  };

  const handleSubmit = async (values: ItemFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingItem?.id) {
        await updateItem(editingItem.id, values);
      } else {
        await createItem({ ...values, businessId });
      }
      handleCloseModal();
    } catch (err) {
      console.error('Failed to save item', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (itemId: number) => {
    try {
      await deleteItem(itemId);
    } catch (err) {
      console.error('Failed to delete item', err);
    }
  };

  const columns = getItemColumns({
    canWriteItems,
    onEdit: handleOpenModal,
    onDelete: (id) => void handleDelete(id),
  });

  return (
    <>
      <Card
        title={
          <Title level={4} style={{ margin: 0 }}>
            Items
          </Title>
        }
        extra={
          canWriteItems && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenModal()}
            >
              Add Item
            </Button>
          )
        }
      >
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: '12px' }}
          />
        )}
        <Table
          columns={columns}
          dataSource={items as ItemWithInventory[]}
          rowKey="id"
          loading={loading}
          pagination={false}
          locale={{ emptyText: 'No items yet. Add your first item!' }}
        />
      </Card>

      <ItemFormModal
        open={isModalOpen}
        editingItem={editingItem}
        isSubmitting={isSubmitting}
        onClose={handleCloseModal}
        onSubmit={(values) => void handleSubmit(values)}
      />
    </>
  );
};
