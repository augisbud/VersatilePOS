import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/es/table';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useItems } from '@/hooks/useItems';
import { useBusiness } from '@/hooks/useBusiness';
import { useUser } from '@/hooks/useUser';
import { ModelsItemDto } from '@/api/types.gen';
import { useAppSelector } from '@/hooks/useAppSelector';
import { getUserBusinessId } from '@/selectors/user';

const { Title, Text } = Typography;

export const Items = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<ModelsItemDto | null>(null);
  const [form] = Form.useForm();

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
  const userBusinessId = useAppSelector(getUserBusinessId);

  const combinedLoading = itemsLoading || businessLoading;

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

  const handleBusinessChange = (businessId: number) => {
    selectBusiness(businessId);
  };

  const handleOpenModal = (item?: ModelsItemDto) => {
    setEditingItem(item ?? null);
    setIsModalOpen(true);
    form.setFieldsValue({
      name: item?.name,
      price: item?.price,
      quantityInStock: item?.quantityInStock,
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsSubmitting(false);
    setEditingItem(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    if (!selectedBusinessId) {
      return;
    }

    setIsSubmitting(true);
    try {
      const values = await form.validateFields();
      const quantityInStock =
        values.quantityInStock === null || values.quantityInStock === undefined
          ? undefined
          : values.quantityInStock;
      const payload = {
        name: values.name,
        price: values.price,
        quantityInStock,
      };

      if (editingItem?.id) {
        await updateItem(editingItem.id, payload);
      } else {
        await createItem({ ...payload, businessId: selectedBusinessId });
      }

      handleCloseModal();
    } catch (err) {
      console.error('Failed to save item', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (itemId: number) => {
    try {
      await deleteItem(itemId);
    } catch (err) {
      console.error('Failed to delete item', err);
    }
  };

  const columns: ColumnsType<ModelsItemDto> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (value: string) => <Text strong>{value}</Text>,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (value?: number) =>
        value !== undefined ? `$${value.toFixed(2)}` : '-',
    },
    {
      title: 'Quantity in Stock',
      dataIndex: 'quantityInStock',
      key: 'quantityInStock',
      render: (value?: number) => (value !== undefined ? value : '—'),
    },
  ];

  if (canWriteItems) {
    columns.push({
      title: '',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete item"
            description="Are you sure you want to delete this item?"
            onConfirm={() => void handleDelete(record.id!)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    });
  }

  if (!canReadItems) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="You don't have permission to view items."
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
            Items
          </Title>
          <Text type="secondary">
            Manage items for any of your businesses.
          </Text>
        </div>

        {canWriteItems && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenModal()}
            disabled={!selectedBusinessId}
          >
            New Item
          </Button>
        )}
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
          dataSource={items}
          rowKey="id"
          loading={combinedLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          locale={{
            emptyText: selectedBusinessId
              ? 'No items found for this business.'
              : 'Select a business to view items.',
          }}
        />
      </Card>

      <Modal
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={() => void handleSubmit()}
        confirmLoading={isSubmitting}
        title={editingItem ? 'Edit Item' : 'New Item'}
        okText={editingItem ? 'Save Changes' : 'Create Item'}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter item name' }]}
          >
            <Input placeholder="Item name" />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Please enter item price' }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              style={{ width: '100%' }}
              prefix="$"
            />
          </Form.Item>

          <Form.Item
            name="quantityInStock"
            label="Quantity in stock"
            rules={[
              {
                type: 'number',
                min: 0,
                message: 'Quantity must be zero or greater',
              },
            ]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
