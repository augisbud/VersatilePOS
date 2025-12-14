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
	if err := database.DB.Preload("Account.MemberOf").Preload("ReservationPaymentLinks.Payment").First(&reservation, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &reservation, nil
}

func (r *Repository) GetReservations() ([]entities.Reservation, error) {
	var reservations []entities.Reservation
	if err := database.DB.Preload("Account.MemberOf").Preload("ReservationPaymentLinks.Payment").Find(&reservations).Error; err != nil {
		return nil, err
	}
	return reservations, nil
}

func (r *Repository) UpdateReservation(reservation *entities.Reservation) error {
	return database.DB.Save(reservation).Error
}

func (r *Repository) CreateReservationPaymentLink(link *entities.ReservationPaymentLink) (*entities.ReservationPaymentLink, error) {
	if result := database.DB.Create(link); result.Error != nil {
		return nil, result.Error
	}
	return link, nil
}

