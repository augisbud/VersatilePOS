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

		// Assign the default "Employee" role for this business to the new account.
		// The business creation process should have created an "Employee" role already.
		employeeRole, err := s.roleRepo.GetRoleByBusinessAndName(req.BusinessID, "Employee")
		if err != nil {
			return accountModels.AccountDto{}, errors.New("failed to find employee role for business")
		}

		// Reuse centralized AssignRoleToAccount which enforces RBAC and membership checks
		assignReq := accountModels.AssignRoleRequest{RoleID: employeeRole.ID}
		assignedLink, err := s.AssignRoleToAccount(account.ID, assignReq, claims)
		if err != nil {
			return accountModels.AccountDto{}, errors.New("failed to assign employee role to account: " + err.Error())
		}

		roleLinks := []accountModels.AccountRoleLinkDto{assignedLink}
		response := accountModels.NewAccountDtoFromEntity(account, roleLinks)
		response.BusinessId = &req.BusinessID

		return response, nil
	}

	response := accountModels.NewAccountDtoFromEntity(account, nil)

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
		roleDto, _ := s.roleRepo.GetRoleDtoByID(link.AccountRole.ID)
		roleLinks[i] = accountModels.NewAccountRoleLinkDtoFromEntity(link, roleDto)
	}

	response := accountModels.NewAccountDtoFromEntity(account, roleLinks)
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
			roleDto, _ := s.roleRepo.GetRoleDtoByID(link.AccountRole.ID)
			roleLinks[i] = accountModels.NewAccountRoleLinkDtoFromEntity(link, roleDto)
		}
		dto := accountModels.NewAccountDtoFromEntity(acc, roleLinks)
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

	// allow deletion if requesting user has write access to any business the target belongs to
	var businessToDeleteFrom *entities.Business
	for i := range targetAccount.MemberOf {
		biz := targetAccount.MemberOf[i]
		ok, err := rbac.HasAccess(constants.Accounts, constants.Write, biz.ID, requestingUserID)
		if err != nil {
			return errors.New("failed to verify permissions")
		}
		if ok {
			businessToDeleteFrom = &biz
			break
		}
	}

	if businessToDeleteFrom == nil {
		return errors.New("you are not authorized to delete this account")
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

	// delegate role DTO construction to repository
	roleDto, _ := s.roleRepo.GetRoleDtoByID(role.ID)

	return accountModels.NewAccountRoleLinkDtoFromEntity(*link, roleDto), nil
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

	// delegate role DTO construction to repository
	roleDto, _ := s.roleRepo.GetRoleDtoByID(link.AccountRole.ID)

	return accountModels.NewAccountRoleLinkDtoFromEntity(*link, roleDto), nil
}

func GetBusinessIDsFromAccount(accountID uint) ([]uint, error) {
	repo := accountRepository.Repository{}
	account, err := repo.GetAccountByID(accountID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("account not found")
		}
		return nil, errors.New("failed to get account")
	}

	businessIDMap := make(map[uint]bool)
	for _, accountRoleLink := range account.AccountRoleLinks {
		businessIDMap[accountRoleLink.AccountRole.BusinessID] = true
	}

	var businessIDs []uint
	for businessID := range businessIDMap {
		businessIDs = append(businessIDs, businessID)
	}

	return businessIDs, nil
}
