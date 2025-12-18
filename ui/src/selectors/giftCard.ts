import { State } from '@/types/redux';
import { ModelsGiftCardDto } from '@/api/types.gen';

export const getGiftCards = (state: State) => state.giftCard.giftCards;

export const getSelectedGiftCard = (state: State) =>
  state.giftCard.selectedGiftCard;

export const getCheckedGiftCard = (state: State) =>
  state.giftCard.checkedGiftCard;

export const getGiftCardsLoading = (state: State) => state.giftCard.loading;

export const getGiftCardsError = (state: State) => state.giftCard.error;

export const getGiftCardById = (
  giftCards: ModelsGiftCardDto[],
  id: number
) => giftCards.find((giftCard) => giftCard.id === id);

export const getActiveGiftCards = (state: State) =>
  state.giftCard.giftCards.filter((gc) => gc.isActive);

