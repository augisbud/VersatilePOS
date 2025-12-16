import { useState } from 'react';
import { Modal, Button, Typography, Divider, message, Space } from 'antd';
import {
  DollarOutlined,
  CreditCardOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import { ModelsReservationDto, ModelsServiceDto } from '@/api/types.gen';
import { formatCurrency, formatDuration } from '@/utils/formatters';
import { StripePaymentModal } from '@/components/Payment';

const { Title, Text } = Typography;

type PaymentMethod = 'Cash' | 'CreditCard' | 'GiftCard';

interface ReservationPaymentModalProps {
  open: boolean;
  reservation: ModelsReservationDto | null;
  services: ModelsServiceDto[];
  onClose: () => void;
  onPayment: (
    reservationId: number,
    amount: number,
    paymentType: PaymentMethod
  ) => Promise<void>;
}

const buttonStyle = {
  height: 56,
  fontSize: 16,
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
} as const;

export const ReservationPaymentModal = ({
  open,
  reservation,
  services,
  onClose,
  onPayment,
}: ReservationPaymentModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);

  if (!reservation) {
    return null;
  }

  const service = services.find((s) => s.id === reservation.serviceId);

  // Calculate the amount based on service price and reservation duration
  const calculateAmount = (): number => {
    if (!service) return 0;

    const durationHours = (reservation.reservationLength || 60) / 60;
    const hourlyAmount = (service.hourlyPrice || 0) * durationHours;
    const serviceCharge = service.serviceCharge || 0;

    return hourlyAmount + serviceCharge;
  };

  const amount = calculateAmount();

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
      await onPayment(reservation.id, amount, paymentType);
      message.success('Payment processed successfully');
      onClose();
    } catch (error) {
      message.error('Failed to process payment');
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStripeSuccess = () => {
    setShowStripeModal(false);
    message.success('Card payment processed successfully');
    onClose();
  };

  const handleStripeCancel = () => {
    setShowStripeModal(false);
  };

  return (
    <>
      <Modal
        open={open && !showStripeModal}
        onCancel={onClose}
        footer={null}
        title="Process Payment"
        width={400}
        centered
        destroyOnHidden
      >
        <div style={{ padding: '8px 0' }}>
          {/* Reservation Summary */}
          <div
            style={{
              background: '#fafafa',
              borderRadius: 8,
              padding: 16,
              marginBottom: 24,
            }}
          >
            <Text type="secondary">Service</Text>
            <div style={{ marginBottom: 8 }}>
              <Text strong>{service?.name || 'Unknown Service'}</Text>
            </div>

            <Text type="secondary">Customer</Text>
            <div style={{ marginBottom: 8 }}>
              <Text strong>{reservation.customer || 'Walk-in'}</Text>
            </div>

            <Text type="secondary">Duration</Text>
            <div>
              <Text strong>
                {formatDuration(reservation.reservationLength || 0)}
              </Text>
            </div>
          </div>

          {/* Amount */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Text type="secondary">Amount Due</Text>
            <Title level={2} style={{ margin: '8px 0' }}>
              {formatCurrency(amount)}
            </Title>
          </div>

          <Divider style={{ margin: '16px 0' }} />

          {/* Payment Buttons */}
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Button
              block
              size="large"
              onClick={() => void handlePayment('Cash')}
              disabled={isProcessing}
              loading={isProcessing}
              style={{
                ...buttonStyle,
                background: '#52c41a',
                borderColor: '#52c41a',
                color: '#fff',
              }}
              icon={<DollarOutlined />}
            >
              Pay with Cash
            </Button>

            <Button
              block
              size="large"
              onClick={() => void handlePayment('CreditCard')}
              disabled={isProcessing}
              style={{
                ...buttonStyle,
                background: '#1890ff',
                borderColor: '#1890ff',
                color: '#fff',
              }}
              icon={<CreditCardOutlined />}
            >
              Pay with Card
            </Button>

            <Button
              block
              size="large"
              onClick={() => void handlePayment('GiftCard')}
              disabled={isProcessing}
              loading={isProcessing}
              style={{
                ...buttonStyle,
                background: '#faad14',
                borderColor: '#faad14',
                color: '#fff',
              }}
              icon={<GiftOutlined />}
            >
              Pay with Gift Card
            </Button>
          </Space>

          <Button
            block
            size="large"
            onClick={onClose}
            disabled={isProcessing}
            style={{ marginTop: 16 }}
          >
            Cancel
          </Button>
        </div>
      </Modal>

      <StripePaymentModal
        open={showStripeModal}
        amount={amount}
        onSuccess={handleStripeSuccess}
        onCancel={handleStripeCancel}
      />
    </>
  );
};
