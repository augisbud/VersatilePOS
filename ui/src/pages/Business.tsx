import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { useBusiness } from '@/hooks/useBusiness';
import { useAppSelector } from '@/hooks/useAppSelector';
import { getUserBusinessId } from '@/selectors/user';
import { ModelsBusinessDto } from '@/api/types.gen';
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
  const { isBusinessOwner } = useUser();
  const userBusinessId = useAppSelector(getUserBusinessId);

  const [selectedBusiness, setSelectedBusiness] =
    useState<ModelsBusinessDto | null>(null);

  const handleManageBusiness = (businessRecord: ModelsBusinessDto) => {
    setSelectedBusiness(businessRecord);
  };

  const handleBackToTable = () => {
    setSelectedBusiness(null);
  };

  useEffect(() => {
    const loadBusinesses = async () => {
      if (isBusinessOwner) {
        await fetchAllBusinesses();
      } else {
        const business = await fetchBusiness(userBusinessId!);

        setSelectedBusiness(business);
      }
    };

    void loadBusinesses();
  }, [userBusinessId]);

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
        onBack={isBusinessOwner ? undefined : handleBackToTable}
        isBusinessOwner={isBusinessOwner}
      />
    );
  }

  return isBusinessOwner ? (
    <BusinessList
      businesses={businesses}
      loading={loading}
      error={error}
      onCreateBusiness={createBusiness}
      onManageBusiness={handleManageBusiness}
    />
  ) : null;
};
