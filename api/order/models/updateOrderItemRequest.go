package models

type UpdateOrderItemRequest struct {
	Count *uint32 `json:"count,omitempty" validate:"omitempty,gt=0"`
}
