import { Tag, Typography } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { OrderStatusStyle } from './orderStatusConfig';

type Props = {
  orderId?: number;
  status?: string;
  statusStyle: OrderStatusStyle;
};

const { Title } = Typography;

export const OrderCardHeader = ({ orderId, status, statusStyle }: Props) => {
  return (
    <div
      style={{
        background: statusStyle.bgColor,
        borderBottom: `1px solid ${statusStyle.borderColor}`,
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ShoppingCartOutlined
          style={{ fontSize: 18, color: statusStyle.color }}
        />
        <Title
          level={5}
          style={{ margin: 0, color: statusStyle.color, fontWeight: 700 }}
        >
          #{orderId}
        </Title>
      </div>
      <Tag
        color={statusStyle.color}
        style={{
          margin: 0,
          borderRadius: 12,
          fontWeight: 600,
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {status || 'Unknown'}
      </Tag>
    </div>
  );
};
