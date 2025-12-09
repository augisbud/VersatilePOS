import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Card, Form, message } from 'antd';
import { useOrders } from '@/hooks/useOrders';
import { useBusiness } from '@/hooks/useBusiness';
import { useUser } from '@/hooks/useUser';
import { useAppSelector } from '@/hooks/useAppSelector';
import { getUserBusinessId } from '@/selectors/user';
import { ModelsOrderDto } from '@/api/types.gen';
import { OrdersHeader } from '@/components/Orders/OrdersHeader';
import { OrdersBusinessSelectorCard } from '@/components/Orders/OrdersBusinessSelectorCard';
import { OrdersTable } from '@/components/Orders/OrdersTable';
import { OrderEditModal } from '@/components/Orders/OrderEditModal';

type OrderFormValues = {
  customer?: string;
  customerEmail?: string;
  customerPhone?: string;
  serviceCharge?: number;
  status?: string;
  tipAmount?: number;
};

export const Orders = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<OrderFormValues>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ModelsOrderDto | null>(null);
  const {
    orders,
    selectedBusinessId,
    loading: ordersLoading,
    error,
    fetchOrders,
    updateOrder,
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

  const handleOpenModal = (order: ModelsOrderDto) => {
    setEditingOrder(order);
    form.setFieldsValue({
      customer: order.customer,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      serviceCharge: order.serviceCharge,
      status: order.status,
      tipAmount: order.tipAmount,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingOrder(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!editingOrder?.id) return;

      await updateOrder(editingOrder.id, {
        customer: values.customer || undefined,
        customerEmail: values.customerEmail || undefined,
        customerPhone: values.customerPhone || undefined,
        serviceCharge: values.serviceCharge,
        status: values.status || undefined,
        tipAmount: values.tipAmount,
      });

      message.success('Order updated');
      handleCloseModal();
    } catch (err) {
      console.error('Failed to update order', err);
      message.error('Failed to update order');
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

      <OrdersBusinessSelectorCard
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
          onEdit={handleOpenModal}
          onItems={(orderId) => {
            void navigate(`/orders/${orderId}/items`);
          }}
        />
      </Card>

      <OrderEditModal
        open={isModalOpen}
        form={form}
        loading={ordersLoading}
        onCancel={handleCloseModal}
        onSubmit={() => void handleSubmit()}
      />
    </div>
  );
};
