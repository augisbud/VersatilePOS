import { Card, Form, Input, InputNumber, Typography } from 'antd';
import type { FormInstance } from 'antd';

type Props = {
  form: FormInstance;
};

const { Title } = Typography;

export const CustomerDetailsForm = ({ form }: Props) => (
  <Card>
    <Title level={5} style={{ margin: 0 }}>
      Customer details
    </Title>
    <Form layout="vertical" form={form} style={{ marginTop: 12 }}>
      <Form.Item label="Customer name" name="customer">
        <Input placeholder="Optional" />
      </Form.Item>
      <Form.Item label="Customer email" name="customerEmail">
        <Input type="email" placeholder="Optional" />
      </Form.Item>
      <Form.Item label="Customer phone" name="customerPhone">
        <Input placeholder="Optional" />
      </Form.Item>
      <Form.Item label="Service charge" name="serviceCharge">
        <InputNumber min={0} step={0.01} prefix="$" style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item label="Tip amount" name="tipAmount">
        <InputNumber min={0} step={0.01} prefix="$" style={{ width: '100%' }} />
      </Form.Item>
    </Form>
  </Card>
);
