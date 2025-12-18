import { Card, Table, Typography, Button, Popconfirm, Tag, Space } from 'antd';
import {
  DeleteOutlined,
  PlusOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useGiftCards } from '@/hooks/useGiftCards';
import type { ColumnsType } from 'antd/es/table';
import { ModelsGiftCardDto } from '@/api/types.gen';
import { GiftCardFormModal, GiftCardFormValues } from './GiftCardFormModal';
import { EmptyState } from '@/components/shared';

const { Title } = Typography;

interface BusinessGiftCardsProps {
  businessId: number;
}

export const BusinessGiftCards = ({ businessId }: BusinessGiftCardsProps) => {
  const {
    giftCards,
    loading,
    fetchGiftCards,
    createGiftCard,
    deactivateGiftCard,
  } = useGiftCards();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void fetchGiftCards();
  }, [businessId]);

  const handleDeactivate = async (giftCardId: number) => {
    try {
      await deactivateGiftCard(giftCardId);
    } catch (error) {
      console.error('Failed to deactivate gift card:', error);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsSubmitting(false);
  };

  const handleSubmit = async (values: GiftCardFormValues) => {
    setIsSubmitting(true);
    try {
      await createGiftCard({
        code: values.code,
        initialValue: values.initialValue,
      });

      handleCloseModal();
    } catch (error) {
      console.error('Failed to create gift card:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return '$0.00';
    return `$${value.toFixed(2)}`;
  };

  const columns: ColumnsType<ModelsGiftCardDto> = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      render: (code) => (
        <span style={{ fontWeight: 500, fontFamily: 'monospace' }}>{code}</span>
      ),
    },
    {
      title: 'Initial Value',
      dataIndex: 'initialValue',
      key: 'initialValue',
      render: (value) => formatCurrency(value),
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      render: (value) => (
        <span
          style={{ fontWeight: 500, color: value > 0 ? '#52c41a' : '#8c8c8c' }}
        >
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 120,
      render: (_, record) =>
        record.isActive && (
          <Popconfirm
            title="Deactivate gift card"
            description="Are you sure you want to deactivate this gift card? This action cannot be undone."
            onConfirm={() => void handleDeactivate(record.id!)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              Deactivate
            </Button>
          </Popconfirm>
        ),
    },
  ];

  return (
    <>
      <Card
        title={
          <Space>
            <CreditCardOutlined />
            <Title level={4} style={{ margin: 0 }}>
              Gift Cards
            </Title>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenModal}
          >
            Create Gift Card
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={giftCards}
          rowKey="id"
          loading={loading}
          pagination={false}
          locale={{
            emptyText: (
              <EmptyState
                variant="giftCards"
                title="No Gift Cards"
                description="Create gift cards to offer prepaid value to your customers."
                actionLabel="Create First Gift Card"
                onAction={handleOpenModal}
                showAction
                compact
              />
            ),
          }}
        />
      </Card>

      <GiftCardFormModal
        open={isModalOpen}
        isSubmitting={isSubmitting}
        onClose={handleCloseModal}
        onSubmit={(values) => void handleSubmit(values)}
      />
    </>
  );
};
