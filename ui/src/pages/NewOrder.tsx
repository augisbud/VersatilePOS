import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Form, Typography, Space } from 'antd';
import { useOrders } from '@/hooks/useOrders';
import { useBusiness } from '@/hooks/useBusiness';
import { useUser } from '@/hooks/useUser';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useItems } from '@/hooks/useItems';
import { getUserBusinessId } from '@/selectors/user';
import { ModelsCreateOrderRequest } from '@/api/types.gen';
import { BusinessSelectorCard } from '@/components/Items';
import { CustomerDetailsForm } from '@/components/Orders/CustomerDetailsForm';
import { OrderItemsCard } from '@/components/Orders/OrderItemsCard';

const { Title } = Typography;

type OrderFormValues = {
  customer?: string;
  customerEmail?: string;
  customerPhone?: string;
  serviceCharge?: number;
  tipAmount?: number;
};

export const NewOrder = () => {
  const [form] = Form.useForm<OrderFormValues>();
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<
    { itemId: number; count: number }[]
  >([]);
  const [itemToAdd, setItemToAdd] = useState<number | undefined>();
  const [itemQuantity, setItemQuantity] = useState<number>(1);

  const {
    createOrder,
    selectedBusinessId,
    selectBusiness,
    loading,
    error,
    addItemToOrder,
  } = useOrders();
  const {
    businesses,
    loading: businessLoading,
    fetchAllBusinesses,
  } = useBusiness();
  const { canWriteOrders } = useUser();
  const { items, fetchItems, loading: itemsLoading } = useItems();
  const userBusinessId = useAppSelector(getUserBusinessId);

  useEffect(() => {
    void fetchAllBusinesses();
  }, []);

  useEffect(() => {
    if (!businesses.length) {
      return;
    }

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

  const handleAddItem = () => {
    if (!itemToAdd || itemQuantity <= 0) {
      return;
    }

    setSelectedItems((prev) => {
      const existing = prev.find((p) => p.itemId === itemToAdd);
      if (existing) {
        return prev.map((p) =>
          p.itemId === itemToAdd ? { ...p, count: itemQuantity } : p
        );
      }
      return [...prev, { itemId: itemToAdd, count: itemQuantity }];
    });
  };

  const handleRemoveItem = (itemId: number) => {
    setSelectedItems((prev) => prev.filter((item) => item.itemId !== itemId));
  };

  const handleCancel = () => {
    void navigate('/orders');
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();

    if (!selectedBusinessId || !selectedItems.length) {
      return;
    }

    const payload: ModelsCreateOrderRequest = {
      businessId: selectedBusinessId,
      customer: values.customer || undefined,
      customerEmail: values.customerEmail || undefined,
      customerPhone: values.customerPhone || undefined,
      serviceCharge: values.serviceCharge,
      tipAmount: values.tipAmount,
    };

    const created = await createOrder(payload);
    if (!created?.id) {
      return;
    }

    for (const item of selectedItems) {
      await addItemToOrder(created.id, {
        itemId: item.itemId,
        count: item.count,
      });
    }

    void navigate('/orders');
  };

  if (!canWriteOrders) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="You don't have permission to create orders."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <Card
        title={
          <Title level={4} style={{ margin: 0 }}>
            New Order
          </Title>
        }
        extra={
          <Button onClick={handleCancel} type="text">
            Cancel
          </Button>
        }
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <BusinessSelectorCard
            businesses={businesses}
            selectedBusinessId={selectedBusinessId}
            loading={businessLoading}
            onChange={(businessId) => selectBusiness(businessId)}
          />

          {error && (
            <Alert message="Error" description={error} type="error" showIcon />
          )}

          <CustomerDetailsForm form={form} />

          <OrderItemsCard
            itemOptions={itemOptions}
            selectedItems={selectedItems}
            itemToAdd={itemToAdd}
            itemQuantity={itemQuantity}
            onItemToAddChange={setItemToAdd}
            onItemQuantityChange={(value) => setItemQuantity(value)}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
            loading={itemsLoading}
            disabled={!selectedBusinessId}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button
              type="primary"
              onClick={() => void handleSubmit()}
              loading={loading}
              disabled={!selectedBusinessId || !selectedItems.length}
            >
              Create Order
            </Button>
          </div>
        </Space>
      </Card>
    </div>
  );
};
