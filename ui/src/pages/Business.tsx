import { useEffect, useState } from 'react';
import { Space, Spin, Table, Button, Modal } from 'antd';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
import { useBusiness } from '@/hooks/useBusiness';
import { ModelsBusinessDto, ModelsCreateBusinessRequest } from '@/api/types.gen';
import {
  BusinessCreationForm,
  BusinessInformation,
  BusinessQuickActions,
} from '@/components/Business';
import type { ColumnsType } from 'antd/es/table';

export const Business = () => {
  const { business, businessExists, businessId, loading, error, createBusiness, fetchBusiness } =
    useBusiness();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<ModelsBusinessDto | null>(null);

  const handleCreateBusiness = async (values: ModelsCreateBusinessRequest) => {
    await createBusiness(values);
    setIsCreateModalOpen(false);
  };

  const handleManageBusiness = (businessRecord: ModelsBusinessDto) => {
    setSelectedBusiness(businessRecord);
  };

  const handleBackToTable = () => {
    setSelectedBusiness(null);
  };

  useEffect(() => {
    if (businessExists) {
      void fetchBusiness(businessId);
    }
  }, []);

  const businessList: ModelsBusinessDto[] = business ? [business] : [];

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
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: ModelsBusinessDto) => (
        <div style={{ textAlign: 'right' }}>
          <Button
            type="primary"
            icon={<SettingOutlined />}
            onClick={() => handleManageBusiness(record)}
          >
            Manage
          </Button>
        </div>
      ),
    },
  ];

  if (loading && !business) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Loading business information..." />
      </div>
    );
  }

  if (selectedBusiness) {
    return (
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <Button
          onClick={handleBackToTable}
          style={{ marginBottom: '24px' }}
        >
          ← Back to Businesses
        </Button>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <BusinessInformation business={selectedBusiness} />
          <BusinessQuickActions />
        </Space>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Businesses</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create Business
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={businessList}
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
