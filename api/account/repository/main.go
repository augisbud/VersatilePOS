package repository

import (
	"VersatilePOS/database"
	"VersatilePOS/database/entities"
)

type Repository struct{}

func (r *Repository) CreateAccount(account *entities.Account) error {
	return database.DB.Create(account).Error
}

func (r *Repository) AddEmployeeToBusiness(account *entities.Account, business *entities.Business) error {
	return database.DB.Model(account).Association("MemberOf").Append(business)
}

func (r *Repository) GetAccountByUsername(username string) (entities.Account, error) {
	var account entities.Account
	if err := database.DB.Where("username = ?", username).First(&account).Error; err != nil {
		return account, err
	}
	return account, nil
}

func (r *Repository) GetAccountByID(id uint) (entities.Account, error) {
	var account entities.Account
	if err := database.DB.Preload("OwnedBusinesses").Preload("MemberOf").Preload("AccountRoleLinks.AccountRole").First(&account, id).Error; err != nil {
		return account, err
	}
	return account, nil
}

func (r *Repository) GetBusinessEmployees(business *entities.Business) ([]entities.Account, error) {
	var employees []entities.Account
	err := database.DB.Model(business).Preload("AccountRoleLinks.AccountRole").Association("Employees").Find(&employees, "username != ?", "admin")
	return employees, err
}

func (r *Repository) GetBusinessOwner(business *entities.Business) (entities.Account, error) {
	var owner entities.Account
	err := database.DB.First(&owner, business.OwnerID).Error
	return owner, err
}

func (r *Repository) DissociateEmployeeFromBusiness(account *entities.Account, business *entities.Business) error {
	return database.DB.Model(account).Association("MemberOf").Delete(business)
}

func (r *Repository) DeleteAccount(account *entities.Account) error {
	return database.DB.Delete(account).Error
}
