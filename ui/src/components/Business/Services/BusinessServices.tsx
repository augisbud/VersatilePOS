import { Card, Table, Typography, Button, Popconfirm, Tag, Space } from 'antd';
import { DeleteOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useServices } from '@/hooks/useServices';
import { useUser } from '@/hooks/useUser';
import type { ColumnsType } from 'antd/es/table';
import { ModelsServiceDto } from '@/api/types.gen';
import { ServiceFormModal, ServiceFormValues } from './ServiceFormModal';

const { Title } = Typography;

interface BusinessServicesProps {
  businessId: number;
}

export const BusinessServices = ({ businessId }: BusinessServicesProps) => {
  const {
    services,
    loading,
    fetchServices,
    createService,
    updateService,
    deleteService,
  } = useServices();
  const { canWriteServices } = useUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingService, setEditingService] = useState<ModelsServiceDto | null>(
    null
  );

  useEffect(() => {
    void fetchServices(businessId);
  }, [businessId]);

  const handleDelete = async (serviceId: number) => {
    try {
      await deleteService(serviceId);
    } catch (error) {
      console.error('Failed to delete service:', error);
    }
  };

  const handleOpenModal = (service?: ModelsServiceDto) => {
    setEditingService(service || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsSubmitting(false);
    setEditingService(null);
  };

  const handleSubmit = async (values: ServiceFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingService && editingService.id) {
        await updateService(editingService.id, values);
      } else {
        await createService({ ...values, businessId });
      }

      handleCloseModal();
    } catch (error) {
      console.error('Failed to save service:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) {
      return '-';
    }

    return `$${price.toFixed(2)}`;
  };

  const columns: ColumnsType<ModelsServiceDto> = [
    {
      title: 'Service Name',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <span style={{ fontWeight: 500 }}>{name}</span>,
    },
    {
      title: 'Hourly Price',
      dataIndex: 'hourlyPrice',
      key: 'hourlyPrice',
      render: (price) => <Tag color="green">{formatPrice(price)}/hr</Tag>,
    },
    {
      title: 'Service Charge',
      dataIndex: 'serviceCharge',
      key: 'serviceCharge',
      render: (charge) =>
        charge ? <Tag color="blue">{formatPrice(charge)}</Tag> : '-',
    },
    {
      title: 'Booking Interval',
      dataIndex: 'provisioningInterval',
      key: 'provisioningInterval',
      render: (interval) => (interval ? `${interval} min` : '-'),
    },
    {
      title: 'Available Hours',
      key: 'hours',
      render: (_, record) =>
        record.provisioningStartTime && record.provisioningEndTime ? (
          <span>
            {record.provisioningStartTime} - {record.provisioningEndTime}
          </span>
        ) : (
          '-'
        ),
    },
  ];

  if (canWriteServices) {
    columns.push({
      title: '',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete service"
            description="Are you sure you want to delete this service?"
            onConfirm={() => void handleDelete(record.id!)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    });
  }

  return (
    <>
      <Card
        title={
          <Title level={4} style={{ margin: 0 }}>
            Services
          </Title>
        }
        extra={
          canWriteServices && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenModal()}
            >
              Add Service
            </Button>
          )
        }
      >
        <Table
          columns={columns}
          dataSource={services}
          rowKey="id"
          loading={loading}
          pagination={false}
          locale={{ emptyText: 'No services yet. Add your first service!' }}
        />
      </Card>

      <ServiceFormModal
        open={isModalOpen}
        editingService={editingService}
        isSubmitting={isSubmitting}
        onClose={handleCloseModal}
        onSubmit={(values) => void handleSubmit(values)}
      />
    </>
  );
};
