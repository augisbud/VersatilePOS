import { Card, Select, Space, Typography } from 'antd';

type TagOption = {
  id?: number;
  value?: string;
};

type Props = {
  tags: TagOption[];
  selectedTagId?: number | null;
  onChange: (tagId: number | null) => void;
  loading?: boolean;
  disabled?: boolean;
};

const { Text } = Typography;

export const CategorySelectorCard = ({
  tags,
  selectedTagId,
  onChange,
  loading,
  disabled,
}: Props) => {
  if (!tags.length) {
    return null;
  }

  return (
    <Card style={{ marginBottom: '16px' }}>
      <Space size="middle" wrap>
        <Text strong>Filter by category:</Text>
        <Select
          style={{ minWidth: 280 }}
          placeholder="All categories"
          loading={loading}
          value={selectedTagId ?? undefined}
          allowClear
          onClear={() => onChange(null)}
          disabled={disabled}
          onChange={(v) => onChange(v)}
          options={tags
            .filter((t) => typeof t.id === 'number')
            .map((t) => ({
              label: t.value ?? `Tag #${t.id}`,
              value: t.id as number,
            }))}
          showSearch
          optionFilterProp="label"
        />
      </Space>
    </Card>
  );
};


