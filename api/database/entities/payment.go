package entities

import (
	"VersatilePOS/generic/constants"

	"gorm.io/gorm"
)

type Payment struct {
	gorm.Model
	Amount            float64        `json:"amount" gorm:"type:decimal(10,2);not null"`
	Type              constants.PaymentType   `json:"type" gorm:"type:varchar(50);not null"`
	Status            constants.PaymentStatus `json:"status" gorm:"type:varchar(50);not null;default:'Pending'"`
	StripePaymentIntentID *string    `json:"stripePaymentIntentId,omitempty" gorm:"type:varchar(255)"`
	StripeCustomerID      *string    `json:"stripeCustomerId,omitempty" gorm:"type:varchar(255)"`
	GiftCardCode          *string    `json:"giftCardCode,omitempty" gorm:"type:varchar(50)"`
}
