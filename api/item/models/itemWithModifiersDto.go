package models

import (
	"VersatilePOS/priceModifier/modelsas"
)

type ItemWithModifiersDto struct {
	ID              uint                            `json:"id"`
	BusinessID      uint                            `json:"businessId"`
	Name            string                          `json:"name"`
	Price           float64                         `json:"price"`
	QuantityInStock *int                            `json:"quantityInStock,omitempty"`
	PriceModifiers  []modelsas.PriceModifierDto     `json:"priceModifiers"`
	FinalPrice      float64                         `json:"finalPrice"`
}
