import { Card, Select, Typography } from 'antd';

type BusinessOption = {
  id?: number;
  name?: string;
};

type Props = {
  businesses: BusinessOption[];
  selectedBusinessId?: number | null;
  loading?: boolean;
  onChange: (businessId: number) => void;
};

const { Text } = Typography;

export const OrderBusinessSelector = ({
  businesses,
  selectedBusinessId,
  loading,
  onChange,
}: Props) => (
  <Card>
    <Text strong>Select business:</Text>
    <div style={{ marginTop: 8 }}>
      <Select
        style={{ minWidth: 280 }}
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
    </div>
  </Card>
);
