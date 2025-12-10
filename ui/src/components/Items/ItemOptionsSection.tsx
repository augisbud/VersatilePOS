import { useState, useEffect } from 'react';
import { Divider, Button, Space, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ModelsItemOptionDto, ModelsPriceModifierDto } from '@/api/types.gen';
import { ItemOptionsTable } from './ItemOptionsTable';
import {
  ItemOptionInlineForm,
  NewOptionFormValues,
} from './ItemOptionInlineForm';
import { useUser } from '@/hooks/useUser';

const { Title } = Typography;

type Props = {
  itemOptions: ModelsItemOptionDto[];
  pendingOptions: NewOptionFormValues[];
  priceModifiers: ModelsPriceModifierDto[];
  loading: boolean;
  isEditing: boolean;
  onCreateOption: (values: NewOptionFormValues) => void;
  onDeleteOption: (optionId: number) => void;
  onRemovePendingOption: (index: number) => void;
};

export const ItemOptionsSection = ({
  itemOptions,
  pendingOptions,
  priceModifiers,
  loading,
  isEditing,

  onCreateOption,
  onDeleteOption,
  onRemovePendingOption,
}: Props) => {
  const { canReadPriceModifiers, canWriteItemOptions } = useUser();
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Reset form state when modal closes
  useEffect(() => {
    setIsCreatingNew(false);
  }, [isEditing]);

  const handleSubmitOption = (values: NewOptionFormValues) => {
    onCreateOption(values);
    setIsCreatingNew(false);
  };

  const showEmptyMessage =
    !isEditing &&
    !itemOptions.length &&
    !pendingOptions.length &&
    !isCreatingNew;

  return (
    <>
      <Divider />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Title level={5} style={{ margin: 0 }}>
          Item Options
        </Title>
      </div>

      <ItemOptionsTable
        options={itemOptions}
        pendingOptions={pendingOptions}
        priceModifiers={priceModifiers}
        loading={loading}
        isEditing={isEditing}
        onDeleteOption={onDeleteOption}
        onRemovePendingOption={onRemovePendingOption}
      />

      {canWriteItemOptions && canReadPriceModifiers && (
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          {!isCreatingNew ? (
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => setIsCreatingNew(true)}
              block
            >
              Create New Option
            </Button>
          ) : (
            <ItemOptionInlineForm
              priceModifiers={priceModifiers}
              isEditing={isEditing}
              onSubmit={handleSubmitOption}
              onCancel={() => setIsCreatingNew(false)}
            />
          )}
        </Space>
      )}

      {showEmptyMessage && (
        <Typography.Text type="secondary">
          No options added yet. Create options after saving the item or add them
          now.
        </Typography.Text>
      )}
    </>
  );
};

export type { NewOptionFormValues };
