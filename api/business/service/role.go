package service

import (
	accountModels "VersatilePOS/account/models"
	accountRepository "VersatilePOS/account/repository"
	"VersatilePOS/generic/constants"
	"VersatilePOS/generic/rbac"
	"errors"
)

func (s *Service) GetBusinessRoles(businessID uint, userID uint) ([]accountModels.AccountRoleDto, error) {
	// Ensure the user has read access to the business resource
	ok, err := rbac.HasAccess(constants.Businesses, constants.Read, businessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify business read permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to view this business")
	}

	// Ensure the user has read access to roles in the business as well
	ok, err = rbac.HasAccess(constants.Roles, constants.Read, businessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify role read permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to view roles for this business")
	}

	roles, err := s.repo.GetBusinessRoles(businessID)
	if err != nil {
		return nil, err
	}

	var roleDtos []accountModels.AccountRoleDto
	for _, role := range roles {
		// delegate DTO construction to account role repository to avoid duplication
		roleRepo := &accountRepository.RoleRepository{}
		dto, err := roleRepo.GetRoleDtoByID(role.ID)
		if err != nil {
			return nil, err
		}

		roleDtos = append(roleDtos, dto)
	}

	return roleDtos, nil
}
