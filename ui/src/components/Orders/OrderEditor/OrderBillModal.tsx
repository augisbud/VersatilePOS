import { useState } from 'react';
import { Modal, Divider, Typography, Spin } from 'antd';
import dayjs from 'dayjs';
import { TipSelector, PaymentSummary } from '@/components/shared';
import { BillItemsTable, PaymentButtons, BillItem, PaymentType } from './Bill';

type Props = {
  open: boolean;
  items: BillItem[];
  total: number;
  orderCreatedAt?: string;
  loading?: boolean;
  onPayment: (paymentType: PaymentType, tipAmount: number) => void;
  onClose: () => void;
};

const { Text } = Typography;

export const OrderBillModal = ({
  open,
  items,
  total,
  orderCreatedAt,
  loading,
  onPayment,
  onClose,
}: Props) => {
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [selectedTipPreset, setSelectedTipPreset] = useState<number | null>(
    null
  );
  const [isCustomTip, setIsCustomTip] = useState(false);

  const billCreatedAt = dayjs().format('YYYY-MM-DD HH:mm');
  const formattedOrderDate = orderCreatedAt
    ? dayjs(orderCreatedAt).format('YYYY-MM-DD HH:mm')
    : dayjs().format('YYYY-MM-DD HH:mm');

  const baseAmount = total;
  const totalAmount = baseAmount + tipAmount;

  const handleTipPresetClick = (percentage: number) => {
    setSelectedTipPreset(percentage);
    setIsCustomTip(false);
    setTipAmount(Math.round(baseAmount * percentage * 100) / 100);
  };

  const handleCustomTipChange = (value: number | null) => {
    setSelectedTipPreset(null);
    setIsCustomTip(true);
    setTipAmount(value || 0);
  };

  const handleNoTip = () => {
    setSelectedTipPreset(null);
    setIsCustomTip(false);
    setTipAmount(0);
  };

  const resetTipState = () => {
    setTipAmount(0);
    setSelectedTipPreset(null);
    setIsCustomTip(false);
  };

  const handleClose = () => {
    resetTipState();
    onClose();
  };

  const handlePayment = (paymentType: PaymentType) => {
    onPayment(paymentType, tipAmount);
  };

  return (
    <Modal
      title="Order Bill"
      open={open}
      onCancel={handleClose}
      footer={null}
      width={600}
      centered
      destroyOnClose
    >
      <Spin spinning={loading}>
        <div style={{ display: 'flex', gap: 24 }}>
          {/* Left side - Bill details */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Order created: {formattedOrderDate}
            </Text>

            <Divider style={{ margin: '12px 0' }} />

            <BillItemsTable items={items} />

            <Divider style={{ margin: '12px 0' }} />

            <TipSelector
              tipAmount={tipAmount}
              selectedTipPreset={selectedTipPreset}
              isCustomTip={isCustomTip}
              onPresetClick={handleTipPresetClick}
              onCustomChange={handleCustomTipChange}
              onNoTip={handleNoTip}
            />

            <PaymentSummary
              baseAmount={baseAmount}
              tipAmount={tipAmount}
              totalAmount={totalAmount}
            />

            <Divider style={{ margin: '12px 0' }} />

            <Text type="secondary" style={{ fontSize: 12 }}>
              Bill created: {billCreatedAt}
            </Text>
          </div>

          {/* Right side - Payment buttons */}
          <PaymentButtons onPayment={handlePayment} disabled={loading} />
        </div>
      </Spin>
    </Modal>
  );
};
