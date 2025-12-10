import { useAppSelector } from './useAppSelector';
import { useAppDispatch } from './useAppDispatch';
import {
  getPriceModifiers,
  getSelectedPriceModifier,
  getPriceModifiersLoading,
  getPriceModifiersError,
  getPriceModifierById as getPriceModifierByIdSelector,
  getPriceModifiersBusinessId,
  getPriceModifiersByType as getPriceModifiersByTypeSelector,
} from '@/selectors/priceModifier';
import {
  fetchPriceModifiers as fetchPriceModifiersAction,
  fetchPriceModifierById as fetchPriceModifierByIdAction,
  addPriceModifier as addPriceModifierAction,
  editPriceModifier as editPriceModifierAction,
  removePriceModifier as removePriceModifierAction,
  setPriceModifiersBusinessId,
} from '@/actions/priceModifier';
import {
  ModelsCreatePriceModifierRequest,
  ModelsUpdatePriceModifierRequest,
} from '@/api/types.gen';

export const usePriceModifiers = () => {
  const dispatch = useAppDispatch();
  const priceModifiers = useAppSelector(getPriceModifiers);
  const selectedPriceModifier = useAppSelector(getSelectedPriceModifier);
  const selectedBusinessId = useAppSelector(getPriceModifiersBusinessId);
  const loading = useAppSelector(getPriceModifiersLoading);
  const error = useAppSelector(getPriceModifiersError);

  const fetchPriceModifiers = async (businessId: number) => {
    dispatch(setPriceModifiersBusinessId(businessId));
    return dispatch(fetchPriceModifiersAction(businessId)).unwrap();
  };

  const fetchPriceModifierById = async (id: number, businessId: number) => {
    return dispatch(fetchPriceModifierByIdAction({ id, businessId })).unwrap();
  };

  const createPriceModifier = async (
    priceModifierData: ModelsCreatePriceModifierRequest
  ) => {
    return dispatch(addPriceModifierAction(priceModifierData)).unwrap();
  };

  const updatePriceModifier = async (
    id: number,
    businessId: number,
    data: ModelsUpdatePriceModifierRequest
  ) => {
    return dispatch(editPriceModifierAction({ id, businessId, data })).unwrap();
  };

  const deletePriceModifier = async (id: number, businessId: number) => {
    return dispatch(removePriceModifierAction({ id, businessId })).unwrap();
  };

  const selectBusiness = (businessId: number) => {
    dispatch(setPriceModifiersBusinessId(businessId));
  };

  const getPriceModifierByIdFromList = (priceModifierId: number) => {
    return getPriceModifierByIdSelector(priceModifiers, priceModifierId);
  };

  const getPriceModifiersByType = (modifierType: string) => {
    return getPriceModifiersByTypeSelector(priceModifiers, modifierType);
  };

  return {
    priceModifiers,
    selectedPriceModifier,
    selectedBusinessId,
    loading,
    error,
    fetchPriceModifiers,
    fetchPriceModifierById,
    createPriceModifier,
    updatePriceModifier,
    deletePriceModifier,
    selectBusiness,
    getPriceModifierById: getPriceModifierByIdFromList,
    getPriceModifiersByType,
  };
};
