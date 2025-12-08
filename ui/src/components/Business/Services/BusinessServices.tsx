import { Card, Table, Typography, Button, Popconfirm, Tag, Space } from 'antd';
import {
  DeleteOutlined,
  PlusOutlined,
  EditOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useServices } from '@/hooks/useServices';
import { useEmployees } from '@/hooks/useEmployees';
import { useUser } from '@/hooks/useUser';
import type { ColumnsType } from 'antd/es/table';
import { ModelsServiceDto } from '@/api/types.gen';
import { ServiceFormModal, ServiceFormValues } from './ServiceFormModal';
import { AssignEmployeeModal } from './AssignEmployeeModal';

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
    assignEmployeeToService,
    unassignEmployeeFromService,
    getServiceById,
    assignmentLoading,
  } = useServices();
  const { employees, fetchEmployees } = useEmployees();
  const { canWriteServices } = useUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingService, setEditingService] = useState<ModelsServiceDto | null>(
    null
  );
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningServiceId, setAssigningServiceId] = useState<number | null>(
    null
  );

  const assigningService = assigningServiceId
    ? getServiceById(assigningServiceId)
    : null;

  useEffect(() => {
    void fetchServices(businessId);
    void fetchEmployees(businessId);
  }, [businessId]);

  const handleOpenAssignModal = (service: ModelsServiceDto) => {
    setAssigningServiceId(service.id ?? null);
    setIsAssignModalOpen(true);
  };

  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
    setAssigningServiceId(null);
  };

  const handleAssignSuccess = () => {
    void fetchServices(businessId);
  };

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
      title: 'Pricing',
      key: 'pricing',
      render: (_, record) => (
        <Space size={2}>
          <Tag color="green" style={{ marginRight: 0 }}>
            {formatPrice(record.hourlyPrice)}/hr
          </Tag>
          {record.serviceCharge ? (
            <>
              <span>+</span>
              <Tag color="blue">{formatPrice(record.serviceCharge)}</Tag>
            </>
          ) : null}
        </Space>
      ),
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
    {
      title: 'Assigned Employees',
      key: 'employees',
      render: (_, record) => (
        <Space size={[4, 4]} wrap>
          {record.employees && record.employees.length > 0 ? (
            record.employees.map((employee) => (
              <Tag key={employee.id}>{employee.name}</Tag>
            ))
          ) : (
            <span style={{ color: '#999' }}>No employees</span>
          )}
          {canWriteServices && (
            <Button
              type="dashed"
              size="small"
              icon={<UserAddOutlined />}
              onClick={() => handleOpenAssignModal(record)}
            />
          )}
        </Space>
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

      <AssignEmployeeModal
        open={isAssignModalOpen}
        service={assigningService}
        employees={employees}
        isLoading={assignmentLoading}
        onClose={handleCloseAssignModal}
        onAssign={assignEmployeeToService}
        onUnassign={unassignEmployeeFromService}
        onSuccess={handleAssignSuccess}
      />
    </>
  );
};
