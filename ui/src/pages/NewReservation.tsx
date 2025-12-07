import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Typography, Row, Col, message } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import {
  ClientInformationForm,
  ServiceCard,
  ServiceSelectionModal,
} from '@/components/Reservations';
import type { ClientFormValues } from '@/components/Reservations';
import { useReservations } from '@/hooks/useReservations';
import { useUser } from '@/hooks/useUser';
import { ModelsServiceDto } from '@/api/types.gen';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const NewReservation = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<ClientFormValues>();
  const { createReservation, loading } = useReservations();
  const { user } = useUser();

  const [selectedService, setSelectedService] =
    useState<ModelsServiceDto | null>(null);
  const [serviceDateTime, setServiceDateTime] = useState<string>('');
  const [serviceDuration, setServiceDuration] = useState<number>(0);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  const handleCancel = () => {
    void navigate('/reservations');
  };

  const handleOpenServiceModal = () => {
    setIsServiceModalOpen(true);
  };

  const handleCloseServiceModal = () => {
    setIsServiceModalOpen(false);
  };

  const handleSelectService = (
    service: ModelsServiceDto,
    dateTime: string,
    duration: number
  ) => {
    setSelectedService(service);
    setServiceDateTime(dateTime);
    setServiceDuration(duration);
  };

  const handleConfirmReservation = async () => {
    try {
      const values = await form.validateFields();

      if (!selectedService?.id || !user?.id) {
        void message.error('Missing required information');
        return;
      }

      const customerName = `${values.name} ${values.surname}`;

      await createReservation({
        accountId: user.id,
        serviceId: selectedService.id,
        customer: customerName,
        customerEmail: values.email || undefined,
        customerPhone: values.phoneNumber || undefined,
        dateOfService: dayjs(serviceDateTime).toISOString(),
        datePlaced: dayjs().toISOString(),
        reservationLength: serviceDuration,
        status: 'Confirmed',
      });

      void message.success('Reservation created successfully!');
      void navigate('/reservations');
    } catch (error) {
      console.error('Failed to create reservation:', error);
      void message.error('Failed to create reservation');
    }
  };

  const hasService = selectedService && serviceDateTime && serviceDuration;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card
        title={
          <Title level={4} style={{ margin: 0 }}>
            Reservation details
          </Title>
        }
        extra={
          <Button type="text" onClick={handleCancel}>
            Cancel
          </Button>
        }
      >
        <Row gutter={48}>
          <Col xs={24} md={12}>
            <Title level={5}>Client information</Title>
            <ClientInformationForm form={form} />
          </Col>

          <Col xs={24} md={12}>
            <Title level={5}>Chosen service</Title>
            {hasService ? (
              <ServiceCard
                service={selectedService}
                dateTime={serviceDateTime}
                duration={serviceDuration}
              />
            ) : (
              <Text type="secondary">No service selected yet</Text>
            )}
          </Col>
        </Row>

        <Row
          justify="space-between"
          style={{
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid #f0f0f0',
          }}
        >
          <Col>
            <Button
              icon={hasService ? <EditOutlined /> : <PlusOutlined />}
              onClick={handleOpenServiceModal}
            >
              {hasService ? 'Change Service' : 'Add Service'}
            </Button>
          </Col>
          <Col>
            <Button
              type="primary"
              onClick={() => void handleConfirmReservation()}
              disabled={!hasService}
              loading={loading}
            >
              Confirm Reservation
            </Button>
          </Col>
        </Row>
      </Card>

      {/* This one is temporary  */}
      <ServiceSelectionModal
        open={isServiceModalOpen}
        onClose={handleCloseServiceModal}
        onSelect={handleSelectService}
        initialService={selectedService}
        initialDateTime={serviceDateTime}
        initialDuration={serviceDuration}
      />
    </div>
  );
};
