import { Button, Card, Divider, InputNumber, Space, Typography } from 'antd';
import { formatCurrency } from '@/utils/formatters';
import { SelectedOrderItem, SelectedItemOption } from '@/hooks/useNewOrderBuilder';

type OptionLookup = Record<number, string>;

type Props = {
  items: Array<
    SelectedOrderItem & {
      name: string;
      price: number;
    }
  >;
  optionLookup: OptionLookup;
  orderTotal: number;
  getOptionUnitPrice: (optionId: number, itemPrice: number) => number;
  onOpenOptions: (itemId: number) => void;
  onRemoveItem: (itemId: number) => void;
  onQuantityChange: (itemId: number, value: number | null) => void;
  onSubmit: () => void;
  onCancel: () => void;
  selectedBusinessId?: number | null;
  loading?: boolean;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
};

const { Text } = Typography;

export const OrderSummaryCard = ({
  items,
  optionLookup,
  orderTotal,
  getOptionUnitPrice,
  onOpenOptions,
  onRemoveItem,
  onQuantityChange,
  onSubmit,
  onCancel,
  selectedBusinessId,
  loading,
  primaryActionLabel = 'Create order',
  secondaryActionLabel = 'Cancel order',
}: Props) => (
  <Card title="Order information" bodyStyle={{ padding: 16 }}>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '110px 70px 1fr 80px 80px',
        fontWeight: 600,
        marginBottom: 8,
        gap: 8,
        alignItems: 'center',
      }}
    >
      <span>Options</span>
      <span style={{ textAlign: 'center' }}>Remove</span>
      <span>Name</span>
      <span style={{ textAlign: 'center' }}>Qty.</span>
      <span style={{ textAlign: 'right' }}>Price</span>
    </div>

    <Space direction="vertical" style={{ width: '100%' }} size="small">
      {items.map((item) => {
        const itemPrice = item.price ?? 0;
        return (
          <div
            key={item.itemId}
            style={{
              display: 'grid',
              gridTemplateColumns: '110px 70px 1fr 80px 80px',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Button size="small" onClick={() => onOpenOptions(item.itemId)}>
              Add options
            </Button>
            <Button
              size="small"
              danger
              type="text"
              onClick={() => onRemoveItem(item.itemId)}
            >
              Remove
            </Button>
            <Text>{item.name}</Text>
            <InputNumber
              min={1}
              value={item.count}
              onChange={(value) => onQuantityChange(item.itemId, value)}
              style={{ width: '100%' }}
            />
            <Text style={{ textAlign: 'right' }}>
              {formatCurrency(itemPrice * item.count)}
            </Text>
            {item.options?.length ? (
              <div
                style={{
                  gridColumn: '1 / -1',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  paddingLeft: 4,
                }}
              >
                {item.options.map((opt: SelectedItemOption) => {
                  const unit = getOptionUnitPrice(opt.itemOptionId, itemPrice);
                  const lineTotal = unit * opt.count;
                  return (
                    <div
                      key={opt.itemOptionId}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text type="secondary">
                        {optionLookup[opt.itemOptionId] ??
                          `Option #${opt.itemOptionId}`}{' '}
                        · x{opt.count}
                      </Text>
                      <Text type="secondary">{formatCurrency(lineTotal)}</Text>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}

      {!items.length && (
        <Text type="secondary">No items selected yet.</Text>
      )}
    </Space>

    <Divider style={{ margin: '16px 0' }} />
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontWeight: 600,
        marginBottom: 16,
      }}
    >
      <span>Total:</span>
      <span>{formatCurrency(orderTotal)}</span>
    </div>

    <Space direction="vertical" style={{ width: '100%' }}>
      <Button block disabled>
        Add discount
      </Button>
      <Button
        type="primary"
        block
        onClick={onSubmit}
        disabled={!selectedBusinessId || !items.length}
        loading={loading}
      >
        {primaryActionLabel}
      </Button>
      <Button danger block onClick={onCancel}>
        {secondaryActionLabel}
      </Button>
    </Space>
  </Card>
);


