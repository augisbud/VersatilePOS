import dayjs from 'dayjs';
import { ModelsPriceModifierDto } from '@/api/types.gen';

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

export const formatPriceModifierValue = (
  pm: ModelsPriceModifierDto
): string => {
  return pm.isPercentage ? `${pm.value}%` : `$${pm.value?.toFixed(2)}`;
};

export const getPriceModifierDisplay = (
  priceModifiers: ModelsPriceModifierDto[],
  priceModifierId?: number
): string => {
  if (!priceModifierId) return '-';
  const pm = priceModifiers.find((p) => p.id === priceModifierId);
  if (!pm) return '-';
  return `${pm.name} (${formatPriceModifierValue(pm)})`;
};

export const getPriceModifierSelectOptions = (
  priceModifiers: ModelsPriceModifierDto[]
) => {
  return priceModifiers.map((pm) => ({
    value: pm.id,
    label: `${pm.name} (${formatPriceModifierValue(pm)})`,
  }));
};

export const formatPriceChange = (change: number): string => {
  if (change === 0) return '';
  const sign = change > 0 ? '+' : '';
  return ` (${sign}$${change.toFixed(2)})`;
};
