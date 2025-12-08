import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useOrders } from '@/hooks/useOrders';
import { useBusiness } from '@/hooks/useBusiness';
import { useUser } from '@/hooks/useUser';
import { useAppSelector } from '@/hooks/useAppSelector';
import { getUserBusinessId } from '@/selectors/user';
import { ModelsOrderDto } from '@/api/types.gen';

const { Title, Text } = Typography;

const ORDER_STATUS_OPTIONS = ['Pending', 'Completed', 'Cancelled'];

const ORDER_STATUS_COLOR: Record<string, string> = {
  Pending: 'blue',
  Completed: 'green',
  Cancelled: 'red',
};

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

  const columns: ColumnsType<ModelsOrderDto> = [
    {
      title: 'Order #',
      dataIndex: 'id',
      key: 'id',
      render: (value?: number) => (value ? `#${value}` : '—'),
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      render: (value?: string) => value || 'Walk-in',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (value?: string) => {
        const color = value ? ORDER_STATUS_COLOR[value] ?? 'default' : 'default';
        return value ? <Tag color={color}>{value}</Tag> : <Tag>Unknown</Tag>;
      },
    },
    {
      title: 'Service Charge',
      dataIndex: 'serviceCharge',
      key: 'serviceCharge',
      render: (value?: number) =>
        value !== undefined ? `$${value.toFixed(2)}` : '—',
    },
    {
      title: 'Tip',
      dataIndex: 'tipAmount',
      key: 'tipAmount',
      render: (value?: number) =>
        value !== undefined ? `$${value.toFixed(2)}` : '—',
    },
    {
      title: 'Placed At',
      dataIndex: 'datePlaced',
      key: 'datePlaced',
      render: (value?: string) =>
        value ? new Date(value).toLocaleString() : '—',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (_, record) =>
        canReadOrders ? (
          <Space size="small">
          <Button type="link" onClick={() => handleOpenModal(record)}>
            Edit
          </Button>
            {record.id && (
              <Button
                type="link"
                onClick={() => {
                  void navigate(`/orders/${record.id}/items`);
                }}
              >
                Items
              </Button>
            )}
          </Space>
        ) : null,
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
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div
        style={{
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Orders
          </Title>
          <Text type="secondary">
            View orders for your selected business.
          </Text>
        </div>

        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleNewOrder}
            disabled={!selectedBusinessId}
          >
            New Order
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            disabled={!selectedBusinessId}
          >
            Refresh
          </Button>
        </Space>
      </div>

      <Card style={{ marginBottom: '16px' }}>
        <Space size="middle" wrap>
          <Text strong>Select business:</Text>
          <Select
            style={{ minWidth: 240 }}
            placeholder="Choose a business"
            loading={businessLoading}
            value={selectedBusinessId}
            onChange={handleBusinessChange}
            options={businesses
              .filter((business) => business.id !== undefined)
              .map((business) => ({
                label: business.name,
                value: business.id!,
              }))}
          />
        </Space>
      </Card>

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
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={combinedLoading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} orders`,
          }}
          locale={{
            emptyText: selectedBusinessId
              ? 'No orders found for this business.'
              : 'Select a business to view orders.',
          }}
        />
      </Card>

      <Modal
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={() => void handleSubmit()}
        title="Edit Order"
        okText="Save"
        confirmLoading={ordersLoading}
        destroyOnClose
      >
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
          <Form.Item label="Status" name="status">
            <Select
              placeholder="Select status"
              allowClear
              options={ORDER_STATUS_OPTIONS.map((status) => ({
                label: status,
                value: status,
              }))}
            />
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
      </Modal>
    </div>
  );
};
