package entities

import "gorm.io/gorm"

// PriceModifierOrderLink links a PriceModifier to a full Order
// This allows applying discounts/taxes to the entire order
type PriceModifierOrderLink struct {
	gorm.Model

	PriceModifierID uint          `json:"priceModifierId"`
	PriceModifier   PriceModifier `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:PriceModifierID"`

	OrderID uint  `json:"orderId"`
	Order   Order `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:OrderID"`
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
