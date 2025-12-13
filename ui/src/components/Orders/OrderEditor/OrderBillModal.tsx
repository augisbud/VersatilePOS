import { Modal, Divider, Typography, Spin } from 'antd';
import dayjs from 'dayjs';
import {
  BillItemsTable,
  BillTotal,
  PaymentButtons,
  BillItem,
  PaymentType,
} from './Bill';

type Props = {
  open: boolean;
  items: BillItem[];
  total: number;
  orderCreatedAt?: string;
  loading?: boolean;
  onPayment: (paymentType: PaymentType) => void;
  onAddTip: () => void;
  onClose: () => void;
};

const { Text } = Typography;

export const OrderBillModal = ({
  open,
  items,
  total,
  orderCreatedAt,
  loading,
  onPayment,
  onAddTip,
  onClose,
}: Props) => {
  const billCreatedAt = dayjs().format('YYYY-MM-DD HH:mm');
  const formattedOrderDate = orderCreatedAt
    ? dayjs(orderCreatedAt).format('YYYY-MM-DD HH:mm')
    : dayjs().format('YYYY-MM-DD HH:mm');

  return (
    <Modal
      title="Order Bill"
      open={open}
      onCancel={onClose}
      footer={null}
      width={520}
      centered
      destroyOnClose
    >
      <Spin spinning={loading}>
        <div style={{ display: 'flex', gap: 24 }}>
          {/* Left side - Bill details */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Order created: {formattedOrderDate}
            </Text>

            <Divider style={{ margin: '12px 0' }} />

            <BillItemsTable items={items} />

            <Divider style={{ margin: '12px 0' }} />

            <BillTotal total={total} />

            <Divider style={{ margin: '12px 0' }} />

            <Text type="secondary" style={{ fontSize: 12 }}>
              Bill created: {billCreatedAt}
            </Text>
          </div>

          {/* Right side - Payment buttons */}
          <PaymentButtons onPayment={onPayment} onAddTip={onAddTip} />
        </div>
      </Spin>
    </Modal>
  );
};
