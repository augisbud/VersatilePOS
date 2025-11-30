import { Card, Table, Typography, Button, Popconfirm, Tag, Space } from 'antd';
import { DeleteOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useRoles } from '@/hooks/useRoles';
import { useFunctions } from '@/hooks/useFunctions';
import type { ColumnsType } from 'antd/es/table';
import { ModelsAccountRoleDto, ConstantsAccessLevel } from '@/api/types.gen';
import { RoleFormModal } from './RoleFormModal';
import { RoleFunctionFormModal } from './RoleFunctionFormModal';

const { Title } = Typography;

interface BusinessRolesProps {
  businessId: number;
}

interface RoleFormValues {
  name: string;
}

interface FunctionFormValues {
  functionId: number;
  accessLevels: ConstantsAccessLevel[];
}

export const BusinessRoles = ({ businessId }: BusinessRolesProps) => {
  const {
    roles,
    fetchBusinessRoles,
    createRole,
    updateRole,
    deleteRole,
    assignFunctionToRole,
  } = useRoles();
  const {
    roleFunctionsMap,
    fetchFunctionsForRole,
    allFunctions,
    fetchAllFunctions,
  } = useFunctions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRole, setEditingRole] = useState<ModelsAccountRoleDto | null>(
    null
  );
  const [isFunctionModalOpen, setIsFunctionModalOpen] = useState(false);
  const [managingRole, setManagingRole] = useState<ModelsAccountRoleDto | null>(
    null
  );

  useEffect(() => {
    void fetchBusinessRoles(businessId);
    void fetchAllFunctions();
  }, [businessId]);

  useEffect(() => {
    const loadFunctionsForRoles = async () => {
      const fetchPromises = roles
        .filter((role) => role.id && !roleFunctionsMap[role.id])
        .map((role) => fetchFunctionsForRole(role.id!));

      await Promise.all(fetchPromises);
    };

    void loadFunctionsForRoles();
  }, [roles]);

  const handleDelete = (roleId: number) => {
    if (roleId) {
      void deleteRole(roleId);
    }
  };

  const handleOpenModal = (role?: ModelsAccountRoleDto) => {
    setEditingRole(role || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsSubmitting(false);
    setEditingRole(null);
  };

  const handleSubmit = (values: RoleFormValues) => {
    setIsSubmitting(true);
    const saveRole = async () => {
      try {
        if (editingRole && editingRole.id) {
          await updateRole(editingRole.id, {
            name: values.name,
          });
        } else {
          await createRole({
            name: values.name,
            businessId,
          });
        }
        handleCloseModal();
      } catch (error) {
        console.error('Failed to save role:', error);
      } finally {
        setIsSubmitting(false);
      }
    };
    void saveRole();
  };

  const handleOpenFunctionModal = (role: ModelsAccountRoleDto) => {
    setManagingRole(role);
    setIsFunctionModalOpen(true);
  };

  const handleCloseFunctionModal = () => {
    setIsFunctionModalOpen(false);
    setIsSubmitting(false);
    setManagingRole(null);
  };

  const handleAssignFunction = (values: FunctionFormValues) => {
    if (!managingRole?.id) return;

    setIsSubmitting(true);
    const assignFunction = async () => {
      try {
        await assignFunctionToRole(managingRole.id!, {
          functionId: values.functionId,
          accessLevels: values.accessLevels,
        });
        await fetchFunctionsForRole(managingRole.id!);
        handleCloseFunctionModal();
      } catch (error) {
        console.error('Failed to assign function:', error);
      } finally {
        setIsSubmitting(false);
      }
    };
    void assignFunction();
  };

  const getAvailableFunctions = (roleId?: number) => {
    if (!roleId) return allFunctions;

    const assignedFunctions = roleFunctionsMap[roleId] || [];
    const assignedFunctionIds = new Set(
      assignedFunctions.map((funcLink) => funcLink.function?.id).filter(Boolean)
    );

    return allFunctions.filter((func) => !assignedFunctionIds.has(func.id));
  };

  const columns: ColumnsType<ModelsAccountRoleDto> = [
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{name}</span>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          />
        </div>
      ),
    },
    {
      title: 'Functions',
      key: 'functions',
      render: (_, record) => {
        const functions = record.id ? roleFunctionsMap[record.id] || [] : [];
        const availableFunctions = getAvailableFunctions(record.id);
        const canAddFunction = availableFunctions.length > 0;

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Space size={[0, 4]} wrap style={{ flex: 1 }}>
              {functions.length > 0 ? (
                functions.map((funcLink) => (
                  <Tag key={funcLink.id} color="blue">
                    {funcLink.function?.name}
                    {funcLink.accessLevels &&
                      funcLink.accessLevels.length > 0 && (
                        <span style={{ marginLeft: '4px', opacity: 0.7 }}>
                          ({funcLink.accessLevels.join(', ')})
                        </span>
                      )}
                  </Tag>
                ))
              ) : (
                <span style={{ color: '#999' }}>No functions assigned</span>
              )}
            </Space>
            <Button
              type="link"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => handleOpenFunctionModal(record)}
              disabled={!canAddFunction}
            >
              Add
            </Button>
          </div>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="Delete role"
          description="Are you sure you want to delete this role?"
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
    <>
      <Card
        title={
          <Title level={4} style={{ margin: 0 }}>
            Roles
          </Title>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenModal()}
          >
            Add Role
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={roles}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <RoleFormModal
        open={isModalOpen}
        editingRole={editingRole}
        isSubmitting={isSubmitting}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />

      <RoleFunctionFormModal
        open={isFunctionModalOpen}
        managingRole={managingRole}
        availableFunctions={getAvailableFunctions(managingRole?.id)}
        isSubmitting={isSubmitting}
        onClose={handleCloseFunctionModal}
        onSubmit={handleAssignFunction}
      />
    </>
  );
};
