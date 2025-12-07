import { useAppSelector } from './useAppSelector';
import { useAppDispatch } from './useAppDispatch';
import {
  getItems,
  getSelectedItem,
  getItemsLoading,
  getItemsError,
  getItemById as getItemByIdSelector,
  getItemsBusinessId,
} from '@/selectors/item';
import {
  fetchItems as fetchItemsAction,
  fetchItemById as fetchItemByIdAction,
  addItem as addItemAction,
  editItem as editItemAction,
  removeItem as removeItemAction,
  setItemsBusinessId,
} from '@/actions/item';
import {
  ModelsCreateItemRequest,
  ModelsUpdateItemRequest,
} from '@/api/types.gen';

export const useItems = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(getItems);
  const selectedItem = useAppSelector(getSelectedItem);
  const selectedBusinessId = useAppSelector(getItemsBusinessId);
  const loading = useAppSelector(getItemsLoading);
  const error = useAppSelector(getItemsError);

  const fetchItems = async (businessId: number) => {
    dispatch(setItemsBusinessId(businessId));
    return dispatch(fetchItemsAction(businessId)).unwrap();
  };

  const fetchItemById = async (itemId: number) => {
    return dispatch(fetchItemByIdAction(itemId)).unwrap();
  };

  const createItem = async (itemData: ModelsCreateItemRequest) => {
    return dispatch(addItemAction(itemData)).unwrap();
  };

  const updateItem = async (id: number, data: ModelsUpdateItemRequest) => {
    return dispatch(editItemAction({ id, data })).unwrap();
  };

  const deleteItem = async (itemId: number) => {
    return dispatch(removeItemAction(itemId)).unwrap();
  };

  const selectBusiness = (businessId: number) => {
    dispatch(setItemsBusinessId(businessId));
  };

  const getItemByIdFromList = (itemId: number) => {
    return getItemByIdSelector(items, itemId);
  };

  return {
    items,
    selectedItem,
    selectedBusinessId,
    loading,
    error,
    fetchItems,
    fetchItemById,
    createItem,
    updateItem,
    deleteItem,
    selectBusiness,
    getItemById: getItemByIdFromList,
  };
};
