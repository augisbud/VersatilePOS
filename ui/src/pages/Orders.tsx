import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, message } from 'antd';
import { AccessDenied } from '@/components/shared';
import { useOrders } from '@/hooks/useOrders';
import { useBusiness } from '@/hooks/useBusiness';
import { useUser } from '@/hooks/useUser';
import { useItems } from '@/hooks/useItems';
import { useItemOptions } from '@/hooks/useItemOptions';
import { usePriceModifiers } from '@/hooks/usePriceModifiers';
import { useAppSelector } from '@/hooks/useAppSelector';
import { getUserBusinessId } from '@/selectors/user';
import { ModelsOrderDto } from '@/api/types.gen';
import { OrdersHeader, OrdersGrid } from '@/components/Orders';
import { BusinessSelectorCard } from '@/components/Items';
import { getItemPrice } from '@/selectors/item';
import { calculateOptionsPrice } from '@/utils/orderCalculations';

export const Orders = () => {
  const navigate = useNavigate();
  const {
    orders,
    selectedBusinessId,
    orderItemsByOrderId,
    allItemOptionLinks,
    loading: ordersLoading,
    error,
    fetchOrders,
    fetchItemsForAllOrders,
    selectBusiness,
    updateOrder,
  } = useOrders();
  const {
    businesses,
    loading: businessLoading,
    fetchAllBusinesses,
  } = useBusiness();
  const { items, fetchItems } = useItems();
  const { itemOptions, fetchItemOptions } = useItemOptions();
  const { priceModifiers, fetchPriceModifiers } = usePriceModifiers();
  const { canReadOrders, canWriteOrders } = useUser();
  const userBusinessId = useAppSelector(getUserBusinessId);

  const combinedLoading = ordersLoading || businessLoading;

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
    if (selectedBusinessId && canReadOrders) {
      void fetchOrders(selectedBusinessId);
      void fetchItems(selectedBusinessId);
      void fetchItemOptions(selectedBusinessId);
      void fetchPriceModifiers(selectedBusinessId);
    }
  }, [selectedBusinessId, canReadOrders]);

  // Fetch order items for all orders when orders are loaded
  useEffect(() => {
    if (orders.length > 0) {
      const orderIds = orders
        .map((order) => order.id)
        .filter((id): id is number => id !== undefined);
      if (orderIds.length > 0) {
        void fetchItemsForAllOrders(orderIds);
      }
    }
  }, [orders]);

  // Calculate items subtotal for each order (including item options)
  const orderItemsSubtotals = useMemo(() => {
    const subtotals: Record<number, number> = {};
    for (const [orderIdStr, orderItemsList] of Object.entries(
      orderItemsByOrderId
    )) {
      const orderId = parseInt(orderIdStr, 10);
      let subtotal = 0;
      for (const orderItem of orderItemsList) {
        if (orderItem.itemId && orderItem.count) {
          const basePrice = getItemPrice(items, orderItem.itemId);

          // Get options for this order item and calculate their price
          const optionLinks = orderItem.id
            ? (allItemOptionLinks[orderItem.id] ?? [])
            : [];
          const optionsPrice = calculateOptionsPrice(
            optionLinks,
            basePrice,
            itemOptions,
            priceModifiers
          );

          subtotal += (basePrice + optionsPrice) * orderItem.count;
        }
      }
      subtotals[orderId] = subtotal;
    }
    return subtotals;
  }, [
    orderItemsByOrderId,
    items,
    allItemOptionLinks,
    itemOptions,
    priceModifiers,
  ]);

  const handleBusinessChange = (businessId: number) => {
    selectBusiness(businessId);
  };

  const handleRefresh = () => {
    if (selectedBusinessId) {
      void fetchOrders(selectedBusinessId);
    }
  };

  const handleNewOrder = () => {
    void navigate('/orders/new');
  };

  const handleEditOrder = (order: ModelsOrderDto) => {
    if (order.id) {
      void navigate(`/orders/${order.id}/edit`);
    }
  };

  const handleCancelOrder = (orderId: number) => {
    void (async () => {
      try {
        await updateOrder(orderId, { status: 'Cancelled' });
        void message.success('Order cancelled successfully');
        if (selectedBusinessId) {
          void fetchOrders(selectedBusinessId);
        }
      } catch {
        void message.error('Failed to cancel order');
      }
    })();
  };

  const handleRefundOrder = (orderId: number) => {
    void (async () => {
      try {
        await updateOrder(orderId, { status: 'Refunded' });
        void message.success('Order refunded successfully');
        if (selectedBusinessId) {
          void fetchOrders(selectedBusinessId);
        }
      } catch {
        void message.error('Failed to refund order');
      }
    })();
  };

  if (!canReadOrders) {
    return <AccessDenied resource="orders" />;
  }

  return (
    <div
      style={{
        padding: '24px',
        margin: '0 auto',
      }}
    >
      <OrdersHeader
        selectedBusinessId={selectedBusinessId}
        onNewOrder={handleNewOrder}
        onRefresh={handleRefresh}
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
          style={{ marginBottom: '16px', borderRadius: 12 }}
        />
      )}

      <OrdersGrid
        orders={orders}
        loading={combinedLoading}
        canWriteOrders={canWriteOrders}
        selectedBusinessId={selectedBusinessId}
        orderItemsSubtotals={orderItemsSubtotals}
        onEdit={handleEditOrder}
        onCancel={handleCancelOrder}
        onRefund={handleRefundOrder}
        onNewOrder={handleNewOrder}
      />
    </div>
  );
};
