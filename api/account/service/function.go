package service

import (
	"VersatilePOS/account/models"
	"VersatilePOS/database/entities"
	"errors"
)

func (s *Service) GetAllFunctions(claims map[string]interface{}) ([]models.FunctionDto, error) {
	if claims == nil {
		return nil, errors.New("unauthorized")
	}

	userID := uint(claims["id"].(float64))

	businesses, err := s.businessRepo.GetBusinessesByOwnerID(userID)
	if err != nil {
		return nil, errors.New("failed to verify business ownership")
	}

	if len(businesses) == 0 {
		return nil, errors.New("only business owners can view functions")
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

	business, err := s.businessRepo.GetBusinessByID(role.BusinessID)
	if err != nil || business.OwnerID != userID {
		return errors.New("unauthorized")
	}

	function, err := s.functionRepo.GetFunctionByID(req.FunctionID)
	if err != nil {
		return errors.New("function not found")
	}

	link := &entities.AccountRoleFunctionLink{
		AccountRoleID: role.ID,
		FunctionID:    function.ID,
		AccessLevel:   req.AccessLevel,
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

	business, err := s.businessRepo.GetBusinessByID(role.BusinessID)
	if err != nil {
		return nil, errors.New("failed to verify business ownership")
	}

	isOwner := business.OwnerID == userID

	userAccount, err := s.businessRepo.GetAccountWithMemberships(userID)
	if err != nil {
		return nil, errors.New("failed to get user account details")
	}

	isEmployee := false
	if userAccount != nil {
		for _, b := range userAccount.MemberOf {
			if b.ID == business.ID {
				isEmployee = true
				break
			}
		}
	}

	if !isOwner && !isEmployee {
		return nil, errors.New("unauthorized")
	}

	links, err := s.functionRepo.GetFunctionsByRoleID(roleID)
	if err != nil {
		return nil, errors.New("failed to retrieve functions for role")
	}

	dtos := make([]models.AccountRoleFunctionLinkDto, len(links))
	for i, link := range links {
		dtos[i] = models.AccountRoleFunctionLinkDto{
			ID:          link.ID,
			AccessLevel: link.AccessLevel,
			Function: models.FunctionDto{
				ID:          link.Function.ID,
				Name:        link.Function.Name,
				Description: link.Function.Description,
			},
		}
	}

	return dtos, nil
}
