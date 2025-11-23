package service

import (
	"VersatilePOS/account/models"
	"VersatilePOS/database/entities"
	"errors"
)

func (s *Service) CreateAccountRole(req models.CreateAccountRoleRequest, claims map[string]interface{}) (models.AccountRoleDto, error) {
	if claims == nil {
		return models.AccountRoleDto{}, errors.New("unauthorized")
	}

	userID := uint(claims["id"].(float64))

	business, err := s.businessRepo.GetBusinessByID(req.BusinessID)
	if err != nil {
		return models.AccountRoleDto{}, errors.New("failed to verify business ownership")
	}
	if business == nil {
		return models.AccountRoleDto{}, errors.New("business not found")
	}

	if business.OwnerID != userID {
		return models.AccountRoleDto{}, errors.New("only the business owner can create roles")
	}

	role := entities.AccountRole{
		Name:       req.Name,
		BusinessID: req.BusinessID,
	}

	if err := s.roleRepo.CreateRole(&role); err != nil {
		return models.AccountRoleDto{}, errors.New("failed to create account role")
	}

	return models.AccountRoleDto{
		ID:   role.ID,
		Name: role.Name,
	}, nil
}

func (s *Service) GetRole(roleID uint, claims map[string]interface{}) (models.AccountRoleDto, error) {
	if claims == nil {
		return models.AccountRoleDto{}, errors.New("unauthorized")
	}

	role, err := s.roleRepo.GetRoleByID(roleID)
	if err != nil {
		return models.AccountRoleDto{}, errors.New("role not found")
	}

	userID := uint(claims["id"].(float64))
	business, err := s.businessRepo.GetBusinessByID(role.BusinessID)
	if err != nil || business.OwnerID != userID {
		return models.AccountRoleDto{}, errors.New("unauthorized")
	}

	return models.AccountRoleDto{
		ID:   role.ID,
		Name: role.Name,
	}, nil
}

func (s *Service) UpdateRole(roleID uint, req models.UpdateAccountRoleRequest, claims map[string]interface{}) (models.AccountRoleDto, error) {
	if claims == nil {
		return models.AccountRoleDto{}, errors.New("unauthorized")
	}

	role, err := s.roleRepo.GetRoleByID(roleID)
	if err != nil {
		return models.AccountRoleDto{}, errors.New("role not found")
	}

	userID := uint(claims["id"].(float64))
	business, err := s.businessRepo.GetBusinessByID(role.BusinessID)
	if err != nil || business.OwnerID != userID {
		return models.AccountRoleDto{}, errors.New("unauthorized")
	}

	role.Name = req.Name

	if err := s.roleRepo.UpdateRole(role); err != nil {
		return models.AccountRoleDto{}, errors.New("failed to update role")
	}

	return models.AccountRoleDto{
		ID:   role.ID,
		Name: role.Name,
	}, nil
}

func (s *Service) DeleteRole(roleID uint, claims map[string]interface{}) error {
	if claims == nil {
		return errors.New("unauthorized")
	}

	role, err := s.roleRepo.GetRoleByID(roleID)
	if err != nil {
		return errors.New("role not found")
	}

	userID := uint(claims["id"].(float64))
	business, err := s.businessRepo.GetBusinessByID(role.BusinessID)
	if err != nil || business.OwnerID != userID {
		return errors.New("unauthorized")
	}

	return s.roleRepo.DeleteRole(role)
}
