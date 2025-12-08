import { useMemo } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { ModelsServiceDto, ModelsReservationDto } from '@/api/types.gen';
import type { TimeSlot, DayColumn } from '@/types/timeSlot';

export const DAYS_TO_SHOW = 4;

const generateTimeSlots = (
  date: Dayjs,
  service: ModelsServiceDto,
  specialistId: number,
  reservations: ModelsReservationDto[]
): TimeSlot[] => {
  const slots: TimeSlot[] = [];

  if (
    !service.provisioningStartTime ||
    !service.provisioningEndTime ||
    !service.provisioningInterval
  ) {
    return slots;
  }

  const [startHour, startMin] = service.provisioningStartTime
    .split(':')
    .map(Number);
  const [endHour, endMin] = service.provisioningEndTime.split(':').map(Number);
  const interval = service.provisioningInterval;

  let currentTime = date
    .hour(startHour)
    .minute(startMin)
    .second(0)
    .millisecond(0);
  const endTime = date.hour(endHour).minute(endMin).second(0).millisecond(0);

  while (currentTime.isBefore(endTime)) {
    const slotDateTime = currentTime;
    const slotEndTime = currentTime.add(interval, 'minute');

    const isAvailable = !reservations.some((reservation) => {
      if (reservation.accountId !== specialistId) {
        return false;
      }

      if (reservation.status === 'Cancelled') {
        return false;
      }

      const resStart = dayjs(reservation.dateOfService);
      const resEnd = resStart.add(reservation.reservationLength || 0, 'minute');

      return slotDateTime.isBefore(resEnd) && slotEndTime.isAfter(resStart);
    });

    const isPast = slotDateTime.isBefore(dayjs());

    slots.push({
      time: currentTime.format('HH:mm'),
      dateTime: slotDateTime,
      isAvailable: isAvailable && !isPast,
    });

    currentTime = currentTime.add(interval, 'minute');
  }

  return slots;
};

export const useTimeSlots = (
  selectedService: ModelsServiceDto | undefined,
  selectedSpecialistId: number | undefined,
  reservations: ModelsReservationDto[],
  startDate: Dayjs
): DayColumn[] => {
  return useMemo(() => {
    if (!selectedService || !selectedSpecialistId) {
      return [];
    }

    const columns: DayColumn[] = [];

    for (let i = 0; i < DAYS_TO_SHOW; i++) {
      const date = startDate.add(i, 'day');
      columns.push({
        date,
        dateLabel: date.format('MM-DD'),
        slots: generateTimeSlots(
          date,
          selectedService,
          selectedSpecialistId,
          reservations
        ),
      });
    }

    return columns;
  }, [selectedService, selectedSpecialistId, reservations, startDate]);
};
