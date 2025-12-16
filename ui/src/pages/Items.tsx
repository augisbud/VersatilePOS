import { useEffect, useState, useCallback } from 'react';
import { Alert, Card, Form, Space, Typography } from 'antd';
import { useItems } from '@/hooks/useItems';
import { useBusiness } from '@/hooks/useBusiness';
import { useUser } from '@/hooks/useUser';
import { useItemOptions } from '@/hooks/useItemOptions';
import { useTags } from '@/hooks/useTags';
import { useAppSelector } from '@/hooks/useAppSelector';
import { getUserBusinessId } from '@/selectors/user';
import { ModelsItemDto } from '@/api/types.gen';
import { getTagByIdItems } from '@/api';
import {
  ItemsHeader,
  ItemsGrid,
  ItemModal,
  ItemPreviewModal,
  BusinessSelectorCard,
  CategorySelector,
} from '@/components/Items';

type PendingOption = {
  name: string;
  priceModifierId: number;
  quantityInStock?: number;
  trackInventory?: boolean;
};

type ItemFormValues = {
  name: string;
  price: number;
  quantityInStock?: number;
  _pendingOptions?: PendingOption[];
};

export const Items = () => {
  const [form] = Form.useForm<ItemFormValues>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ModelsItemDto | null>(null);
  const [previewItem, setPreviewItem] = useState<ModelsItemDto | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [itemsByTag, setItemsByTag] = useState<ModelsItemDto[]>([]);
  const [itemsByTagLoading, setItemsByTagLoading] = useState(false);
  const [itemsByTagError, setItemsByTagError] = useState<string>();

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
  const { tags, fetchTags, loading: tagsLoading } = useTags();
  const { createItemOption, fetchItemOptions } = useItemOptions();
  const userBusinessId = useAppSelector(getUserBusinessId);

  const loading =
    itemsLoading || businessLoading || itemsByTagLoading || tagsLoading;
  const displayedItems = selectedTagId ? itemsByTag : items;

  const fetchItemsByTag = useCallback(async (tagId: number) => {
    setItemsByTagLoading(true);
    setItemsByTagError(undefined);
    try {
      const res = await getTagByIdItems({ path: { id: tagId } });
      if (res.error) throw new Error(res.error.error);
      const arr = Array.isArray(res.data) ? res.data : [];
      setItemsByTag(
        arr.filter(
          (x): x is ModelsItemDto => x !== null && typeof x === 'object'
        )
      );
    } catch (e) {
      setItemsByTag([]);
      setItemsByTagError(
        e instanceof Error ? e.message : 'Failed to load items by category'
      );
    } finally {
      setItemsByTagLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAllBusinesses();
  }, []);

  useEffect(() => {
    if (!businesses.length) return;
    const fallbackId = selectedBusinessId ?? userBusinessId ?? businesses[0].id;
    if (fallbackId && fallbackId !== selectedBusinessId) {
      selectBusiness(fallbackId);
    }
  }, [businesses, selectedBusinessId, userBusinessId]);

  useEffect(() => {
    if (selectedBusinessId && canReadItems) {
      void fetchItems(selectedBusinessId);
      void fetchTags(selectedBusinessId);
    }
  }, [selectedBusinessId, canReadItems]);

  useEffect(() => {
    if (selectedTagId) {
      void fetchItemsByTag(selectedTagId);
    } else {
      setItemsByTag([]);
      setItemsByTagError(undefined);
    }
  }, [selectedTagId, fetchItemsByTag]);

  const handleBusinessChange = (businessId: number) => {
    selectBusiness(businessId);
    setSelectedTagId(null);
    setItemsByTag([]);
    setItemsByTagError(undefined);
  };

  const handleOpenModal = (item?: ModelsItemDto) => {
    setEditingItem(item ?? null);
    if (item) {
      form.setFieldsValue({
        name: item.name,
        price: item.price,
        quantityInStock: item.quantityInStock,
      });
    } else {
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    form.resetFields();
  };

  const refreshItems = useCallback(() => {
    if (!selectedBusinessId) return;
    if (selectedTagId) {
      void fetchItemsByTag(selectedTagId);
    } else {
      void fetchItems(selectedBusinessId);
    }
  }, [selectedBusinessId, selectedTagId, fetchItemsByTag, fetchItems]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const pendingOptions = values._pendingOptions ?? [];

    if (editingItem?.id) {
      await updateItem(editingItem.id, {
        name: values.name,
        price: values.price,
        quantityInStock: values.quantityInStock,
        trackInventory: values.quantityInStock !== undefined,
      });
    } else if (selectedBusinessId) {
      const newItem = await createItem({
        businessId: selectedBusinessId,
        name: values.name,
        price: values.price,
        quantityInStock: values.quantityInStock,
        trackInventory: values.quantityInStock !== undefined,
      });

      if (newItem?.id && pendingOptions.length > 0) {
        for (const option of pendingOptions) {
          await createItemOption({
            itemId: newItem.id,
            name: option.name,
            priceModifierId: option.priceModifierId,
            quantityInStock: option.trackInventory
              ? option.quantityInStock
              : undefined,
            trackInventory: option.trackInventory,
          });
        }
        void fetchItemOptions(selectedBusinessId);
      }
    }

    handleCloseModal();
    refreshItems();
  };

  const handleDelete = async (itemId: number) => {
    await deleteItem(itemId);
    if (selectedTagId) {
      setItemsByTag((prev) => prev.filter((i) => i.id !== itemId));
    } else if (selectedBusinessId) {
      void fetchItems(selectedBusinessId);
    }
  };

  if (!canReadItems) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="You don't have permission to view items."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1800, margin: '0 auto' }}>
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

      {tags.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <Space size="middle" wrap>
            <Typography.Text strong>Filter by category:</Typography.Text>
            <CategorySelector
              tags={tags}
              selectedTagId={selectedTagId}
              onChange={setSelectedTagId}
              loading={tagsLoading}
              disabled={!selectedBusinessId}
            />
          </Space>
        </Card>
      )}

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {itemsByTagError && (
        <Alert
          message="Error"
          description={itemsByTagError}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <ItemsGrid
        items={displayedItems}
        loading={loading}
        canWriteItems={canWriteItems}
        selectedBusinessId={selectedBusinessId}
        onEdit={handleOpenModal}
        onDelete={(itemId) => void handleDelete(itemId)}
        onPreview={setPreviewItem}
        onAddItem={() => handleOpenModal()}
      />

      <ItemModal
        open={isModalOpen}
        form={form}
        editingItem={editingItem}
        businessId={selectedBusinessId ?? null}
        confirmLoading={itemsLoading}
        onCancel={handleCloseModal}
        onSubmit={() => void handleSubmit()}
      />

      <ItemPreviewModal
        open={!!previewItem}
        item={previewItem}
        businessId={selectedBusinessId ?? null}
        onClose={() => setPreviewItem(null)}
      />
    </div>
  );
};
