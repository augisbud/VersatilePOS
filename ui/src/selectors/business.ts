import { State } from '@/types/redux';
import { ModelsBusinessResponse } from '@/api/types.gen';

export const getBusiness = (state: State): ModelsBusinessResponse | null => {
  if (!state.business.identBusiness) {
    return null;
  }

  return {
    identBusiness: state.business.identBusiness,
    name: state.business.name || '',
    email: state.business.email || '',
    phone: state.business.phone || '',
    address: state.business.address || '',
    ownerAccount: state.business.ownerAccount,
  };
};

export const getBusinessId = (state: State) => state.business.identBusiness;

export const hasBusiness = (state: State) => !!state.business.identBusiness;

export const isBusinessLoading = (state: State) => state.business.loading;

export const getBusinessError = (state: State) => state.business.error;

