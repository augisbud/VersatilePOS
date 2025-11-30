import { useAppSelector } from './useAppSelector';
import { useAppDispatch } from './useAppDispatch';
import {
  getRoles,
  getCurrentRole,
  getRolesLoading,
  getRolesError,
  getRoleById as getRoleByIdSelector,
  getRoleFunctionsMap,
} from '@/selectors/role';
import {
  fetchBusinessRoles as fetchBusinessRolesAction,
  fetchRoleById as fetchRoleByIdAction,
  createRole as createRoleAction,
  updateRole as updateRoleAction,
  deleteRole as deleteRoleAction,
  assignRole as assignRoleAction,
  updateRoleStatus as updateRoleStatusAction,
  assignFunctionToRoleAction,
} from '@/actions/role';
import {
  ModelsCreateAccountRoleRequest,
  ModelsUpdateAccountRoleRequest,
  ModelsAssignRoleRequest,
  ModelsUpdateAccountRoleLinkRequest,
  ModelsAssignFunctionRequest,
} from '@/api/types.gen';

export const useRoles = () => {
  const dispatch = useAppDispatch();
  const roles = useAppSelector(getRoles);
  const currentRole = useAppSelector(getCurrentRole);
  const loading = useAppSelector(getRolesLoading);
  const error = useAppSelector(getRolesError);
  const roleFunctionsMap = useAppSelector(getRoleFunctionsMap);

  const fetchBusinessRoles = async (businessId: number) => {
    return dispatch(fetchBusinessRolesAction(businessId)).unwrap();
  };

  const fetchRoleById = async (roleId: number) => {
    return dispatch(fetchRoleByIdAction(roleId)).unwrap();
  };

  const createRole = async (roleData: ModelsCreateAccountRoleRequest) => {
    return dispatch(createRoleAction(roleData)).unwrap();
  };

  const updateRole = async (
    id: number,
    data: ModelsUpdateAccountRoleRequest
  ) => {
    return dispatch(updateRoleAction({ id, data })).unwrap();
  };

  const deleteRole = async (roleId: number) => {
    return dispatch(deleteRoleAction(roleId)).unwrap();
  };

  const assignRole = async (
    accountId: number,
    roleData: ModelsAssignRoleRequest
  ) => {
    return dispatch(assignRoleAction({ accountId, roleData })).unwrap();
  };

  const updateRoleStatus = async (
    accountId: number,
    roleId: number,
    statusData: ModelsUpdateAccountRoleLinkRequest
  ) => {
    return dispatch(
      updateRoleStatusAction({ accountId, roleId, statusData })
    ).unwrap();
  };

  const assignFunctionToRole = async (
    roleId: number,
    functionData: ModelsAssignFunctionRequest
  ) => {
    return dispatch(
      assignFunctionToRoleAction({ roleId, functionData })
    ).unwrap();
  };

  const getRoleById = (roleId: number) => {
    return getRoleByIdSelector(roles, roleId);
  };

  const getFunctionsForRole = (roleId: number) => {
    return roleFunctionsMap[roleId] || [];
  };

  return {
    roles,
    currentRole,
    loading,
    error,
    roleFunctionsMap,
    fetchBusinessRoles,
    fetchRoleById,
    createRole,
    updateRole,
    deleteRole,
    assignRole,
    updateRoleStatus,
    assignFunctionToRole,
    getRoleById,
    getFunctionsForRole,
  };
};
