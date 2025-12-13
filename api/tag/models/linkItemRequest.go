package models

type LinkItemRequest struct {
	ItemID uint `json:"itemId" binding:"required"`
}
