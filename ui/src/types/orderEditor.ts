import { ModelsPriceModifierDto } from '@/api/types.gen';
import { SelectedItemOption } from '@/utils/orderCalculations';

export type EditingItem = {
  itemId: number;
  orderItemId?: number;
  count: number;
  options: SelectedItemOption[];
  originalOptions: SelectedItemOption[];
};

export type OrderInfoItem = {
  id?: number;
  itemId: number;
  itemName: string;
  quantity: number;
  lineTotal: number;
  options: {
    optionId: number;
    name: string;
    priceChange: string;
    count: number;
  }[];
};

export type AvailableOption = {
  id: number;
  name: string;
  priceLabel: string;
};

export type AppliedOrderDiscount = ModelsPriceModifierDto & {
  amount: number;
};

