import { useCallback } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
import { applyDiscountToOrderItem, removeDiscountFromOrderItem } from '@/actions/orderItemDiscount';
import { getItemOptions } from '@/selectors/itemOption';
import { getPriceModifiers } from '@/selectors/priceModifier';
import { getOrderItemOptionsMap } from '@/selectors/order';
import { ModelsItemOptionLinkDto } from '@/api/types.gen';
import { formatPriceChange } from '@/utils/formatters';
import {
  calculateOptionPriceChange,
  isDiscountItemOption,
} from '@/utils/orderCalculations';
import { getItemPrice, getItems } from '@/selectors/item';

export const useOrderItemDiscounts = () => {
  const dispatch = useAppDispatch();
  const itemOptions = useAppSelector(getItemOptions);
  const priceModifiers = useAppSelector(getPriceModifiers);
  const items = useAppSelector(getItems);
  const itemOptionsMap = useAppSelector(getOrderItemOptionsMap);

  const getAppliedDiscountLinks = (orderItemId: number): ModelsItemOptionLinkDto[] => {
    const links = itemOptionsMap[orderItemId] ?? [];
    return links.filter((l) => l.priceModifierType === 'Discount');
  };

  const getAvailableDiscountOptionsForItem = useCallback(
    (itemId: number, selectedOptionIds: number[]) => {
      const basePrice = getItemPrice(items, itemId);
      const forItem = itemOptions.filter(
        (opt) => opt.itemId === itemId && opt.id !== undefined
      );

      return forItem
        .filter((opt) => !selectedOptionIds.includes(opt.id!))
        .filter((opt) => isDiscountItemOption(opt.id!, itemOptions, priceModifiers))
        .map((opt) => ({
          id: opt.id!,
          name: opt.name || `Discount #${opt.id}`,
          priceLabel: formatPriceChange(
            calculateOptionPriceChange(
              opt.id!,
              basePrice,
              itemOptions,
              priceModifiers
            )
          ),
        }));
    },
    [itemOptions, priceModifiers, items]
  );

  const applyDiscount = async (orderId: number, orderItemId: number, itemOptionId: number) => {
    return dispatch(
      applyDiscountToOrderItem({
        orderId,
        orderItemId,
        data: { itemOptionId, count: 1 },
      })
    ).unwrap();
  };

  const removeDiscount = async (orderId: number, orderItemId: number, itemOptionId: number) => {
    const links = getAppliedDiscountLinks(orderItemId);
    const link = links.find((l) => l.itemOptionId === itemOptionId);
    if (!link?.id) return;

    return dispatch(
      removeDiscountFromOrderItem({
        orderId,
        orderItemId,
        optionLinkId: link.id,
      })
    ).unwrap();
  };

  return {
    getAppliedDiscountLinks,
    getAvailableDiscountOptionsForItem,
    applyDiscount,
    removeDiscount,
  };
};


