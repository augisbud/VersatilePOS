package entities

import (
	"VersatilePOS/generic/constants"

	"gorm.io/gorm"
)

type AccountRole struct {
	gorm.Model
	Name string `json:"name"`

	BusinessID uint     `json:"businessId"`
	Business   Business `gorm:"foreignKey:BusinessID"`
}

type AccountRoleLink struct {
	gorm.Model
	Status constants.AccountRoleLinkStatus `gorm:"default:Active"`

	AccountRoleID uint        `json:"accountRoleId"`
	AccountRole   AccountRole `gorm:"foreignKey:AccountRoleID"`

	AccountID uint    `json:"accountId"`
	Account   Account `gorm:"foreignKey:AccountID"`
}
