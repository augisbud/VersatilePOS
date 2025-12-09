import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Typography, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import {
  ClientInformationForm,
  ServiceCard,
  ServiceSelection,
} from '@/components/Reservations';
import type { ClientFormValues } from '@/components/Reservations';
import { useReservations } from '@/hooks/useReservations';
import { ModelsServiceDto, ModelsAccountDto } from '@/api/types.gen';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

type PageState = 'service-selection' | 'reservation-details';

export const NewReservation = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<ClientFormValues>();
  const { createReservation, loading } = useReservations();

  const [pageState, setPageState] = useState<PageState>('reservation-details');
  const [selectedService, setSelectedService] =
    useState<ModelsServiceDto | null>(null);
  const [selectedSpecialist, setSelectedSpecialist] =
    useState<ModelsAccountDto | null>(null);
  const [serviceDateTime, setServiceDateTime] = useState<string>('');
  const [serviceDuration, setServiceDuration] = useState<number>(0);

  const handleCancel = () => {
    void navigate('/reservations');
  };

  const handleServiceSelectionContinue = (
    service: ModelsServiceDto,
    specialist: ModelsAccountDto,
    dateTime: string,
    duration: number
  ) => {
    setSelectedService(service);
    setSelectedSpecialist(specialist);
    setServiceDateTime(dateTime);
    setServiceDuration(duration);
    setPageState('reservation-details');
  };

  const handleServiceSelectionCancel = () => {
    setPageState('reservation-details');
  };

  const handleOpenServiceSelection = () => {
    setPageState('service-selection');
  };

  const handleConfirmReservation = async () => {
    const values = await form.validateFields();

    if (!selectedService?.id || !selectedSpecialist?.id) {
      return;
    }

    const customerName = `${values.name} ${values.surname}`;

    try {
      await createReservation({
        accountId: selectedSpecialist.id,
        serviceId: selectedService.id,
        customer: customerName,
        customerEmail: values.email || undefined,
        customerPhone: values.phoneNumber || undefined,
        dateOfService: dayjs(serviceDateTime).toISOString(),
        datePlaced: dayjs().toISOString(),
        reservationLength: serviceDuration,
        status: 'Confirmed',
      });
    } catch (error) {
      console.error('Failed to create reservation:', error);
    } finally {
      void navigate('/reservations');
    }
  };

  const hasService = selectedService && serviceDateTime && serviceDuration;

  if (pageState === 'service-selection') {
    return (
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <ServiceSelection
          onCancel={handleServiceSelectionCancel}
          onContinue={handleServiceSelectionContinue}
          initialService={selectedService}
          initialSpecialist={selectedSpecialist}
          initialDateTime={serviceDateTime || undefined}
        />
      </div>
    );
  }

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
              <>
                <ServiceCard
                  service={selectedService}
                  dateTime={serviceDateTime}
                  duration={serviceDuration}
                />
                {selectedSpecialist && (
                  <Text
                    type="secondary"
                    style={{ display: 'block', marginTop: '8px' }}
                  >
                    Specialist: {selectedSpecialist.name}
                  </Text>
                )}
              </>
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
              onClick={handleOpenServiceSelection}
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
    </div>
  );
};
