package models

import (
	"VersatilePOS/generic/constants"
	"time"
)

type UpdateReservationRequest struct {
	AccountID         *uint                      `json:"accountId"`
	ServiceID         *uint64                    `json:"serviceId"`
	DatePlaced        *time.Time                 `json:"datePlaced"`
	DateOfService     *time.Time                 `json:"dateOfService"`
	ReservationLength *uint32                    `json:"reservationLength"`
	Status            *constants.ReservationStatus `json:"status"`
	TipAmount         *float64                   `json:"tipAmount"`
	Customer          *string                    `json:"customer"`
	CustomerEmail     *string                    `json:"customerEmail"`
	CustomerPhone     *string                    `json:"customerPhone"`
}

