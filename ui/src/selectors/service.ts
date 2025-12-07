import { State } from '@/types/redux';
import { ModelsServiceDto } from '@/api/types.gen';

export const getServices = (state: State): ModelsServiceDto[] =>
  state.service.services;

export const getSelectedService = (state: State) =>
  state.service.selectedService;

export const getServicesLoading = (state: State) => state.service.loading;

export const getServicesError = (state: State) => state.service.error;

export const getServiceById = (services: ModelsServiceDto[], id: number) =>
  services.find((service) => service.id === id);
