import { createReducer } from '@reduxjs/toolkit';
import {
  fetchEmployees,
  deleteEmployee,
  createEmployee,
} from '@/actions/employee';
import { ModelsAccountDto } from '@/api/types.gen';

export interface EmployeeState {
  employees: ModelsAccountDto[];
  loading: boolean;
  error?: string;
}

const initialState: EmployeeState = {
  employees: [],
  loading: false,
};

export const employeeReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(fetchEmployees.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(fetchEmployees.fulfilled, (state, { payload }) => {
      state.employees = payload;
      state.loading = false;
    })
    .addCase(fetchEmployees.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    .addCase(deleteEmployee.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(deleteEmployee.fulfilled, (state, { payload }) => {
      state.employees = state.employees.filter(
        (employee) => employee.id !== payload
      );
      state.loading = false;
    })
    .addCase(deleteEmployee.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    .addCase(createEmployee.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(createEmployee.fulfilled, (state, { payload }) => {
      state.employees.push(payload);
      state.loading = false;
    })
    .addCase(createEmployee.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
});
