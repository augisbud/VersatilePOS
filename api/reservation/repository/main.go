package repository

import (
	"VersatilePOS/database"
	"VersatilePOS/database/entities"
	"time"

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

func (r *Repository) GetOverlappingReservations(businessID uint, startTime time.Time, endTime time.Time) ([]entities.Reservation, error) {
	var reservations []entities.Reservation
	
	err := database.DB.
		Table("reservations").
		Joins("JOIN services ON reservations.service_id = services.id").
		Joins("LEFT JOIN business_employees ON reservations.account_id = business_employees.account_id").
		Where("(services.business_id = ? OR business_employees.business_id = ?)", businessID, businessID).
		Where("reservations.date_of_service < ?", endTime).
		Where("reservations.date_of_service + (reservations.reservation_length || ' minutes')::interval > ?", startTime).
		Find(&reservations).Error
	
	if err != nil {
		return nil, err
	}
	return reservations, nil
}

