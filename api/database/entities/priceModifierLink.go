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

// PriceModifierReservationLink links a PriceModifier to a specific Reservation
// This allows applying discounts/taxes to reservations
type PriceModifierReservationLink struct {
	gorm.Model

	PriceModifierID uint          `json:"priceModifierId"`
	PriceModifier   PriceModifier `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:PriceModifierID"`

	ReservationID uint        `json:"reservationId"`
	Reservation   Reservation `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:ReservationID"`
}
