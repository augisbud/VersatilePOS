package service

import (
	"VersatilePOS/database/entities"
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

func (s *Service) CreateService(req serviceModels.CreateServiceRequest) (*serviceModels.ServiceDto, error) {
	service := &entities.Service{
		BusinessID:    req.BusinessID,
		Name:          req.Name,
		HourlyPrice:   req.HourlyPrice,
		ServiceCharge: req.ServiceCharge,
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

func (s *Service) GetServices() ([]serviceModels.ServiceDto, error) {
	services, err := s.repo.GetServices()
	if err != nil {
		return nil, errors.New("failed to get services")
	}

	var serviceDtos []serviceModels.ServiceDto
	for _, service := range services {
		serviceDtos = append(serviceDtos, serviceModels.NewServiceDtoFromEntity(service))
	}

	return serviceDtos, nil
}

func (s *Service) GetServiceByID(id uint) (*serviceModels.ServiceDto, error) {
	service, err := s.repo.GetServiceByID(id)
	if err != nil {
		return nil, errors.New("failed to get service")
	}
	if service == nil {
		return nil, errors.New("service not found")
	}

	dto := serviceModels.NewServiceDtoFromEntity(*service)
	return &dto, nil
}

func (s *Service) UpdateService(id uint, req serviceModels.UpdateServiceRequest) (*serviceModels.ServiceDto, error) {
	service, err := s.repo.GetServiceByID(id)
	if err != nil {
		return nil, errors.New("failed to get service")
	}
	if service == nil {
		return nil, errors.New("service not found")
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

func (s *Service) DeleteService(id uint) error {
	service, err := s.repo.GetServiceByID(id)
	if err != nil {
		return errors.New("failed to get service")
	}
	if service == nil {
		return errors.New("service not found")
	}

	if err := s.repo.DeleteService(id); err != nil {
		return errors.New("failed to delete service")
	}

	return nil
}

