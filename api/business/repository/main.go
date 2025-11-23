package repository

import (
	"VersatilePOS/database"
	"VersatilePOS/database/entities"

	"gorm.io/gorm"
)

type Repository struct{}

func (r *Repository) CreateBusiness(business *entities.Business) (*entities.Business, error) {
	if result := database.DB.Create(business); result.Error != nil {
		return nil, result.Error
	}

	var createdBusiness entities.Business
	if result := database.DB.Preload("Owner").First(&createdBusiness, business.ID); result.Error != nil {
		return nil, result.Error
	}
	return &createdBusiness, nil
}

func (r *Repository) GetBusinessesByOwnerID(ownerID uint) ([]entities.Business, error) {
	var businesses []entities.Business
	if result := database.DB.Where("owner_id = ?", ownerID).Find(&businesses); result.Error != nil {
		return nil, result.Error
	}
	return businesses, nil
}

func (r *Repository) GetBusinessByID(id uint) (*entities.Business, error) {
	var business entities.Business
	if result := database.DB.Preload("Owner").First(&business, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, result.Error
	}
	return &business, nil
}

func (r *Repository) GetAccountWithMemberships(userID uint) (*entities.Account, error) {
	var userAccount entities.Account
	if err := database.DB.Preload("MemberOf").First(&userAccount, userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &userAccount, nil
}
