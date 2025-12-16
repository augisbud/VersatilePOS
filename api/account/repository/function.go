package repository

import (
	"VersatilePOS/database"
	"VersatilePOS/database/entities"
)

type FunctionRepository struct{}

func (r *FunctionRepository) GetAllFunctions() ([]entities.Function, error) {
	var functions []entities.Function
	if err := database.DB.Find(&functions).Error; err != nil {
		return nil, err
	}
	return functions, nil
}

func (r *FunctionRepository) GetFunctionByID(id uint) (*entities.Function, error) {
	var function entities.Function
	if err := database.DB.First(&function, id).Error; err != nil {
		return nil, err
	}
	return &function, nil
}

func (r *FunctionRepository) AssignFunctionToRole(link *entities.AccountRoleFunctionLink) error {
	return database.DB.Create(link).Error
}

func (r *FunctionRepository) GetFunctionsByRoleID(roleID uint) ([]entities.AccountRoleFunctionLink, error) {
	var links []entities.AccountRoleFunctionLink
	if err := database.DB.Preload("Function").Where("account_role_id = ?", roleID).Find(&links).Error; err != nil {
		return nil, err
	}
	return links, nil
}
