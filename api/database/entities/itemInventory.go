package entities

import "gorm.io/gorm"

type ItemInventory struct {
	gorm.Model
	ItemID          uint `json:"itemId"`
	Item            Item `gorm:"foreignKey:ItemID"`
	QuantityInStock int  `json:"quantityInStock"`
}
