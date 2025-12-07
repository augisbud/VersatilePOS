package models

type CreateOrderItemRequest struct {
	ItemID uint   `json:"itemId" validate:"required"`
	Count  uint32 `json:"count" validate:"required,gt=0"`
}
