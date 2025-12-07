package service

import (
	accountRepository "VersatilePOS/account/repository"
	"VersatilePOS/database/entities"
	"VersatilePOS/generic/constants"
	"VersatilePOS/generic/rbac"
	serviceModels "VersatilePOS/service/models"
	"VersatilePOS/service/repository"
	"errors"
	"time"

	"gorm.io/gorm"
)

type Service struct {
	repo        repository.Repository
	accountRepo accountRepository.Repository
}

func NewService() *Service {
	return &Service{
		repo:        repository.Repository{},
		accountRepo: accountRepository.Repository{},
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

	// Parse time strings (hh:mm format) to time.Time with a reference date
	referenceDate := "2000-01-01"
	startTime, err := time.Parse("2006-01-02 15:04", referenceDate+" "+req.ProvisioningStartTime)
	if err != nil {
		return nil, errors.New("invalid provisioningStartTime format, expected hh:mm")
	}
	endTime, err := time.Parse("2006-01-02 15:04", referenceDate+" "+req.ProvisioningEndTime)
	if err != nil {
		return nil, errors.New("invalid provisioningEndTime format, expected hh:mm")
	}

	service := &entities.Service{
		BusinessID:           req.BusinessID,
		Name:                 req.Name,
		HourlyPrice:          req.HourlyPrice,
		ServiceCharge:       req.ServiceCharge,
		ProvisioningStartTime: startTime,
		ProvisioningEndTime:   endTime,
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
		referenceDate := "2000-01-01"
		startTime, err := time.Parse("2006-01-02 15:04", referenceDate+" "+*req.ProvisioningStartTime)
		if err != nil {
			return nil, errors.New("invalid provisioningStartTime format, expected hh:mm")
		}
		service.ProvisioningStartTime = startTime
	}
	if req.ProvisioningEndTime != nil {
		referenceDate := "2000-01-01"
		endTime, err := time.Parse("2006-01-02 15:04", referenceDate+" "+*req.ProvisioningEndTime)
		if err != nil {
			return nil, errors.New("invalid provisioningEndTime format, expected hh:mm")
		}
		service.ProvisioningEndTime = endTime
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

func (s *Service) AssignServiceToEmployee(employeeID uint, req serviceModels.AssignServiceRequest, userID uint) error {
	// Get the service
	service, err := s.repo.GetServiceByID(req.ServiceID)
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

	// Get the employee account
	employee, err := s.accountRepo.GetAccountByID(employeeID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return errors.New("employee not found")
		}
		return errors.New("failed to get employee")
	}

	// Verify that the employee belongs to the same business as the service
	isEmployee := false
	for _, business := range employee.MemberOf {
		if business.ID == service.BusinessID {
			isEmployee = true
			break
		}
	}
	if !isEmployee {
		return errors.New("employee does not belong to the service's business")
	}

	// Assign the service to the employee
	if err := s.repo.AssignServiceToEmployee(service, &employee); err != nil {
		return errors.New("failed to assign service to employee")
	}

	return nil
}

func (s *Service) RemoveServiceFromEmployee(employeeID uint, serviceID uint, userID uint) error {
	// Get the service
	service, err := s.repo.GetServiceByID(serviceID)
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

	// Get the employee account
	employee, err := s.accountRepo.GetAccountByID(employeeID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return errors.New("employee not found")
		}
		return errors.New("failed to get employee")
	}

	// Remove the service from the employee
	if err := s.repo.RemoveServiceFromEmployee(service, &employee); err != nil {
		return errors.New("failed to remove service from employee")
	}

	return nil
}

