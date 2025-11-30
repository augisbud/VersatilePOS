import { State } from '@/types/redux';
import { ModelsFunctionDto } from '@/api/types.gen';

export const getAllFunctions = (state: State): ModelsFunctionDto[] =>
  state.function.allFunctions;

export const getFunctionsLoading = (state: State): boolean =>
  state.function.loading;

export const getFunctionsError = (state: State): string | undefined =>
  state.function.error;
