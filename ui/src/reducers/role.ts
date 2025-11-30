import { createReducer } from '@reduxjs/toolkit';
import {
  fetchBusinessRoles,
  fetchRoleById,
  createRole,
  updateRole,
  deleteRole,
  assignRole,
  updateRoleStatus,
  assignFunctionToRoleAction,
} from '@/actions/role';
import { ModelsAccountRoleDto } from '@/api/types.gen';

export interface RoleState {
  roles: ModelsAccountRoleDto[];
  currentRole?: ModelsAccountRoleDto;
  loading: boolean;
  error?: string;
}

const initialState: RoleState = {
  roles: [],
  loading: false,
};

export const roleReducer = createReducer(initialState, (builder) => {
  builder
    // Fetch business roles
    .addCase(fetchBusinessRoles.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(fetchBusinessRoles.fulfilled, (state, { payload }) => {
      state.roles = payload;
      state.loading = false;
    })
    .addCase(fetchBusinessRoles.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Fetch role by ID
    .addCase(fetchRoleById.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(fetchRoleById.fulfilled, (state, { payload }) => {
      state.currentRole = payload;
      state.loading = false;
    })
    .addCase(fetchRoleById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Create role
    .addCase(createRole.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(createRole.fulfilled, (state, { payload }) => {
      state.roles.push(payload);
      state.loading = false;
    })
    .addCase(createRole.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Update role
    .addCase(updateRole.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(updateRole.fulfilled, (state, { payload }) => {
      const index = state.roles.findIndex((role) => role.id === payload.id);
      if (index !== -1) {
        state.roles[index] = payload;
      }
      if (state.currentRole?.id === payload.id) {
        state.currentRole = payload;
      }
      state.loading = false;
    })
    .addCase(updateRole.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Delete role
    .addCase(deleteRole.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(deleteRole.fulfilled, (state, { payload }) => {
      state.roles = state.roles.filter((role) => role.id !== payload);
      if (state.currentRole?.id === payload) {
        state.currentRole = undefined;
      }
      state.loading = false;
    })
    .addCase(deleteRole.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Assign role
    .addCase(assignRole.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(assignRole.fulfilled, (state) => {
      state.loading = false;
    })
    .addCase(assignRole.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Update role status
    .addCase(updateRoleStatus.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(updateRoleStatus.fulfilled, (state) => {
      state.loading = false;
    })
    .addCase(updateRoleStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Assign function to role
    .addCase(assignFunctionToRoleAction.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(assignFunctionToRoleAction.fulfilled, (state) => {
      state.loading = false;
    })
    .addCase(assignFunctionToRoleAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
});
