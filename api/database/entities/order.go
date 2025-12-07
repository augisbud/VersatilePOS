package entities

import (
	"VersatilePOS/generic/constants"
	"time"

	"gorm.io/gorm"
)

// Order represents an order of items from a specific business
type Order struct {
	gorm.Model

	// Business and account references
	BusinessID         uint      `json:"businessId"`
	Business           Business  `gorm:"foreignKey:BusinessID"`
	ServicingAccountID *uint     `json:"servicingAccountId"`
	ServicingAccount   *Account  `gorm:"foreignKey:ServicingAccountID"`

	// Order details
	DatePlaced    time.Time            `json:"datePlaced" gorm:"not null"`
	Status        constants.OrderStatus `json:"status" gorm:"type:varchar(50);not null;default:'Pending'"`
	TipAmount     float64              `json:"tipAmount" gorm:"type:decimal(10,2);default:0"`
	ServiceCharge float64              `json:"serviceCharge" gorm:"type:decimal(10,2);default:0"`

	// Customer information
	Customer      string `json:"customer"`
	CustomerEmail string `json:"customerEmail"`
	CustomerPhone string `json:"customerPhone"`

	// Lifecycle fields (from LifecycledEntity)
	ValidFrom *time.Time `json:"validFrom"`
	ValidTo   *time.Time `json:"validTo"`

	// Relationships
	OrderItems        []OrderItem        `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:OrderID"`
	OrderPaymentLinks []OrderPaymentLink `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:OrderID"`
}

// OrderItem represents a specific item added to an order
type OrderItem struct {
	gorm.Model

	OrderID uint  `json:"orderId"`
	Order   Order `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:OrderID"`

	ItemID uint `json:"itemId"`
	// Item will be defined when Item entity is created
	// Item Item `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:ItemID"`

	Count uint32 `json:"count" gorm:"not null;default:1"`

	// Relationships
	ItemOptionLinks        []ItemOptionLink        `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:OrderItemID"`
	PriceModifierOrderLinks []PriceModifierOrderLink `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:OrderItemID"`
}

// OrderPaymentLink links payments to orders, enabling multiple payments per order
type OrderPaymentLink struct {
	gorm.Model

	OrderID uint  `json:"orderId"`
	Order   Order `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:OrderID"`

	PaymentID uint    `json:"paymentId"`
	Payment   Payment `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:PaymentID"`
}

// ItemOptionLink links specific item options to an order item
type ItemOptionLink struct {
	gorm.Model

	OrderItemID uint      `json:"orderItemId"`
	OrderItem   OrderItem `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:OrderItemID"`

	ItemOptionID uint `json:"itemOptionId"`
	// ItemOption will be defined when ItemOption entity is created
	// ItemOption ItemOption `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:ItemOptionID"`

	Count uint32 `json:"count" gorm:"not null;default:1"`
}
