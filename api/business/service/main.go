package service

import (
	accountRepository "VersatilePOS/account/repository"
	accountService "VersatilePOS/account/service"
	businessModels "VersatilePOS/business/models"
	"VersatilePOS/business/repository"
	"VersatilePOS/database/entities"
	"VersatilePOS/generic/constants"
	"VersatilePOS/generic/rbac"
	"errors"

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

	// Create default roles and assign functions/links using account service helper
	accSvc := accountService.NewService()
	ownerFuncs := []constants.Action{constants.Accounts, constants.Businesses, constants.Roles, constants.PriceModifiers, constants.Items, constants.ItemOptions, constants.Orders, constants.Services, constants.Reservations}
	ownerAls := []constants.AccessLevel{constants.Write, constants.Read}
	_, err = accSvc.CreateRoleWithFunctions("Business Owner", createdBusiness.ID, ownerFuncs, ownerAls, &ownerID)
	if err != nil {
		return nil, err
	}

	employeeFuncs := []constants.Action{constants.Businesses}
	employeeAls := []constants.AccessLevel{constants.Read}
	_, err = accSvc.CreateRoleWithFunctions("Employee", createdBusiness.ID, employeeFuncs, employeeAls, nil)
	if err != nil {
		return nil, err
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
