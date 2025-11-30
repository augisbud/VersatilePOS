import { useState } from 'react';
import { Table, Button, Modal } from 'antd';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  ModelsBusinessDto,
  ModelsCreateBusinessRequest,
} from '@/api/types.gen';
import { BusinessCreationForm } from './BusinessCreationForm';
import { useUser } from '@/hooks/useUser';

interface BusinessListProps {
  businesses: ModelsBusinessDto[];
  loading: boolean;
  error?: string;
  onCreateBusiness: (
    values: ModelsCreateBusinessRequest
  ) => Promise<ModelsBusinessDto>;
  onManageBusiness: (business: ModelsBusinessDto) => void;
}

export const BusinessList = ({
  businesses,
  loading,
  error,
  onCreateBusiness,
  onManageBusiness,
}: BusinessListProps) => {
  const { canWriteBusinesses } = useUser();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateBusiness = async (values: ModelsCreateBusinessRequest) => {
    await onCreateBusiness(values);
    setIsCreateModalOpen(false);
  };

  const columns: ColumnsType<ModelsBusinessDto> = [
    {
      title: 'Business Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <strong>{name}</strong>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '',
      key: 'action',
      render: (_: unknown, record: ModelsBusinessDto) => (
        <div style={{ textAlign: 'right' }}>
          <Button
            type="primary"
            icon={<SettingOutlined />}
            onClick={() => onManageBusiness(record)}
          >
            Manage
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div
        style={{
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 style={{ margin: 0 }}>Businesses</h2>
        {canWriteBusinesses && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Business
          </Button>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={businesses}
        rowKey="id"
        loading={loading}
        pagination={false}
        locale={{
          emptyText: 'No businesses found. Create one to get started!',
        }}
      />

      <Modal
        title="Create New Business"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        width={600}
      >
        <BusinessCreationForm
          loading={loading}
          error={error}
          onSubmit={handleCreateBusiness}
        />
      </Modal>
    </div>
  );
};
