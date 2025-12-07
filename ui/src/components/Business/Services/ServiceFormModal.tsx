import {
  Modal,
  Form,
  Input,
  InputNumber,
  TimePicker,
  Button,
  Space,
} from 'antd';
import { ModelsServiceDto } from '@/api/types.gen';
import dayjs, { Dayjs } from 'dayjs';

interface ServiceFormValues {
  name: string;
  hourlyPrice: number;
  serviceCharge?: number;
  provisioningStartTime: Dayjs;
  provisioningEndTime: Dayjs;
  provisioningInterval: number;
}

interface ServiceFormSubmitValues {
  name: string;
  hourlyPrice: number;
  serviceCharge?: number;
  provisioningStartTime: string;
  provisioningEndTime: string;
  provisioningInterval: number;
}

interface ServiceFormModalProps {
  open: boolean;
  editingService: ModelsServiceDto | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: ServiceFormSubmitValues) => void;
}

export const ServiceFormModal = ({
  open,
  editingService,
  isSubmitting,
  onClose,
  onSubmit,
}: ServiceFormModalProps) => {
  const [form] = Form.useForm<ServiceFormValues>();
  const hourlyPrice = Form.useWatch('hourlyPrice', form);

  const handleAfterOpenChange = (visible: boolean) => {
    if (visible && editingService) {
      form.setFieldsValue({
        ...editingService,
        provisioningStartTime: dayjs(
          editingService.provisioningStartTime,
          'HH:mm'
        ),
        provisioningEndTime: dayjs(editingService.provisioningEndTime, 'HH:mm'),
      });
    }
  };

  const handleSubmit = () => {
    void form.validateFields().then((values) => {
      onSubmit({
        ...values,
        provisioningStartTime: dayjs(values.provisioningStartTime).format(
          'HH:mm'
        ),
        provisioningEndTime: dayjs(values.provisioningEndTime).format('HH:mm'),
      });
    });
  };

  const calculateServiceCharge = (percentage: number) => {
    if (!hourlyPrice) return;
    const charge = Math.round(hourlyPrice * (percentage / 100) * 100) / 100;
    form.setFieldValue('serviceCharge', charge);
  };

  return (
    <Modal
      title={editingService ? 'Edit Service' : 'Add New Service'}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={isSubmitting}
      afterOpenChange={handleAfterOpenChange}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item
          name="name"
          label="Service Name"
          rules={[{ required: true, message: 'Please enter service name' }]}
        >
          <Input placeholder="Enter service name" />
        </Form.Item>

        <Form.Item
          name="hourlyPrice"
          label="Hourly Price"
          rules={[{ required: true, message: 'Please enter hourly price' }]}
        >
          <InputNumber
            placeholder="Enter hourly price"
            min={0}
            precision={2}
            style={{ width: '100%' }}
            prefix="$"
          />
        </Form.Item>

        <Form.Item label="Service Charge">
          <Space.Compact style={{ width: '100%' }}>
            <Form.Item name="serviceCharge" noStyle>
              <InputNumber
                placeholder="Enter service charge"
                min={0}
                precision={2}
                style={{ width: '100%' }}
                prefix="$"
              />
            </Form.Item>
          </Space.Compact>
          <Space style={{ marginTop: 8 }}>
            <Button
              size="small"
              onClick={() => calculateServiceCharge(10)}
              disabled={!hourlyPrice}
            >
              10%
            </Button>
            <Button
              size="small"
              onClick={() => calculateServiceCharge(15)}
              disabled={!hourlyPrice}
            >
              15%
            </Button>
            <Button
              size="small"
              onClick={() => calculateServiceCharge(20)}
              disabled={!hourlyPrice}
            >
              20%
            </Button>
            {hourlyPrice && (
              <span style={{ color: '#888', fontSize: 12 }}>
                of ${hourlyPrice.toFixed(2)}
              </span>
            )}
          </Space>
        </Form.Item>

        <Form.Item
          name="provisioningInterval"
          label="Booking Interval (minutes)"
          rules={[{ required: true, message: 'Please enter booking interval' }]}
        >
          <InputNumber
            placeholder="Enter interval in minutes"
            min={15}
            step={15}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="provisioningStartTime"
          label="Available From"
          rules={[{ required: true, message: 'Please select start time' }]}
        >
          <TimePicker format="HH:mm" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="provisioningEndTime"
          label="Available Until"
          rules={[{ required: true, message: 'Please select end time' }]}
        >
          <TimePicker format="HH:mm" style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export type { ServiceFormSubmitValues as ServiceFormValues };
