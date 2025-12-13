import { Typography, Tag } from 'antd';
import { BillItem, Bill } from './types';

type Props = {
  items: BillItem[];
  showBillColumn?: boolean;
  bills?: Bill[];
  itemAssignments?: { [itemIndex: number]: number | null };
  selectedBillId?: number | null;
  onItemClick?: (itemIndex: number) => void;
  canClickItem?: (itemIndex: number) => boolean;
};

const { Text } = Typography;

export const BillItemsTable = ({
  items,
  showBillColumn = false,
  bills = [],
  itemAssignments = {},
  selectedBillId,
  onItemClick,
  canClickItem,
}: Props) => {
  const gridColumns = showBillColumn ? '1fr 50px 70px 70px' : '1fr 50px 70px';

  return (
    <>
      {/* Header row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: gridColumns,
          gap: 8,
          marginBottom: 8,
          fontWeight: 600,
        }}
      >
        <Text strong>Name</Text>
        <Text strong style={{ textAlign: 'center' }}>
          Qty.
        </Text>
        <Text strong style={{ textAlign: 'right' }}>
          Price
        </Text>
        {showBillColumn && (
          <Text strong style={{ textAlign: 'center' }}>
            Bill
          </Text>
        )}
      </div>

      {/* Items list */}
      <div
        style={{
          maxHeight: 200,
          overflowY: 'auto',
          marginBottom: 12,
        }}
      >
        {items.map((item, index) => {
          const assignedBillId = itemAssignments[index];
          const assignedBill = assignedBillId
            ? bills.find((b) => b.id === assignedBillId)
            : null;
          const isAssignedToSelected = assignedBillId === selectedBillId;
          const canClick = canClickItem ? canClickItem(index) : false;

          return (
            <div
              key={`${item.itemId}-${index}`}
              onClick={() => canClick && onItemClick?.(index)}
              style={{
                display: 'grid',
                gridTemplateColumns: gridColumns,
                gap: 8,
                padding: showBillColumn ? '8px 6px' : '6px 0',
                borderRadius: showBillColumn ? 4 : 0,
                cursor: canClick ? 'pointer' : 'default',
                background: showBillColumn
                  ? isAssignedToSelected
                    ? '#e6f4ff'
                    : assignedBill
                      ? '#fafafa'
                      : undefined
                  : undefined,
                border: showBillColumn
                  ? isAssignedToSelected
                    ? '1px solid #1890ff'
                    : '1px solid transparent'
                  : undefined,
                marginBottom: showBillColumn ? 4 : 0,
                transition: showBillColumn ? 'all 0.2s' : undefined,
              }}
            >
              <Text ellipsis style={{ minWidth: 0 }}>
                {item.itemName}
              </Text>
              <Text style={{ textAlign: 'center' }}>{item.quantity}</Text>
              <Text style={{ textAlign: 'right' }}>
                {item.lineTotal.toFixed(2)}
              </Text>
              {showBillColumn && (
                <div style={{ textAlign: 'center' }}>
                  {assignedBillId ? (
                    <Tag
                      color={assignedBill?.isPaid ? 'success' : 'blue'}
                      style={{ margin: 0 }}
                    >
                      Bill {assignedBillId}
                    </Tag>
                  ) : (
                    <Text type="secondary">-</Text>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};
