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
		// load function links for this role
		functionRepo := &accountRepository.FunctionRepository{}
		funcLinks, _ := functionRepo.GetFunctionsByRoleID(role.ID)
		fr := make([]accountModels.AccountRoleFunctionLinkDto, 0, len(funcLinks))
		for _, fl := range funcLinks {
			// convert DB string array -> []constants.AccessLevel
			conv := make([]constants.AccessLevel, len(fl.AccessLevels))
			for j, v := range fl.AccessLevels {
				conv[j] = constants.AccessLevel(v)
			}
			fr = append(fr, accountModels.AccountRoleFunctionLinkDto{
				ID:           fl.ID,
				AccessLevels: conv,
				Function: accountModels.FunctionDto{
					ID:          fl.Function.ID,
					Name:        fl.Function.Name,
					Action:      fl.Function.Action,
					Description: fl.Function.Description,
				},
			})
		}

		roleDtos = append(roleDtos, accountModels.AccountRoleDto{
			ID:            role.ID,
			Name:          role.Name,
			BusinessId:    &role.BusinessID,
			FunctionLinks: fr,
		})
	}

	return roleDtos, nil
}
