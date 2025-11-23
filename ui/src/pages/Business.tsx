import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { useBusiness } from '@/hooks/useBusiness';
import { useAppSelector } from '@/hooks/useAppSelector';
import { getUserBusinessId } from '@/selectors/user';
import { ModelsBusinessDto } from '@/api/types.gen';
import { BusinessDetails, BusinessList } from '@/components/Business';

export const Business = () => {
  const {
    businesses,
    loading,
    error,
    createBusiness,
    fetchAllBusinesses,
    fetchBusiness,
  } = useBusiness();
  const userBusinessId = useAppSelector(getUserBusinessId);

  const [selectedBusiness, setSelectedBusiness] =
    useState<ModelsBusinessDto | null>(null);
  const isStaffEmployee = false;

  const handleManageBusiness = (businessRecord: ModelsBusinessDto) => {
    setSelectedBusiness(businessRecord);
  };

  const handleBackToTable = () => {
    setSelectedBusiness(null);
  };

  useEffect(() => {
    const loadBusinesses = async () => {
      if (isStaffEmployee) {
        const business = await fetchBusiness(userBusinessId!);

        setSelectedBusiness(business);
      } else {
        await fetchAllBusinesses();
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
        onBack={isStaffEmployee ? undefined : handleBackToTable}
        isStaffEmployee={isStaffEmployee}
      />
    );
  }

  return isStaffEmployee ? null : (
    <BusinessList
      businesses={businesses}
      loading={loading}
      error={error}
      onCreateBusiness={createBusiness}
      onManageBusiness={handleManageBusiness}
    />
  );
};
