package service

import (
	"VersatilePOS/database/entities"
	"VersatilePOS/generic/constants"
	"VersatilePOS/generic/rbac"
	"VersatilePOS/priceModifier/modelsas"
	"VersatilePOS/priceModifier/repository"
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

func (s *Service) CreatePriceModifier(req modelsas.CreatePriceModifierRequest, userID uint) (*modelsas.PriceModifierDto, error) {
	// Check RBAC permissions
	ok, err := rbac.HasAccess(constants.PriceModifiers, constants.Write, req.BusinessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to create price modifiers for this business")
	}

	modifierType := constants.ModifierType(req.ModifierType)
	// Validate modifier type
	if modifierType != constants.Discount && modifierType != constants.Surcharge &&
		modifierType != constants.Tax && modifierType != constants.Tip {
		return nil, errors.New("invalid modifier type")
	}

	priceModifier := &entities.PriceModifier{
		BusinessID:   req.BusinessID,
		ModifierType: modifierType,
		Name:         req.Name,
		Value:        req.Value,
		IsPercentage: req.IsPercentage,
		EndDate:      req.EndDate,
	}

	createdPriceModifier, err := s.repo.CreatePriceModifier(priceModifier)
	if err != nil {
		return nil, err
	}

	dto := modelsas.NewPriceModifierDtoFromEntity(*createdPriceModifier)
	return &dto, nil
}

func (s *Service) GetPriceModifiers(businessID uint, userID uint) ([]modelsas.PriceModifierDto, error) {
	// Check RBAC permissions
	ok, err := rbac.HasAccess(constants.PriceModifiers, constants.Read, businessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to view price modifiers for this business")
	}

	priceModifiers, err := s.repo.GetPriceModifiers(businessID)
	if err != nil {
		return nil, err
	}

	var priceModifierDtos []modelsas.PriceModifierDto
	for _, priceModifier := range priceModifiers {
		priceModifierDtos = append(priceModifierDtos, modelsas.NewPriceModifierDtoFromEntity(priceModifier))
	}

	return priceModifierDtos, nil
}

func (s *Service) GetPriceModifierByID(id uint, businessID uint, userID uint) (*modelsas.PriceModifierDto, error) {
	// Check RBAC permissions
	ok, err := rbac.HasAccess(constants.PriceModifiers, constants.Read, businessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to view price modifiers for this business")
	}

	priceModifier, err := s.repo.GetPriceModifierByID(id, businessID)
	if err != nil {
		return nil, err
	}
	if priceModifier == nil {
		return nil, errors.New("price modifier not found")
	}

	dto := modelsas.NewPriceModifierDtoFromEntity(*priceModifier)
	return &dto, nil
}

func (s *Service) UpdatePriceModifier(id uint, businessID uint, req modelsas.UpdatePriceModifierRequest, userID uint) (*modelsas.PriceModifierDto, error) {
	// Check RBAC permissions
	ok, err := rbac.HasAccess(constants.PriceModifiers, constants.Write, businessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to update price modifiers for this business")
	}

	priceModifier, err := s.repo.GetPriceModifierByID(id, businessID)
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
	if req.EndDate != nil {
		priceModifier.EndDate = req.EndDate
	}

	updatedPriceModifier, err := s.repo.UpdatePriceModifier(priceModifier)
	if err != nil {
		return nil, err
	}

	dto := modelsas.NewPriceModifierDtoFromEntity(*updatedPriceModifier)
	return &dto, nil
}

func (s *Service) DeletePriceModifier(id uint, businessID uint, userID uint) error {
	// Check RBAC permissions
	ok, err := rbac.HasAccess(constants.PriceModifiers, constants.Write, businessID, userID)
	if err != nil {
		return errors.New("failed to verify permissions")
	}
	if !ok {
		return errors.New("unauthorized to delete price modifiers for this business")
	}

	priceModifier, err := s.repo.GetPriceModifierByID(id, businessID)
	if err != nil {
		return err
	}
	if priceModifier == nil {
		return errors.New("price modifier not found")
	}

	return s.repo.DeletePriceModifier(id)
}
