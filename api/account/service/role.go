package service

import (
	"VersatilePOS/account/models"
	"VersatilePOS/database/entities"
	"VersatilePOS/generic/constants"
	"VersatilePOS/generic/rbac"
	"errors"
	"github.com/lib/pq"
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

	return s.GetRole(role.ID, claims)
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

	// delegate DTO construction to repository to avoid duplication
	dto, err := s.roleRepo.GetRoleDtoByID(role.ID)
	if err != nil {
		return models.AccountRoleDto{}, errors.New("failed to build role dto")
	}

	return dto, nil
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

	return s.GetRole(role.ID, claims)
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

// CreateRoleWithFunctions creates a role for a business, optionally links
// an account to that role and assigns the provided actions as functions.
// `als` must be provided when `funcs` is non-empty.
func (s *Service) CreateRoleWithFunctions(roleName string, businessID uint, funcs []constants.Action, als []constants.AccessLevel, linkAccountID *uint) (*entities.AccountRole, error) {
	role := &entities.AccountRole{
		Name:       roleName,
		BusinessID: businessID,
	}

	if err := s.roleRepo.CreateRole(role); err != nil {
		return nil, err
	}

	if linkAccountID != nil {
		roleLink := &entities.AccountRoleLink{
			AccountID:     *linkAccountID,
			AccountRoleID: role.ID,
		}
		if err := s.roleRepo.CreateAccountRoleLink(roleLink); err != nil {
			return nil, err
		}
	}

	if len(funcs) > 0 {
		functionsToAssign := make(map[constants.Action]bool)
		for _, a := range funcs {
			functionsToAssign[a] = true
		}

		allFuncs, err := s.functionRepo.GetAllFunctions()
		if err != nil {
			return nil, err
		}

		if len(als) == 0 {
			return nil, errors.New("access levels must be provided when assigning functions")
		}

		alsArr := make(pq.StringArray, len(als))
		for i, v := range als {
			alsArr[i] = string(v)
		}

		for _, fn := range allFuncs {
			if functionsToAssign[fn.Action] {
				link := &entities.AccountRoleFunctionLink{
					AccountRoleID: role.ID,
					FunctionID:    fn.ID,
					AccessLevels:  alsArr,
				}
				if err := s.functionRepo.AssignFunctionToRole(link); err != nil {
					return nil, err
				}
			}
		}
	}

	return role, nil
}
