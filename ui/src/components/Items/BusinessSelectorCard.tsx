import { Card, Select, Space, Typography } from 'antd';

type BusinessOption = {
  id?: number;
  name?: string;
};

type Props = {
  businesses: BusinessOption[];
  selectedBusinessId?: number | null;
  onChange: (businessId: number) => void;
  loading?: boolean;
};

const { Text } = Typography;

export const BusinessSelectorCard = ({
  businesses,
  selectedBusinessId,
  onChange,
  loading,
}: Props) => {
  if (businesses.length <= 1) {
    return null;
  }

  return (
    <Card style={{ marginBottom: '16px' }}>
      <Space size="middle" wrap>
        <Text strong>Select business:</Text>
        <Select
          style={{ minWidth: 240 }}
          placeholder="Choose a business"
          loading={loading}
          value={selectedBusinessId}
          onChange={onChange}
          options={businesses
            .filter((business) => business.id !== undefined)
            .map((business) => ({
              label: business.name,
              value: business.id as number,
            }))}
        />
      </Space>
    </Card>
  );
};
