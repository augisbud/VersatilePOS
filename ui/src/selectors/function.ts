import { State } from '@/types/redux';
import {
  ModelsFunctionDto,
  ModelsAccountRoleFunctionLinkDto,
} from '@/api/types.gen';

export const getAllFunctions = (state: State): ModelsFunctionDto[] =>
  state.function.allFunctions;

export const getRoleFunctions = (state: State): ModelsFunctionDto[] =>
  state.function.roleFunctions;

export const getRoleFunctionsMap = (
  state: State
): Record<number, ModelsAccountRoleFunctionLinkDto[]> =>
  state.function.roleFunctionsMap;

export const getFunctionsByRoleId = (
  roleFunctionsMap: Record<number, ModelsAccountRoleFunctionLinkDto[]>,
  roleId: number
): ModelsAccountRoleFunctionLinkDto[] => roleFunctionsMap[roleId] || [];

export const getFunctionsLoading = (state: State): boolean =>
  state.function.loading;

export const getFunctionsError = (state: State): string | undefined =>
  state.function.error;
