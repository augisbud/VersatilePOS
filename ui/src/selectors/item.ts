import { State } from '@/types/redux';
import { ModelsItemDto } from '@/api/types.gen';

export const getItems = (state: State): ModelsItemDto[] => state.item.items;

export const getSelectedItem = (state: State) => state.item.selectedItem;

export const getItemsLoading = (state: State) => state.item.loading;

export const getItemsError = (state: State) => state.item.error;

export const getItemsBusinessId = (state: State) => state.item.selectedBusinessId;

export const getItemById = (items: ModelsItemDto[], id: number) =>
  items.find((item) => item.id === id);
