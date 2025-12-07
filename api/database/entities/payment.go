package entities

import (
	"VersatilePOS/generic/constants"

	"gorm.io/gorm"
)

type Payment struct {
	gorm.Model
	Amount float64        `json:"amount" gorm:"type:decimal(10,2);not null"`
	Type   constants.PaymentType   `json:"type" gorm:"type:varchar(50);not null"`
	Status constants.PaymentStatus `json:"status" gorm:"type:varchar(50);not null;default:'Pending'"`
}
