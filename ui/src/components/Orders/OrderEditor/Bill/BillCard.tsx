import { Button, Card, Tag, Typography } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { Bill } from './types';

type Props = {
  bill: Bill;
  total: number;
  isSelected: boolean;
  isPaying: boolean;
  onSelect: () => void;
  onPay: () => void;
};

const { Text } = Typography;

export const BillCard = ({
  bill,
  total,
  isSelected,
  isPaying,
  onSelect,
  onPay,
}: Props) => (
  <Card
    size="small"
    style={{
      width: 140,
      flexShrink: 0,
      cursor: bill.isPaid ? 'default' : 'pointer',
      border: isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9',
      background: bill.isPaid ? '#f6ffed' : undefined,
    }}
    onClick={() => !bill.isPaid && onSelect()}
    styles={{ body: { padding: 12 } }}
  >
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text strong>Bill {bill.id}</Text>
        {bill.isPaid && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
      </div>
      <Text style={{ fontSize: 13 }}>Total: {total.toFixed(2)}</Text>
      <Tag
        color={bill.isPaid ? 'success' : 'default'}
        style={{ width: 'fit-content', fontSize: 11 }}
      >
        {bill.isPaid ? 'Paid' : 'Unpaid'}
      </Tag>
      <Button
        type="primary"
        size="small"
        block
        disabled={bill.isPaid || total === 0}
        loading={isPaying}
        onClick={(e) => {
          e.stopPropagation();
          onPay();
        }}
        style={{ marginTop: 4 }}
      >
        Pay
      </Button>
    </div>
  </Card>
);
