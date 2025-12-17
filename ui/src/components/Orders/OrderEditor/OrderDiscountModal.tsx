import { useEffect, useMemo, useState } from 'react';
import { Alert, Divider, List, Modal, Select, Typography } from 'antd';
import { ModelsasPriceModifierDto } from '@/api/types.gen';
import { AppliedOrderDiscount } from '@/types/orderEditor';
import { formatPriceModifierValue } from '@/utils/formatters';

type Props = {
  open: boolean;
  subtotal: number;
  discounts: ModelsasPriceModifierDto[];
  appliedDiscounts: AppliedOrderDiscount[];
  loading?: boolean;
  onApply: (priceModifierId: number) => Promise<void> | void;
  onClose: () => void;
};

export const OrderDiscountModal = ({
  open,
  subtotal,
  discounts,
  appliedDiscounts,
  loading,
  onApply,
  onClose,
}: Props) => {
  const [selectedId, setSelectedId] = useState<number | undefined>();

  const availableDiscounts = useMemo(
    () =>
      discounts.filter(
        (pm) =>
          pm.modifierType === 'Discount' &&
          pm.id !== undefined &&
          !appliedDiscounts.some((d) => d.id === pm.id)
      ),
    [discounts, appliedDiscounts]
  );

  const discountOptions = useMemo(
    () =>
      availableDiscounts.map((pm) => ({
        value: pm.id!,
        label: `${pm.name} (${formatPriceModifierValue(pm)}) -${
          pm.isPercentage
            ? ((subtotal * (pm.value ?? 0)) / 100).toFixed(2)
            : (pm.value ?? 0).toFixed(2)
        }`,
      })),
    [availableDiscounts, subtotal]
  );

  useEffect(() => {
    if (!open) {
      setSelectedId(undefined);
    }
  }, [open]);

  const handleOk = async () => {
    if (!selectedId) return;
    try {
      await onApply(selectedId);
      setSelectedId(undefined);
    } catch {
      // Errors are surfaced by parent handler
    }
  };

  return (
    <Modal
      title="Add Discount"
      open={open}
      onOk={() => void handleOk()}
      onCancel={onClose}
      okText="Apply"
      okButtonProps={{
        disabled: !selectedId || availableDiscounts.length === 0,
        loading,
      }}
      destroyOnClose
    >
      {availableDiscounts.length === 0 ? (
        <Alert
          type="info"
          message="No available discounts"
          description="All available discounts are already applied to this order."
          showIcon
        />
      ) : (
        <>
          <Typography.Paragraph style={{ marginBottom: 8 }}>
            Select a discount to apply to the entire order total.
          </Typography.Paragraph>
          <Select
            style={{ width: '100%' }}
            placeholder="Choose a discount"
            options={discountOptions}
            value={selectedId}
            onChange={(val) => setSelectedId(val)}
          />
        </>
      )}

      <Divider style={{ margin: '16px 0' }} />

      <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
        Applied discounts
      </Typography.Text>
      {appliedDiscounts.length === 0 ? (
        <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
          No discounts have been applied to this order yet.
        </Typography.Paragraph>
      ) : (
        <List
          size="small"
          dataSource={appliedDiscounts}
          renderItem={(disc) => (
            <List.Item>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  width: '100%',
                  gap: 8,
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{disc.name}</div>
                  <div style={{ color: '#666' }}>
                    {formatPriceModifierValue(disc)}
                  </div>
                </div>
                <div style={{ color: '#52c41a', fontWeight: 600 }}>
                  -{disc.amount.toFixed(2)}
                </div>
              </div>
            </List.Item>
          )}
        />
      )}
    </Modal>
  );
};

