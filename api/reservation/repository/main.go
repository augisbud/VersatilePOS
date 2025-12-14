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
	if err := database.DB.Preload("Account.MemberOf").First(&reservation, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &reservation, nil
}

func (r *Repository) GetReservations() ([]entities.Reservation, error) {
	var reservations []entities.Reservation
	if err := database.DB.Preload("Account.MemberOf").Find(&reservations).Error; err != nil {
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

