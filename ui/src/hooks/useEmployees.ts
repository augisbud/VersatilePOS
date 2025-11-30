import { useAppSelector } from './useAppSelector';
import { useAppDispatch } from './useAppDispatch';
import { getEmployees } from '@/selectors/employee';
import {
  fetchEmployees as fetchEmployeesAction,
  deleteEmployee as deleteEmployeeAction,
  createEmployee as createEmployeeAction,
} from '@/actions/employee';
import { ModelsCreateAccountRequest } from '@/api/types.gen';

export const useEmployees = () => {
  const dispatch = useAppDispatch();
  const employees = useAppSelector(getEmployees);

  const fetchEmployees = async (businessId: number) => {
    return dispatch(fetchEmployeesAction(businessId)).unwrap();
  };

  const deleteEmployee = async (accountId: number) => {
    return dispatch(deleteEmployeeAction(accountId)).unwrap();
  };

  const createEmployee = async (employeeData: ModelsCreateAccountRequest) => {
    return dispatch(createEmployeeAction(employeeData)).unwrap();
  };

  return {
    employees,
    fetchEmployees,
    deleteEmployee,
    createEmployee,
  };
};
