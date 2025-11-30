import {
  Card,
  Table,
  Typography,
  Button,
  Popconfirm,
  Modal,
  Tag,
  Space,
} from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useEmployees } from '@/hooks/useEmployees';
import { useRoles } from '@/hooks/useRoles';
import type { ColumnsType } from 'antd/es/table';
import { ModelsAccountDto } from '@/api/types.gen';
import {
  RegisterForm,
  RegisterFormValues,
} from '@/components/Auth/RegisterForm';
import { EmployeeRoleFormModal } from './EmployeeRoleFormModal';

const { Title } = Typography;

interface BusinessEmployeesProps {
  businessId: number;
  isBusinessOwner: boolean;
}

export const BusinessEmployees = ({
  businessId,
  isBusinessOwner,
}: BusinessEmployeesProps) => {
  const { employees, fetchEmployees, deleteEmployee, createEmployee } =
    useEmployees();
  const { roles, fetchBusinessRoles, assignRole } = useRoles();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] =
    useState<ModelsAccountDto | null>(null);

  useEffect(() => {
    void fetchEmployees(businessId);
    void fetchBusinessRoles(businessId);
  }, []);

  const handleDelete = (accountId: number) => {
    if (accountId) {
      void deleteEmployee(accountId);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsSubmitting(false);
  };

  const handleSubmit = async (values: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      await createEmployee({
        name: values.name,
        username: values.username,
        password: values.password,
        businessId,
      });
      handleCloseModal();
    } catch (error) {
      console.error('Failed to create employee:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenRoleModal = (employee: ModelsAccountDto) => {
    setSelectedEmployee(employee);
    setIsRoleModalOpen(true);
  };

  const handleCloseRoleModal = () => {
    setIsRoleModalOpen(false);
    setIsSubmitting(false);
    setSelectedEmployee(null);
  };

  const handleAssignRole = (values: { roleId: number }) => {
    if (!selectedEmployee?.id) return;

    setIsSubmitting(true);
    const assignRoleAsync = async () => {
      try {
        await assignRole(selectedEmployee.id!, { roleId: values.roleId });
        await fetchEmployees(businessId);
        handleCloseRoleModal();
      } catch (error) {
        console.error('Failed to assign role:', error);
      } finally {
        setIsSubmitting(false);
      }
    };
    void assignRoleAsync();
  };

  const getAvailableRoles = (employee: ModelsAccountDto) => {
    const employeeRoles = employee.roles || [];
    const assignedRoleIds = new Set(
      employeeRoles.map((roleLink) => roleLink.role?.id).filter(Boolean)
    );

    return roles.filter((role) => !assignedRoleIds.has(role.id));
  };

  const columns: ColumnsType<ModelsAccountDto> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Roles',
      key: 'roles',
      render: (_, record) => {
        const employeeRoles = record.roles || [];
        const availableRoles = getAvailableRoles(record);
        const canAssignRole = availableRoles.length > 0;

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Space size={[0, 4]} wrap style={{ flex: 1 }}>
              {employeeRoles.length > 0 ? (
                employeeRoles.map((roleLink) => (
                  <Tag key={roleLink.id} color="green">
                    {roleLink.role?.name}
                  </Tag>
                ))
              ) : (
                <span style={{ color: '#999' }}>No roles assigned</span>
              )}
            </Space>
            {isBusinessOwner && (
              <Button
                type="link"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => handleOpenRoleModal(record)}
                disabled={!canAssignRole}
              >
                Add
              </Button>
            )}
          </div>
        );
      },
    },
    isBusinessOwner
      ? {
          title: 'Action',
          key: 'action',
          width: 100,
          render: (_, record) => (
            <Popconfirm
              title="Delete employee"
              description="Are you sure you want to delete this employee?"
              onConfirm={() => handleDelete(record.id!)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
          ),
        }
      : {},
  ];

  return (
    <>
      <Card
        title={
          <Title level={4} style={{ margin: 0 }}>
            Employees
          </Title>
        }
        extra={
          isBusinessOwner && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenModal}
            >
              Add Employee
            </Button>
          )
        }
      >
        <Table
          columns={columns}
          dataSource={employees}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <Modal
        title="Add New Employee"
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
      >
        <RegisterForm
          onFinish={handleSubmit}
          loading={isSubmitting}
          showFooter={false}
          buttonLabel="Add Employee"
        />
      </Modal>

      <EmployeeRoleFormModal
        open={isRoleModalOpen}
        employee={selectedEmployee}
        availableRoles={getAvailableRoles(
          selectedEmployee || ({} as ModelsAccountDto)
        )}
        isSubmitting={isSubmitting}
        onClose={handleCloseRoleModal}
        onSubmit={handleAssignRole}
      />
    </>
  );
};
