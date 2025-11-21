package entities

import "gorm.io/gorm"

type Account struct {
	gorm.Model
	Name         string `json:"name"`
	Username     string `json:"username" gorm:"unique"`
	PasswordHash string `json:"-"`

	OwnedBusinesses []Business `gorm:"foreignKey:OwnerID"`

	MemberOf []Business `gorm:"many2many:business_employees;"`
}

type Business struct {
	gorm.Model
	Name    string `json:"name"`
	Address string `json:"address"`
	Phone   string `json:"phone"`
	Email   string `json:"email"`

	OwnerID uint    `json:"ownerId,omitempty"`
	Owner   Account `gorm:"foreignKey:OwnerID"`

	Employees []Account `gorm:"many2many:business_employees;"`
}

type BusinessEmployees struct {
	BusinessID uint `gorm:"primaryKey"`
	AccountID  uint `gorm:"primaryKey"`
}
