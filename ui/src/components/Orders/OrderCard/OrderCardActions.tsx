import { ReactNode } from 'react';
import { Popconfirm, Tooltip } from 'antd';
import {
  CloseCircleOutlined,
  EditOutlined,
  RollbackOutlined,
} from '@ant-design/icons';
import { ModelsOrderDto } from '@/api/types.gen';

type Props = {
  order: ModelsOrderDto;
  canWriteOrders: boolean;
  onEdit: (order: ModelsOrderDto) => void;
  onCancel: (orderId: number) => void;
  onRefund: (orderId: number) => void;
};

export const useOrderCardActions = ({
  order,
  canWriteOrders,
  onEdit,
  onCancel,
  onRefund,
}: Props): ReactNode[] => {
  const isCancelled = order.status === 'Cancelled';
  const isConfirmed = order.status === 'Confirmed';
  const isCompleted = order.status === 'Completed';
  const isRefunded = order.status === 'Refunded';

  const actions: ReactNode[] = [
    <Tooltip title="Edit Order" key="edit">
      <EditOutlined onClick={() => onEdit(order)} />
    </Tooltip>,
  ];

  if (canWriteOrders && !isCancelled && !isCompleted && !isRefunded) {
    actions.push(
      <Popconfirm
        key="cancel"
        title="Cancel Order"
        description="Are you sure you want to cancel this order?"
        onConfirm={() => order.id && onCancel(order.id)}
        okText="Yes, Cancel"
        cancelText="No"
        okButtonProps={{ danger: true }}
      >
        <Tooltip title="Cancel Order">
          <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
        </Tooltip>
      </Popconfirm>
    );
  }

  if (canWriteOrders && (isConfirmed || isCompleted)) {
    actions.push(
      <Popconfirm
        key="refund"
        title="Refund Order"
        description="Are you sure you want to refund this order?"
        onConfirm={() => order.id && onRefund(order.id)}
        okText="Yes, Refund"
        cancelText="No"
        okButtonProps={{
          style: { background: '#fa8c16', borderColor: '#fa8c16' },
        }}
      >
        <Tooltip title="Refund Order">
          <RollbackOutlined style={{ color: '#fa8c16' }} />
        </Tooltip>
      </Popconfirm>
    );
  }

  return actions;
};
