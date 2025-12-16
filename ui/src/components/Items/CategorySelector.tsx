import { Select } from 'antd';

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
  style?: React.CSSProperties;
  placeholder?: string;
};

export const CategorySelector = ({
  tags,
  selectedTagId,
  onChange,
  loading,
  disabled,
  style,
  placeholder = 'All categories',
}: Props) => {
  if (!tags.length) {
    return null;
  }

  return (
    <Select
      style={{ minWidth: 200, ...style }}
      placeholder={placeholder}
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
  );
};
