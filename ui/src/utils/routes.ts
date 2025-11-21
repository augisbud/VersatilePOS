import { ScreenConfig, BusinessType } from '@/types/routes';

export const getRoutesForBusinessType = (
  routes: ScreenConfig[],
  businessType: BusinessType | null
): ScreenConfig[] => {
  if (!businessType) {
    return [];
  }

  return routes.filter(
    (route) => route.businessType === businessType || !route.businessType
  );
};
