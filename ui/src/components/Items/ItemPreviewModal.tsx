import { Modal, Descriptions, Tag, Divider, Table, Typography } from 'antd';
import { useEffect } from 'react';
import { ModelsItemDto, ModelsItemOptionDto } from '@/api/types.gen';
import { formatCurrency } from '@/utils/formatters';
import { useItemOptions } from '@/hooks/useItemOptions';
import { usePriceModifiers } from '@/hooks/usePriceModifiers';
import { useUser } from '@/hooks/useUser';
import type { ColumnsType } from 'antd/es/table';
import { getPriceModifierDisplay } from '@/utils/formatters';
import { renderStockTag } from '@/utils/renderUtils';
import { EmptyState } from '@/components/shared';

const { Title } = Typography;

type Props = {
  open: boolean;
  item: ModelsItemDto | null;
  businessId: number | null;
  onClose: () => void;
};

export const ItemPreviewModal = ({
  open,
  item,
  businessId,
  onClose,
}: Props) => {
  const {
    loading: optionsLoading,
    fetchItemOptions,
    getItemOptionsByItemId,
  } = useItemOptions();
  const { priceModifiers, fetchPriceModifiers } = usePriceModifiers();
  const { canReadItemOptions, canReadPriceModifiers } = useUser();

  useEffect(() => {
    if (open && businessId) {
      if (canReadItemOptions) {
        void fetchItemOptions(businessId);
      }
      if (canReadPriceModifiers) {
        void fetchPriceModifiers(businessId);
      }
    }
  }, [open, businessId]);

  if (!item) {
    return null;
  }

  const itemOptionsList = item.id ? getItemOptionsByItemId(item.id) : [];

  const optionColumns: ColumnsType<ModelsItemOptionDto> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <span style={{ fontWeight: 500 }}>{name}</span>,
    },
    ...(canReadPriceModifiers
      ? [
          {
            title: 'Price Modifier',
            dataIndex: 'priceModifierId' as const,
            key: 'priceModifierId',
            render: (priceModifierId: number) => (
              <Tag color="blue">
                {getPriceModifierDisplay(priceModifiers, priceModifierId)}
              </Tag>
            ),
          },
        ]
      : []),
    {
      title: 'Stock',
      dataIndex: 'quantityInStock',
      key: 'quantityInStock',
      render: renderStockTag,
    },
  ];

  return (
    <Modal
      title={item.name || `Item #${item.id}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={640}
    >
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="Name">{item.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="Price">
          {formatCurrency(item.price)}
        </Descriptions.Item>
        <Descriptions.Item label="Inventory Tracking">
          {item.quantityInStock !== undefined &&
          item.quantityInStock !== null ? (
            <Tag color="green">Enabled</Tag>
          ) : (
            <Tag color="default">Disabled</Tag>
          )}
        </Descriptions.Item>
        {item.quantityInStock !== undefined &&
          item.quantityInStock !== null && (
            <Descriptions.Item label="Quantity in Stock">
              <Tag
                color={
                  item.quantityInStock && item.quantityInStock > 0
                    ? 'blue'
                    : 'red'
                }
              >
                {item.quantityInStock ?? 0}
              </Tag>
            </Descriptions.Item>
          )}
      </Descriptions>

      {canReadItemOptions && (
        <>
          <Divider />
          <Title level={5} style={{ margin: '0 0 12px 0' }}>
            Item Options
          </Title>
          <Table
            columns={optionColumns}
            dataSource={itemOptionsList}
            rowKey="id"
            loading={optionsLoading}
            pagination={false}
            size="small"
            locale={{
              emptyText: (
                <EmptyState
                  variant="options"
                  description="This item has no options configured."
                  showAction={false}
                  compact
                />
              ),
            }}
          />
        </>
      )}
    </Modal>
  );
};
