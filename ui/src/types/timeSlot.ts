import { Dayjs } from 'dayjs';

export interface TimeSlot {
  time: string;
  dateTime: Dayjs;
  isAvailable: boolean;
}

export interface DayColumn {
  date: Dayjs;
  dateLabel: string;
  slots: TimeSlot[];
}

export interface SelectedSlot {
  date: string;
  time: string;
  dateTime: Dayjs;
}
