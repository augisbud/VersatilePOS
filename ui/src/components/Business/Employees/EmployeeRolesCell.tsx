import { Space, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  ModelsAccountDto,
  ModelsAccountRoleDto,
  ConstantsAccountRoleLinkStatus,
} from '@/api/types.gen';
import { EmployeeRoleTag } from './EmployeeRoleTag';
import { getAvailableRoles } from '@/selectors/employee';

interface EmployeeRolesCellProps {
  employee: ModelsAccountDto;
  roles: ModelsAccountRoleDto[];
  canWriteAccounts: boolean;
  onAddRole: (employee: ModelsAccountDto) => void;
  onStatusChange: (
    accountId: number,
    roleId: number,
    status: ConstantsAccountRoleLinkStatus
  ) => void;
}

export const EmployeeRolesCell = ({
  employee,
  roles,
  canWriteAccounts,
  onAddRole,
  onStatusChange,
}: EmployeeRolesCellProps) => {
  const employeeRoles = employee.roles || [];
  const availableRoles = getAvailableRoles(employee, roles);
  const canAssignRole = availableRoles.length > 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Space size={[0, 4]} wrap style={{ flex: 1 }}>
        {employeeRoles.length > 0 ? (
          employeeRoles.map((roleLink) => (
            <EmployeeRoleTag
              key={roleLink.id}
              roleLink={roleLink}
              accountId={employee.id!}
              canWriteAccounts={canWriteAccounts}
              onStatusChange={onStatusChange}
            />
          ))
        ) : (
          <span style={{ color: '#999' }}>No roles assigned</span>
        )}
      </Space>
      {canWriteAccounts && (
        <Button
          type="link"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => onAddRole(employee)}
          disabled={!canAssignRole}
        >
          Add
        </Button>
      )}
    </div>
  );
};
