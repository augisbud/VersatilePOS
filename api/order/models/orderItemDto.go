package models

import "VersatilePOS/database/entities"

type OrderItemDto struct {
	ID     uint   `json:"id"`
	OrderID uint  `json:"orderId"`
	ItemID uint   `json:"itemId"`
	Count  uint32 `json:"count"`
}

// NewOrderItemDtoFromEntity constructs an OrderItemDto from the DB entity.
func NewOrderItemDtoFromEntity(oi entities.OrderItem) OrderItemDto {
	return OrderItemDto{
		ID:      oi.ID,
		OrderID: oi.OrderID,
		ItemID:  oi.ItemID,
		Count:   oi.Count,
	}
}
