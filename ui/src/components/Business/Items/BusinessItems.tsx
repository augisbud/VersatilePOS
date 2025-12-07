import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Modal,
  Popconfirm,
  Space,
  Table,
  Typography,
  Form,
  Input,
  InputNumber,
  Switch,
  Alert,
  Tag,
} from 'antd';
import { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ModelsItemDto } from '@/api/types.gen';
import { useItems } from '@/hooks/useItems';
import { useUser } from '@/hooks/useUser';

const { Title, Text } = Typography;

export interface ItemFormValues {
  name: string;
  price: number;
  quantityInStock?: number;
}

interface BusinessItemsProps {
  businessId: number;
}

export const BusinessItems = ({ businessId }: BusinessItemsProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<ModelsItemDto | null>(null);
  const [form] = Form.useForm<ItemFormValues>();
  const trackInventory = Form.useWatch('trackInventory', form);

  const {
    items,
    loading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    selectBusiness,
  } = useItems();
  const { canWriteItems } = useUser();

  useEffect(() => {
    selectBusiness(businessId);
    void fetchItems(businessId);
  }, [businessId]);

  useEffect(() => {
    if (!trackInventory) {
      form.setFieldsValue({ quantityInStock: undefined });
    }
  }, [trackInventory, form]);

  const handleOpenModal = (item?: ModelsItemDto) => {
    setEditingItem(item ?? null);
    setIsModalOpen(true);
    form.setFieldsValue({
      name: item?.name ?? '',
      price: item?.price ?? 0,
      quantityInStock: item?.quantityInStock,
      trackInventory: item?.trackInventory ?? Boolean(item?.quantityInStock),
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsSubmitting(false);
    setEditingItem(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
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
        trackInventory: trackInventory ?? false,
      };

      if (editingItem?.id) {
        await updateItem(editingItem.id, payload);
      } else {
        await createItem({ ...payload, businessId });
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
        value !== undefined ? <Tag color="blue">${value.toFixed(2)}</Tag> : '—',
    },
    {
      title: 'Quantity in Stock',
      dataIndex: 'quantityInStock',
      key: 'quantityInStock',
      render: (value?: number) => (value !== undefined ? value : '—'),
    },
    {
      title: 'Tracking',
      key: 'trackInventory',
      render: (_, record) => {
        const isTracking =
          record.trackInventory ?? record.quantityInStock !== undefined;
        return isTracking ? <Tag color="green">On</Tag> : 'Off';
      },
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

  return (
    <Card
      title={
        <Title level={4} style={{ margin: 0 }}>
          Items
        </Title>
      }
      extra={
        canWriteItems && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
            Add Item
          </Button>
        )
      }
    >
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '12px' }}
        />
      )}
      <Table
        columns={columns}
        dataSource={items}
        rowKey="id"
        loading={loading}
        pagination={false}
        locale={{ emptyText: 'No items yet. Add your first item!' }}
      />

      <Modal
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={() => void handleSubmit()}
        confirmLoading={isSubmitting}
        title={editingItem ? 'Edit Item' : 'Add Item'}
        okText={editingItem ? 'Save Changes' : 'Create Item'}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[
              { required: true, whitespace: true, message: 'Please enter item name' },
              { min: 2, message: 'Name should be at least 2 characters' },
              { max: 100, message: 'Name is too long' },
            ]}
          >
            <Input placeholder="Item name" />
          </Form.Item>
          <Form.Item
            name="price"
            label="Price"
            rules={[
              { required: true, message: 'Please enter item price' },
              {
                type: 'number',
                min: 0.01,
                message: 'Price must be greater than 0',
              },
            ]}
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
              {
                validator: (_, value) => {
                  if (!trackInventory) return Promise.resolve();
                  if (value === null || value === undefined) {
                    return Promise.reject(
                      new Error('Quantity is required when tracking inventory')
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
            hidden={!trackInventory}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="trackInventory"
            label="Track inventory"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};
