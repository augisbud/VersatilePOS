package service

import (
	accountRepository "VersatilePOS/account/repository"
	businessModels "VersatilePOS/business/models"
	"VersatilePOS/business/repository"
	"VersatilePOS/database/entities"
	"VersatilePOS/generic/constants"
	"errors"

	"github.com/lib/pq"
)

type Service struct {
	repo repository.Repository
}

func NewService() *Service {
	return &Service{
		repo: repository.Repository{},
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

	response := &businessModels.BusinessDto{
		ID:      createdBusiness.ID,
		Name:    createdBusiness.Name,
		Address: createdBusiness.Address,
		Phone:   createdBusiness.Phone,
		Email:   createdBusiness.Email,
	}

	return response, nil
}

func (s *Service) GetBusinesses(ownerID uint) ([]businessModels.BusinessDto, error) {
	businesses, err := s.repo.GetBusinessesByOwnerID(ownerID)
	if err != nil {
		return nil, err
	}

	var businessDtos []businessModels.BusinessDto
	for _, business := range businesses {
		businessDtos = append(businessDtos, businessModels.BusinessDto{
			ID:      business.ID,
			Name:    business.Name,
			Address: business.Address,
			Phone:   business.Phone,
			Email:   business.Email,
		})
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

	// Check if user is the owner
	if business.OwnerID != userID {
		// If not owner, check if user is an employee of the business
		userAccount, err := s.repo.GetAccountWithMemberships(userID)
		if err != nil {
			return nil, err
		}
		if userAccount == nil {
			return nil, errors.New("user not found")
		}

		isEmployee := false
		for _, b := range userAccount.MemberOf {
			if b.ID == business.ID {
				isEmployee = true
				break
			}
		}

		if !isEmployee {
			return nil, errors.New("user does not belong to this business")
		}
	}

	response := &businessModels.BusinessDto{
		ID:      business.ID,
		Name:    business.Name,
		Address: business.Address,
		Phone:   business.Phone,
		Email:   business.Email,
	}

	return response, nil
}
