import { Card, Table, Typography, Button, Popconfirm, Tag, Space } from 'antd';
import { DeleteOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { usePriceModifiers } from '@/hooks/usePriceModifiers';
import { useUser } from '@/hooks/useUser';
import type { ColumnsType } from 'antd/es/table';
import { ModelsasPriceModifierDto } from '@/api/types.gen';
import {
  PriceModifierFormModal,
  PriceModifierFormValues,
} from './PriceModifierFormModal';
import { EmptyState } from '@/components/shared';

const { Title } = Typography;

interface BusinessPriceModifiersProps {
  businessId: number;
}

const MODIFIER_TYPE_COLORS: Record<string, string> = {
  Discount: 'green',
  Surcharge: 'orange',
  Tax: 'blue',
  Tip: 'purple',
};

export const BusinessPriceModifiers = ({
  businessId,
}: BusinessPriceModifiersProps) => {
  const {
    priceModifiers,
    loading,
    fetchPriceModifiers,
    createPriceModifier,
    updatePriceModifier,
    deletePriceModifier,
  } = usePriceModifiers();
  const { canWritePriceModifiers } = useUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingModifier, setEditingModifier] =
    useState<ModelsasPriceModifierDto | null>(null);

  useEffect(() => {
    void fetchPriceModifiers(businessId);
  }, [businessId]);

  const handleDelete = async (modifierId: number) => {
    try {
      await deletePriceModifier(modifierId, businessId);
    } catch (error) {
      console.error('Failed to delete price modifier:', error);
    }
  };

  const handleOpenModal = (modifier?: ModelsasPriceModifierDto) => {
    setEditingModifier(modifier || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsSubmitting(false);
    setEditingModifier(null);
  };

  const handleSubmit = async (values: PriceModifierFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingModifier && editingModifier.id) {
        await updatePriceModifier(editingModifier.id, businessId, values);
      } else {
        await createPriceModifier({ ...values, businessId });
      }

      handleCloseModal();
    } catch (error) {
      console.error('Failed to save price modifier:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatValue = (modifier: ModelsasPriceModifierDto) => {
    if (modifier.isPercentage) {
      return `${modifier.value}%`;
    }
    return `$${modifier.value?.toFixed(2)}`;
  };

  const columns: ColumnsType<ModelsasPriceModifierDto> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <span style={{ fontWeight: 500 }}>{name}</span>,
    },
    {
      title: 'Type',
      dataIndex: 'modifierType',
      key: 'modifierType',
      render: (type: string) => (
        <Tag color={MODIFIER_TYPE_COLORS[type] || 'default'}>{type}</Tag>
      ),
    },
    {
      title: 'Value',
      key: 'value',
      render: (_, record) => (
        <Space size={4}>
          <span style={{ fontWeight: 500 }}>{formatValue(record)}</span>
          {record.isPercentage && (
            <Tag color="cyan" style={{ marginLeft: 4 }}>
              %
            </Tag>
          )}
        </Space>
      ),
    },
  ];

  if (canWritePriceModifiers) {
    columns.push({
      title: '',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete price modifier"
            description="Are you sure you want to delete this price modifier?"
            onConfirm={() => void handleDelete(record.id!)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    });
  }

  return (
    <>
      <Card
        title={
          <Title level={4} style={{ margin: 0 }}>
            Price Modifiers
          </Title>
        }
        extra={
          canWritePriceModifiers && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenModal()}
            >
              Add Price Modifier
            </Button>
          )
        }
      >
        <Table
          columns={columns}
          dataSource={priceModifiers}
          rowKey="id"
          loading={loading}
          pagination={false}
          locale={{
            emptyText: (
              <EmptyState
                variant="priceModifiers"
                title="No Price Modifiers"
                description="Create price modifiers to apply discounts, surcharges, taxes, or tips to your items and orders."
                actionLabel={
                  canWritePriceModifiers ? 'Add First Modifier' : undefined
                }
                onAction={() => handleOpenModal()}
                showAction={canWritePriceModifiers}
                compact
              />
            ),
          }}
        />
      </Card>

      <PriceModifierFormModal
        open={isModalOpen}
        editingModifier={editingModifier}
        isSubmitting={isSubmitting}
        onClose={handleCloseModal}
        onSubmit={(values) => void handleSubmit(values)}
      />
    </>
  );
};
