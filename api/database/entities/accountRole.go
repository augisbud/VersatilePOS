package entities

import (
	"VersatilePOS/generic/constants"

	"gorm.io/gorm"
)

type AccountRole struct {
	gorm.Model
	Name string `json:"name"`

	BusinessID uint     `json:"businessId,omitempty"`
	Business   Business `gorm:"foreignKey:BusinessID"`
}

type AccountRoleLink struct {
	gorm.Model
	Status constants.AccountRoleLinkStatus `gorm:"default:Active"`

	AccountRoleID uint        `json:"accountRoleId,omitempty"`
	AccountRole   AccountRole `gorm:"foreignKey:AccountRoleID"`

	AccountID uint    `json:"accountId,omitempty"`
	Account   Account `gorm:"foreignKey:AccountID"`
}
