import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
import {
  getAllItemOptionLinks,
  getOrderById as getOrderByIdSelector,
  getOrderItemById as getOrderItemByIdSelector,
  getOrderItemOptionsMap,
  getOrderItems,
  getOrderItemsByOrderId,
  getOrders,
  getOrdersBusinessId,
  getOrdersError,
  getOrdersLoading,
  getOptionsForOrderItem as getOptionsForOrderItemSelector,
  getSelectedOrder,
} from '@/selectors/order';
import {
  addOrder as addOrderAction,
  addOrderItem as addOrderItemAction,
  addOrderItemOption as addOrderItemOptionAction,
  applyPriceModifier as applyPriceModifierAction,
  editOrder as editOrderAction,
  editOrderItem as editOrderItemAction,
  fetchOrderById as fetchOrderByIdAction,
  fetchOrderItemOptions as fetchOrderItemOptionsAction,
  fetchOrderItems as fetchOrderItemsAction,
  fetchOrderItemsForAllOrders as fetchOrderItemsForAllOrdersAction,
  fetchOrders as fetchOrdersAction,
  linkPayment as linkPaymentAction,
  removeOrderItem as removeOrderItemAction,
  removeOrderItemOption as removeOrderItemOptionAction,
  setOrdersBusinessId,
} from '@/actions/order';
import {
  applyDiscountToOrderItem as applyDiscountToOrderItemAction,
  removeDiscountFromOrderItem as removeDiscountFromOrderItemAction,
} from '@/actions/orderItemDiscount';
import {
  ModelsApplyPriceModifierRequest,
  ModelsCreateItemOptionLinkRequest,
  ModelsCreateOrderItemRequest,
  ModelsCreateOrderRequest,
  ModelsUpdateOrderItemRequest,
  ModelsUpdateOrderRequest,
} from '@/api/types.gen';

export const useOrders = () => {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(getOrders);
  const selectedOrder = useAppSelector(getSelectedOrder);
  const selectedBusinessId = useAppSelector(getOrdersBusinessId);
  const orderItems = useAppSelector(getOrderItems);
  const orderItemsByOrderId = useAppSelector(getOrderItemsByOrderId);
  const allItemOptionLinks = useAppSelector(getAllItemOptionLinks);
  const itemOptionsMap = useAppSelector(getOrderItemOptionsMap);
  const loading = useAppSelector(getOrdersLoading);
  const error = useAppSelector(getOrdersError);

  const fetchOrders = async (businessId: number) => {
    dispatch(setOrdersBusinessId(businessId));
    return dispatch(fetchOrdersAction(businessId)).unwrap();
  };

  const fetchOrderById = async (orderId: number) => {
    return dispatch(fetchOrderByIdAction(orderId)).unwrap();
  };

  const createOrder = async (data: ModelsCreateOrderRequest) => {
    return dispatch(addOrderAction(data)).unwrap();
  };

  const updateOrder = async (id: number, data: ModelsUpdateOrderRequest) => {
    return dispatch(editOrderAction({ id, data })).unwrap();
  };

  const fetchItemsForOrder = async (orderId: number) => {
    return dispatch(fetchOrderItemsAction(orderId)).unwrap();
  };

  const fetchItemsForAllOrders = async (orderIds: number[]) => {
    return dispatch(fetchOrderItemsForAllOrdersAction(orderIds)).unwrap();
  };

  const addItemToOrder = async (
    orderId: number,
    data: ModelsCreateOrderItemRequest
  ) => {
    return dispatch(addOrderItemAction({ orderId, data })).unwrap();
  };

  const updateOrderItem = async (
    orderId: number,
    itemId: number,
    data: ModelsUpdateOrderItemRequest
  ) => {
    return dispatch(editOrderItemAction({ orderId, itemId, data })).unwrap();
  };

  const removeItemFromOrder = async (orderId: number, itemId: number) => {
    return dispatch(removeOrderItemAction({ orderId, itemId })).unwrap();
  };

  const fetchOptionsForOrderItem = async (orderId: number, itemId: number) => {
    return dispatch(fetchOrderItemOptionsAction({ orderId, itemId })).unwrap();
  };

  const addOptionToOrderItem = async (
    orderId: number,
    itemId: number,
    data: ModelsCreateItemOptionLinkRequest
  ) => {
    return dispatch(
      addOrderItemOptionAction({ orderId, itemId, data })
    ).unwrap();
  };

  const removeOptionFromOrderItem = async (
    orderId: number,
    itemId: number,
    optionId: number
  ) => {
    return dispatch(
      removeOrderItemOptionAction({ orderId, itemId, optionId })
    ).unwrap();
  };

  const applyDiscountToOrderItem = async (
    orderId: number,
    orderItemId: number,
    data: ModelsCreateItemOptionLinkRequest
  ) => {
    return dispatch(
      applyDiscountToOrderItemAction({ orderId, orderItemId, data })
    ).unwrap();
  };

  const removeDiscountFromOrderItem = async (
    orderId: number,
    orderItemId: number,
    optionLinkId: number
  ) => {
    return dispatch(
      removeDiscountFromOrderItemAction({ orderId, orderItemId, optionLinkId })
    ).unwrap();
  };

  const linkPaymentToOrder = async (orderId: number, paymentId: number) => {
    return dispatch(linkPaymentAction({ orderId, paymentId })).unwrap();
  };

  const applyPriceModifierToOrder = async (
    orderId: number,
    data: ModelsApplyPriceModifierRequest
  ) => {
    return dispatch(applyPriceModifierAction({ orderId, data })).unwrap();
  };

  const selectBusiness = (businessId: number) => {
    dispatch(setOrdersBusinessId(businessId));
  };

  const getOrderByIdFromList = (orderId: number) => {
    return getOrderByIdSelector(orders, orderId);
  };

  const getOrderItemByIdFromList = (itemId: number) => {
    return getOrderItemByIdSelector(orderItems, itemId);
  };

  const getOptionsForOrderItemFromMap = (itemId: number) => {
    return getOptionsForOrderItemSelector(itemOptionsMap, itemId);
  };

  return {
    orders,
    selectedOrder,
    selectedBusinessId,
    orderItems,
    orderItemsByOrderId,
    allItemOptionLinks,
    itemOptionsMap,
    loading,
    error,
    fetchOrders,
    fetchOrderById,
    createOrder,
    updateOrder,
    fetchItemsForOrder,
    fetchItemsForAllOrders,
    addItemToOrder,
    updateOrderItem,
    removeItemFromOrder,
    fetchOptionsForOrderItem,
    addOptionToOrderItem,
    removeOptionFromOrderItem,
    applyDiscountToOrderItem,
    removeDiscountFromOrderItem,
    linkPaymentToOrder,
    applyPriceModifierToOrder,
    selectBusiness,
    getOrderById: getOrderByIdFromList,
    getOrderItemById: getOrderItemByIdFromList,
    getOptionsForOrderItem: getOptionsForOrderItemFromMap,
  };
};
