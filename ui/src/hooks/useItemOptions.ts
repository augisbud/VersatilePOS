import { useAppSelector } from './useAppSelector';
import { useAppDispatch } from './useAppDispatch';
import {
  getItemOptions,
  getSelectedItemOption,
  getItemOptionsLoading,
  getItemOptionsError,
  getItemOptionById as getItemOptionByIdSelector,
  getItemOptionsBusinessId,
  getItemOptionsByItemId as getItemOptionsByItemIdSelector,
} from '@/selectors/itemOption';
import {
  fetchItemOptions as fetchItemOptionsAction,
  fetchItemOptionById as fetchItemOptionByIdAction,
  addItemOption as addItemOptionAction,
  editItemOption as editItemOptionAction,
  removeItemOption as removeItemOptionAction,
  setItemOptionsBusinessId,
} from '@/actions/itemOption';
import {
  ModelsCreateItemOptionRequest,
  ModelsUpdateItemOptionRequest,
} from '@/api/types.gen';

export const useItemOptions = () => {
  const dispatch = useAppDispatch();
  const itemOptions = useAppSelector(getItemOptions);
  const selectedItemOption = useAppSelector(getSelectedItemOption);
  const selectedBusinessId = useAppSelector(getItemOptionsBusinessId);
  const loading = useAppSelector(getItemOptionsLoading);
  const error = useAppSelector(getItemOptionsError);

  const fetchItemOptions = async (businessId: number) => {
    dispatch(setItemOptionsBusinessId(businessId));
    return dispatch(fetchItemOptionsAction(businessId)).unwrap();
  };

  const fetchItemOptionById = async (itemOptionId: number) => {
    return dispatch(fetchItemOptionByIdAction(itemOptionId)).unwrap();
  };

  const createItemOption = async (itemOptionData: ModelsCreateItemOptionRequest) => {
    return dispatch(addItemOptionAction(itemOptionData)).unwrap();
  };

  const updateItemOption = async (
    id: number,
    data: ModelsUpdateItemOptionRequest
  ) => {
    return dispatch(editItemOptionAction({ id, data })).unwrap();
  };

  const deleteItemOption = async (itemOptionId: number) => {
    return dispatch(removeItemOptionAction(itemOptionId)).unwrap();
  };

  const selectBusiness = (businessId: number) => {
    dispatch(setItemOptionsBusinessId(businessId));
  };

  const getItemOptionByIdFromList = (itemOptionId: number) => {
    return getItemOptionByIdSelector(itemOptions, itemOptionId);
  };

  const getItemOptionsByItemId = (itemId: number) => {
    return getItemOptionsByItemIdSelector(itemOptions, itemId);
  };

  return {
    itemOptions,
    selectedItemOption,
    selectedBusinessId,
    loading,
    error,
    fetchItemOptions,
    fetchItemOptionById,
    createItemOption,
    updateItemOption,
    deleteItemOption,
    selectBusiness,
    getItemOptionById: getItemOptionByIdFromList,
    getItemOptionsByItemId,
  };
};

