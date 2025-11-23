package entities

import (
	"VersatilePOS/generic/constants"

	"gorm.io/gorm"
)

type Function struct {
	gorm.Model

	Name        string `json:"name"`
	Description string `json:"description"`
}

type AccountRoleFunctionLink struct {
	gorm.Model

	AccessLevel constants.AccessLevel `json:"accessLevel"`

	AccountRoleID uint        `json:"accountRoleId,omitempty"`
	AccountRole   AccountRole `gorm:"foreignKey:AccountRoleID"`

	FunctionID uint     `json:"functionId,omitempty"`
	Function   Function `gorm:"foreignKey:FunctionID"`
}
