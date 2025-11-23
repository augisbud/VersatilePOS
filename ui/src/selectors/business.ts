import { State } from '@/types/redux';
import { ModelsBusinessDto } from '@/api/types.gen';

export const getBusiness = (state: State): ModelsBusinessDto | null => {
  if (!state.business.id) {
    return null;
  }

  return {
    id: state.business.id,
    name: state.business.name || '',
    email: state.business.email || '',
    phone: state.business.phone || '',
    address: state.business.address || '',
  };
};

export const getBusinessId = (state: State) => state.business.id!;

export const hasBusiness = (state: State) => !!state.business.id;

export const isBusinessLoading = (state: State) => state.business.loading;

export const getBusinessError = (state: State) => state.business.error;
