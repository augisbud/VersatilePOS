import { useAppSelector } from './useAppSelector';
import { useAppDispatch } from './useAppDispatch';
import {
  getBusiness,
  getBusinessId,
  hasBusiness,
  isBusinessLoading,
  getBusinessError,
} from '@/selectors/business';
import {
  createBusiness as createBusinessAction,
  fetchBusinessById as fetchBusinessByIdAction,
} from '@/actions/business';
import { ModelsCreateBusinessRequest } from '@/api/types.gen';

export const useBusiness = () => {
  const dispatch = useAppDispatch();
  const business = useAppSelector(getBusiness);
  const businessId = useAppSelector(getBusinessId);
  const businessExists = useAppSelector(hasBusiness);
  const loading = useAppSelector(isBusinessLoading);
  const error = useAppSelector(getBusinessError);

  const createBusiness = async (businessData: ModelsCreateBusinessRequest) => {
    return dispatch(createBusinessAction(businessData)).unwrap();
  };

  const fetchBusiness = async (id: number) => {
    return dispatch(fetchBusinessByIdAction(id)).unwrap();
  };

  return {
    business,
    businessId,
    businessExists,
    loading,
    error,
    createBusiness,
    fetchBusiness,
  };
};

