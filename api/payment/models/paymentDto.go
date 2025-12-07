package models

import "VersatilePOS/database/entities"

type PaymentDto struct {
	ID     uint    `json:"id"`
	Amount float64 `json:"amount"`
	Type   string  `json:"type"`
	Status string  `json:"status"`
}

// NewPaymentDtoFromEntity constructs a PaymentDto from the DB entity.
func NewPaymentDtoFromEntity(p entities.Payment) PaymentDto {
	return PaymentDto{
		ID:     p.ID,
		Amount: p.Amount,
		Type:   string(p.Type),
		Status: string(p.Status),
	}
}
