import { useCallback, useMemo, useReducer } from 'react';
import { ModelsItemDto, ModelsItemOptionDto, ModelsPriceModifierDto } from '@/api/types.gen';

export type SelectedItemOption = { itemOptionId: number; count: number };
export type SelectedOrderItem = { itemId: number; count: number; options?: SelectedItemOption[] };

type State = {
  selectedItems: SelectedOrderItem[];
  searchTerm: string;
  optionModalOpen: boolean;
  optionEditingItemId: number | null;
  optionCounts: Record<number, number>;
};

type Action =
  | { type: 'setSearch'; payload: string }
  | { type: 'addItem'; payload: number }
  | { type: 'setQuantity'; payload: { itemId: number; value: number } }
  | { type: 'removeItem'; payload: number }
  | { type: 'openOptions'; payload: { itemId: number; initialCounts: Record<number, number> } }
  | { type: 'closeOptions' }
  | { type: 'setOptionCount'; payload: { optionId: number; value: number } }
  | { type: 'saveOptions' };

const initialState: State = {
  selectedItems: [],
  searchTerm: '',
  optionModalOpen: false,
  optionEditingItemId: null,
  optionCounts: {},
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'setSearch':
      return { ...state, searchTerm: action.payload };
    case 'addItem': {
      const existing = state.selectedItems.find((i) => i.itemId === action.payload);
      if (existing) {
        return {
          ...state,
          selectedItems: state.selectedItems.map((i) =>
            i.itemId === action.payload ? { ...i, count: i.count + 1 } : i
          ),
        };
      }
      return {
        ...state,
        selectedItems: [...state.selectedItems, { itemId: action.payload, count: 1 }],
      };
    }
    case 'setQuantity': {
      const { itemId, value } = action.payload;
      if (value <= 0) {
        return {
          ...state,
          selectedItems: state.selectedItems.filter((i) => i.itemId !== itemId),
        };
      }
      return {
        ...state,
        selectedItems: state.selectedItems.map((i) =>
          i.itemId === itemId ? { ...i, count: value } : i
        ),
      };
    }
    case 'removeItem':
      return {
        ...state,
        selectedItems: state.selectedItems.filter((i) => i.itemId !== action.payload),
      };
    case 'openOptions':
      return {
        ...state,
        optionModalOpen: true,
        optionEditingItemId: action.payload.itemId,
        optionCounts: action.payload.initialCounts,
      };
    case 'closeOptions':
      return {
        ...state,
        optionModalOpen: false,
        optionEditingItemId: null,
        optionCounts: {},
      };
    case 'setOptionCount':
      return {
        ...state,
        optionCounts: {
          ...state.optionCounts,
          [action.payload.optionId]: action.payload.value,
        },
      };
    case 'saveOptions':
      if (!state.optionEditingItemId) return state;
      const nextOptions = Object.entries(state.optionCounts)
        .filter(([, count]) => count > 0)
        .map(([id, count]) => ({
          itemOptionId: Number(id),
          count,
        }));
      return {
        ...state,
        selectedItems: state.selectedItems.map((item) =>
          item.itemId === state.optionEditingItemId ? { ...item, options: nextOptions } : item
        ),
        optionModalOpen: false,
        optionEditingItemId: null,
        optionCounts: {},
      };
    default:
      return state;
  }
};

export const useNewOrderBuilder = (
  items: ModelsItemDto[],
  itemOptions: ModelsItemOptionDto[],
  priceModifiers: ModelsPriceModifierDto[]
) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const filteredItems = useMemo(() => {
    const trimmed = state.searchTerm.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch = !trimmed || item.name?.toLowerCase().includes(trimmed);
      return matchesSearch;
    });
  }, [items, state.searchTerm]);

  const selectedDetails = useMemo(
    () =>
      state.selectedItems.map((entry) => {
        const item = items.find((i) => i.id === entry.itemId);
        return {
          ...entry,
          name: item?.name ?? `Item #${entry.itemId}`,
          price: item?.price ?? 0,
        };
      }),
    [state.selectedItems, items]
  );

  const modalItemOptions = useMemo(
    () =>
      state.optionEditingItemId
        ? itemOptions.filter(
            (opt) => opt.itemId === state.optionEditingItemId && opt.id !== undefined
          )
        : [],
    [itemOptions, state.optionEditingItemId]
  );

  const optionLookup = useMemo(
    () =>
      itemOptions.reduce<Record<number, string>>((acc, opt) => {
        if (opt.id !== undefined && opt.name) {
          acc[opt.id] = opt.name;
        }
        return acc;
      }, {}),
    [itemOptions]
  );

  const priceModifierLookup = useMemo(
    () =>
      priceModifiers.reduce<Record<number, typeof priceModifiers[number]>>((acc, pm) => {
        if (pm.id !== undefined) {
          acc[pm.id] = pm;
        }
        return acc;
      }, {}),
    [priceModifiers]
  );

  const getOptionUnitPrice = useCallback(
    (optionId: number, itemPrice: number) => {
      const option = itemOptions.find((opt) => opt.id === optionId);
      if (!option?.priceModifierId) return 0;
      const modifier = priceModifierLookup[option.priceModifierId];
      if (!modifier) return 0;

      const baseValue = modifier.isPercentage
        ? (itemPrice ?? 0) * ((modifier.value ?? 0) / 100)
        : modifier.value ?? 0;

      const signedValue = modifier.modifierType === 'Discount' ? -baseValue : baseValue;

      return signedValue;
    },
    [itemOptions, priceModifierLookup]
  );

  const orderTotal = useMemo(
    () =>
      selectedDetails.reduce((sum, item) => {
        const itemPrice = item.price ?? 0;
        const optionsTotal =
          item.options?.reduce((optSum, opt) => {
            const unit = getOptionUnitPrice(opt.itemOptionId, itemPrice);
            return optSum + unit * opt.count;
          }, 0) ?? 0;
        return sum + itemPrice * item.count + optionsTotal;
      }, 0),
    [selectedDetails, getOptionUnitPrice]
  );

  const handleAddItem = (itemId: number) => dispatch({ type: 'addItem', payload: itemId });
  const handleQuantityChange = (itemId: number, value: number | null) =>
    dispatch({ type: 'setQuantity', payload: { itemId, value: value ?? 0 } });
  const handleRemoveItem = (itemId: number) => dispatch({ type: 'removeItem', payload: itemId });

  const openOptionModal = (itemId: number) => {
    const selected = state.selectedItems.find((p) => p.itemId === itemId);
    const initialCounts =
      selected?.options?.reduce<Record<number, number>>((acc, opt) => {
        acc[opt.itemOptionId] = opt.count;
        return acc;
      }, {}) ?? {};
    dispatch({ type: 'openOptions', payload: { itemId, initialCounts } });
  };

  const closeOptionModal = () => dispatch({ type: 'closeOptions' });
  const setOptionCount = (optionId: number, value: number) =>
    dispatch({ type: 'setOptionCount', payload: { optionId, value } });
  const saveOptions = () => dispatch({ type: 'saveOptions' });

  return {
    state,
    filteredItems,
    selectedDetails,
    modalItemOptions,
    optionLookup,
    orderTotal,
    getOptionUnitPrice,
    setSearchTerm: (value: string) => dispatch({ type: 'setSearch', payload: value }),
    handleAddItem,
    handleQuantityChange,
    handleRemoveItem,
    openOptionModal,
    closeOptionModal,
    setOptionCount,
    saveOptions,
  };
};


