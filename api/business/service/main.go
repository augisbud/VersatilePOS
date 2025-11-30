package service

import (
	accountRepository "VersatilePOS/account/repository"
	businessModels "VersatilePOS/business/models"
	"VersatilePOS/business/repository"
	"VersatilePOS/database/entities"
	"VersatilePOS/generic/constants"
	"VersatilePOS/generic/rbac"
	"errors"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

type Service struct {
	repo        repository.Repository
	accountRepo accountRepository.Repository
}

func NewService() *Service {
	return &Service{
		repo:        repository.Repository{},
		accountRepo: accountRepository.Repository{},
	}
}

func (s *Service) CreateBusiness(req businessModels.CreateBusinessRequest, ownerID uint) (*businessModels.BusinessDto, error) {
	business := &entities.Business{
		Name:    req.Name,
		OwnerID: ownerID,
		Address: req.Address,
		Phone:   req.Phone,
		Email:   req.Email,
	}

	createdBusiness, err := s.repo.CreateBusiness(business)
	if err != nil {
		return nil, err
	}

	// Create a default "Business Owner" role for the newly created business
	roleRepo := &accountRepository.RoleRepository{}
	functionRepo := &accountRepository.FunctionRepository{}

	ownerRole := &entities.AccountRole{
		Name:       "Business Owner",
		BusinessID: createdBusiness.ID,
	}

	if err := roleRepo.CreateRole(ownerRole); err != nil {
		return nil, err
	}

	// Assign the owner account to the owner role
	roleLink := &entities.AccountRoleLink{
		AccountID:     ownerID,
		AccountRoleID: ownerRole.ID,
	}

	if err := roleRepo.CreateAccountRoleLink(roleLink); err != nil {
		return nil, err
	}

	functionsToAssign := map[constants.Action]bool{
		constants.Accounts:   true,
		constants.Businesses: true,
		constants.Roles:      true,
	}

	allFuncs, err := functionRepo.GetAllFunctions()
	if err != nil {
		return nil, err
	}

	for _, fn := range allFuncs {
		if functionsToAssign[fn.Action] {
			als := pq.StringArray{string(constants.Write), string(constants.Read)}
			link := &entities.AccountRoleFunctionLink{
				AccountRoleID: ownerRole.ID,
				FunctionID:    fn.ID,
				AccessLevels:  als,
			}
			if err := functionRepo.AssignFunctionToRole(link); err != nil {
				return nil, err
			}
		}
	}

	dto := businessModels.NewBusinessDtoFromEntity(*createdBusiness)
	return &dto, nil
}

func (s *Service) GetBusinesses(userID uint) ([]businessModels.BusinessDto, error) {
	var businessDtos []businessModels.BusinessDto

	account, err := s.accountRepo.GetAccountByID(userID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return businessDtos, errors.New("account not found")
		}
		return businessDtos, errors.New("internal server error")
	}

	for _, accountRoleLink := range account.AccountRoleLinks {
		business, err := s.repo.GetBusinessByID(accountRoleLink.AccountRole.BusinessID)
		if err != nil {
			return businessDtos, err
		}
		if business != nil {
			businessDtos = append(businessDtos, businessModels.NewBusinessDtoFromEntity(*business))
		}
	}

	return businessDtos, nil
}

func (s *Service) GetBusiness(id uint, userID uint) (*businessModels.BusinessDto, error) {
	business, err := s.repo.GetBusinessByID(id)
	if err != nil {
		return nil, err
	}
	if business == nil {
		return nil, errors.New("business not found")
	}

	ok, err := rbac.HasAccess(constants.Businesses, constants.Read, id, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("user does not belong to this business")
	}

	dto := businessModels.NewBusinessDtoFromEntity(*business)
	return &dto, nil
}
