import { useAppSelector } from './useAppSelector';
import { useAppDispatch } from './useAppDispatch';
import {
  getServices,
  getSelectedService,
  getServicesLoading,
  getServicesError,
  getServiceById as getServiceByIdSelector,
} from '@/selectors/service';
import {
  fetchServices as fetchServicesAction,
  fetchServiceById as fetchServiceByIdAction,
  addService as addServiceAction,
  editService as editServiceAction,
  removeService as removeServiceAction,
} from '@/actions/service';
import {
  ModelsCreateServiceRequest,
  ModelsUpdateServiceRequest,
} from '@/api/types.gen';

export const useServices = () => {
  const dispatch = useAppDispatch();
  const services = useAppSelector(getServices);
  const selectedService = useAppSelector(getSelectedService);
  const loading = useAppSelector(getServicesLoading);
  const error = useAppSelector(getServicesError);

  const fetchServices = async (businessId: number) => {
    return dispatch(fetchServicesAction(businessId)).unwrap();
  };

  const fetchServiceById = async (serviceId: number) => {
    return dispatch(fetchServiceByIdAction(serviceId)).unwrap();
  };

  const createService = async (serviceData: ModelsCreateServiceRequest) => {
    return dispatch(addServiceAction(serviceData)).unwrap();
  };

  const updateService = async (
    id: number,
    data: ModelsUpdateServiceRequest
  ) => {
    return dispatch(editServiceAction({ id, data })).unwrap();
  };

  const deleteService = async (serviceId: number) => {
    return dispatch(removeServiceAction(serviceId)).unwrap();
  };

  const getServiceByIdFromList = (serviceId: number) => {
    return getServiceByIdSelector(services, serviceId);
  };

  return {
    services,
    selectedService,
    loading,
    error,
    fetchServices,
    fetchServiceById,
    createService,
    updateService,
    deleteService,
    getServiceById: getServiceByIdFromList,
  };
};
