package entities

import (
	"VersatilePOS/generic/constants"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

type Function struct {
	gorm.Model

	Name        string           `json:"name"`
	Action      constants.Action `json:"action"`
	Description string           `json:"description"`
}

type AccountRoleFunctionLink struct {
	gorm.Model

	AccessLevels pq.StringArray `gorm:"type:text[]" json:"accessLevels"`

	AccountRoleID uint        `json:"accountRoleId"`
	AccountRole   AccountRole `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:AccountRoleID"`

	FunctionID uint     `json:"functionId"`
	Function   Function `gorm:"foreignKey:FunctionID"`
}
