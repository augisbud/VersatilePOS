import { useState, useMemo, useEffect } from 'react';
import { Card, Typography, Button, Spin } from 'antd';
import { ModelsServiceDto, ModelsAccountDto } from '@/api/types.gen';
import { useServices } from '@/hooks/useServices';
import { useReservations } from '@/hooks/useReservations';
import { useTimeSlots, DAYS_TO_SHOW } from '@/hooks/useTimeSlots';
import { useUser } from '@/hooks/useUser';
import type { DayColumn, TimeSlot, SelectedSlot } from '@/types/timeSlot';
import dayjs, { Dayjs } from 'dayjs';
import { ServiceSpecialistSelectors } from './ServiceSpecialistSelectors';
import { TimeGrid } from './TimeGrid';

const { Title, Text } = Typography;

interface ServiceSelectionProps {
  onCancel: () => void;
  onContinue: (
    service: ModelsServiceDto,
    specialist: ModelsAccountDto,
    dateTime: string,
    duration: number
  ) => void;
  initialService?: ModelsServiceDto | null;
  initialSpecialist?: ModelsAccountDto | null;
  initialDateTime?: string;
}

export const ServiceSelection = ({
  onCancel,
  onContinue,
  initialService,
  initialSpecialist,
  initialDateTime,
}: ServiceSelectionProps) => {
  const { services, loading: servicesLoading, fetchServices } = useServices();
  const { reservations, fetchReservations } = useReservations();
  const { user } = useUser();

  const [selectedServiceId, setSelectedServiceId] = useState<
    number | undefined
  >(initialService?.id);
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<
    number | undefined
  >(initialSpecialist?.id);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(
    initialDateTime
      ? {
          date: dayjs(initialDateTime).format('MM-DD'),
          time: dayjs(initialDateTime).format('HH:mm'),
          dateTime: dayjs(initialDateTime),
        }
      : null
  );
  const [startDate, setStartDate] = useState<Dayjs>(dayjs().startOf('day'));

  useEffect(() => {
    if (user?.businessId) {
      void fetchServices(user.businessId);
      void fetchReservations();
    }
  }, [user?.businessId]);

  const selectedService = useMemo(
    () => services.find((s) => s.id === selectedServiceId),
    [services, selectedServiceId]
  );

  const specialists = useMemo(() => {
    if (!selectedService?.employees) return [];
    return selectedService.employees;
  }, [selectedService]);

  const selectedSpecialist = useMemo(
    () => specialists.find((s) => s.id === selectedSpecialistId),
    [specialists, selectedSpecialistId]
  );

  const dayColumns = useTimeSlots(
    selectedService,
    selectedSpecialistId,
    reservations,
    startDate
  );

  const today = dayjs().startOf('day');
  const canGoBack = startDate.isAfter(today);

  const handleServiceChange = (serviceId: number) => {
    setSelectedServiceId(serviceId);
    setSelectedSpecialistId(undefined);
    setSelectedSlot(null);
    setStartDate(dayjs().startOf('day'));
  };

  const handleSpecialistChange = (specialistId: number) => {
    setSelectedSpecialistId(specialistId);
    setSelectedSlot(null);
    setStartDate(dayjs().startOf('day'));
  };

  const handleSlotClick = (column: DayColumn, slot: TimeSlot) => {
    if (!slot.isAvailable) {
      return;
    }

    setSelectedSlot({
      date: column.dateLabel,
      time: slot.time,
      dateTime: slot.dateTime,
    });
  };

  const handlePreviousDays = () => {
    const newStart = startDate.subtract(DAYS_TO_SHOW, 'day');

    if (newStart.isBefore(today)) {
      setStartDate(today);
    } else {
      setStartDate(newStart);
    }
  };

  const handleNextDays = () => {
    setStartDate(startDate.add(DAYS_TO_SHOW, 'day'));
  };

  const handleContinue = () => {
    if (!selectedService || !selectedSpecialist || !selectedSlot) {
      return;
    }

    onContinue(
      selectedService,
      selectedSpecialist,
      selectedSlot.dateTime.toISOString(),
      selectedService.provisioningInterval || 30
    );
  };

  const canContinue = selectedService && selectedSpecialist && selectedSlot;
  const hasSelections = !!selectedServiceId && !!selectedSpecialistId;

  return (
    <Card
      title={
        <Title level={4} style={{ margin: 0 }}>
          Service reservation
        </Title>
      }
      extra={
        <Button type="text" onClick={onCancel}>
          Go Back
        </Button>
      }
      styles={{ body: { padding: '24px' } }}
    >
      <Spin spinning={servicesLoading}>
        <ServiceSpecialistSelectors
          services={services}
          specialists={specialists}
          selectedServiceId={selectedServiceId}
          selectedSpecialistId={selectedSpecialistId}
          onServiceChange={handleServiceChange}
          onSpecialistChange={handleSpecialistChange}
        />

        <div style={{ marginBottom: '24px' }}>
          <Text strong style={{ display: 'block', marginBottom: '16px' }}>
            Available times:
          </Text>

          <TimeGrid
            hasSelections={hasSelections}
            dayColumns={dayColumns}
            selectedSlot={selectedSlot}
            onSlotClick={handleSlotClick}
            canGoBack={canGoBack}
            onPrevious={handlePreviousDays}
            onNext={handleNextDays}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="primary"
            onClick={handleContinue}
            disabled={!canContinue}
            size="large"
          >
            Continue
          </Button>
        </div>
      </Spin>
    </Card>
  );
};
