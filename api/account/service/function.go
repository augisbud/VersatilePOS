package service

import (
	"VersatilePOS/account/models"
	"VersatilePOS/database/entities"
	"VersatilePOS/generic/constants"
	"VersatilePOS/generic/rbac"
	"errors"

	"github.com/lib/pq"
)

func (s *Service) GetAllFunctions(claims map[string]interface{}) ([]models.FunctionDto, error) {
	if claims == nil {
		return nil, errors.New("unauthorized")
	}

	userID := uint(claims["id"].(float64))

	// Require the user to have Roles:Read in at least one business the user belongs to.
	// Use the account repo to gather businesses the user owns/is a member of and any roles assigned.
	account, err := s.accountRepo.GetAccountByID(userID)
	if err != nil {
		return nil, errors.New("failed to retrieve user account")
	}

	// collect candidate business IDs from OwnedBusinesses, MemberOf and assigned roles
	var bizIDs []uint
	for _, b := range account.OwnedBusinesses {
		bizIDs = append(bizIDs, b.ID)
	}
	for _, b := range account.MemberOf {
		bizIDs = append(bizIDs, b.ID)
	}
	for _, rl := range account.AccountRoleLinks {
		bizIDs = append(bizIDs, rl.AccountRole.BusinessID)
	}

	allowed := false
	for _, id := range bizIDs {
		ok, err := rbac.HasAccess(constants.Roles, constants.Read, id, userID)
		if err != nil {
			return nil, errors.New("failed to verify permissions")
		}
		if ok {
			allowed = true
			break
		}
	}

	if !allowed {
		return nil, errors.New("unauthorized to view functions")
	}

	functions, err := s.functionRepo.GetAllFunctions()
	if err != nil {
		return nil, errors.New("failed to retrieve functions")
	}

	functionDtos := make([]models.FunctionDto, len(functions))
	for i, f := range functions {
		functionDtos[i] = models.FunctionDto{
			ID:          f.ID,
			Name:        f.Name,
			Action:      f.Action,
			Description: f.Description,
		}
	}

	return functionDtos, nil
}

func (s *Service) AssignFunctionToRole(roleID uint, req models.AssignFunctionRequest, claims map[string]interface{}) error {
	if claims == nil {
		return errors.New("unauthorized")
	}

	userID := uint(claims["id"].(float64))

	role, err := s.roleRepo.GetRoleByID(roleID)
	if err != nil {
		return errors.New("role not found")
	}

	ok, err := rbac.HasAccess(constants.Roles, constants.Write, role.BusinessID, userID)
	if err != nil {
		return errors.New("failed to verify permissions")
	}
	if !ok {
		return errors.New("unauthorized")
	}

	function, err := s.functionRepo.GetFunctionByID(req.FunctionID)
	if err != nil {
		return errors.New("function not found")
	}

	// convert []constants.AccessLevel -> pq.StringArray for DB storage
	var als pq.StringArray
	for _, a := range req.AccessLevels {
		als = append(als, string(a))
	}

	link := &entities.AccountRoleFunctionLink{
		AccountRoleID: role.ID,
		FunctionID:    function.ID,
		AccessLevels:  als,
	}

	return s.functionRepo.AssignFunctionToRole(link)
}

func (s *Service) GetFunctionsByRoleID(roleID uint, claims map[string]interface{}) ([]models.AccountRoleFunctionLinkDto, error) {
	if claims == nil {
		return nil, errors.New("unauthorized")
	}

	userID := uint(claims["id"].(float64))

	role, err := s.roleRepo.GetRoleByID(roleID)
	if err != nil {
		return nil, errors.New("role not found")
	}

	ok, err := rbac.HasAccess(constants.Roles, constants.Read, role.BusinessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized")
	}

	links, err := s.functionRepo.GetFunctionsByRoleID(roleID)
	if err != nil {
		return nil, errors.New("failed to retrieve functions for role")
	}

	dtos := make([]models.AccountRoleFunctionLinkDto, len(links))
	for i, link := range links {
		// convert DB string array -> []constants.AccessLevel
		conv := make([]constants.AccessLevel, len(link.AccessLevels))
		for j, v := range link.AccessLevels {
			conv[j] = constants.AccessLevel(v)
		}

		dtos[i] = models.AccountRoleFunctionLinkDto{
			ID:           link.ID,
			AccessLevels: conv,
			Function: models.FunctionDto{
				ID:          link.Function.ID,
				Name:        link.Function.Name,
				Action:      link.Function.Action,
				Description: link.Function.Description,
			},
		}
	}

	return dtos, nil
}
