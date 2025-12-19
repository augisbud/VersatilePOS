package service

import (
	"VersatilePOS/database/entities"
	giftCardModels "VersatilePOS/giftCard/models"
	"VersatilePOS/giftCard/repository"
	"errors"
	"fmt"
)

type Service struct {
	repo repository.Repository
}

func NewService() *Service {
	return &Service{
		repo: repository.Repository{},
	}
}

func (s *Service) CreateGiftCard(req giftCardModels.CreateGiftCardRequest) (*giftCardModels.GiftCardDto, error) {
	existingCard, err := s.repo.GetGiftCardByCode(req.Code)
	if err != nil {
		return nil, err
	}
	if existingCard != nil {
		return nil, errors.New("gift card with this code already exists")
	}

	giftCard := &entities.GiftCard{
		Code:         req.Code,
		InitialValue: req.InitialValue,
		Balance:      req.InitialValue,
		IsActive:     true,
		BusinessID:   req.BusinessID,
	}

	createdCard, err := s.repo.CreateGiftCard(giftCard)
	if err != nil {
		return nil, err
	}

	dto := giftCardModels.NewGiftCardDtoFromEntity(*createdCard)
	return &dto, nil
}

func (s *Service) GetGiftCards(businessID uint) ([]giftCardModels.GiftCardDto, error) {
	giftCards, err := s.repo.GetGiftCards(businessID)
	if err != nil {
		return nil, err
	}

	var dtos []giftCardModels.GiftCardDto
	for _, gc := range giftCards {
		dtos = append(dtos, giftCardModels.NewGiftCardDtoFromEntity(gc))
	}

	return dtos, nil
}

func (s *Service) GetGiftCardByID(id uint) (*giftCardModels.GiftCardDto, error) {
	giftCard, err := s.repo.GetGiftCardByID(id)
	if err != nil {
		return nil, err
	}
	if giftCard == nil {
		return nil, errors.New("gift card not found")
	}

	dto := giftCardModels.NewGiftCardDtoFromEntity(*giftCard)
	return &dto, nil
}

func (s *Service) GetGiftCardByCode(code string) (*giftCardModels.GiftCardDto, error) {
	giftCard, err := s.repo.GetGiftCardByCode(code)
	if err != nil {
		return nil, err
	}
	if giftCard == nil {
		return nil, errors.New("gift card not found")
	}

	dto := giftCardModels.NewGiftCardDtoFromEntity(*giftCard)
	return &dto, nil
}

func (s *Service) DeactivateGiftCard(id uint) error {
	giftCard, err := s.repo.GetGiftCardByID(id)
	if err != nil {
		return err
	}
	if giftCard == nil {
		return errors.New("gift card not found")
	}

	giftCard.IsActive = false
	_, err = s.repo.UpdateGiftCard(giftCard)
	return err
}

func (s *Service) RedeemGiftCard(code string, amount float64) (*entities.GiftCard, float64, error) {
	giftCard, err := s.repo.GetGiftCardByCode(code)
	if err != nil {
		return nil, 0, err
	}
	if giftCard == nil {
		return nil, 0, errors.New("gift card not found")
	}

	if !giftCard.IsActive {
		return nil, 0, errors.New("gift card is not active")
	}

	if giftCard.Balance <= 0 {
		return nil, 0, errors.New("gift card has no balance")
	}

	amountToDeduct := amount
	remainingPayment := 0.0

	if amount > giftCard.Balance {
		amountToDeduct = giftCard.Balance
		remainingPayment = amount - giftCard.Balance
	}

	giftCard.Balance -= amountToDeduct

	if giftCard.Balance <= 0 {
		giftCard.Balance = 0
		giftCard.IsActive = false
	}

	updatedCard, err := s.repo.UpdateGiftCard(giftCard)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to update gift card: %w", err)
	}

	return updatedCard, remainingPayment, nil
}

func (s *Service) AddBalance(id uint, amount float64) (*giftCardModels.GiftCardDto, error) {
	if amount <= 0 {
		return nil, errors.New("amount must be greater than 0")
	}

	giftCard, err := s.repo.GetGiftCardByID(id)
	if err != nil {
		return nil, err
	}
	if giftCard == nil {
		return nil, errors.New("gift card not found")
	}

	giftCard.Balance += amount
	giftCard.InitialValue += amount
	giftCard.IsActive = true

	updatedCard, err := s.repo.UpdateGiftCard(giftCard)
	if err != nil {
		return nil, err
	}

	dto := giftCardModels.NewGiftCardDtoFromEntity(*updatedCard)
	return &dto, nil
}
