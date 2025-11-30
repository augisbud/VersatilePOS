package service

import (
	accountModels "VersatilePOS/account/models"
	accountRepository "VersatilePOS/account/repository"
	businessRepository "VersatilePOS/business/repository"
	"VersatilePOS/database/entities"
	"VersatilePOS/generic/constants"
	"VersatilePOS/generic/rbac"
	"VersatilePOS/middleware"
	"errors"
	"strconv"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type Service struct {
	accountRepo  *accountRepository.Repository
	businessRepo *businessRepository.Repository
	roleRepo     *accountRepository.RoleRepository
	functionRepo *accountRepository.FunctionRepository
}

func NewService() *Service {
	return &Service{
		accountRepo:  &accountRepository.Repository{},
		businessRepo: &businessRepository.Repository{},
		roleRepo:     &accountRepository.RoleRepository{},
		functionRepo: &accountRepository.FunctionRepository{},
	}
}

func (s *Service) CreateAccount(req accountModels.CreateAccountRequest, claims map[string]interface{}) (accountModels.AccountDto, error) {
	if req.BusinessID != 0 {
		if claims == nil {
			return accountModels.AccountDto{}, errors.New("unauthorized")
		}

		userID := uint(claims["id"].(float64))

		ok, err := rbac.HasAccess(constants.Accounts, constants.Write, req.BusinessID, userID)
		if err != nil {
			return accountModels.AccountDto{}, errors.New("failed to verify permissions")
		}
		if !ok {
			return accountModels.AccountDto{}, errors.New("unauthorized")
		}
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return accountModels.AccountDto{}, errors.New("failed to hash password")
	}

	account := entities.Account{
		Name:         req.Name,
		Username:     req.Username,
		PasswordHash: string(passwordHash),
	}

	if err := s.accountRepo.CreateAccount(&account); err != nil {
		return accountModels.AccountDto{}, errors.New("internal server error")
	}

	if req.BusinessID != 0 {
		business, err := s.businessRepo.GetBusinessByID(req.BusinessID)
		if err != nil {
			return accountModels.AccountDto{}, errors.New("failed to get business")
		}
		if business == nil {
			return accountModels.AccountDto{}, errors.New("business not found")
		}
		if err := s.accountRepo.AddEmployeeToBusiness(&account, business); err != nil {
			return accountModels.AccountDto{}, err
		}
	}

	response := accountModels.AccountDto{
		ID:       account.ID,
		Name:     account.Name,
		Username: account.Username,
	}

	if len(account.MemberOf) > 0 {
		response.BusinessId = &account.MemberOf[0].ID
	}

	return response, nil
}

func (s *Service) Login(req accountModels.LoginRequest) (string, error) {
	account, err := s.accountRepo.GetAccountByUsername(req.Username)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return "", errors.New("invalid credentials")
		}
		return "", errors.New("internal server error")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(account.PasswordHash), []byte(req.Password)); err != nil {
		return "", errors.New("invalid credentials")
	}

	tokenString, err := middleware.GenerateToken(account.Username, account.ID)
	if err != nil {
		return "", errors.New("failed to generate token")
	}

	return tokenString, nil
}

func (s *Service) GetMyAccount(userID uint) (accountModels.AccountDto, error) {
	account, err := s.accountRepo.GetAccountByID(userID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return accountModels.AccountDto{}, errors.New("account not found")
		}
		return accountModels.AccountDto{}, errors.New("internal server error")
	}

	roleLinks := make([]accountModels.AccountRoleLinkDto, len(account.AccountRoleLinks))
	for i, link := range account.AccountRoleLinks {
		roleLinks[i] = accountModels.AccountRoleLinkDto{
			ID:     link.ID,
			Status: link.Status,
			Role: accountModels.AccountRoleDto{
				ID:         link.AccountRole.ID,
				Name:       link.AccountRole.Name,
				BusinessId: &link.AccountRole.BusinessID,
			},
		}
	}

	response := accountModels.AccountDto{
		ID:               account.ID,
		Name:             account.Name,
		Username:         account.Username,
		AccountRoleLinks: roleLinks,
	}

	if len(account.MemberOf) > 0 {
		response.BusinessId = &account.MemberOf[0].ID
	}

	return response, nil
}

func (s *Service) GetAccounts(businessID uint, requestingUserID uint) ([]accountModels.AccountDto, error) {
	// RBAC check: must have read access to accounts for this business
	ok, err := rbac.HasAccess(constants.Accounts, constants.Read, businessID, requestingUserID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to view accounts for this business")
	}

	business, err := s.businessRepo.GetBusinessByID(businessID)
	if err != nil {
		return nil, errors.New("failed to get business")
	}
	if business == nil {
		return nil, errors.New("business not found")
	}

	accounts, err := s.accountRepo.GetBusinessEmployees(business)
	if err != nil {
		return nil, errors.New("failed to get accounts")
	}

	accountDtos := make([]accountModels.AccountDto, 0)
	for _, acc := range accounts {
		roleLinks := make([]accountModels.AccountRoleLinkDto, len(acc.AccountRoleLinks))
		for i, link := range acc.AccountRoleLinks {
			roleLinks[i] = accountModels.AccountRoleLinkDto{
				ID:     link.ID,
				Status: link.Status,
				Role: accountModels.AccountRoleDto{
					ID:         link.AccountRole.ID,
					Name:       link.AccountRole.Name,
					BusinessId: &link.AccountRole.BusinessID,
				},
			}
		}
		dto := accountModels.AccountDto{
			ID:               acc.ID,
			Name:             acc.Name,
			Username:         acc.Username,
			AccountRoleLinks: roleLinks,
		}
		if len(acc.MemberOf) > 0 {
			dto.BusinessId = &acc.MemberOf[0].ID
		}
		accountDtos = append(accountDtos, dto)
	}

	return accountDtos, nil
}

