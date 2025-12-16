import { useState } from 'react';
import { Modal, message } from 'antd';
import { ModelsReservationDto, ModelsServiceDto } from '@/api/types.gen';
import { StripePaymentModal } from '@/components/Payment';
import { ReservationSummary } from './ReservationSummary';
import { TipSelector } from './TipSelector';
import { PaymentSummary } from './PaymentSummary';
import { PaymentButtons, PaymentMethod } from './PaymentButtons';

interface ReservationPaymentModalProps {
  open: boolean;
  reservation: ModelsReservationDto | null;
  services: ModelsServiceDto[];
  onClose: () => void;
  onPayment: (
    reservationId: number,
    amount: number,
    paymentType: PaymentMethod,
    tipAmount: number
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
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [selectedTipPreset, setSelectedTipPreset] = useState<number | null>(
    null
  );
  const [isCustomTip, setIsCustomTip] = useState(false);

  if (!reservation) {
    return null;
  }

  const service = services.find((s) => s.id === reservation.serviceId);

  const calculateBaseAmount = (): number => {
    if (!service) return 0;

    const durationHours = (reservation.reservationLength || 60) / 60;
    const hourlyAmount = (service.hourlyPrice || 0) * durationHours;
    const serviceCharge = service.serviceCharge || 0;

    return hourlyAmount + serviceCharge;
  };

  const baseAmount = calculateBaseAmount();
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

  const handlePayment = async (method: PaymentMethod) => {
    if (!reservation.id) return;

    if (method === 'CreditCard') {
      setShowStripeModal(true);
      return;
    }

    setIsProcessing(true);
    try {
      const paymentType: PaymentMethod =
        method === 'Cash' ? 'Cash' : 'GiftCard';
      await onPayment(reservation.id, totalAmount, paymentType, tipAmount);
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
      await onPayment(reservation.id, totalAmount, 'CreditCard', tipAmount);
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
            <ReservationSummary reservation={reservation} service={service} />

            <TipSelector
              tipAmount={tipAmount}
              baseAmount={baseAmount}
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
          </div>

          <PaymentButtons
            isProcessing={isProcessing}
            onPayment={(method) => void handlePayment(method)}
          />
        </div>
      </Modal>

      <StripePaymentModal
        open={showStripeModal}
        amount={totalAmount}
        onSuccess={() => void handleStripeSuccess()}
        onCancel={handleStripeCancel}
      />
    </>
  );
};
