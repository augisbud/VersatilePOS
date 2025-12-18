package models

type ApplyPriceModifierToItemRequest struct {
	PriceModifierID uint `json:"priceModifierId" validate:"required"`
}
