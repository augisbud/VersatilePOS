import { Space, Typography } from 'antd';
import { DollarOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { formatCurrency } from '@/utils/formatters';

type Props = {
  itemsSubtotal?: number;
  discountTotal?: number;
  serviceCharge?: number;
  tipAmount?: number;
};

const { Text } = Typography;

export const OrderCardCharges = ({
  itemsSubtotal,
  discountTotal,
  serviceCharge,
  tipAmount,
}: Props) => {
  const itemsTotal = itemsSubtotal ?? 0;
  const discounts = discountTotal ?? 0;
  const serviceChargeAmount = serviceCharge ?? 0;
  const tipAmountValue = tipAmount ?? 0;
  const grandTotal = Math.max(
    0,
    itemsTotal - discounts + serviceChargeAmount + tipAmountValue
  );

  return (
    <Space
      direction="vertical"
      size={4}
      style={{ width: '100%', marginBottom: 12 }}
    >
      {/* Items Subtotal */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text type="secondary" style={{ fontSize: 12 }}>
          <ShoppingCartOutlined style={{ marginRight: 4 }} />
          Items
        </Text>
        <Text style={{ fontSize: 12, fontWeight: 500 }}>
          {itemsSubtotal !== undefined ? formatCurrency(itemsSubtotal) : '—'}
        </Text>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text type="secondary" style={{ fontSize: 12 }}>
          Service Charge
        </Text>
        <Text style={{ fontSize: 12 }}>{formatCurrency(serviceCharge)}</Text>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text type="secondary" style={{ fontSize: 12 }}>
          Discounts
        </Text>
        <Text style={{ fontSize: 12, color: '#52c41a' }}>
          {discountTotal !== undefined ? `-${formatCurrency(discounts)}` : '—'}
        </Text>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text type="secondary" style={{ fontSize: 12 }}>
          Tip
        </Text>
        <Text style={{ fontSize: 12 }}>{formatCurrency(tipAmount)}</Text>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px dashed #f0f0f0',
          paddingTop: 8,
          marginTop: 4,
        }}
      >
        <Text strong style={{ fontSize: 13 }}>
          Order Total
        </Text>
        <Text strong style={{ fontSize: 14, color: '#1677ff' }}>
          <DollarOutlined style={{ marginRight: 4 }} />
          {grandTotal.toFixed(2)}
        </Text>
      </div>
    </Space>
  );
};
