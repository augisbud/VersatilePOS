import { useAppSelector } from './useAppSelector';
import { useAppDispatch } from './useAppDispatch';
import {
  getAllFunctions,
  getFunctionsLoading,
  getFunctionsError,
} from '@/selectors/function';
import { fetchAllFunctions as fetchAllFunctionsAction } from '@/actions/function';

export const useFunctions = () => {
  const dispatch = useAppDispatch();
  const allFunctions = useAppSelector(getAllFunctions);
  const loading = useAppSelector(getFunctionsLoading);
  const error = useAppSelector(getFunctionsError);

  const fetchAllFunctions = async () => {
    return dispatch(fetchAllFunctionsAction()).unwrap();
  };

  return {
    allFunctions,
    loading,
    error,
    fetchAllFunctions,
  };
};
