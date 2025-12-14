package entities

import "gorm.io/gorm"

// PriceModifierOrderLink links a PriceModifier to a specific OrderItem
// This allows applying discounts/taxes to specific items in an order
type PriceModifierOrderLink struct {
	gorm.Model

	PriceModifierID uint          `json:"priceModifierId"`
	PriceModifier   PriceModifier `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:PriceModifierID"`

	OrderItemID uint      `json:"orderItemId"`
	OrderItem   OrderItem `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:OrderItemID"`
}

// PriceModifierReservationLink links a PriceModifier to a specific Reservation
// This allows applying discounts/taxes to reservations
type PriceModifierReservationLink struct {
	gorm.Model

	PriceModifierID uint          `json:"priceModifierId"`
	PriceModifier   PriceModifier `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:PriceModifierID"`

	ReservationID uint        `json:"reservationId"`
	Reservation   Reservation `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:ReservationID"`
}
