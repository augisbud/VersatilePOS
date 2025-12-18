import { createReducer } from '@reduxjs/toolkit';
import {
  fetchGiftCards,
  fetchGiftCardById,
  addGiftCard,
  checkBalance,
  deactivateCard,
} from '@/actions/giftCard';
import { ModelsGiftCardDto } from '@/api/types.gen';

export interface GiftCardState {
  giftCards: ModelsGiftCardDto[];
  selectedGiftCard?: ModelsGiftCardDto;
  checkedGiftCard?: ModelsGiftCardDto;
  loading: boolean;
  error?: string;
}

const initialState: GiftCardState = {
  giftCards: [],
  selectedGiftCard: undefined,
  checkedGiftCard: undefined,
  loading: false,
};

export const giftCardReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(fetchGiftCards.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(fetchGiftCards.fulfilled, (state, { payload }) => {
      state.giftCards = payload;
      state.loading = false;
    })
    .addCase(fetchGiftCards.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    .addCase(fetchGiftCardById.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(fetchGiftCardById.fulfilled, (state, { payload }) => {
      state.selectedGiftCard = payload;
      state.loading = false;
    })
    .addCase(fetchGiftCardById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    .addCase(addGiftCard.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(addGiftCard.fulfilled, (state, { payload }) => {
      state.giftCards.push(payload);
      state.loading = false;
    })
    .addCase(addGiftCard.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    .addCase(checkBalance.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(checkBalance.fulfilled, (state, { payload }) => {
      state.checkedGiftCard = payload;
      state.loading = false;
    })
    .addCase(checkBalance.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    .addCase(deactivateCard.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(deactivateCard.fulfilled, (state, { payload }) => {
      state.giftCards = state.giftCards.map((gc) =>
        gc.id === payload.id ? payload : gc
      );
      state.selectedGiftCard =
        state.selectedGiftCard?.id === payload.id
          ? payload
          : state.selectedGiftCard;
      state.loading = false;
    })
    .addCase(deactivateCard.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
});

