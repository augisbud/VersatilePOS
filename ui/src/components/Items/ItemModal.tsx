import { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Modal } from 'antd';
import type { FormInstance } from 'antd';
import { ModelsItemDto } from '@/api/types.gen';
import { useItemOptions } from '@/hooks/useItemOptions';
import { usePriceModifiers } from '@/hooks/usePriceModifiers';
import { useUser } from '@/hooks/useUser';
import { ItemOptionsSection, NewOptionFormValues } from './ItemOptionsSection';

type Props = {
  open: boolean;
  form: FormInstance;
  editingItem: ModelsItemDto | null;
  businessId: number | null;
  confirmLoading?: boolean;
  onCancel: () => void;
  onSubmit: () => void;
};

export const ItemModal = ({
  open,
  form,
  editingItem,
  businessId,
  confirmLoading,
  onCancel,
  onSubmit,
}: Props) => {
  const {
    loading: optionsLoading,
    fetchItemOptions,
    createItemOption,
    deleteItemOption,
    getItemOptionsByItemId,
  } = useItemOptions();
  const { priceModifiers, fetchPriceModifiers } = usePriceModifiers();
  const { canWriteItemOptions } = useUser();

  const [pendingOptions, setPendingOptions] = useState<NewOptionFormValues[]>(
    []
  );

  useEffect(() => {
    if (open && businessId) {
      void fetchItemOptions(businessId);
      void fetchPriceModifiers(businessId);
    }
  }, [open, businessId]);

  useEffect(() => {
    if (!open) {
      setPendingOptions([]);
    }
  }, [open]);

  // Expose pending options for parent component
  useEffect(() => {
    if (form) {
      form.setFieldValue('_pendingOptions', pendingOptions);
    }
  }, [pendingOptions, form]);

  const itemOptions = editingItem?.id
    ? getItemOptionsByItemId(editingItem.id)
    : [];

  const handleCreateOption = async (values: NewOptionFormValues) => {
    if (editingItem?.id && businessId) {
      try {
        await createItemOption({
          itemId: editingItem.id,
          name: values.name,
          priceModifierId: values.priceModifierId,
          quantityInStock: values.trackInventory
            ? values.quantityInStock
            : undefined,
          trackInventory: values.trackInventory,
        });
        void fetchItemOptions(businessId);
      } catch (error) {
        console.error('Failed to create option:', error);
      }
    } else {
      setPendingOptions([...pendingOptions, values]);
    }
  };

  const handleDeleteOption = async (optionId: number) => {
    if (!businessId) return;
    try {
      await deleteItemOption(optionId);
      void fetchItemOptions(businessId);
    } catch (error) {
      console.error('Failed to delete option:', error);
    }
  };

  const handleRemovePendingOption = (index: number) => {
    setPendingOptions(pendingOptions.filter((_, i) => i !== index));
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      onOk={onSubmit}
      confirmLoading={confirmLoading}
      title={editingItem ? 'Edit Item' : 'New Item'}
      okText={editingItem ? 'Save Changes' : 'Create Item'}
      destroyOnClose
      width={640}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please enter item name' }]}
        >
          <Input placeholder="Item name" />
        </Form.Item>

        <Form.Item
          name="price"
          label="Price"
          rules={[{ required: true, message: 'Please enter item price' }]}
        >
          <InputNumber
            min={0}
            step={0.01}
            style={{ width: '100%' }}
            prefix="$"
          />
        </Form.Item>

        <Form.Item
          name="quantityInStock"
          label="Quantity in stock"
          rules={[
            {
              type: 'number',
              min: 0,
              message: 'Quantity must be zero or greater',
            },
          ]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="_pendingOptions" hidden>
          <Input />
        </Form.Item>
      </Form>

      {businessId && canWriteItemOptions && (
        <ItemOptionsSection
          itemOptions={itemOptions}
          pendingOptions={pendingOptions}
          priceModifiers={priceModifiers}
          loading={optionsLoading}
          isEditing={!!editingItem}
          onCreateOption={(values) => void handleCreateOption(values)}
          onDeleteOption={(id) => void handleDeleteOption(id)}
          onRemovePendingOption={handleRemovePendingOption}
        />
      )}
    </Modal>
  );
};
