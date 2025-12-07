import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Typography, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { ClientInformationForm, ServiceCard } from '@/components/Reservations';
import type {
  ClientFormValues,
  ServiceItem,
} from '@/components/Reservations/types';

const { Title, Text } = Typography;

export const NewReservation = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<ClientFormValues>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [service, setService] = useState<any>(null);

  const handleCancel = async () => {
    await navigate('/reservations');
  };

  const handleAddService = () => {
    // TODO: Open service selection modal
    const mockService: ServiceItem = {
      id: Date.now(),
      serviceName: 'chosen service',
      specialistName: 'specialist name',
      dateTime: '2025-10-25 11:00',
    };
    setService(mockService);
  };

  const handleConfirmReservation = async () => {
    await form.validateFields().then((values) => {
      console.log('Client info:', values);
      console.log('Service:', service);
      // TODO: Call API to create reservation
    });
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card
        title={
          <Title level={4} style={{ margin: 0 }}>
            Reservation details
          </Title>
        }
        extra={
          <Button type="text" onClick={() => void handleCancel()}>
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
            {service ? (
              <ServiceCard service={service} />
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
              icon={service ? <EditOutlined /> : <PlusOutlined />}
              onClick={handleAddService}
            >
              {service ? 'Change Service' : 'Add Service'}
            </Button>
          </Col>
          <Col>
            <Button
              type="primary"
              onClick={() => void handleConfirmReservation()}
              disabled={!service}
            >
              Confirm Reservation
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
};
