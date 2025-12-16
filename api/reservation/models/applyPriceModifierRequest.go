package models

type ApplyPriceModifierToReservationRequest struct {
	PriceModifierID uint `json:"priceModifierId" validate:"required"`
}

