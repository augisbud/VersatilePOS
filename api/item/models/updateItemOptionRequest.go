package models

type UpdateItemOptionRequest struct {
	Name            string `json:"name"`
	PriceModifierID uint   `json:"priceModifierId"`
	TrackInventory  *bool  `json:"trackInventory"`
	QuantityInStock *int   `json:"quantityInStock"`
}
