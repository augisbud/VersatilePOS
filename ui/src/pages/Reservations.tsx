import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Typography, Alert, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { AccessDenied, EmptyState } from '@/components/shared';
import { useReservations } from '@/hooks/useReservations';
import { useServices } from '@/hooks/useServices';
import { useEmployees } from '@/hooks/useEmployees';
import { usePayments } from '@/hooks/usePayments';
import { useUser } from '@/hooks/useUser';
import {
  getReservationColumns,
  EditReservationModal,
  ReservationPaymentModal,
} from '@/components/Reservations';
import {
  ModelsReservationDto,
  ModelsUpdateReservationRequest,
} from '@/api/types.gen';

type PaymentType = 'Cash' | 'CreditCard' | 'GiftCard';

const { Title } = Typography;

export const Reservations = () => {
  const navigate = useNavigate();
  const { reservations, loading, error, fetchReservations, updateReservation } =
    useReservations();
  const { services, fetchServices } = useServices();
  const { employees, fetchEmployees } = useEmployees();
  const { createPayment, linkPaymentToReservation } = usePayments();
  const { user, canReadReservations, canWriteReservations } = useUser();

  const [editingReservation, setEditingReservation] =
    useState<ModelsReservationDto | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [payingReservation, setPayingReservation] =
    useState<ModelsReservationDto | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

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

  const handlePayReservation = (reservation: ModelsReservationDto) => {
    setPayingReservation(reservation);
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setPayingReservation(null);
  };

  const handleProcessPayment = async (
    reservationId: number,
    amount: number,
    paymentType: PaymentType,
    tipAmount: number
  ) => {
    if (tipAmount > 0) {
      await updateReservation(reservationId, { tipAmount });
    }

    const payment = await createPayment({
      amount,
      type: paymentType,
      status: 'Completed',
    });

    if (payment.id) {
      await linkPaymentToReservation(reservationId, payment.id);
    }

    void fetchReservations();
  };

  const columns = getReservationColumns({
    services,
    employees,
    canWrite: canWriteReservations,
    onEdit: handleEditReservation,
    onPay: handlePayReservation,
  });

  if (!canReadReservations) {
    return <AccessDenied resource="reservations" />;
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
          emptyText: (
            <EmptyState
              variant="reservations"
              title="No Reservations Yet"
              description="No reservations have been made. Create your first reservation to start booking appointments."
              actionLabel={
                canWriteReservations ? 'Create Reservation' : undefined
              }
              onAction={handleNewReservation}
              showAction={canWriteReservations}
            />
          ),
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

      <ReservationPaymentModal
        open={isPaymentModalOpen}
        reservation={payingReservation}
        services={services}
        onClose={handleClosePaymentModal}
        onPayment={handleProcessPayment}
      />
    </div>
  );
};
