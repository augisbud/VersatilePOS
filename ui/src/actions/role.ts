import {
  ModelsAccountRoleDto,
  ModelsCreateAccountRoleRequest,
  ModelsUpdateAccountRoleRequest,
  ModelsAssignRoleRequest,
  ModelsAccountRoleLinkDto,
  ModelsUpdateAccountRoleLinkRequest,
  ModelsAssignFunctionRequest,
} from '@/api/types.gen';
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  createAccountRole,
  deleteAccountRoleById,
  getAccountRoleById,
  updateAccountRoleById,
  getBusinessRoles,
  assignRoleToAccount,
  updateAccountRoleStatus,
  assignFunctionToRole,
} from '@/api';

export const fetchBusinessRoles = createAsyncThunk<
  ModelsAccountRoleDto[],
  number
>('role/fetchBusinessRoles', async (businessId: number) => {
  const response = await getBusinessRoles({ path: { id: businessId } });

  if (response.error) {
    throw new Error(response.error.error);
  }

  return response.data ?? [];
});

export const fetchRoleById = createAsyncThunk<ModelsAccountRoleDto, number>(
  'role/fetchRoleById',
  async (roleId: number) => {
    const response = await getAccountRoleById({ path: { id: roleId } });

    if (response.error) {
      throw new Error(response.error.error);
    }

    if (!response.data) {
      throw new Error('No data returned from getAccountRoleById');
    }

    return response.data;
  }
);

export const createRole = createAsyncThunk<
  ModelsAccountRoleDto,
  ModelsCreateAccountRoleRequest
>('role/createRole', async (roleData: ModelsCreateAccountRoleRequest) => {
  const response = await createAccountRole({ body: roleData });

  if (response.error) {
    throw new Error(response.error.error);
  }

  if (!response.data) {
    throw new Error('No data returned from createAccountRole');
  }

  return response.data;
});

export const updateRole = createAsyncThunk<
  ModelsAccountRoleDto,
  { id: number; data: ModelsUpdateAccountRoleRequest }
>('role/updateRole', async ({ id, data }) => {
  const response = await updateAccountRoleById({
    path: { id },
    body: data,
  });

  if (response.error) {
    throw new Error(response.error.error);
  }

  if (!response.data) {
    throw new Error('No data returned from updateAccountRoleById');
  }

  return response.data;
});

export const deleteRole = createAsyncThunk<number, number>(
  'role/deleteRole',
  async (roleId: number) => {
    const response = await deleteAccountRoleById({ path: { id: roleId } });

    if (response.error) {
      throw new Error(response.error.error);
    }

    return roleId;
  }
);

export const assignRole = createAsyncThunk<
  ModelsAccountRoleLinkDto,
  { accountId: number; roleData: ModelsAssignRoleRequest }
>('role/assignRole', async ({ accountId, roleData }) => {
  const response = await assignRoleToAccount({
    path: { id: accountId },
    body: roleData,
  });

  if (response.error) {
    throw new Error(response.error.error);
  }

  if (!response.data) {
    throw new Error('No data returned from assignRoleToAccount');
  }

  return response.data;
});

export const updateRoleStatus = createAsyncThunk<
  ModelsAccountRoleLinkDto,
  {
    accountId: number;
    roleId: number;
    statusData: ModelsUpdateAccountRoleLinkRequest;
  }
>('role/updateRoleStatus', async ({ accountId, roleId, statusData }) => {
  const response = await updateAccountRoleStatus({
    path: { id: accountId, roleId },
    body: statusData,
  });

  if (response.error) {
    throw new Error(response.error.error);
  }

  if (!response.data) {
    throw new Error('No data returned from updateAccountRoleStatus');
  }

  return response.data;
});

export const assignFunctionToRoleAction = createAsyncThunk<
  void,
  { roleId: number; functionData: ModelsAssignFunctionRequest }
>('role/assignFunctionToRole', async ({ roleId, functionData }) => {
  const response = await assignFunctionToRole({
    path: { id: roleId },
    body: functionData,
  });

  if (response.error) {
    throw new Error(response.error.error);
  }
});
