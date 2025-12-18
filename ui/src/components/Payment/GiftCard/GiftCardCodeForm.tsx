import { Form, Input, Button } from 'antd';
import { FormInstance } from 'antd/es/form';

interface GiftCardCodeFormProps {
  form: FormInstance<{ code: string }>;
  isChecking: boolean;
  onCheckBalance: () => void;
  onCancel: () => void;
}

export const GiftCardCodeForm = ({
  form,
  isChecking,
  onCheckBalance,
  onCancel,
}: GiftCardCodeFormProps) => (
  <Form form={form} layout="vertical">
    <Form.Item
      name="code"
      label="Gift Card Code"
      rules={[{ required: true, message: 'Please enter the gift card code' }]}
    >
      <Input
        placeholder="Enter gift card code (e.g., GC-ABC12345)"
        style={{ fontFamily: 'monospace', fontSize: 16 }}
        size="large"
        disabled={isChecking}
      />
    </Form.Item>

    <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
      <Button onClick={onCancel} style={{ flex: 1 }} size="large">
        Cancel
      </Button>
      <Button
        type="primary"
        onClick={onCheckBalance}
        loading={isChecking}
        style={{
          flex: 1,
          background: '#faad14',
          borderColor: '#faad14',
        }}
        size="large"
      >
        Check Balance
      </Button>
    </div>
  </Form>
);
