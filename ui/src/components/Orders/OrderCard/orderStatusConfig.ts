export type OrderStatusStyle = {
  color: string;
  bgColor: string;
  borderColor: string;
};

export const ORDER_STATUS_CONFIG: Record<string, OrderStatusStyle> = {
  Pending: {
    color: '#1677ff',
    bgColor: 'rgba(22, 119, 255, 0.08)',
    borderColor: 'rgba(22, 119, 255, 0.3)',
  },
  Confirmed: {
    color: '#722ed1',
    bgColor: 'rgba(114, 46, 209, 0.08)',
    borderColor: 'rgba(114, 46, 209, 0.3)',
  },
  Completed: {
    color: '#52c41a',
    bgColor: 'rgba(82, 196, 26, 0.08)',
    borderColor: 'rgba(82, 196, 26, 0.3)',
  },
  Refunded: {
    color: '#fa8c16',
    bgColor: 'rgba(250, 140, 22, 0.08)',
    borderColor: 'rgba(250, 140, 22, 0.3)',
  },
  Cancelled: {
    color: '#ff4d4f',
    bgColor: 'rgba(255, 77, 79, 0.08)',
    borderColor: 'rgba(255, 77, 79, 0.3)',
  },
};

const DEFAULT_STATUS_STYLE: OrderStatusStyle = {
  color: '#8c8c8c',
  bgColor: 'rgba(140, 140, 140, 0.08)',
  borderColor: 'rgba(140, 140, 140, 0.3)',
};

export const getOrderStatusStyle = (status?: string): OrderStatusStyle => {
  if (!status) return DEFAULT_STATUS_STYLE;
  return ORDER_STATUS_CONFIG[status] || DEFAULT_STATUS_STYLE;
};
