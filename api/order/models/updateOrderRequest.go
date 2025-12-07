package models

type UpdateOrderRequest struct {
	Status        *string  `json:"status,omitempty"`
	TipAmount     *float64 `json:"tipAmount,omitempty"`
	ServiceCharge *float64 `json:"serviceCharge,omitempty"`
	Customer      *string  `json:"customer,omitempty"`
	CustomerEmail *string  `json:"customerEmail,omitempty"`
	CustomerPhone *string  `json:"customerPhone,omitempty"`
}
