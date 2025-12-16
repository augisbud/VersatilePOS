import { Card } from 'antd';
import { ModelsOrderDto } from '@/api/types.gen';
import { getOrderStatusStyle } from './orderStatusConfig';
import { OrderCardHeader } from './OrderCardHeader';
import { OrderCardCustomer } from './OrderCardCustomer';
import { OrderCardCharges } from './OrderCardCharges';
import { OrderCardTimestamp } from './OrderCardTimestamp';
import { useOrderCardActions } from './OrderCardActions';

type Props = {
  order: ModelsOrderDto;
  loading?: boolean;
  canWriteOrders: boolean;
  itemsSubtotal?: number;
  discountTotal?: number;
  onEdit: (order: ModelsOrderDto) => void;
  onCancel: (orderId: number) => void;
  onRefund: (orderId: number) => void;
};

export const OrderCard = ({
  order,
  loading,
  canWriteOrders,
  itemsSubtotal,
  discountTotal,
  onEdit,
  onCancel,
  onRefund,
}: Props) => {
  const statusStyle = getOrderStatusStyle(order.status);
  const actions = useOrderCardActions({
    order,
    canWriteOrders,
    onEdit,
    onCancel,
    onRefund,
  });

  return (
    <Card
      loading={loading}
      style={{
        borderRadius: 16,
        overflow: 'hidden',
        border: `1px solid ${statusStyle.borderColor}`,
        transition: 'all 0.3s ease',
      }}
      styles={{
        body: { padding: 0 },
      }}
      actions={actions.map((action, index) => (
        <span key={index} onClick={(e) => e.stopPropagation()}>
          {action}
        </span>
      ))}
    >
      <OrderCardHeader
        orderId={order.id}
        status={order.status}
        statusStyle={statusStyle}
      />

      <div style={{ padding: 16 }}>
        <OrderCardCustomer customer={order.customer} />
        <OrderCardCharges
          itemsSubtotal={itemsSubtotal}
          discountTotal={discountTotal}
          serviceCharge={order.serviceCharge}
          tipAmount={order.tipAmount}
        />
        <OrderCardTimestamp datePlaced={order.datePlaced} />
      </div>
    </Card>
  );
};
