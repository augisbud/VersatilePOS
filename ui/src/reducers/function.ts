import { createReducer } from '@reduxjs/toolkit';
import { fetchAllFunctions } from '@/actions/function';
import { ModelsFunctionDto } from '@/api/types.gen';

export interface FunctionState {
  allFunctions: ModelsFunctionDto[];
  loading: boolean;
  error?: string;
}

const initialState: FunctionState = {
  allFunctions: [],
  loading: false,
};

export const functionReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(fetchAllFunctions.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(fetchAllFunctions.fulfilled, (state, { payload }) => {
      state.allFunctions = payload;
      state.loading = false;
    })
    .addCase(fetchAllFunctions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
});
