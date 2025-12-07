import {
  Modal,
  Form,
  Select,
  DatePicker,
  InputNumber,
  Card,
  Space,
  Typography,
  Spin,
} from 'antd';
import { useState, useMemo, useEffect } from 'react';
import { ModelsServiceDto } from '@/api/types.gen';
import { useServices } from '@/hooks/useServices';
import { useUser } from '@/hooks/useUser';
import dayjs, { Dayjs } from 'dayjs';

const { Text } = Typography;

interface ServiceSelectionFormValues {
  serviceId: number;
  dateTime: Dayjs;
  duration: number;
}

interface ServiceSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (
    service: ModelsServiceDto,
    dateTime: string,
    duration: number
  ) => void;
  initialService?: ModelsServiceDto | null;
  initialDateTime?: string;
  initialDuration?: number;
}

export const ServiceSelectionModal = ({
  open,
  onClose,
  onSelect,
  initialService,
  initialDateTime,
  initialDuration,
}: ServiceSelectionModalProps) => {
  const [form] = Form.useForm<ServiceSelectionFormValues>();
  const { services, loading, fetchServices } = useServices();
  const { user } = useUser();
  const [selectedServiceId, setSelectedServiceId] = useState<
    number | undefined
  >(initialService?.id);

  useEffect(() => {
    if (open && user?.businessId) {
      void fetchServices(user.businessId);
    }
  }, [open, user?.businessId]);

  const selectedService = useMemo(
    () => services.find((s) => s.id === selectedServiceId),
    [services, selectedServiceId]
  );

  const handleServiceChange = (serviceId: number) => {
    setSelectedServiceId(serviceId);
    const service = services.find((s) => s.id === serviceId);
    if (service?.provisioningInterval) {
      form.setFieldValue('duration', service.provisioningInterval);
    }
  };

  const handleSubmit = () => {
    void form.validateFields().then((values) => {
      const service = services.find((s) => s.id === values.serviceId);
      if (!service) return;

      onSelect(service, values.dateTime.toISOString(), values.duration);
      onClose();
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedServiceId(undefined);
    onClose();
  };

  const calculatePrice = () => {
    if (!selectedService) {
      return null;
    }

    const duration = form.getFieldValue('duration');
    if (!duration || !selectedService.hourlyPrice) {
      return null;
    }

    const hours = duration / 60;
    const basePrice = selectedService.hourlyPrice * hours;
    const serviceCharge = selectedService.serviceCharge || 0;
    const total = basePrice + serviceCharge;

    return { basePrice, serviceCharge, total };
  };

  const priceInfo = calculatePrice();

  return (
    <Modal
      title="Select Service"
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="Select"
      width={500}
      destroyOnHidden
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          preserve={false}
          initialValues={
            initialService
              ? {
                  serviceId: initialService.id,
                  dateTime: initialDateTime
                    ? dayjs(initialDateTime)
                    : undefined,
                  duration: initialDuration,
                }
              : undefined
          }
        >
          <Form.Item
            name="serviceId"
            label="Service"
            rules={[{ required: true, message: 'Please select a service' }]}
          >
            <Select
              placeholder="Select a service"
              onChange={handleServiceChange}
              loading={loading}
              options={services.map((service) => ({
                value: service.id,
                label: (
                  <Space>
                    <span>{service.name}</span>
                    <Text type="secondary">
                      ${service.hourlyPrice?.toFixed(2)}/hr
                    </Text>
                  </Space>
                ),
              }))}
            />
          </Form.Item>

          <Form.Item
            name="dateTime"
            label="Date & Time"
            rules={[{ required: true, message: 'Please select date and time' }]}
          >
            <DatePicker
              showTime={{
                format: 'HH:mm',
                // @ts-expect-error - minuteStep is not typed
                minuteStep: selectedService?.provisioningInterval || 15,
              }}
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
              disabledDate={(current) =>
                current && current < dayjs().startOf('day')
              }
            />
          </Form.Item>

          <Form.Item
            name="duration"
            label="Duration (minutes)"
            rules={[{ required: true, message: 'Please enter duration' }]}
          >
            <InputNumber
              min={15}
              step={selectedService?.provisioningInterval || 15}
              style={{ width: '100%' }}
            />
          </Form.Item>

          {selectedService && priceInfo && (
            <Card size="small" style={{ marginTop: 16 }}>
              <Space direction="vertical" size={0} style={{ width: '100%' }}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <Text>Base price:</Text>
                  <Text>${priceInfo.basePrice.toFixed(2)}</Text>
                </div>
                {priceInfo.serviceCharge > 0 && (
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Text>Service charge:</Text>
                    <Text>${priceInfo.serviceCharge.toFixed(2)}</Text>
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderTop: '1px solid #f0f0f0',
                    paddingTop: 8,
                    marginTop: 8,
                  }}
                >
                  <Text strong>Total:</Text>
                  <Text strong>${priceInfo.total.toFixed(2)}</Text>
                </div>
              </Space>
            </Card>
          )}
        </Form>
      </Spin>
    </Modal>
  );
};
