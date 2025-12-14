import { Modal, Button, Alert } from 'antd';

type Props = {
  open: boolean;
  onClose: () => void;
};

export const StripeNotConfigured = ({ open, onClose }: Props) => (
  <Modal
    open={open}
    onCancel={onClose}
    footer={null}
    title="Card Payment"
    centered
  >
    <Alert
      message="Stripe Not Configured"
      description="Please set the VITE_STRIPE_PUBLISHABLE_KEY environment variable to enable card payments."
      type="warning"
      showIcon
      style={{ marginBottom: 16 }}
    />
    <Button onClick={onClose} block>
      Close
    </Button>
  </Modal>
);

