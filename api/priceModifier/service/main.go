package service

import (
	priceModifierModels "VersatilePOS/priceModifier/models"
	"VersatilePOS/priceModifier/repository"
	"VersatilePOS/database/entities"
	"VersatilePOS/generic/constants"
	"errors"
)

type Service struct {
	repo repository.Repository
}

func NewService() *Service {
	return &Service{
		repo: repository.Repository{},
	}
}

func (s *Service) CreatePriceModifier(req priceModifierModels.CreatePriceModifierRequest) (*priceModifierModels.PriceModifierDto, error) {
	modifierType := constants.ModifierType(req.ModifierType)
	// Validate modifier type
	if modifierType != constants.Discount && modifierType != constants.Surcharge &&
		modifierType != constants.Tax && modifierType != constants.Tip {
		return nil, errors.New("invalid modifier type")
	}

	priceModifier := &entities.PriceModifier{
		ModifierType: modifierType,
		Name:         req.Name,
		Value:        req.Value,
		IsPercentage: req.IsPercentage,
	}

	createdPriceModifier, err := s.repo.CreatePriceModifier(priceModifier)
	if err != nil {
		return nil, err
	}

	dto := priceModifierModels.NewPriceModifierDtoFromEntity(*createdPriceModifier)
	return &dto, nil
}

func (s *Service) GetPriceModifiers() ([]priceModifierModels.PriceModifierDto, error) {
	priceModifiers, err := s.repo.GetPriceModifiers()
	if err != nil {
		return nil, err
	}

	var priceModifierDtos []priceModifierModels.PriceModifierDto
	for _, priceModifier := range priceModifiers {
		priceModifierDtos = append(priceModifierDtos, priceModifierModels.NewPriceModifierDtoFromEntity(priceModifier))
	}

	return priceModifierDtos, nil
}

func (s *Service) GetPriceModifierByID(id uint) (*priceModifierModels.PriceModifierDto, error) {
	priceModifier, err := s.repo.GetPriceModifierByID(id)
	if err != nil {
		return nil, err
	}
	if priceModifier == nil {
		return nil, errors.New("price modifier not found")
	}

	dto := priceModifierModels.NewPriceModifierDtoFromEntity(*priceModifier)
	return &dto, nil
}

func (s *Service) UpdatePriceModifier(id uint, req priceModifierModels.UpdatePriceModifierRequest) (*priceModifierModels.PriceModifierDto, error) {
	priceModifier, err := s.repo.GetPriceModifierByID(id)
	if err != nil {
		return nil, err
	}
	if priceModifier == nil {
		return nil, errors.New("price modifier not found")
	}

	// Update fields if provided
	if req.ModifierType != "" {
		modifierType := constants.ModifierType(req.ModifierType)
		// Validate modifier type
		if modifierType != constants.Discount && modifierType != constants.Surcharge &&
			modifierType != constants.Tax && modifierType != constants.Tip {
			return nil, errors.New("invalid modifier type")
		}
		priceModifier.ModifierType = modifierType
	}
	if req.Name != "" {
		priceModifier.Name = req.Name
	}
	if req.Value != nil {
		priceModifier.Value = *req.Value
	}
	if req.IsPercentage != nil {
		priceModifier.IsPercentage = *req.IsPercentage
	}

	err = s.repo.UpdatePriceModifier(priceModifier)
	if err != nil {
		return nil, err
	}

	dto := priceModifierModels.NewPriceModifierDtoFromEntity(*priceModifier)
	return &dto, nil
}

func (s *Service) DeletePriceModifier(id uint) error {
	priceModifier, err := s.repo.GetPriceModifierByID(id)
	if err != nil {
		return err
	}
	if priceModifier == nil {
		return errors.New("price modifier not found")
	}

	return s.repo.DeletePriceModifier(id)
}
