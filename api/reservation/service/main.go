package service

import (
	accountRepository "VersatilePOS/account/repository"
	"VersatilePOS/database/entities"
	"VersatilePOS/generic/constants"
	"VersatilePOS/generic/rbac"
	reservationModels "VersatilePOS/reservation/models"
	"VersatilePOS/reservation/repository"
	serviceRepository "VersatilePOS/service/repository"
	"errors"
	"time"

	"gorm.io/gorm"
)

type Service struct {
	repo        repository.Repository
	accountRepo accountRepository.Repository
	serviceRepo serviceRepository.Repository
}

func NewService() *Service {
	return &Service{
		repo:        repository.Repository{},
		accountRepo: accountRepository.Repository{},
		serviceRepo: serviceRepository.Repository{},
	}
}

// getBusinessIDFromAccount gets the first business ID that the account belongs to
func (s *Service) getBusinessIDFromAccount(accountID uint) (uint, error) {
	account, err := s.accountRepo.GetAccountByID(accountID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return 0, errors.New("account not found")
		}
		return 0, errors.New("failed to get account")
	}

	if len(account.MemberOf) == 0 {
		return 0, errors.New("account does not belong to any business")
	}

	// Return the first business ID
	return account.MemberOf[0].ID, nil
}

// hasReservationAccess checks if user has access to reservations for a given business
func (s *Service) hasReservationAccess(businessID uint, userID uint, level constants.AccessLevel) (bool, error) {
	ok, err := rbac.HasAccess(constants.Reservations, level, businessID, userID)
	if err != nil {
		return false, errors.New("failed to verify permissions")
	}
	return ok, nil
}

func (s *Service) validateProvisionalTime(serviceID uint, dateOfService time.Time, reservationLength uint32) error {
	service, err := s.serviceRepo.GetServiceByID(serviceID)
	if err != nil {
		return errors.New("failed to get service")
	}
	if service == nil {
		return errors.New("service not found")
	}

	if service.ProvisioningStartTime == nil || service.ProvisioningEndTime == nil {
		return nil
	}

	reservationEndTime := dateOfService.Add(time.Duration(reservationLength) * time.Minute)

	startTime := time.Date(0, 1, 1, service.ProvisioningStartTime.Hour(), service.ProvisioningStartTime.Minute(), service.ProvisioningStartTime.Second(), 0, time.UTC)
	endTime := time.Date(0, 1, 1, service.ProvisioningEndTime.Hour(), service.ProvisioningEndTime.Minute(), service.ProvisioningEndTime.Second(), 0, time.UTC)
	reservationStartTimeOfDay := time.Date(0, 1, 1, dateOfService.Hour(), dateOfService.Minute(), dateOfService.Second(), 0, time.UTC)
	reservationEndTimeOfDay := time.Date(0, 1, 1, reservationEndTime.Hour(), reservationEndTime.Minute(), reservationEndTime.Second(), 0, time.UTC)

	if reservationStartTimeOfDay.Before(startTime) || reservationEndTimeOfDay.After(endTime) {
		return errors.New("reservation time is outside service's provisional time window")
	}

	return nil
}

func (s *Service) validateNoOverlap(businessID uint, dateOfService time.Time, reservationLength uint32) error {
	reservationEndTime := dateOfService.Add(time.Duration(reservationLength) * time.Minute)

	overlapping, err := s.repo.GetOverlappingReservations(businessID, dateOfService, reservationEndTime)
	if err != nil {
		return errors.New("failed to check for overlapping reservations")
	}

	if len(overlapping) > 0 {
		return errors.New("reservation overlaps with existing reservation for this business")
	}

	return nil
}

func (s *Service) CreateReservation(req reservationModels.CreateReservationRequest, userID uint) (*reservationModels.ReservationDto, error) {
	// Get business ID from the account (employee)
	businessID, err := s.getBusinessIDFromAccount(req.AccountID)
	if err != nil {
		return nil, err
	}

	// Check if user has write access to reservations for this business
	hasAccess, err := s.hasReservationAccess(businessID, userID, constants.Write)
	if err != nil {
		return nil, err
	}
	if !hasAccess {
		return nil, errors.New("unauthorized")
	}

	if err := s.validateProvisionalTime(req.ServiceID, req.DateOfService, req.ReservationLength); err != nil {
		return nil, err
	}

	if err := s.validateNoOverlap(businessID, req.DateOfService, req.ReservationLength); err != nil {
		return nil, err
	}

	reservation := &entities.Reservation{
		AccountID:         req.AccountID,
		ServiceID:         req.ServiceID,
		DatePlaced:        req.DatePlaced,
		DateOfService:     req.DateOfService,
		ReservationLength: req.ReservationLength,
		TipAmount:         req.TipAmount,
		Customer:          req.Customer,
		CustomerEmail:     req.CustomerEmail,
		CustomerPhone:     req.CustomerPhone,
	}

	if req.Status != "" {
		reservation.Status = req.Status
	} else {
		reservation.Status = constants.ReservationConfirmed
	}

	if req.DatePlaced.IsZero() {
		reservation.DatePlaced = time.Now()
	}

	if err := s.repo.CreateReservation(reservation); err != nil {
		return nil, errors.New("failed to create reservation")
	}

	// Reload to get the full entity with relations
	createdReservation, err := s.repo.GetReservationByID(reservation.ID)
	if err != nil {
		return nil, errors.New("failed to retrieve created reservation")
	}
	if createdReservation == nil {
		return nil, errors.New("reservation not found after creation")
	}

	dto := reservationModels.NewReservationDtoFromEntity(*createdReservation)
	return &dto, nil
}

