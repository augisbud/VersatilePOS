import { Button, Typography } from 'antd';

const { Text } = Typography;

type Props = {
  amount: number;
  isProcessing: boolean;
  isDisabled: boolean;
  onCancel: () => void;
};

export const PaymentActions = ({
  amount,
  isProcessing,
  isDisabled,
  onCancel,
}: Props) => (
  <>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Button
        type="primary"
        htmlType="submit"
        loading={isProcessing}
        disabled={isDisabled}
        size="large"
        block
        style={{ height: 48, fontSize: 16, fontWeight: 600 }}
      >
        {isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </Button>
      <Button onClick={onCancel} disabled={isProcessing} size="large" block>
        Cancel
      </Button>
    </div>

    <Text
      type="secondary"
      style={{
        display: 'block',
        textAlign: 'center',
        marginTop: 16,
        fontSize: 12,
      }}
    >
      Secured by Stripe. Your card details are never stored.
    </Text>
  </>
);

