package models

type ApplyPriceModifierRequest struct {
	PriceModifierID uint `json:"priceModifierId" validate:"required"`
}