func (s *Service) GetReservations(userID uint) ([]reservationModels.ReservationDto, error) {
	reservations, err := s.repo.GetReservations()
	if err != nil {
		return nil, errors.New("failed to get reservations")
	}

	// Filter reservations based on RBAC - only show reservations where user has Read access
	var filteredDtos []reservationModels.ReservationDto
	for _, reservation := range reservations {
		if len(reservation.Account.MemberOf) == 0 {
			continue
		}

		// Check access for each business the account belongs to
		hasAccess := false
		for _, business := range reservation.Account.MemberOf {
			ok, err := s.hasReservationAccess(business.ID, userID, constants.Read)
			if err == nil && ok {
				hasAccess = true
				break
			}
		}

		if hasAccess {
			filteredDtos = append(filteredDtos, reservationModels.NewReservationDtoFromEntity(reservation))
		}
	}

	return filteredDtos, nil
}

func (s *Service) GetReservationByID(id uint, userID uint) (*reservationModels.ReservationDto, error) {
	reservation, err := s.repo.GetReservationByID(id)
	if err != nil {
		return nil, errors.New("failed to get reservation")
	}
	if reservation == nil {
		return nil, errors.New("reservation not found")
	}

	// Check if user has read access to reservations for the business
	if len(reservation.Account.MemberOf) == 0 {
		return nil, errors.New("reservation account does not belong to any business")
	}

	hasAccess := false
	for _, business := range reservation.Account.MemberOf {
		ok, err := s.hasReservationAccess(business.ID, userID, constants.Read)
		if err == nil && ok {
			hasAccess = true
			break
		}
	}

	if !hasAccess {
		return nil, errors.New("unauthorized")
	}

	dto := reservationModels.NewReservationDtoFromEntity(*reservation)
	return &dto, nil
}

func (s *Service) UpdateReservation(id uint, req reservationModels.UpdateReservationRequest, userID uint) (*reservationModels.ReservationDto, error) {
	reservation, err := s.repo.GetReservationByID(id)
	if err != nil {
		return nil, errors.New("failed to get reservation")
	}
	if reservation == nil {
		return nil, errors.New("reservation not found")
	}

	// Check if user has write access to reservations for the business
	if len(reservation.Account.MemberOf) == 0 {
		return nil, errors.New("reservation account does not belong to any business")
	}

	hasAccess := false
	for _, business := range reservation.Account.MemberOf {
		ok, err := s.hasReservationAccess(business.ID, userID, constants.Write)
		if err == nil && ok {
			hasAccess = true
			break
		}
	}

	if !hasAccess {
		return nil, errors.New("unauthorized")
	}

	// If account is being updated, verify access to the new account's business
	if req.AccountID != nil && *req.AccountID != reservation.AccountID {
		newBusinessID, err := s.getBusinessIDFromAccount(*req.AccountID)
		if err != nil {
			return nil, err
		}
		ok, err := s.hasReservationAccess(newBusinessID, userID, constants.Write)
		if err != nil || !ok {
			return nil, errors.New("unauthorized to assign reservation to this account")
		}
	}

	// Update fields if provided
	if req.AccountID != nil {
		reservation.AccountID = *req.AccountID
	}
	if req.ServiceID != nil {
		reservation.ServiceID = *req.ServiceID
	}
	if req.DatePlaced != nil {
		reservation.DatePlaced = *req.DatePlaced
	}
	if req.DateOfService != nil {
		reservation.DateOfService = *req.DateOfService
	}
	if req.ReservationLength != nil {
		reservation.ReservationLength = *req.ReservationLength
	}
	if req.Status != nil {
		reservation.Status = *req.Status
	}
	if req.TipAmount != nil {
		reservation.TipAmount = *req.TipAmount
	}
	if req.Customer != nil {
		reservation.Customer = *req.Customer
	}
	if req.CustomerEmail != nil {
		reservation.CustomerEmail = *req.CustomerEmail
	}
	if req.CustomerPhone != nil {
		reservation.CustomerPhone = *req.CustomerPhone
	}

	if err := s.repo.UpdateReservation(reservation); err != nil {
		return nil, errors.New("failed to update reservation")
	}

	// Reload to get updated entity
	updatedReservation, err := s.repo.GetReservationByID(id)
	if err != nil {
		return nil, errors.New("failed to retrieve updated reservation")
	}
	if updatedReservation == nil {
		return nil, errors.New("reservation not found after update")
	}

	dto := reservationModels.NewReservationDtoFromEntity(*updatedReservation)
	return &dto, nil
}

