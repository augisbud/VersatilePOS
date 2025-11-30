package entities

import "gorm.io/gorm"

type Business struct {
	gorm.Model
	Name    string `json:"name"`
	Address string `json:"address"`
	Phone   string `json:"phone"`
	Email   string `json:"email"`

	OwnerID uint    `json:"ownerId"`
	Owner   Account `gorm:"foreignKey:OwnerID"`

	Employees    []Account `gorm:"many2many:business_employees;"`
	AccountRoles []AccountRole
}

type BusinessEmployees struct {
	BusinessID uint `gorm:"primaryKey"`
	AccountID  uint `gorm:"primaryKey"`
}
