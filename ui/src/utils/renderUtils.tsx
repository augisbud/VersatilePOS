import { Tag } from 'antd';

export const renderStockTag = (qty: number | undefined | null) => {
  if (qty === undefined || qty === null) {
    return <span style={{ color: '#999' }}>-</span>;
  }
  return <Tag color={qty > 0 ? 'green' : 'red'}>{qty}</Tag>;
};

export const renderStockText = (qty: number | undefined | null) => {
  if (qty === undefined || qty === null) {
    return '-';
  }
  return qty;
};
