import { useAppSelector } from './useAppSelector';
import { useAppDispatch } from './useAppDispatch';
import { getEmployees } from '@/selectors/employee';
import {
  fetchEmployees as fetchEmployeesAction,
  deleteEmployee as deleteEmployeeAction,
} from '@/actions/employee';

export const useEmployees = () => {
  const dispatch = useAppDispatch();
  const employees = useAppSelector(getEmployees);

  const fetchEmployees = async (businessId: number) => {
    return dispatch(fetchEmployeesAction(businessId)).unwrap();
  };

  const deleteEmployee = async (accountId: number) => {
    return dispatch(deleteEmployeeAction(accountId)).unwrap();
  };

  return {
    employees,
    fetchEmployees,
    deleteEmployee,
  };
};
