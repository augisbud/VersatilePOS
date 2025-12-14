import { useEffect, useMemo, useState } from 'react';
import { Alert, Form } from 'antd';
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
  CategorySelectorCard,
} from '@/components/Items';
import './Items.css';

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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<ModelsItemDto | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [itemsByTag, setItemsByTag] = useState<ModelsItemDto[]>([]);
  const [itemsByTagLoading, setItemsByTagLoading] = useState(false);
  const [itemsByTagError, setItemsByTagError] = useState<string | undefined>(
    undefined
  );

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

  const combinedLoading =
    itemsLoading || businessLoading || itemsByTagLoading || tagsLoading;

  const displayedItems = useMemo(() => {
    return selectedTagId ? itemsByTag : items;
  }, [selectedTagId, itemsByTag, items]);

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

  useEffect(() => {
    if (selectedBusinessId && canReadItems) {
      void fetchTags(selectedBusinessId);
    }
  }, [selectedBusinessId, canReadItems]);

  useEffect(() => {
    const loadByTag = async () => {
      if (!selectedTagId) {
        setItemsByTag([]);
        setItemsByTagError(undefined);
        setItemsByTagLoading(false);
        return;
      }

      setItemsByTagLoading(true);
      setItemsByTagError(undefined);
      try {
        const res = await getTagByIdItems({ path: { id: selectedTagId } });
        if (res.error) {
          throw new Error(res.error.error);
        }
        const arr = Array.isArray(res.data) ? res.data : [];
        // Swagger/openapi currently types these as `object[]` / `unknown[]`.
        // Backend returns item-like objects; filter to objects and cast.
        const parsed = arr.filter((x) => x && typeof x === 'object') as ModelsItemDto[];
        setItemsByTag(parsed);
      } catch (e) {
        setItemsByTag([]);
        setItemsByTagError(e instanceof Error ? e.message : 'Failed to load items by category');
      } finally {
        setItemsByTagLoading(false);
      }
    };

    void loadByTag();
  }, [selectedTagId]);

  const handleBusinessChange = (businessId: number) => {
    selectBusiness(businessId);
    setSelectedTagId(null);
    setItemsByTag([]);
    setItemsByTagError(undefined);
  };

  const handleTagChange = (tagId: number | null) => {
    setSelectedTagId(tagId);
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
    const pendingOptions = values._pendingOptions || [];

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

      // Create pending options for the new item
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
    if (selectedBusinessId) {
      if (selectedTagId) {
        void (async () => {
          setItemsByTagLoading(true);
          setItemsByTagError(undefined);
          try {
            const res = await getTagByIdItems({ path: { id: selectedTagId } });
            if (res.error) throw new Error(res.error.error);
            const arr = Array.isArray(res.data) ? res.data : [];
            setItemsByTag(arr.filter((x) => x && typeof x === 'object') as ModelsItemDto[]);
          } catch (e) {
            setItemsByTag([]);
            setItemsByTagError(e instanceof Error ? e.message : 'Failed to load items by category');
          } finally {
            setItemsByTagLoading(false);
          }
        })();
      } else {
        void fetchItems(selectedBusinessId);
      }
    }
  };

  const handleDelete = async (itemId: number) => {
    await deleteItem(itemId);
    if (selectedBusinessId) {
      if (selectedTagId) {
        setItemsByTag((prev) => prev.filter((i) => i.id !== itemId));
      } else {
        void fetchItems(selectedBusinessId);
      }
    }
  };

  const handlePreview = (item: ModelsItemDto) => {
    setPreviewItem(item);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewItem(null);
  };

  if (!canReadItems) {
    return (
      <div className="itemsPageNoAccess">
        <Alert
          message="You don't have permission to view items."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="itemsPage">
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

      <CategorySelectorCard
        tags={tags}
        selectedTagId={selectedTagId}
        onChange={handleTagChange}
        loading={tagsLoading}
        disabled={!selectedBusinessId}
      />

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          className="itemsPageAlert"
        />
      )}

      {itemsByTagError && (
        <Alert
          message="Error"
          description={itemsByTagError}
          type="error"
          showIcon
          className="itemsPageAlert"
        />
      )}

      <ItemsGrid
        items={displayedItems}
        loading={combinedLoading}
        canWriteItems={canWriteItems}
        selectedBusinessId={selectedBusinessId}
        onEdit={handleOpenModal}
        onDelete={(itemId) => void handleDelete(itemId)}
        onPreview={handlePreview}
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
        open={isPreviewOpen}
        item={previewItem}
        businessId={selectedBusinessId ?? null}
        onClose={handleClosePreview}
      />
    </div>
  );
};
