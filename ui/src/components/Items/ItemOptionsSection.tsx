import { useState, useEffect } from 'react';
import { Divider, Button, Space, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ModelsItemOptionDto, ModelsasPriceModifierDto } from '@/api/types.gen';
import { ItemOptionsTable } from './ItemOptionsTable';
import {
  ItemOptionInlineForm,
  NewOptionFormValues,
} from './ItemOptionInlineForm';
import { useUser } from '@/hooks/useUser';
import { EmptyState } from '@/components/shared';
import { getPriceModifierById } from '@/selectors/priceModifier';

const { Title } = Typography;

type Props = {
  itemOptions: ModelsItemOptionDto[];
  pendingOptions: NewOptionFormValues[];
  priceModifiers: ModelsasPriceModifierDto[];
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
  const [isCreatingNewDiscount, setIsCreatingNewDiscount] = useState(false);

  // Reset form state when modal closes
  useEffect(() => {
    setIsCreatingNew(false);
    setIsCreatingNewDiscount(false);
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

  const isDiscountByPriceModifierId = (priceModifierId?: number) => {
    if (!priceModifierId) return false;
    const pm = getPriceModifierById(priceModifiers, priceModifierId);
    return pm?.modifierType === 'Discount';
  };

  const regularOptions = itemOptions.filter(
    (opt) => !isDiscountByPriceModifierId(opt.priceModifierId)
  );
  const discountOptions = itemOptions.filter((opt) =>
    isDiscountByPriceModifierId(opt.priceModifierId)
  );

  const regularPendingOptions = pendingOptions.filter(
    (opt) => !isDiscountByPriceModifierId(opt.priceModifierId)
  );
  const discountPendingOptions = pendingOptions.filter((opt) =>
    isDiscountByPriceModifierId(opt.priceModifierId)
  );

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
        options={regularOptions}
        pendingOptions={regularPendingOptions}
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
              excludedModifierTypes={['Discount']}
              isEditing={isEditing}
              onSubmit={handleSubmitOption}
              onCancel={() => setIsCreatingNew(false)}
            />
          )}
        </Space>
      )}

      {showEmptyMessage && (
        <EmptyState
          variant="options"
          description="No options added yet. Create options after saving the item or add them now."
          showAction={false}
          compact
        />
      )}

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
          Item Discounts
        </Title>
      </div>

      <ItemOptionsTable
        options={discountOptions}
        pendingOptions={discountPendingOptions}
        priceModifiers={priceModifiers}
        loading={loading}
        isEditing={isEditing}
        onDeleteOption={onDeleteOption}
        onRemovePendingOption={onRemovePendingOption}
      />

      {canWriteItemOptions && canReadPriceModifiers && (
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          {!isCreatingNewDiscount ? (
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => setIsCreatingNewDiscount(true)}
              block
            >
              Create New Discount
            </Button>
          ) : (
            <ItemOptionInlineForm
              priceModifiers={priceModifiers}
              allowedModifierTypes={['Discount']}
              isEditing={isEditing}
              onSubmit={handleSubmitOption}
              onCancel={() => setIsCreatingNewDiscount(false)}
            />
          )}
        </Space>
      )}
    </>
  );
};

export type { NewOptionFormValues };
