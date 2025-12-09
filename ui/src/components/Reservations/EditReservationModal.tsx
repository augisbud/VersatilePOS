import { Modal, Form, Input, Select, InputNumber, DatePicker } from 'antd';
import {
  ModelsReservationDto,
  ModelsUpdateReservationRequest,
  ConstantsReservationStatus,
} from '@/api/types.gen';
import dayjs from 'dayjs';

interface EditReservationModalProps {
  open: boolean;
  reservation: ModelsReservationDto | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (id: number, data: ModelsUpdateReservationRequest) => void;
}

interface FormValues {
  customer: string;
  customerEmail?: string;
  customerPhone?: string;
  status: ConstantsReservationStatus;
  dateOfService: dayjs.Dayjs;
  reservationLength: number;
  tipAmount?: number;
}

const statusOptions = [
  { value: 'Confirmed', label: 'Confirmed' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'NoShow', label: 'No Show' },
];

export const EditReservationModal = ({
  open,
  reservation,
  isSubmitting,
  onClose,
  onSubmit,
}: EditReservationModalProps) => {
  const [form] = Form.useForm<FormValues>();

  const handleAfterOpenChange = (visible: boolean) => {
    if (visible && reservation) {
      form.setFieldsValue({
        customer: reservation.customer || '',
        customerEmail: reservation.customerEmail || '',
        customerPhone: reservation.customerPhone || '',
        status: reservation.status || 'Confirmed',
        dateOfService: reservation.dateOfService
          ? dayjs(reservation.dateOfService)
          : dayjs(),
        reservationLength: reservation.reservationLength || 30,
        tipAmount: reservation.tipAmount || 0,
      });
    }
  };

  const handleSubmit = () => {
    void form.validateFields().then((values) => {
      if (!reservation?.id) {
        return;
      }

      const updateData: ModelsUpdateReservationRequest = {
        customer: values.customer,
        customerEmail: values.customerEmail || undefined,
        customerPhone: values.customerPhone || undefined,
        status: values.status,
        dateOfService: values.dateOfService.toISOString(),
        reservationLength: values.reservationLength,
        tipAmount: values.tipAmount || undefined,
      };

      onSubmit(reservation.id, updateData);
    });
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Edit Reservation"
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="Save Changes"
      confirmLoading={isSubmitting}
      afterOpenChange={handleAfterOpenChange}
      width={500}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item
          name="customer"
          label="Customer Name"
          rules={[{ required: true, message: 'Please enter customer name' }]}
        >
          <Input placeholder="Customer name" />
        </Form.Item>

        <Form.Item name="customerEmail" label="Email">
          <Input type="email" placeholder="customer@example.com" />
        </Form.Item>

        <Form.Item name="customerPhone" label="Phone">
          <Input placeholder="+1 234 567 890" />
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Please select status' }]}
        >
          <Select options={statusOptions} />
        </Form.Item>

        <Form.Item
          name="dateOfService"
          label="Date & Time"
          rules={[{ required: true, message: 'Please select date and time' }]}
        >
          <DatePicker
            showTime={{ format: 'HH:mm' }}
            format="YYYY-MM-DD HH:mm"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="reservationLength"
          label="Duration (minutes)"
          rules={[{ required: true, message: 'Please enter duration' }]}
        >
          <InputNumber min={15} step={15} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="tipAmount" label="Tip Amount ($)">
          <InputNumber
            min={0}
            step={0.5}
            precision={2}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
