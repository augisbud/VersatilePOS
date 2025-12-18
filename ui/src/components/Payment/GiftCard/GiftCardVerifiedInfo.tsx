import { Typography, Divider, Button, Spin, Alert } from 'antd';
import { CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { ModelsGiftCardDto } from '@/api/types.gen';

const { Text } = Typography;

interface GiftCardVerifiedInfoProps {
  card: ModelsGiftCardDto;
  amount: number;
  isProcessing: boolean;
  onUseDifferentCard: () => void;
  onConfirmPayment: () => void;
}

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

const InfoRow = ({
  label,
  value,
  valueStyle,
}: {
  label: string;
  value: string;
  valueStyle?: React.CSSProperties;
}) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 8,
    }}
  >
    <Text type="secondary">{label}</Text>
    <Text strong style={valueStyle}>
      {value}
    </Text>
  </div>
);

export const GiftCardVerifiedInfo = ({
  card,
  amount,
  isProcessing,
  onUseDifferentCard,
  onConfirmPayment,
}: GiftCardVerifiedInfoProps) => {
  const cardBalance = card.balance || 0;
  const isPartialPayment = cardBalance < amount;
  const amountToCharge = isPartialPayment ? cardBalance : amount;
  const remainingToPay = isPartialPayment ? amount - cardBalance : 0;
  const cardRemainingBalance = isPartialPayment ? 0 : cardBalance - amount;

  return (
    <Spin spinning={isProcessing}>
      <div
        style={{
          background: isPartialPayment ? '#fffbe6' : '#f6ffed',
          border: `1px solid ${isPartialPayment ? '#ffe58f' : '#b7eb8f'}`,
          borderRadius: 8,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
          }}
        >
          {isPartialPayment ? (
            <>
              <WarningOutlined style={{ color: '#faad14', fontSize: 20 }} />
              <Text strong style={{ color: '#faad14' }}>
                Partial Payment Available
              </Text>
            </>
          ) : (
            <>
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
              <Text strong style={{ color: '#52c41a' }}>
                Gift Card Verified
              </Text>
            </>
          )}
        </div>

        <InfoRow
          label="Card Code:"
          value={card.code || ''}
          valueStyle={{ fontFamily: 'monospace' }}
        />

        <InfoRow
          label="Card Balance:"
          value={formatCurrency(cardBalance)}
          valueStyle={{ color: isPartialPayment ? '#faad14' : '#52c41a' }}
        />

        <InfoRow
          label="Total Required:"
          value={formatCurrency(amount)}
          valueStyle={{ color: '#1890ff' }}
        />

        <Divider style={{ margin: '12px 0' }} />

        <InfoRow
          label="Amount from Gift Card:"
          value={formatCurrency(amountToCharge)}
          valueStyle={{ color: '#52c41a' }}
        />

        {isPartialPayment ? (
          <InfoRow
            label="Remaining to Pay:"
            value={formatCurrency(remainingToPay)}
            valueStyle={{ color: '#ff4d4f' }}
          />
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text type="secondary">Card Balance After:</Text>
            <Text strong>{formatCurrency(cardRemainingBalance)}</Text>
          </div>
        )}
      </div>

      {isPartialPayment && (
        <Alert
          message="Partial Payment"
          description={`This gift card will cover ${formatCurrency(amountToCharge)}. You'll need to pay the remaining ${formatCurrency(remainingToPay)} with another payment method.`}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <Button
          onClick={onUseDifferentCard}
          style={{ flex: 1 }}
          size="large"
          disabled={isProcessing}
        >
          Use Different Card
        </Button>
        <Button
          type="primary"
          onClick={onConfirmPayment}
          loading={isProcessing}
          style={{
            flex: 1,
            background: '#52c41a',
            borderColor: '#52c41a',
          }}
          size="large"
        >
          {isPartialPayment ? 'Apply & Continue' : 'Confirm Payment'}
        </Button>
      </div>
    </Spin>
  );
};
