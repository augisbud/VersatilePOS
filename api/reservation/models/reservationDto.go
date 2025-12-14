package models

import (
	"VersatilePOS/database/entities"
	"VersatilePOS/generic/constants"
	"time"
)

type PaymentDto struct {
	ID     uint    `json:"id"`
	Amount float64 `json:"amount"`
	Type   string  `json:"type"`
	Status string  `json:"status"`
}

type ReservationDto struct {
	ID                uint                      `json:"id"`
	AccountID         uint                      `json:"accountId"`
	ServiceID         uint                      `json:"serviceId"`
	DatePlaced        time.Time                 `json:"datePlaced"`
	DateOfService     time.Time                 `json:"dateOfService"`
	ReservationLength uint32                    `json:"reservationLength"`
	Status            constants.ReservationStatus `json:"status"`
	TipAmount         float64                   `json:"tipAmount"`
	Customer          string                    `json:"customer"`
	CustomerEmail     string                    `json:"customerEmail"`
	CustomerPhone     string                    `json:"customerPhone"`
	Payments          []PaymentDto `json:"payments"`
	CreatedAt         time.Time                 `json:"createdAt"`
	UpdatedAt         time.Time                 `json:"updatedAt"`
}

func NewReservationDtoFromEntity(reservation entities.Reservation) ReservationDto {
	var payments []PaymentDto
	for _, link := range reservation.ReservationPaymentLinks {
		payments = append(payments, PaymentDto{
			ID:     link.Payment.ID,
			Amount: link.Payment.Amount,
			Type:   string(link.Payment.Type),
			Status: string(link.Payment.Status),
		})
	}

	return ReservationDto{
		ID:                reservation.ID,
		AccountID:         reservation.AccountID,
		ServiceID:         reservation.ServiceID,
		DatePlaced:        reservation.DatePlaced,
		DateOfService:     reservation.DateOfService,
		ReservationLength: reservation.ReservationLength,
		Status:            reservation.Status,
		TipAmount:         reservation.TipAmount,
		Customer:          reservation.Customer,
		CustomerEmail:     reservation.CustomerEmail,
		CustomerPhone:     reservation.CustomerPhone,
		Payments:          payments,
		CreatedAt:         reservation.CreatedAt,
		UpdatedAt:         reservation.UpdatedAt,
	}
}

