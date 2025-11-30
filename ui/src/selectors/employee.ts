import { State } from '@/types/redux';
import { ModelsAccountDto, ModelsAccountRoleDto } from '@/api/types.gen';

export const getEmployees = (state: State): ModelsAccountDto[] =>
  state.employee.employees;

export const getAvailableRoles = (
  employee: ModelsAccountDto,
  roles: ModelsAccountRoleDto[]
) => {
  const employeeRoles = employee.roles || [];
  const assignedRoleIds = new Set(
    employeeRoles.map((roleLink) => roleLink.role?.id).filter(Boolean)
  );

  return roles.filter((role) => !assignedRoleIds.has(role.id));
};
