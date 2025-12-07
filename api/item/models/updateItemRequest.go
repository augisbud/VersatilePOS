package models

type UpdateItemRequest struct {
	Name            string  `json:"name"`
	Price           float64 `json:"price"`
	TrackInventory  *bool   `json:"trackInventory"`
	QuantityInStock *int    `json:"quantityInStock"`
}
