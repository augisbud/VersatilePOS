import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOrders } from '@/hooks/useOrders';
import { useBusiness } from '@/hooks/useBusiness';
import { useUser } from '@/hooks/useUser';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useItems } from '@/hooks/useItems';
import { useTags } from '@/hooks/useTags';
import { useItemOptions } from '@/hooks/useItemOptions';
import { usePriceModifiers } from '@/hooks/usePriceModifiers';
import { getUserBusinessId } from '@/selectors/user';
import { getItemName, getItemPrice } from '@/selectors/item';
import { getItemOptionName } from '@/selectors/itemOption';
import { getTagByIdItems } from '@/api';
import { formatPriceChange } from '@/utils/formatters';
import {
  SelectedItem,
  SelectedItemOption,
  calculateOptionPriceChange,
  calculateOrderTotal,
  mapItemsToOrderInfo,
  getAvailableOptionsForEdit,
} from '@/utils/orderCalculations';
import { ModelsItemDto, ModelsItemOptionLinkDto } from '@/api/types.gen';

export type CustomerDetails = {
  customer?: string;
  customerEmail?: string;
  customerPhone?: string;
};
import {
  EditingItem,
  OrderInfoItem,
  AvailableOption,
} from '@/types/orderEditor';

export const useOrderEditor = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const isEditMode = !!orderId;
  const parsedOrderId = orderId ? Number(orderId) : undefined;

  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(!isEditMode);
  const [optionToAdd, setOptionToAdd] = useState<number | undefined>();
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [itemsByTag, setItemsByTag] = useState<ModelsItemDto[]>([]);
  const [itemsByTagLoading, setItemsByTagLoading] = useState(false);
  const [itemsByTagError, setItemsByTagError] = useState<string | undefined>(
    undefined
  );

  const {
    createOrder,
    selectedBusinessId,
    selectBusiness,
    loading: ordersLoading,
    error,
    addItemToOrder,
    fetchOrderById,
    fetchItemsForOrder,
    orderItems,
    updateOrderItem,
    removeItemFromOrder,
    updateOrder,
    itemOptionsMap,
    fetchOptionsForOrderItem,
    addOptionToOrderItem,
    removeOptionFromOrderItem,
  } = useOrders();

  const {
    businesses,
    loading: businessLoading,
    fetchAllBusinesses,
  } = useBusiness();

  const { canWriteOrders, canReadOrders } = useUser();
  const { items, fetchItems, loading: itemsLoading } = useItems();
  const { tags, fetchTags, loading: tagsLoading } = useTags();
  const { itemOptions, fetchItemOptions } = useItemOptions();
  const { priceModifiers, fetchPriceModifiers } = usePriceModifiers();
  const userBusinessId = useAppSelector(getUserBusinessId);

  // Load existing order data when in edit mode
  useEffect(() => {
    if (isEditMode && parsedOrderId) {
      const loadOrder = async () => {
        try {
          const order = await fetchOrderById(parsedOrderId);
          if (order?.businessId) {
            selectBusiness(order.businessId);
            await fetchItems(order.businessId);
            await fetchItemOptions(order.businessId);
            await fetchPriceModifiers(order.businessId);
            await fetchTags(order.businessId);
          }
          const loadedItems = await fetchItemsForOrder(parsedOrderId);
          for (const item of loadedItems) {
            if (item.id) {
              await fetchOptionsForOrderItem(parsedOrderId, item.id);
            }
          }
          setInitialLoadComplete(true);
        } catch (err) {
          console.error('Failed to load order', err);
          setInitialLoadComplete(true);
        }
      };
      void loadOrder();
    }
  }, [isEditMode, parsedOrderId]);

  // Sync order items when in edit mode
  useEffect(() => {
    if (isEditMode && initialLoadComplete && orderItems.length > 0) {
      setSelectedItems(
        orderItems.map((oi) => ({
          id: oi.id,
          itemId: oi.itemId!,
          count: oi.count || 1,
        }))
      );
    }
  }, [orderItems, isEditMode, initialLoadComplete]);

  useEffect(() => {
    void fetchAllBusinesses();
  }, []);

  useEffect(() => {
    if (!businesses.length || isEditMode) return;

    const fallbackBusinessId =
      selectedBusinessId ?? userBusinessId ?? businesses[0].id;

    if (fallbackBusinessId && fallbackBusinessId !== selectedBusinessId) {
      selectBusiness(fallbackBusinessId);
    }
  }, [businesses, selectedBusinessId, userBusinessId, isEditMode]);

  useEffect(() => {
    if (selectedBusinessId && !isEditMode) {
      void fetchItems(selectedBusinessId);
      void fetchItemOptions(selectedBusinessId);
      void fetchPriceModifiers(selectedBusinessId);
      void fetchTags(selectedBusinessId);
    }
  }, [selectedBusinessId, isEditMode]);

  useEffect(() => {
    // When business changes (or initial business is selected), reset category filter.
    setSelectedTagId(null);
    setItemsByTag([]);
    setItemsByTagError(undefined);
  }, [selectedBusinessId]);

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
        setItemsByTag(
          arr.filter((x) => x && typeof x === 'object') as ModelsItemDto[]
        );
      } catch (e) {
        setItemsByTag([]);
        setItemsByTagError(
          e instanceof Error ? e.message : 'Failed to load items by category'
        );
      } finally {
        setItemsByTagLoading(false);
      }
    };

    void loadByTag();
  }, [selectedTagId]);

  const displayedItems = useMemo(() => {
    return selectedTagId ? itemsByTag : items;
  }, [selectedTagId, itemsByTag, items]);

  // Helper functions
  const getItemNameLocal = useCallback(
    (itemId: number) => getItemName(items, itemId),
    [items]
  );

  const getItemPriceLocal = useCallback(
    (itemId: number) => getItemPrice(items, itemId),
    [items]
  );

  const getOptionNameLocal = useCallback(
    (optionId: number) => getItemOptionName(itemOptions, optionId),
    [itemOptions]
  );

  const getOptionPriceChangeLocal = useCallback(
    (optionId: number, basePrice: number) =>
      calculateOptionPriceChange(
        optionId,
        basePrice,
        itemOptions,
        priceModifiers
      ),
    [itemOptions, priceModifiers]
  );

  const getOptionsForItem = useCallback(
    (
      itemId: number,
      orderItemId?: number
    ): ModelsItemOptionLinkDto[] | SelectedItemOption[] => {
      if (isEditMode && orderItemId) {
        return itemOptionsMap[orderItemId] || [];
      }
      const item = selectedItems.find((i) => i.itemId === itemId);
      return item?.options || [];
    },
    [isEditMode, itemOptionsMap, selectedItems]
  );

  // Computed values
  const total = useMemo(() => {
    return calculateOrderTotal(
      selectedItems,
      items,
      itemOptions,
      priceModifiers,
      getOptionsForItem
    );
  }, [selectedItems, items, itemOptions, priceModifiers, getOptionsForItem]);

  const orderInfoItems: OrderInfoItem[] = useMemo(() => {
    return mapItemsToOrderInfo(
      selectedItems,
      items,
      itemOptions,
      priceModifiers,
      getOptionsForItem,
      formatPriceChange,
      getItemNameLocal,
      getOptionNameLocal
    );
  }, [
    selectedItems,
    items,
    itemOptions,
    priceModifiers,
    getOptionsForItem,
    getItemNameLocal,
    getOptionNameLocal,
  ]);

  const availableOptionsForEdit: AvailableOption[] = useMemo(() => {
    if (!editingItem) return [];

    const selectedOptionIds = editingItem.options.map((o) => o.itemOptionId);
    return getAvailableOptionsForEdit(
      editingItem.itemId,
      selectedOptionIds,
      itemOptions,
      priceModifiers,
      items,
      formatPriceChange
    );
  }, [editingItem, itemOptions, priceModifiers, items]);

  // Event handlers
  const handleItemClick = useCallback(
    async (item: ModelsItemDto) => {
      const itemId = item.id;
      if (!itemId) return;

      if (isEditMode && parsedOrderId) {
        const existing = selectedItems.find((p) => p.itemId === itemId);
        if (existing && existing.id) {
          await updateOrderItem(parsedOrderId, existing.id, {
            count: existing.count + 1,
          });
          await fetchItemsForOrder(parsedOrderId);
        } else {
          await addItemToOrder(parsedOrderId, { itemId, count: 1 });
          await fetchItemsForOrder(parsedOrderId);
        }
      } else {
        setSelectedItems((prev) => {
          const existing = prev.find((p) => p.itemId === itemId);
          if (existing) {
            return prev.map((p) =>
              p.itemId === itemId ? { ...p, count: p.count + 1 } : p
            );
          }
          return [...prev, { itemId, count: 1, options: [] }];
        });
      }
    },
    [
      isEditMode,
      parsedOrderId,
      selectedItems,
      updateOrderItem,
      fetchItemsForOrder,
      addItemToOrder,
    ]
  );

  const handleEditItem = useCallback(
    (itemId: number, orderItemId?: number) => {
      const item = selectedItems.find(
        (i) => i.itemId === itemId && i.id === orderItemId
      );
      if (!item) return;

      const options = getOptionsForItem(itemId, orderItemId);
      const mappedOptions = isEditMode
        ? (options as ModelsItemOptionLinkDto[]).map((o) => ({
            itemOptionId: o.itemOptionId!,
            count: o.count || 1,
          }))
        : [...(options as SelectedItemOption[])];

      setEditingItem({
        itemId,
        orderItemId,
        count: item.count,
        options: mappedOptions,
        originalOptions: [...mappedOptions],
      });
      setOptionToAdd(undefined);
    },
    [selectedItems, getOptionsForItem, isEditMode]
  );

  const handleEditSave = useCallback(async () => {
    if (!editingItem) return;

    if (isEditMode && parsedOrderId && editingItem.orderItemId) {
      if (editingItem.count > 0) {
        await updateOrderItem(parsedOrderId, editingItem.orderItemId, {
          count: editingItem.count,
        });
      }

      const optionsToAdd = editingItem.options.filter(
        (opt) =>
          !editingItem.originalOptions.some(
            (orig) => orig.itemOptionId === opt.itemOptionId
          )
      );

      const optionsToRemove = editingItem.originalOptions.filter(
        (orig) =>
          !editingItem.options.some(
            (opt) => opt.itemOptionId === orig.itemOptionId
          )
      );

      for (const opt of optionsToAdd) {
        await addOptionToOrderItem(parsedOrderId, editingItem.orderItemId, {
          itemOptionId: opt.itemOptionId,
          count: opt.count,
        });
      }

      const currentOptionsFromServer =
        itemOptionsMap[editingItem.orderItemId] || [];
      for (const opt of optionsToRemove) {
        const optionLink = currentOptionsFromServer.find(
          (o: ModelsItemOptionLinkDto) => o.itemOptionId === opt.itemOptionId
        );
        if (optionLink?.id) {
          await removeOptionFromOrderItem(
            parsedOrderId,
            editingItem.orderItemId,
            optionLink.id
          );
        }
      }

      await fetchItemsForOrder(parsedOrderId);
      await fetchOptionsForOrderItem(parsedOrderId, editingItem.orderItemId);
    } else {
      if (editingItem.count > 0) {
        setSelectedItems((prev) =>
          prev.map((p) =>
            p.itemId === editingItem.itemId
              ? { ...p, count: editingItem.count, options: editingItem.options }
              : p
          )
        );
      }
    }
    setEditingItem(null);
    setOptionToAdd(undefined);
  }, [
    editingItem,
    isEditMode,
    parsedOrderId,
    updateOrderItem,
    addOptionToOrderItem,
    removeOptionFromOrderItem,
    fetchItemsForOrder,
    fetchOptionsForOrderItem,
    itemOptionsMap,
  ]);

  const handleEditCancel = useCallback(() => {
    setEditingItem(null);
    setOptionToAdd(undefined);
  }, []);

  const handleRemoveItem = useCallback(async () => {
    if (!editingItem) return;

    if (isEditMode && parsedOrderId && editingItem.orderItemId) {
      await removeItemFromOrder(parsedOrderId, editingItem.orderItemId);
      await fetchItemsForOrder(parsedOrderId);
    } else {
      setSelectedItems((prev) =>
        prev.filter((p) => p.itemId !== editingItem.itemId)
      );
    }
    setEditingItem(null);
  }, [
    editingItem,
    isEditMode,
    parsedOrderId,
    removeItemFromOrder,
    fetchItemsForOrder,
  ]);

  const handleAddOption = useCallback(() => {
    if (!editingItem || !optionToAdd) return;

    setEditingItem((prev) => {
      if (!prev) return null;
      const existing = prev.options.find((o) => o.itemOptionId === optionToAdd);
      if (existing) {
        return {
          ...prev,
          options: prev.options.map((o) =>
            o.itemOptionId === optionToAdd ? { ...o, count: o.count + 1 } : o
          ),
        };
      }
      return {
        ...prev,
        options: [...prev.options, { itemOptionId: optionToAdd, count: 1 }],
      };
    });
    setOptionToAdd(undefined);
  }, [editingItem, optionToAdd]);

  const handleRemoveOption = useCallback(
    (optionId: number) => {
      if (!editingItem) return;

      setEditingItem((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          options: prev.options.filter((o) => o.itemOptionId !== optionId),
        };
      });
    },
    [editingItem]
  );

  const handleAddDiscount = useCallback(() => {
    // Feature not yet available
  }, []);

  const handleSaveOrder = useCallback(
    async (customerDetails?: CustomerDetails) => {
      if (!selectedBusinessId || !selectedItems.length) {
        return;
      }

      try {
        const created = await createOrder({
          businessId: selectedBusinessId,
          customer: customerDetails?.customer,
          customerEmail: customerDetails?.customerEmail,
          customerPhone: customerDetails?.customerPhone,
        });
        if (!created?.id) {
          return;
        }

        for (const item of selectedItems) {
          const orderItem = await addItemToOrder(created.id, {
            itemId: item.itemId,
            count: item.count,
          });

          if (item.options && item.options.length > 0 && orderItem?.id) {
            for (const option of item.options) {
              await addOptionToOrderItem(created.id, orderItem.id, {
                itemOptionId: option.itemOptionId,
                count: option.count,
              });
            }
          }
        }

        void navigate('/orders');
      } catch {
        // Error handled by redux
      }
    },
    [
      selectedBusinessId,
      selectedItems,
      createOrder,
      addItemToOrder,
      addOptionToOrderItem,
      navigate,
    ]
  );

  const confirmCancelOrder = useCallback(async () => {
    if (isEditMode && parsedOrderId) {
      try {
        await updateOrder(parsedOrderId, { status: 'Cancelled' });
        void navigate('/orders');
      } catch {
        // Error handled by redux
      }
    } else {
      setSelectedItems([]);
      void navigate('/orders');
    }
  }, [isEditMode, parsedOrderId, updateOrder, navigate]);

  const handleQuantityChange = useCallback((value: number) => {
    setEditingItem((prev) => (prev ? { ...prev, count: value } : null));
  }, []);

  const navigateBack = useCallback(() => {
    void navigate('/orders');
  }, [navigate]);

  const getOptionPriceLabel = useCallback(
    (optionId: number) =>
      formatPriceChange(
        getOptionPriceChangeLocal(
          optionId,
          getItemPriceLocal(editingItem?.itemId || 0)
        )
      ),
    [getOptionPriceChangeLocal, getItemPriceLocal, editingItem?.itemId]
  );

  return {
    // State
    isEditMode,
    parsedOrderId,
    selectedItems,
    editingItem,
    optionToAdd,
    error,
    total,
    orderInfoItems,
    availableOptionsForEdit,

    // Loading states
    loading: ordersLoading,
    itemsLoading,
    businessLoading,
    initialLoadComplete,
    tagsLoading,
    itemsByTagLoading,

    // Permissions
    canWriteOrders,
    canReadOrders,

    // Data
    items,
    displayedItems,
    tags,
    selectedTagId,
    setSelectedTagId,
    itemsByTagError,

    // Helpers
    getItemNameLocal,
    getOptionNameLocal,
    getOptionPriceLabel,

    // Handlers
    handleItemClick,
    handleEditItem,
    handleEditSave,
    handleEditCancel,
    handleRemoveItem,
    handleAddOption,
    handleRemoveOption,
    handleAddDiscount,
    handleSaveOrder,
    confirmCancelOrder,
    handleQuantityChange,
    setOptionToAdd,
    navigateBack,
  };
};
