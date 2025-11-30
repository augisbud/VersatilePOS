import { Tag, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import {
  ModelsAccountRoleLinkDto,
  ConstantsAccountRoleLinkStatus,
} from '@/api/types.gen';

interface EmployeeRoleTagProps {
  roleLink: ModelsAccountRoleLinkDto;
  accountId: number;
  canWriteAccounts: boolean;
  onStatusChange: (
    accountId: number,
    roleId: number,
    status: ConstantsAccountRoleLinkStatus
  ) => void;
}

const getStatusColor = (status?: ConstantsAccountRoleLinkStatus) => {
  switch (status) {
    case 'Active':
      return 'green';
    case 'Suspended':
      return 'orange';
    case 'Deactivated':
      return 'red';
    default:
      return 'green';
  }
};

export const EmployeeRoleTag = ({
  roleLink,
  accountId,
  canWriteAccounts,
  onStatusChange,
}: EmployeeRoleTagProps) => {
  const statusMenuItems: MenuProps['items'] = [
    {
      key: 'Active',
      label: 'Active',
      onClick: () => {
        if (roleLink.role?.id) {
          onStatusChange(accountId, roleLink.role.id, 'Active');
        }
      },
    },
    {
      key: 'Suspended',
      label: 'Suspended',
      onClick: () => {
        if (roleLink.role?.id) {
          onStatusChange(accountId, roleLink.role.id, 'Suspended');
        }
      },
    },
    {
      key: 'Deactivated',
      label: 'Deactivated',
      onClick: () => {
        if (roleLink.role?.id) {
          onStatusChange(accountId, roleLink.role.id, 'Deactivated');
        }
      },
    },
  ];

  const tagContent = (
    <>
      {roleLink.role?.name}
      {roleLink.status && roleLink.status !== 'Active' && (
        <span style={{ marginLeft: '4px', opacity: 0.7 }}>
          ({roleLink.status})
        </span>
      )}
      {canWriteAccounts && (
        <DownOutlined style={{ marginLeft: '6px', fontSize: '10px' }} />
      )}
    </>
  );

  if (canWriteAccounts) {
    return (
      <Dropdown menu={{ items: statusMenuItems }} trigger={['click']}>
        <Tag
          color={getStatusColor(roleLink.status)}
          style={{ cursor: 'pointer' }}
        >
          {tagContent}
        </Tag>
      </Dropdown>
    );
  }

  return (
    <Tag color={getStatusColor(roleLink.status)}>
      {roleLink.role?.name}
      {roleLink.status && roleLink.status !== 'Active' && (
        <span style={{ marginLeft: '4px', opacity: 0.7 }}>
          ({roleLink.status})
        </span>
      )}
    </Tag>
  );
};
