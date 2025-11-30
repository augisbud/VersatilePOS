import { Space, Button } from 'antd';
import { ModelsBusinessDto } from '@/api/types.gen';
import { BusinessInformation } from './BusinessInformation';
import { BusinessEmployees } from './BusinessEmployees';

interface BusinessDetailsProps {
  business: ModelsBusinessDto;
  onBack?: () => void;
  isBusinessOwner: boolean;
}

export const BusinessDetails = ({
  business,
  onBack,
  isBusinessOwner,
}: BusinessDetailsProps) => {
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {onBack && (
        <Button onClick={onBack} style={{ marginBottom: '24px' }}>
          ← Back to Businesses
        </Button>
      )}
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <BusinessInformation business={business} />
        <BusinessEmployees
          businessId={business.id!}
          isBusinessOwner={isBusinessOwner}
        />
      </Space>
    </div>
  );
};
