package service

import (
	accountModels "VersatilePOS/account/models"
	accountRepository "VersatilePOS/account/repository"
	businessRepository "VersatilePOS/business/repository"
	"VersatilePOS/database/entities"
	"VersatilePOS/middleware"
	"errors"
	"strconv"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type Service struct {
	accountRepo  *accountRepository.Repository
	businessRepo *businessRepository.Repository
}

func NewService() *Service {
	return &Service{
		accountRepo:  &accountRepository.Repository{},
		businessRepo: &businessRepository.Repository{},
	}
}

func (s *Service) CreateAccount(req accountModels.CreateAccountRequest, claims map[string]interface{}) (accountModels.AccountDto, error) {
	if req.BusinessID != 0 {
		if claims == nil {
			return accountModels.AccountDto{}, errors.New("unauthorized")
		}

		userID := uint(claims["id"].(float64))

		business, err := s.businessRepo.GetBusinessByID(req.BusinessID)
		if err != nil {
			return accountModels.AccountDto{}, errors.New("failed to verify business ownership")
		}
		if business == nil {
			return accountModels.AccountDto{}, errors.New("business not found")
		}

		if business.OwnerID != userID {
			return accountModels.AccountDto{}, errors.New("only the business owner can add employees")
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

func (s *Service) GetAccounts(businessID uint, requestingUserID uint) ([]accountModels.AccountDto, error) {
	business, err := s.businessRepo.GetBusinessByID(businessID)
	if err != nil {
		return nil, errors.New("failed to get business")
	}
	if business == nil {
		return nil, errors.New("business not found")
	}

	isOwner := business.OwnerID == requestingUserID

	userAccount, err := s.businessRepo.GetAccountWithMemberships(requestingUserID)
	if err != nil {
		return nil, errors.New("failed to get user account details")
	}

	isEmployee := false
	if userAccount != nil {
		for _, b := range userAccount.MemberOf {
			if b.ID == businessID {
				isEmployee = true
				break
			}
		}
	}

	if !isOwner && !isEmployee {
		return nil, errors.New("unauthorized to view accounts for this business")
	}

	accounts, err := s.accountRepo.GetBusinessEmployees(business)
	if err != nil {
		return nil, errors.New("failed to get accounts")
	}

	accountDtos := make([]accountModels.AccountDto, 0)
	for _, acc := range accounts {
		dto := accountModels.AccountDto{
			ID:       acc.ID,
			Name:     acc.Name,
			Username: acc.Username,
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

	requestingUserAccount, err := s.accountRepo.GetUserWithAssociations(requestingUserID)
	if err != nil {
		return errors.New("could not retrieve requesting user's account")
	}

	if len(requestingUserAccount.OwnedBusinesses) == 0 {
		return errors.New("only business owners can delete accounts")
	}

	targetAccount, err := s.accountRepo.GetAccountByID(uint(targetAccountID))
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return errors.New("account not found")
		}
		return errors.New("internal server error")
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

	if err := s.accountRepo.DissociateEmployeeFromBusiness(&targetAccount, businessToDeleteFrom); err != nil {
		return errors.New("failed to dissociate employee from business")
	}

	if err := s.accountRepo.DeleteAccount(&targetAccount); err != nil {
		return errors.New("failed to delete account")
	}

	return nil
}
