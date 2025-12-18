package entities

import (
	"VersatilePOS/generic/constants"
	"time"

	"gorm.io/gorm"
)

type PriceModifier struct {
	gorm.Model
	ModifierType constants.ModifierType `json:"modifierType" gorm:"type:varchar(50);not null"`
	Name         string                 `json:"name" gorm:"type:varchar(255);not null"`
	Value        float64                `json:"value" gorm:"type:decimal(10,2);not null"`
	IsPercentage bool                   `json:"isPercentage" gorm:"default:false"`
	EndDate      *time.Time             `json:"endDate"`

	BusinessID uint     `json:"businessId"`
	Business   Business `gorm:"foreignKey:BusinessID"`

	// Relationships
	OrderLinks       []PriceModifierOrderLink       `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:PriceModifierID"`
	ReservationLinks []PriceModifierReservationLink `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:PriceModifierID"`
	ItemLinks        []PriceModifierItemLink        `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:PriceModifierID"`
}
