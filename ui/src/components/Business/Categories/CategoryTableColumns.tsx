import { Button, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ModelsTagDto } from '@/api/types.gen';

const { Text } = Typography;

interface GetCategoryColumnsParams {
  selectedTagId: number | null;
  tagItemCounts: Record<number, number>;
  countsLoading: boolean;
  onSelectTag: (tagId: number | null) => void;
}

export const getCategoryColumns = ({
  selectedTagId,
  tagItemCounts,
  countsLoading,
  onSelectTag,
}: GetCategoryColumnsParams): ColumnsType<ModelsTagDto> => [
  {
    title: 'Category',
    dataIndex: 'value',
    key: 'value',
    render: (v: string | undefined) =>
      v || <Text type="secondary">Unnamed</Text>,
  },
  {
    title: 'Items',
    key: 'count',
    width: 110,
    align: 'right',
    render: (_, record) => {
      const id = record.id;
      if (typeof id !== 'number') return <Text type="secondary">—</Text>;
      if (countsLoading && tagItemCounts[id] === undefined)
        return <Text type="secondary">…</Text>;
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
        onClick={() => onSelectTag(record.id ?? null)}
        disabled={!record.id}
      >
        {record.id === selectedTagId ? 'Selected' : 'Select'}
      </Button>
    ),
  },
];
