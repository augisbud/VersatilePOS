package entities

import "gorm.io/gorm"

// Tag represents a business-specific way to categorize Items, ItemOptions, and Services
type Tag struct {
	gorm.Model
	BusinessID uint     `json:"businessId"`
	Business   Business `gorm:"foreignKey:BusinessID"`
	Value      string   `json:"value" gorm:"not null"`

	// Relationships
	ItemTagLinks        []ItemTagLink        `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:TagID"`
	ItemOptionTagLinks  []ItemOptionTagLink  `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:TagID"`
	ServiceTagLinks     []ServiceTagLink     `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:TagID"`
}

// ItemTagLink links Items to Tags
type ItemTagLink struct {
	gorm.Model
	TagID  uint `json:"tagId"`
	Tag    Tag  `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:TagID"`
	ItemID uint `json:"itemId"`
	Item   Item `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:ItemID"`
}

// ItemOptionTagLink links ItemOptions to Tags
type ItemOptionTagLink struct {
	gorm.Model
	TagID       uint       `json:"tagId"`
	Tag         Tag        `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:TagID"`
	ItemOptionID uint      `json:"itemOptionId"`
	ItemOption  ItemOption `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:ItemOptionID"`
}

// ServiceTagLink links Services to Tags
type ServiceTagLink struct {
	gorm.Model
	TagID     uint    `json:"tagId"`
	Tag       Tag     `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:TagID"`
	ServiceID uint    `json:"serviceId"`
	Service   Service `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:ServiceID"`
}
