package entities

import "gorm.io/gorm"

type Item struct {
	gorm.Model
	BusinessID uint     `json:"businessId"`
	Business   Business `gorm:"foreignKey:BusinessID"`
	Name       string   `json:"name"`
	Price      float64  `json:"price" gorm:"type:decimal(10,2)"`

	ItemOptions []ItemOption `gorm:"foreignKey:ItemID" json:"-"`
}