func (s *Service) DeleteAccount(id string, requestingUserID uint) error {
	targetAccountID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		return errors.New("invalid account ID")
	}

	if uint(targetAccountID) == requestingUserID {
		return errors.New("you cannot delete your own account")
	}

	targetAccount, err := s.accountRepo.GetAccountByID(uint(targetAccountID))
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return errors.New("account not found")
		}
		return errors.New("internal server error")
	}

	// find the shared business between requesting user (owner) and target
	requestingUserAccount, err := s.accountRepo.GetUserWithAssociations(requestingUserID)
	if err != nil {
		return errors.New("could not retrieve requesting user's account")
	}

	var businessToDeleteFrom *entities.Business
	for i := range requestingUserAccount.OwnedBusinesses {
		ownedBusiness := requestingUserAccount.OwnedBusinesses[i]
		for _, membership := range targetAccount.MemberOf {
			if membership.ID == ownedBusiness.ID {
				businessToDeleteFrom = &ownedBusiness
				break
			}
		}
		if businessToDeleteFrom != nil {
			break
		}
	}

	if businessToDeleteFrom == nil {
		return errors.New("you can only delete employees of your own business")
	}

	// RBAC: require write access to accounts in the business
	ok, err := rbac.HasAccess(constants.Accounts, constants.Write, businessToDeleteFrom.ID, requestingUserID)
	if err != nil {
		return errors.New("failed to verify permissions")
	}
	if !ok {
		return errors.New("unauthorized")
	}

	if err := s.accountRepo.DissociateEmployeeFromBusiness(&targetAccount, businessToDeleteFrom); err != nil {
		return errors.New("failed to dissociate employee from business")
	}

	if err := s.accountRepo.DeleteAccount(&targetAccount); err != nil {
		return errors.New("failed to delete account")
	}

	return nil
}

func (s *Service) AssignRoleToAccount(accountID uint, req accountModels.AssignRoleRequest, claims map[string]interface{}) (accountModels.AccountRoleLinkDto, error) {
	requestingUserID := uint(claims["id"].(float64))

	targetAccount, err := s.accountRepo.GetAccountByID(accountID)
	if err != nil {
		return accountModels.AccountRoleLinkDto{}, errors.New("account not found")
	}

	role, err := s.roleRepo.GetRoleByID(req.RoleID)
	if err != nil {
		return accountModels.AccountRoleLinkDto{}, errors.New("role not found")
	}

	// RBAC: require write access to roles in the role's business
	ok, err := rbac.HasAccess(constants.Roles, constants.Write, role.BusinessID, requestingUserID)
	if err != nil {
		return accountModels.AccountRoleLinkDto{}, errors.New("failed to verify permissions")
	}
	if !ok {
		return accountModels.AccountRoleLinkDto{}, errors.New("unauthorized to assign this role")
	}

	isEmployee := false
	for _, business := range targetAccount.MemberOf {
		if business.ID == role.BusinessID {
			isEmployee = true
			break
		}
	}
	if !isEmployee {
		return accountModels.AccountRoleLinkDto{}, errors.New("account is not a member of the business")
	}

	link := &entities.AccountRoleLink{
		AccountID:     accountID,
		AccountRoleID: req.RoleID,
	}

	if err := s.roleRepo.CreateAccountRoleLink(link); err != nil {
		return accountModels.AccountRoleLinkDto{}, errors.New("failed to assign role")
	}

	return accountModels.AccountRoleLinkDto{
		ID:     link.ID,
		Status: link.Status,
		Role: accountModels.AccountRoleDto{
			ID:         role.ID,
			Name:       role.Name,
			BusinessId: &role.BusinessID,
		},
	}, nil
}

func (s *Service) UpdateAccountRoleLinkStatus(accountID, roleID uint, req accountModels.UpdateAccountRoleLinkRequest, claims map[string]interface{}) (accountModels.AccountRoleLinkDto, error) {
	requestingUserID := uint(claims["id"].(float64))

	link, err := s.roleRepo.GetAccountRoleLink(accountID, roleID)
	if err != nil {
		return accountModels.AccountRoleLinkDto{}, errors.New("role assignment not found")
	}

	// RBAC: require write access to roles in the business
	ok, err := rbac.HasAccess(constants.Roles, constants.Write, link.AccountRole.BusinessID, requestingUserID)
	if err != nil {
		return accountModels.AccountRoleLinkDto{}, errors.New("failed to verify permissions")
	}
	if !ok {
		return accountModels.AccountRoleLinkDto{}, errors.New("unauthorized to update this role assignment")
	}

	link.Status = req.Status
	if err := s.roleRepo.UpdateAccountRoleLink(link); err != nil {
		return accountModels.AccountRoleLinkDto{}, errors.New("failed to update role assignment")
	}

	return accountModels.AccountRoleLinkDto{
		ID:     link.ID,
		Status: link.Status,
		Role: accountModels.AccountRoleDto{
			ID:         link.AccountRole.ID,
			Name:       link.AccountRole.Name,
			BusinessId: &link.AccountRole.BusinessID,
		},
	}, nil
}
