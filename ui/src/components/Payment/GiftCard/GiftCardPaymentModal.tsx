import { useState } from 'react';
import { Modal, Form, Alert } from 'antd';
import { CreditCardOutlined } from '@ant-design/icons';
import { useGiftCards } from '@/hooks/useGiftCards';
import { ModelsGiftCardDto } from '@/api/types.gen';
import { GiftCardPaymentModalProps } from './types';
import { GiftCardAmountDisplay } from './GiftCardAmountDisplay';
import { GiftCardCodeForm } from './GiftCardCodeForm';
import { GiftCardVerifiedInfo } from './GiftCardVerifiedInfo';

export const GiftCardPaymentModal = ({
  open,
  amount,
  onSuccess,
  onCancel,
}: GiftCardPaymentModalProps) => {
  const [form] = Form.useForm<{ code: string }>();
  const { checkGiftCardBalance } = useGiftCards();

  const [isChecking, setIsChecking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifiedCard, setVerifiedCard] = useState<ModelsGiftCardDto | null>(
    null
  );

  const resetState = () => {
    form.resetFields();
    setError(null);
    setVerifiedCard(null);
    setIsChecking(false);
    setIsProcessing(false);
  };

  const handleAfterOpenChange = (visible: boolean) => {
    if (!visible) {
      resetState();
    }
  };

  const handleCheckBalance = async () => {
    try {
      const values = await form.validateFields();
      setIsChecking(true);
      setError(null);
      setVerifiedCard(null);

      const card = await checkGiftCardBalance({ code: values.code });

      if (!card.isActive) {
        setError('This gift card has been deactivated and cannot be used.');
        return;
      }

      if ((card.balance || 0) <= 0) {
        setError('This gift card has no remaining balance.');
        return;
      }

      setVerifiedCard(card);
    } catch (err) {
      setError('Gift card not found. Please check the code and try again.');
      console.error('Failed to check gift card balance:', err);
    } finally {
      setIsChecking(false);
    }
  };

  const handleProcessPayment = () => {
    if (!verifiedCard || !verifiedCard.id) return;

    const cardBalance = verifiedCard.balance || 0;
    const amountToUse = Math.min(cardBalance, amount);
    const remainingAmount = amount - amountToUse;
    const isPartialPayment = remainingAmount > 0;

    setIsProcessing(true);
    try {
      onSuccess({
        giftCardId: verifiedCard.id,
        giftCardCode: verifiedCard.code || '',
        amountUsed: amountToUse,
        remainingAmount,
        isPartialPayment,
      });
    } catch (err) {
      setError('Failed to process gift card payment. Please try again.');
      console.error('Gift card payment error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    resetState();
    onCancel();
  };

  const handleUseDifferentCard = () => {
    setVerifiedCard(null);
    setError(null);
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CreditCardOutlined style={{ color: '#faad14' }} />
          <span>Gift Card Payment</span>
        </div>
      }
      centered
      width={440}
      maskClosable={false}
      afterOpenChange={handleAfterOpenChange}
      destroyOnHidden
    >
      <div style={{ padding: '8px 0' }}>
        <GiftCardAmountDisplay amount={amount} />

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {!verifiedCard ? (
          <GiftCardCodeForm
            form={form}
            isChecking={isChecking}
            onCheckBalance={() => void handleCheckBalance()}
            onCancel={handleCancel}
          />
        ) : (
          <GiftCardVerifiedInfo
            card={verifiedCard}
            amount={amount}
            isProcessing={isProcessing}
            onUseDifferentCard={handleUseDifferentCard}
            onConfirmPayment={handleProcessPayment}
          />
        )}
      </div>
    </Modal>
  );
};
