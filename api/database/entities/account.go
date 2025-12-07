package entities

import "gorm.io/gorm"

type Account struct {
	gorm.Model
	Name         string `json:"name"`
	Username     string `json:"username" gorm:"unique"`
	PasswordHash string `json:"-"`

	AccountRoleLinks []AccountRoleLink `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:AccountID"`

	OwnedBusinesses []Business `gorm:"foreignKey:OwnerID"`

	MemberOf []Business `gorm:"many2many:business_employees;"`

	ProvisionableServices []Service `gorm:"many2many:account_services;"`
}
