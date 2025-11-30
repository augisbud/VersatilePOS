import { Card, Table, Typography, Button, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useEmployees } from '@/hooks/useEmployees';
import { useRoles } from '@/hooks/useRoles';
import { useUser } from '@/hooks/useUser';
import {
  ModelsAccountDto,
  ConstantsAccountRoleLinkStatus,
} from '@/api/types.gen';
import {
  RegisterForm,
  RegisterFormValues,
} from '@/components/Auth/RegisterForm';
import { EmployeeRoleFormModal } from './EmployeeRoleFormModal';
import { getAvailableRoles } from '@/selectors/employee';
import { getEmployeeColumns } from './EmployeeTableColumns';

const { Title } = Typography;

interface BusinessEmployeesProps {
  businessId: number;
}

export const BusinessEmployees = ({ businessId }: BusinessEmployeesProps) => {
  const { employees, fetchEmployees, deleteEmployee, createEmployee } =
    useEmployees();
  const { roles, fetchBusinessRoles, assignRole, updateRoleStatus } =
    useRoles();
  const { canWriteAccounts } = useUser();
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

  const handleStatusChange = (
    accountId: number,
    roleId: number,
    status: ConstantsAccountRoleLinkStatus
  ) => {
    const updateStatus = async () => {
      await updateRoleStatus(accountId, roleId, { status });
      await fetchEmployees(businessId);
    };

    void updateStatus();
  };

  const columns = getEmployeeColumns({
    roles,
    canWriteAccounts,
    onAddRole: handleOpenRoleModal,
    onStatusChange: handleStatusChange,
    onDelete: handleDelete,
  });

  return (
    <>
      <Card
        title={
          <Title level={4} style={{ margin: 0 }}>
            Employees
          </Title>
        }
        extra={
          canWriteAccounts && (
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
          selectedEmployee || ({} as ModelsAccountDto),
          roles || []
        )}
        isSubmitting={isSubmitting}
        onClose={handleCloseRoleModal}
        onSubmit={handleAssignRole}
      />
    </>
  );
};
