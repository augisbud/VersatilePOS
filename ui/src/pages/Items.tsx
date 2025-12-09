import { useEffect, useState } from 'react';
import { Alert, Card, Form } from 'antd';
import { useItems } from '@/hooks/useItems';
import { useBusiness } from '@/hooks/useBusiness';
import { useUser } from '@/hooks/useUser';
import { ModelsItemDto } from '@/api/types.gen';
import { useAppSelector } from '@/hooks/useAppSelector';
import { getUserBusinessId } from '@/selectors/user';
import { BusinessSelectorCard } from '@/components/Orders/BusinessSelectorCard';
import { ItemsHeader } from '@/components/Orders/ItemsHeader';
import { ItemsTable } from '@/components/Orders/ItemsTable';
import { ItemModal } from '@/components/Orders/ItemModal';

export const Items = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<ModelsItemDto | null>(null);
  const [form] = Form.useForm();

  const {
    items,
    selectedBusinessId,
    loading: itemsLoading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    selectBusiness,
  } = useItems();
  const {
    businesses,
    loading: businessLoading,
    fetchAllBusinesses,
  } = useBusiness();
  const { canReadItems, canWriteItems } = useUser();
  const userBusinessId = useAppSelector(getUserBusinessId);

  const combinedLoading = itemsLoading || businessLoading;

  useEffect(() => {
    void fetchAllBusinesses();
  }, []);

  useEffect(() => {
    if (!businesses.length) return;

    const fallbackBusinessId =
      selectedBusinessId ?? userBusinessId ?? businesses[0].id;

    if (fallbackBusinessId && fallbackBusinessId !== selectedBusinessId) {
      selectBusiness(fallbackBusinessId);
    }
  }, [businesses, selectedBusinessId, userBusinessId]);

  useEffect(() => {
    if (selectedBusinessId) {
      void fetchItems(selectedBusinessId);
    }
  }, [selectedBusinessId]);

  const handleBusinessChange = (businessId: number) => {
    selectBusiness(businessId);
  };

  const handleOpenModal = (item?: ModelsItemDto) => {
    setEditingItem(item ?? null);
    setIsModalOpen(true);
    form.setFieldsValue({
      name: item?.name,
      price: item?.price,
      quantityInStock: item?.quantityInStock,
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsSubmitting(false);
    setEditingItem(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    if (!selectedBusinessId) {
      return;
    }

    setIsSubmitting(true);
    try {
      const values = await form.validateFields();
      const quantityInStock =
        values.quantityInStock === null || values.quantityInStock === undefined
          ? undefined
          : values.quantityInStock;
      const payload = {
        name: values.name,
        price: values.price,
        quantityInStock,
      };

      if (editingItem?.id) {
        await updateItem(editingItem.id, payload);
      } else {
        await createItem({ ...payload, businessId: selectedBusinessId });
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

  if (!canReadItems) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="You don't have permission to view items."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <ItemsHeader
        canWriteItems={canWriteItems}
        selectedBusinessId={selectedBusinessId}
        onNewItem={() => handleOpenModal()}
      />

      <BusinessSelectorCard
        businesses={businesses}
        selectedBusinessId={selectedBusinessId}
        onChange={handleBusinessChange}
        loading={businessLoading}
      />

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

      <Card>
        <ItemsTable
          items={items}
          loading={combinedLoading}
          canWriteItems={canWriteItems}
          selectedBusinessId={selectedBusinessId}
          onEdit={handleOpenModal}
          onDelete={(id) => void handleDelete(id)}
        />
      </Card>

      <ItemModal
        open={isModalOpen}
        form={form}
        editingItem={editingItem}
        confirmLoading={isSubmitting}
        onCancel={handleCloseModal}
        onSubmit={() => void handleSubmit()}
      />
    </div>
  );
};
