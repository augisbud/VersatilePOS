package entities

import "gorm.io/gorm"

type ItemOptionLink struct {
	gorm.Model
	OrderItemID  uint       `json:"orderItemId"`
	ItemOptionID uint       `json:"itemOptionId"`
	ItemOption   ItemOption `gorm:"foreignKey:ItemOptionID"`
	Count        int        `json:"count"`
}
