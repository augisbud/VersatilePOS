import { useEffect, useState } from 'react';
import { Alert, Form } from 'antd';
import { useItems } from '@/hooks/useItems';
import { useBusiness } from '@/hooks/useBusiness';
import { useUser } from '@/hooks/useUser';
import { useAppSelector } from '@/hooks/useAppSelector';
import { getUserBusinessId } from '@/selectors/user';
import { ModelsItemDto } from '@/api/types.gen';
import {
  ItemsHeader,
  ItemsGrid,
  ItemModal,
  BusinessSelectorCard,
} from '@/components/Items';

type ItemFormValues = {
  name: string;
  price: number;
  quantityInStock?: number;
};

export const Items = () => {
  const [form] = Form.useForm<ItemFormValues>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ModelsItemDto | null>(null);

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
    if (selectedBusinessId && canReadItems) {
      void fetchItems(selectedBusinessId);
    }
  }, [selectedBusinessId, canReadItems]);

  const handleBusinessChange = (businessId: number) => {
    selectBusiness(businessId);
  };

  const handleOpenModal = (item?: ModelsItemDto) => {
    if (item) {
      setEditingItem(item);
      form.setFieldsValue({
        name: item.name,
        price: item.price,
        quantityInStock: item.quantityInStock,
      });
    } else {
      setEditingItem(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();

    if (editingItem?.id) {
      await updateItem(editingItem.id, {
        name: values.name,
        price: values.price,
        quantityInStock: values.quantityInStock,
        trackInventory: values.quantityInStock !== undefined,
      });
    } else if (selectedBusinessId) {
      await createItem({
        businessId: selectedBusinessId,
        name: values.name,
        price: values.price,
        quantityInStock: values.quantityInStock,
        trackInventory: values.quantityInStock !== undefined,
      });
    }

    handleCloseModal();
    if (selectedBusinessId) {
      void fetchItems(selectedBusinessId);
    }
  };

  const handleDelete = async (itemId: number) => {
    await deleteItem(itemId);
    if (selectedBusinessId) {
      void fetchItems(selectedBusinessId);
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
    <div style={{ padding: '24px', maxWidth: '1800px', margin: '0 auto' }}>
      <ItemsHeader
        onNewItem={() => handleOpenModal()}
        canWriteItems={canWriteItems}
        selectedBusinessId={selectedBusinessId}
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

      <ItemsGrid
        items={items}
        loading={combinedLoading}
        canWriteItems={canWriteItems}
        selectedBusinessId={selectedBusinessId}
        onEdit={handleOpenModal}
        onDelete={(itemId) => void handleDelete(itemId)}
      />

      <ItemModal
        open={isModalOpen}
        form={form}
        editingItem={editingItem}
        confirmLoading={itemsLoading}
        onCancel={handleCloseModal}
        onSubmit={() => void handleSubmit()}
      />
    </div>
  );
};
