package service

import (
	"VersatilePOS/account/models"
	"VersatilePOS/database/entities"
	"VersatilePOS/generic/constants"
	"VersatilePOS/generic/rbac"
	"errors"
)

func (s *Service) CreateAccountRole(req models.CreateAccountRoleRequest, claims map[string]interface{}) (models.AccountRoleDto, error) {
	if claims == nil {
		return models.AccountRoleDto{}, errors.New("unauthorized")
	}

	userID := uint(claims["id"].(float64))

	ok, err := rbac.HasAccess(constants.Roles, constants.Write, req.BusinessID, userID)
	if err != nil {
		return models.AccountRoleDto{}, errors.New("failed to verify permissions")
	}
	if !ok {
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
		ID:         role.ID,
		Name:       role.Name,
		BusinessId: &role.BusinessID,
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
	ok, err := rbac.HasAccess(constants.Roles, constants.Read, role.BusinessID, userID)
	if err != nil {
		return models.AccountRoleDto{}, errors.New("failed to verify permissions")
	}
	if !ok {
		return models.AccountRoleDto{}, errors.New("unauthorized")
	}

	return models.AccountRoleDto{
		ID:         role.ID,
		Name:       role.Name,
		BusinessId: &role.BusinessID,
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
	ok, err := rbac.HasAccess(constants.Roles, constants.Write, role.BusinessID, userID)
	if err != nil {
		return models.AccountRoleDto{}, errors.New("failed to verify permissions")
	}
	if !ok {
		return models.AccountRoleDto{}, errors.New("unauthorized")
	}

	role.Name = req.Name

	if err := s.roleRepo.UpdateRole(role); err != nil {
		return models.AccountRoleDto{}, errors.New("failed to update role")
	}

	return models.AccountRoleDto{
		ID:         role.ID,
		Name:       role.Name,
		BusinessId: &role.BusinessID,
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
	ok, err := rbac.HasAccess(constants.Roles, constants.Write, role.BusinessID, userID)
	if err != nil {
		return errors.New("failed to verify permissions")
	}
	if !ok {
		return errors.New("unauthorized")
	}

	return s.roleRepo.DeleteRole(role)
}
