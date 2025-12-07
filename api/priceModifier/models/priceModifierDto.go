package models

import "VersatilePOS/database/entities"

type PriceModifierDto struct {
	ID           uint    `json:"id"`
	BusinessID   uint    `json:"businessId"`
	ModifierType string  `json:"modifierType"`
	Name         string  `json:"name"`
	Value        float64 `json:"value"`
	IsPercentage bool    `json:"isPercentage"`
}

// NewPriceModifierDtoFromEntity constructs a PriceModifierDto from the DB entity.
func NewPriceModifierDtoFromEntity(pm entities.PriceModifier) PriceModifierDto {
	return PriceModifierDto{
		ID:           pm.ID,
		BusinessID:   pm.BusinessID,
		ModifierType: string(pm.ModifierType),
		Name:         pm.Name,
		Value:        pm.Value,
		IsPercentage: pm.IsPercentage,
	}
}
