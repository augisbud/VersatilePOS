import { State } from '@/types/redux';
import { ModelsItemOptionDto } from '@/api/types.gen';

export const getItemOptions = (state: State): ModelsItemOptionDto[] =>
  state.itemOption.itemOptions;

export const getSelectedItemOption = (state: State) =>
  state.itemOption.selectedItemOption;

export const getItemOptionsLoading = (state: State) => state.itemOption.loading;

export const getItemOptionsError = (state: State) => state.itemOption.error;

export const getItemOptionsBusinessId = (state: State) =>
  state.itemOption.selectedBusinessId;

export const getItemOptionById = (
  itemOptions: ModelsItemOptionDto[],
  id: number
) => itemOptions.find((itemOption) => itemOption.id === id);

export const getItemOptionsByItemId = (
  itemOptions: ModelsItemOptionDto[],
  itemId: number
) => itemOptions.filter((itemOption) => itemOption.itemId === itemId);
