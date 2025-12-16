import { useEffect, useMemo, useState } from 'react';
import { Card, Typography, Button, Space, Table } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTags } from '@/hooks/useTags';
import { useItems } from '@/hooks/useItems';
import { useUser } from '@/hooks/useUser';
import { getCategoryColumns } from './CategoryTableColumns';
import { useCategoryItemCounts } from './useCategoryItemCounts';
import { CategoryItemsCard } from './CategoryItemsCard';
import { CategoryFormModal } from './CategoryFormModal';

const { Title, Text } = Typography;

interface BusinessItemCategoriesProps {
  businessId: number;
}

export const BusinessItemCategories = ({
  businessId,
}: BusinessItemCategoriesProps) => {
  const { canWriteTags, canWriteItems } = useUser();
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
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);

  const { tagItemCounts, countsLoading, incrementCount, decrementCount } =
    useCategoryItemCounts(tags);

  const selectedTag = useMemo(
    () => tags.find((t) => t.id === selectedTagId) ?? null,
    [tags, selectedTagId]
  );

  useEffect(() => {
    void fetchTags(businessId);
    void fetchItems(businessId);
  }, []);

  useEffect(() => {
    if (!selectedTagId) return;
    void fetchItemsByTag(selectedTagId);
  }, [selectedTagId]);

  const handleCreateSubmit = async ({ value }: { value: string }) => {
    setCreateSubmitting(true);
    try {
      await createTag({ businessId, value });
      await fetchTags(businessId);
      setCreateModalOpen(false);
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleLink = async (itemId: number) => {
    if (!selectedTagId) return;
    await linkItem(selectedTagId, itemId);
    await fetchItemsByTag(selectedTagId);
    incrementCount(selectedTagId);
  };

  const handleUnlink = async (itemId: number) => {
    if (!selectedTagId) return;
    await unlinkItem(selectedTagId, itemId);
    await fetchItemsByTag(selectedTagId);
    decrementCount(selectedTagId);
  };

  const categoryColumns = getCategoryColumns({
    selectedTagId,
    tagItemCounts,
    countsLoading,
    onSelectTag: setSelectedTagId,
  });

  return (
    <>
      <Card
        title={
          <Title level={4} style={{ margin: 0 }}>
            Item Categories
          </Title>
        }
        extra={
          canWriteTags &&
          canWriteItems && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalOpen(true)}
            >
              Add Category
            </Button>
          )
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
          <Table
            columns={categoryColumns}
            dataSource={tags}
            rowKey="id"
            pagination={false}
            loading={tagsLoading}
          />

          <CategoryItemsCard
            selectedTag={selectedTag}
            tagItems={tagItems}
            items={items}
            loading={tagsLoading}
            linkLoading={linkLoading}
            onLink={(itemId) => void handleLink(itemId)}
            onUnlink={(itemId) => void handleUnlink(itemId)}
          />
        </Space>
      </Card>

      <CategoryFormModal
        open={createModalOpen}
        isSubmitting={createSubmitting}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={(values) => void handleCreateSubmit(values)}
      />
    </>
  );
};
