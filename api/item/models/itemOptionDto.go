package models

type ItemOptionDto struct {
	ID              uint   `json:"id"`
	ItemID          uint   `json:"itemId"`
	Name            string `json:"name"`
	PriceModifierID uint   `json:"priceModifierId"`
	QuantityInStock *int   `json:"quantityInStock,omitempty"`
}
