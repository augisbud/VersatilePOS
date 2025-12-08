import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { useBusiness } from '@/hooks/useBusiness';
import { useAppSelector } from '@/hooks/useAppSelector';
import { getUserBusinessId } from '@/selectors/user';
import {
  ModelsBusinessDto,
  ModelsCreateBusinessRequest,
} from '@/api/types.gen';
import { BusinessDetails, BusinessList } from '@/components/Business';
import { useUser } from '@/hooks/useUser';

export const Business = () => {
  const {
    businesses,
    loading,
    error,
    createBusiness,
    fetchAllBusinesses,
    fetchBusiness,
  } = useBusiness();
  const { refreshAccount, canWriteBusinesses, canReadBusinesses, roles } =
    useUser();
  const userBusinessId = useAppSelector(getUserBusinessId);
  const [selectedBusiness, setSelectedBusiness] =
    useState<ModelsBusinessDto | null>(null);

  const canLoadBusinesses = canReadBusinesses || !roles?.length;

  const handleManageBusiness = (businessRecord: ModelsBusinessDto) => {
    setSelectedBusiness(businessRecord);
  };

  const handleBackToTable = () => {
    setSelectedBusiness(null);
  };

  const handleCreateBusiness = async (
    businessData: ModelsCreateBusinessRequest
  ) => {
    const result = await createBusiness(businessData);
    await refreshAccount();

    return result;
  };

  useEffect(() => {
    const loadBusinesses = async () => {
      if (canLoadBusinesses && userBusinessId) {
        const business = await fetchBusiness(userBusinessId);
        setSelectedBusiness(business);
      }

      await fetchAllBusinesses();
    };

    void loadBusinesses();
  }, []);

  if (loading && businesses.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Loading businesses..." />
      </div>
    );
  }

  if (selectedBusiness) {
    return (
      <BusinessDetails
        business={selectedBusiness}
        onBack={canWriteBusinesses ? handleBackToTable : undefined}
      />
    );
  }

  return (
    <BusinessList
      businesses={businesses}
      loading={loading}
      error={error}
      onCreateBusiness={handleCreateBusiness}
      onManageBusiness={handleManageBusiness}
    />
  );
};
