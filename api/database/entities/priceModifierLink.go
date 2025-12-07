package entities

import "gorm.io/gorm"

// PriceModifierOrderLink links a PriceModifier to a specific OrderItem
// This allows applying discounts/taxes to specific items in an order
type PriceModifierOrderLink struct {
	gorm.Model

	PriceModifierID uint          `json:"priceModifierId"`
	PriceModifier   PriceModifier `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:PriceModifierID"`

	OrderItemID uint `json:"orderItemId"`
	// OrderItem will be defined when Order entity is created
	// OrderItem OrderItem `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:OrderItemID"`
}

// PriceModifierReservationLink links a PriceModifier to a specific ReservationItem
// This allows applying discounts/taxes to specific items in a reservation
type PriceModifierReservationLink struct {
	gorm.Model

	PriceModifierID uint          `json:"priceModifierId"`
	PriceModifier   PriceModifier `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:PriceModifierID"`

	ReservationItemID uint `json:"reservationItemId"`
	// ReservationItem will be defined when Reservation entity is created
	// ReservationItem ReservationItem `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:ReservationItemID"`
}
