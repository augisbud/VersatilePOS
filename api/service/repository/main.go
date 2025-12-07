package repository

import (
	"VersatilePOS/database"
	"VersatilePOS/database/entities"

	"gorm.io/gorm"
)

type Repository struct{}

func (r *Repository) CreateService(service *entities.Service) error {
	return database.DB.Create(service).Error
}

func (r *Repository) GetServiceByID(id uint) (*entities.Service, error) {
	var service entities.Service
	if err := database.DB.First(&service, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &service, nil
}

func (r *Repository) GetServices() ([]entities.Service, error) {
	var services []entities.Service
	if err := database.DB.Find(&services).Error; err != nil {
		return nil, err
	}
	return services, nil
}

func (r *Repository) GetServicesByBusinessID(businessID uint) ([]entities.Service, error) {
	var services []entities.Service
	if err := database.DB.Where("business_id = ?", businessID).Find(&services).Error; err != nil {
		return nil, err
	}
	return services, nil
}

func (r *Repository) UpdateService(service *entities.Service) error {
	return database.DB.Save(service).Error
}

func (r *Repository) DeleteService(id uint) error {
	return database.DB.Delete(&entities.Service{}, id).Error
}

