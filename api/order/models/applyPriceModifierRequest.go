package models

type ApplyPriceModifierRequest struct {
	PriceModifierID uint `json:"priceModifierId" validate:"required"`
	OrderItemID     uint `json:"orderItemId" validate:"required"`
}
