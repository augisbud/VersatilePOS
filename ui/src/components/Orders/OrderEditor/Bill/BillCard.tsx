import { Button, Card, Tag, Typography, Dropdown, Space } from 'antd';
import { CheckCircleOutlined, DownOutlined, DollarOutlined, CreditCardOutlined, GiftOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Bill, PaymentType } from './types';

type Props = {
  bill: Bill;
  total: number;
  isSelected: boolean;
  isPaying: boolean;
  onSelect: () => void;
  onPay: (paymentType: PaymentType) => void;
};

const { Text } = Typography;

const paymentOptions: MenuProps['items'] = [
  {
    key: 'Cash',
    label: (
      <Space>
        <DollarOutlined style={{ color: '#52c41a' }} />
        <span>Cash</span>
      </Space>
    ),
  },
  {
    key: 'CreditCard',
    label: (
      <Space>
        <CreditCardOutlined style={{ color: '#1890ff' }} />
        <span>Card</span>
      </Space>
    ),
  },
  {
    key: 'GiftCard',
    label: (
      <Space>
        <GiftOutlined style={{ color: '#faad14' }} />
        <span>Gift Card</span>
      </Space>
    ),
  },
];

export const BillCard = ({
  bill,
  total,
  isSelected,
  isPaying,
  onSelect,
  onPay,
}: Props) => {
  const handlePaymentClick: MenuProps['onClick'] = (e) => {
    e.domEvent.stopPropagation();
    onPay(e.key as PaymentType);
  };

  return (
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
        <Text style={{ fontSize: 13 }}>Total: ${total.toFixed(2)}</Text>
        <Tag
          color={bill.isPaid ? 'success' : 'default'}
          style={{ width: 'fit-content', fontSize: 11 }}
        >
          {bill.isPaid ? 'Paid' : 'Unpaid'}
        </Tag>
        <Dropdown
          menu={{ items: paymentOptions, onClick: handlePaymentClick }}
          trigger={['click']}
          disabled={bill.isPaid || total === 0 || isPaying}
        >
          <Button
            type="primary"
            size="small"
            block
            disabled={bill.isPaid || total === 0}
            loading={isPaying}
            onClick={(e) => e.stopPropagation()}
            style={{ marginTop: 4 }}
          >
            <Space>
              Pay
              <DownOutlined style={{ fontSize: 10 }} />
            </Space>
          </Button>
        </Dropdown>
      </div>
    </Card>
  );
};
