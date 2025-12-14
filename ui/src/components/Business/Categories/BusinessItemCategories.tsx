import { useEffect, useMemo, useState } from 'react';
import { Card, Typography, Button, Modal, Form, Input, Select, Space, Table } from 'antd';
import { PlusOutlined, LinkOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTags } from '@/hooks/useTags';
import { useItems } from '@/hooks/useItems';
import { useUser } from '@/hooks/useUser';
import { getTagByIdItems } from '@/api';
import type { ColumnsType } from 'antd/es/table';
import type { ModelsItemDto, ModelsTagDto } from '@/api/types.gen';

const { Title, Text } = Typography;

interface BusinessItemCategoriesProps {
  businessId: number;
}

type ItemLike = Pick<ModelsItemDto, 'id' | 'name' | 'price'> & Record<string, unknown>;

const isItemLike = (v: unknown): v is ItemLike => {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return 'id' in o || 'name' in o || 'price' in o;
};

export const BusinessItemCategories = ({ businessId }: BusinessItemCategoriesProps) => {
  const { canWriteItems } = useUser();
  const {
    tags,
    loading: tagsLoading,
    linkLoading,
    error: tagsError,
    linkError,
    tagItems,
    fetchTags,
    createTag,
    fetchItems: fetchItemsByTag,
    linkItem,
    unlinkItem,
  } = useTags();

  const { items, fetchItems } = useItems();

  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [linkItemId, setLinkItemId] = useState<number | null>(null);

  const [tagItemCounts, setTagItemCounts] = useState<Record<number, number>>({});
  const [countsLoading, setCountsLoading] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [form] = Form.useForm<{ value: string }>();

  const selectedTag = useMemo(
    () => tags.find((t) => t.id === selectedTagId) ?? null,
    [tags, selectedTagId]
  );

  useEffect(() => {
    void fetchTags(businessId);
    void fetchItems(businessId);
     
  }, []);

  useEffect(() => {
    const loadCounts = async () => {
      const tagIds = tags.map((t) => t.id).filter((id): id is number => typeof id === 'number');
      if (!tagIds.length) return;

      setCountsLoading(true);
      try {
        const entries = await Promise.all(
          tagIds.map(async (id) => {
            const res = await getTagByIdItems({ path: { id } });
            if (res.error) {
              // If one tag fails, still render others; default count to 0.
              return [id, 0] as const;
            }
            const arr = Array.isArray(res.data) ? res.data : [];
            return [id, arr.length] as const;
          })
        );

        setTagItemCounts((prev) => {
          const next = { ...prev };
          for (const [id, count] of entries) next[id] = count;
          return next;
        });
      } finally {
        setCountsLoading(false);
      }
    };

    void loadCounts();
  }, [tags]);

  useEffect(() => {
    if (!selectedTagId) return;
    void fetchItemsByTag(selectedTagId);
  }, [selectedTagId]);

  const refresh = async () => {
    await fetchTags(businessId);
    await fetchItems(businessId);
    if (selectedTagId) {
      await fetchItemsByTag(selectedTagId);
    }
  };

  const openCreateModal = () => {
    form.resetFields();
    setCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setCreateModalOpen(false);
    setCreateSubmitting(false);
  };

  const submitCreate = async ({ value }: { value: string }) => {
    setCreateSubmitting(true);
    try {
      await createTag({ businessId, value });
      await fetchTags(businessId);
      closeCreateModal();
    } finally {
      setCreateSubmitting(false);
    }
  };

  const doLink = async () => {
    if (!selectedTagId || !linkItemId) return;
    await linkItem(selectedTagId, linkItemId);
    await fetchItemsByTag(selectedTagId);
    setTagItemCounts((prev) => ({
      ...prev,
      [selectedTagId]: (prev[selectedTagId] ?? 0) + 1,
    }));
    setLinkItemId(null);
  };

  const doUnlink = async (itemId: number) => {
    if (!selectedTagId) return;
    await unlinkItem(selectedTagId, itemId);
    await fetchItemsByTag(selectedTagId);
    setTagItemCounts((prev) => ({
      ...prev,
      [selectedTagId]: Math.max(0, (prev[selectedTagId] ?? 0) - 1),
    }));
  };

  const tagColumns: ColumnsType<ModelsTagDto> = [
    {
      title: 'Category',
      dataIndex: 'value',
      key: 'value',
      render: (v: string | undefined) => v || <Text type="secondary">Unnamed</Text>,
    },
    {
      title: 'Items',
      key: 'count',
      width: 110,
      align: 'right',
      render: (_, record) => {
        const id = record.id;
        if (typeof id !== 'number') return <Text type="secondary">—</Text>;
        if (countsLoading && tagItemCounts[id] === undefined) return <Text type="secondary">…</Text>;
        return tagItemCounts[id] ?? 0;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Button
          type={record.id === selectedTagId ? 'primary' : 'default'}
          onClick={() => setSelectedTagId(record.id ?? null)}
          disabled={!record.id}
        >
          {record.id === selectedTagId ? 'Selected' : 'Select'}
        </Button>
      ),
    },
  ];

  const tagItemRows = useMemo(() => {
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

  // If the currently selected item becomes "already linked" (after refresh/link),
  // clear it out so the dropdown never points to an invalid choice.
  useEffect(() => {
    if (linkItemId && linkedItemIds.has(linkItemId)) {
      setLinkItemId(null);
    }
  }, [linkedItemIds, linkItemId]);

  const itemColumns: ColumnsType<{
    key: string | number;
    id?: number;
    name?: string;
    raw: unknown;
  }> = [
    {
      title: 'Item',
      key: 'name',
      render: (_, row) => row.name || (row.id ? `Item #${row.id}` : <Text type="secondary">Unknown</Text>),
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (v?: number) => (typeof v === 'number' ? v : <Text type="secondary">—</Text>),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, row) => (
        <Button danger disabled={!canWriteItems || !row.id} onClick={() => row.id && void doUnlink(row.id)}>
          Unlink
        </Button>
      ),
    },
  ];

  return (
    <>
      <Card
        title={
          <Title level={4} style={{ margin: 0 }}>
            Item Categories
          </Title>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => void refresh()} loading={tagsLoading}>
              Refresh
            </Button>
            {canWriteItems && (
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                Add Category
              </Button>
            )}
          </Space>
        }
      >
        {tagsError && (
          <Text type="danger" style={{ display: 'block', marginBottom: 12 }}>
            {tagsError}
          </Text>
        )}
        {linkError && (
          <Text type="danger" style={{ display: 'block', marginBottom: 12 }}>
            {linkError}
          </Text>
        )}

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Table columns={tagColumns} dataSource={tags} rowKey="id" pagination={false} loading={tagsLoading} />

          <Card size="small" title="Items in selected category">
            {selectedTag ? (
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
                      .filter((i) => typeof i.id === 'number' && !linkedItemIds.has(i.id!))
                      .map((i) => ({ value: i.id!, label: i.name ? `${i.name} (#${i.id})` : `Item #${i.id}` }))}
                    showSearch
                    optionFilterProp="label"
                    disabled={!canWriteItems}
                  />
                  <Button
                    type="primary"
                    icon={<LinkOutlined />}
                    onClick={() => void doLink()}
                    disabled={!canWriteItems || !selectedTagId || !linkItemId}
                    loading={linkLoading}
                  >
                    Link item
                  </Button>
                </Space>

                <Table
                  columns={itemColumns}
                  dataSource={tagItemRows}
                  pagination={false}
                  loading={tagsLoading || linkLoading}
                />
              </Space>
            ) : (
              <Text type="secondary">Select a category above to see linked items.</Text>
            )}
          </Card>
        </Space>
      </Card>

      <Modal
        title="Add Category"
        open={createModalOpen}
        onCancel={closeCreateModal}
        okText="Create"
        okButtonProps={{ loading: createSubmitting }}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => void submitCreate(values)}
        >
          <Form.Item
            label="Category name"
            name="value"
            rules={[{ required: true, message: 'Please enter a category name' }]}
          >
            <Input placeholder="e.g. Drinks" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};


