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

	AccountRoleID uint        `json:"accountRoleId,omitempty"`
	AccountRole   AccountRole `gorm:"foreignKey:AccountRoleID"`

	FunctionID uint     `json:"functionId,omitempty"`
	Function   Function `gorm:"foreignKey:FunctionID"`
}
