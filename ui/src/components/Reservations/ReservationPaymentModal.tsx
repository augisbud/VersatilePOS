import { useState, useMemo } from 'react';
import { Modal, message, Alert } from 'antd';
import { ModelsReservationDto, ModelsServiceDto } from '@/api/types.gen';
import {
  StripePaymentModal,
  GiftCardPaymentModal,
  GiftCardPaymentResult,
} from '@/components/Payment';
import { TipSelector, PaymentSummary } from '@/components/shared';
import { ReservationSummary } from './ReservationSummary';
import { PaymentButtons, PaymentMethod } from './PaymentButtons';
import { calculateTotalPaid } from './ReservationTableColumns';

interface ReservationPaymentModalProps {
  open: boolean;
  reservation: ModelsReservationDto | null;
  services: ModelsServiceDto[];
  onClose: () => void;
  onPayment: (
    reservationId: number,
    amount: number,
    paymentType: PaymentMethod,
    tipAmount: number,
    giftCardCode?: string
  ) => Promise<void>;
}

export const ReservationPaymentModal = ({
  open,
  reservation,
  services,
  onClose,
  onPayment,
}: ReservationPaymentModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [showGiftCardModal, setShowGiftCardModal] = useState(false);
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [selectedTipPreset, setSelectedTipPreset] = useState<number | null>(
    null
  );
  const [isCustomTip, setIsCustomTip] = useState(false);
  const [partialPaymentRemainder, setPartialPaymentRemainder] =
    useState<number>(0);

  const service = useMemo(
    () => services.find((s) => s.id === reservation?.serviceId),
    [services, reservation?.serviceId]
  );

  const { alreadyPaid, remainingDue } = useMemo(() => {
    if (!reservation || !service) {
      return { alreadyPaid: 0, remainingDue: 0 };
    }

    const durationHours = (reservation.reservationLength || 60) / 60;
    const hourlyAmount = (service.hourlyPrice || 0) * durationHours;
    const serviceCharge = service.serviceCharge || 0;
    const svcAmount = hourlyAmount + serviceCharge;

    const paid = calculateTotalPaid(reservation);

    const remaining = Math.max(0, svcAmount - paid);

    return {
      alreadyPaid: paid,
      remainingDue: remaining,
    };
  }, [reservation, service]);

  if (!reservation) {
    return null;
  }

  const baseAmount = remainingDue;
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

  const resetPartialPayment = () => {
    setPartialPaymentRemainder(0);
  };

  const handleClose = () => {
    resetTipState();
    resetPartialPayment();
    onClose();
  };

  const effectiveAmount =
    partialPaymentRemainder > 0 ? partialPaymentRemainder : totalAmount;

  const handlePayment = async (method: PaymentMethod) => {
    if (!reservation.id) return;

    if (method === 'CreditCard') {
      setShowStripeModal(true);
      return;
    }

    if (method === 'GiftCard') {
      setShowGiftCardModal(true);
      return;
    }

    setIsProcessing(true);
    try {
      const tip = partialPaymentRemainder > 0 ? 0 : tipAmount;
      await onPayment(reservation.id, effectiveAmount, 'Cash', tip);
      message.success('Payment processed successfully');
      handleClose();
    } catch (error) {
      message.error('Failed to process payment');
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStripeSuccess = async () => {
    if (!reservation.id) return;
    try {
      const tip = partialPaymentRemainder > 0 ? 0 : tipAmount;
      await onPayment(reservation.id, effectiveAmount, 'CreditCard', tip);
      setShowStripeModal(false);
      message.success('Card payment processed successfully');
      handleClose();
    } catch (error) {
      message.error('Failed to complete payment');
      console.error('Stripe payment finalization error:', error);
    }
  };

  const handleStripeCancel = () => {
    setShowStripeModal(false);
  };

  const handleGiftCardSuccess = async (result: GiftCardPaymentResult) => {
    if (!reservation.id) return;
    try {
      const tip = partialPaymentRemainder > 0 ? 0 : tipAmount;
      await onPayment(
        reservation.id,
        result.amountUsed,
        'GiftCard',
        tip,
        result.giftCardCode
      );
      setShowGiftCardModal(false);

      if (result.isPartialPayment) {
        message.info(
          `Gift card applied! $${result.amountUsed.toFixed(2)} paid. Please pay the remaining $${result.remainingAmount.toFixed(2)}.`
        );
        setPartialPaymentRemainder(result.remainingAmount);
      } else {
        message.success('Gift card payment processed successfully');
        handleClose();
      }
    } catch (error) {
      message.error('Failed to complete gift card payment');
      console.error('Gift card payment finalization error:', error);
    }
  };

  const handleGiftCardCancel = () => {
    setShowGiftCardModal(false);
  };

  return (
    <>
      <Modal
        open={open && !showStripeModal}
        onCancel={handleClose}
        footer={null}
        title="Process Payment"
        width={720}
        centered
        destroyOnHidden
      >
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ flex: 1 }}>
            {alreadyPaid > 0 && partialPaymentRemainder === 0 && (
              <Alert
                message="Previous Payment Recorded"
                description={`$${alreadyPaid.toFixed(2)} has already been paid. Remaining balance: $${remainingDue.toFixed(2)}`}
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            {partialPaymentRemainder > 0 && (
              <Alert
                message="Partial Payment Applied"
                description={`A gift card payment has been applied. Please pay the remaining $${partialPaymentRemainder.toFixed(2)}.`}
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <ReservationSummary reservation={reservation} service={service} />

            {partialPaymentRemainder === 0 && (
              <TipSelector
                tipAmount={tipAmount}
                selectedTipPreset={selectedTipPreset}
                isCustomTip={isCustomTip}
                onPresetClick={handleTipPresetClick}
                onCustomChange={handleCustomTipChange}
                onNoTip={handleNoTip}
              />
            )}

            <PaymentSummary
              baseAmount={
                partialPaymentRemainder > 0
                  ? partialPaymentRemainder
                  : baseAmount
              }
              tipAmount={partialPaymentRemainder > 0 ? 0 : tipAmount}
              totalAmount={effectiveAmount}
            />
          </div>

          <PaymentButtons
            isProcessing={isProcessing}
            onPayment={(method) => void handlePayment(method)}
          />
        </div>
      </Modal>

      <StripePaymentModal
        open={showStripeModal}
        amount={effectiveAmount}
        onSuccess={() => void handleStripeSuccess()}
        onCancel={handleStripeCancel}
      />

      <GiftCardPaymentModal
        open={showGiftCardModal}
        amount={effectiveAmount}
        onSuccess={(result) => void handleGiftCardSuccess(result)}
        onCancel={handleGiftCardCancel}
      />
    </>
  );
};
