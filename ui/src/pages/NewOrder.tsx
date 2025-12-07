import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Typography,
  message,
  Space,
} from 'antd';
import { useOrders } from '@/hooks/useOrders';
import { useBusiness } from '@/hooks/useBusiness';
import { useUser } from '@/hooks/useUser';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useItems } from '@/hooks/useItems';
import { getUserBusinessId } from '@/selectors/user';
import { ModelsCreateOrderRequest } from '@/api/types.gen';

const { Title, Text } = Typography;

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
  const {
    items,
    fetchItems,
    loading: itemsLoading,
  } = useItems();
  const userBusinessId = useAppSelector(getUserBusinessId);

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
    if (!itemToAdd) {
      void message.error('Select an item to add');
      return;
    }
    if (itemQuantity <= 0) {
      void message.error('Quantity must be at least 1');
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
    try {
      const values = await form.validateFields();

      if (!selectedBusinessId) {
        void message.error('Select a business first');
        return;
      }
      if (!selectedItems.length) {
        void message.error('Add at least one item to the order');
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
        throw new Error('Order created without id');
      }

      for (const item of selectedItems) {
        await addItemToOrder(created.id, {
          itemId: item.itemId,
          count: item.count,
        });
      }

      void message.success('Order created with items');
      void navigate('/orders');
    } catch (err) {
      console.error('Failed to create order', err);
      void message.error('Failed to create order');
    }
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
          <div>
            <Text strong>Select business:</Text>
            <div style={{ marginTop: 8 }}>
              <Select
                style={{ minWidth: 280 }}
                placeholder="Choose a business"
                loading={businessLoading}
                value={selectedBusinessId}
                onChange={(businessId) => selectBusiness(businessId)}
                options={businesses
                  .filter((business) => business.id !== undefined)
                  .map((business) => ({
                    label: business.name,
                    value: business.id!,
                  }))}
              />
            </div>
          </div>

          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
            />
          )}

          <Form layout="vertical" form={form}>
            <Form.Item label="Customer name" name="customer">
              <Input placeholder="Optional" />
            </Form.Item>
            <Form.Item label="Customer email" name="customerEmail">
              <Input type="email" placeholder="Optional" />
            </Form.Item>
            <Form.Item label="Customer phone" name="customerPhone">
              <Input placeholder="Optional" />
            </Form.Item>
            <Form.Item label="Service charge" name="serviceCharge">
              <InputNumber
                min={0}
                step={0.01}
                prefix="$"
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item label="Tip amount" name="tipAmount">
              <InputNumber
                min={0}
                step={0.01}
                prefix="$"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Form>

        <Card
          title="Items"
          size="small"
          style={{ marginTop: 12 }}
          loading={itemsLoading}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Space wrap>
              <Select
                style={{ minWidth: 260 }}
                placeholder="Choose an item"
                value={itemToAdd}
                onChange={setItemToAdd}
                options={itemOptions}
                disabled={!selectedBusinessId}
              />
              <InputNumber
                min={1}
                value={itemQuantity}
                onChange={(value) => setItemQuantity(value ?? 1)}
              />
              <Button type="primary" onClick={handleAddItem}>
                Add
              </Button>
            </Space>

            {selectedItems.length === 0 ? (
              <Text type="secondary">No items selected yet.</Text>
            ) : (
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                {selectedItems.map((item) => {
                  const itemName =
                    itemOptions.find((opt) => opt.value === item.itemId)?.label ??
                    `Item #${item.itemId}`;
                  return (
                    <li key={item.itemId} style={{ marginBottom: 4 }}>
                      <Space>
                        <Text>
                          {itemName} — Qty: {item.count}
                        </Text>
                        <Button
                          type="link"
                          danger
                          onClick={() => handleRemoveItem(item.itemId)}
                          size="small"
                        >
                          Remove
                        </Button>
                      </Space>
                    </li>
                  );
                })}
              </ul>
            )}
          </Space>
        </Card>

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
