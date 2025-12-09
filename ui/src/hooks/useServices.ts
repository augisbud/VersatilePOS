import { useAppSelector } from './useAppSelector';
import { useAppDispatch } from './useAppDispatch';
import {
  getServices,
  getSelectedService,
  getServicesLoading,
  getServicesError,
  getServiceAssignmentLoading,
  getServiceById as getServiceByIdSelector,
  getServiceEmployees as getServiceEmployeesSelector,
  getSelectedServiceEmployees,
} from '@/selectors/service';
import {
  fetchServices as fetchServicesAction,
  fetchServiceById as fetchServiceByIdAction,
  addService as addServiceAction,
  editService as editServiceAction,
  removeService as removeServiceAction,
  assignEmployeeToService as assignEmployeeToServiceAction,
  unassignEmployeeFromService as unassignEmployeeFromServiceAction,
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
  const assignmentLoading = useAppSelector(getServiceAssignmentLoading);
  const error = useAppSelector(getServicesError);
  const selectedServiceEmployees = useAppSelector(getSelectedServiceEmployees);

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

  const assignEmployeeToService = async (
    employeeId: number,
    serviceId: number
  ) => {
    return dispatch(
      assignEmployeeToServiceAction({ employeeId, serviceId })
    ).unwrap();
  };

  const unassignEmployeeFromService = async (
    employeeId: number,
    serviceId: number
  ) => {
    return dispatch(
      unassignEmployeeFromServiceAction({ employeeId, serviceId })
    ).unwrap();
  };

  const getServiceByIdFromList = (serviceId: number) => {
    return getServiceByIdSelector(services, serviceId);
  };

  const getServiceEmployees = (serviceId: number) => {
    return getServiceEmployeesSelector(services, serviceId);
  };

  return {
    services,
    selectedService,
    selectedServiceEmployees,
    loading,
    assignmentLoading,
    error,
    fetchServices,
    fetchServiceById,
    createService,
    updateService,
    deleteService,
    assignEmployeeToService,
    unassignEmployeeFromService,
    getServiceById: getServiceByIdFromList,
    getServiceEmployees,
  };
};
