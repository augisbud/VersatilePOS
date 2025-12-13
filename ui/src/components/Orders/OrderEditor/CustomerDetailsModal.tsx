import { Modal, Form, Input, Typography } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';

export type CustomerDetails = {
  customer?: string;
  customerEmail?: string;
  customerPhone?: string;
};

type Props = {
  open: boolean;
  loading?: boolean;
  onSave: (details: CustomerDetails) => void;
  onCancel: () => void;
};

const { Text } = Typography;

export const CustomerDetailsModal = ({
  open,
  loading,
  onSave,
  onCancel,
}: Props) => {
  const [form] = Form.useForm<CustomerDetails>();

  const handleOk = () => {
    const values = form.getFieldsValue();
    onSave(values);
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Customer Details"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Save Order"
      cancelText="Cancel"
      confirmLoading={loading}
      destroyOnClose
    >
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        All fields are optional. You can save the order without entering customer
        details.
      </Text>

      <Form
        form={form}
        layout="vertical"
        preserve={false}
      >
        <Form.Item name="customer" label="Customer Name">
          <Input
            prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="Enter customer name"
          />
        </Form.Item>

        <Form.Item name="customerEmail" label="Email">
          <Input
            prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="Enter email address"
            type="email"
          />
        </Form.Item>

        <Form.Item name="customerPhone" label="Phone">
          <Input
            prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="Enter phone number"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

