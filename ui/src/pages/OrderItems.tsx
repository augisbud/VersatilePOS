import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  InputNumber,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowLeftOutlined,
  ReloadOutlined,
  SaveOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useOrders } from '@/hooks/useOrders';
import { useItems } from '@/hooks/useItems';
import { useUser } from '@/hooks/useUser';
import { ModelsOrderItemDto } from '@/api/types.gen';

const { Title, Text } = Typography;

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
    // We only want to re-run when the order id changes
     
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
    if (!item.id || !parsedOrderId) return;

    const nextCount = counts[item.id] ?? item.count ?? 0;
    if (nextCount <= 0) {
      message.error('Quantity must be at least 1');
      return;
    }

    try {
      await updateOrderItem(parsedOrderId, item.id, { count: nextCount });
      message.success('Order item updated');
      await fetchItemsForOrder(parsedOrderId);
    } catch (err) {
      console.error('Failed to update order item', err);
      message.error('Failed to update order item');
    }
  };

  const handleAddItem = async () => {
    if (!parsedOrderId) return;
    if (!itemToAdd) {
      message.error('Select an item to add');
      return;
    }
    if (itemQuantity <= 0) {
      message.error('Quantity must be at least 1');
      return;
    }

    try {
      await addItemToOrder(parsedOrderId, {
        itemId: itemToAdd,
        count: itemQuantity,
      });
      message.success('Item added to order');
      await fetchItemsForOrder(parsedOrderId);
      setItemQuantity(1);
      setItemToAdd(undefined);
    } catch (err) {
      console.error('Failed to add item to order', err);
      message.error('Failed to add item to order');
    }
  };

  const handleRemoveItem = async (item: ModelsOrderItemDto) => {
    if (!parsedOrderId || !item.id) return;

    try {
      await removeItemFromOrder(parsedOrderId, item.id);
      message.success('Item removed from order');
      await fetchItemsForOrder(parsedOrderId);
    } catch (err) {
      console.error('Failed to remove order item', err);
      message.error('Failed to remove order item');
    }
  };

  const columns: ColumnsType<ModelsOrderItemDto> = [
    {
      title: 'Item',
      dataIndex: 'itemId',
      key: 'itemId',
      render: (value?: number) => {
        if (!value) return '—';
        const name = itemLookup[value];
        return name ? `${name} (#${value})` : `Item #${value}`;
      },
    },
    {
      title: 'Quantity',
      dataIndex: 'count',
      key: 'count',
      width: 160,
      render: (_: number | undefined, record) => {
        const current = record.id !== undefined ? counts[record.id] : record.count;
        return (
          <InputNumber
            min={1}
            value={current ?? 1}
            onChange={(value) => record.id && handleCountChange(record.id, value)}
            disabled={!canWriteOrders}
          />
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) =>
        record.id && canWriteOrders ? (
          <Space size="small">
            <Button
              type="link"
              icon={<SaveOutlined />}
              onClick={() => void handleSave(record)}
            >
              Save
            </Button>
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => void handleRemoveItem(record)}
            >
              Remove
            </Button>
          </Space>
        ) : (
          <Text type="secondary">No actions</Text>
        ),
    },
  ];

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
      <Space
        style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}
      >
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
              onClick={() => {
                void navigate('/orders');
              }}
            type="text"
          >
            Back to orders
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            Order Items
          </Title>
        </Space>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => void loadData()}
          disabled={loading || !parsedOrderId}
        >
          Refresh
        </Button>
      </Space>

      {(error || initialLoadError) && (
        <Alert
          message="Error"
          description={error || initialLoadError}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Card style={{ marginBottom: 16 }}>
        <Descriptions
          title="Order details"
          column={2}
          labelStyle={{ width: 160 }}
          size="small"
        >
          <Descriptions.Item label="Order #">
            {selectedOrder?.id ? `#${selectedOrder.id}` : '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            {selectedOrder?.status ? (
              <Tag>{selectedOrder.status}</Tag>
            ) : (
              <Text type="secondary">Unknown</Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Customer">
            {selectedOrder?.customer || 'Walk-in'}
          </Descriptions.Item>
          <Descriptions.Item label="Placed at">
            {selectedOrder?.datePlaced
              ? new Date(selectedOrder.datePlaced).toLocaleString()
              : '—'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Space wrap>
            <Select
              style={{ minWidth: 240 }}
              placeholder="Choose an item"
              value={itemToAdd}
              onChange={setItemToAdd}
              options={itemOptions}
              disabled={!canWriteOrders}
            />
            <InputNumber
              min={1}
              value={itemQuantity}
              onChange={(value) => setItemQuantity(value ?? 1)}
              disabled={!canWriteOrders}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => void handleAddItem()}
              disabled={!canWriteOrders}
            >
              Add item
            </Button>
          </Space>
          <Text type="secondary">
            Add new items to this order or adjust quantities below.
          </Text>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={orderItems}
          rowKey={(record) => record.id ?? `${record.itemId}-${record.orderId}`}
          loading={loading}
          pagination={false}
          locale={{
            emptyText: 'No items found for this order.',
          }}
        />
      </Card>
    </div>
  );
};
