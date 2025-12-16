package models

import (
	"VersatilePOS/database/entities"
	"time"
)

type PriceModifierDto struct {
	ID           uint       `json:"id"`
	BusinessID   uint       `json:"businessId"`
	ModifierType string     `json:"modifierType"`
	Name         string     `json:"name"`
	Value        float64    `json:"value"`
	IsPercentage bool       `json:"isPercentage"`
	ValidFrom    time.Time  `json:"validFrom"`
	ValidTo      *time.Time `json:"validTo"`
}

// NewPriceModifierDtoFromEntity constructs a PriceModifierDto from the DB entity.
func NewPriceModifierDtoFromEntity(pm entities.PriceModifier) PriceModifierDto {
	var validTo *time.Time
	if pm.DeletedAt.Valid {
		validTo = &pm.DeletedAt.Time
	}

	return PriceModifierDto{
		ID:           pm.ID,
		BusinessID:   pm.BusinessID,
		ModifierType: string(pm.ModifierType),
		Name:         pm.Name,
		Value:        pm.Value,
		IsPercentage: pm.IsPercentage,
		ValidFrom:    pm.CreatedAt,
		ValidTo:      validTo,
	}
}
