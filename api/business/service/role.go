package service

import (
	accountModels "VersatilePOS/account/models"
)

func (s *Service) GetBusinessRoles(businessID uint, userID uint) ([]accountModels.AccountRoleDto, error) {
	_, err := s.GetBusiness(businessID, userID)
	if err != nil {
		return nil, err
	}

	roles, err := s.repo.GetBusinessRoles(businessID)
	if err != nil {
		return nil, err
	}

	var roleDtos []accountModels.AccountRoleDto
	for _, role := range roles {
		roleDtos = append(roleDtos, accountModels.AccountRoleDto{
			ID:   role.ID,
			Name: role.Name,
		})
	}

	return roleDtos, nil
}
