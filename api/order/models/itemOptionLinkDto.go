package models

import "VersatilePOS/database/entities"

type ItemOptionLinkDto struct {
	ID           uint   `json:"id"`
	OrderItemID  uint   `json:"orderItemId"`
	ItemOptionID uint   `json:"itemOptionId"`
	Count        uint32 `json:"count"`
}

// NewItemOptionLinkDtoFromEntity constructs an ItemOptionLinkDto from the DB entity.
func NewItemOptionLinkDtoFromEntity(iol entities.ItemOptionLink) ItemOptionLinkDto {
	return ItemOptionLinkDto{
		ID:           iol.ID,
		OrderItemID:  iol.OrderItemID,
		ItemOptionID: iol.ItemOptionID,
		Count:        iol.Count,
	}
}
