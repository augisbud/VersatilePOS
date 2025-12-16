import { useMemo, useEffect, useState } from 'react';
import { Card, Typography, Button, Select, Space, Table } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { ModelsItemDto, ModelsTagDto } from '@/api/types.gen';
import { useUser } from '@/hooks/useUser';

const { Text } = Typography;

type ItemLike = Pick<ModelsItemDto, 'id' | 'name' | 'price'> &
  Record<string, unknown>;

interface TagItemRow {
  key: string | number;
  id?: number;
  name?: string;
  raw: unknown;
}

interface CategoryItemsCardProps {
  selectedTag: ModelsTagDto | null;
  tagItems: unknown[];
  items: ModelsItemDto[];
  loading: boolean;
  linkLoading: boolean;
  onLink: (itemId: number) => void;
  onUnlink: (itemId: number) => void;
}

const isItemLike = (v: unknown): v is ItemLike => {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return 'id' in o || 'name' in o || 'price' in o;
};

export const CategoryItemsCard = ({
  selectedTag,
  tagItems,
  items,
  loading,
  linkLoading,
  onLink,
  onUnlink,
}: CategoryItemsCardProps) => {
  const { canWriteTags, canWriteItems } = useUser();
  const [linkItemId, setLinkItemId] = useState<number | null>(null);

  const tagItemRows = useMemo<TagItemRow[]>(() => {
    return (Array.isArray(tagItems) ? tagItems : []).map((x, idx) => {
      if (isItemLike(x)) {
        return {
          key: x.id ?? `row-${idx}`,
          id: typeof x.id === 'number' ? x.id : undefined,
          name: typeof x.name === 'string' ? x.name : undefined,
          raw: x,
        };
      }
      return { key: `row-${idx}`, raw: x };
    });
  }, [tagItems]);

  const linkedItemIds = useMemo(() => {
    const s = new Set<number>();
    for (const row of tagItemRows) {
      if (typeof row.id === 'number') s.add(row.id);
    }
    return s;
  }, [tagItemRows]);

  // Clear selection if item becomes linked
  useEffect(() => {
    if (linkItemId && linkedItemIds.has(linkItemId)) {
      setLinkItemId(null);
    }
  }, [linkedItemIds, linkItemId]);

  const handleLink = () => {
    if (linkItemId) {
      onLink(linkItemId);
      setLinkItemId(null);
    }
  };

  const itemColumns: ColumnsType<TagItemRow> = [
    {
      title: 'Item',
      key: 'name',
      render: (_, row) =>
        row.name ||
        (row.id ? `Item #${row.id}` : <Text type="secondary">Unknown</Text>),
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (v?: number) =>
        typeof v === 'number' ? v : <Text type="secondary">—</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, row) => (
        <Button
          danger
          disabled={!canWriteTags || !canWriteItems || !row.id}
          onClick={() => row.id && onUnlink(row.id)}
        >
          Unlink
        </Button>
      ),
    },
  ];

  if (!selectedTag) {
    return (
      <Card size="small" title="Items in selected category">
        <Text type="secondary">
          Select a category above to see linked items.
        </Text>
      </Card>
    );
  }

  return (
    <Card size="small" title="Items in selected category">
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Text>
          Selected: <Text strong>{selectedTag.value}</Text>
        </Text>

        <Space wrap style={{ width: '100%' }}>
          <Select
            style={{ minWidth: 280 }}
            placeholder="Select item to link"
            value={linkItemId ?? undefined}
            onChange={(v) => setLinkItemId(v)}
            options={items
              .filter(
                (i) => typeof i.id === 'number' && !linkedItemIds.has(i.id!)
              )
              .map((i) => ({
                value: i.id!,
                label: i.name ? `${i.name} (#${i.id})` : `Item #${i.id}`,
              }))}
            showSearch
            optionFilterProp="label"
            disabled={!canWriteTags || !canWriteItems}
          />
          <Button
            type="primary"
            icon={<LinkOutlined />}
            onClick={handleLink}
            disabled={!canWriteTags || !canWriteItems || !linkItemId}
            loading={linkLoading}
          >
            Link item
          </Button>
        </Space>

        <Table
          columns={itemColumns}
          dataSource={tagItemRows}
          pagination={false}
          loading={loading || linkLoading}
        />
      </Space>
    </Card>
  );
};
