package models

type CreatePaymentRequest struct {
	Amount float64 `json:"amount" validate:"required,gt=0"`
	Type   string  `json:"type" validate:"required"`
	Status string  `json:"status"`
}
