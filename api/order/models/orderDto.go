package models

import (
	"VersatilePOS/database/entities"
	"VersatilePOS/priceModifier/models"
	"time"
)

type OrderDto struct {
	ID                 uint                                `json:"id"`
	BusinessID         uint                                `json:"businessId"`
	ServicingAccountID *uint                               `json:"servicingAccountId,omitempty"`
	DatePlaced         time.Time                           `json:"datePlaced"`
	Status             string                              `json:"status"`
	TipAmount          float64                             `json:"tipAmount"`
	ServiceCharge      float64                             `json:"serviceCharge"`
	Customer           string                              `json:"customer"`
	CustomerEmail      string                              `json:"customerEmail"`
	CustomerPhone      string                              `json:"customerPhone"`
	ValidFrom          *time.Time                          `json:"validFrom,omitempty"`
	ValidTo            *time.Time                          `json:"validTo,omitempty"`
	PriceModifiers     []models.PriceModifierDto `json:"priceModifiers"`
}


// NewOrderDtoFromEntity constructs an OrderDto from the DB entity.
func NewOrderDtoFromEntity(o entities.Order) OrderDto {
	var priceModifiers []models.PriceModifierDto
	for _, link := range o.PriceModifierOrderLinks {
		priceModifiers = append(priceModifiers, models.NewPriceModifierDtoFromEntity(link.PriceModifier))
	}

	return OrderDto{
		ID:                 o.ID,
		BusinessID:         o.BusinessID,
		ServicingAccountID: o.ServicingAccountID,
		DatePlaced:         o.DatePlaced,
		Status:             string(o.Status),
		TipAmount:          o.TipAmount,
		ServiceCharge:      o.ServiceCharge,
		Customer:           o.Customer,
		CustomerEmail:      o.CustomerEmail,
		CustomerPhone:      o.CustomerPhone,
		ValidFrom:          o.ValidFrom,
		ValidTo:            o.ValidTo,
		PriceModifiers:     priceModifiers,
	}
}
