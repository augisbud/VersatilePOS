package models

type LinkItemOptionRequest struct {
	ItemOptionID uint `json:"itemOptionId" binding:"required"`
}
