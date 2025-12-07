package models

import (
	"VersatilePOS/generic/constants"
	"time"
)

type CreateReservationRequest struct {
	AccountID         uint                      `json:"accountId" validate:"required"`
	ServiceID         uint64                    `json:"serviceId" validate:"required"`
	DatePlaced        time.Time                 `json:"datePlaced" validate:"required"`
	DateOfService     time.Time                 `json:"dateOfService" validate:"required"`
	ReservationLength uint32                    `json:"reservationLength" validate:"required"`
	Status            constants.ReservationStatus `json:"status"`
	TipAmount         float64                   `json:"tipAmount"`
	Customer          string                    `json:"customer" validate:"required"`
	CustomerEmail     string                    `json:"customerEmail"`
	CustomerPhone     string                    `json:"customerPhone"`
}

