import { createReducer } from '@reduxjs/toolkit';
import { fetchAllFunctions, fetchFunctionsForRole } from '@/actions/function';
import {
  ModelsFunctionDto,
  ModelsAccountRoleFunctionLinkDto,
} from '@/api/types.gen';

export interface FunctionState {
  allFunctions: ModelsFunctionDto[];
  roleFunctions: ModelsFunctionDto[];
  roleFunctionsMap: Record<number, ModelsAccountRoleFunctionLinkDto[]>;
  loading: boolean;
  error?: string;
}

const initialState: FunctionState = {
  allFunctions: [],
  roleFunctions: [],
  roleFunctionsMap: {},
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
    })
    .addCase(fetchFunctionsForRole.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(fetchFunctionsForRole.fulfilled, (state, { payload, meta }) => {
      const functionLinks = payload as ModelsAccountRoleFunctionLinkDto[];
      const roleId = meta.arg;

      state.roleFunctions = functionLinks
        .map((link) => link.function)
        .filter((func): func is ModelsFunctionDto => func !== undefined);
      state.roleFunctionsMap[roleId] = functionLinks;
      state.loading = false;
    })
    .addCase(fetchFunctionsForRole.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
});
