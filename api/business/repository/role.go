package repository

import (
	"VersatilePOS/database"
	"VersatilePOS/database/entities"
)

func (repo *Repository) GetBusinessRoles(businessID uint) ([]entities.AccountRole, error) {
	var roles []entities.AccountRole
	if err := database.DB.Where("business_id = ?", businessID).Find(&roles).Error; err != nil {
		return nil, err
	}
	return roles, nil
}
