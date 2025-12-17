import { Table, Tag, Button, Popconfirm, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { ModelsItemOptionDto, ModelsasPriceModifierDto } from '@/api/types.gen';
import { NewOptionFormValues } from './ItemOptionInlineForm';
import { getPriceModifierDisplay } from '@/utils/formatters';
import { renderStockTag } from '@/utils/renderUtils';
import { useUser } from '@/hooks/useUser';

type Props = {
  options: ModelsItemOptionDto[];
  pendingOptions: NewOptionFormValues[];
  priceModifiers: ModelsasPriceModifierDto[];
  loading: boolean;
  isEditing: boolean;
  onDeleteOption: (optionId: number) => void;
  onRemovePendingOption: (index: number) => void;
};

export const ItemOptionsTable = ({
  options,
  pendingOptions,
  priceModifiers,
  loading,
  isEditing,
  onDeleteOption,
  onRemovePendingOption,
}: Props) => {
  const { canReadPriceModifiers, canWriteItemOptions } = useUser();

  const renderPriceModifier = (priceModifierId?: number) => (
    <Tag color="blue">
      {getPriceModifierDisplay(priceModifiers, priceModifierId)}
    </Tag>
  );

  const optionColumns: ColumnsType<ModelsItemOptionDto> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    ...(canReadPriceModifiers
      ? [
          {
            title: 'Price Modifier',
            dataIndex: 'priceModifierId',
            key: 'priceModifierId',
            render: renderPriceModifier,
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

  if (canWriteItemOptions) {
    optionColumns.push({
      title: '',
      key: 'actions',
      width: 60,
      render: (_, record) => (
        <Popconfirm
          title="Delete option?"
          onConfirm={() => onDeleteOption(record.id!)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="link" danger size="small" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    });
  }

  const pendingOptionColumns: ColumnsType<
    NewOptionFormValues & { index: number }
  > = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    ...(canReadPriceModifiers
      ? [
          {
            title: 'Price Modifier',
            dataIndex: 'priceModifierId' as const,
            key: 'priceModifierId',
            render: renderPriceModifier,
          },
        ]
      : []),
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, record) => (
        <Button
          type="link"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => onRemovePendingOption(record.index)}
        />
      ),
    },
  ];

  if (isEditing && options.length > 0) {
    return (
      <Table
        columns={optionColumns}
        dataSource={options}
        rowKey="id"
        loading={loading}
        pagination={false}
        size="small"
        style={{ marginBottom: 16 }}
      />
    );
  }

  if (!isEditing && pendingOptions.length > 0) {
    return (
      <>
        <Typography.Text
          type="secondary"
          style={{ marginBottom: 8, display: 'block' }}
        >
          Options to be created:
        </Typography.Text>
        <Table
          columns={pendingOptionColumns}
          dataSource={pendingOptions.map((opt, index) => ({
            ...opt,
            index,
          }))}
          rowKey="index"
          pagination={false}
          size="small"
          style={{ marginBottom: 16 }}
        />
      </>
    );
  }

  return null;
};
