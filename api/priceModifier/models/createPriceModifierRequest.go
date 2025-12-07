package models

type CreatePriceModifierRequest struct {
	ModifierType string  `json:"modifierType" validate:"required"`
	Name         string  `json:"name" validate:"required"`
	Value        float64 `json:"value" validate:"required"`
	IsPercentage bool    `json:"isPercentage"`
}
