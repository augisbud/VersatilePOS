import { Button, Tag } from 'antd';
import { EditOutlined } from '@ant-design/icons';

type ItemOption = {
  optionId: number;
  name: string;
  priceChange: string;
  count: number;
};

type Props = {
  itemName: string;
  quantity: number;
  lineTotal: number;
  options: ItemOption[];
  canEdit: boolean;
  onEdit: () => void;
};

export const OrderItemRow = ({
  itemName,
  quantity,
  lineTotal,
  options,
  canEdit,
  onEdit,
}: Props) => (
  <div>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 50px 70px',
        gap: 8,
        padding: '10px 0',
        borderBottom: options.length > 0 ? 'none' : '1px solid #f0f0f0',
        alignItems: 'center',
        fontSize: 13,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {itemName}
        </span>
        <Button
          type="text"
          size="small"
          icon={<EditOutlined style={{ fontSize: 12 }} />}
          onClick={onEdit}
          disabled={!canEdit}
          style={{
            color: '#999',
            padding: '0 4px',
            minWidth: 'auto',
          }}
        />
      </div>
      <div style={{ textAlign: 'center' }}>{quantity}</div>
      <div style={{ textAlign: 'right' }}>{lineTotal.toFixed(2)}</div>
    </div>
    {options.length > 0 && (
      <div
        style={{
          paddingLeft: 16,
          paddingBottom: 8,
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        {options.map((opt) => (
          <Tag key={opt.optionId} color="blue" style={{ marginBottom: 4 }}>
            {opt.name}
            {opt.priceChange}
            {opt.count > 1 ? ` x${opt.count}` : ''}
          </Tag>
        ))}
      </div>
    )}
  </div>
);
