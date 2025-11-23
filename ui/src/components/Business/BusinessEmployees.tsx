import { Card, Table, Typography, Button, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useEffect } from 'react';
import { useEmployees } from '@/hooks/useEmployees';
import type { ColumnsType } from 'antd/es/table';
import { ModelsAccountDto } from '@/api/types.gen';

const { Title } = Typography;

interface BusinessEmployeesProps {
  businessId: number;
  isStaffEmployee: boolean;
}

export const BusinessEmployees = ({
  businessId,
  isStaffEmployee,
}: BusinessEmployeesProps) => {
  const { employees, fetchEmployees, deleteEmployee } = useEmployees();

  useEffect(() => {
    if (businessId) {
      void fetchEmployees(businessId);
    }
  }, [fetchEmployees, businessId]);

  const handleDelete = (accountId: number) => {
    if (accountId) {
      void deleteEmployee(accountId);
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
    isStaffEmployee
      ? {}
      : {
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
        },
  ];

  return (
    <Card
      title={
        <Title level={4} style={{ margin: 0 }}>
          Employees
        </Title>
      }
    >
      <Table
        columns={columns}
        dataSource={employees}
        rowKey="id"
        pagination={false}
      />
    </Card>
  );
};
