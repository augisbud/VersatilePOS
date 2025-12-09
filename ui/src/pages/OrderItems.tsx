import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Card } from 'antd';
import { useOrders } from '@/hooks/useOrders';
import { useItems } from '@/hooks/useItems';
import { useUser } from '@/hooks/useUser';
import { ModelsOrderItemDto } from '@/api/types.gen';
import { OrderItemsHeader } from '@/components/Orders/OrderItemsHeader';
import { OrderDetailsCard } from '@/components/Orders/OrderDetailsCard';
import { AddOrderItemCard } from '@/components/Orders/AddOrderItemCard';
import { OrderItemsTable } from '@/components/Orders/OrderItemsTable';

export const OrderItems = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const parsedOrderId = Number(orderId);

  const { canReadOrders, canWriteOrders } = useUser();
  const {
    orderItems,
    selectedOrder,
    loading,
    error,
    fetchOrderById,
    fetchItemsForOrder,
    updateOrderItem,
    addItemToOrder,
    removeItemFromOrder,
  } = useOrders();
  const { items, fetchItems } = useItems();

  const [counts, setCounts] = useState<Record<number, number>>({});
  const [initialLoadError, setInitialLoadError] = useState<string>();
  const [itemToAdd, setItemToAdd] = useState<number | undefined>();
  const [itemQuantity, setItemQuantity] = useState<number>(1);

  const itemLookup = useMemo(
    () =>
      items.reduce<Record<number, string>>((acc, item) => {
        if (item.id !== undefined && item.name) {
          acc[item.id] = item.name;
        }
        return acc;
      }, {}),
    [items]
  );

  const syncCounts = (data: ModelsOrderItemDto[]) => {
    const next: Record<number, number> = {};
    data.forEach((item) => {
      if (item.id !== undefined && item.count !== undefined) {
        next[item.id] = item.count;
      }
    });
    setCounts(next);
  };

  const loadData = async () => {
    if (!parsedOrderId || Number.isNaN(parsedOrderId)) {
      setInitialLoadError('Invalid order id');
      return;
    }

    setInitialLoadError(undefined);
    try {
      const order = await fetchOrderById(parsedOrderId);
      if (order?.businessId) {
        await fetchItems(order.businessId);
      }
      await fetchItemsForOrder(parsedOrderId);
    } catch (err) {
      console.error('Failed to load order items', err);
      setInitialLoadError('Failed to load order items');
    }
  };

  useEffect(() => {
    void loadData();
  }, [parsedOrderId]);

  useEffect(() => {
    syncCounts(orderItems);
  }, [orderItems]);

  const itemOptions = useMemo(
    () =>
      items
        .filter((item) => item.id !== undefined)
        .map((item) => ({
          label: item.name ?? `Item #${item.id}`,
          value: item.id as number,
        })),
    [items]
  );

  const handleCountChange = (itemId: number, value: number | null) => {
    setCounts((prev) => ({
      ...prev,
      [itemId]: value ?? 0,
    }));
  };

  const handleSave = async (item: ModelsOrderItemDto) => {
    if (!item.id || !parsedOrderId) {
      return;
    }

    const nextCount = counts[item.id] ?? item.count ?? 0;
    if (nextCount <= 0) {
      return;
    }

    await updateOrderItem(parsedOrderId, item.id, { count: nextCount });
    await fetchItemsForOrder(parsedOrderId);
  };

  const handleAddItem = async () => {
    if (!parsedOrderId || !itemToAdd || itemQuantity <= 0) {
      return;
    }

    await addItemToOrder(parsedOrderId, {
      itemId: itemToAdd,
      count: itemQuantity,
    });
    await fetchItemsForOrder(parsedOrderId);

    setItemQuantity(1);
    setItemToAdd(undefined);
  };

  const handleRemoveItem = async (item: ModelsOrderItemDto) => {
    if (!parsedOrderId || !item.id) {
      return;
    }

    await removeItemFromOrder(parsedOrderId, item.id);
    await fetchItemsForOrder(parsedOrderId);
  };

  if (!canReadOrders) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="You don't have permission to view orders."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <OrderItemsHeader
        onBack={() => {
          void navigate('/orders');
        }}
        onRefresh={() => void loadData()}
        loading={loading}
        hasOrderId={!!parsedOrderId}
      />

      {(error || initialLoadError) && (
        <Alert
          message="Error"
          description={error || initialLoadError}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <OrderDetailsCard order={selectedOrder} />

      <AddOrderItemCard
        itemOptions={itemOptions}
        itemToAdd={itemToAdd}
        itemQuantity={itemQuantity}
        onItemToAddChange={setItemToAdd}
        onItemQuantityChange={(value) => setItemQuantity(value)}
        onAddItem={() => void handleAddItem()}
        disabled={!canWriteOrders}
      />

      <Card>
        <OrderItemsTable
          items={orderItems}
          itemLookup={itemLookup}
          counts={counts}
          canWriteOrders={canWriteOrders}
          loading={loading}
          onCountChange={handleCountChange}
          onSave={(item) => void handleSave(item)}
          onRemove={(item) => void handleRemoveItem(item)}
        />
      </Card>
    </div>
  );
};
