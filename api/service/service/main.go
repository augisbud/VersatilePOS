package service

import (
	"VersatilePOS/database/entities"
	"VersatilePOS/generic/constants"
	"VersatilePOS/generic/rbac"
	serviceModels "VersatilePOS/service/models"
	"VersatilePOS/service/repository"
	"errors"
)

type Service struct {
	repo repository.Repository
}

func NewService() *Service {
	return &Service{
		repo: repository.Repository{},
	}
}

// hasServiceAccess checks if user has access to services for a given business
func (s *Service) hasServiceAccess(businessID uint, userID uint, level constants.AccessLevel) (bool, error) {
	ok, err := rbac.HasAccess(constants.Services, level, businessID, userID)
	if err != nil {
		return false, errors.New("failed to verify permissions")
	}
	return ok, nil
}

func (s *Service) CreateService(req serviceModels.CreateServiceRequest, userID uint) (*serviceModels.ServiceDto, error) {
	// Check if user has write access to services for this business
	hasAccess, err := s.hasServiceAccess(req.BusinessID, userID, constants.Write)
	if err != nil {
		return nil, err
	}
	if !hasAccess {
		return nil, errors.New("unauthorized")
	}

	service := &entities.Service{
		BusinessID:           req.BusinessID,
		Name:                 req.Name,
		HourlyPrice:          req.HourlyPrice,
		ServiceCharge:       req.ServiceCharge,
		ProvisioningStartTime: req.ProvisioningStartTime,
		ProvisioningEndTime:   req.ProvisioningEndTime,
		ProvisioningInterval:  req.ProvisioningInterval,
	}

	if err := s.repo.CreateService(service); err != nil {
		return nil, errors.New("failed to create service")
	}

	// Reload to get the full entity
	createdService, err := s.repo.GetServiceByID(service.ID)
	if err != nil {
		return nil, errors.New("failed to retrieve created service")
	}
	if createdService == nil {
		return nil, errors.New("service not found after creation")
	}

	dto := serviceModels.NewServiceDtoFromEntity(*createdService)
	return &dto, nil
}

func (s *Service) GetServices(businessID uint, userID uint) ([]serviceModels.ServiceDto, error) {
	ok, err := s.hasServiceAccess(businessID, userID, constants.Read)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to view services for this business")
	}

	services, err := s.repo.GetServicesByBusinessID(businessID)
	if err != nil {
		return nil, errors.New("failed to get services")
	}

	serviceDtos := make([]serviceModels.ServiceDto, 0)
	for _, service := range services {
		serviceDtos = append(serviceDtos, serviceModels.NewServiceDtoFromEntity(service))
	}

	return serviceDtos, nil
}

func (s *Service) GetServiceByID(id uint, userID uint) (*serviceModels.ServiceDto, error) {
	service, err := s.repo.GetServiceByID(id)
	if err != nil {
		return nil, errors.New("failed to get service")
	}
	if service == nil {
		return nil, errors.New("service not found")
	}

	// Check if user has read access to services for this business
	hasAccess, err := s.hasServiceAccess(service.BusinessID, userID, constants.Read)
	if err != nil {
		return nil, err
	}
	if !hasAccess {
		return nil, errors.New("unauthorized")
	}

	dto := serviceModels.NewServiceDtoFromEntity(*service)
	return &dto, nil
}

func (s *Service) UpdateService(id uint, req serviceModels.UpdateServiceRequest, userID uint) (*serviceModels.ServiceDto, error) {
	service, err := s.repo.GetServiceByID(id)
	if err != nil {
		return nil, errors.New("failed to get service")
	}
	if service == nil {
		return nil, errors.New("service not found")
	}

	// Check if user has write access to services for this business
	hasAccess, err := s.hasServiceAccess(service.BusinessID, userID, constants.Write)
	if err != nil {
		return nil, err
	}
	if !hasAccess {
		return nil, errors.New("unauthorized")
	}

	// If business is being updated, verify access to the new business
	if req.BusinessID != nil && *req.BusinessID != service.BusinessID {
		ok, err := s.hasServiceAccess(*req.BusinessID, userID, constants.Write)
		if err != nil || !ok {
			return nil, errors.New("unauthorized to assign service to this business")
		}
	}

	// Update fields if provided
	if req.BusinessID != nil {
		service.BusinessID = *req.BusinessID
	}
	if req.Name != nil {
		service.Name = *req.Name
	}
	if req.HourlyPrice != nil {
		service.HourlyPrice = *req.HourlyPrice
	}
	if req.ServiceCharge != nil {
		service.ServiceCharge = *req.ServiceCharge
	}
	if req.ProvisioningStartTime != nil {
		service.ProvisioningStartTime = *req.ProvisioningStartTime
	}
	if req.ProvisioningEndTime != nil {
		service.ProvisioningEndTime = *req.ProvisioningEndTime
	}
	if req.ProvisioningInterval != nil {
		service.ProvisioningInterval = *req.ProvisioningInterval
	}

	if err := s.repo.UpdateService(service); err != nil {
		return nil, errors.New("failed to update service")
	}

	// Reload to get updated entity
	updatedService, err := s.repo.GetServiceByID(id)
	if err != nil {
		return nil, errors.New("failed to retrieve updated service")
	}
	if updatedService == nil {
		return nil, errors.New("service not found after update")
	}

	dto := serviceModels.NewServiceDtoFromEntity(*updatedService)
	return &dto, nil
}

func (s *Service) DeleteService(id uint, userID uint) error {
	service, err := s.repo.GetServiceByID(id)
	if err != nil {
		return errors.New("failed to get service")
	}
	if service == nil {
		return errors.New("service not found")
	}

	// Check if user has write access to services for this business
	hasAccess, err := s.hasServiceAccess(service.BusinessID, userID, constants.Write)
	if err != nil {
		return err
	}
	if !hasAccess {
		return errors.New("unauthorized")
	}

	if err := s.repo.DeleteService(id); err != nil {
		return errors.New("failed to delete service")
	}

	return nil
}

