import { Button, Card, Divider, Typography } from 'antd';
import { OrderItemRow } from './OrderItemRow';

type ItemOption = {
  optionId: number;
  name: string;
  priceChange: string;
  count: number;
};

type OrderItem = {
  id?: number;
  itemId: number;
  itemName: string;
  quantity: number;
  lineTotal: number;
  options: ItemOption[];
};

type Props = {
  items: OrderItem[];
  total: number;
  loading?: boolean;
  canWriteOrders: boolean;
  isEditMode?: boolean;
  hasOrderId?: boolean;
  onEditItem: (itemId: number, orderItemId?: number) => void;
  onAddDiscount: () => void;
  onSaveOrder: () => void;
  onDoneEditing: () => void;
  onGenerateBill: () => void;
  onGenerateSplitBill: () => void;
  onCancelOrder: () => void;
};

const { Title } = Typography;

export const OrderInfoPanel = ({
  items,
  total,
  loading,
  canWriteOrders,
  isEditMode,
  hasOrderId,
  onEditItem,
  onAddDiscount,
  onSaveOrder,
  onDoneEditing,
  onGenerateBill,
  onGenerateSplitBill,
  onCancelOrder,
}: Props) => {
  // Bills can only be generated for saved orders
  const canGenerateBill = items.length > 0 && hasOrderId;

  return (
  <Card
    loading={loading}
    style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}
    styles={{
      body: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: 16,
        overflow: 'hidden',
      },
    }}
  >
    {/* Fixed top section */}
    <Title level={5} style={{ textAlign: 'center', marginBottom: 16 }}>
      Order information
    </Title>

    {/* Header */}
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 50px 70px',
        gap: 8,
        padding: '8px 0',
        borderBottom: '1px solid #f0f0f0',
        fontWeight: 600,
        fontSize: 13,
      }}
    >
      <div>Name</div>
      <div style={{ textAlign: 'center' }}>Qty.</div>
      <div style={{ textAlign: 'right' }}>Price</div>
    </div>

    {/* Scrollable items list */}
    <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
      {items.length === 0 ? (
        <div
          style={{
            padding: '32px 0',
            textAlign: 'center',
            color: '#999',
          }}
        >
          No items in order
        </div>
      ) : (
        items.map((item) => (
          <OrderItemRow
            key={item.id || item.itemId}
            itemName={item.itemName}
            quantity={item.quantity}
            lineTotal={item.lineTotal}
            options={item.options}
            canEdit={canWriteOrders}
            onEdit={() => onEditItem(item.itemId, item.id)}
          />
        ))
      )}
    </div>

    {/* Fixed bottom section */}
    <div style={{ flexShrink: 0 }}>
      {/* Total */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 70px',
          gap: 8,
          padding: '16px 0',
          borderTop: '2px solid #e8e8e8',
          fontWeight: 600,
        }}
      >
        <div>Total:</div>
        <div style={{ textAlign: 'right' }}>{total.toFixed(2)}</div>
      </div>

      {/* Add Discount */}
      <Button
        block
        onClick={onAddDiscount}
        disabled={items.length === 0 || !canWriteOrders}
        style={{ fontWeight: 500 }}
      >
        Add Discount
      </Button>

      <Divider style={{ margin: '16px 0' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {isEditMode ? (
          <Button block type="primary" onClick={onDoneEditing}>
            Done Editing
          </Button>
        ) : (
          <Button
            block
            type="primary"
            onClick={onSaveOrder}
            disabled={items.length === 0 || !canWriteOrders}
          >
            Save Order
          </Button>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            style={{ flex: 1 }}
            onClick={onGenerateBill}
            disabled={!canGenerateBill}
            title={!hasOrderId ? 'Save the order first to generate a bill' : undefined}
          >
            Generate bill
          </Button>
          <Button
            style={{ flex: 1 }}
            onClick={onGenerateSplitBill}
            disabled={!canGenerateBill}
            title={!hasOrderId ? 'Save the order first to split the bill' : undefined}
          >
            Split bill
          </Button>
        </div>
        <Button block danger onClick={onCancelOrder} disabled={!canWriteOrders}>
          {isEditMode ? 'Cancel order' : 'Discard'}
        </Button>
      </div>
    </div>
  </Card>
  );
};
