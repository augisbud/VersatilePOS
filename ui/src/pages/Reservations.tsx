import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Typography, Alert, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useReservations } from '@/hooks/useReservations';
import { getReservationColumns } from '@/components/Reservations';

const { Title } = Typography;

export const Reservations = () => {
  const navigate = useNavigate();
  const { reservations, loading, error, fetchReservations } = useReservations();

  useEffect(() => {
    void fetchReservations();
  }, []);

  const columns = getReservationColumns();

  const handleNewReservation = () => {
    void navigate('/reservations/new');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div
        style={{
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Reservations
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleNewReservation}
        >
          New Reservation
        </Button>
      </div>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

      <Table
        columns={columns}
        dataSource={reservations}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} reservations`,
        }}
        locale={{
          emptyText: 'No reservations found.',
        }}
      />
    </div>
  );
};
