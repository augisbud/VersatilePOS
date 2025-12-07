package models

type ItemDto struct {
	ID              uint    `json:"id"`
	BusinessID      uint    `json:"businessId"`
	Name            string  `json:"name"`
	Price           float64 `json:"price"`
	QuantityInStock *int    `json:"quantityInStock,omitempty"`
}
