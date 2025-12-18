package entities

import (
	"gorm.io/gorm"
)

type GiftCard struct {
	gorm.Model
	Code         string  `json:"code" gorm:"type:varchar(50);uniqueIndex;not null"`
	InitialValue float64 `json:"initialValue" gorm:"type:decimal(10,2);not null"`
	Balance      float64 `json:"balance" gorm:"type:decimal(10,2);not null"`
	IsActive     bool    `json:"isActive" gorm:"default:true"`
}
