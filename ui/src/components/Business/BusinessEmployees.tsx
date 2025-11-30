import { Card, Table, Typography, Button, Popconfirm, Modal } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useEmployees } from '@/hooks/useEmployees';
import type { ColumnsType } from 'antd/es/table';
import { ModelsAccountDto } from '@/api/types.gen';
import {
  RegisterForm,
  RegisterFormValues,
} from '@/components/Auth/RegisterForm';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void fetchEmployees(businessId);
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
    </>
  );
};
