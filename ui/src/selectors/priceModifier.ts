import { State } from '@/types/redux';
import { ModelsasPriceModifierDto } from '@/api/types.gen';

export const getPriceModifiers = (state: State): ModelsasPriceModifierDto[] =>
  state.priceModifier.priceModifiers;

export const getSelectedPriceModifier = (state: State) =>
  state.priceModifier.selectedPriceModifier;

export const getPriceModifiersLoading = (state: State) =>
  state.priceModifier.loading;

export const getPriceModifiersError = (state: State) =>
  state.priceModifier.error;

export const getPriceModifiersBusinessId = (state: State) =>
  state.priceModifier.selectedBusinessId;

export const getPriceModifierById = (
  priceModifiers: ModelsasPriceModifierDto[],
  id: number
) => priceModifiers.find((priceModifier) => priceModifier.id === id);

export const getPriceModifiersByType = (
  priceModifiers: ModelsasPriceModifierDto[],
  modifierType: string
) =>
  priceModifiers.filter(
    (priceModifier) => priceModifier.modifierType === modifierType
  );
