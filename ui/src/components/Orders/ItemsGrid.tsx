import { useState, useMemo } from 'react';
import { Input, Card, Empty, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { ModelsItemDto } from '@/api/types.gen';

type Props = {
  items: ModelsItemDto[];
  loading?: boolean;
  onItemClick: (item: ModelsItemDto) => void;
};

export const ItemsGrid = ({ items, loading, onItemClick }: Props) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter((item) => item.name?.toLowerCase().includes(query));
  }, [items, searchQuery]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <Input
        placeholder="Search..."
        prefix={<SearchOutlined style={{ color: '#999' }} />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: 16 }}
        size="large"
      />

      {loading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
          }}
        >
          <Spin size="large" />
        </div>
      ) : filteredItems.length === 0 ? (
        <Empty description="No items found" style={{ marginTop: 48 }} />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 12,
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            alignContent: 'start',
          }}
        >
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              hoverable
              onClick={() => onItemClick(item)}
              style={{
                aspectRatio: '1',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
              }}
              styles={{
                body: {
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                },
              }}
            >
              <div
                style={{
                  flex: 1,
                  background:
                    'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <svg
                  width="60%"
                  height="60%"
                  viewBox="0 0 100 100"
                  style={{ opacity: 0.3 }}
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="100"
                    y2="100"
                    stroke="#999"
                    strokeWidth="1"
                  />
                  <line
                    x1="100"
                    y1="0"
                    x2="0"
                    y2="100"
                    stroke="#999"
                    strokeWidth="1"
                  />
                  <rect
                    x="0"
                    y="0"
                    width="100"
                    height="100"
                    fill="none"
                    stroke="#999"
                    strokeWidth="1"
                  />
                </svg>
              </div>
              <div
                style={{
                  padding: '8px 10px',
                  background: '#fafafa',
                  borderTop: '1px solid #f0f0f0',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.name || `Item #${item.id}`}
                </div>
                {item.price !== undefined && (
                  <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                    ${item.price.toFixed(2)}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
