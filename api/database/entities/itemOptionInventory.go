package entities

import "gorm.io/gorm"

type ItemOptionInventory struct {
	gorm.Model
	ItemOptionID    uint       `json:"itemOptionId"`
	ItemOption      ItemOption `gorm:"foreignKey:ItemOptionID"`
	QuantityInStock int        `json:"quantityInStock"`
}
