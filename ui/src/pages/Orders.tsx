import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Card } from 'antd';
import { useOrders } from '@/hooks/useOrders';
import { useBusiness } from '@/hooks/useBusiness';
import { useUser } from '@/hooks/useUser';
import { useAppSelector } from '@/hooks/useAppSelector';
import { getUserBusinessId } from '@/selectors/user';
import { ModelsOrderDto } from '@/api/types.gen';
import { OrdersHeader } from '@/components/Orders/OrdersHeader';
import { BusinessSelectorCard } from '@/components/Items';
import { OrdersTable } from '@/components/Orders/OrdersTable';

export const Orders = () => {
  const navigate = useNavigate();
  const {
    orders,
    selectedBusinessId,
    loading: ordersLoading,
    error,
    fetchOrders,
    selectBusiness,
  } = useOrders();
  const {
    businesses,
    loading: businessLoading,
    fetchAllBusinesses,
  } = useBusiness();
  const { canReadOrders } = useUser();
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
    }
  }, [selectedBusinessId, canReadOrders]);

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
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
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
          style={{ marginBottom: '16px' }}
        />
      )}

      <Card>
        <OrdersTable
          orders={orders}
          loading={combinedLoading}
          selectedBusinessId={selectedBusinessId}
          canReadOrders={canReadOrders}
          onEdit={handleEditOrder}
        />
      </Card>
    </div>
  );
};
