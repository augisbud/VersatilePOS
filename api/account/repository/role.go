package repository

import (
	"VersatilePOS/database"
	"VersatilePOS/database/entities"
)

type RoleRepository struct{}

func (r *RoleRepository) CreateRole(role *entities.AccountRole) error {
	return database.DB.Create(role).Error
}

func (r *RoleRepository) GetRoleByID(id uint) (*entities.AccountRole, error) {
	var role entities.AccountRole
	if err := database.DB.First(&role, id).Error; err != nil {
		return nil, err
	}
	return &role, nil
}

func (r *RoleRepository) UpdateRole(role *entities.AccountRole) error {
	return database.DB.Save(role).Error
}

func (r *RoleRepository) DeleteRole(role *entities.AccountRole) error {
	return database.DB.Delete(role).Error
}

func (r *RoleRepository) CreateAccountRoleLink(link *entities.AccountRoleLink) error {
	return database.DB.Create(link).Error
}

func (r *RoleRepository) GetAccountRoleLink(accountID, roleID uint) (*entities.AccountRoleLink, error) {
	var link entities.AccountRoleLink
	if err := database.DB.Preload("AccountRole").Where("account_id = ? AND account_role_id = ?", accountID, roleID).First(&link).Error; err != nil {
		return nil, err
	}
	return &link, nil
}

func (r *RoleRepository) UpdateAccountRoleLink(link *entities.AccountRoleLink) error {
	return database.DB.Save(link).Error
}
