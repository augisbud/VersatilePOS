import { useAppSelector } from './useAppSelector';
import { useAppDispatch } from './useAppDispatch';
import {
  getAllFunctions,
  getRoleFunctions,
  getRoleFunctionsMap,
  getFunctionsByRoleId as getFunctionsByRoleIdSelector,
  getFunctionsLoading,
  getFunctionsError,
} from '@/selectors/function';
import {
  fetchAllFunctions as fetchAllFunctionsAction,
  fetchFunctionsForRole as fetchFunctionsForRoleAction,
} from '@/actions/function';

export const useFunctions = () => {
  const dispatch = useAppDispatch();
  const allFunctions = useAppSelector(getAllFunctions);
  const roleFunctions = useAppSelector(getRoleFunctions);
  const roleFunctionsMap = useAppSelector(getRoleFunctionsMap);
  const loading = useAppSelector(getFunctionsLoading);
  const error = useAppSelector(getFunctionsError);

  const fetchAllFunctions = async () => {
    return dispatch(fetchAllFunctionsAction()).unwrap();
  };

  const fetchFunctionsForRole = async (roleId: number) => {
    return dispatch(fetchFunctionsForRoleAction(roleId)).unwrap();
  };

  const getFunctionsByRoleId = (roleId: number) => {
    return getFunctionsByRoleIdSelector(roleFunctionsMap, roleId);
  };

  return {
    allFunctions,
    roleFunctions,
    roleFunctionsMap,
    loading,
    error,
    fetchAllFunctions,
    fetchFunctionsForRole,
    getFunctionsByRoleId,
  };
};
