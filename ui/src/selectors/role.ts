import { State } from '@/types/redux';
import {
  ModelsAccountRoleDto,
  ModelsAccountRoleFunctionLinkDto,
} from '@/api/types.gen';

export const getRoles = (state: State): ModelsAccountRoleDto[] =>
  state.role.roles;

export const getCurrentRole = (
  state: State
): ModelsAccountRoleDto | undefined => state.role.currentRole;

export const getRolesLoading = (state: State): boolean => state.role.loading;

export const getRolesError = (state: State): string | undefined =>
  state.role.error;

export const getRoleById = (
  roles: ModelsAccountRoleDto[],
  roleId: number
): ModelsAccountRoleDto | undefined => roles.find((role) => role.id === roleId);

export const getRoleFunctionsMap = (
  state: State
): Record<number, ModelsAccountRoleFunctionLinkDto[]> => {
  return state.role.roles.reduce((map, role) => {
    if (role.id) {
      map[role.id] = role.functionLinks || [];
    }
    return map;
  }, {} as Record<number, ModelsAccountRoleFunctionLinkDto[]>);
};
