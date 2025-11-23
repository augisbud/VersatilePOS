import { State } from '@/types/redux';
import { ModelsAccountDto } from '@/api/types.gen';

export const getEmployees = (state: State): ModelsAccountDto[] =>
  state.employee.employees;
