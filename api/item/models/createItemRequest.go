package models

type CreateItemRequest struct {
	BusinessID      uint    `json:"businessId" binding:"required"`
	Name            string  `json:"name" binding:"required"`
	Price           float64 `json:"price" binding:"required"`
	TrackInventory  bool    `json:"trackInventory"`
	QuantityInStock int     `json:"quantityInStock"`
}
