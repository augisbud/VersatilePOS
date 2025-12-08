import { createReducer } from '@reduxjs/toolkit';
import {
  fetchServices,
  fetchServiceById,
  addService,
  editService,
  removeService,
  assignEmployeeToService,
  unassignEmployeeFromService,
} from '@/actions/service';
import { ModelsServiceDto } from '@/api/types.gen';

export interface ServiceState {
  services: ModelsServiceDto[];
  selectedService?: ModelsServiceDto;
  loading: boolean;
  assignmentLoading: boolean;
  error?: string;
}

const initialState: ServiceState = {
  services: [],
  selectedService: undefined,
  loading: false,
  assignmentLoading: false,
};

export const serviceReducer = createReducer(initialState, (builder) => {
  builder
    // Fetch services
    .addCase(fetchServices.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(fetchServices.fulfilled, (state, { payload }) => {
      state.services = payload;
      state.loading = false;
    })
    .addCase(fetchServices.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Fetch service by ID
    .addCase(fetchServiceById.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(fetchServiceById.fulfilled, (state, { payload }) => {
      state.selectedService = payload;
      state.loading = false;
    })
    .addCase(fetchServiceById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Add service
    .addCase(addService.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(addService.fulfilled, (state, { payload }) => {
      state.services.push(payload);
      state.loading = false;
    })
    .addCase(addService.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Edit service
    .addCase(editService.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(editService.fulfilled, (state, { payload }) => {
      state.services = state.services.map((s) =>
        s.id === payload.id ? payload : s
      );
      state.selectedService =
        state.selectedService?.id === payload.id
          ? payload
          : state.selectedService;
      state.loading = false;
    })
    .addCase(editService.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Remove service
    .addCase(removeService.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(removeService.fulfilled, (state, { payload }) => {
      state.services = state.services.filter((s) => s.id !== payload);
      if (state.selectedService?.id === payload) {
        state.selectedService = undefined;
      }
      state.loading = false;
    })
    .addCase(removeService.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Assign employee to service
    .addCase(assignEmployeeToService.pending, (state) => {
      state.assignmentLoading = true;
      state.error = undefined;
    })
    .addCase(assignEmployeeToService.fulfilled, (state) => {
      state.assignmentLoading = false;
    })
    .addCase(assignEmployeeToService.rejected, (state, action) => {
      state.assignmentLoading = false;
      state.error = action.error.message;
    })
    // Unassign employee from service
    .addCase(unassignEmployeeFromService.pending, (state) => {
      state.assignmentLoading = true;
      state.error = undefined;
    })
    .addCase(unassignEmployeeFromService.fulfilled, (state, { payload }) => {
      const service = state.services.find((s) => s.id === payload.serviceId);

      if (service && service.employees) {
        service.employees = service.employees.filter(
          (e) => e.id !== payload.employeeId
        );
      }

      if (
        state.selectedService?.id === payload.serviceId &&
        state.selectedService.employees
      ) {
        state.selectedService.employees =
          state.selectedService.employees.filter(
            (e) => e.id !== payload.employeeId
          );
      }

      state.assignmentLoading = false;
    })
    .addCase(unassignEmployeeFromService.rejected, (state, action) => {
      state.assignmentLoading = false;
      state.error = action.error.message;
    });
});
