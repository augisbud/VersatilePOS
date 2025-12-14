package entities

import (
	"VersatilePOS/generic/constants"
	"time"

	"gorm.io/gorm"
)

type Reservation struct {
	gorm.Model

	AccountID uint    `json:"accountId"`
	Account   Account `gorm:"foreignKey:AccountID"`

	ServiceID uint    `json:"serviceId"`
	Service   Service `gorm:"foreignKey:ServiceID"`

	DatePlaced    time.Time `json:"datePlaced"`
	DateOfService time.Time `json:"dateOfService"`

	ReservationLength uint32                    `json:"reservationLength"`
	Status            constants.ReservationStatus `json:"status"`
	TipAmount         float64                   `json:"tipAmount"`

	Customer      string `json:"customer"`
	CustomerEmail string `json:"customerEmail"`
	CustomerPhone string `json:"customerPhone"`

	PriceModifierLinks []PriceModifierReservationLink `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:ReservationID"`
}

