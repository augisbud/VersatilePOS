package repository

import (
	accountModels "VersatilePOS/account/models"
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
	tx := database.DB.Begin()

	if err := tx.Where("account_role_id = ?", role.ID).Delete(&entities.AccountRoleFunctionLink{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Where("account_role_id = ?", role.ID).Delete(&entities.AccountRoleLink{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Delete(role).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
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

// GetRoleDtoByID builds the AccountRole DTO including its function links.
// This centralizes conversion logic so callers don't duplicate it.
func (r *RoleRepository) GetRoleDtoByID(id uint) (accountModels.AccountRoleDto, error) {
	role, err := r.GetRoleByID(id)
	if err != nil {
		return accountModels.AccountRoleDto{}, err
	}

	funcRepo := &FunctionRepository{}
	funcLinks, _ := funcRepo.GetFunctionsByRoleID(role.ID)

	// use model constructor to build canonical DTO
	dto := accountModels.NewAccountRoleDtoFromEntity(*role, funcLinks)
	return dto, nil
}
