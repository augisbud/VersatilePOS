package entities

import "gorm.io/gorm"

type ItemOption struct {
	gorm.Model
	ItemID          uint          `json:"itemId"`
	Item            Item          `gorm:"foreignKey:ItemID"`
	Name            string        `json:"name"`
	PriceModifierID uint          `json:"priceModifierId"`
	PriceModifier   PriceModifier `gorm:"foreignKey:PriceModifierID"`

	Inventory *ItemOptionInventory `gorm:"foreignKey:ItemOptionID" json:"-"`
}
