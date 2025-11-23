import { State } from '@/types/redux';
import { ModelsBusinessDto } from '@/api/types.gen';

export const getBusinesses = (state: State): ModelsBusinessDto[] => {
  return state.business.businesses;
};

export const getBusinessById = (
  state: State,
  id: number
): ModelsBusinessDto | undefined => {
  return state.business.businesses.find((b) => b.id === id);
};

export const hasBusiness = (state: State) =>
  state.business.businesses.length > 0;

export const isBusinessLoading = (state: State) => state.business.loading;

export const getBusinessError = (state: State) => state.business.error;
