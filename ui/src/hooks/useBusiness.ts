import { useAppSelector } from './useAppSelector';
import { useAppDispatch } from './useAppDispatch';
import {
  getBusinesses,
  hasBusiness,
  isBusinessLoading,
  getBusinessError,
} from '@/selectors/business';
import {
  createBusiness as createBusinessAction,
  fetchBusinessById as fetchBusinessByIdAction,
  fetchBusinesses as fetchBusinessesAction,
} from '@/actions/business';
import { ModelsCreateBusinessRequest } from '@/api/types.gen';

export const useBusiness = () => {
  const dispatch = useAppDispatch();
  const businesses = useAppSelector(getBusinesses);
  const businessExists = useAppSelector(hasBusiness);
  const loading = useAppSelector(isBusinessLoading);
  const error = useAppSelector(getBusinessError);

  const createBusiness = async (businessData: ModelsCreateBusinessRequest) => {
    return dispatch(createBusinessAction(businessData)).unwrap();
  };

  const fetchBusiness = async (id: number) => {
    return dispatch(fetchBusinessByIdAction(id)).unwrap();
  };

  const fetchAllBusinesses = async () => {
    return dispatch(fetchBusinessesAction()).unwrap();
  };

  return {
    businesses,
    businessExists,
    loading,
    error,
    createBusiness,
    fetchBusiness,
    fetchAllBusinesses,
  };
};
