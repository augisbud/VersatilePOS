import { Button, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  ModelsAccountDto,
  ModelsAccountRoleDto,
  ConstantsAccountRoleLinkStatus,
} from '@/api/types.gen';
import { EmployeeRolesCell } from './EmployeeRolesCell';

interface GetEmployeeColumnsParams {
  roles: ModelsAccountRoleDto[];
  canWriteRoles: boolean;
  canWriteAccounts: boolean;
  onAddRole: (employee: ModelsAccountDto) => void;
  onStatusChange: (
    accountId: number,
    roleId: number,
    status: ConstantsAccountRoleLinkStatus
  ) => void;
  onDelete: (accountId: number) => void;
}

export const getEmployeeColumns = ({
  roles,
  canWriteRoles,
  canWriteAccounts,
  onAddRole,
  onStatusChange,
  onDelete,
}: GetEmployeeColumnsParams): ColumnsType<ModelsAccountDto> => {
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
      render: (_, record) => (
        <EmployeeRolesCell
          employee={record}
          roles={roles}
          canWriteRoles={canWriteRoles}
          onAddRole={onAddRole}
          onStatusChange={onStatusChange}
        />
      ),
    },
  ];

  if (canWriteAccounts) {
    columns.push({
      title: '',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="Delete employee"
          description="Are you sure you want to delete this employee?"
          onConfirm={() => onDelete(record.id!)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="link" danger icon={<DeleteOutlined />}>
            Delete
          </Button>
        </Popconfirm>
      ),
    });
  }

  return columns;
};
