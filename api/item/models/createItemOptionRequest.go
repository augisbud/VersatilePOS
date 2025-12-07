package models

type CreateItemOptionRequest struct {
	ItemID          uint   `json:"itemId" binding:"required"`
	Name            string `json:"name" binding:"required"`
	PriceModifierID uint   `json:"priceModifierId" binding:"required"`
	TrackInventory  bool   `json:"trackInventory"`
	QuantityInStock int    `json:"quantityInStock"`
}
