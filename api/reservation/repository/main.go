package repository

import (
	"VersatilePOS/database"
	"VersatilePOS/database/entities"

	"gorm.io/gorm"
)

type Repository struct{}

func (r *Repository) CreateReservation(reservation *entities.Reservation) error {
	return database.DB.Create(reservation).Error
}

func (r *Repository) GetReservationByID(id uint) (*entities.Reservation, error) {
	var reservation entities.Reservation
	if err := database.DB.Preload("Account.MemberOf").Preload("ReservationPaymentLinks.Payment").Preload("PriceModifierLinks.PriceModifier").First(&reservation, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &reservation, nil
}

func (r *Repository) GetReservations() ([]entities.Reservation, error) {
	var reservations []entities.Reservation
	if err := database.DB.Preload("Account.MemberOf").Preload("ReservationPaymentLinks.Payment").Preload("PriceModifierLinks.PriceModifier").Find(&reservations).Error; err != nil {
		return nil, err
	}
	return reservations, nil
}

func (r *Repository) UpdateReservation(reservation *entities.Reservation) error {
	return database.DB.Save(reservation).Error
}

func (r *Repository) CreatePriceModifierReservationLink(link *entities.PriceModifierReservationLink) (*entities.PriceModifierReservationLink, error) {
	if err := database.DB.Create(link).Error; err != nil {
		return nil, err
	}
	return link, nil
}

func (r *Repository) CreateReservationPaymentLink(link *entities.ReservationPaymentLink) (*entities.ReservationPaymentLink, error) {
	if result := database.DB.Create(link); result.Error != nil {
		return nil, result.Error
	}
	return link, nil
}

func (r *Repository) GetReservationsByPaymentID(paymentID uint) ([]entities.Reservation, error) {
	var paymentLinks []entities.ReservationPaymentLink
	if result := database.DB.Where("payment_id = ?", paymentID).Find(&paymentLinks); result.Error != nil {
		return nil, result.Error
	}

	if len(paymentLinks) == 0 {
		return []entities.Reservation{}, nil
	}

	reservationIDs := make([]uint, len(paymentLinks))
	for i, link := range paymentLinks {
		reservationIDs[i] = link.ReservationID
	}

	var reservations []entities.Reservation
	if result := database.DB.
		Where("id IN ?", reservationIDs).
		Preload("Account.MemberOf").
		Preload("ReservationPaymentLinks.Payment").
		Preload("PriceModifierLinks.PriceModifier").
		Find(&reservations); result.Error != nil {
		return nil, result.Error
	}

	return reservations, nil
}

