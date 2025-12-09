import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Typography, Alert, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useReservations } from '@/hooks/useReservations';
import { useServices } from '@/hooks/useServices';
import { useEmployees } from '@/hooks/useEmployees';
import { useUser } from '@/hooks/useUser';
import {
  getReservationColumns,
  EditReservationModal,
} from '@/components/Reservations';
import {
  ModelsReservationDto,
  ModelsUpdateReservationRequest,
} from '@/api/types.gen';

const { Title } = Typography;

export const Reservations = () => {
  const navigate = useNavigate();
  const { reservations, loading, error, fetchReservations, updateReservation } =
    useReservations();
  const { services, fetchServices } = useServices();
  const { employees, fetchEmployees } = useEmployees();
  const { user, canReadReservations, canWriteReservations } = useUser();

  const [editingReservation, setEditingReservation] =
    useState<ModelsReservationDto | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void fetchReservations();
    if (user?.businessId) {
      void fetchServices(user.businessId);
      void fetchEmployees(user.businessId);
    }
  }, [user?.businessId]);

  const handleNewReservation = () => {
    void navigate('/reservations/new');
  };

  const handleEditReservation = (reservation: ModelsReservationDto) => {
    setEditingReservation(reservation);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingReservation(null);
  };

  const handleSubmitEdit = async (
    id: number,
    data: ModelsUpdateReservationRequest
  ) => {
    setIsSubmitting(true);
    try {
      await updateReservation(id, data);
      handleCloseEditModal();
      void fetchReservations();
    } catch (err) {
      console.error('Failed to update reservation:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = getReservationColumns({
    services,
    employees,
    canWrite: canWriteReservations,
    onEdit: handleEditReservation,
  });

  if (!canReadReservations) {
    return (
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        <Alert
          message="Access Denied"
          description="You don't have permission to view reservations."
          type="error"
          showIcon
        />
      </div>
    );
  }

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
        {canWriteReservations && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleNewReservation}
          >
            New Reservation
          </Button>
        )}
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
        scroll={{ x: 1200 }}
      />

      <EditReservationModal
        open={isEditModalOpen}
        reservation={editingReservation}
        isSubmitting={isSubmitting}
        onClose={handleCloseEditModal}
        onSubmit={(id, data) => void handleSubmitEdit(id, data)}
      />
    </div>
  );
};
