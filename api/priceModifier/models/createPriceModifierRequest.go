package models

type CreatePriceModifierRequest struct {
	BusinessID   uint    `json:"businessId" validate:"required"`
	ModifierType string  `json:"modifierType" validate:"required"`
	Name         string  `json:"name" validate:"required"`
	Value        float64 `json:"value" validate:"required"`
	IsPercentage bool    `json:"isPercentage"`
}
