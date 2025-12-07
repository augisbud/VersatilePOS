package models

type CreateOrderRequest struct {
	BusinessID       uint    `json:"businessId" validate:"required"`
	ServicingAccountID *uint `json:"servicingAccountId,omitempty"`
	Customer         string  `json:"customer"`
	CustomerEmail    string  `json:"customerEmail"`
	CustomerPhone    string  `json:"customerPhone"`
	TipAmount        float64 `json:"tipAmount"`
	ServiceCharge    float64 `json:"serviceCharge"`
}
