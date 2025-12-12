import {
  ModelsItemDto,
  ModelsItemOptionDto,
  ModelsItemOptionLinkDto,
  ModelsPriceModifierDto,
} from '@/api/types.gen';
import { getItemOptionById } from '@/selectors/itemOption';
import { getItemPrice } from '@/selectors/item';
import { getPriceModifierById } from '@/selectors/priceModifier';

export type SelectedItemOption = {
  itemOptionId: number;
  count: number;
};

export type SelectedItem = {
  id?: number;
  itemId: number;
  count: number;
  options?: SelectedItemOption[];
};

/**
 * Calculates the price change for a single option based on its price modifier
 */
export const calculateOptionPriceChange = (
  optionId: number,
  basePrice: number,
  itemOptions: ModelsItemOptionDto[],
  priceModifiers: ModelsPriceModifierDto[]
): number => {
  const option = getItemOptionById(itemOptions, optionId);
  if (!option?.priceModifierId) return 0;

  const modifier = getPriceModifierById(priceModifiers, option.priceModifierId);
  if (!modifier) return 0;

  const value = modifier.value || 0;
  if (modifier.isPercentage) {
    return (basePrice * value) / 100;
  }
  return value;
};

/**
 * Calculates the total price for options (handles both API format and local format)
 */
export const calculateOptionsPrice = (
  options: ModelsItemOptionLinkDto[] | SelectedItemOption[],
  basePrice: number,
  itemOptions: ModelsItemOptionDto[],
  priceModifiers: ModelsPriceModifierDto[]
): number => {
  let total = 0;

  for (const opt of options) {
    const optionId = 'itemOptionId' in opt ? opt.itemOptionId : undefined;
    if (optionId) {
      const priceChange = calculateOptionPriceChange(
        optionId,
        basePrice,
        itemOptions,
        priceModifiers
      );
      total += priceChange * (opt.count || 1);
    }
  }

  return total;
};

/**
 * Calculates the total order price including all items and their options
 */
export const calculateOrderTotal = (
  selectedItems: SelectedItem[],
  items: ModelsItemDto[],
  itemOptions: ModelsItemOptionDto[],
  priceModifiers: ModelsPriceModifierDto[],
  getOptionsForItem: (
    itemId: number,
    orderItemId?: number
  ) => ModelsItemOptionLinkDto[] | SelectedItemOption[]
): number => {
  return selectedItems.reduce((sum, item) => {
    const basePrice = getItemPrice(items, item.itemId);
    const options = getOptionsForItem(item.itemId, item.id);

    const optionsPrice = calculateOptionsPrice(
      options,
      basePrice,
      itemOptions,
      priceModifiers
    );

    return sum + (basePrice + optionsPrice) * item.count;
  }, 0);
};

/**
 * Maps an item's options to display format with calculated price changes
 */
export const mapOptionsToDisplay = (
  options: ModelsItemOptionLinkDto[] | SelectedItemOption[],
  basePrice: number,
  itemOptions: ModelsItemOptionDto[],
  priceModifiers: ModelsPriceModifierDto[],
  formatPriceChange: (change: number) => string,
  getOptionName: (optionId: number) => string
): { optionId: number; name: string; priceChange: string; count: number }[] => {
  return options
    .filter((opt) => {
      const id = 'itemOptionId' in opt ? opt.itemOptionId : undefined;
      return id !== undefined;
    })
    .map((opt) => {
      const optionId = opt.itemOptionId as number;
      const priceChange = calculateOptionPriceChange(
        optionId,
        basePrice,
        itemOptions,
        priceModifiers
      );

      return {
        optionId,
        name: getOptionName(optionId),
        priceChange: formatPriceChange(priceChange),
        count: opt.count || 1,
      };
    });
};

/**
 * Maps selected items to display format for the order info panel
 */
export const mapItemsToOrderInfo = (
  selectedItems: SelectedItem[],
  items: ModelsItemDto[],
  itemOptions: ModelsItemOptionDto[],
  priceModifiers: ModelsPriceModifierDto[],
  getOptionsForItem: (
    itemId: number,
    orderItemId?: number
  ) => ModelsItemOptionLinkDto[] | SelectedItemOption[],
  formatPriceChange: (change: number) => string,
  getItemName: (itemId: number) => string,
  getOptionName: (optionId: number) => string
) => {
  return selectedItems.map((item) => {
    const basePrice = getItemPrice(items, item.itemId);
    const options = getOptionsForItem(item.itemId, item.id);

    const mappedOptions = mapOptionsToDisplay(
      options,
      basePrice,
      itemOptions,
      priceModifiers,
      formatPriceChange,
      getOptionName
    );

    const optionsPrice = mappedOptions.reduce((sum, opt) => {
      const priceChange = calculateOptionPriceChange(
        opt.optionId,
        basePrice,
        itemOptions,
        priceModifiers
      );
      return sum + priceChange * opt.count;
    }, 0);

    return {
      id: item.id,
      itemId: item.itemId,
      itemName: getItemName(item.itemId),
      quantity: item.count,
      lineTotal: (basePrice + optionsPrice) * item.count,
      options: mappedOptions,
    };
  });
};

/**
 * Gets available options for editing (filters out already selected options)
 */
export const getAvailableOptionsForEdit = (
  itemId: number,
  selectedOptionIds: number[],
  itemOptions: ModelsItemOptionDto[],
  priceModifiers: ModelsPriceModifierDto[],
  items: ModelsItemDto[],
  formatPriceChange: (change: number) => string
): { id: number; name: string; priceLabel: string }[] => {
  const basePrice = getItemPrice(items, itemId);
  const itemOptionsForItem = itemOptions.filter((opt) => opt.itemId === itemId);

  return itemOptionsForItem
    .filter((opt) => !selectedOptionIds.includes(opt.id!))
    .map((opt) => ({
      id: opt.id!,
      name: opt.name || `Option #${opt.id}`,
      priceLabel: formatPriceChange(
        calculateOptionPriceChange(
          opt.id!,
          basePrice,
          itemOptions,
          priceModifiers
        )
      ),
    }));
};
