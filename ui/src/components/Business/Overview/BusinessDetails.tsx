import { Space, Button } from 'antd';
import { ModelsBusinessDto } from '@/api/types.gen';
import { BusinessInformation } from './BusinessInformation';
import { BusinessRoles } from '../Roles';
import { BusinessEmployees } from '../Employees';
import { BusinessServices } from '../Services';
import { useUser } from '@/hooks/useUser';

interface BusinessDetailsProps {
  business: ModelsBusinessDto;
  onBack?: () => void;
}

export const BusinessDetails = ({ business, onBack }: BusinessDetailsProps) => {
  const { canReadRoles, canReadAccounts, canReadServices } = useUser();

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {onBack && (
        <Button onClick={onBack} style={{ marginBottom: '24px' }}>
          ← Back to Businesses
        </Button>
      )}
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <BusinessInformation business={business} />
        {canReadRoles && <BusinessRoles businessId={business.id!} />}
        {canReadAccounts && <BusinessEmployees businessId={business.id!} />}
        {canReadServices && <BusinessServices businessId={business.id!} />}
      </Space>
    </div>
  );
};
