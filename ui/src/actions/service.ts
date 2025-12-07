import {
  ModelsServiceDto,
  ModelsCreateServiceRequest,
  ModelsUpdateServiceRequest,
} from '@/api/types.gen';
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from '@/api';

export const fetchServices = createAsyncThunk<ModelsServiceDto[], number>(
  'service/fetchServices',
  async (businessId: number) => {
    const response = await getServices({ query: { businessId } });

    if (response.error) {
      throw new Error(response.error.error);
    }

    return Array.isArray(response.data) ? response.data : [];
  }
);

export const fetchServiceById = createAsyncThunk<ModelsServiceDto, number>(
  'service/fetchServiceById',
  async (serviceId: number) => {
    const response = await getServiceById({ path: { id: serviceId } });

    if (response.error) {
      throw new Error(response.error.error);
    }

    if (!response.data) {
      throw new Error('No data returned from getServiceById');
    }

    return response.data;
  }
);

export const addService = createAsyncThunk<
  ModelsServiceDto,
  ModelsCreateServiceRequest
>('service/addService', async (serviceData: ModelsCreateServiceRequest) => {
  const response = await createService({ body: serviceData });

  if (response.error) {
    throw new Error(response.error.error);
  }

  if (!response.data) {
    throw new Error('No data returned from createService');
  }

  return response.data;
});

export const editService = createAsyncThunk<
  ModelsServiceDto,
  { id: number; data: ModelsUpdateServiceRequest }
>(
  'service/editService',
  async ({ id, data }: { id: number; data: ModelsUpdateServiceRequest }) => {
    const response = await updateService({ path: { id }, body: data });

    if (response.error) {
      throw new Error(response.error.error);
    }

    if (!response.data) {
      throw new Error('No data returned from updateService');
    }

    return response.data;
  }
);

export const removeService = createAsyncThunk<number, number>(
  'service/removeService',
  async (serviceId: number) => {
    const response = await deleteService({ path: { id: serviceId } });

    if (response.error) {
      throw new Error(response.error.error);
    }

    return serviceId;
  }
);
