package entities

import "gorm.io/gorm"

// ItemOptionLink links specific item options to an order item
type ItemOptionLink struct {
	gorm.Model

	OrderItemID uint      `json:"orderItemId"`
	OrderItem   OrderItem `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:OrderItemID"`

	ItemOptionID uint       `json:"itemOptionId"`
	ItemOption   ItemOption `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:ItemOptionID"`

	Count uint32 `json:"count" gorm:"not null;default:1"`
}
