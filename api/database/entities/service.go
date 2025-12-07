package entities

import "gorm.io/gorm"

type Service struct {
	gorm.Model

	BusinessID uint     `json:"businessId"`
	Business   Business `gorm:"foreignKey:BusinessID"`

	Name         string  `json:"name"`
	HourlyPrice  float64 `json:"hourlyPrice" gorm:"type:decimal(10,2);not null"`
	ServiceCharge float64 `json:"serviceCharge" gorm:"type:decimal(10,2);not null;default:0"`
}

