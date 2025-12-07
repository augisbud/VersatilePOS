package entities

import (
	"time"

	"gorm.io/gorm"
)

type Service struct {
	gorm.Model

	BusinessID uint     `json:"businessId"`
	Business   Business `gorm:"foreignKey:BusinessID"`

	Name         string  `json:"name"`
	HourlyPrice  float64 `json:"hourlyPrice" gorm:"type:decimal(10,2);not null"`
	ServiceCharge float64 `json:"serviceCharge" gorm:"type:decimal(10,2);not null;default:0"`

	ProvisioningStartTime time.Time `json:"provisioningStartTime"`
	ProvisioningEndTime   time.Time `json:"provisioningEndTime"`
	ProvisioningInterval  uint      `json:"provisioningInterval"` // Duration in minutes

	Employees []Account `gorm:"many2many:account_services;"`
}

type AccountServices struct {
	AccountID uint `gorm:"primaryKey"`
	ServiceID uint `gorm:"primaryKey"`
}

