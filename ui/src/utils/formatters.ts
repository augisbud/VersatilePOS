import dayjs from 'dayjs';

export const formatDateTime = (date: string | undefined): string => {
  if (!date) {
    return '-';
  }

  return dayjs(date).format('MMM D, YYYY HH:mm');
};

export const formatDate = (date: string | undefined): string => {
  if (!date) {
    return '-';
  }

  return dayjs(date).format('MMM D, YYYY');
};

export const formatDateShort = (date: string | undefined): string => {
  if (!date) {
    return '-';
  }

  return dayjs(date).format('MM-DD');
};

export const formatTime = (date: string | undefined): string => {
  if (!date) {
    return '-';
  }

  return dayjs(date).format('HH:mm');
};

export const formatCurrency = (amount: number | undefined): string => {
  if (amount === undefined || amount === null) {
    return '-';
  }

  return `$${amount.toFixed(2)}`;
};

export const formatDuration = (minutes: number | undefined): string => {
  if (!minutes) {
    return '-';
  }

  return `${minutes} min`;
};
