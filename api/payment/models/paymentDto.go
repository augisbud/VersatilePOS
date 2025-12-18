package models

import "VersatilePOS/database/entities"

type PaymentDto struct {
	ID                    uint    `json:"id"`
	Amount                float64 `json:"amount"`
	Type                  string  `json:"type"`
	Status                string  `json:"status"`
	StripePaymentIntentID *string `json:"stripePaymentIntentId,omitempty"`
	StripeCustomerID      *string `json:"stripeCustomerId,omitempty"`
	GiftCardCode          *string `json:"giftCardCode,omitempty"`
}

// NewPaymentDtoFromEntity constructs a PaymentDto from the DB entity.
func NewPaymentDtoFromEntity(p entities.Payment) PaymentDto {
	return PaymentDto{
		ID:                    p.ID,
		Amount:                p.Amount,
		Type:                  string(p.Type),
		Status:                string(p.Status),
		StripePaymentIntentID: p.StripePaymentIntentID,
		StripeCustomerID:      p.StripeCustomerID,
		GiftCardCode:          p.GiftCardCode,
	}
}
