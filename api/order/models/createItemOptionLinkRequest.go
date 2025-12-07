package models

type CreateItemOptionLinkRequest struct {
	ItemOptionID uint   `json:"itemOptionId" validate:"required"`
	Count       uint32 `json:"count" validate:"required,gt=0"`
}
